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
  const MAX_FONT_SIZE = 22;
  const MIN_FONT_SIZE = 7;
  const MAX_TEXT_W    = 210;
  const CENTER        = CANVAS_SIZE / 2;
  const FONT_FAMILY   = 'Georgia, "Times New Roman", serif';

  /* ===================================================
     แปลง Unicode → ตัวอักษรปกติ
     =================================================== */
  const SUPER_MAP = {
    '⁰':'0','¹':'1','²':'2','³':'3','⁴':'4',
    '⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9',
    '⁺':'+','⁻':'-'
  };
  const SUB_MAP = {
    '₀':'0','₁':'1','₂':'2','₃':'3','₄':'4',
    '₅':'5','₆':'6','₇':'7','₈':'8','₉':'9'
  };
  const ARROW_MAP = {
    '→':'->','←':'<-','⇌':'<->'
  };

  /* ===================================================
     tokenize: แยกข้อความเป็น token แต่ละประเภท
     =================================================== */
  function tokenize(text) {
    const tokens = [];
    let i = 0;

    while (i < text.length) {
      const ch = text[i];

      if (ch in ARROW_MAP) {
        tokens.push({ type: 'arrow', raw: ARROW_MAP[ch] });
        i++;
      } else if (ch in SUPER_MAP) {
        let s = '';
        while (i < text.length && text[i] in SUPER_MAP) {
          s += SUPER_MAP[text[i]];
          i++;
        }
        tokens.push({ type: 'super', raw: s });
      } else if (ch in SUB_MAP) {
        let s = '';
        while (i < text.length && text[i] in SUB_MAP) {
          s += SUB_MAP[text[i]];
          i++;
        }
        tokens.push({ type: 'sub', raw: s });
      } else {
        let s = '';
        while (
          i < text.length &&
          !(text[i] in SUPER_MAP) &&
          !(text[i] in SUB_MAP) &&
          !(text[i] in ARROW_MAP)
        ) {
          s += text[i];
          i++;
        }
        if (s) tokens.push({ type: 'normal', raw: s });
      }
    }
    return tokens;
  }

  /* ===================================================
     วัดความกว้างรวมของ tokens ทั้งหมด
     =================================================== */
  function measureTokens(ctx, tokens, fontSize) {
    let total = 0;
    const superSize = Math.round(fontSize * 0.65);
    const subSize   = Math.round(fontSize * 0.65);
    const arrowW    = fontSize * 1.4;

    tokens.forEach(tok => {
      if (tok.type === 'normal') {
        ctx.font = 'bold ' + fontSize + 'px ' + FONT_FAMILY;
        total += ctx.measureText(tok.raw).width;
      } else if (tok.type === 'super') {
        ctx.font = 'bold ' + superSize + 'px ' + FONT_FAMILY;
        total += ctx.measureText(tok.raw).width;
      } else if (tok.type === 'sub') {
        ctx.font = 'bold ' + subSize + 'px ' + FONT_FAMILY;
        total += ctx.measureText(tok.raw).width;
      } else if (tok.type === 'arrow') {
        total += arrowW + 8;
      }
    });
    return total;
  }

  /* ===================================================
     หา font size ที่พอดี
     =================================================== */
  function calcFontSize(ctx, tokens) {
    let fontSize = MAX_FONT_SIZE;
    while (fontSize >= MIN_FONT_SIZE) {
      if (measureTokens(ctx, tokens, fontSize) <= MAX_TEXT_W) break;
      fontSize--;
    }
    return fontSize;
  }

  /* ===================================================
     วาดลูกศรบน Canvas โดยตรง (ไม่ใช้ Unicode)
     คืนค่าความกว้างที่ใช้ไป
     =================================================== */
  function drawArrow(ctx, type, x, y, fontSize) {
    const hw  = fontSize * 0.7;
    const ah  = fontSize * 0.28;
    const mid = y;
    const lw  = Math.max(1.5, fontSize * 0.08);

    ctx.strokeStyle = '#000000';
    ctx.fillStyle   = '#000000';
    ctx.lineWidth   = lw;
    ctx.lineCap     = 'round';

    const totalW = hw * 2;

    if (type === '->') {
      /* → */
      ctx.beginPath();
      ctx.moveTo(x, mid);
      ctx.lineTo(x + totalW - ah, mid);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + totalW, mid);
      ctx.lineTo(x + totalW - ah, mid - ah * 0.7);
      ctx.lineTo(x + totalW - ah, mid + ah * 0.7);
      ctx.closePath();
      ctx.fill();

    } else if (type === '<-') {
      /* ← */
      ctx.beginPath();
      ctx.moveTo(x + ah, mid);
      ctx.lineTo(x + totalW, mid);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, mid);
      ctx.lineTo(x + ah, mid - ah * 0.7);
      ctx.lineTo(x + ah, mid + ah * 0.7);
      ctx.closePath();
      ctx.fill();

    } else if (type === '<->') {
      /* ⇌ สองลูกศรขนาน */
      const gap = fontSize * 0.2;
      const y1  = mid - gap;
      const y2  = mid + gap;

      /* บน: → */
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x + totalW - ah, y1);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x + totalW, y1);
      ctx.lineTo(x + totalW - ah, y1 - ah * 0.6);
      ctx.lineTo(x + totalW - ah, y1 + ah * 0.6);
      ctx.closePath();
      ctx.fill();

      /* ล่าง: ← */
      ctx.beginPath();
      ctx.moveTo(x + ah, y2);
      ctx.lineTo(x + totalW, y2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x, y2);
      ctx.lineTo(x + ah, y2 - ah * 0.6);
      ctx.lineTo(x + ah, y2 + ah * 0.6);
      ctx.closePath();
      ctx.fill();
    }

    return totalW;
  }

  /* ===================================================
     วาดลง Canvas หลัก
     =================================================== */
  function drawCanvas(ctx, text, size) {
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

    const tokens   = tokenize(text);
    const fontSize = calcFontSize(ctx, tokens);

    const superSize  = Math.round(fontSize * 0.65);
    const subSize    = Math.round(fontSize * 0.65);
    const superShift = -Math.round(fontSize * 0.38);
    const subShift   =  Math.round(fontSize * 0.32);
    const arrowPad   = 4;

    /* วัดความกว้างรวมเพื่อจัดกึ่งกลาง */
    const totalWidth = measureTokens(ctx, tokens, fontSize);
    let x = CENTER - totalWidth / 2;

    ctx.fillStyle    = '#000000';
    ctx.textBaseline = 'middle';
    ctx.textAlign    = 'left';

    tokens.forEach(tok => {
      if (tok.type === 'normal') {
        ctx.font = 'bold ' + fontSize + 'px ' + FONT_FAMILY;
        ctx.fillStyle = '#000000';
        ctx.fillText(tok.raw, x, CENTER);
        x += ctx.measureText(tok.raw).width;

      } else if (tok.type === 'super') {
        ctx.font = 'bold ' + superSize + 'px ' + FONT_FAMILY;
        ctx.fillStyle = '#000000';
        ctx.fillText(tok.raw, x, CENTER + superShift);
        x += ctx.measureText(tok.raw).width;

      } else if (tok.type === 'sub') {
        ctx.font = 'bold ' + subSize + 'px ' + FONT_FAMILY;
        ctx.fillStyle = '#000000';
        ctx.fillText(tok.raw, x, CENTER + subShift);
        x += ctx.measureText(tok.raw).width;

      } else if (tok.type === 'arrow') {
        x += arrowPad;
        const w = drawArrow(ctx, tok.raw, x, CENTER, fontSize);
        x += w + arrowPad;
        /* reset หลังวาดลูกศร */
        ctx.fillStyle   = '#000000';
        ctx.strokeStyle = '#000000';
      }
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
     TOOL PANELS
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
        if (!blob) { fallbackDataURL(exportCanvas, filename); return; }
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
    a.href = href;
    a.download = filename;
    a.rel = 'noopener';
    a.target = '_self';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    requestAnimationFrame(() => document.body.removeChild(a));
  }

  /* ===================================================
     FILENAME
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
