// ==========================================
// ⚽ INFORME ARBITRAL - PWA 100% OFFLINE
// ==========================================

// Estado para logos y título institucional (Persistente)
const headerState = {
  title: 'ASOCIACIÓN DEL FÚTBOL ARGENTINO',
  logoLeft: null,
  logoCenter: null,
  logoRight: null,
};

// Estado para datos del árbitro y firma digital (Persistente)
const refereeState = {
  name: '',
  dni: '',
  signature: null,
};

let expulsadoCount = 0;
let amonestadoCount = 0;
let deferredInstallPrompt = null;

// ==========================================
// INICIALIZACIÓN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  initServiceWorker();
  initPwaInstallPrompt();
  initNetworkStatus();

  loadHeaderData();
  loadRefereeData();
  
  // Cargar borrador guardado o inicializar nuevo
  const hasDraft = loadMatchDraft();
  if (!hasDraft) {
    addExpulsado();
    addAmonestado();
  }

  // Escuchar cambios en el título del encabezado
  const titleInput = document.getElementById('headerTitle');
  if (titleInput) {
    titleInput.addEventListener('input', (e) => {
      headerState.title = e.target.value;
      saveHeaderData();
      saveMatchDraft();
    });
  }

  // Auto-guardado de borrador en inputs generales
  document.getElementById('formView').addEventListener('input', () => {
    saveMatchDraft();
  });
});

// ==========================================
// SERVICE WORKER & PWA INSTALL
// ==========================================
function initServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js')
        .then((reg) => {
          console.log('[PWA] Service Worker registrado con éxito:', reg.scope);
          
          // Detectar si hay nueva versión
          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            installingWorker.onstatechange = () => {
              if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showToast('⚡ Aplicación actualizada a la última versión');
              }
            };
          };
        })
        .catch((err) => {
          console.warn('[PWA] Error al registrar Service Worker:', err);
        });
    });
  }
}

function initPwaInstallPrompt() {
  const installBanner = document.getElementById('installBanner');

  // Detección de Android / Chrome PWA prompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    if (installBanner) {
      installBanner.style.display = 'flex';
    }
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    if (installBanner) installBanner.style.display = 'none';
    showToast('🎉 ¡App instalada en tu pantalla principal!');
  });

  // Detección de iOS Safari no instalado
  const isIos = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  const isInStandaloneMode = ('standalone' in window.navigator) && (window.navigator.standalone);

  if (isIos && !isInStandaloneMode) {
    // Mostrar banner con ayuda para iOS
    if (installBanner) {
      installBanner.style.display = 'flex';
      const btn = document.getElementById('btnInstallApp');
      if (btn) {
        btn.textContent = 'Ver cómo instalar';
        btn.onclick = showIosModal;
      }
    }
  }
}

function triggerInstallPrompt() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    deferredInstallPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('[PWA] Usuario aceptó la instalación');
      }
      deferredInstallPrompt = null;
      dismissInstallBanner();
    });
  } else {
    // Si no hay prompt nativo (ej. iOS o ya instalada)
    showIosModal();
  }
}

function dismissInstallBanner() {
  const banner = document.getElementById('installBanner');
  if (banner) banner.style.display = 'none';
}

function showIosModal() {
  const modal = document.getElementById('iosInstallModal');
  if (modal) modal.style.display = 'flex';
}

function closeIosModal() {
  const modal = document.getElementById('iosInstallModal');
  if (modal) modal.style.display = 'none';
}

