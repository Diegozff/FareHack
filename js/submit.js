/* ═══════════════════════════════════════════════════════
   submit.js — Captura de alertas de precio (Mago de Oz)

   Flujo:
   1. Recolecta todos los campos
   2. Guarda en localStorage
   3. POST al webhook de Make.com (form-urlencoded para evitar CORS)
   4. Activa animación de IA
   5. Redirige al dashboard de confirmación
═══════════════════════════════════════════════════════ */

const WEBHOOK_URL = 'https://hook.us2.make.com/q3rmgymk18kejjrtvpgb86johio5c6az';

// ─── Handler del submit ───────────────────────────────
async function handleFormSubmit(event) {
  event.preventDefault();
  if (!validateStep(3)) return;

  const btn = document.getElementById('submit-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg> Activando...`;
  }

  const data = collectFormData();
  window.FH.formData = data;

  saveToLocalStorage(data);
  sendToWebhook(data).catch(err => console.warn('[FareHack] Webhook:', err));

  showView('loading');
  startLoadingAnimation(data);
}

// ─── Recolectar datos del formulario ─────────────────
function collectFormData() {
  const tripType    = document.querySelector('input[name="trip-type"]:checked')?.value || 'ida_vuelta';
  const flexibility = document.querySelector('input[name="flexibility"]:checked')?.value || 'exactas';

  const data = {
    // Contacto
    name:        document.getElementById('field-name')?.value.trim()  || '',
    email:       document.getElementById('field-email')?.value.trim() || '',
    phone:       document.getElementById('field-phone')?.value.trim() || '',
    // Vuelo
    tripType,
    origin:      document.getElementById('field-origin')?.value.trim()      || '',
    destination: document.getElementById('field-destination')?.value.trim() || '',
    departure:   document.getElementById('field-departure')?.value  || '',
    returnDate:  document.getElementById('field-return')?.value     || '',
    passengers:  document.getElementById('field-passengers')?.value || '1',
    flightClass: document.getElementById('field-class')?.value      || 'economy',
    airlines:    document.getElementById('field-airlines')?.value.trim() || 'cualquiera',
    // Precio objetivo
    maxPrice:    document.getElementById('field-max-price')?.value || '',
    flexibility,
    // Metadata
    submittedAt: new Date().toISOString(),
    alertId:     generateAlertId(),
  };

  // Resumen legible para Diego
  const classLabels = { economy: 'Economy', premium_economy: 'Premium Economy', business: 'Business', primera: 'Primera Clase' };
  const flexLabels  = { exactas: 'Fechas exactas', '±3_dias': '± 3 días', '±7_dias': '± 7 días', mes_completo: 'Mes completo' };

  data._resumen = `
🛫 NUEVA ALERTA — FareHack
──────────────────────────
👤 ${data.name} · ${data.email} · ${data.phone}
──────────────────────────
✈️  Ruta:        ${data.origin} → ${data.destination}
📅 Salida:      ${data.departure}${data.returnDate ? `\n📅 Vuelta:      ${data.returnDate}` : ' (solo ida)'}
👥 Pasajeros:   ${data.passengers}
💺 Clase:       ${classLabels[data.flightClass] || data.flightClass}
🏷️  Aerolíneas: ${data.airlines}
📆 Flexibil.:   ${flexLabels[data.flexibility] || data.flexibility}
──────────────────────────
💰 PRECIO OBJETIVO: USD ${data.maxPrice} por persona
🆔 Alert ID: ${data.alertId}
──────────────────────────
→ Buscá en Google Flights y avisale cuando el precio llegue.
  `.trim();

  return data;
}

// ─── LocalStorage ─────────────────────────────────────
function saveToLocalStorage(data) {
  const existing = JSON.parse(localStorage.getItem('farehack_alerts') || '[]');
  existing.push(data);
  localStorage.setItem('farehack_alerts', JSON.stringify(existing));
  localStorage.setItem('farehack_current_alert', JSON.stringify(data));
  console.info('[FareHack] Alerta guardada →', data.alertId);
}

// ─── Webhook ──────────────────────────────────────────
async function sendToWebhook(data) {
  if (!WEBHOOK_URL) return;
  const formBody = new URLSearchParams();
  Object.entries(data).forEach(([k, v]) => formBody.append(k, String(v)));

  await fetch(WEBHOOK_URL, {
    method:  'POST',
    mode:    'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    formBody.toString(),
  });
  console.info('[FareHack] Webhook enviado →', data.alertId);
}

// ─── Helper ───────────────────────────────────────────
function generateAlertId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'FH-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
