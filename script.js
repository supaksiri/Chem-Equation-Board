/* ===================================================
   Chem Equation Board — script.js
   พัฒนาโดย นายธนพงศ์ ชาชิโย
   =================================================== */

(function () {
  'use strict';

  /* ---- DOM references ---- */
  const input       = document.getElementById('equation-input');
  const previewCanvas = document.getElementById('preview-canvas');
  const previewCtx  = previewCanvas.getContext('2d');

  const btnClear    = document.getElementById('btn-clear');
  const btnCopy     = document.getElementById('btn-copy');
  const btnSave     = document.getElementById('btn-save');
  const statusBar   = document.getElementById('status-bar');

  const toggleCharge = document.getElementById('btn-toggle-charge');
  const toggleSub    = document.getElementById('btn-toggle-sub');
  const toggleArrow  = document.getElementById('btn-toggle-arrow');

  const panelCharge  = document.getElementById('panel-charge');
  const panelSub     = document.getElementById('panel-sub');
  const panelArrow   = document.getElementById('panel-arrow');

  /* ---- Canvas config ---- */
  const CANVAS_SIZE   = 224;
  const MAX_FONT_SIZE = 24;
  const MIN_FONT_SIZE = 8;
  const MAX_TEXT_W    = 200; /* leave ~12px each side */
  const CENTER        = CANVAS_SIZE / 2; /* 112 */
   const DPR = window.devicePixelRatio || 1;
  const FONT_FAMILY   = 'Arial, "Noto Sans Thai", sans-serif';

  /* ===================================================
     PREVIEW — draw equation onto the 224×224 canvas
     =================================================== */
  function calcFontSize(ctx, text) {
    let size = MAX_FONT_SIZE;
    while (size >= MIN_FONT_SIZE) {
      ctx.font = size + 'px ' + FONT_FAMILY;
      if (ctx.measureText(text).width <= MAX_TEXT_W) break;
      size--;
    }
    return size;
  }

  function drawCanvas(ctx, text, size) {
    /* White background */
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    if (!text || text.trim() === '') {
      /* Draw placeholder grid lines to show it's ready */
      ctx.strokeStyle = '#E8F5EF';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(size / 2, 20);
      ctx.lineTo(size / 2, size - 20);
      ctx.moveTo(20, size / 2);
      ctx.lineTo(size - 20, size / 2);
      ctx.stroke();
      return;
    }

    const fontSize = calcFontSize(ctx, text);
    ctx.font = fontSize + 'px ' + FONT_FAMILY;
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, CENTER, CENTER);
  }

  function updatePreview() {
  const eq = input.value;
  const DPR = window.devicePixelRatio || 1;

  previewCanvas.width  = CANVAS_SIZE * DPR;
  previewCanvas.height = CANVAS_SIZE * DPR;
  previewCanvas.style.width  = CANVAS_SIZE + 'px';
  previewCanvas.style.height = CANVAS_SIZE + 'px';

  previewCtx.setTransform(DPR, 0, 0, DPR, 0, 0);
  drawCanvas(previewCtx, eq, CANVAS_SIZE);
}

  /* ===================================================
     INSERT AT CURSOR
     =================================================== */
  function insertAtCursor(symbol) {
    const start = input.selectionStart;
    const end   = input.selectionEnd;
    const val   = input.value;

    input.value = val.slice(0, start) + symbol + val.slice(end);

    const newPos = start + symbol.length;
    input.setSelectionRange(newPos, newPos);

    input.focus();
    updatePreview();
  }

  /* ===================================================
     TOOL PANELS — toggle open/close, close others
     =================================================== */
  const groups = [
    { btn: toggleCharge, panel: panelCharge },
    { btn: toggleSub,    panel: panelSub    },
    { btn: toggleArrow,  panel: panelArrow  },
  ];

  function closeAll() {
    groups.forEach(({ btn, panel }) => {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
    });
  }

  function toggleGroup(targetBtn, targetPanel) {
    const isOpen = !targetPanel.hidden;
    closeAll();
    if (!isOpen) {
      targetPanel.hidden = false;
      targetBtn.setAttribute('aria-expanded', 'true');
    }
  }

  toggleCharge.addEventListener('click', () => toggleGroup(toggleCharge, panelCharge));
  toggleSub.addEventListener('click',    () => toggleGroup(toggleSub,    panelSub));
  toggleArrow.addEventListener('click',  () => toggleGroup(toggleArrow,  panelArrow));

  /* Delegate symbol button clicks */
  document.querySelectorAll('.btn-sym').forEach(btn => {
    btn.addEventListener('click', () => {
      const sym = btn.dataset.sym;
      if (sym) insertAtCursor(sym);
    });
  });

  /* ===================================================
     EXAMPLE BUTTON
     =================================================== */

  /* ===================================================
     CLEAR
     =================================================== */
  btnClear.addEventListener('click', () => {
    input.value = '';
    input.focus();
    updatePreview();
    showStatus('ล้างสมการแล้ว', false, 1800);
  });

  /* ===================================================
     COPY
     =================================================== */
  btnCopy.addEventListener('click', async () => {
    const eq = input.value.trim();
    if (!eq) {
      showStatus('ยังไม่มีสมการให้คัดลอก', true);
      return;
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(eq);
        showStatus('คัดลอกสมการแล้ว ✓');
      } catch {
        fallbackCopy();
      }
    } else {
      fallbackCopy();
    }
  });

  function fallbackCopy() {
    input.select();
    try {
      document.execCommand('copy');
      showStatus('คัดลอกสมการแล้ว ✓');
    } catch {
      showStatus('ไม่สามารถคัดลอกได้ กรุณาเลือกข้อความเอง', true);
    }
  }

  /* ===================================================
     SAVE PNG 224×224
     =================================================== */
  btnSave.addEventListener('click', () => {
    const eq = input.value.trim();
    if (!eq) {
      showStatus('กรุณาพิมพ์สมการก่อนบันทึก', true);
      return;
    }

    /* Create an off-screen 224×224 canvas */
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width  = CANVAS_SIZE;
    exportCanvas.height = CANVAS_SIZE;
    const ctx = exportCanvas.getContext('2d');

    drawCanvas(ctx, eq, CANVAS_SIZE);

    const filename = generateFilename();

    /* Try toBlob first (preferred) */
    if (exportCanvas.toBlob) {
      exportCanvas.toBlob(blob => {
        if (!blob) {
          fallbackDataURL(exportCanvas, filename);
          return;
        }
        const url = URL.createObjectURL(blob);
        triggerDownload(url, filename);
        setTimeout(() => URL.revokeObjectURL(url), 10000);
        showStatus('บันทึกไฟล์ PNG 224×224 แล้ว ✓');
        tryShare(blob, filename);
      }, 'image/png');
    } else {
      fallbackDataURL(exportCanvas, filename);
    }
  });

  function fallbackDataURL(canvas, filename) {
    try {
      const dataURL = canvas.toDataURL('image/png');
      triggerDownload(dataURL, filename);
      showStatus('บันทึกไฟล์ PNG 224×224 แล้ว ✓');
    } catch (e) {
      showStatus('ไม่สามารถบันทึกได้: ' + e.message, true);
    }
  }

  function triggerDownload(href, filename) {
    const a = document.createElement('a');
    a.href     = href;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  /* Web Share API — optional on mobile */
  async function tryShare(blob, filename) {
    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({ files: [new File([blob], filename, { type: 'image/png' })] })
    ) {
      /* We do NOT force share — download already triggered */
      /* Share is available but not required */
    }
  }

  /* ===================================================
     FILENAME — chem-equation-YYYYMMDD-HHMMSS.png
     =================================================== */
  function generateFilename() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const date = [
      now.getFullYear(),
      pad(now.getMonth() + 1),
      pad(now.getDate()),
    ].join('');
    const time = [
      pad(now.getHours()),
      pad(now.getMinutes()),
      pad(now.getSeconds()),
    ].join('');
    return 'chem-equation-' + date + '-' + time + '.png';
  }

  /* ===================================================
     STATUS BAR
     =================================================== */
  let statusTimeout = null;

  function showStatus(message, isError = false, duration = 2800) {
    if (statusTimeout) clearTimeout(statusTimeout);
    statusBar.textContent   = message;
    statusBar.className     = 'status-bar' + (isError ? ' status--error' : '');
    statusBar.style.opacity = '1';
    statusTimeout = setTimeout(() => {
      statusBar.style.opacity = '0';
      setTimeout(() => { statusBar.textContent = ''; }, 400);
    }, duration);
  }

  /* ===================================================
     LIVE INPUT LISTENER
     =================================================== */
  input.addEventListener('input',   updatePreview);
  input.addEventListener('keydown', updatePreview); /* catch composing */
  input.addEventListener('paste', () => setTimeout(updatePreview, 0));

  /* ===================================================
     INIT
     =================================================== */
  updatePreview(); /* draw blank canvas on load */
  input.focus();

})();