// ==========================================
// ESTADO DE RED (ONLINE / OFFLINE)
// ==========================================
function initNetworkStatus() {
  const updateStatus = () => {
    const badge = document.getElementById('statusBadge');
    const text = document.getElementById('statusText');
    if (!badge || !text) return;

    if (navigator.onLine) {
      text.textContent = '100% Offline (Listo sin internet)';
      badge.className = 'badge-offline';
    } else {
      text.textContent = 'Modo Offline Activo (Sin Conexión)';
      badge.className = 'badge-offline';
    }
  };

  window.addEventListener('online', () => {
    updateStatus();
    showToast('🟢 Conexión restablecida');
  });

  window.addEventListener('offline', () => {
    updateStatus();
    showToast('⚡ Sin conexión: Modo 100% offline activo');
  });

  updateStatus();
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, duration = 3000) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMessage');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// ==========================================
// CONFIGURACIÓN DE ENCABEZADO Y LOGOS
// ==========================================
function saveHeaderData() {
  try {
    localStorage.setItem('arbitro_informe_header', JSON.stringify(headerState));
  } catch (err) {
    console.warn('No se pudo guardar en localStorage:', err);
  }
}

function loadHeaderData() {
  try {
    const saved = localStorage.getItem('arbitro_informe_header');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.title !== undefined) headerState.title = parsed.title;
      if (parsed.logoLeft) headerState.logoLeft = parsed.logoLeft;
      if (parsed.logoCenter) headerState.logoCenter = parsed.logoCenter;
      if (parsed.logoRight) headerState.logoRight = parsed.logoRight;
    }
  } catch (err) {
    console.warn('Error al cargar datos del encabezado:', err);
  }

  const titleInput = document.getElementById('headerTitle');
  if (titleInput) {
    titleInput.value = headerState.title || '';
  }
  updateLogoSlotUI('logoLeft', headerState.logoLeft);
  updateLogoSlotUI('logoCenter', headerState.logoCenter);
  updateLogoSlotUI('logoRight', headerState.logoRight);
}

function handleLogoUpload(slotKey, fileInput) {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, SVG).');
    fileInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const dataUrl = e.target.result;
    headerState[slotKey] = dataUrl;
    updateLogoSlotUI(slotKey, dataUrl);
    saveHeaderData();
    showToast('✓ Logo guardado en el dispositivo');
  };
  reader.readAsDataURL(file);
}

function removeLogo(slotKey) {
  headerState[slotKey] = null;
  const inputId = slotKey + 'Input';
  const inputEl = document.getElementById(inputId);
  if (inputEl) inputEl.value = '';
  updateLogoSlotUI(slotKey, null);
  saveHeaderData();
  showToast('Logo quitado');
}

function updateLogoSlotUI(slotKey, dataUrl) {
  const container = document.getElementById(slotKey + 'Preview');
  const removeBtn = document.getElementById(slotKey + 'RemoveBtn');
  const uploadWrapper = document.getElementById(slotKey + 'UploadWrapper');

  if (!container) return;

  if (dataUrl) {
    container.innerHTML = `<img src="${dataUrl}" alt="Logo" class="logo-preview-img" />`;
    if (removeBtn) removeBtn.style.display = 'inline-block';
    if (uploadWrapper) uploadWrapper.style.display = 'none';
  } else {
    container.innerHTML = `
      <div class="logo-empty-placeholder">
        <span class="icon">🖼️</span>
        <span>Sin logo</span>
      </div>
    `;
    if (removeBtn) removeBtn.style.display = 'none';
    if (uploadWrapper) uploadWrapper.style.display = 'inline-block';
  }
}

// ==========================================
// PERFIL Y FIRMA DIGITAL DEL ÁRBITRO
// ==========================================
function saveRefereeData() {
  refereeState.name = val('arbitro');
  refereeState.dni = val('arbitroDni');
  try {
    localStorage.setItem('arbitro_perfil', JSON.stringify(refereeState));
  } catch (err) {
    console.warn('No se pudo guardar perfil del árbitro:', err);
  }
}

function loadRefereeData() {
  try {
    const saved = localStorage.getItem('arbitro_perfil');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.name) {
        refereeState.name = parsed.name;
        const nameEl = document.getElementById('arbitro');
        if (nameEl) nameEl.value = parsed.name;
      }
      if (parsed.dni) {
        refereeState.dni = parsed.dni;
        const dniEl = document.getElementById('arbitroDni');
        if (dniEl) dniEl.value = parsed.dni;
      }
      if (parsed.signature) {
        refereeState.signature = parsed.signature;
      }
    }
  } catch (err) {
    console.warn('Error al cargar datos del árbitro:', err);
  }

  updateSignatureUI();
}

