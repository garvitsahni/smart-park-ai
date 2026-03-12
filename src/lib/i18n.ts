import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

export const resources = {
  en: {
    translation: {
      nav: {
        park: "Park Vehicle",
        reserve: "Reserve",
        dashboard: "Dashboard",
        history: "History",
        analytics: "Analytics"
      },
      hero: {
        badge: "Ethical AI-Powered Civic Mobility",
        title1: "Parking That",
        title2: "Respects You",
        subtitle: "Parking Prabandh is human-centric smart parking for Indian cities. No penalties. Just rewards, transparency, and calm.",
        badgePrivacy: "Privacy-First",
        badgeEco: "ESG Compliant",
        badgeReward: "Rewards-Only",
        ctaStart: "Start Parking",
        ctaView: "View Dashboard"
      },
      admin: {
        title1: "Admin",
        title2: "Dashboard",
        subtitle: "Real-time parking management with AI intelligence",
        refresh: "Refresh",
        agents: "AI Agents:",
        agentNames: {
          allocation: "Slot Allocation",
          compliance: "Compliance",
          payment: "Payment",
          prediction: "Exit Prediction",
          dna: "DNA Scoring"
        },
        tabs: {
          overview: "Overview",
          cameras: "Cameras",
          twin: "Twin",
          heatmap: "Heatmap",
          exitAI: "Exit AI",
          dna: "DNA"
        },
        stats: {
          totalSlots: "Total Slots",
          available: "Available",
          occupied: "Occupied",
          violations: "Violations",
          todayRevenue: "Today's Revenue",
          weeklyRevenue: "Weekly Revenue",
          activeSessions: "Active Sessions",
          reservations: "Reservations",
          utilization: "utilization",
          vehiclesToday: "vehicles today"
        }
      },
      common: {
        language: "Language",
        english: "English",
        hindi: "हिंदी"
      }
    }
  },
  hi: {
    translation: {
      nav: {
        park: "वाहन पार्क करें",
        reserve: "आरक्षित करें",
        dashboard: "डैशबोर्ड",
        history: "इतिहास",
        analytics: "विश्लेषण"
      },
      hero: {
        badge: "एथिकल एआई-पावर्ड सिविक मोबिलिटी",
        title1: "पार्किंग जो",
        title2: "आपका सम्मान करती है",
        subtitle: "पार्किंग प्रबंध भारतीय शहरों के लिए मानव-केंद्रित स्मार्ट पार्किंग है। कोई दंड नहीं। केवल पुरस्कार, पारदर्शिता और शांति।",
        badgePrivacy: "गोपनीयता-प्रथम",
        badgeEco: "ईएसजी अनुपालन",
        badgeReward: "केवल-पुरस्कार",
        ctaStart: "पार्किंग शुरू करें",
        ctaView: "डैशबोर्ड देखें"
      },
      admin: {
        title1: "व्यवस्थापक",
        title2: "डैशबोर्ड",
        subtitle: "एआई इंटेलिजेंस के साथ रीयल-टाइम पार्किंग प्रबंधन",
        refresh: "रिफ्रेश",
        agents: "एआई एजेंट:",
        agentNames: {
          allocation: "स्लॉट आवंटन",
          compliance: "अनुपालन",
          payment: "भुगतान",
          prediction: "निकास भविष्यवाणी",
          dna: "डीएनए स्कोरिंग"
        },
        tabs: {
          overview: "अवलोकन",
          cameras: "कैमरे",
          twin: "ट्विन",
          heatmap: "हीटमैप",
          exitAI: "निकास एआई",
          dna: "डीएनए"
        },
        stats: {
          totalSlots: "कुल स्लॉट",
          available: "उपलब्ध",
          occupied: "व्यस्त",
          violations: "उल्लंघन",
          todayRevenue: "आज का राजस्व",
          weeklyRevenue: "साप्ताहिक राजस्व",
          activeSessions: "सक्रिय सत्र",
          reservations: "आरक्षण",
          utilization: "उपयोग",
          vehiclesToday: "आज वाहन"
        }
      },
      common: {
        language: "भाषा",
        english: "English",
        hindi: "हिंदी"
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });

export default i18n;
