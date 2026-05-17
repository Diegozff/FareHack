/* ═══════════════════════════════════════════════════════
   submit.js — Captura de datos y envío (Mago de Oz)

   Flujo:
   1. Recolecta todos los campos del form
   2. Guarda en localStorage (persistencia local)
   3. Dispara POST al webhook configurado (Make/Zapier/n8n)
   4. Activa la pantalla de carga con animación de IA
   5. Redirige al dashboard poblado con los datos
═══════════════════════════════════════════════════════ */

// ─── Configuración del webhook ───────────────────────
// Reemplazá WEBHOOK_URL con tu URL de Make.com, Zapier o n8n.
// Si está vacío, los datos se guardan solo en localStorage.
const WEBHOOK_URL = 'https://hook.us2.make.com/q3rmgymk18kejjrtvpgb86johio5c6az';

// ─── Handler principal del formulario ────────────────
async function handleFormSubmit(event) {
  event.preventDefault();

  // Validar el último paso antes de enviar
  const terms = document.getElementById('field-terms');
  if (!terms?.checked) {
    showFormError('Necesitás aceptar los términos para continuar.');
    return;
  }

  // Recolectar todos los datos
  const data = collectFormData();
  window.FH.formData = data;

  // Deshabilitar botón de envío
  const btn = document.getElementById('submit-btn');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `
      <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
      </svg>
      Enviando...
    `;
  }

  try {
    // 1. Guardar en localStorage
    saveToLocalStorage(data);

    // 2. Enviar al webhook (no bloqueante — la UX continúa igual)
    sendToWebhook(data).catch(err => console.warn('[FareHack] Webhook no disponible:', err));

    // 3. Activar pantalla de carga
    showView('loading');
    startLoadingAnimation(data);

  } catch (err) {
    console.error('[FareHack] Error al procesar:', err);
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = `
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 10V3L4 14h7v7l9-11h-7z"/>
        </svg>
        Activar monitoreo de IA
      `;
    }
    showFormError('Ocurrió un error. Intentá de nuevo.');
  }
}

// ─── Recolectar datos del formulario ─────────────────
function collectFormData() {
  const typeInput = document.querySelector('input[name="reservation-type"]:checked');
  const file = document.getElementById('file-input')?.files[0];

  return {
    // Contacto
    name:        document.getElementById('field-name')?.value.trim()  || '',
    email:       document.getElementById('field-email')?.value.trim() || '',
    phone:       document.getElementById('field-phone')?.value.trim() || '',

    // Reserva
    type:        typeInput?.value || '',
    pnr:         document.getElementById('field-pnr')?.value.trim().toUpperCase() || '',
    provider:    document.getElementById('field-provider')?.value.trim() || '',
    route:       document.getElementById('field-route')?.value.trim() || '',
    travelDate:  document.getElementById('field-travel-date')?.value || '',
    price:       document.getElementById('field-price')?.value || '',
    cancelDate:  document.getElementById('field-cancel-date')?.value || '',
    notes:       document.getElementById('field-notes')?.value.trim() || '',

    // Archivo
    fileName:    file?.name || '(sin adjunto)',
    fileSize:    file ? formatFileSize(file.size) : '',

    // Metadata
    submittedAt: new Date().toISOString(),
    leadId:      generateLeadId(),
  };
}

// ─── Guardar en localStorage ──────────────────────────
function saveToLocalStorage(data) {
  const existing = JSON.parse(localStorage.getItem('farehack_leads') || '[]');
  existing.push(data);
  localStorage.setItem('farehack_leads', JSON.stringify(existing));
  localStorage.setItem('farehack_current_lead', JSON.stringify(data));
  console.info('[FareHack] Lead guardado →', data.leadId, data);
}

// ─── Envío al webhook ────────────────────────────────
async function sendToWebhook(data) {
  if (!WEBHOOK_URL) return;

  const payload = {
    ...data,
    // Campos formateados para lectura humana
    _resumen: `
🛫 NUEVO LEAD — FareHack
──────────────────────────
👤 Contacto:   ${data.name} <${data.email}>${data.phone ? ` · ${data.phone}` : ''}
🎫 Tipo:       ${data.type.toUpperCase()}
🔑 PNR:        ${data.pnr}
🏷️  Proveedor: ${data.provider}
🗺️  Ruta:      ${data.route}
📅 Viaje:      ${data.travelDate}
💵 Precio:     USD ${data.price}
⏰ Cancela:    ${data.cancelDate}
📎 Archivo:    ${data.fileName}
📝 Notas:      ${data.notes || 'ninguna'}
🆔 Lead ID:    ${data.leadId}
──────────────────────────
Acción: Buscar en Google Flights / Booking y hacer swap si corresponde.
    `.trim(),
  };

  const res = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(`Webhook respondió ${res.status}`);
  console.info('[FareHack] Webhook OK →', res.status);
}

// ─── Helpers ─────────────────────────────────────────
function generateLeadId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return 'FH-' + Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
