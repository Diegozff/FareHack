/* ═══════════════════════════════════════════════════════
   app.js — Router y estado global de FareHack
═══════════════════════════════════════════════════════ */

// ─── Estado global ───────────────────────────────────
window.FH = {
  currentView: 'home',
  currentStep: 1,
  formData: {},
  selectedFile: null,
};

// ─── Router de vistas ────────────────────────────────
function showView(name) {
  const views = ['home', 'register', 'loading', 'dashboard'];
  views.forEach(v => {
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

// ─── Navegación entre pasos del formulario ───────────
function goToStep(n) {
  const currentStep = window.FH.currentStep;

  // Validar antes de avanzar
  if (n > currentStep && !validateStep(currentStep)) return;

  // Ocultar paso actual
  document.getElementById(`form-step-${currentStep}`).classList.add('hidden');
  // Mostrar nuevo paso
  document.getElementById(`form-step-${n}`).classList.remove('hidden');

  window.FH.currentStep = n;
  updateProgressBar(n);
}

function updateProgressBar(step) {
  const bars = ['progress-step1', 'progress-step2', 'progress-step3'];
  bars.forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (i < step) {
      el.classList.remove('bg-white/10');
      el.classList.add('bg-brand-500');
    } else {
      el.classList.remove('bg-brand-500');
      el.classList.add('bg-white/10');
    }
  });
  const label = document.getElementById('step-label');
  if (label) label.textContent = `${step} / 3`;
}

// ─── Validación por paso ─────────────────────────────
function validateStep(step) {
  const errors = [];

  if (step === 1) {
    const name  = document.getElementById('field-name')?.value.trim();
    const email = document.getElementById('field-email')?.value.trim();
    const type  = document.querySelector('input[name="reservation-type"]:checked');
    if (!name)  errors.push('Ingresá tu nombre');
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('Ingresá un e-mail válido');
    if (!type)  errors.push('Seleccioná el tipo de reserva');
  }

  if (step === 2) {
    const pnr      = document.getElementById('field-pnr')?.value.trim();
    const provider = document.getElementById('field-provider')?.value.trim();
    const route    = document.getElementById('field-route')?.value.trim();
    const date     = document.getElementById('field-travel-date')?.value;
    const price    = document.getElementById('field-price')?.value;
    const cancel   = document.getElementById('field-cancel-date')?.value;
    if (!pnr)      errors.push('Ingresá el código PNR');
    if (!provider) errors.push('Ingresá la aerolínea o proveedor');
    if (!route)    errors.push('Ingresá la ruta o destino');
    if (!date)     errors.push('Seleccioná la fecha de viaje');
    if (!price || Number(price) <= 0) errors.push('Ingresá el precio pagado');
    if (!cancel)   errors.push('Ingresá la fecha límite de cancelación');
  }

  if (errors.length > 0) {
    showFormError(errors[0]);
    return false;
  }

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
  const el = document.getElementById('form-error');
  if (el) el.classList.add('hidden');
}

// ─── Selector de tipo de reserva ─────────────────────
function selectType(radio) {
  document.querySelectorAll('.type-option').forEach(el => {
    el.classList.remove('border-brand-500/50', 'bg-brand-500/8');
    el.style.borderColor = '';
    el.style.background = '';
  });
  const opt = radio.closest('.type-btn').querySelector('.type-option');
  if (opt) {
    opt.style.borderColor = 'rgba(0,229,102,0.5)';
    opt.style.background  = 'rgba(0,229,102,0.08)';
  }
}

// ─── Manejo de archivos ──────────────────────────────
function handleFileSelect(event) {
  const file = event.target.files[0];
  if (file) displayFile(file);
}

function handleDragOver(e) {
  e.preventDefault();
  document.getElementById('drop-zone').classList.add('border-brand-500/50', 'bg-brand-500/5');
}

function handleDragLeave(e) {
  document.getElementById('drop-zone').classList.remove('border-brand-500/50', 'bg-brand-500/5');
}

function handleDrop(e) {
  e.preventDefault();
  handleDragLeave(e);
  const file = e.dataTransfer.files[0];
  if (file) {
    document.getElementById('file-input').files = e.dataTransfer.files;
    displayFile(file);
  }
}

function displayFile(file) {
  window.FH.selectedFile = file;
  const preview = document.getElementById('file-preview');
  const content = document.getElementById('drop-zone-content');
  const nameEl  = document.getElementById('file-name');
  const sizeEl  = document.getElementById('file-size');

  if (nameEl) nameEl.textContent = file.name;
  if (sizeEl) sizeEl.textContent = formatFileSize(file.size);

  content?.classList.add('hidden');
  preview?.classList.remove('hidden');
}

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Reset formulario ────────────────────────────────
function resetForm() {
  document.getElementById('reservation-form')?.reset();
  window.FH.selectedFile = null;
  window.FH.currentStep = 1;
  window.FH.formData = {};

  // Mostrar solo step 1
  ['form-step-1', 'form-step-2', 'form-step-3'].forEach((id, i) => {
    const el = document.getElementById(id);
    if (!el) return;
    i === 0 ? el.classList.remove('hidden') : el.classList.add('hidden');
  });

  // Reset progress bar
  updateProgressBar(1);

  // Reset file preview
  document.getElementById('drop-zone-content')?.classList.remove('hidden');
  document.getElementById('file-preview')?.classList.add('hidden');

  // Reset type selectors
  document.querySelectorAll('.type-option').forEach(el => {
    el.style.borderColor = '';
    el.style.background  = '';
  });

  hideFormError();
}

// ─── Inicialización ───────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  showView('home');
  startCountdownTimer();
});

// ─── Countdown en dashboard ──────────────────────────
function startCountdownTimer() {
  let seconds = 3600 - 78; // simula que ya pasó algo de tiempo
  const el = document.getElementById('next-check');
  if (!el) return;

  setInterval(() => {
    if (seconds <= 0) seconds = 3600;
    seconds--;
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    el.textContent = `${m}:${s}`;
  }, 1000);
}

// ─── Poblar dashboard con datos del form ─────────────
function populateDashboard(data) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el && val) el.textContent = val;
  };

  const initial = data.name ? data.name.trim().charAt(0).toUpperCase() : 'U';
  set('user-avatar', initial);

  set('dashboard-pnr',    data.pnr || '—');
  set('dash-route',       data.route || '—');
  set('dash-provider',    data.provider || '—');
  set('dash-price',       data.price ? `USD ${Number(data.price).toFixed(0)}` : '—');

  if (data.travelDate) {
    const d = new Date(data.travelDate + 'T12:00:00');
    set('dash-travel-date', d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }));
  }

  if (data.cancelDate) {
    const d = new Date(data.cancelDate + 'T12:00:00');
    set('dash-cancel-date', d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' }));
  }

  const now = new Date();
  set('activation-time', now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }));

  // Animar las barras shimmer del dashboard
  document.querySelectorAll('.shimmer-bar').forEach((bar, i) => {
    setTimeout(() => {
      const pct = 30 + Math.random() * 50;
      bar.style.width = `${pct}%`;
    }, i * 400);
  });
}
