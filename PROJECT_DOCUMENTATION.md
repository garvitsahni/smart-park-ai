# 🦚 Parking Prabandh | Project Documentation

**Parking Prabandh** (formerly SmartPark AI) is a next-generation, AI-driven parking management ecosystem designed for modern Indian smart cities. It focuses on ethical civic mobility, removing the anxiety of parking through predictive intelligence and human-centric design.

---

## 🛠️ Technology Stack

The platform is built using a modern, hyper-performant "Smart City" tech stack:

### Frontend Core
- **React 18**: The backbone of the component-based architecture.
- **Vite**: High-speed build tool and development server.
- **TypeScript**: Ensuring type safety across complex parking data structures.
- **Tailwind CSS**: Custom "Smart City AI" utility-first styling system.

### Libraries & Visualization
- **Recharts**: Powering the smoothed, gradient-mapped analytics and surge price charts.
- **Lucide React**: Premium iconography for a high-tech aesthetic.
- **Radix UI**: Accessible, high-performance base components (Tabs, Select, Dialogs).

### Localization (i18n)
- **i18next & react-i18next**: Managing the multi-language dictionary system.
- **LanguageDetector**: Automatically detects browser preferences (Hindi/English).

### Intelligence & State
- **React Context API**: Managing global state for parking slots, vehicles, and notifications.
- **Custom AI Logic**: Vanilla JS/TS engines for:
  - Exit Congestion Prediction (Weighted Time Analysis)
  - Slot Allocation Intelligence (Intent-Based Placing)
  - Vehicle DNA Scoring (Behavioral Profiling)

---

## 🚀 Key Features

### 1. 🌐 Smart Multi-Language Engine
A built-in internationalization system that allows instant toggling between **English and Hindi**.
- **Dynamic Translation**: Headers, labels, and even AI status messages translate on the fly.
- **Global Toggle**: Accessible from any page via the Navbar globe icon.

### 2. 📊 AI-Powered Admin Dashboard
A comprehensive command center for parking officials featuring:
- **Digital Twin**: Virtual representation of the parking floor state.
- **AI Agent Monitoring**: Real-time status of tracking agents (Slot Allocation, Compliance, Payment).
- **Live CCTV Feeds**: Mock-integration of video analytics per floor/zone.
- **Vehicle Logs**: Deep history of every entry, exit, and payment method used.

### 3. 📉 Smart Price Forecaster (New!)
An AI-driven surge pricing tool that helps both users and admins.
- **Dynamic Rates**: Monitors demand cues and adjusts hourly rates.
- **Decision Support**: Visual AreaChart helps users see when prices are lower to encourage off-peak parking.
- **Revenue Intelligence**: Helps admins maximize revenue while managing city congestion.

### 4. 🧬 Civic Trust DNA Scoring
A revolutionary behavioral tracking system that assigns a "DNA" score to vehicles:
- **Trust Metrics**: Factors in accurate parking, timely exit, and compliance history.

---

## 🎨 Design & Aesthetics

### "Smart City AI" Theme
The application uses a custom-coded premium dark theme:
- **Primary Color**: Electric Blue (`hsl(217 91% 60%)`)
- **Accent Color**: Neon Cyan (`hsl(185 100% 50%)`)
- **Background**: Deep Navy Abyss (`hsl(230 25% 6%)`)
- **Gradients**: Smooth monotone and cyan-to-blue linear fades.
- **Glassmorphism**: Heavy use of `.glass-card-elevated` for a floating, futuristic look.

---

## 📁 Project Structure

```bash
src/
├── components/          # Reusable UI components
│   ├── dashboard/       # Stats cards, charts, DNA tables
│   ├── layout/          # Navbar, Sidebars
│   ├── parking/         # Price Forecaster, Entry Forms
├── context/             # Global State (Parking, Notification)
├── lib/                 # Core AI logic and mock data
│   ├── i18n.ts          # Localization Dictionary
│   ├── parking-intelligence.ts  # AI Prediction Engines
├── pages/               # Top-level Page views (Dashboard, Analytics, Reserve)
└── App.tsx              # Main routing and provider setup
```
