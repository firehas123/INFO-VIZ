const Quiz = (() => {
  let session = null; // { questions: [...], index, score, answered }

  function render() {
    const el = document.getElementById('view-quiz');
    if (!session) {
      renderSetup(el);
    } else if (session.index >= session.questions.length) {
      renderSummary(el);
    } else {
      renderQuestion(el);
    }
  }

  function renderSetup(el) {
    const modules = App.MODULES;
    const all = App.mcq;
    const moduleOptions = Object.keys(modules).map(m => {
      const count = all.filter(q => q.module === m).length;
      return `<label class="field" style="flex-direction:row; align-items:center; gap:0.4rem;">
        <input type="checkbox" class="mod-check" value="${m}" checked> ${modules[m]} <span class="muted">(${count})</span>
      </label>`;
    }).join('');

    el.innerHTML = `
      <div class="card">
        <h2>Quiz setup</h2>
        <div class="row" style="margin-bottom:0.8rem;">
          <label class="field">
            Question count
            <input type="number" id="count-filter" min="1" value="20">
          </label>
          <label class="field" style="flex-direction:row; align-items:center; gap:0.4rem; margin-top:1.1rem;">
            <input type="checkbox" id="recall-only"> Recall-only
          </label>
        </div>
        <div class="row" style="margin-bottom:0.8rem;">
          <strong style="width:100%;">Modules</strong>
          ${moduleOptions}
        </div>
        <button class="btn" id="start-quiz-btn">Start Quiz</button>
        <span class="muted" id="setup-msg" style="margin-left:0.8rem;"></span>
      </div>
    `;
    el.querySelector('#start-quiz-btn').addEventListener('click', () => startQuiz(el));
  }

  function startQuiz(el) {
    const count = parseInt(el.querySelector('#count-filter').value, 10) || 20;
    const recallOnly = el.querySelector('#recall-only').checked;
    const mods = Array.from(el.querySelectorAll('.mod-check:checked')).map(c => c.value);

    let pool = App.mcq.filter(q => mods.includes(q.module));
    if (recallOnly) pool = pool.filter(q => q.recall);

    if (pool.length === 0) {
      el.querySelector('#setup-msg').textContent = 'No questions match those filters.';
      return;
    }

    const chosen = App.shuffle(pool).slice(0, count).map(q => prepareQuestion(q));
    session = { questions: chosen, index: 0, score: 0, missed: [] };
    render();
  }

  function prepareQuestion(q) {
    const optOrder = App.shuffle(q.options.map((text, i) => ({ text, origIndex: i })));
    return {
      ...q,
      shuffledOptions: optOrder,
      selected: new Set(),
      revealed: false,
    };
  }

  function renderQuestion(el) {
    const q = session.questions[session.index];
    const modules = App.MODULES;
    const progressPct = Math.round((session.index / session.questions.length) * 100);
    const isMulti = q.type === 'mcq-multi';

    el.innerHTML = `
      <div class="card">
        <div class="row" style="justify-content:space-between;">
          <div class="row">
            <span class="tag ${q.source}">${q.source}</span>
            <span class="tag module">${modules[q.module]}</span>
            ${q.recall ? '<span class="tag recall">recall</span>' : ''}
          </div>
          <div class="row">
            <span class="score-pill">Q ${session.index + 1} / ${session.questions.length}</span>
            <span class="score-pill">Score: ${session.score}</span>
          </div>
        </div>
        <div class="progress-bar-outer"><div class="progress-bar-inner" style="width:${progressPct}%"></div></div>
        <p class="question-text">${App.escapeHtml(q.question)}</p>
        ${isMulti ? '<p class="muted">Select all that apply, then submit.</p>' : ''}
        <div class="options-list" id="opts-list"></div>
        <div id="explain-holder"></div>
        <div class="row" style="margin-top:0.8rem;">
          ${isMulti ? '<button class="btn" id="submit-multi-btn">Submit</button>' : ''}
          <button class="btn secondary" id="next-btn" ${q.revealed ? '' : 'disabled'}>Next</button>
        </div>
      </div>
    `;

    const list = el.querySelector('#opts-list');
    q.shuffledOptions.forEach((opt, idx) => {
      const row = document.createElement('div');
      row.className = 'option-row';
      row.textContent = opt.text;
      row.dataset.idx = idx;
      if (isMulti) {
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.style.marginRight = '0.5rem';
        row.prepend(cb);
        row.addEventListener('click', (e) => {
          if (q.revealed) return;
          cb.checked = !cb.checked;
          if (cb.checked) { q.selected.add(idx); row.classList.add('selected'); }
          else { q.selected.delete(idx); row.classList.remove('selected'); }
        });
      } else {
        row.addEventListener('click', () => { if (!q.revealed) answerSingle(el, q, idx); });
      }
      list.appendChild(row);
    });

    if (q.revealed) paintRevealed(el, q);

    if (isMulti) {
      el.querySelector('#submit-multi-btn').addEventListener('click', () => submitMulti(el, q));
    }
    el.querySelector('#next-btn').addEventListener('click', () => {
      session.index++;
      render();
    });
  }

  function answerSingle(el, q, idx) {
    q.selected = new Set([idx]);
    q.revealed = true;
    const correct = q.shuffledOptions[idx].origIndex === q.correctIndexes[0] && q.correctIndexes.length === 1;
    finalizeAnswer(el, q, correct);
  }

  function submitMulti(el, q) {
    if (q.revealed) return;
    q.revealed = true;
    const chosenOrig = Array.from(q.selected).map(i => q.shuffledOptions[i].origIndex).sort();
    const correctOrig = q.correctIndexes.slice().sort();
    const correct = JSON.stringify(chosenOrig) === JSON.stringify(correctOrig);
    finalizeAnswer(el, q, correct);
  }

  function finalizeAnswer(el, q, correct) {
    if (correct) session.score++;
    else session.missed.push(q);
    App.recordAnswer(q.id, correct);
    paintRevealed(el, q);
    el.querySelector('#next-btn').removeAttribute('disabled');
    const holder = el.querySelector('#explain-holder');
    holder.innerHTML = `<div class="explanation"><strong>${correct ? '✅ Correct.' : '❌ Not quite.'}</strong> ${App.escapeHtml(q.explanation || '')}</div>`;
    // re-render score pill
    el.querySelectorAll('.score-pill')[1].textContent = 'Score: ' + session.score;
  }

  function paintRevealed(el, q) {
    const rows = el.querySelectorAll('.option-row');
    rows.forEach((row, idx) => {
      row.classList.add('disabled');
      const orig = q.shuffledOptions[idx].origIndex;
      const isCorrectOpt = q.correctIndexes.includes(orig);
      const wasSelected = q.selected.has(idx);
      if (isCorrectOpt) row.classList.add('correct');
      else if (wasSelected) row.classList.add('incorrect');
    });
  }

  function renderSummary(el) {
    const pct = Math.round((session.score / session.questions.length) * 100);
    el.innerHTML = `
      <div class="card">
        <h2>Quiz complete</h2>
        <p style="font-size:1.3rem;">Score: <strong>${session.score} / ${session.questions.length}</strong> (${pct}%)</p>
        ${session.missed.length ? `
          <h3>Review missed questions</h3>
          ${session.missed.map(q => `
            <div class="draft-card">
              <div class="row"><span class="tag ${q.source}">${q.source}</span><span class="tag module">${App.MODULES[q.module]}</span></div>
              <p class="question-text">${App.escapeHtml(q.question)}</p>
              <p><strong>Correct:</strong> ${q.correctIndexes.map(i => App.escapeHtml(q.options[i])).join('; ')}</p>
              <p class="muted">${App.escapeHtml(q.explanation || '')}</p>
            </div>
          `).join('')}
        ` : '<p class="muted">Perfect run, nothing to review.</p>'}
        <button class="btn" id="restart-btn">New quiz</button>
      </div>
    `;
    el.querySelector('#restart-btn').addEventListener('click', () => { session = null; render(); });
  }

  return { render };
})();
