/**
 * TerraLens — Dashboard Module
 * Animated environmental statistics dashboard
 */

export function initDashboard() {
  // Animate stat counters on load
  animateCounters();
}

function animateCounters() {
  const statValues = document.querySelectorAll('.stat-value');
  
  statValues.forEach((el) => {
    const target = parseFloat(el.dataset.target);
    if (isNaN(target)) return;
    
    const duration = 2000;
    const startTime = performance.now();
    const isDecimal = target % 1 !== 0;
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      
      const current = target * eased;
      
      if (isDecimal) {
        el.textContent = current.toFixed(1);
      } else {
        el.textContent = Math.round(current).toLocaleString();
      }
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        // Set final value exactly
        if (isDecimal) {
          el.textContent = target.toFixed(1);
        } else {
          el.textContent = target.toLocaleString();
        }
      }
    }
    
    // Start with a delay for stagger effect
    const delay = Array.from(statValues).indexOf(el) * 200;
    setTimeout(() => {
      requestAnimationFrame(update);
    }, delay);
  });
}

/**
 * Highlight a specific stat card based on the active layer
 */
export function highlightStat(layer) {
  const cards = document.querySelectorAll('.stat-card');
  cards.forEach(card => {
    card.style.borderColor = '';
    card.style.boxShadow = '';
  });
  
  const layerStatMap = {
    emissions: 'stat-co2',
    deforestation: 'stat-forest',
    ocean: 'stat-temp',
    biodiversity: 'stat-species'
  };
  
  const targetId = layerStatMap[layer];
  if (targetId) {
    const card = document.getElementById(targetId);
    if (card) {
      const colorMap = {
        emissions: 'rgba(239, 68, 68, 0.4)',
        deforestation: 'rgba(34, 197, 94, 0.4)',
        ocean: 'rgba(6, 182, 212, 0.4)',
        biodiversity: 'rgba(168, 85, 247, 0.4)'
      };
      card.style.borderColor = colorMap[layer] || '';
      card.style.boxShadow = `0 0 20px ${colorMap[layer] || 'transparent'}`;
    }
  }
}