function handleSignatureUpload(fileInput) {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona una imagen válida para la firma (PNG, JPG).');
    fileInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const dataUrl = e.target.result;
    refereeState.signature = dataUrl;
    updateSignatureUI();
    saveRefereeData();
    showToast('✓ Firma digital guardada en el dispositivo');
  };
  reader.readAsDataURL(file);
}

function removeSignature() {
  refereeState.signature = null;
  const inputEl = document.getElementById('signatureInput');
  if (inputEl) inputEl.value = '';
  updateSignatureUI();
  saveRefereeData();
  showToast('Firma digital quitada');
}

function updateSignatureUI() {
  const preview = document.getElementById('signaturePreview');
  const removeBtn = document.getElementById('signatureRemoveBtn');
  const uploadBtnWrapper = document.getElementById('signatureUploadBtnWrapper');

  if (!preview) return;

  if (refereeState.signature) {
    preview.innerHTML = `<img src="${refereeState.signature}" alt="Firma cargada" class="signature-preview-img" />`;
    if (removeBtn) removeBtn.style.display = 'inline-block';
    if (uploadBtnWrapper) uploadBtnWrapper.style.display = 'none';
  } else {
    preview.innerHTML = `<span class="hint">Sin firma cargada (se dejará espacio para firma manual)</span>`;
    if (removeBtn) removeBtn.style.display = 'none';
    if (uploadBtnWrapper) uploadBtnWrapper.style.display = 'inline-block';
  }
}

// ==========================================
// GESTIÓN DE EXPULSADOS Y AMONESTADOS
// ==========================================
function addExpulsado(data = {}) {
  expulsadoCount++;
  const id = 'exp_' + expulsadoCount;
  const div = document.createElement('div');
  div.className = 'row-item';
  div.id = id;
  div.innerHTML = `
    <button type="button" class="del" onclick="removeExpulsado('${id}')">Quitar ✕</button>
    <div class="grid cols4">
      <div class="field"><label>Minuto</label><input class="exp-min" type="number" inputmode="numeric" placeholder="Ej. 34" value="${data.minuto !== undefined ? data.minuto : ''}"></div>
      <div class="field"><label>Dorsal N°</label><input class="exp-num" type="number" inputmode="numeric" placeholder="Ej. 10" value="${data.numero !== undefined ? data.numero : ''}"></div>
      <div class="field"><label>Nombre y apellido</label><input class="exp-nombre" placeholder="Nombre completo" value="${data.nombre || ''}"></div>
      <div class="field"><label>DNI / Ficha</label><input class="exp-dni" inputmode="numeric" placeholder="DNI" value="${data.dni || ''}"></div>
    </div>
    <div class="grid cols3">
      <div class="field"><label>Club</label><input class="exp-club" placeholder="Club del jugador" value="${data.club || ''}"></div>
      <div class="field" style="grid-column: span 2;"><label>Motivo reglamentario (breve)</label><input class="exp-motivo" placeholder="Ej. Conducta violenta / Agresión verbal" value="${data.motivo || ''}"></div>
    </div>
    <div class="field">
      <label>Explicación de la expulsión (relato detallado)</label>
      <textarea class="exp-detalle" placeholder="Describí con precisión lo ocurrido...">${data.detalle || ''}</textarea>
    </div>
  `;
  document.getElementById('expulsadosList').appendChild(div);
  saveMatchDraft();
}

function removeExpulsado(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
  saveMatchDraft();
}

