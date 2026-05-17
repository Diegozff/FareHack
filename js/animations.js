/* ═══════════════════════════════════════════════════════
   animations.js — Simulación de IA en pantalla de carga
═══════════════════════════════════════════════════════ */

// ─── Secuencia de mensajes de la IA ─────────────────
const AI_MESSAGES = [
  { text: 'Inicializando agentes de IA...',                        delay: 0    },
  { text: 'Leyendo metadatos del documento adjunto...',            delay: 1600 },
  { text: 'Extrayendo campos: PNR, ruta y precio...',              delay: 3200 },
  { text: 'Validando políticas de cancelación flexible...',        delay: 4800 },
  { text: 'Verificando ventanas de reembolso disponibles...',      delay: 6200 },
  { text: 'Conectando con nodos de distribución global (GDS)...',  delay: 7800 },
  { text: 'GDS Amadeus → Online ✓',                                delay: 9200 },
  { text: 'GDS Sabre → Online ✓',                                  delay: 10400},
  { text: 'GDS Travelport → Online ✓',                             delay: 11400},
  { text: 'Calibrando modelo de predicción de precios...',         delay: 12600},
  { text: 'Indexando tarifas históricas de los últimos 90 días...', delay: 14000},
  { text: 'Conexión exitosa. Monitoreo 24/7 activado ✓',           delay: 15400},
];

// ─── Pasos de progreso ────────────────────────────────
const PROGRESS_STEPS = [
  // [barId, pctId, targetWidth, startDelay]
  ['prog1', 'prog1-pct', 100, 800 ],
  ['prog2', 'prog2-pct', 100, 5000],
  ['prog3', 'prog3-pct', 100, 9000],
  ['prog4', 'prog4-pct', 100, 13000],
];

// ─── Log entries de la terminal ──────────────────────
const LOG_LINES = [
  { text: 'Loading OCR pipeline v3.2.1...',        delay: 800  },
  { text: 'Document fingerprint: OK',               delay: 2400 },
  { text: 'PNR extracted successfully',             delay: 3800 },
  { text: 'Cancellation policy: FLEXIBLE ✓',       delay: 5400 },
  { text: 'Connecting to Amadeus API...',           delay: 7800 },
  { text: 'Amadeus: 200 OK',                        delay: 9000 },
  { text: 'Sabre: 200 OK',                          delay: 10200},
  { text: 'Travelport: 200 OK',                     delay: 11000},
  { text: 'Price monitor agent: ACTIVE',            delay: 13200},
  { text: 'Alert threshold: 5% below current fare', delay: 14000},
  { text: '>>> Monitoring session started <<<',     delay: 15600},
];

// ─── Función principal ────────────────────────────────
function startLoadingAnimation(formData) {
  const statusEl = document.getElementById('loading-status');
  const logEl    = document.getElementById('activity-log');

  // Resetear log
  if (logEl) {
    logEl.innerHTML = '<div class="text-brand-500">$ farehack-agent --init</div>';
  }

  // Resetear barras
  PROGRESS_STEPS.forEach(([barId, pctId]) => {
    const bar = document.getElementById(barId);
    const pct = document.getElementById(pctId);
    if (bar) bar.style.width = '0%';
    if (pct) pct.textContent = '0%';
  });

  // Disparar mensajes de estado
  AI_MESSAGES.forEach(({ text, delay }) => {
    setTimeout(() => {
      if (statusEl) {
        statusEl.style.opacity = '0';
        setTimeout(() => {
          statusEl.textContent = text;
          statusEl.style.opacity = '1';
          statusEl.style.transition = 'opacity 0.4s';
        }, 200);
      }
    }, delay);
  });

  // Animar barras de progreso
  PROGRESS_STEPS.forEach(([barId, pctId, target, startDelay]) => {
    animateBar(barId, pctId, target, startDelay);
  });

  // Agregar líneas al log
  LOG_LINES.forEach(({ text, delay }) => {
    setTimeout(() => appendLogLine(logEl, text), delay);
  });

  // Redirigir al dashboard cuando termina
  setTimeout(() => {
    populateDashboard(formData || window.FH.formData || {});
    showView('dashboard');
  }, 16500);
}

// ─── Animar una barra de progreso ────────────────────
function animateBar(barId, pctId, target, startDelay) {
  const bar = document.getElementById(barId);
  const pct = document.getElementById(pctId);
  if (!bar || !pct) return;

  const duration = 2000;
  const fps      = 30;
  const steps    = (duration / 1000) * fps;
  const increment = target / steps;
  let current = 0;

  setTimeout(() => {
    const interval = setInterval(() => {
      current = Math.min(current + increment, target);
      bar.style.width = `${current}%`;
      pct.textContent = `${Math.round(current)}%`;
      if (current >= target) clearInterval(interval);
    }, 1000 / fps);
  }, startDelay);
}

// ─── Agregar línea al log de terminal ────────────────
function appendLogLine(container, text) {
  if (!container) return;
  const line = document.createElement('div');
  line.className = 'log-line text-brand-500/60';
  line.textContent = `> ${text}`;
  container.appendChild(line);

  // Auto-scroll al fondo
  container.scrollTop = container.scrollHeight;
}
