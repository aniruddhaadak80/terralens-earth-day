# 🌍 TerraLens — See Your Planet. Shape Its Future.

An interactive 3D Earth visualization with AI-powered environmental storytelling, built for **Earth Day 2026**.

Explore our planet through an immersive 3D globe showing real environmental data — CO₂ emissions, deforestation hotspots, ocean temperature anomalies, and biodiversity loss. Click on any region and let **Google Gemini AI** explain the environmental situation and suggest actionable steps.

## ✨ Features

- **Interactive 3D Globe** — Rotate, zoom, and explore Earth with realistic rendering using Three.js
- **Environmental Data Layers** — Toggle between CO₂ emissions, deforestation, ocean health, and biodiversity
- **AI Environmental Advisor** — Powered by Google Gemini, get personalized insights about any region
- **Real-Time Stats Dashboard** — Animated environmental statistics from public datasets
- **Earth Day Pledges** — Generate personalized sustainability commitments
- **Responsive Design** — Works beautifully on desktop and mobile

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| [Three.js](https://threejs.org/) | 3D globe rendering with custom shaders |
| [Google Gemini API](https://ai.google.dev/) | AI-powered environmental storytelling |
| [Vite](https://vitejs.dev/) | Fast build tool and dev server |
| Vanilla CSS | Glassmorphism dark theme with animations |

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/terralens.git
cd terralens

# Install dependencies
npm install

# Add your Gemini API key (optional — app works without it via fallback responses)
echo "VITE_GEMINI_API_KEY=your_key_here" > .env

# Start dev server
npm run dev
```

Get a free Gemini API key at [Google AI Studio](https://aistudio.google.com/apikey)

## 🌱 Environmental Data Sources

Data is sourced from publicly available datasets:
- [NASA GISS Surface Temperature Analysis](https://data.giss.nasa.gov/gistemp/)
- [Global Carbon Project](https://www.globalcarbonproject.org/)
- [Global Forest Watch](https://www.globalforestwatch.org/)
- [IUCN Red List](https://www.iucnredlist.org/)
- [NOAA Climate Data](https://www.climate.gov/)

## 📄 License

MIT — Built with 💚 for Earth Day 2026
