// Core: storage, state, routing, shared utilities.
const App = (() => {
  const LS_MCQ = 'infovis_mcq_v1';
  const LS_CODING = 'infovis_coding_v1';
  const LS_PROGRESS = 'infovis_progress_v1';
  const LS_THEME = 'infovis_theme_v1';

  const MODULES = {
    intro: 'Introduction',
    m1: 'Data Types & Colors',
    m2: 'Multivariate Data',
    m3: 'Networks & Graph Viz',
    m4: 'Hierarchies',
    m5: 'Text Visualization',
  };

  let state = {
    mcq: [],
    coding: [],
    progress: { answers: {} }, // qid -> {correctCount, wrongCount, lastCorrect}
    view: 'quiz',
  };

  function loadJSON(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      console.warn('Failed to parse', key, e);
      return fallback;
    }
  }

  function save(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function mergeSeed(existing, seed) {
    const ids = new Set(existing.map(q => q.id));
    const merged = existing.slice();
    seed.forEach(q => {
      if (!ids.has(q.id)) merged.push(structuredClone(q));
    });
    return merged;
  }

  function init() {
    const storedMcq = loadJSON(LS_MCQ, null);
    state.mcq = storedMcq ? mergeSeed(storedMcq, window.SEED_MCQ || []) : structuredClone(window.SEED_MCQ || []);
    save(LS_MCQ, state.mcq);

    const storedCoding = loadJSON(LS_CODING, null);
    state.coding = storedCoding ? mergeSeed(storedCoding, window.SEED_CODING || []) : structuredClone(window.SEED_CODING || []);
    save(LS_CODING, state.coding);

    state.progress = loadJSON(LS_PROGRESS, { answers: {} });

    const theme = localStorage.getItem(LS_THEME) || (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('theme-toggle').addEventListener('click', () => {
      const cur = document.documentElement.getAttribute('data-theme');
      const next = cur === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(LS_THEME, next);
    });

    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    switchView('quiz');
  }

  function switchView(view) {
    state.view = view;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-' + view).classList.add('active');
    if (view === 'quiz') Quiz.render();
    if (view === 'coding') Coding.render();
    if (view === 'manage') Manage.render();
    if (view === 'import') Importer.render();
    if (view === 'stats') renderStats();
  }

  function saveMcq() { save(LS_MCQ, state.mcq); }
  function saveCoding() { save(LS_CODING, state.coding); }
  function saveProgress() { save(LS_PROGRESS, state.progress); }

  function recordAnswer(qid, correct) {
    const p = state.progress.answers[qid] || { correctCount: 0, wrongCount: 0, lastCorrect: null };
    if (correct) p.correctCount++; else p.wrongCount++;
    p.lastCorrect = correct;
    p.lastSeen = Date.now();
    state.progress.answers[qid] = p;
    saveProgress();
  }

  function nextId(prefix, arr) {
    let n = 1;
    const ids = new Set(arr.map(x => x.id));
    let id;
    do { id = prefix + '-' + Date.now().toString(36) + '-' + (n++); } while (ids.has(id));
    return id;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function renderStats() {
    const el = document.getElementById('view-stats');
    const answers = state.progress.answers;
    const qids = Object.keys(answers);
    const totalAttempts = qids.reduce((s, id) => s + answers[id].correctCount + answers[id].wrongCount, 0);
    const totalCorrect = qids.reduce((s, id) => s + answers[id].correctCount, 0);
    const acc = totalAttempts ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    const seedCount = state.mcq.filter(q => q.source === 'seed').length;
    const studonCount = state.mcq.filter(q => q.source === 'studon').length;

    const perModule = Object.keys(MODULES).map(m => {
      const qs = state.mcq.filter(q => q.module === m);
      const attempted = qs.filter(q => answers[q.id]);
      const correct = attempted.reduce((s, q) => s + (answers[q.id].correctCount > 0 && answers[q.id].lastCorrect ? 1 : 0), 0);
      return { m, total: qs.length, attempted: attempted.length, correct };
    });

    const weakest = state.mcq
      .filter(q => answers[q.id] && answers[q.id].wrongCount > 0)
      .sort((a, b) => (answers[b.id].wrongCount - answers[b.id].correctCount) - (answers[a.id].wrongCount - answers[a.id].correctCount))
      .slice(0, 8);

    el.innerHTML = `
      <div class="card">
        <h2>Overview</h2>
        <div class="stat-grid">
          <div class="stat-box"><div class="big">${state.mcq.length}</div><div class="lbl">Total MCQs</div></div>
          <div class="stat-box"><div class="big">${seedCount}</div><div class="lbl">Seed</div></div>
          <div class="stat-box"><div class="big">${studonCount}</div><div class="lbl">StudOn</div></div>
          <div class="stat-box"><div class="big">${state.coding.length}</div><div class="lbl">Coding Qs</div></div>
          <div class="stat-box"><div class="big">${totalAttempts}</div><div class="lbl">Answers logged</div></div>
          <div class="stat-box"><div class="big">${acc}%</div><div class="lbl">Overall accuracy</div></div>
        </div>
      </div>
      <div class="card">
        <h2>By module</h2>
        <table class="manage-table">
          <thead><tr><th>Module</th><th>Questions</th><th>Attempted</th><th>Currently correct</th></tr></thead>
          <tbody>
            ${perModule.map(pm => `<tr><td>${MODULES[pm.m]}</td><td>${pm.total}</td><td>${pm.attempted}</td><td>${pm.correct}/${pm.attempted}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div class="card">
        <h2>Needs review</h2>
        ${weakest.length === 0 ? '<p class="muted">No missed questions logged yet — take a quiz first.</p>' : `
        <table class="manage-table">
          <thead><tr><th>Module</th><th>Question</th><th>Wrong</th><th>Right</th></tr></thead>
          <tbody>
            ${weakest.map(q => `<tr><td>${MODULES[q.module]}</td><td>${escapeHtml(q.question).slice(0, 90)}</td><td>${answers[q.id].wrongCount}</td><td>${answers[q.id].correctCount}</td></tr>`).join('')}
          </tbody>
        </table>`}
      </div>
      <div class="card">
        <h2>Backup</h2>
        <p class="muted">Everything lives in this browser's localStorage. Export a backup before clearing site data.</p>
        <div class="row">
          <button class="btn secondary" id="export-btn">Export JSON</button>
          <button class="btn secondary" id="import-json-btn">Import JSON</button>
          <input type="file" id="import-json-file" accept="application/json" style="display:none">
        </div>
      </div>
    `;
    el.querySelector('#export-btn').addEventListener('click', exportBackup);
    el.querySelector('#import-json-btn').addEventListener('click', () => el.querySelector('#import-json-file').click());
    el.querySelector('#import-json-file').addEventListener('change', importBackup);
  }

  function exportBackup() {
    const data = { mcq: state.mcq, coding: state.coding, progress: state.progress, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'infovis-quiz-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importBackup(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.mcq) state.mcq = data.mcq;
        if (data.coding) state.coding = data.coding;
        if (data.progress) state.progress = data.progress;
        saveMcq(); saveCoding(); saveProgress();
        alert('Backup imported.');
        renderStats();
      } catch (err) {
        alert('Could not parse that file: ' + err.message);
      }
    };
    reader.readAsText(file);
  }

  return {
    init, switchView, MODULES,
    get mcq() { return state.mcq; },
    get coding() { return state.coding; },
    get progress() { return state.progress; },
    saveMcq, saveCoding, saveProgress, recordAnswer, nextId, escapeHtml, shuffle,
  };
})();