function addAmonestado(data = {}) {
  amonestadoCount++;
  const id = 'amo_' + amonestadoCount;
  const div = document.createElement('div');
  div.className = 'row-item';
  div.id = id;
  div.innerHTML = `
    <button type="button" class="del" onclick="removeAmonestado('${id}')">Quitar ✕</button>
    <div class="grid cols4">
      <div class="field"><label>DNI / Ficha</label><input class="amo-dni" inputmode="numeric" placeholder="DNI" value="${data.dni || ''}"></div>
      <div class="field"><label>Dorsal N°</label><input class="amo-num" type="number" inputmode="numeric" placeholder="N°" value="${data.numero !== undefined ? data.numero : ''}"></div>
      <div class="field"><label>Nombre y apellido</label><input class="amo-nombre" placeholder="Nombre del jugador" value="${data.nombre || ''}"></div>
      <div class="field"><label>Club</label><input class="amo-club" placeholder="Club" value="${data.club || ''}"></div>
    </div>
  `;
  document.getElementById('amonestadosList').appendChild(div);
  saveMatchDraft();
}

function removeAmonestado(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
  saveMatchDraft();
}

// ==========================================
// CÁLCULO DE HORARIOS Y TIEMPOS
// ==========================================
function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setVal(id, value) {
  const el = document.getElementById(id);
  if (el && value !== undefined) el.value = value;
}

