/**
 * TerraLens 🌍 — See Your Planet. Shape Its Future.
 * 
 * An interactive 3D Earth visualization with AI-powered
 * environmental storytelling, built for Earth Day 2026.
 * 
 * Powered by Three.js + Google Gemini API
 */

import './style.css';
import { initGlobe, setLayer, focusOnCoordinates } from './globe.js';
import { initGemini } from './gemini.js';
import { initChat, askAboutHotspot, openChat } from './chat.js';
import { initDashboard, highlightStat } from './dashboard.js';

// =============================================
// App Initialization
// =============================================

async function initApp() {
  const loadingScreen = document.getElementById('loading-screen');
  const progressFill = document.getElementById('progress-fill');
  
  // Simulate loading progress
  let progress = 0;
  const progressInterval = setInterval(() => {
    progress += Math.random() * 15 + 5;
    if (progress > 90) progress = 90;
    progressFill.style.width = progress + '%';
  }, 200);
  
  try {
    // Step 1: Initialize Gemini AI
    updateLoadingText('Connecting to Gemini AI...');
    initializeGemini();
    
    // Step 2: Initialize 3D Globe
    updateLoadingText('Rendering planet Earth...');
    const container = document.getElementById('globe-container');
    initGlobe(container, handleHotspotClick);
    
    // Step 3: Initialize Chat
    updateLoadingText('Preparing AI advisor...');
    initChat();
    
    // Step 4: Initialize Dashboard
    updateLoadingText('Loading environmental data...');
    
    // Step 5: Setup navigation
    setupNavigation();
    setupTooltip();
    
    // Complete loading
    clearInterval(progressInterval);
    progressFill.style.width = '100%';
    
    updateLoadingText('Welcome to TerraLens 🌍');
    
    // Fade out loading screen
    setTimeout(() => {
      loadingScreen.classList.add('fade-out');
      // Start dashboard animations after loading screen fades
      setTimeout(() => {
        initDashboard();
        loadingScreen.style.display = 'none';
      }, 800);
    }, 600);
    
  } catch (error) {
    console.error('Initialization error:', error);
    clearInterval(progressInterval);
    updateLoadingText('Ready! (Some features may be limited)');
    progressFill.style.width = '100%';
    
    setTimeout(() => {
      loadingScreen.classList.add('fade-out');
      setTimeout(() => {
        initDashboard();
        loadingScreen.style.display = 'none';
      }, 800);
    }, 1000);
  }
}

function updateLoadingText(text) {
  const subtitle = document.querySelector('.loader-subtitle');
  if (subtitle) subtitle.textContent = text;
}

// =============================================
// Gemini API Key Management
// =============================================

function initializeGemini() {
  // Check for API key in multiple places
  let apiKey = null;
  
  // 1. Check URL params (for easy demo sharing)
  const urlParams = new URLSearchParams(window.location.search);
  apiKey = urlParams.get('key');
  
  // 2. (Removed: no longer persist API keys in browser storage for security)
  
  // 3. Check environment variable (Vite)
  if (!apiKey) {
    apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  }
  
  if (apiKey) {
    const success = initGemini(apiKey);
    if (success) {
      console.log('✅ Gemini AI initialized successfully');
    }
  } else {
    console.log('ℹ️ No Gemini API key found. Using fallback responses.');
    console.log('To enable AI: add VITE_GEMINI_API_KEY to .env or add ?key=YOUR_KEY to URL');
    showApiKeyPrompt();
  }
}

