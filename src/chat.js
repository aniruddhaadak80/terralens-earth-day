/**
 * TerraLens — Chat Panel Module
 * Handles chat UI interactions and message rendering
 */

import { sendMessage, askAboutRegion, generatePledge, isReady } from './gemini.js';

let chatPanel, chatMessages, chatInput, chatSendBtn, chatCloseBtn;
let aiToggleBtn;
let isOpen = false;
let isSending = false;

export function initChat() {
  chatPanel = document.getElementById('chat-panel');
  chatMessages = document.getElementById('chat-messages');
  chatInput = document.getElementById('chat-input');
  chatSendBtn = document.getElementById('chat-send-btn');
  chatCloseBtn = document.getElementById('chat-close-btn');
  aiToggleBtn = document.getElementById('ai-toggle-btn');

  // Toggle chat panel
  aiToggleBtn.addEventListener('click', toggleChat);
  chatCloseBtn.addEventListener('click', closeChat);

  // Send message
  chatSendBtn.addEventListener('click', handleSend);
  chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  });

  // Suggestion chips
  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const question = chip.dataset.question;
      if (question) {
        chatInput.value = question;
        handleSend();
      }
    });
  });

  // Pledge modal
  const pledgeClose = document.getElementById('pledge-close');
  const pledgeShare = document.getElementById('pledge-share');
  
  if (pledgeClose) {
    pledgeClose.addEventListener('click', () => {
      const modal = document.getElementById('pledge-modal');
      modal.classList.remove('visible');
      modal.classList.add('hidden');
    });
  }
  
  if (pledgeShare) {
    pledgeShare.addEventListener('click', () => {
      const pledgeText = document.getElementById('pledge-body').innerText;
      if (navigator.share) {
        navigator.share({
          title: 'My Earth Day Pledge — TerraLens',
          text: pledgeText,
          url: window.location.href,
        }).catch(() => {});
      } else {
        navigator.clipboard.writeText(`🌍 My Earth Day Pledge\n\n${pledgeText}\n\nMade with TerraLens — ${window.location.href}`);
        pledgeShare.textContent = 'Copied to Clipboard! ✅';
        setTimeout(() => { pledgeShare.textContent = 'Share My Pledge 🚀'; }, 2000);
      }
    });
  }
}

export function toggleChat() {
  isOpen = !isOpen;
  if (isOpen) {
    chatPanel.classList.remove('hidden');
    chatPanel.classList.add('visible');
    aiToggleBtn.classList.add('active');
    chatInput.focus();
  } else {
    chatPanel.classList.remove('visible');
    chatPanel.classList.add('hidden');
    aiToggleBtn.classList.remove('active');
  }
}

export function openChat() {
  if (!isOpen) {
    isOpen = true;
    chatPanel.classList.remove('hidden');
    chatPanel.classList.add('visible');
    aiToggleBtn.classList.add('active');
    chatInput.focus();
  }
}

export function closeChat() {
  isOpen = false;
  chatPanel.classList.remove('visible');
  chatPanel.classList.add('hidden');
  aiToggleBtn.classList.remove('active');
}

async function handleSend() {
  const message = chatInput.value.trim();
  if (!message || isSending) return;
  
  // Add user message
  addMessage(message, 'user');
  chatInput.value = '';
  
  // Show typing indicator
  const typingEl = addTypingIndicator();
  isSending = true;
  chatSendBtn.disabled = true;
  
  try {
    let response;
    
    // Check if user is asking for a pledge
    if (message.toLowerCase().includes('pledge')) {
      response = await generatePledge();
      // Also show in pledge modal
      setTimeout(() => {
        showPledgeModal(response);
      }, 500);
    } else {
      response = await sendMessage(message);
    }
    
    // Remove typing indicator
    typingEl.remove();
    
    // Add AI response
    addMessage(response, 'ai', true);
  } catch (error) {
    console.error('Chat error:', error);
    typingEl.remove();
    addMessage('<p>Sorry, I encountered an error. Please try again! 🌍</p>', 'ai', true);
  }
  
  isSending = false;
  chatSendBtn.disabled = false;
}

export async function askAboutHotspot(hotspot) {
  openChat();
  
  // Add context message
  addMessage(`Tell me about ${hotspot.name} ${hotspot.flag}`, 'user');
  
  // Show typing
  const typingEl = addTypingIndicator();
  isSending = true;
  
  try {
    const response = await askAboutRegion(hotspot);
    typingEl.remove();
    addMessage(response, 'ai', true);
  } catch (error) {
    console.error('Region chat error:', error);
    typingEl.remove();
    
    // Fallback with hotspot data
    const dataHtml = Object.entries(hotspot.data)
      .filter(([_, val]) => val.label)
      .map(([_, val]) => `<li><strong>${val.label}:</strong> ${val.value} ${val.unit}</li>`)
      .join('');
    
    addMessage(`<p>${hotspot.flag} <strong>${hotspot.name}</strong></p><p>${hotspot.description}</p><ul>${dataHtml}</ul>`, 'ai', true);
  }
  
  isSending = false;
}

function addMessage(content, type, isHtml = false) {
  const messageEl = document.createElement('div');
  messageEl.className = `chat-message ${type}`;
  
  const avatarEl = document.createElement('div');
  avatarEl.className = 'message-avatar';
  avatarEl.textContent = type === 'user' ? '👤' : '🌍';
  
  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';
  
  if (isHtml) {
    contentEl.innerHTML = content;
  } else {
    const p = document.createElement('p');
    p.textContent = content;
    contentEl.appendChild(p);
  }
  
  messageEl.appendChild(avatarEl);
  messageEl.appendChild(contentEl);
  chatMessages.appendChild(messageEl);
  
  // Scroll to bottom
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return messageEl;
}

function addTypingIndicator() {
  const messageEl = document.createElement('div');
  messageEl.className = 'chat-message ai';
  
  const avatarEl = document.createElement('div');
  avatarEl.className = 'message-avatar';
  avatarEl.textContent = '🌍';
  
  const contentEl = document.createElement('div');
  contentEl.className = 'message-content';
  contentEl.innerHTML = '<div class="typing-indicator"><span></span><span></span><span></span></div>';
  
  messageEl.appendChild(avatarEl);
  messageEl.appendChild(contentEl);
  chatMessages.appendChild(messageEl);
  
  chatMessages.scrollTop = chatMessages.scrollHeight;
  
  return messageEl;
}

function showPledgeModal(content) {
  const modal = document.getElementById('pledge-modal');
  const body = document.getElementById('pledge-body');
  
  body.innerHTML = content;
  modal.classList.remove('hidden');
  modal.classList.add('visible');
}