function addMinutes(timeStr, minsToAdd) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const total = h * 60 + m + minsToAdd;
  const wrapped = ((total % 1440) + 1440) % 1440;
  const hh = String(Math.floor(wrapped / 60)).padStart(2, '0');
  const mm = String(wrapped % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

function onDivisionChange() {
  const divisionVal = val('division').toLowerCase();
  const durInput = document.getElementById('duracionTiempo');
  if (durInput) {
    if (divisionVal.includes('sub-21') || divisionVal.includes('sub 21')) {
      durInput.value = 40;
    } else if (
      divisionVal.includes('sub-17') ||
      divisionVal.includes('sub 17') ||
      divisionVal.includes('sub-15') ||
      divisionVal.includes('sub 15') ||
      divisionVal.includes('femenino')
    ) {
      durInput.value = 35;
    } else if (divisionVal.includes('primera')) {
      durInput.value = 45;
    }
  }
  recalcularHorarios();
}

function recalcularHorarios() {
  const durRaw = val('duracionTiempo');
  const dur = durRaw ? parseInt(durRaw, 10) : 45;
  const division = val('division');
  const hint = document.getElementById('duracionHint');

  if (hint) {
    hint.textContent = `${division ? division + ' — ' : ''}Cada tiempo dura ${dur} min + los minutos adicionados.`;
  }

  const horaInicio = val('horaInicio');
  if (!horaInicio) return;

  const adic1 = parseInt(val('adic1') || '0', 10);
  const adic2 = parseInt(val('adic2') || '0', 10);
  const descanso = parseInt(val('descanso') || '15', 10);

  const t1hasta = addMinutes(horaInicio, dur + adic1);
  const t2desde = addMinutes(t1hasta, descanso);
  const t2hasta = addMinutes(t2desde, dur + adic2);

  document.getElementById('t1desde').value = horaInicio;
  document.getElementById('t1hasta').value = t1hasta;
  document.getElementById('t2desde').value = t2desde;
  document.getElementById('t2hasta').value = t2hasta;
  
  saveMatchDraft();
}

// ==========================================
// PERSISTENCIA DE BORRADOR DEL PARTIDO
// ==========================================
function saveMatchDraft() {
  const draft = {
    clubLocal: val('clubLocal'),
    clubVisitante: val('clubVisitante'),
    golesLocal: val('golesLocal'),
    golesVisitante: val('golesVisitante'),
    fecha: val('fecha'),
    estadio: val('estadio'),
    division: val('division'),
    duracionTiempo: val('duracionTiempo'),
    horaInicio: val('horaInicio'),
    descanso: val('descanso'),
    adic1: val('adic1'),
    adic2: val('adic2'),
    relato: val('relato'),
    capLocal: val('capLocal'),
    capVisitante: val('capVisitante'),
    expulsados: [],
    amonestados: []
  };

  document.querySelectorAll('#expulsadosList .row-item').forEach((row) => {
    draft.expulsados.push({
      minuto: row.querySelector('.exp-min')?.value.trim() || '',
      numero: row.querySelector('.exp-num')?.value.trim() || '',
      nombre: row.querySelector('.exp-nombre')?.value.trim() || '',
      dni: row.querySelector('.exp-dni')?.value.trim() || '',
      club: row.querySelector('.exp-club')?.value.trim() || '',
      motivo: row.querySelector('.exp-motivo')?.value.trim() || '',
      detalle: row.querySelector('.exp-detalle')?.value.trim() || ''
    });
  });

  document.querySelectorAll('#amonestadosList .row-item').forEach((row) => {
    draft.amonestados.push({
      dni: row.querySelector('.amo-dni')?.value.trim() || '',
      numero: row.querySelector('.amo-num')?.value.trim() || '',
      nombre: row.querySelector('.amo-nombre')?.value.trim() || '',
      club: row.querySelector('.amo-club')?.value.trim() || ''
    });
  });

  try {
    localStorage.setItem('arbitro_borrador_partido', JSON.stringify(draft));
  } catch (e) {
    console.warn('Error guardando borrador:', e);
  }
}

function loadMatchDraft() {
  try {
    const saved = localStorage.getItem('arbitro_borrador_partido');
    if (!saved) return false;

    const draft = JSON.parse(saved);
    setVal('clubLocal', draft.clubLocal);
    setVal('clubVisitante', draft.clubVisitante);
    setVal('golesLocal', draft.golesLocal);
    setVal('golesVisitante', draft.golesVisitante);
    setVal('fecha', draft.fecha);
    setVal('estadio', draft.estadio);
    setVal('division', draft.division);
    if (draft.duracionTiempo) setVal('duracionTiempo', draft.duracionTiempo);
    setVal('horaInicio', draft.horaInicio);
    if (draft.descanso !== undefined) setVal('descanso', draft.descanso);
    if (draft.adic1 !== undefined) setVal('adic1', draft.adic1);
    if (draft.adic2 !== undefined) setVal('adic2', draft.adic2);
    setVal('relato', draft.relato);
    setVal('capLocal', draft.capLocal);
    setVal('capVisitante', draft.capVisitante);

    // Cargar expulsados
    document.getElementById('expulsadosList').innerHTML = '';
    if (draft.expulsados && draft.expulsados.length > 0) {
      draft.expulsados.forEach((item) => addExpulsado(item));
    } else {
      addExpulsado();
    }

    // Cargar amonestados
    document.getElementById('amonestadosList').innerHTML = '';
    if (draft.amonestados && draft.amonestados.length > 0) {
      draft.amonestados.forEach((item) => addAmonestado(item));
    } else {
      addAmonestado();
    }

    recalcularHorarios();
    return true;
  } catch (err) {
    console.warn('Error al cargar borrador:', err);
    return false;
  }
}

function confirmarNuevoPartido() {
  if (confirm('¿Deseas iniciar un nuevo partido? Se limpiarán los datos del partido actual (tus logos y datos personales se mantendrán).')) {
    setVal('clubLocal', '');
    setVal('clubVisitante', '');
    setVal('golesLocal', '');
    setVal('golesVisitante', '');
    setVal('fecha', '');
    setVal('estadio', '');
    setVal('division', '');
    setVal('duracionTiempo', '45');
    setVal('horaInicio', '');
    setVal('descanso', '15');
    setVal('adic1', '0');
    setVal('adic2', '0');
    setVal('t1desde', '');
    setVal('t1hasta', '');
    setVal('t2desde', '');
    setVal('t2hasta', '');
    setVal('relato', '');
    setVal('capLocal', '');
    setVal('capVisitante', '');

    document.getElementById('expulsadosList').innerHTML = '';
    document.getElementById('amonestadosList').innerHTML = '';
    addExpulsado();
    addAmonestado();

    try {
      localStorage.removeItem('arbitro_borrador_partido');
    } catch (e) {}

    showToast('✓ Formulario listo para nuevo partido');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ==========================================
// GENERACIÓN DE INFORME OFICIAL
// ==========================================
function generarInforme() {
  const clubLocal = val('clubLocal') || '—';
  const clubVisitante = val('clubVisitante') || '—';
  const golesLocal = val('golesLocal') || '0';
  const golesVisitante = val('golesVisitante') || '0';
  const division = val('division') || '—';
  const fechaRaw = val('fecha');
  const fecha = fechaRaw
    ? new Date(fechaRaw + 'T00:00:00').toLocaleDateString('es-AR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : '—';
  const estadio = val('estadio') || '—';
  const arbitro = val('arbitro') || refereeState.name || '—';
  const arbitroDni = val('arbitroDni') || refereeState.dni || '';
  const firmaArbitro = refereeState.signature;

  const t1desde = val('t1desde') || '—';
  const t1hasta = val('t1hasta') || '—';
  const t2desde = val('t2desde') || '—';
  const t2hasta = val('t2hasta') || '—';
  const adic1raw = val('adic1');
  const adic2raw = val('adic2');
  const adic1 = adic1raw ? `${adic1raw} min` : '—';
  const adic2 = adic2raw ? `${adic2raw} min` : '—';
  const relato = val('relato');
  const capLocal = val('capLocal') || '—';
  const capVisitante = val('capVisitante') || '—';

  // Expulsados
  let expRows = '';
  let expNarrative = '';
  document.querySelectorAll('#expulsadosList .row-item').forEach((row) => {
    const min = row.querySelector('.exp-min')?.value.trim() || '';
    const num = row.querySelector('.exp-num')?.value.trim() || '';
    const nombre = row.querySelector('.exp-nombre')?.value.trim() || '';
    const dni = row.querySelector('.exp-dni')?.value.trim() || '';
    const club = row.querySelector('.exp-club')?.value.trim() || '';
    const motivo = row.querySelector('.exp-motivo')?.value.trim() || '';
    const detalle = row.querySelector('.exp-detalle')?.value.trim() || '';
    if (nombre || dni) {
      expRows += `<tr><td>${dni || '—'}</td><td>${(nombre || '—').toUpperCase()}</td><td>${(club || '—').toUpperCase()}</td></tr>`;
      let linea = `A LOS ${min || '—'} MINUTOS DE PARTIDO, EXPULSÉ DEL CAMPO DE JUEGO AL JUGADOR N-${num || '—'} ${(nombre || '—').toUpperCase()} D.N.I ${dni || '—'} DEL CLUB ${(club || '—').toUpperCase()}`;
      linea += motivo ? ` POR ${motivo.toUpperCase()}` : '';
      linea += detalle ? `. ${detalle.toUpperCase()}` : '.';
      expNarrative += `<p class="body-text">${linea}</p>`;
    }
  });

  // Amonestados
  let amoRows = '';
  document.querySelectorAll('#amonestadosList .row-item').forEach((row) => {
    const dni = row.querySelector('.amo-dni')?.value.trim() || '';
    const num = row.querySelector('.amo-num')?.value.trim() || '';
    const nombre = row.querySelector('.amo-nombre')?.value.trim() || '';
    const club = row.querySelector('.amo-club')?.value.trim() || '';
    if (nombre || dni) {
      amoRows += `<tr><td>${dni || '—'}</td><td>${num ? `(${num}) ` : ''}${(nombre || '—').toUpperCase()}</td><td>${(club || '—').toUpperCase()}</td></tr>`;
    }
  });

  // Encabezado con logos
  const leftLogo = headerState.logoLeft;
  const centerLogo = headerState.logoCenter;
  const rightLogo = headerState.logoRight;
  const headerTitle = headerState.title || 'ASOCIACIÓN DEL FÚTBOL ARGENTINO';

  let logosHtml = '';
  const activeLogosCount = (leftLogo ? 1 : 0) + (centerLogo ? 1 : 0) + (rightLogo ? 1 : 0);

  if (activeLogosCount > 0) {
    let alignmentClass = '';
    if (activeLogosCount === 1) alignmentClass = 'single';
    else if (activeLogosCount === 2) alignmentClass = 'double';

    logosHtml = `
      <div class="report-header-logos ${alignmentClass}">
        ${leftLogo ? `<img src="${leftLogo}" alt="Logo Izquierdo" />` : '<div></div>'}
        ${centerLogo ? `<img src="${centerLogo}" alt="Logo Central" />` : '<div></div>'}
        ${rightLogo ? `<img src="${rightLogo}" alt="Logo Derecho" />` : '<div></div>'}
      </div>
    `;
  }

  const html = `
    <div class="report-header">
      ${logosHtml}
      ${headerTitle ? `<div class="report-header-title">${headerTitle.toUpperCase()}</div>` : ''}
    </div>

    <h1>Informe arbitral reglamentario</h1>
    <div class="box">
      <div class="title">Partido y resultado</div>
      <p><strong>${clubLocal.toUpperCase()}</strong> ( ${golesLocal} ) VS <strong>${clubVisitante.toUpperCase()}</strong> ( ${golesVisitante} )</p>
      <p>División: <strong>${division.toUpperCase()}</strong> &nbsp;&nbsp; Fecha: <strong>${fecha}</strong></p>
      <p>1er tiempo: desde ${t1desde} hs hasta ${t1hasta} hs &nbsp;&nbsp; 2do tiempo: desde ${t2desde} hs hasta ${t2hasta} hs</p>
      <p>Tiempo adicional: 1er tiempo ${adic1} — 2do tiempo ${adic2}</p>
      <p>Jugado en el estadio de: <strong>${estadio}</strong></p>
    </div>

    <p style="font-size:13px;">Señor presidente del Tribunal de Disciplina Deportiva:<br>
    De mi mayor consideración:</p>
    <p style="font-size:13px;">Presento a Ud. mi informe reglamentario sobre el partido de referencia, en el cual actué como Árbitro.-</p>

    <h3>Explicaciones de hecho</h3>
    ${expNarrative || ''}
    ${relato ? `<p class="body-text">${relato.toUpperCase()}</p>` : ''}
    ${!expNarrative && !relato ? '<p style="font-size:13px;color:#666;">Sin incidentes reportados.</p>' : ''}

    ${
      expRows
        ? `
    <h3>Expulsados</h3>
    <table class="rep-table">
      <tr><th>Ficha/DNI</th><th>Nombre y apellido</th><th>Club</th></tr>
      ${expRows}
    </table>`
        : ''
    }

    ${
      amoRows
        ? `
    <h3>Amonestados</h3>
    <table class="rep-table">
      <tr><th>Ficha/DNI</th><th>Nombre y apellido</th><th>Club</th></tr>
      ${amoRows}
    </table>`
        : ''
    }

    <p class="cap-line"><strong>Nombre y apellido capitán local:</strong> ${capLocal}</p>
    <p class="cap-line"><strong>Nombre y apellido capitán visitante:</strong> ${capVisitante}</p>

    <div class="sign-row">
      <div>
        <div>Aclaración: <strong>${arbitro}</strong></div>
        ${arbitroDni ? `<div style="margin-top: 4px;">D.N.I.: <strong>${arbitroDni}</strong></div>` : ''}
      </div>
      <div class="sign-col">
        ${firmaArbitro ? `<img src="${firmaArbitro}" alt="Firma del árbitro" class="sign-img" />` : '<div class="sign-placeholder-space"></div>'}
        <div class="sign-line">Firma del árbitro</div>
      </div>
    </div>
  `;

  document.getElementById('reportContent').innerHTML = html;
  document.getElementById('formView').style.display = 'none';
  document.getElementById('quickToolsBar').style.display = 'none';
  document.getElementById('reportView').style.display = 'block';

  // Configurar título del documento para que el PDF se descargue con formato reglamentario
  const pdfFileName = `${clubLocal} vs ${clubVisitante} - ${division}`;
  document.title = pdfFileName;

  window.scrollTo(0, 0);
  showToast('✓ Informe reglamentario generado');
}

function volverAFormulario() {
  document.title = 'Informe Arbitral - Fútbol Oficial';
  document.getElementById('formView').style.display = 'block';
  document.getElementById('quickToolsBar').style.display = 'flex';
  document.getElementById('reportView').style.display = 'none';
  window.scrollTo(0, 0);
}

// ==========================================
// IMPRESIÓN Y EXPORTACIÓN DE PDF
// ==========================================
function imprimirInforme() {
  const clubLocal = val('clubLocal') || 'Local';
  const clubVisitante = val('clubVisitante') || 'Visitante';
  const division = val('division') || 'División';
  document.title = `${clubLocal} vs ${clubVisitante} - ${division}`;
  window.print();
}

// ==========================================
// COMPARTIR Y COPIAR RESUMEN (WEB SHARE API)
// ==========================================
function getResumenTexto() {
  const clubLocal = val('clubLocal') || 'Local';
  const clubVisitante = val('clubVisitante') || 'Visitante';
  const golesLocal = val('golesLocal') || '0';
  const golesVisitante = val('golesVisitante') || '0';
  const division = val('division') || '';
  const fecha = val('fecha') || '';
  const arbitro = val('arbitro') || refereeState.name || 'Árbitro Oficial';

  let resumen = `📋 *INFORME ARBITRAL OFICIAL*\n`;
  resumen += `⚽ *${clubLocal.toUpperCase()} (${golesLocal}) vs (${golesVisitante}) ${clubVisitante.toUpperCase()}*\n`;
  if (division) resumen += `🏆 División: ${division}\n`;
  if (fecha) resumen += `📅 Fecha: ${fecha}\n`;
  resumen += `👤 Árbitro: ${arbitro}\n\n`;

  // Expulsados
  const expItems = [];
  document.querySelectorAll('#expulsadosList .row-item').forEach((row) => {
    const min = row.querySelector('.exp-min')?.value.trim();
    const num = row.querySelector('.exp-num')?.value.trim();
    const nom = row.querySelector('.exp-nombre')?.value.trim();
    const club = row.querySelector('.exp-club')?.value.trim();
    const mot = row.querySelector('.exp-motivo')?.value.trim();
    if (nom) {
      expItems.push(`• Min ${min || '?'}' [N°${num || '?'}] ${nom} (${club || 'Club'})${mot ? ' - ' + mot : ''}`);
    }
  });

  if (expItems.length > 0) {
    resumen += `🔴 *EXPULSADOS:*\n` + expItems.join('\n') + '\n\n';
  } else {
    resumen += `🔴 *EXPULSADOS:* Sin expulsados.\n\n`;
  }

  // Relato adicional
  const relato = val('relato');
  if (relato) {
    resumen += `📝 *EXPLICACIÓN DE HECHOS:*\n${relato}\n`;
  }

  return resumen;
}

function compartirInforme() {
  const resumen = getResumenTexto();
  const titulo = `Informe Arbitral: ${val('clubLocal')} vs ${val('clubVisitante')}`;

  if (navigator.share) {
    navigator
      .share({
        title: titulo,
        text: resumen,
      })
      .then(() => {
        showToast('✓ Informe compartido');
      })
      .catch((err) => {
        if (err.name !== 'AbortError') {
          fallbackCompartirWhatsApp(resumen);
        }
      });
  } else {
    fallbackCompartirWhatsApp(resumen);
  }
}

function fallbackCompartirWhatsApp(texto) {
  const encoded = encodeURIComponent(texto);
  const whatsappUrl = `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(whatsappUrl, '_blank');
}

function copiarTextoInforme() {
  const resumen = getResumenTexto();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(resumen)
      .then(() => {
        showToast('✓ Resumen copiado al portapapeles');
      })
      .catch(() => {
        copiarFallback(resumen);
      });
  } else {
    copiarFallback(resumen);
  }
}

function copiarFallback(texto) {
  const textarea = document.createElement('textarea');
  textarea.value = texto;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    showToast('✓ Resumen copiado al portapapeles');
  } catch (e) {
    alert('No se pudo copiar automáticamente. Por favor copia el texto manualmente.');
  }
  document.body.removeChild(textarea);
}

