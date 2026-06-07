/* ═══════════════════════════════════════════════════════
   app.js — Router y lógica de FareHack (v2 — Price Alerts)
═══════════════════════════════════════════════════════ */

window.FH = { currentView: 'home', currentStep: 1, formData: {} };

// ─── Router ───────────────────────────────────────────
function showView(name) {
  ['home', 'register', 'loading', 'dashboard'].forEach(v => {
    const el = document.getElementById(`view-${v}`);
    if (!el) return;
    if (v === name) {
      el.classList.remove('hidden');
      el.classList.add('view-enter');
      setTimeout(() => el.classList.remove('view-enter'), 400);
    } else {
      el.classList.add('hidden');
    }
  });
  window.FH.currentView = name;
  window.scrollTo(0, 0);
  if (name === 'register') resetForm();
}

// ─── Navegación entre pasos ───────────────────────────
function goToStep(n) {
  const cur = window.FH.currentStep;
  if (n > cur && !validateStep(cur)) return;
  document.getElementById(`form-step-${cur}`).classList.add('hidden');
  document.getElementById(`form-step-${n}`).classList.remove('hidden');
  window.FH.currentStep = n;
  updateProgressBar(n);
}

function updateProgressBar(step) {
  ['progress-step1', 'progress-step2', 'progress-step3'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (i < step) {
      el.classList.remove('bg-white/10'); el.classList.add('bg-brand-500');
    } else {
      el.classList.remove('bg-brand-500'); el.classList.add('bg-white/10');
    }
  });
  const lbl = document.getElementById('step-label');
  if (lbl) lbl.textContent = `${step} / 3`;
}

// ─── Validación ───────────────────────────────────────
function validateStep(step) {
  const errors = [];
  if (step === 1) {
    const name  = document.getElementById('field-name')?.value.trim();
    const email = document.getElementById('field-email')?.value.trim();
    const phone = document.getElementById('field-phone')?.value.trim();
    if (!name)  errors.push('Ingresá tu nombre completo');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Ingresá un email válido');
    if (!phone) errors.push('Ingresá tu número de WhatsApp');
  }
  if (step === 2) {
    const origin = document.getElementById('field-origin')?.value.trim();
    const dest   = document.getElementById('field-destination')?.value.trim();
    const dep    = document.getElementById('field-departure')?.value;
    const tripType = document.querySelector('input[name="trip-type"]:checked')?.value;
    const ret    = document.getElementById('field-return')?.value;
    if (!origin) errors.push('Ingresá el origen');
    if (!dest)   errors.push('Ingresá el destino');
    if (!dep)    errors.push('Seleccioná la fecha de salida');
    if (tripType === 'ida_vuelta' && !ret) errors.push('Seleccioná la fecha de vuelta');
  }
  if (step === 3) {
    const price = document.getElementById('field-max-price')?.value;
    const terms = document.getElementById('field-terms')?.checked;
    if (!price || Number(price) <= 0) errors.push('Ingresá tu precio objetivo');
    if (!terms) errors.push('Aceptá los términos para continuar');
  }
  if (errors.length) { showFormError(errors[0]); return false; }
  hideFormError();
  return true;
}

function showFormError(msg) {
  const el = document.getElementById('form-error');
  if (!el) return;
  el.textContent = msg;
  el.classList.remove('hidden');
  setTimeout(() => el.classList.add('hidden'), 4000);
}
function hideFormError() {
  document.getElementById('form-error')?.classList.add('hidden');
}

// ─── Selector de tipo de viaje ────────────────────────
function selectType(radio) {
  document.querySelectorAll('.type-option').forEach(el => {
    el.style.borderColor = ''; el.style.background = '';
  });
  const opt = radio.closest('.type-btn').querySelector('.type-option');
  if (opt) {
    opt.style.borderColor = 'rgba(0,229,102,0.5)';
    opt.style.background  = 'rgba(0,229,102,0.08)';
  }
}

function toggleReturnDate(show) {
  const wrapper = document.getElementById('return-date-wrapper');
  if (!wrapper) return;
  if (show) {
    wrapper.classList.remove('hidden');
  } else {
    wrapper.classList.add('hidden');
    document.getElementById('field-return').value = '';
  }
}

// ─── Reset ────────────────────────────────────────────
function resetForm() {
  document.getElementById('reservation-form')?.reset();
  window.FH.currentStep = 1;
  window.FH.formData = {};
  ['form-step-1','form-step-2','form-step-3'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) i === 0 ? el.classList.remove('hidden') : el.classList.add('hidden');
  });
  updateProgressBar(1);
  document.getElementById('return-date-wrapper')?.classList.remove('hidden');
  // Resetear tipo de viaje visual
  document.querySelectorAll('.type-option').forEach(el => {
    el.style.borderColor = ''; el.style.background = '';
  });
  // Marcar "ida y vuelta" por defecto
  const defaultType = document.querySelector('.type-option');
  if (defaultType) {
    defaultType.style.borderColor = 'rgba(0,229,102,0.5)';
    defaultType.style.background  = 'rgba(0,229,102,0.08)';
  }
  hideFormError();
}

// ─── Poblar dashboard de confirmación ────────────────
function populateDashboard(data) {
  const set = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };

  const firstName = data.name ? data.name.trim().split(' ')[0] : 'viajero';
  const route     = `${data.origin || '—'} → ${data.destination || '—'}`;

  set('dash-user-name',    firstName);
  set('dash-email-confirm', data.email || '');
  set('dash-route',        route);
  set('dash-route-detail', route);
  set('alert-id',          data.alertId || '—');

  const tripLabels = { 'ida_vuelta': 'Ida y vuelta', 'ida': 'Solo ida' };
  set('dash-trip-type', tripLabels[data.tripType] || '—');

  const classLabels = { economy: 'Economy', premium_economy: 'Premium Economy', business: 'Business', primera: 'Primera clase' };
  set('dash-pax-class', `${data.passengers || 1} pax · ${classLabels[data.flightClass] || 'Economy'}`);

  const flexLabels = { exactas: 'Fechas exactas', '±3_dias': '± 3 días', '±7_dias': '± 7 días', mes_completo: 'Mes completo' };
  set('dash-flexibility', flexLabels[data.flexibility] || 'Exactas');

  if (data.maxPrice) set('dash-target-price', `USD ${Number(data.maxPrice).toFixed(0)}`);

  if (data.departure) {
    const d = new Date(data.departure + 'T12:00:00');
    set('dash-departure', d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }));
  }
  if (data.returnDate) {
    const d = new Date(data.returnDate + 'T12:00:00');
    set('dash-return', d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }));
  } else {
    set('dash-return', 'Solo ida');
  }

  const now = new Date();
  set('activation-time', now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));
}

// ─── Compartir ────────────────────────────────────────
function shareApp() {
  const url  = window.location.href.split('#')[0];
  const text = '¡Encontré una herramienta que me avisa cuando el vuelo que quiero baja al precio que estoy dispuesto a pagar! 🛫';
  if (navigator.share) {
    navigator.share({ title: 'FareHack', text, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${text}\n${url}`)
      .then(() => showToast('¡Link copiado al portapapeles!'))
      .catch(() => {});
  }
}

function showToast(msg) {
  const t = document.createElement('div');
  t.textContent = msg;
  t.className = 'fixed bottom-6 left-1/2 -translate-x-1/2 bg-white text-black text-sm font-medium px-5 py-3 rounded-xl shadow-xl z-50 animate-fade-in';
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 3000);
}

// ─── Init ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => showView('home'));
