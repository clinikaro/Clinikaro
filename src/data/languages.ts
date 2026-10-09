export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  scriptIcon: string;
  isFullySupported: boolean;
}

export const INDIAN_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    region: 'Pan-India',
    scriptIcon: 'A',
    isFullySupported: true
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    region: 'North & Central India',
    scriptIcon: 'अ',
    isFullySupported: true
  },
  {
    code: 'bho',
    name: 'Bhojpuri',
    nativeName: 'भोजपुरी',
    region: 'Bihar & Purvanchal (Eastern UP)',
    scriptIcon: 'भो',
    isFullySupported: true
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    region: 'West Bengal, Tripura, Assam',
    scriptIcon: 'অ',
    isFullySupported: true
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    region: 'Maharashtra & Goa',
    scriptIcon: 'म',
    isFullySupported: true
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    region: 'Andhra Pradesh & Telangana',
    scriptIcon: 'తె',
    isFullySupported: true
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    region: 'Tamil Nadu & Puducherry',
    scriptIcon: 'த',
    isFullySupported: true
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    region: 'Gujarat',
    scriptIcon: 'ગ',
    isFullySupported: true
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    region: 'Karnataka',
    scriptIcon: 'ಕ',
    isFullySupported: true
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    region: 'Punjab & Chandigarh',
    scriptIcon: 'ਪੰ',
    isFullySupported: true
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    region: 'Kerala & Lakshadweep',
    scriptIcon: 'മ',
    isFullySupported: true
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    region: 'Pan-India',
    scriptIcon: 'ار',
    isFullySupported: true
  }
];

