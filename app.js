// Estado para logos y título institucional
const headerState = {
  title: 'ASOCIACIÓN DEL FÚTBOL ARGENTINO',
  logoLeft: null,
  logoCenter: null,
  logoRight: null,
};

// Estado para datos del árbitro y firma
const refereeState = {
  name: '',
  dni: '',
  signature: null,
};

let expulsadoCount = 0;
let amonestadoCount = 0;

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
  loadHeaderData();
  loadRefereeData();
  addExpulsado();
  addAmonestado();

  // Escuchar cambios en el título del encabezado
  const titleInput = document.getElementById('headerTitle');
  if (titleInput) {
    titleInput.addEventListener('input', (e) => {
      headerState.title = e.target.value;
      saveHeaderData();
    });
  }
});

// Guardar y cargar configuración del encabezado en LocalStorage
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
    console.warn('Error al cargar datos de localStorage:', err);
  }

  // Actualizar UI
  const titleInput = document.getElementById('headerTitle');
  if (titleInput) {
    titleInput.value = headerState.title || '';
  }
  updateLogoSlotUI('logoLeft', headerState.logoLeft);
  updateLogoSlotUI('logoCenter', headerState.logoCenter);
  updateLogoSlotUI('logoRight', headerState.logoRight);
}

// Gestión de subida de logos
function handleLogoUpload(slotKey, fileInput) {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, SVG, etc.).');
    fileInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const dataUrl = e.target.result;
    headerState[slotKey] = dataUrl;
    updateLogoSlotUI(slotKey, dataUrl);
    saveHeaderData();
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

// Guardar y cargar datos y firma del árbitro
function saveRefereeData() {
  refereeState.name = val('arbitro');
  refereeState.dni = val('arbitroDni');
  try {
    localStorage.setItem('arbitro_perfil', JSON.stringify(refereeState));
  } catch (err) {
    console.warn('No se pudo guardar perfil del árbitro en localStorage:', err);
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
    console.warn('Error al cargar datos del árbitro de localStorage:', err);
  }

  updateSignatureUI();
}

function handleSignatureUpload(fileInput) {
  const file = fileInput.files && fileInput.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Por favor selecciona una imagen válida para la firma (PNG, JPG, etc.).');
    fileInput.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    const dataUrl = e.target.result;
    refereeState.signature = dataUrl;
    updateSignatureUI();
    saveRefereeData();
  };
  reader.readAsDataURL(file);
}

function removeSignature() {
  refereeState.signature = null;
  const inputEl = document.getElementById('signatureInput');
  if (inputEl) inputEl.value = '';
  updateSignatureUI();
  saveRefereeData();
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

// Gestión de expulsados y amonestados
function addExpulsado(data = {}) {
  expulsadoCount++;
  const id = 'exp_' + expulsadoCount;
  const div = document.createElement('div');
  div.className = 'row-item';
  div.id = id;
  div.innerHTML = `
    <button type="button" class="del" onclick="document.getElementById('${id}').remove()">Quitar ✕</button>
    <div class="grid cols4">
      <div class="field"><label>Minuto</label><input class="exp-min" type="number" value="${data.minuto !== undefined ? data.minuto : ''}"></div>
      <div class="field"><label>N°</label><input class="exp-num" type="number" value="${data.numero !== undefined ? data.numero : ''}"></div>
      <div class="field"><label>Nombre y apellido</label><input class="exp-nombre" value="${data.nombre || ''}"></div>
      <div class="field"><label>DNI</label><input class="exp-dni" value="${data.dni || ''}"></div>
    </div>
    <div class="grid cols3">
      <div class="field"><label>Club</label><input class="exp-club" value="${data.club || ''}"></div>
      <div class="field" style="grid-column: span 2;"><label>Motivo (breve)</label><input class="exp-motivo" value="${data.motivo || ''}"></div>
    </div>
    <div class="field">
      <label>Explicación de la expulsión (con tus palabras)</label>
      <textarea class="exp-detalle">${data.detalle || ''}</textarea>
    </div>
  `;
  document.getElementById('expulsadosList').appendChild(div);
}

function addAmonestado(data = {}) {
  amonestadoCount++;
  const id = 'amo_' + amonestadoCount;
  const div = document.createElement('div');
  div.className = 'row-item';
  div.id = id;
  div.innerHTML = `
    <button type="button" class="del" onclick="document.getElementById('${id}').remove()">Quitar ✕</button>
    <div class="grid cols4">
      <div class="field"><label>DNI</label><input class="amo-dni" value="${data.dni || ''}"></div>
      <div class="field"><label>N°</label><input class="amo-num" type="number" value="${data.numero !== undefined ? data.numero : ''}"></div>
      <div class="field"><label>Nombre y apellido</label><input class="amo-nombre" value="${data.nombre || ''}"></div>
      <div class="field"><label>Club</label><input class="amo-club" value="${data.club || ''}"></div>
    </div>
  `;
  document.getElementById('amonestadosList').appendChild(div);
}

function val(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
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
}

// Generación de Informe Final
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
  const arbitro = val('arbitro') || '—';
  const arbitroDni = val('arbitroDni');
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
    const min = row.querySelector('.exp-min').value.trim();
    const num = row.querySelector('.exp-num').value.trim();
    const nombre = row.querySelector('.exp-nombre').value.trim();
    const dni = row.querySelector('.exp-dni').value.trim();
    const club = row.querySelector('.exp-club').value.trim();
    const motivo = row.querySelector('.exp-motivo').value.trim();
    const detalle = row.querySelector('.exp-detalle').value.trim();
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
    const dni = row.querySelector('.amo-dni').value.trim();
    const nombre = row.querySelector('.amo-nombre').value.trim();
    const club = row.querySelector('.amo-club').value.trim();
    if (nombre || dni) {
      amoRows += `<tr><td>${dni || '—'}</td><td>${(nombre || '—').toUpperCase()}</td><td>${(club || '—').toUpperCase()}</td></tr>`;
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
  document.getElementById('reportView').style.display = 'block';
  
  // Asignar título del documento para que el PDF se descargue con este nombre
  const pdfFileName = `${clubLocal} vs ${clubVisitante} - ${division}`;
  document.title = pdfFileName;

  window.scrollTo(0, 0);
}

function imprimirInforme() {
  const clubLocal = val('clubLocal') || 'Local';
  const clubVisitante = val('clubVisitante') || 'Visitante';
  const division = val('division') || 'División';
  document.title = `${clubLocal} vs ${clubVisitante} - ${division}`;
  window.print();
}

function volverAFormulario() {
  document.title = 'Informe Arbitral Reglamentario';
  document.getElementById('formView').style.display = 'block';
  document.getElementById('reportView').style.display = 'none';
}
