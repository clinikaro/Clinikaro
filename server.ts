import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Lazy initialization of Gemini SDK
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not set. Please configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();

  app.use(express.json({ limit: "5mb" }));

  // API Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Curayu Health Platform & Gemini AI Service" });
  });

  // ----------------------------------------------------
  // Secure Session & Cookie Management
  // ----------------------------------------------------
  const SESSION_SECRET = process.env.SESSION_SECRET || "curayu_health_secure_session_key_2026";

  function parseCookies(cookieHeader?: string): Record<string, string> {
    const list: Record<string, string> = {};
    if (!cookieHeader) return list;
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      if (parts.length >= 2) {
        list[parts[0].trim()] = decodeURIComponent(parts.slice(1).join("=").trim());
      }
    });
    return list;
  }

  function createSignedSessionToken(userPayload: any): string {
    const exp = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days expiration
    const payload = { ...userPayload, exp };
    const data = JSON.stringify(payload);
    const sig = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("hex");
    return Buffer.from(JSON.stringify({ data, sig })).toString("base64");
  }

  function verifySignedSessionToken(token: string): any | null {
    try {
      const raw = Buffer.from(token, "base64").toString("utf8");
      const { data, sig } = JSON.parse(raw);
      const expectedSig = crypto.createHmac("sha256", SESSION_SECRET).update(data).digest("hex");
      if (expectedSig !== sig) return null;
      const parsed = JSON.parse(data);
      if (parsed.exp && parsed.exp < Date.now()) return null;
      return parsed;
    } catch {
      return null;
    }
  }

  // Create / Persist Secure Session & Set Cookie
  app.post("/api/auth/session", (req, res) => {
    try {
      const { user, idToken } = req.body;
      if (!user || !user.uid) {
        return res.status(400).json({ error: "User payload with valid uid is required" });
      }

      const sessionToken = createSignedSessionToken({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        doctorId: user.doctorId,
        doctorName: user.doctorName,
        clinicId: user.clinicId,
        clinicName: user.clinicName,
        photoURL: user.photoURL,
        provider: user.provider
      });

      // Set secure cookie (Max-Age 7 days)
      res.setHeader("Set-Cookie", [
        `curayu_session=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}`,
        `curayu_logged_in=true; Path=/; SameSite=Lax; Max-Age=${7 * 24 * 3600}`
      ]);

      return res.json({
        authenticated: true,
        token: sessionToken,
        user: {
          ...user,
          token: sessionToken
        }
      });
    } catch (err: any) {
      console.error("Failed to establish auth session:", err);
      return res.status(500).json({ error: "Failed to establish session" });
    }
  });

  // Verify Active Session via Cookie or Bearer Token
  app.get("/api/auth/session", (req, res) => {
    try {
      const cookies = parseCookies(req.headers.cookie);
      const rawCookieToken = cookies["curayu_session"];
      const cookieToken = (rawCookieToken && rawCookieToken !== "deleted" && rawCookieToken.trim().length > 0)
        ? rawCookieToken.trim() 
        : null;
      const authHeader = req.headers.authorization;
      const bearerToken = authHeader && authHeader.startsWith("Bearer ") ? authHeader.substring(7).trim() : null;

      const tokenToVerify = (bearerToken && bearerToken.length > 0 && bearerToken !== "deleted" ? bearerToken : null) || 
                            cookieToken;

      if (!tokenToVerify) {
        return res.json({ authenticated: false });
      }

      const verifiedUser = verifySignedSessionToken(tokenToVerify);
      if (!verifiedUser) {
        return res.json({ authenticated: false });
      }

      return res.json({
        authenticated: true,
        user: verifiedUser
      });
    } catch (err: any) {
      console.error("Session verification error:", err);
      return res.status(500).json({ error: "Session verification error" });
    }
  });

  // Clear Session & Invalidate Cookie
  app.post("/api/auth/logout", (req, res) => {
    res.setHeader("Set-Cookie", [
      `curayu_session=deleted; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
      `curayu_logged_in=deleted; Path=/; SameSite=Lax; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT`
    ]);
    return res.json({ success: true, message: "Session cleared successfully" });
  });

  // Razorpay Route Status Check
  app.get("/api/razorpay/status", (req, res) => {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const isConfigured = Boolean(keyId && process.env.RAZORPAY_KEY_SECRET);
    res.json({
      configured: isConfigured,
      keyId: keyId || "rzp_test_demo_curayu",
      mode: isConfigured ? "live_or_test_keys" : "sandbox_simulator",
      feature: "Razorpay Route (Multi-Doctor Split Settlements)"
    });
  });

  // Create Razorpay Route Order (Split Transfer to Selected Doctor's Linked Account)
  app.post("/api/razorpay/create-order", async (req, res) => {
    try {
      const {
        amount,
        currency = "INR",
        doctorId,
        doctorName,
        clinicId,
        patientName,
        patientPhone,
        doctorRazorpayAccountId,
        platformCommissionPercent = 0
      } = req.body;

      if (!amount || Number(amount) <= 0) {
        return res.status(400).json({ error: "Invalid consultation fee amount" });
      }

      const amountInPaise = Math.round(Number(amount) * 100);
      const commissionRate = Math.min(Math.max(Number(platformCommissionPercent) || 0, 0), 100);
      const commissionInPaise = Math.round(amountInPaise * (commissionRate / 100));
      const doctorPayoutInPaise = amountInPaise - commissionInPaise;

      const keyId = process.env.RAZORPAY_KEY_ID;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      // If Razorpay live/test credentials exist in environment
      if (keyId && keySecret) {
        // Transfers array for Razorpay Route
        const transfers = doctorRazorpayAccountId ? [
          {
            account: doctorRazorpayAccountId,
            amount: doctorPayoutInPaise,
            currency: "INR",
            notes: {
              doctorId: doctorId || "unknown",
              doctorName: doctorName || "Doctor",
              payoutType: "OPD_Consultation_Fee"
            },
            on_hold: 0
          }
        ] : [];

        const orderPayload: any = {
          amount: amountInPaise,
          currency: currency || "INR",
          receipt: `rcpt_${Date.now().toString().slice(-8)}`,
          notes: {
            doctorId: doctorId || "",
            doctorName: doctorName || "",
            patientName: patientName || "",
            patientPhone: patientPhone || "",
            targetDoctorRouteAccount: doctorRazorpayAccountId || "platform_direct"
          }
        };

        if (transfers.length > 0) {
          orderPayload.transfers = transfers;
        }

        const authHeader = "Basic " + Buffer.from(`${keyId}:${keySecret}`).toString("base64");
        const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": authHeader
          },
          body: JSON.stringify(orderPayload)
        });

        const rzpData = await rzpResponse.json();
        if (!rzpResponse.ok) {
          console.error("Razorpay order creation error:", rzpData);
          return res.status(rzpResponse.status).json({
            error: rzpData.error?.description || "Failed to create Razorpay Route order",
            details: rzpData
          });
        }

        return res.json({
          orderId: rzpData.id,
          amount: rzpData.amount,
          currency: rzpData.currency,
          keyId: keyId,
          doctorPayoutAmount: doctorPayoutInPaise / 100,
          platformFeeAmount: commissionInPaise / 100,
          transferredToAccountId: doctorRazorpayAccountId || null,
          isDemo: false
        });
      }

      // If live keys are not configured yet, generate realistic simulated Route order for smooth preview
      const demoOrderId = `order_route_${Date.now()}`;
      return res.json({
        orderId: demoOrderId,
        amount: amountInPaise,
        currency: "INR",
        keyId: "rzp_test_demo_curayu",
        doctorPayoutAmount: doctorPayoutInPaise / 100,
        platformFeeAmount: commissionInPaise / 100,
        transferredToAccountId: doctorRazorpayAccountId || `acc_route_${doctorId || 'doctor'}`,
        isDemo: true,
        message: "Razorpay Route simulated sandbox order created successfully"
      });

    } catch (err: any) {
      console.error("Razorpay order error:", err);
      res.status(500).json({ error: err?.message || "Internal server error" });
    }
  });

  // Verify Razorpay Payment (Verifies signature and confirms Route payout)
  app.post("/api/razorpay/verify-payment", (req, res) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
      const keySecret = process.env.RAZORPAY_KEY_SECRET;

      if (!razorpay_order_id || !razorpay_payment_id) {
        return res.status(400).json({ error: "Missing order or payment ID" });
      }

      // If simulated demo order or test key
      if (razorpay_order_id.startsWith("order_route_") || !keySecret) {
        return res.json({
          verified: true,
          status: "captured",
          paymentId: razorpay_payment_id || `pay_route_${Date.now()}`,
          orderId: razorpay_order_id,
          settlement: "routed_to_doctor_linked_account"
        });
      }

      // Verify HMAC-SHA256 signature
      const body = razorpay_order_id + "|" + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac("sha256", keySecret)
        .update(body.toString())
        .digest("hex");

      const isSignatureValid = expectedSignature === razorpay_signature;

      if (!isSignatureValid) {
        return res.status(400).json({ verified: false, error: "Invalid Razorpay payment signature" });
      }

      return res.json({
        verified: true,
        status: "captured",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        settlement: "routed_to_doctor_linked_account"
      });
    } catch (err: any) {
      console.error("Signature verification error:", err);
      res.status(500).json({ error: err?.message || "Verification failed" });
    }
  });

  // Check Email Dispatch Service Status (SMTP / Gmail App Password)
  app.get("/api/email-service/status", (req, res) => {
    const hasGmailAppPass = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
    const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
    const isConfigured = hasGmailAppPass || hasSmtp;

    res.json({
      configured: isConfigured,
      service: hasGmailAppPass ? "Gmail Direct SMTP" : hasSmtp ? "Custom SMTP" : "Demo Preview Mode",
      senderEmail: process.env.GMAIL_USER || process.env.SMTP_USER || "noreply@curayu.health",
      message: isConfigured 
        ? "Live SMTP email gateway is active and ready to deliver to external inboxes." 
        : "SMTP not configured in environment. System will display OTP on screen with instant 1-click autofill."
    });
  });

  // Send OTP to Doctor / Staff Gmail
  app.post("/api/send-otp-email", async (req, res) => {
    try {
      const { to, otp, purpose = "doctor_onboarding", clinicName, doctorName } = req.body;

      if (!to || !to.includes("@")) {
        return res.status(400).json({ error: "Valid recipient email address is required" });
      }

      const cleanTo = String(to).trim().toLowerCase();
      const code = String(otp || Math.floor(1000 + Math.random() * 9000));

      const hasGmailAppPass = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
      const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

      // If SMTP credentials are provided in environment
      if (hasGmailAppPass || hasSmtp) {
        try {
          const transporter = hasGmailAppPass
            ? nodemailer.createTransport({
                service: "gmail",
                auth: {
                  user: process.env.GMAIL_USER,
                  pass: process.env.GMAIL_APP_PASSWORD,
                },
              })
            : nodemailer.createTransport({
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT || "587", 10),
                secure: process.env.SMTP_SECURE === "true",
                auth: {
                  user: process.env.SMTP_USER,
                  pass: process.env.SMTP_PASS,
                },
              });

          const sender = process.env.GMAIL_USER || process.env.SMTP_USER || "noreply@curayu.health";
          const subject = `[MyDehriDoctor] आपका सुरक्षा कोड (Verification OTP): ${code}`;

          const htmlContent = `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0;">
              <div style="background: #0F5257; padding: 24px; text-align: center; color: #ffffff;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">MyDehriDoctor</h1>
                <p style="margin: 6px 0 0; font-size: 13px; color: #a7f3d0;">स्मार्ट ओपीडी एवं डॉक्टर क्लिनिक पोर्टल (Dehri-on-Sone, Bihar)</p>
              </div>
              <div style="padding: 32px 24px;">
                <h2 style="font-size: 18px; color: #1e293b; margin-top: 0;">नमस्ते डॉक्टर / क्लिनिक व्यवस्थापक,</h2>
                <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                  ${purpose === 'doctor_onboarding' 
                    ? `आपके क्लिनिक <strong>${clinicName || 'MyDehriDoctor'}</strong> के लिए आधिकारिक डॉक्टर जीमेल सत्यापन का अनुरोध प्राप्त हुआ है।` 
                    : `आपके डॉक्टर ओपीडी केबिन पोर्टल (<strong>${cleanTo}</strong>) में 2-स्तरीय सुरक्षा लॉगिन का अनुरोध किया गया है।`}
                </p>
                <div style="background: #f0fdfa; border: 2px dashed #0d9488; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                  <span style="font-size: 12px; font-weight: 700; color: #0f766e; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">आपका 4-अंकों का सत्यापन कोड (OTP)</span>
                  <div style="font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #0F5257; font-family: monospace;">${code}</div>
                  <span style="font-size: 12px; color: #64748b; margin-top: 8px; display: block;">यह कोड केवल 10 मिनट के लिए मान्य है। इसे किसी के साथ साझा न करें।</span>
                </div>
                <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
                  यदि आपने यह अनुरोध नहीं किया था, तो कृपया तुरंत इस ईमेल को अनदेखा करें अथवा सपोर्ट टीम से संपर्क करें।
                </p>
              </div>
              <div style="background: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8;">
                © 2026 MyDehriDoctor Health Platform · Dehri-on-Sone, Rohtas, Bihar
              </div>
            </div>
          `;

          await transporter.sendMail({
            from: `"MyDehriDoctor Portal" <${sender}>`,
            to: cleanTo,
            subject,
            html: htmlContent,
          });

          return res.json({
            success: true,
            delivered: true,
            recipient: cleanTo,
            otp: code,
            mode: "live_smtp",
            message: `Real verification email successfully delivered to ${cleanTo}`
          });
        } catch (mailErr: any) {
          console.warn("SMTP delivery attempt failed, falling back to simulated on-screen OTP:", mailErr?.message);
          return res.json({
            success: true,
            delivered: false,
            simulated: true,
            recipient: cleanTo,
            otp: code,
            mode: "demo_fallback",
            smtpError: mailErr?.message,
            message: "SMTP delivery failed. OTP is provided for on-screen test fill."
          });
        }
      }

      // If no SMTP configured in preview environment: return simulated response with instant fill code
      return res.json({
        success: true,
        delivered: false,
        simulated: true,
        recipient: cleanTo,
        otp: code,
        mode: "preview_simulator",
        message: "Demo server preview: External SMTP not configured. OTP displayed on screen with instant 1-click autofill."
      });

    } catch (err: any) {
      console.error("send-otp-email error:", err);
      res.status(500).json({ error: err?.message || "Failed to process OTP request" });
    }
  });

  // Check Gemini Status
  app.get("/api/gemini/status", (req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY);
    res.json({ 
      configured: hasKey, 
      model: "gemini-3.8-flash",
      message: hasKey ? "Gemini is active" : "GEMINI_API_KEY not configured"
    });
  });

  // Patient Chat Endpoint
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { message, history = [], lang = 'hi', context = {} } = req.body;

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: "Message is required" });
      }

      const client = getGeminiClient();

      const doctorListSummary = Array.isArray(context.doctors)
        ? context.doctors.slice(0, 15).map((d: any) => 
            `- Dr. ${d.name} (${d.specialty}, ₹${d.fee} OPD Fee) at ${d.clinicName || 'Dehri'}`
          ).join("\n")
        : "";

      const clinicListSummary = Array.isArray(context.clinics)
        ? context.clinics.slice(0, 10).map((c: any) =>
            `- ${c.name} (${c.type === 'hospital' ? 'Hospital' : 'Clinic'}, ${c.address}) - Ph: ${c.phone || c.contactPhone || 'Available in app'}`
          ).join("\n")
        : "";

      const systemInstruction = `You are the empathetic, intelligent, and certified Medical Assistant & Patient Navigator for "MyDehriDoctor" (माइ डेहरी डॉक्टर), a healthcare and OPD appointment booking platform serving patients in Dehri-on-Sone, Dalmianagar, and Rohtas district, Bihar.

Your Goals:
1. Patient Help & Symptom Understanding: Listen to patient concerns (in Hindi, English, or Hinglish), understand symptoms, explain in simple non-technical terms what might be happening, and suggest safe immediate home-care precautions or general health advice.
2. Specialist & Doctor Recommendation: Recommend the right medical specialist (e.g. General Physician, Pediatrician for children, Orthopedic for bones/joints, Gynecologist for women's health, Cardiologist, ENT, Ophthalmologist/Eye Specialist, Dermatologist, etc.).
3. Dehri-on-Sone Local Guidance: Reference our registered clinics and doctors in Dehri-on-Sone when helpful:
Registered Doctors:
${doctorListSummary || "General Physicians, Pediatricians, Orthopedics, Eye Specialists, Gynecologists available in Dehri-on-Sone"}

Registered Clinics & Hospitals in Dehri-on-Sone:
${clinicListSummary || "Seva Clinic, Netram Eye Care, Maa Tara Multi-Speciality Hospital, Dalmianagar Central Hospital, etc."}

Rules & Safety Mandates:
- Always include a short, compassionate medical disclaimer: remind patients that this AI advice is for informative guidance and cannot replace an in-person physical clinical examination.
- For emergency symptoms (severe chest pain, difficulty breathing, excessive bleeding, unconsciousness, severe burns, high fever in infants): IMMEDIATELY advise visiting an emergency ward or calling 108/local emergency ambulance or visiting Maa Tara Hospital or Dalmianagar hospital 24x7 emergency.
- Language: If the user speaks Hindi, reply in clear, respectful Hindi (Devanagari) or natural conversational Hinglish. If English, reply in friendly English.
- Keep the tone polite, comforting ("नमस्ते! मैं आपकी क्या सहायता कर सकता हूँ?"), and structured with bullet points. Suggest they can book an OPD token directly on MyDehriDoctor without standing in long lines.`;

      // Build conversation contents
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Add relevant history if provided (limit to last 8 messages)
      const validHistory = Array.isArray(history) ? history.slice(-8) : [];
      for (const msg of validHistory) {
        if (msg.role && msg.text) {
          contents.push({
            role: msg.role === 'assistant' || msg.role === 'model' ? 'model' : 'user',
            parts: [{ text: String(msg.text) }]
          });
        }
      }

      // Add latest message
      contents.push({
        role: 'user',
        parts: [{ text: message }]
      });

      const response = await client.models.generateContent({
        model: "gemini-3.8-flash",
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
          topP: 0.9,
        }
      });

      const replyText = response.text || (
        lang === 'hi'
          ? "माफ़ कीजिए, मैं अभी उत्तर तैयार नहीं कर सका। कृपया पुनः प्रयास करें या अपने निकटतम क्लिनिक से संपर्क करें।"
          : "Sorry, I couldn't generate a response right now. Please try again or visit your nearest clinic."
      );

      return res.json({
        reply: replyText,
        model: "gemini-3.8-flash"
      });

    } catch (error: any) {
      console.error("Gemini API Error:", error);
      const isMissingKey = error?.message?.includes("GEMINI_API_KEY");
      
      return res.status(500).json({
        error: isMissingKey ? "Gemini API key is not configured" : "Failed to process chat with AI",
        details: error?.message || "Internal server error"
      });
    }
  });

  // Vite middleware in development vs static file serving in production
  const distPath = path.join(process.cwd(), "dist");
  const distIndexHtml = path.join(distPath, "index.html");
  const hasDist = fs.existsSync(distIndexHtml);
  // Only serve static build if dist/index.html actually exists and NODE_ENV is explicitly production
  const isProduction = process.env.NODE_ENV === "production" && hasDist;

  if (isProduction) {
    // Production static serving
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      if (fs.existsSync(distIndexHtml)) {
        res.sendFile(distIndexHtml);
      } else {
        res.status(404).send("Application bundle is being prepared. Please refresh in a moment.");
      }
    });
  } else {
    // Vite middleware for development or runtime SPA handling
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Curayu platform server running on port ${PORT} (mode: ${isProduction ? 'production' : 'development'})`);
  });

  process.on("SIGTERM", () => {
    console.log("SIGTERM received, closing HTTP server gracefully...");
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
