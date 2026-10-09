import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  Bot, 
  User, 
  X, 
  Minimize2, 
  Maximize2,
  RefreshCw, 
  Mic, 
  MicOff, 
  AlertCircle, 
  Calendar, 
  Check, 
  Stethoscope,
  Building2,
  Phone,
  Clock,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { Doctor, Clinic, Language } from '../../types';

interface GeminiPatientChatProps {
  lang: Language;
  doctors: Doctor[];
  clinics: Clinic[];
  isOpen: boolean;
  onClose: () => void;
  onBookDoctor: (doctor: Doctor) => void;
  onSelectClinic?: (clinic: Clinic) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  recommendedDoctors?: Doctor[];
}

export const GeminiPatientChat: React.FC<GeminiPatientChatProps> = ({
  lang,
  doctors,
  clinics,
  isOpen,
  onClose,
  onBookDoctor,
  onSelectClinic
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome-1',
        role: 'assistant',
        content: lang === 'hi'
          ? "🙏 **नमस्ते! मैं क्लिनिकारो (CliniKaro) का Google Gemini AI स्वास्थ्य सहायक हूँ।**\n\nआप मुझसे अपने लक्षण (जैसे बुखार, सिरदर्द, पेट दर्द, आंखों की समस्या) बता सकते हैं, सही विशेषज्ञ डॉक्टर की सलाह ले सकते हैं, या अस्पतालों व ओपीडी टाइमिंग के बारे में पूछ सकते हैं।\n\n*कृपया बताएं, आज आपकी क्या सहायता करूँ?*"
          : "🙏 **Hello! I am your Google Gemini AI Health Assistant for CliniKaro.**\n\nYou can describe your symptoms, find the right medical specialist, or ask about hospital facilities, OPD timings, and consultation fees.\n\n*How can I assist you with your health today?*",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Suggested prompt chips
  const suggestions = lang === 'hi' ? [
    { label: "🩺 पेट दर्द और उल्टी की समस्या", query: "मुझे 2 दिन से पेट में हल्का दर्द और उल्टी जैसी लग रही है। मुझे क्या सावधानी रखनी चाहिए और किस डॉक्टर को दिखाना चाहिए?" },
    { label: "👶 बच्चे को बुखार व खांसी", query: "मेरे 3 साल के बच्चे को हल्का बुखार और खांसी है। भारत में कौन से शिशु रोग विशेषज्ञ (Pediatrician) उपलब्ध हैं?" },
    { label: "🦴 घुटने व जोड़ों में दर्द", query: "मेरे घुटनों में चलने पर काफी दर्द होता है। क्या मुझे ऑर्थोपेडिक डॉक्टर को दिखाना चाहिए?" },
    { label: "👁️ आंख में जलन और लालिमा", query: "मेरी आंख में जलन हो रही है और लालिमा है। भारत में नेत्र रोग विशेषज्ञ कौन हैं?" },
    { label: "🏥 24x7 इमरजेंसी अस्पताल", query: "भारत में 24 घंटे आपातकालीन इमरजेंसी सेवा वाले अस्पताल कौन से हैं?" },
    { label: "💰 ओपीडी टोकन और फीस कैसे काम करता है?", query: "क्लिनिकारो (CliniKaro) पर ओपीडी टोकन बुकिंग कैसे होती है और फीस कितनी लगती है?" }
  ] : [
    { label: "🩺 Stomach pain & nausea", query: "I have stomach pain and mild nausea. What immediate precautions should I take and which doctor should I visit in India?" },
    { label: "👶 Child fever & cough", query: "My 4-year old has fever and cough. Which pediatrician is available in India?" },
    { label: "🦴 Knee & joint pain", query: "I have severe joint pain while walking. Do I need an orthopedic doctor?" },
    { label: "👁️ Eye irritation & redness", query: "My eyes are burning and red. Which eye specialist can I consult in India?" },
    { label: "🏥 24x7 Emergency hospitals", query: "Which hospitals provide 24x7 emergency and trauma care in India?" },
    { label: "💰 How does OPD booking work?", query: "How does OPD token booking work on CliniKaro and what are the fees?" }
  ];

  // Helper to extract doctor recommendations from user query / AI response
  const detectRelevantDoctors = (text: string): Doctor[] => {
    const lower = text.toLowerCase();
    const matched: Doctor[] = [];

    const specialtyKeywords: Record<string, string[]> = {
      'pediatric': ['बच्चे', 'शिशु', 'child', 'baby', 'pediatric', 'cough', 'बुखार', 'fever', 'infant'],
      'orthopedic': ['हड्डी', 'घुटने', 'जोड़', 'bone', 'knee', 'joint', 'fracture', 'ortho', 'back pain', 'कमर दर्द'],
      'eye': ['आंख', 'नेत्र', 'vision', 'eye', 'चश्मा', 'cataract', 'मोतियाबिंद', 'दृष्टि'],
      'gynecology': ['महिला', 'स्त्री रोग', 'pregnancy', 'maternity', 'pregnant', 'period', 'gynec'],
      'general': ['बुखार', 'fever', 'cold', 'sore throat', 'पेट', 'stomach', 'कमजोरी', 'physician', 'sugar', 'बीपी', 'bp'],
      'cardiology': ['हृदय', 'heart', 'छाती में दर्द', 'chest', 'cardio', 'palpitation'],
      'ent': ['कान', 'नाक', 'गला', 'ear', 'nose', 'throat', 'ent']
    };

    for (const [specKey, keywords] of Object.entries(specialtyKeywords)) {
      if (keywords.some(kw => lower.includes(kw))) {
        const found = doctors.filter(d => 
          d.specialty.toLowerCase().includes(specKey) || 
          (d.specialtyHindi && d.specialtyHindi.toLowerCase().includes(specKey))
        );
        matched.push(...found);
      }
    }

    // Direct doctor name match
    doctors.forEach(d => {
      const docFirstName = d.name.toLowerCase().replace('dr.', '').trim().split(' ')[0];
      if (docFirstName.length > 2 && lower.includes(docFirstName)) {
        if (!matched.some(m => m.id === d.id)) {
          matched.push(d);
        }
      }
    });

    return matched.slice(0, 3);
  };

  // Send message to Gemini server API
  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const conversationHistory = messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        text: m.content
      }));

      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: conversationHistory,
          lang,
          context: {
            doctors: doctors.map(d => ({
              id: d.id,
              name: d.name,
              specialty: d.specialty,
              clinicName: d.clinicName,
              fee: d.fee,
              qualification: d.qualification,
              availableToday: d.availableToday
            })),
            clinics: clinics.map(c => ({
              id: c.id,
              name: c.name,
              type: c.type,
              address: c.address,
              phone: c.phone
            }))
          }
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();
      const replyContent = data.reply || (lang === 'hi' 
        ? "माफ़ कीजिए, उत्तर प्राप्त नहीं हुआ। कृपया पुनः प्रयास करें।"
        : "Sorry, could not retrieve an answer. Please try again.");

      const matchedDocs = detectRelevantDoctors(query + " " + replyContent);

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedDoctors: matchedDocs.length > 0 ? matchedDocs : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error("Gemini chat error:", err);
      // Fallback offline clinical guidance response
      const matchedDocs = detectRelevantDoctors(query);
      const fallbackReply = lang === 'hi'
        ? `🙏 **स्वास्थ्य सलाह व क्लिनिक मार्गदर्शन:**\n\nआपके प्रश्न के आधार पर, यह सामान्य प्राथमिक सलाह है। यदि लक्षण अधिक गंभीर हैं तो कृपया तुरंत डॉक्टर से संपर्क करें।\n\n• **प्राथमिक सुझाव:** पर्याप्त पानी पिएं, आराम करें और बिना डॉक्टर की सलाह के कोई दवा न लें।\n• **डेहरी में डॉक्टर:** आप नीचे दिए गए हमारे संबंधित विशेषज्ञ डॉक्टरों की प्रोफाइल देख सकते हैं और बिना कतार ओपीडी टोकन बुक कर सकते हैं।`
        : `🙏 **Clinical Guidance & Doctor Recommendation:**\n\nBased on your query, here is preliminary informative guidance:\n\n• **General Precaution:** Stay well hydrated, rest adequately, and avoid self-medicating with antibiotics without clinical prescription.\n• **Dehri Care Providers:** Check the registered specialists below to book an OPD slot directly.`;

      setMessages(prev => [...prev, {
        id: `fallback-${Date.now()}`,
        role: 'assistant',
        content: fallbackReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendedDoctors: matchedDocs.length > 0 ? matchedDocs : undefined
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset conversation
  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: lang === 'hi'
          ? "🙏 **नया परामर्श सत्र प्रारंभ हुआ।**\n\nआप अपने किसी भी स्वास्थ्य संबंधी प्रश्न, लक्षण या भारत के डॉक्टरों के बारे में पूछ सकते हैं।"
          : "🙏 **New consultation session started.**\n\nFeel free to describe any symptom or ask about doctors and OPD schedules in India.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Web Speech recognition (Voice input)
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(lang === 'hi' ? "आपके ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है।" : "Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInput(prev => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error("Speech recognition error:", e);
      setIsListening(false);
    }
  };

  // Simple clean markdown parser for rendering formatted text with bullet points and bolding
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.trim();
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          // Bullet points
          if (trimmed.startsWith('• ') || trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            const cleanText = trimmed.substring(2);
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 text-gray-800">
                <span className="text-teal-600 font-bold mt-0.5">•</span>
                <span>{renderInlineStyles(cleanText)}</span>
              </div>
            );
          }

          // Numbered list (e.g., "1. ")
          const matchNum = trimmed.match(/^(\d+)\.\s+(.*)/);
          if (matchNum) {
            return (
              <div key={idx} className="flex items-start gap-1.5 pl-1 text-gray-800">
                <span className="text-teal-700 font-bold font-mono-num shrink-0">{matchNum[1]}.</span>
                <span>{renderInlineStyles(matchNum[2])}</span>
              </div>
            );
          }

          // Heading / Emphasis
          if (trimmed.startsWith('### ') || trimmed.startsWith('## ')) {
            const hText = trimmed.replace(/^#+\s*/, '');
            return (
              <h5 key={idx} className="font-fraunces font-bold text-teal-950 pt-1 text-xs sm:text-sm">
                {renderInlineStyles(hText)}
              </h5>
            );
          }

          return (
            <p key={idx} className="text-gray-800">
              {renderInlineStyles(trimmed)}
            </p>
          );
        })}
      </div>
    );
  };

  // Render bold and italic inline
  const renderInlineStyles = (text: string) => {
    // Replace **bold** with <strong>
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={i} className="text-teal-900 not-italic font-semibold">{part.slice(1, -1)}</em>;
      }
      return part;
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 pointer-events-none flex items-end sm:items-center justify-end p-2 sm:p-6">
      {/* Backdrop for mobile */}
      <div 
        onClick={onClose} 
        className="fixed inset-0 bg-black/40 backdrop-blur-xs pointer-events-auto sm:hidden"
      />

      {/* Main Chat Window */}
      <div 
        className={`pointer-events-auto bg-white rounded-3xl shadow-2xl border border-teal-100 flex flex-col overflow-hidden transition-all duration-200 z-10 w-full ${
          isExpanded 
            ? 'sm:w-[680px] h-[92vh]' 
            : 'sm:w-[440px] h-[85vh] sm:h-[620px]'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0F5257] via-[#0D4448] to-[#0A3A3D] text-white p-3.5 sm:p-4 flex items-center justify-between border-b border-teal-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-teal-950 font-bold shadow-md">
                <Sparkles className="w-5 h-5 text-teal-950 fill-current" />
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[#0F5257]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="font-fraunces font-bold text-sm sm:text-base leading-tight">
                  {lang === 'hi' ? 'Google Gemini AI स्वास्थ्य सहायक' : 'Google Gemini AI Health Assistant'}
                </h4>
              </div>
              <p className="text-[10px] text-teal-200/90 flex items-center gap-1">
                <span>Gemini 3.8 Flash</span>
                <span>•</span>
                <span>Dehri-on-Sone Health Guide</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleResetChat}
              title={lang === 'hi' ? 'नई चैट शुरू करें' : 'Reset Chat'}
              className="p-1.5 text-teal-200 hover:text-white hover:bg-teal-800/60 rounded-xl transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden sm:inline-flex p-1.5 text-teal-200 hover:text-white hover:bg-teal-800/60 rounded-xl transition-colors cursor-pointer"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-teal-200 hover:text-white hover:bg-teal-800/60 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Safety Disclaimer Banner */}
        <div className="bg-amber-50/90 border-b border-amber-200/70 px-3.5 py-1.5 text-[11px] text-amber-900 flex items-center gap-2 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
          <span className="truncate">
            {lang === 'hi' 
              ? 'यह AI सहायक सामान्य मार्गदर्शन के लिए है। आपातकाल में 108 या नजदीकी अस्पताल जाएं।'
              : 'Informational health guidance only. For emergency, call 108 or visit hospital emergency.'}
          </span>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-xl bg-[#0F5257] text-amber-300 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`max-w-[86%] sm:max-w-[80%] space-y-2.5`}>
                <div
                  className={`p-3.5 rounded-2xl shadow-xs text-left ${
                    msg.role === 'user'
                      ? 'bg-[#0F5257] text-white rounded-tr-xs'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-tl-xs'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="text-xs sm:text-sm font-medium leading-relaxed">{msg.content}</p>
                  ) : (
                    renderFormattedContent(msg.content)
                  )}

                  <span
                    className={`block text-[9px] mt-1.5 font-mono-num text-right ${
                      msg.role === 'user' ? 'text-teal-200/80' : 'text-gray-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {/* Doctor Recommendation Cards inside Chat */}
                {msg.recommendedDoctors && msg.recommendedDoctors.length > 0 && (
                  <div className="bg-teal-50/80 border border-teal-200/80 rounded-2xl p-2.5 space-y-2 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-[11px] font-bold text-teal-900 px-1">
                      <span className="flex items-center gap-1">
                        <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
                        {lang === 'hi' ? 'सुझाए गए विशेषज्ञ डॉक्टर (India)' : 'Recommended Specialists in India'}
                      </span>
                      <span className="text-[10px] text-teal-700 font-normal">
                        {msg.recommendedDoctors.length} {lang === 'hi' ? 'उपलब्ध' : 'available'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      {msg.recommendedDoctors.map(doc => (
                        <div 
                          key={doc.id}
                          className="bg-white p-2 rounded-xl border border-teal-100 flex items-center justify-between gap-2 hover:border-teal-300 transition-colors shadow-2xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <img 
                              src={doc.photoUrl} 
                              alt={doc.name} 
                              className="w-9 h-9 rounded-lg object-cover border border-teal-100 shrink-0" 
                            />
                            <div className="min-w-0">
                              <h6 className="font-bold text-xs text-gray-900 truncate">{doc.name}</h6>
                              <p className="text-[10px] text-teal-800 truncate">{doc.specialty} • ₹{doc.fee}</p>
                              <div className="flex items-center gap-1.5 text-[9px] text-gray-500 truncate mt-0.5">
                                <span className="truncate">🏥 {doc.clinicName}</span>
                                {(doc.address || doc.city) && (
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${doc.clinicName} ${doc.address || ''} ${doc.city || ''}`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-amber-700 hover:text-amber-900 font-bold underline shrink-0 inline-flex items-center gap-0.5"
                                    title="Google Map"
                                  >
                                    <span>📍 Map</span>
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => {
                              onBookDoctor(doc);
                              onClose();
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-[#0F5257] hover:bg-[#0B3E42] text-white text-[10px] font-bold shrink-0 flex items-center gap-1 shadow-xs cursor-pointer transition-colors"
                          >
                            <Calendar className="w-3 h-3 text-amber-300" />
                            <span>{lang === 'hi' ? 'टोकन बुक करें' : 'Book'}</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-xl bg-teal-100 text-teal-900 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-2.5 items-start">
              <div className="w-7 h-7 rounded-xl bg-[#0F5257] text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-white border border-teal-100 shadow-xs flex items-center gap-2 text-xs text-teal-800">
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse" />
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse delay-100" />
                <span className="w-2 h-2 rounded-full bg-teal-600 animate-pulse delay-200" />
                <span className="text-[11px] font-medium ml-1 text-gray-500">
                  {lang === 'hi' ? 'Gemini AI सलाह तैयार कर रहा है...' : 'Gemini AI is analyzing symptoms...'}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="p-2 bg-white border-t border-gray-100 shrink-0">
          <div className="text-[10px] text-gray-400 font-semibold px-1 mb-1.5 flex items-center justify-between">
            <span>{lang === 'hi' ? 'त्वरित प्रश्न / सुझाव:' : 'Suggested topics:'}</span>
            <span className="text-teal-700">{lang === 'hi' ? 'क्लिक करें' : 'Click to ask'}</span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {suggestions.map((sug, i) => (
              <button
                key={i}
                disabled={isLoading}
                onClick={() => handleSendMessage(sug.query)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-teal-50 hover:bg-teal-100 border border-teal-200/60 text-teal-900 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-50 shrink-0"
              >
                {sug.label}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-white border-t border-gray-200 shrink-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer shrink-0 ${
                isListening 
                  ? 'bg-red-500 text-white border-red-600 animate-pulse' 
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
              title={isListening ? 'Stop listening' : (lang === 'hi' ? 'बोलकर पूछें (Voice Search)' : 'Voice input')}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <div className="relative flex-1">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  isListening
                    ? (lang === 'hi' ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now')
                    : (lang === 'hi' ? 'लक्षण बताएं या डॉक्टर खोजें (हिंदी/English)...' : 'Describe symptoms or ask about doctors...')
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-teal-600 bg-gray-50/60"
              />
            </div>

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 rounded-xl bg-[#0F5257] hover:bg-[#0B3E42] text-white disabled:opacity-40 transition-colors shadow-xs cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-[10px] text-gray-400 mt-1 px-1 flex items-center justify-between">
            <span>{lang === 'hi' ? 'हिंदी, अंग्रेजी या हिंग्लिश में पूछें' : 'Ask in Hindi or English'}</span>
            <span>Powered by Gemini 3.8 Flash</span>
          </div>
        </div>
      </div>
    </div>
  );
};
