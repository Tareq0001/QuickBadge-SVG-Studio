/**
 * QUICKBADGE SVG STUDIO - CLIENT ENGINE
 * Generates Pure Scalable Vector Graphics (SVG) Badges on the fly
 */

(function () {
  'use strict';

  let isEnglish = false;

  // Built-in icon SVGs
  const icons = {
    check: '<path d="M4 10 L8 14 L16 6" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round"/>',
    star: '<polygon points="10,2 12.5,7.5 18,8.3 14,12.2 15,18 10,15 5,18 6,12.2 2,8.3 7.5,7.5" fill="#fcd34d"/>',
    shield: '<path d="M10 2 L17 5 V11 C17 15 10 18 10 18 C10 18 3 15 3 11 V5 Z" fill="none" stroke="white" stroke-width="2"/>',
    bolt: '<polygon points="11,2 4,11 9,11 8,18 16,8 11,8" fill="#fcd34d"/>',
    code: '<path d="M6 7 L2 11 L6 15 M14 7 L18 11 L14 15 M11 5 L9 17" fill="none" stroke="white" stroke-width="2" stroke-linecap="round"/>'
  };

  function getCharWidth(text) {
    // Approximate pixel width for standard sans-serif font
    return Math.max(20, text.length * 7.5 + 16);
  }

  function generateSVG(label, msg, leftColor, rightColor, style, iconKey) {
    const hasIcon = iconKey && icons[iconKey];
    const iconWidth = hasIcon ? 20 : 0;
    
    const leftTextWidth = getCharWidth(label) + (hasIcon ? iconWidth : 0);
    const rightTextWidth = getCharWidth(msg);
    const totalWidth = leftTextWidth + rightTextWidth;
    const height = 28;

    let rx = 4;
    if (style === 'square') rx = 0;
    else if (style === 'pill') rx = 14;

    const iconSnippet = hasIcon ? `
      <g transform="translate(8, 4) scale(1)">
        ${icons[iconKey]}
      </g>
    ` : '';

    const labelX = hasIcon ? (8 + iconWidth + (leftTextWidth - iconWidth - 8) / 2) : (leftTextWidth / 2);
    const msgX = leftTextWidth + (rightTextWidth / 2);

    const filterGlow = style === 'cyber' ? `
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
    ` : '';

    const glowAttr = style === 'cyber' ? 'filter="url(#glow)"' : '';

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="${height}" viewBox="0 0 ${totalWidth} ${height}" ${glowAttr}>
  ${filterGlow}
  <clipPath id="r">
    <rect width="${totalWidth}" height="${height}" rx="${rx}"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${leftTextWidth}" height="${height}" fill="${leftColor}"/>
    <rect x="${leftTextWidth}" width="${rightTextWidth}" height="${height}" fill="${rightColor}"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="11.5" font-weight="600">
    ${iconSnippet}
    <!-- Label shadow and text -->
    <text x="${labelX}" y="18.5" fill="#010101" fill-opacity=".3">${escapeXML(label)}</text>
    <text x="${labelX}" y="17.5" fill="#ffffff">${escapeXML(label)}</text>
    <!-- Message shadow and text -->
    <text x="${msgX}" y="18.5" fill="#010101" fill-opacity=".3">${escapeXML(msg)}</text>
    <text x="${msgX}" y="17.5" fill="#ffffff">${escapeXML(msg)}</text>
  </g>
</svg>`;

    return svg;
  }

  function escapeXML(str) {
    return str.replace(/[<>&'"]/g, c => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  }

  function update() {
    const label = document.getElementById('input-label').value.trim() || 'Label';
    const msg = document.getElementById('input-msg').value.trim() || 'Message';
    const leftColor = document.getElementById('color-left').value;
    const rightColor = document.getElementById('color-right').value;
    const style = document.getElementById('select-style').value;
    const iconKey = document.getElementById('select-icon').value;

    const svg = generateSVG(label, msg, leftColor, rightColor, style, iconKey);

    // Update preview stage
    const stage = document.getElementById('badge-stage');
    stage.innerHTML = svg;

    // Data URI for markdown
    const encodedSVG = encodeURIComponent(svg);
    const dataURI = `data:image/svg+xml;utf8,${encodedSVG}`;
    const mdSnippet = `![${label}: ${msg}](${dataURI})`;

    document.getElementById('output-code').value = mdSnippet;
  }

  function init() {
    const inputs = [
      'input-label', 'input-msg', 'color-left', 'color-right',
      'select-style', 'select-icon'
    ];

    inputs.forEach(id => {
      document.getElementById(id).addEventListener('input', update);
    });

    // Color picker sync
    document.getElementById('color-left').addEventListener('input', e => {
      document.getElementById('hex-left').value = e.target.value;
    });
    document.getElementById('hex-left').addEventListener('input', e => {
      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
        document.getElementById('color-left').value = e.target.value;
        update();
      }
    });

    document.getElementById('color-right').addEventListener('input', e => {
      document.getElementById('hex-right').value = e.target.value;
    });
    document.getElementById('hex-right').addEventListener('input', e => {
      if (/^#[0-9A-Fa-f]{6}$/.test(e.target.value)) {
        document.getElementById('color-right').value = e.target.value;
        update();
      }
    });

    // Preset chips
    document.getElementById('preset-chips').addEventListener('click', e => {
      const chip = e.target.closest('.chip');
      if (chip) {
        document.getElementById('input-label').value = chip.dataset.label;
        document.getElementById('input-msg').value = chip.dataset.msg;
        document.getElementById('color-right').value = chip.dataset.color;
        document.getElementById('hex-right').value = chip.dataset.color;
        update();
      }
    });

    // Copy Markdown
    document.getElementById('btn-copy-md').addEventListener('click', () => {
      const text = document.getElementById('output-code').value;
      navigator.clipboard.writeText(text).then(() => showCopied());
    });

    // Copy HTML
    document.getElementById('btn-copy-html').addEventListener('click', () => {
      const stage = document.getElementById('badge-stage');
      navigator.clipboard.writeText(stage.innerHTML).then(() => showCopied());
    });

    // Download SVG
    document.getElementById('btn-download-svg').addEventListener('click', () => {
      const stage = document.getElementById('badge-stage');
      const blob = new Blob([stage.innerHTML], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `badge_${Date.now()}.svg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    });

    // Language Toggle
    document.getElementById('btn-lang').addEventListener('click', () => {
      isEnglish = !isEnglish;
      document.body.classList.toggle('lang-en', isEnglish);
      document.documentElement.setAttribute('dir', isEnglish ? 'ltr' : 'rtl');
      document.documentElement.setAttribute('lang', isEnglish ? 'en' : 'ar');
      document.getElementById('btn-lang').textContent = isEnglish ? 'العربية' : 'English';
    });

    function showCopied() {
      const el = document.getElementById('copied-badge');
      el.style.display = 'inline';
      setTimeout(() => { el.style.display = 'none'; }, 2000);
    }

    update();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
