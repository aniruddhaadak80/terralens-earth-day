---
title: "TerraLens: See Your Planet. Shape Its Future. 🌍"
published: false
tags: devchallenge, weekendchallenge, earthday, gemini
---

*This is a submission for the [Weekend Challenge: Earth Day Edition](https://dev.to/challenges/weekend-2026-04-16).*

---

## 🌍 What I Built

**TerraLens** is an interactive, visually stunning 3D Earth visualization combined with an AI-powered environmental storytelling experience. 

For Earth Day, I wanted to build something that doesn't just show sterile data on a static dashboard, but actually *connects* people emotionally to the challenges our planet faces. 

With TerraLens, you can rotate and explore the globe to discover environmental hotspots (from the Amazon rainforest to the Great Barrier Reef) across four critical dimensions: 
1. 💨 **CO₂ Emissions** 
2. 🌳 **Forest Loss**
3. 🌊 **Ocean Health**
4. 🦋 **Biodiversity**

When you click on a region's glowing marker, you don't just get a simple pop-up. Instead, **Google's Gemini 2.0 Flash** steps in as your *"Earth Advisor"* — dynamically explaining the local environmental dynamics, the specific challenges that region faces, and what positive actions are being taken right now. 

> *"My intended goal was to make environmental awareness immersive, beautiful, and fundamentally optimistic — empowering users to understand our planet and generate their own personalized 'Earth Day Pledges'."*

---

## 📸 Features & Demo

I've deployed the project live! You can personally experience the 3D interaction here:

🚀 **[Experience TerraLens Live](https://aniruddhaadak80.github.io/terralens-earth-day/)**

### The 3D Environmental Globe
The interactive globe allows you to rotate Earth and cycle through different high-importance data layers like CO₂ emissions, the state of the Oceans, and Biodiversity hotspots.

![TerraLens Default Globe View](https://raw.githubusercontent.com/aniruddhaadak80/terralens-earth-day/main/src/assets/hero.png) 
*(A high-level view showing the dark, space-glass UI and the emissions layer)*

![TerraLens Oceans Layer](https://raw.githubusercontent.com/aniruddhaadak80/terralens-earth-day/main/src/assets/oceans.png)
*(Switching to the Oceans layer. Notice the animated KPI dashboard at the bottom updating in real-time!)*

### The "Earth Advisor" AI Chat
By clicking **"Ask Gemini"**, you unlock an interactive environmental storytelling interface. If you click on specific continent hotspots, the spatial mapping feeds that location's data right into Gemini!

![Gemini Chat Interface](https://raw.githubusercontent.com/aniruddhaadak80/terralens-earth-day/main/src/assets/chat.png)
*(The Gemini sidebar. It generates contextually-aware responses based exactly on what you're interacting with.)*

### Generate Your Own Earth Pledge
To promote real-world change beyond just looking at a screen, I programmed Gemini to construct highly personalized, realistically actionable **Earth Pledges** dynamically.

![Earth Pledge Generator](https://raw.githubusercontent.com/aniruddhaadak80/terralens-earth-day/main/src/assets/pledge.png)
*(A personalized, AI-generated pledge modal generated live using the `@google/generative-ai` SDK!)*

> **💡 Pro Tip:** Try deploying it locally and asking the Gemini chat panel to *"Generate a personalized Earth Day Pledge"* for you!

---

## 💻 Code

You can check out the full source code on my GitHub:

{% github aniruddhaadak80/terralens-earth-day %}

---

## 🛠️ How I Built It

TerraLens is a completely frontend-driven application built for speed and immersion. Here is the technical breakdown:

* **The Core Environment:** I used `Vite` + vanilla `JavaScript` and `CSS` to keep the bundle as light and blazing-fast as possible.
* **The 3D Globe:** I used `Three.js` directly to map out custom procedural earth textures, atmosphere shaders, glowing hotspot markers, and the dynamic starfield. Creating a realistic day/night cycle and atmospheric glow required some very careful tweaking of the `ShaderMaterial`!
* **The UI Experience:** Beautiful, smooth "glassmorphism" panels implemented purely with vanilla CSS variables and `backdrop-filter` to give it a premium, futuristic look.
* **The Data:** I manually compiled real datasets from public sources like the *Global Forest Watch*, *NASA*, and the *IUCN Red List*. This is structured as a static JSON for zero-latency lookups on the frontend.

### 🧠 The Hardest Part
The biggest technical challenge was **seamlessly connecting the spatial UI (the 3D globe) with the conversational UI.** 

Clicking a hotspot creates a direct handoff to the Gemini chat panel. To make this work, the app dynamically injects the selected region's environmental data into a hidden system prompt to guide the AI's response format before presenting it to the user.

---

## 🏆 Prize Categories

I am proudly submitting this project to the following prize category:

* **Best Use of Google Gemini ✨**: To bring the data to life, I deeply integrated the `@google/generative-ai` SDK. I used a highly tuned system prompt that instructs Gemini to be an encouraging, optimistic *"Earth Advisor"*. 
   
  It receives hidden context about the specific region the user clicks on, formatting the structural JSON data into engaging, human-readable narratives. Crucially, it also has the programmatic capability to generate actionable, localized Earth Day pledges for users based on their chat inputs. **It turns TerraLens from a passive encyclopedia into an active conversation!**

---

*Thank you for checking out TerraLens, and Happy Earth Day! Let's shape a better future together. 🌍💚*
