const Coding = (() => {
  let editor = null;
  let currentId = null;
  let showingSolution = false;
  let msgHandlerAttached = false;

  // --- playground state (reset per question) ---
  let pg = null; // { q, values, solutionFrame, liveFrame, pendingBySource: Map, updateScheduled }

  function render() {
    const el = document.getElementById('view-coding');
    const modules = App.MODULES;
    const all = App.coding;
    if (!currentId && all.length) currentId = all[0].id;

    el.innerHTML = `
      <div class="card">
        <div class="row">
          <label class="field" style="flex:1;">
            Question
            <select id="coding-select">
              ${all.map(q => `<option value="${q.id}" ${q.id === currentId ? 'selected' : ''}>
                [${modules[q.module]}] ${App.escapeHtml(q.title)} (${q.source})
              </option>`).join('')}
            </select>
          </label>
        </div>
      </div>
      <div id="coding-body"></div>
    `;
    el.querySelector('#coding-select').addEventListener('change', (e) => {
      currentId = e.target.value;
      showingSolution = false;
      renderBody();
    });
    renderBody();
  }

  function renderBody() {
    teardownPlayground();
    const body = document.getElementById('coding-body');
    const q = App.coding.find(c => c.id === currentId);
    if (!q) { body.innerHTML = '<p class="muted">No coding questions yet.</p>'; return; }
    // localStorage round-trips through JSON, which silently drops function-valued fields
    // (playground.buildArgs) — restore it from the pristine in-memory seed data if missing.
    if (!q.playground) {
      const pristine = (window.SEED_CODING || []).find(s => s.id === q.id);
      if (pristine && pristine.playground) q.playground = pristine.playground;
    }

    body.innerHTML = `
      <div class="card">
        <div class="row"><span class="tag ${q.source}">${q.source}</span><span class="tag module">${App.MODULES[q.module]}</span></div>
        <h2>${App.escapeHtml(q.title)}</h2>
        <p class="prompt-text">${q.prompt}</p>

        ${q.playground ? playgroundHtml(q) : ''}

        <div class="code-layout">
          <div>
            <div class="panel-label">Your code</div>
            <textarea id="code-editor">${App.escapeHtml(q.starterCode)}</textarea>
          </div>
          <div>
            <div class="panel-label">Live preview</div>
            <div class="preview-pane" id="preview-holder"></div>
            <div class="console-pane" id="console-out">Click Run to execute your code.</div>
          </div>
        </div>
        <div id="hint-holder"></div>
        <div class="row" style="margin-top:0.8rem;">
          <button class="btn" id="run-btn">Run ▶</button>
          <button class="btn secondary" id="reset-btn">Reset starter code</button>
          <button class="btn secondary" id="solution-btn">${showingSolution ? 'Hide' : 'Show'} model solution</button>
        </div>
        <div id="solution-holder"></div>
      </div>
    `;

    editor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
      mode: 'javascript',
      theme: 'infovis',
      lineNumbers: true,
      tabSize: 2,
    });

    document.getElementById('run-btn').addEventListener('click', () => { runCode(editor.getValue()); revealHint(q); });
    document.getElementById('reset-btn').addEventListener('click', () => {
      editor.setValue(q.starterCode);
      document.getElementById('hint-holder').innerHTML = '';
    });
    document.getElementById('solution-btn').addEventListener('click', () => {
      showingSolution = !showingSolution;
      renderSolution(q);
      document.getElementById('solution-btn').textContent = (showingSolution ? 'Hide' : 'Show') + ' model solution';
    });

    if (showingSolution) renderSolution(q);
    ensureMsgHandler();
    runCode(q.starterCode);

    if (q.playground) initPlayground(q);
  }

  function revealHint(q) {
    const holder = document.getElementById('hint-holder');
    if (!holder || !q.hint) return;
    holder.innerHTML = `<div class="explanation"><strong>Hint:</strong> ${App.escapeHtml(q.hint)}</div>`;
  }

  function renderSolution(q) {
    const holder = document.getElementById('solution-holder');
    if (!showingSolution) { holder.innerHTML = ''; return; }
    holder.innerHTML = `
      <div class="explanation">
        <strong>Model solution</strong>
        <pre style="white-space:pre-wrap; margin:0.5rem 0 0;">${App.escapeHtml(q.solutionCode)}</pre>
        ${q.notes ? `<p class="muted">${App.escapeHtml(q.notes)}</p>` : ''}
      </div>
    `;
  }

  function ensureMsgHandler() {
    if (msgHandlerAttached) return;
    msgHandlerAttached = true;
    window.addEventListener('message', (e) => {
      if (!e.data) return;
      if (e.data.__quizRunner) {
        const out = document.getElementById('console-out');
        if (!out) return;
        const line = document.createElement('div');
        if (e.data.type === 'error') line.className = 'err';
        line.textContent = (e.data.type === 'error' ? '✗ ' : '') + e.data.args.join(' ');
        out.appendChild(line);
        out.scrollTop = out.scrollHeight;
        return;
      }
      if (e.data.__pgResult) {
        handlePlaygroundResult(e);
      }
    });
  }

  function runCode(code) {
    const holder = document.getElementById('preview-holder');
    const out = document.getElementById('console-out');
    out.textContent = '';
    holder.innerHTML = '';
    const iframe = document.createElement('iframe');
    iframe.sandbox = 'allow-scripts';
    holder.appendChild(iframe);

    const safeCode = code.split('</scr' + 'ipt>').join('<\\/script>');
    const doc = `<!DOCTYPE html><html><head>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/d3/7.9.0/d3.min.js"></script>
      <style>body{font-family:sans-serif;margin:8px;color:#111;} svg{max-width:100%;}</style>
      </head><body>
      <div id="app"></div>
      <script>
      (function(){
        function safeStr(x){ try { return typeof x==='object' ? JSON.stringify(x) : String(x); } catch(e){ return String(x); } }
        console.log = function(){ parent.postMessage({__quizRunner:true, type:'log', args:[].slice.call(arguments).map(safeStr)}, '*'); };
        console.error = function(){ parent.postMessage({__quizRunner:true, type:'error', args:[].slice.call(arguments).map(safeStr)}, '*'); };
        window.onerror = function(msg, src, line){ parent.postMessage({__quizRunner:true, type:'error', args:[msg + ' (line ' + line + ')']}, '*'); return true; };
        try {
          ${safeCode}
        } catch (e) {
          console.error(e.message);
        }
      })();
      <\/script>
      </body></html>`;
    iframe.srcdoc = doc;
  }

  // ===================== Playground =====================

  function playgroundHtml(q) {
    const controls = q.playground.params.map(paramControlHtml).join('');
    return `
      <div class="playground-panel">
        <div class="panel-label">Playground — drag the controls, watch both swatches react</div>
        <div class="pg-controls">${controls}</div>
        <div class="pg-compare">
          <div class="pg-swatch-block">
            <div class="pg-swatch-label">Model solution</div>
            <div class="pg-swatch" id="pg-swatch-solution"></div>
            <div class="pg-readout" id="pg-value-solution">—</div>
          </div>
          <div class="pg-vs">vs</div>
          <div class="pg-swatch-block">
            <div class="pg-swatch-label">Your code</div>
            <div class="pg-swatch" id="pg-swatch-live"></div>
            <div class="pg-readout" id="pg-value-live">—</div>
          </div>
        </div>
      </div>
    `;
  }

  function paramControlHtml(p) {
    if (p.type === 'range') {
      return `
        <label class="pg-param">
          <span class="pg-param-label">${App.escapeHtml(p.label)} <b id="pg-readout-${p.key}">${formatNum(p.default, p.step)}</b></span>
          <input type="range" id="pg-input-${p.key}" min="${p.min}" max="${p.max}" step="${p.step}" value="${p.default}">
        </label>`;
    }
    if (p.type === 'color') {
      return `
        <label class="pg-param">
          <span class="pg-param-label">${App.escapeHtml(p.label)}</span>
          <input type="color" id="pg-input-${p.key}" value="${p.default}">
        </label>`;
    }
    return '';
  }

  function formatNum(n, step) {
    const decimals = step && step < 1 ? String(step).split('.')[1].length : 0;
    return Number(n).toFixed(decimals);
  }

  function hexToRgbLocal(hex) {
    return [parseInt(hex.substr(1, 2), 16), parseInt(hex.substr(3, 2), 16), parseInt(hex.substr(5, 2), 16)];
  }

  function hsvToCssLocal(h, s, v) {
    const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
    let r, g, b;
    if (h < 60) { [r, g, b] = [c, x, 0]; }
    else if (h < 120) { [r, g, b] = [x, c, 0]; }
    else if (h < 180) { [r, g, b] = [0, c, x]; }
    else if (h < 240) { [r, g, b] = [0, x, c]; }
    else if (h < 300) { [r, g, b] = [x, 0, c]; }
    else { [r, g, b] = [c, 0, x]; }
    return `rgb(${Math.round((r + m) * 255)},${Math.round((g + m) * 255)},${Math.round((b + m) * 255)})`;
  }

  function valueToDisplay(kind, value) {
    if (value === undefined) return { css: null, text: 'not implemented yet' };
    if (kind === 'hex') {
      if (typeof value !== 'string') return { css: null, text: 'expected a hex string, got: ' + JSON.stringify(value) };
      return { css: value, text: value };
    }
    if (kind === 'rgbArray') {
      if (!Array.isArray(value) || value.length < 3) return { css: null, text: 'expected [r,g,b], got: ' + JSON.stringify(value) };
      const r = Math.round(value[0]), g = Math.round(value[1]), b = Math.round(value[2]);
      return { css: `rgb(${r},${g},${b})`, text: `[${r}, ${g}, ${b}]` };
    }
    if (kind === 'hsvArray') {
      if (!Array.isArray(value) || value.length < 3) return { css: null, text: 'expected [h,s,v], got: ' + JSON.stringify(value) };
      return { css: hsvToCssLocal(value[0], value[1], value[2]), text: `[${Math.round(value[0])}°, ${value[1].toFixed(2)}, ${value[2].toFixed(2)}]` };
    }
    return { css: null, text: String(value) };
  }

  function initPlayground(q) {
    const values = {};
    q.playground.params.forEach(p => {
      values[p.key] = p.type === 'range' ? p.default : p.default;
      if (p.type === 'color') values['__' + p.key + '_rgb'] = hexToRgbLocal(p.default);
    });

    pg = { q, values, solutionFrame: null, liveFrame: null, reqCounter: 0, pending: new Map(), updateScheduled: false };

    pg.solutionFrame = createInvokeFrame(q.solutionCode);
    pg.liveFrame = createInvokeFrame(editor.getValue());
    const holder = document.createElement('div');
    holder.style.display = 'none';
    holder.appendChild(pg.solutionFrame);
    holder.appendChild(pg.liveFrame);
    document.getElementById('coding-body').appendChild(holder);

    q.playground.params.forEach(p => {
      const input = document.getElementById('pg-input-' + p.key);
      input.addEventListener('input', () => {
        if (p.type === 'range') {
          values[p.key] = parseFloat(input.value);
          document.getElementById('pg-readout-' + p.key).textContent = formatNum(values[p.key], p.step);
        } else {
          values[p.key] = input.value;
          values['__' + p.key + '_rgb'] = hexToRgbLocal(input.value);
        }
        schedulePlaygroundUpdate();
      });
    });

    editor.on('change', () => {
      clearTimeout(pg.editorTimer);
      pg.editorTimer = setTimeout(() => {
        if (!pg) return;
        const newFrame = createInvokeFrame(editor.getValue());
        pg.liveFrame.replaceWith(newFrame);
        pg.liveFrame = newFrame;
        schedulePlaygroundUpdate();
      }, 500);
    });

    schedulePlaygroundUpdate();
  }

  function teardownPlayground() {
    pg = null;
  }

  function createInvokeFrame(code) {
    const iframe = document.createElement('iframe');
    iframe.sandbox = 'allow-scripts';
    const safeCode = code.split('</scr' + 'ipt>').join('<\\/script>');
    iframe.srcdoc = `<!DOCTYPE html><html><head></head><body><div id="app" style="display:none"></div>
      <script>
      (function(){
        window.addEventListener('message', function(e){
          if (!e.data || e.data.__pgInvoke !== true) return;
          var reqId = e.data.reqId, fnName = e.data.fnName, args = e.data.args;
          try {
            var fn = window[fnName];
            if (typeof fn !== 'function') throw new Error('"' + fnName + '" is not defined');
            var result = fn.apply(null, args);
            parent.postMessage({ __pgResult: true, reqId: reqId, ok: true, value: result }, '*');
          } catch (err) {
            parent.postMessage({ __pgResult: true, reqId: reqId, ok: false, error: err.message }, '*');
          }
        });
      })();
      try {
        ${safeCode}
      } catch (e) { /* function(s) may be undefined; invoke will report that */ }
      <\/script>
      </body></html>`;
    iframe.__ready = false;
    iframe.addEventListener('load', () => { iframe.__ready = true; });
    return iframe;
  }

  function schedulePlaygroundUpdate() {
    if (!pg || pg.updateScheduled) return;
    pg.updateScheduled = true;
    requestAnimationFrame(() => {
      if (!pg) return;
      pg.updateScheduled = false;
      doPlaygroundUpdate();
    });
  }

  function doPlaygroundUpdate() {
    if (!pg) return;
    const q = pg.q;
    const args = q.playground.buildArgs(pg.values);
    invokeFrame(pg.solutionFrame, q.playground.fn, args, 'solution');
    invokeFrame(pg.liveFrame, q.playground.fn, args, 'live');
  }

  function invokeFrame(frame, fnName, args, which) {
    if (!frame || !frame.contentWindow) return;
    const reqId = ++pg.reqCounter;
    pg.pending.set(frame, { reqId, which });
    const send = () => frame.contentWindow.postMessage({ __pgInvoke: true, reqId, fnName, args }, '*');
    if (frame.__ready) send();
    else frame.addEventListener('load', send, { once: true });
  }

  function handlePlaygroundResult(e) {
    if (!pg) return;
    let which = null;
    if (e.source === pg.solutionFrame.contentWindow) which = 'solution';
    else if (e.source === pg.liveFrame.contentWindow) which = 'live';
    if (!which) return;
    const frame = which === 'solution' ? pg.solutionFrame : pg.liveFrame;
    const record = pg.pending.get(frame);
    if (!record || record.reqId !== e.data.reqId) return; // stale response, ignore

    const swatch = document.getElementById('pg-swatch-' + which);
    const readout = document.getElementById('pg-value-' + which);
    if (!swatch || !readout) return;

    if (!e.data.ok) {
      swatch.style.background = 'repeating-linear-gradient(45deg, #444 0 6px, #666 6px 12px)';
      readout.textContent = 'Error: ' + e.data.error;
      readout.classList.add('pg-error-text');
      return;
    }
    readout.classList.remove('pg-error-text');
    const disp = valueToDisplay(pg.q.playground.toCss, e.data.value);
    swatch.style.background = disp.css || 'repeating-linear-gradient(45deg, #444 0 6px, #666 6px 12px)';
    readout.textContent = disp.text;
  }

  return { render };
})();
