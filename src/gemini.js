/**
 * TerraLens — Gemini AI Module
 * Integration with Google Gemini API for environmental storytelling
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

let genAI = null;
let chat = null;
let isInitialized = false;

const SYSTEM_PROMPT = `You are "TerraLens Earth Advisor", an AI environmental expert powered by Google Gemini. You are part of an interactive 3D Earth visualization called TerraLens, built for Earth Day.

Your role:
- Provide accurate, engaging environmental insights about any region on Earth
- Explain environmental challenges (climate change, deforestation, ocean health, biodiversity loss) in accessible language
- Suggest actionable steps people can take to help the planet
- Generate inspiring and personalized "Earth Day Pledges" when asked
- Be optimistic but realistic — acknowledge problems while highlighting solutions and progress

Your personality:
- Warm, passionate about the planet, and encouraging
- Use clear language, avoid jargon
- Include relevant statistics when helpful
- Use emojis sparingly to keep things engaging (🌍🌱🌊🌡️)
- Keep responses concise — 2-4 paragraphs max unless asked for detail

Important:
- Responses will be displayed in a chat panel alongside a 3D globe
- Format responses in simple HTML that can be directly inserted (use <p>, <strong>, <ul>, <li> tags)
- When discussing a region, mention specific local environmental features
- Always end with an encouraging note or actionable suggestion`;

/**
 * Initialize the Gemini API with the provided API key
 */
export function initGemini(apiKey) {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    isInitialized = true;
    startNewChat();
    return true;
  } catch (error) {
    console.error('Failed to initialize Gemini:', error);
    return false;
  }
}

/**
 * Start a new chat session with conversation history
 */
function startNewChat() {
  if (!genAI) return;
  
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.0-flash',
    systemInstruction: SYSTEM_PROMPT,
  });
  
  chat = model.startChat({
    history: [],
    generationConfig: {
      maxOutputTokens: 1024,
      temperature: 0.8,
      topP: 0.9,
    },
  });
}

/**
 * Send a message to Gemini and get a response
 */
export async function sendMessage(message) {
  if (!isInitialized || !chat) {
    return getFallbackResponse(message);
  }

  try {
    const result = await chat.sendMessage(message);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    // If rate limited or error, provide fallback
    return getFallbackResponse(message);
  }
}

/**
 * Ask Gemini about a specific region with environmental data context
 */
export async function askAboutRegion(hotspot) {
  const dataEntries = Object.entries(hotspot.data)
    .map(([key, val]) => `${val.label}: ${val.value} ${val.unit}`)
    .filter(s => s.trim() !== ': ')
    .join(', ');

  const prompt = `The user clicked on "${hotspot.name}" ${hotspot.flag} on the 3D globe. 
This region's environmental data: ${dataEntries}.
Context: ${hotspot.description}
Category focus: ${hotspot.category}.

Please provide a compelling, concise environmental briefing about this region. Include:
1. Why this region matters environmentally
2. The key environmental challenges it faces
3. One positive development or solution being implemented
4. One action the user could take to help

Format as simple HTML for display.`;

  return await sendMessage(prompt);
}

/**
 * Generate a personalized Earth Day pledge
 */
export async function generatePledge() {
  const prompt = `Generate a unique and inspiring Earth Day Pledge. Make it personal, specific, and achievable. 
Format it as:
- A title for the pledge
- 3-5 specific commitments 
- An inspiring closing statement

Use HTML formatting with <h3>, <ul>, <li>, <p>, and <strong> tags. Make it feel special and shareable.`;

  return await sendMessage(prompt);
}

/**
 * Check if Gemini is ready
 */
export function isReady() {
  return isInitialized;
}

/**
 * Fallback responses when API is unavailable
 */
