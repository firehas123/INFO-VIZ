const Manage = (() => {
  let tab = 'mcq'; // 'mcq' | 'coding'
  let editingId = null;
  let filters = { module: 'all', source: 'all', search: '' };

  function render() {
    const el = document.getElementById('view-manage');
    el.innerHTML = `
      <div class="card">
        <div class="row" style="justify-content:space-between;">
          <div class="row">
            <button class="btn ${tab === 'mcq' ? '' : 'secondary'}" id="tab-mcq-btn">MCQs (${App.mcq.length})</button>
            <button class="btn ${tab === 'coding' ? '' : 'secondary'}" id="tab-coding-btn">Coding (${App.coding.length})</button>
          </div>
          <button class="btn" id="add-new-btn">+ Add new</button>
        </div>
        <div class="row" style="margin-top:0.8rem;">
          <label class="field">Module
            <select id="filter-module">
              <option value="all">All</option>
              ${Object.keys(App.MODULES).map(m => `<option value="${m}">${App.MODULES[m]}</option>`).join('')}
            </select>
          </label>
          <label class="field">Source
            <select id="filter-source">
              <option value="all">All</option>
              <option value="seed">Seed</option>
              <option value="studon">StudOn</option>
            </select>
          </label>
          <label class="field" style="flex:1;">Search
            <input type="text" id="filter-search" placeholder="Search question text...">
          </label>
        </div>
      </div>
      <div id="manage-list"></div>
    `;
    el.querySelector('#tab-mcq-btn').addEventListener('click', () => { tab = 'mcq'; editingId = null; render(); });
    el.querySelector('#tab-coding-btn').addEventListener('click', () => { tab = 'coding'; editingId = null; render(); });
    el.querySelector('#add-new-btn').addEventListener('click', addNew);
    el.querySelector('#filter-module').value = filters.module;
    el.querySelector('#filter-source').value = filters.source;
    el.querySelector('#filter-search').value = filters.search;
    el.querySelector('#filter-module').addEventListener('change', (e) => { filters.module = e.target.value; renderList(); });
    el.querySelector('#filter-source').addEventListener('change', (e) => { filters.source = e.target.value; renderList(); });
    el.querySelector('#filter-search').addEventListener('input', (e) => { filters.search = e.target.value; renderList(); });
    renderList();
  }

  function filtered(arr) {
    return arr.filter(q => {
      if (filters.module !== 'all' && q.module !== filters.module) return false;
      if (filters.source !== 'all' && q.source !== filters.source) return false;
      if (filters.search) {
        const hay = (tab === 'mcq' ? q.question : (q.title + ' ' + q.prompt)).toLowerCase();
        if (!hay.includes(filters.search.toLowerCase())) return false;
      }
      return true;
    });
  }

  function renderList() {
    const holder = document.getElementById('manage-list');
    const arr = tab === 'mcq' ? App.mcq : App.coding;
    const list = filtered(arr);
    if (list.length === 0) {
      holder.innerHTML = '<div class="card muted">No questions match those filters.</div>';
      return;
    }
    holder.innerHTML = list.map(q => tab === 'mcq' ? mcqRow(q) : codingRow(q)).join('');
    attachRowHandlers(list);
  }

  function mcqRow(q) {
    if (editingId === q.id) return mcqEditForm(q);
    return `
      <div class="card" data-id="${q.id}">
        <div class="row" style="justify-content:space-between;">
          <div class="row">
            <span class="tag ${q.source}">${q.source}</span>
            <span class="tag module">${App.MODULES[q.module]}</span>
            ${q.recall ? '<span class="tag recall">recall</span>' : ''}
            <span class="muted">${q.type === 'mcq-multi' ? 'multi-select' : 'single-select'}</span>
          </div>
          <div class="row">
            <button class="btn secondary edit-btn" data-id="${q.id}">Edit</button>
            <button class="btn danger delete-btn" data-id="${q.id}">Delete</button>
          </div>
        </div>
        <p class="question-text">${App.escapeHtml(q.question)}</p>
        <ul>
          ${q.options.map((o, i) => `<li>${q.correctIndexes.includes(i) ? '<strong>✓ ' + App.escapeHtml(o) + '</strong>' : App.escapeHtml(o)}</li>`).join('')}
        </ul>
        ${q.explanation ? `<p class="muted">${App.escapeHtml(q.explanation)}</p>` : ''}
      </div>
    `;
  }

  function mcqEditForm(q) {
    return `
      <div class="card" data-id="${q.id}">
        <label class="field">Question
          <textarea class="edit-question" rows="2" style="width:100%;">${App.escapeHtml(q.question)}</textarea>
        </label>
        <div class="row" style="margin:0.5rem 0;">
          <label class="field">Module
            <select class="edit-module">
              ${Object.keys(App.MODULES).map(m => `<option value="${m}" ${m === q.module ? 'selected' : ''}>${App.MODULES[m]}</option>`).join('')}
            </select>
          </label>
          <label class="field">Source
            <select class="edit-source">
              <option value="seed" ${q.source === 'seed' ? 'selected' : ''}>seed</option>
              <option value="studon" ${q.source === 'studon' ? 'selected' : ''}>studon</option>
            </select>
          </label>
          <label class="field">Type
            <select class="edit-type">
              <option value="mcq-single" ${q.type === 'mcq-single' ? 'selected' : ''}>Single answer</option>
              <option value="mcq-multi" ${q.type === 'mcq-multi' ? 'selected' : ''}>Multiple answers</option>
            </select>
          </label>
          <label class="field" style="flex-direction:row; align-items:center; gap:0.4rem; margin-top:1.1rem;">
            <input type="checkbox" class="edit-recall" ${q.recall ? 'checked' : ''}> Recall item
          </label>
        </div>
        <div class="opt-editor">
          ${q.options.map((o, i) => `
            <div class="opt-edit-row" data-i="${i}">
              <input type="${q.type === 'mcq-multi' ? 'checkbox' : 'radio'}" name="edit-correct-${q.id}" class="opt-correct" ${q.correctIndexes.includes(i) ? 'checked' : ''}>
              <input type="text" class="opt-text" value="${App.escapeHtml(o)}">
              <button class="btn secondary remove-opt-btn" style="padding:0.2rem 0.5rem;">✕</button>
            </div>
          `).join('')}
        </div>
        <button class="btn secondary add-opt-btn" style="margin-top:0.3rem;">+ Add option</button>
        <label class="field" style="margin-top:0.5rem;">Explanation
          <textarea class="edit-explanation" rows="2" style="width:100%;">${App.escapeHtml(q.explanation || '')}</textarea>
        </label>
        <div class="row" style="margin-top:0.6rem;">
          <button class="btn save-mcq-btn" data-id="${q.id}">Save</button>
          <button class="btn secondary cancel-btn">Cancel</button>
        </div>
      </div>
    `;
  }

  function codingRow(q) {
    if (editingId === q.id) return codingEditForm(q);
    return `
      <div class="card" data-id="${q.id}">
        <div class="row" style="justify-content:space-between;">
          <div class="row">
            <span class="tag ${q.source}">${q.source}</span>
            <span class="tag module">${App.MODULES[q.module]}</span>
          </div>
          <div class="row">
            <button class="btn secondary edit-btn" data-id="${q.id}">Edit</button>
            <button class="btn danger delete-btn" data-id="${q.id}">Delete</button>
          </div>
        </div>
        <h3 style="margin:0.3rem 0;">${App.escapeHtml(q.title)}</h3>
        <p class="muted">${q.prompt}</p>
      </div>
    `;
  }

  function codingEditForm(q) {
    return `
      <div class="card" data-id="${q.id}">
        <label class="field">Title
          <input type="text" class="edit-title" value="${App.escapeHtml(q.title)}" style="width:100%;">
        </label>
        <div class="row" style="margin:0.5rem 0;">
          <label class="field">Module
            <select class="edit-module">
              ${Object.keys(App.MODULES).map(m => `<option value="${m}" ${m === q.module ? 'selected' : ''}>${App.MODULES[m]}</option>`).join('')}
            </select>
          </label>
          <label class="field">Source
            <select class="edit-source">
              <option value="seed" ${q.source === 'seed' ? 'selected' : ''}>seed</option>
              <option value="studon" ${q.source === 'studon' ? 'selected' : ''}>studon</option>
            </select>
          </label>
        </div>
        <label class="field">Prompt (HTML allowed)
          <textarea class="edit-prompt" rows="3" style="width:100%;">${App.escapeHtml(q.prompt)}</textarea>
        </label>
        <label class="field" style="margin-top:0.5rem;">Starter code
          <textarea class="edit-starter" rows="8" style="width:100%; font-family:monospace;">${App.escapeHtml(q.starterCode)}</textarea>
        </label>
        <label class="field" style="margin-top:0.5rem;">Solution code
          <textarea class="edit-solution" rows="8" style="width:100%; font-family:monospace;">${App.escapeHtml(q.solutionCode)}</textarea>
        </label>
        <label class="field" style="margin-top:0.5rem;">Notes
          <textarea class="edit-notes" rows="2" style="width:100%;">${App.escapeHtml(q.notes || '')}</textarea>
        </label>
        <label class="field" style="margin-top:0.5rem;">Hint (shown after Run)
          <input type="text" class="edit-hint" value="${App.escapeHtml(q.hint || '')}" style="width:100%;">
        </label>
        <div class="row" style="margin-top:0.6rem;">
          <button class="btn save-coding-btn" data-id="${q.id}">Save</button>
          <button class="btn secondary cancel-btn">Cancel</button>
        </div>
      </div>
    `;
  }

  function attachRowHandlers(list) {
    document.querySelectorAll('.edit-btn').forEach(b => b.addEventListener('click', () => { editingId = b.dataset.id; renderList(); }));
    document.querySelectorAll('.cancel-btn').forEach(b => b.addEventListener('click', () => { editingId = null; renderList(); }));
    document.querySelectorAll('.delete-btn').forEach(b => b.addEventListener('click', () => {
      if (!confirm('Delete this question permanently?')) return;
      if (tab === 'mcq') {
        const arr = App.mcq;
        const idx = arr.findIndex(x => x.id === b.dataset.id);
        if (idx >= 0) arr.splice(idx, 1);
        App.saveMcq();
      } else {
        const arr = App.coding;
        const idx = arr.findIndex(x => x.id === b.dataset.id);
        if (idx >= 0) arr.splice(idx, 1);
        App.saveCoding();
      }
      renderList();
    }));

    document.querySelectorAll('.card[data-id]').forEach(card => {
      const id = card.dataset.id;
      if (editingId !== id) return;
      card.querySelectorAll('.add-opt-btn').forEach(btn => btn.addEventListener('click', () => {
        const arr = tab === 'mcq' ? App.mcq : App.coding;
        const q = arr.find(x => x.id === id);
        q.options.push('');
        renderList();
      }));
      card.querySelectorAll('.remove-opt-btn').forEach(btn => btn.addEventListener('click', (e) => {
        const row = e.target.closest('.opt-edit-row');
        const i = parseInt(row.dataset.i, 10);
        const arr = tab === 'mcq' ? App.mcq : App.coding;
        const q = arr.find(x => x.id === id);
        q.options.splice(i, 1);
        q.correctIndexes = q.correctIndexes.filter(x => x !== i).map(x => x > i ? x - 1 : x);
        renderList();
      }));
      const saveMcqBtn = card.querySelector('.save-mcq-btn');
      if (saveMcqBtn) saveMcqBtn.addEventListener('click', () => saveMcqEdit(card, id));
      const saveCodingBtn = card.querySelector('.save-coding-btn');
      if (saveCodingBtn) saveCodingBtn.addEventListener('click', () => saveCodingEdit(card, id));
    });
  }

  function saveMcqEdit(card, id) {
    const q = App.mcq.find(x => x.id === id);
    q.question = card.querySelector('.edit-question').value.trim();
    q.module = card.querySelector('.edit-module').value;
    q.source = card.querySelector('.edit-source').value;
    q.type = card.querySelector('.edit-type').value;
    q.recall = card.querySelector('.edit-recall').checked;
    q.explanation = card.querySelector('.edit-explanation').value.trim();
    const optRows = Array.from(card.querySelectorAll('.opt-edit-row'));
    q.options = optRows.map(r => r.querySelector('.opt-text').value.trim());
    q.correctIndexes = optRows.map((r, i) => r.querySelector('.opt-correct').checked ? i : -1).filter(i => i >= 0);
    if (q.correctIndexes.length === 0) q.correctIndexes = [0];
    App.saveMcq();
    editingId = null;
    renderList();
  }

  function saveCodingEdit(card, id) {
    const q = App.coding.find(x => x.id === id);
    q.title = card.querySelector('.edit-title').value.trim();
    q.module = card.querySelector('.edit-module').value;
    q.source = card.querySelector('.edit-source').value;
    q.prompt = card.querySelector('.edit-prompt').value.trim();
    q.starterCode = card.querySelector('.edit-starter').value;
    q.solutionCode = card.querySelector('.edit-solution').value;
    q.notes = card.querySelector('.edit-notes').value.trim();
    q.hint = card.querySelector('.edit-hint').value.trim();
    App.saveCoding();
    editingId = null;
    renderList();
  }

  function addNew() {
    if (tab === 'mcq') {
      const q = {
        id: App.nextId('studon', App.mcq),
        type: 'mcq-single',
        module: 'm1',
        source: 'studon',
        recall: false,
        question: 'New question',
        options: ['Option A', 'Option B'],
        correctIndexes: [0],
        explanation: '',
      };
      App.mcq.unshift(q);
      App.saveMcq();
      editingId = q.id;
    } else {
      const q = {
        id: App.nextId('studon', App.coding),
        module: 'm1',
        source: 'studon',
        title: 'New coding question',
        prompt: 'Describe the task...',
        starterCode: '// write code that renders into #app\n',
        solutionCode: '// model solution\n',
        notes: '',
        hint: '',
      };
      App.coding.unshift(q);
      App.saveCoding();
      editingId = q.id;
    }
    renderList();
  }

  return { render };
})();
