const Coding = (() => {
  let editor = null;
  let currentId = null;
  let showingSolution = false;
  let msgHandlerAttached = false;

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
    const body = document.getElementById('coding-body');
    const q = App.coding.find(c => c.id === currentId);
    if (!q) { body.innerHTML = '<p class="muted">No coding questions yet.</p>'; return; }

    body.innerHTML = `
      <div class="card">
        <div class="row"><span class="tag ${q.source}">${q.source}</span><span class="tag module">${App.MODULES[q.module]}</span></div>
        <h2>${App.escapeHtml(q.title)}</h2>
        <p>${q.prompt}</p>
        <div class="code-layout">
          <div>
            <textarea id="code-editor">${App.escapeHtml(q.starterCode)}</textarea>
          </div>
          <div>
            <div class="preview-pane" id="preview-holder"></div>
            <div class="console-pane" id="console-out">Click Run to execute your code.</div>
          </div>
        </div>
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
      theme: 'dracula',
      lineNumbers: true,
      tabSize: 2,
    });

    document.getElementById('run-btn').addEventListener('click', () => runCode(editor.getValue()));
    document.getElementById('reset-btn').addEventListener('click', () => editor.setValue(q.starterCode));
    document.getElementById('solution-btn').addEventListener('click', () => {
      showingSolution = !showingSolution;
      renderSolution(q);
      document.getElementById('solution-btn').textContent = (showingSolution ? 'Hide' : 'Show') + ' model solution';
    });

    if (showingSolution) renderSolution(q);
    ensureMsgHandler();
    runCode(q.starterCode);
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
      if (!e.data || !e.data.__quizRunner) return;
      const out = document.getElementById('console-out');
      if (!out) return;
      const line = document.createElement('div');
      if (e.data.type === 'error') line.className = 'err';
      line.textContent = (e.data.type === 'error' ? '✗ ' : '') + e.data.args.join(' ');
      out.appendChild(line);
      out.scrollTop = out.scrollHeight;
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

  return { render };
})();
