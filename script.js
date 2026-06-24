/* ===================================================
   Chem Equation Board — script.js
   พัฒนาโดย นายธนพงศ์ ชาชิโย
   =================================================== */

(function () {
  'use strict';

  /* ---- DOM references ---- */
  const input         = document.getElementById('equation-input');
  const previewCanvas = document.getElementById('preview-canvas');
  const previewCtx    = previewCanvas.getContext('2d');

  const btnClear  = document.getElementById('btn-clear');
  const btnCopy   = document.getElementById('btn-copy');
  const btnSave   = document.getElementById('btn-save');
  const statusBar = document.getElementById('status-bar');

  const toggleCharge = document.getElementById('btn-toggle-charge');
  const toggleSub    = document.getElementById('btn-toggle-sub');
  const toggleArrow  = document.getElementById('btn-toggle-arrow');

  const panelCharge = document.getElementById('panel-charge');
  const panelSub    = document.getElementById('panel-sub');
  const panelArrow  = document.getElementById('panel-arrow');

  /* ---- Canvas config ---- */
  const CANVAS_SIZE   = 224;
  const MAX_FONT_SIZE = 36;
  const MIN_FONT_SIZE = 8;
  const MAX_TEXT_W    = 200;
  const CENTER        = CANVAS_SIZE / 2; /* 112 */
  const FONT_FAMILY   = 'Arial, "Noto Sans Thai", sans-serif';

  /* ===================================================
     แยกข้อความเป็น segments ปกติ vs สัญลักษณ์พิเศษ
     =================================================== */
  function splitSegments(text) {
    const specialPattern = /([→←⇌⁺⁻¹²³⁴⁵⁶⁷⁸⁹₀₁₂₃₄₅₆₇₈₉])/g;
    const segments = [];
    let lastIndex = 0;
    let match;

    while ((match = specialPattern.exec(text)) !== null) {
      if (match.index > lastIndex) {
        segments.push({ text: text.slice(lastIndex, match.index), special: false });
      }
      segments.push({ text: match[0], special: true });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length) {
      segments.push({ text: text.slice(lastIndex), special: false });
    }
    return segments;
  }

  /* ===================================================
     คำนวณ font size ที่ทำให้ข้อความพอดี MAX_TEXT_W
     =================================================== */
  function calcFontSize(ctx, segments) {
    let fontSize = MAX_FONT_SIZE;
    while (fontSize >= MIN_FONT_SIZE) {
      let totalW = 0;
      segments.forEach(seg => {
        const fs = seg.special ? Math.round(fontSize * 1.6) : fontSize;
        ctx.font = 'bold ' + fs + 'px ' + FONT_FAMILY;
        totalW += ctx.measureText(seg.text).width;
      });
      if (totalW <= MAX_TEXT_W) break;
      fontSize--;
    }
    return fontSize;
  }

  /* ===================================================
     วาดลง Canvas
     =================================================== */
  function drawCanvas(ctx, text, size) {
    /* พื้นหลังขาว */
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    if (!text || text.trim() === '') {
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

    const segments = splitSegments(text);
    const fontSize = calcFontSize(ctx, segments);

    /* วัดความกว้างรวมจริงเพื่อจัดกึ่งกลาง */
    let totalWidth = 0;
    segments.forEach(seg => {
      const fs = seg.special ? Math.round(fontSize * 1.6) : fontSize;
      ctx.font = 'bold ' + fs + 'px ' + FONT_FAMILY;
      totalWidth += ctx.measureText(seg.text).width;
    });

    /* วาดจากซ้ายไปขวา textAlign = 'left' */
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = '#000000';

    let x = CENTER - totalWidth / 2;
    segments.forEach(seg => {
      const fs = seg.special ? Math.round(fontSize * 1.6) : fontSize;
      ctx.font = 'bold ' + fs + 'px ' + FONT_FAMILY;
      ctx.fillText(seg.text, x, CENTER);
      x += ctx.measureText(seg.text).width;
    });
  }

  /* ===================================================
     PREVIEW — คมชัดด้วย devicePixelRatio
     =================================================== */
  function updatePreview() {
    const eq  = input.value;
    const DPR = window.devicePixelRatio || 1;

    previewCanvas.width        = CANVAS_SIZE * DPR;
    previewCanvas.height       = CANVAS_SIZE * DPR;
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
     TOOL PANELS — toggle open/close, ปิดกลุ่มอื่น
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

  document.querySelectorAll('.btn-sym').forEach(btn => {
    btn.addEventListener('click', () => {
      const sym = btn.dataset.sym;
      if (sym) insertAtCursor(sym);
    });
  });

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

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width  = CANVAS_SIZE;
    exportCanvas.height = CANVAS_SIZE;
    const ctx = exportCanvas.getContext('2d');

    drawCanvas(ctx, eq, CANVAS_SIZE);

    const filename = generateFilename();

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
      }, 'image/png', 1.0);
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
    a.rel      = 'noopener';
    a.target   = '_self';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    requestAnimationFrame(() => document.body.removeChild(a));
  }

  /* ===================================================
     FILENAME — chem-equation-YYYYMMDD-HHMMSS.png
     =================================================== */
  function generateFilename() {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const date = [now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate())].join('');
    const time = [pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds())].join('');
    return 'chem-equation-' + date + '-' + time + '.png';
  }

  /* ===================================================
     STATUS BAR
     =================================================== */
  let statusTimeout = null;

  function showStatus(message, isError = false, duration = 2800) {
    if (statusTimeout) clearTimeout(statusTimeout);
    statusBar.textContent = message;
    statusBar.className   = 'status-bar' + (isError ? ' status--error' : '');
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
  input.addEventListener('keydown', updatePreview);
  input.addEventListener('paste',   () => setTimeout(updatePreview, 0));

  /* ===================================================
     INIT
     =================================================== */
  updatePreview();
  input.focus();

})();
