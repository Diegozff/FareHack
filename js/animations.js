/* ═══════════════════════════════════════════════════════
   animations.js — Simulación IA para alerta de precios
═══════════════════════════════════════════════════════ */

const AI_MESSAGES = [
  { text: 'Inicializando agentes de monitoreo...',              delay: 0     },
  { text: 'Indexando rutas disponibles para tu búsqueda...',    delay: 1600  },
  { text: 'Analizando historial de precios (90 días)...',       delay: 3200  },
  { text: 'Detectando patrones de precio estacionales...',      delay: 4800  },
  { text: 'Conectando con LATAM Airlines... ✓',                 delay: 6200  },
  { text: 'Conectando con Aerolíneas Argentinas... ✓',          delay: 7400  },
  { text: 'Conectando con American, United, Copa... ✓',         delay: 8600  },
  { text: 'Escaneando tarifas en Despegar, Kayak, Expedia...',  delay: 9800  },
  { text: 'Calibrando umbral de alerta de precio...',           delay: 11200 },
  { text: 'Configurando notificaciones por mail y WhatsApp...', delay: 12800 },
  { text: '¡Alerta activada! Monitoreando 24/7 ✓',             delay: 14400 },
];

const PROGRESS_STEPS = [
  ['prog1', 'prog1-pct', 100, 600  ],
  ['prog2', 'prog2-pct', 100, 4400 ],
  ['prog3', 'prog3-pct', 100, 8200 ],
  ['prog4', 'prog4-pct', 100, 12600],
];

const LOG_LINES = [
  { text: 'Loading price-monitor v4.1.0...',         delay: 600   },
  { text: 'Route indexed: OK',                        delay: 2200  },
  { text: 'Historical data: 90 days loaded',          delay: 3800  },
  { text: 'Seasonal patterns: analyzed',              delay: 5200  },
  { text: 'LATAM API: 200 OK',                        delay: 6400  },
  { text: 'AA/UA/CM API: 200 OK',                     delay: 8000  },
  { text: 'OTA connectors: online',                   delay: 9600  },
  { text: `Alert threshold: USD ${getTargetPrice()}`, delay: 11400 },
  { text: 'Notification channels: email + whatsapp',  delay: 13000 },
  { text: '>>> Price alert ACTIVE <<<',               delay: 14600 },
];

function getTargetPrice() {
  return document.getElementById('field-max-price')?.value || '—';
}

function startLoadingAnimation(formData) {
  const statusEl = document.getElementById('loading-status');
  const logEl    = document.getElementById('activity-log');

  if (logEl) logEl.innerHTML = '<div class="text-brand-500">$ farehack-monitor --init</div>';

  PROGRESS_STEPS.forEach(([barId, pctId]) => {
    const bar = document.getElementById(barId);
    const pct = document.getElementById(pctId);
    if (bar) bar.style.width = '0%';
    if (pct) pct.textContent = '0%';
  });

  AI_MESSAGES.forEach(({ text, delay }) => {
    setTimeout(() => {
      if (!statusEl) return;
      statusEl.style.opacity = '0';
      setTimeout(() => {
        statusEl.textContent = text;
        statusEl.style.opacity = '1';
        statusEl.style.transition = 'opacity 0.4s';
      }, 200);
    }, delay);
  });

  PROGRESS_STEPS.forEach(([barId, pctId, target, startDelay]) => {
    animateBar(barId, pctId, target, startDelay);
  });

  LOG_LINES.forEach(({ text, delay }) => {
    setTimeout(() => appendLogLine(logEl, text), delay);
  });

  setTimeout(() => {
    populateDashboard(formData || window.FH.formData || {});
    showView('dashboard');
  }, 15600);
}

function animateBar(barId, pctId, target, startDelay) {
  const bar = document.getElementById(barId);
  const pct = document.getElementById(pctId);
  if (!bar || !pct) return;
  const steps = 60, increment = target / steps;
  let current = 0;
  setTimeout(() => {
    const iv = setInterval(() => {
      current = Math.min(current + increment, target);
      bar.style.width = `${current}%`;
      pct.textContent = `${Math.round(current)}%`;
      if (current >= target) clearInterval(iv);
    }, 1000 / 30);
  }, startDelay);
}

function appendLogLine(container, text) {
  if (!container) return;
  const line = document.createElement('div');
  line.className = 'log-line text-brand-500/60';
  line.textContent = `> ${text}`;
  container.appendChild(line);
  container.scrollTop = container.scrollHeight;
}
