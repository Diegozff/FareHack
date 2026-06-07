/* ═══════════════════════════════════════════════════════
   storage.js — Subida de comprobantes a Supabase Storage

   Setup:
   1. Creá un proyecto en supabase.com (gratis)
   2. Andá a Storage → crear bucket "comprobantes" (público)
   3. Pegá tu Project URL y anon key abajo
   4. Agregá <script src="js/storage.js"> antes de submit.js en index.html
═══════════════════════════════════════════════════════ */

// ─── Configuración de Supabase ────────────────────────
// Reemplazá estos valores con los de tu proyecto
const SUPABASE_URL     = '';   // ej: 'https://xyzxyz.supabase.co'
const SUPABASE_ANON_KEY = '';  // ej: 'eyJhbGciOiJIUzI1NiIs...'
const BUCKET_NAME      = 'comprobantes';

// ─── Subir archivo a Supabase Storage ────────────────
async function uploadFileToSupabase(file, leadId) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.info('[FareHack] Supabase no configurado — saltando subida de archivo.');
    return null;
  }

  if (!file) return null;

  // Nombre único: leadId + nombre original
  const ext      = file.name.split('.').pop();
  const filePath = `${leadId}/${Date.now()}.${ext}`;
  const endpoint = `${SUPABASE_URL}/storage/v1/object/${BUCKET_NAME}/${filePath}`;

  try {
    const res = await fetch(endpoint, {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Type':  file.type || 'application/octet-stream',
        'x-upsert':      'true',
      },
      body: file,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Supabase Storage error: ${err}`);
    }

    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;
    console.info('[FareHack] Archivo subido →', publicUrl);
    return publicUrl;

  } catch (err) {
    // No bloquea el flujo — la subida es opcional
    console.warn('[FareHack] Error subiendo archivo:', err.message);
    return null;
  }
}