function getFallbackResponse(message) {
  const lowerMsg = message.toLowerCase();
  
  if (lowerMsg.includes('pledge')) {
    return `<h3>🌍 My Earth Day Pledge</h3>
<p>Today, I commit to being a better steward of our planet:</p>
<ul>
<li><strong>Reduce</strong> — I'll cut my single-use plastic consumption by 50% this month</li>
<li><strong>Reconnect</strong> — I'll spend at least 2 hours per week in nature</li>
<li><strong>Restore</strong> — I'll plant or sponsor the planting of 5 trees this year</li>
<li><strong>Rethink</strong> — I'll choose sustainable transportation at least 3 times per week</li>
<li><strong>Ripple</strong> — I'll share environmental knowledge with 3 friends this week</li>
</ul>
<p><strong>Every action counts.</strong> The planet doesn't need a few people doing sustainability perfectly — it needs millions doing it imperfectly. 🌱</p>`;
  }
  
  if (lowerMsg.includes('ocean') || lowerMsg.includes('sea') || lowerMsg.includes('marine')) {
    return `<p>🌊 Our oceans cover 71% of Earth's surface and are the planet's life support system. They absorb about 30% of the CO₂ we produce and have absorbed over 90% of the extra heat from global warming.</p>
<p>Key challenges facing our oceans:</p>
<ul>
<li><strong>Ocean Acidification</strong> — pH has dropped by 0.1 units since pre-industrial times (a 26% increase in acidity)</li>
<li><strong>Coral Bleaching</strong> — Over 50% of the world's coral reefs have been lost since 1950</li>
<li><strong>Plastic Pollution</strong> — 11 million metric tons of plastic enter the ocean annually</li>
<li><strong>Overfishing</strong> — 35% of global fish stocks are overfished</li>
</ul>
<p>But there's hope! Marine protected areas have grown to cover 8% of our oceans, and coral restoration projects are showing promising results. 🐠</p>`;
  }

  if (lowerMsg.includes('challenge') || lowerMsg.includes('biggest') || lowerMsg.includes('today')) {
    return `<p>🌡️ Earth faces several interconnected environmental challenges today:</p>
<ul>
<li><strong>Climate Change</strong> — Global temperature has risen 1.45°C above pre-industrial levels. We need to limit warming to 1.5°C to avoid the worst impacts.</li>
<li><strong>Biodiversity Loss</strong> — We're in the 6th mass extinction. About 1 million species face extinction within decades.</li>
<li><strong>Deforestation</strong> — We lose about 4.7 million hectares of forest annually, destroying critical carbon sinks.</li>
<li><strong>Ocean Degradation</strong> — Warming, acidification, and pollution threaten marine ecosystems worldwide.</li>
<li><strong>Air & Water Pollution</strong> — 9 out of 10 people breathe air exceeding WHO pollution guidelines.</li>
</ul>
<p>The good news? Renewable energy is booming (solar is now the cheapest electricity source in history), and global awareness has never been higher. <strong>Your actions matter.</strong> 🌱</p>`;
  }
  
  if (lowerMsg.includes('action') || lowerMsg.includes('do') || lowerMsg.includes('help')) {
    return `<p>🌱 Here are 5 impactful things you can do today:</p>
<ul>
<li><strong>Switch to green energy</strong> — Choose a renewable energy provider or support community solar.</li>
<li><strong>Eat more plant-based meals</strong> — Food production accounts for 26% of global emissions. Even one meat-free day per week makes a difference.</li>
<li><strong>Reduce, reuse, refuse</strong> — Before buying, ask "Do I really need this?" Single-use plastics are especially harmful.</li>
<li><strong>Use your voice</strong> — Vote for climate-conscious leaders and support environmental policies. Systemic change is powerful.</li>
<li><strong>Connect with nature</strong> — People who spend time in nature are more likely to protect it. Visit a local park, plant something, or join a cleanup.</li>
</ul>
<p><strong>Remember:</strong> Individual action AND systemic change both matter. Don't let perfect be the enemy of good! 🌍</p>`;
  }

  // Generic response
  return `<p>🌍 That's a great question! Our planet is a remarkable system of interconnected ecosystems, and understanding these connections is key to protecting them.</p>
<p>Some fascinating Earth facts:</p>
<ul>
<li>Earth's atmosphere is just a thin shell — if our planet were an apple, the atmosphere would be thinner than the skin.</li>
<li>Forests produce about 28% of the world's oxygen (phytoplankton produce most of the rest!).</li>
<li>A single tree can absorb up to 22 kg of CO₂ per year.</li>
</ul>
<p>Feel free to click on any hotspot on the globe to learn about specific environmental challenges around the world, or ask me about topics like climate change, ocean health, biodiversity, or sustainable living! 🌱</p>`;
}
