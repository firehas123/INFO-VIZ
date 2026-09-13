const Importer = (() => {
  let drafts = [];

  function render() {
    const el = document.getElementById('view-import');
    el.innerHTML = `
      <div class="card">
        <h2>Bulk import from StudOn</h2>
        <p class="muted">Paste raw text copied from a StudOn practice question page. Multiple questions are fine — separate them with a blank line if they aren't already. The parser guesses question/option boundaries and any marked correct answer; you'll confirm everything in the review step below before saving.</p>
        <textarea id="raw-paste" rows="10" style="width:100%;" placeholder="Paste raw StudOn text here..."></textarea>
        <div class="row" style="margin-top:0.6rem;">
          <button class="btn" id="parse-btn">Parse</button>
          <button class="btn secondary" id="add-blank-btn">Add blank question manually</button>
        </div>
      </div>
      <div id="drafts-holder"></div>
    `;
    el.querySelector('#parse-btn').addEventListener('click', () => {
      const raw = el.querySelector('#raw-paste').value;
      const parsed = parseRaw(raw);
      drafts = drafts.concat(parsed);
      renderDrafts();
    });
    el.querySelector('#add-blank-btn').addEventListener('click', () => {
      drafts.push(blankDraft());
      renderDrafts();
    });
    renderDrafts();
  }

  function blankDraft() {
    return {
      _key: 'd' + Math.random().toString(36).slice(2),
      type: 'mcq-single',
      module: 'm1',
      question: '',
      options: ['', ''],
      correctIndexes: [],
      explanation: '',
    };
  }

  // Heuristic parser for loosely-formatted StudOn paste text.
  function parseRaw(raw) {
    const lines = raw.split(/\r?\n/).map(l => l.trim());
    const blocks = [];
    let cur = [];
    for (const line of lines) {
      if (line === '') {
        if (cur.length) { blocks.push(cur); cur = []; }
      } else {
        // Heuristic: a line that looks like a new numbered question starts a new block
        // if the current block already looks "complete" (has question + >=2 option-like lines).
        if (/^\s*(\d+[\.\)]|Question\s*\d+)/i.test(line) && cur.length > 2 && looksLikeOptionLine(cur[cur.length - 1])) {
          blocks.push(cur);
          cur = [line];
        } else {
          cur.push(line);
        }
      }
    }
    if (cur.length) blocks.push(cur);

    return blocks.filter(b => b.length > 0).map(blockToDraft);
  }

  function looksLikeOptionLine(line) {
    return /^([a-hA-H][\.\)]|[-*•]|☐|☑|✓|✔|\d+[\.\)])\s+/.test(line);
  }

  function stripOptionMarker(line) {
    return line.replace(/^([a-hA-H][\.\)]|[-*•]|☐|☑|✓|✔|\d+[\.\)])\s+/, '').trim();
  }

  function looksCorrectMarked(line) {
    return /(☑|✓|✔|✓|✔|\(correct\)|\[correct\]|^\*|\*$)/i.test(line);
  }

  function blockToDraft(lines) {
    let selectAll = false;
    lines.forEach(l => { if (/select all that apply|choose all correct|multiple answers/i.test(l)) selectAll = true; });

    // The first line is always treated as (the start of) the question stem, never an option —
    // this avoids numbered question headers ("1. What is...") being misread as numbered options ("1) ...").
    const questionLines = [(lines[0] || '').replace(/^\s*(\d+[\.\)]|Question\s*\d+:?)\s*/i, '')];
    const optionLines = [];
    let inOptions = false;
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!inOptions && !looksLikeOptionLine(line)) {
        questionLines.push(line);
      } else {
        inOptions = true;
        optionLines.push(line);
      }
    }
    // Fallback: if nothing was detected as an option, split remaining lines after first as options.
    let question = questionLines.join(' ').trim();
    let rawOptions = optionLines;
    if (rawOptions.length === 0 && lines.length > 1) {
      question = lines[0].replace(/^\s*(\d+[\.\)]|Question\s*\d+:?)\s*/i, '');
      rawOptions = lines.slice(1);
    }
    const correctIndexes = [];
    const options = rawOptions.map((l, i) => {
      if (looksCorrectMarked(l)) correctIndexes.push(i);
      return stripOptionMarker(l).replace(/(☑|✓|✔|✓|✔|\(correct\)|\[correct\])/gi, '').replace(/^\*|\*$/g, '').trim();
    }).filter(o => o.length > 0);

    return {
      _key: 'd' + Math.random().toString(36).slice(2),
      type: selectAll || correctIndexes.length > 1 ? 'mcq-multi' : 'mcq-single',
      module: 'm1',
      question: question || '(edit me: could not isolate question text)',
      options: options.length ? options : ['', ''],
      correctIndexes,
      explanation: '',
      _lowConfidence: correctIndexes.length === 0,
    };
  }

  function renderDrafts() {
    const holder = document.getElementById('drafts-holder');
    if (!holder) return;
    if (drafts.length === 0) {
      holder.innerHTML = '<div class="card muted">No drafts yet. Paste text above and hit Parse.</div>';
      return;
    }
    holder.innerHTML = `
      <div class="card">
        <div class="row" style="justify-content:space-between;">
          <h2 style="margin:0;">Review ${drafts.length} draft question${drafts.length > 1 ? 's' : ''}</h2>
          <button class="btn" id="save-all-btn">Save all to StudOn bank</button>
        </div>
      </div>
      ${drafts.map(d => draftCardHtml(d)).join('')}
    `;
    drafts.forEach(d => attachDraftHandlers(d));
    holder.querySelector('#save-all-btn').addEventListener('click', saveAll);
  }

  function draftCardHtml(d) {
    const modules = App.MODULES;
    return `
      <div class="draft-card" data-key="${d._key}">
        ${d._lowConfidence ? '<p class="muted">⚠️ Could not detect a marked correct answer — please select one below.</p>' : ''}
        <label class="field">Question text
          <textarea class="draft-question" rows="2" style="width:100%;">${App.escapeHtml(d.question)}</textarea>
        </label>
        <div class="row" style="margin:0.4rem 0;">
          <label class="field">Module
            <select class="draft-module">
              ${Object.keys(modules).map(m => `<option value="${m}" ${m === d.module ? 'selected' : ''}>${modules[m]}</option>`).join('')}
            </select>
          </label>
          <label class="field">Type
            <select class="draft-type">
              <option value="mcq-single" ${d.type === 'mcq-single' ? 'selected' : ''}>Single answer</option>
              <option value="mcq-multi" ${d.type === 'mcq-multi' ? 'selected' : ''}>Multiple answers</option>
            </select>
          </label>
        </div>
        <div class="opt-editor">
          ${d.options.map((o, i) => optRowHtml(d, o, i)).join('')}
        </div>
        <button class="btn secondary add-opt-btn" style="margin-top:0.3rem;">+ Add option</button>
        <label class="field" style="margin-top:0.5rem;">Explanation (optional)
          <textarea class="draft-explanation" rows="2" style="width:100%;">${App.escapeHtml(d.explanation || '')}</textarea>
        </label>
        <div class="row" style="margin-top:0.5rem;">
          <button class="btn secondary discard-btn">Discard</button>
        </div>
      </div>
    `;
  }

  function optRowHtml(d, text, i) {
    const checked = d.correctIndexes.includes(i);
    const inputType = d.type === 'mcq-multi' ? 'checkbox' : 'radio';
    return `
      <div class="opt-edit-row" data-i="${i}">
        <input type="${inputType}" name="correct-${d._key}" class="opt-correct" ${checked ? 'checked' : ''}>
        <input type="text" class="opt-text" value="${App.escapeHtml(text)}" placeholder="Option text">
        <button class="btn secondary remove-opt-btn" style="padding:0.2rem 0.5rem;">✕</button>
      </div>
    `;
  }

  function attachDraftHandlers(d) {
    const card = document.querySelector(`.draft-card[data-key="${d._key}"]`);
    if (!card) return;

    card.querySelector('.draft-question').addEventListener('input', (e) => d.question = e.target.value);
    card.querySelector('.draft-module').addEventListener('change', (e) => d.module = e.target.value);
    card.querySelector('.draft-type').addEventListener('change', (e) => {
      d.type = e.target.value;
      if (d.type === 'mcq-single' && d.correctIndexes.length > 1) d.correctIndexes = d.correctIndexes.slice(0, 1);
      renderDrafts();
    });
    card.querySelector('.draft-explanation').addEventListener('input', (e) => d.explanation = e.target.value);
    card.querySelector('.add-opt-btn').addEventListener('click', () => { d.options.push(''); renderDrafts(); });
    card.querySelectorAll('.opt-edit-row').forEach(row => {
      const i = parseInt(row.dataset.i, 10);
      row.querySelector('.opt-text').addEventListener('input', (e) => d.options[i] = e.target.value);
      row.querySelector('.opt-correct').addEventListener('change', () => {
        if (d.type === 'mcq-multi') {
          const set = new Set(d.correctIndexes);
          if (set.has(i)) set.delete(i); else set.add(i);
          d.correctIndexes = Array.from(set);
        } else {
          d.correctIndexes = [i];
        }
      });
      row.querySelector('.remove-opt-btn').addEventListener('click', () => {
        d.options.splice(i, 1);
        d.correctIndexes = d.correctIndexes.filter(x => x !== i).map(x => x > i ? x - 1 : x);
        renderDrafts();
      });
    });
    card.querySelector('.discard-btn').addEventListener('click', () => {
      drafts = drafts.filter(x => x._key !== d._key);
      renderDrafts();
    });
  }

  function saveAll() {
    const valid = drafts.filter(d => d.question.trim() && d.options.filter(o => o.trim()).length >= 2);
    const invalidCount = drafts.length - valid.length;
    valid.forEach(d => {
      const cleanOptions = d.options.map(o => o.trim()).filter(o => o.length > 0);
      const q = {
        id: App.nextId('studon', App.mcq),
        type: d.type,
        module: d.module,
        source: 'studon',
        recall: false,
        question: d.question.trim(),
        options: cleanOptions,
        correctIndexes: d.correctIndexes.length ? d.correctIndexes : [0],
        explanation: d.explanation.trim(),
      };
      App.mcq.push(q);
    });
    App.saveMcq();
    drafts = [];
    renderDrafts();
    alert(`Saved ${valid.length} question(s).` + (invalidCount ? ` ${invalidCount} skipped (need question text + 2 options).` : ''));
  }

  return { render };
})();