function showApiKeyPrompt() {
  // Add a subtle prompt to the chat panel welcome message
  const messagesContainer = document.getElementById('chat-messages');
  if (!messagesContainer) return;
  
  // Add API key setup message at the end of chat
  const setupMsg = document.createElement('div');
  setupMsg.className = 'chat-message ai';
  setupMsg.innerHTML = `
    <div class="message-avatar">⚙️</div>
    <div class="message-content">
      <p><strong>Pro tip:</strong> Connect your Google Gemini API key for personalized AI-powered insights!</p>
      <div style="display: flex; gap: 8px; margin-top: 10px;">
        <input type="password" id="api-key-input" placeholder="Paste your Gemini API key" 
          style="flex:1; padding: 8px 12px; border: 1px solid var(--border-subtle); 
          background: var(--bg-card); color: var(--text-primary); border-radius: 8px; 
          font-family: var(--font-body); font-size: 12px; outline: none;" />
        <button id="api-key-save" 
          style="padding: 8px 16px; border: none; background: linear-gradient(135deg, var(--accent-green), var(--accent-teal)); 
          color: white; border-radius: 8px; cursor: pointer; font-size: 12px; font-weight: 600; 
          font-family: var(--font-body); white-space: nowrap;">
          Connect
        </button>
      </div>
      <p style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">
        Get a free key at <a href="https://aistudio.google.com/apikey" target="_blank" 
        style="color: var(--accent-teal);">Google AI Studio</a>. Your key stays in your browser.
      </p>
    </div>
  `;
  messagesContainer.appendChild(setupMsg);
  
  // Handle save
  setTimeout(() => {
    const saveBtn = document.getElementById('api-key-save');
    const keyInput = document.getElementById('api-key-input');
    
    if (saveBtn && keyInput) {
      saveBtn.addEventListener('click', () => {
        const key = keyInput.value.trim();
        if (key) {
          // Do not persist API keys in browser storage (security)
          const success = initGemini(key);
          if (success) {
            setupMsg.innerHTML = `
              <div class="message-avatar">✅</div>
              <div class="message-content">
                <p><strong>Gemini AI connected!</strong> Now ask me anything about our planet. 🌍</p>
              </div>
            `;
          }
        }
      });
      
      keyInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') saveBtn.click();
      });
    }
  }, 100);
}

// =============================================
// Navigation & Layer Switching
// =============================================

function setupNavigation() {
  const navBtns = document.querySelectorAll('.nav-btn');
  
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      navBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Switch globe layer
      const layer = btn.dataset.layer;
      setLayer(layer);
      highlightStat(layer);
    });
  });
  
  // Set initial stat highlight
  highlightStat('emissions');
}

// =============================================
// Hotspot Interaction
// =============================================

let tooltipVisible = false;
let currentHotspot = null;

function setupTooltip() {
  const tooltip = document.getElementById('region-tooltip');
  const askBtn = document.getElementById('tooltip-ask-btn');
  
  // Close tooltip when clicking elsewhere
  document.addEventListener('click', (e) => {
    if (tooltipVisible && !tooltip.contains(e.target)) {
      hideTooltip();
    }
  });
  
  // Ask Gemini about this region
  if (askBtn) {
    askBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (currentHotspot) {
        askAboutHotspot(currentHotspot);
        hideTooltip();
      }
    });
  }
}

function handleHotspotClick(hotspot, screenPos) {
  currentHotspot = hotspot;
  showTooltip(hotspot, screenPos);
  
  // Focus camera on the hotspot
  focusOnCoordinates(hotspot.lat, hotspot.lng);
}

function showTooltip(hotspot, screenPos) {
  const tooltip = document.getElementById('region-tooltip');
  const flag = document.getElementById('tooltip-flag');
  const name = document.getElementById('tooltip-name');
  const stats = document.getElementById('tooltip-stats');
  
  // Populate
  flag.textContent = hotspot.flag;
  name.textContent = hotspot.name;
  
  // Build stats rows
  const dataEntries = Object.entries(hotspot.data).filter(([_, val]) => val.label);
  stats.innerHTML = dataEntries.map(([_, val]) => {
    const severityClass = typeof val.value === 'number' ? 
      (val.value > 5 ? 'high' : val.value > 2 ? 'medium' : 'low') : '';
    return `
      <div class="tooltip-stat-row">
        <span class="tooltip-stat-label">${val.label}</span>
        <span class="tooltip-stat-value ${severityClass}">${val.value} ${val.unit}</span>
      </div>
    `;
  }).join('');
  
  // Position tooltip
  const tooltipWidth = 300;
  const tooltipHeight = 250;
  let x = screenPos.x + 20;
  let y = screenPos.y - 20;
  
  // Keep on screen
  if (x + tooltipWidth > window.innerWidth) x = screenPos.x - tooltipWidth - 20;
  if (y + tooltipHeight > window.innerHeight) y = window.innerHeight - tooltipHeight - 20;
  if (y < 80) y = 80;
  
  tooltip.style.left = x + 'px';
  tooltip.style.top = y + 'px';
  tooltip.classList.remove('hidden');
  
  // Trigger animation
  requestAnimationFrame(() => {
    tooltip.classList.add('visible');
  });
  
  tooltipVisible = true;
}

function hideTooltip() {
  const tooltip = document.getElementById('region-tooltip');
  tooltip.classList.remove('visible');
  setTimeout(() => {
    tooltip.classList.add('hidden');
  }, 300);
  tooltipVisible = false;
}

// =============================================
// Boot
// =============================================

document.addEventListener('DOMContentLoaded', initApp);
