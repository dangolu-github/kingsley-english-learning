// Vocabulary: the teacher's word lists and the learner's own word log ("My words"), each a toggle.
// Words the learner adds are saved to the course service (the teacher sees them); a checked word (Known) and any
// phrase are left out when a list is copied or downloaded for a flashcard app. Check all / Uncheck all per list.
// "Print / Save as PDF" prints every list that is showing as a compact word sheet (no buttons or forms).
// Study / Self-test (word-help-and-vocab, 2026-10-22): Self-test blurs every meaning where it stands; tapping a word
// shows or hides its meaning, so nothing on the page moves. The mode is remembered in this browser; print shows all.
// The newest class's lists are open on the first visit; after that each list keeps the learner's own choice.
(() => {
  const N = window.Cv, A = N.A, app = document.getElementById('app');
  const S = { lists: [], myListId: '', query: '', test: false, shown: {} };
  const MODE_KEY = 'ke-en-vocab-mode';
  try { S.test = localStorage.getItem(MODE_KEY) === 'test'; } catch (error) { /* study mode */ }

  const matches = (w) => !S.query || [w.word, w.meaning, w.example, w.from].join(' ').toLowerCase().indexOf(S.query) >= 0;
  const wordRow = (w) => `<li class="cp-word${w.known ? ' is-known' : ''}${S.shown[w.id] ? ' is-shown' : ''}" data-word="${N.esc(w.id)}">
    <span><span class="w">${N.esc(w.word)}</span>${w.pos ? `<span class="pos">${N.esc(w.pos)}</span>` : ' '}<span class="mean"${S.test ? ' role="button" tabindex="0" aria-label="Show the meaning"' : ''}>${N.esc(w.meaning)}</span></span>
    <span class="tools"><label class="cp-check"><input type="checkbox" data-known="${N.esc(w.id)}"${w.known ? ' checked' : ''}> Known</label>${w.source === 'student' ? `<button class="cp-linkbtn" type="button" data-remove="${N.esc(w.id)}">Remove</button>` : ''}</span>
    ${w.example ? `<span class="ex">${N.esc(w.example)}</span>` : ''}${w.from ? `<span class="ex cp-note">Where I met it: ${N.esc(w.from)}</span>` : ''}</li>`;

  function listHtml(l) {
    const mine = l.id === S.myListId;
    const words = l.words.filter(matches);
    if (S.query && !words.length) return '';
    const checked = l.words.filter((w) => w.known).length;
    const tools = l.words.length ? `<div class="cp-actions"><button class="cp-btn quiet" type="button" data-checkall="${N.esc(l.id)}"${checked === l.words.length ? ' disabled' : ''}>Check all</button><button class="cp-btn quiet" type="button" data-uncheckall="${N.esc(l.id)}"${checked ? '' : ' disabled'}>Uncheck all</button><button class="cp-btn quiet" type="button" data-copy="${N.esc(l.id)}">Copy unchecked words</button><button class="cp-btn quiet" type="button" data-download="${N.esc(l.id)}">Download .txt</button></div><p class="cp-msg" data-copymsg="${N.esc(l.id)}" role="status"></p>` : '';
    const empty = mine ? '<p class="cp-empty">No words yet. Add the first one above.</p>' : '<p class="cp-empty">No words yet.</p>';
    return `<details class="cp-fold cp-vocab-list" data-fold="list:${N.esc(l.id)}"${S.query || l.classId === newestClass() ? ' open' : ''}><summary><small>${l.words.length} word${l.words.length === 1 ? '' : 's'}${checked ? ` · ${checked} known` : ''}</small>${N.esc(l.title)}</summary><div class="cp-fold-body">
      ${l.note ? `<p class="cp-note">${N.esc(l.note)}</p>` : ''}${tools}
      ${words.length ? `<ul class="cp-words">${words.map(wordRow).join('')}</ul>` : empty}</div></details>`;
  }

  // The class of the first teacher list (lists come newest class first).
  const newestClass = () => { const l = S.lists.filter((x) => x.id !== S.myListId && x.classId)[0]; return l ? l.classId : ''; };

  function listsHtml() {
    const mine = S.lists.filter((l) => l.id === S.myListId);
    const teacher = S.lists.filter((l) => l.id !== S.myListId);
    const mineHtml = mine.map(listHtml).join('');
    const teacherHtml = teacher.map(listHtml).join('');
    return `<details class="cp-section cp-fold" data-fold="mine"${S.query ? ' open' : ''}><summary><h2>My words <small>${mine.reduce((n, l) => n + l.words.length, 0)}</small></h2></summary>
        <details class="cp-fold" data-fold="add" data-no-print><summary>Add a word</summary><div class="cp-fold-body">
          <form class="cp-addword" data-addword>
            <label>Word or phrase<input name="word" maxlength="80" required autocomplete="off" autocapitalize="off" spellcheck="false"></label>
            <label>Part of speech <small>(optional)</small><input name="pos" maxlength="20" placeholder="n. / v. / adj. / phr." autocomplete="off"></label>
            <label>Meaning<input name="meaning" maxlength="200" autocomplete="off"></label>
            <label>Example sentence<textarea name="example" rows="2" maxlength="400"></textarea></label>
            <label>Where I met it <small>(optional)</small><input name="from" maxlength="120" placeholder="e.g. Mock 1, Exercise 4" autocomplete="off"></label>
            <div class="cp-actions"><button class="cp-btn" type="submit">Add to my words</button></div><p class="cp-msg" data-addmsg role="status"></p>
          </form></div></details>
        ${mineHtml || (S.query ? '<p class="cp-empty">No match in my words.</p>' : '')}</details>
      <details class="cp-section cp-fold" data-fold="teacher" open><summary><h2>Word lists from class <small>${teacher.length}</small></h2></summary>
        ${teacherHtml || `<p class="cp-empty">${S.query ? 'No match in the class lists.' : 'Your teacher will add word lists after each class.'}</p>`}</details>`;
  }

  function redraw() {
    app.classList.toggle('cp-vocab-test', S.test);
    app.querySelectorAll('[data-mode]').forEach((b) => b.setAttribute('aria-pressed', String((b.dataset.mode === 'test') === S.test)));
    app.querySelector('[data-lists]').innerHTML = listsHtml();
    if (!S.query) N.folds(app, 'vocabulary');
  }

  function render() {
    app.innerHTML = `
      <p class="cp-kicker">English as an Additional Language</p>
      <h1>Vocabulary</h1>
      <p class="cp-lead">Keep a log of new words with a meaning and an example sentence. Tick a word when you know it; copy the rest into your flashcard app.</p>
      <p class="cp-searchrow"><input class="cp-search" type="search" placeholder="Search words" value="${N.esc(S.query)}" data-search aria-label="Search words"></p>
      <div class="cp-actions cp-printbar"><span class="cp-modes" role="group" aria-label="Mode" data-no-print><button class="cp-btn quiet" type="button" data-mode="study" aria-pressed="${!S.test}">Study</button><button class="cp-btn quiet" type="button" data-mode="test" aria-pressed="${S.test}">Self-test</button></span><button class="cp-btn quiet" type="button" data-print-page>Print / Save as PDF</button></div>
      <p class="cp-note" data-no-print data-test-note${S.test ? '' : ' hidden'}>Self-test: say the meaning, then tap the word to check.</p>
      ${N.foldBar()}
      <div data-lists></div>`;
    redraw();
  }

  async function refresh(keepPage) {
    const data = await A.request('getVocabulary', {});
    N.previewNote(data.env);
    S.lists = data.lists; S.myListId = data.myListId;
    if (keepPage && app.querySelector('[data-lists]')) redraw();
    else render();
  }

  const listById = (id) => S.lists.filter((l) => l.id === id)[0];
  const isPhrase = (w) => /\s/.test(w.word.trim());
  const exportWords = (id) => listById(id).words.filter((w) => !w.known && !isPhrase(w)).map((w) => w.word);
  const skippedNote = (id, n) => {
    const l = listById(id), checked = l.words.filter((w) => w.known).length, phrases = l.words.filter((w) => !w.known && isPhrase(w)).length;
    const skipped = [checked ? `${checked} known` : '', phrases ? `${phrases} phrase${phrases === 1 ? '' : 's'}` : ''].filter(Boolean).join(', ');
    return `Copied ${n} words${skipped ? `, skipped ${skipped}` : ''}.`;
  };
  const say = (id, text, kind) => { const m = app.querySelector(`[data-copymsg="${id}"]`); if (m) { m.textContent = text; m.className = 'cp-msg' + (kind ? ' ' + kind : ''); } };

  // Updates the page at once, then saves; puts the old state back if saving fails.
  async function setKnown(words, known, listId) {
    const before = words.map((w) => w.known);
    words.forEach((w) => { w.known = known; });
    redraw();
    try {
      const status = known ? 'known' : 'learning';
      if (words.length === 1) await A.post('setWordStatus', { wordId: words[0].id, status });
      else await A.post('setWordStatus', { wordIds: words.map((w) => w.id), status });
    } catch (error) {
      words.forEach((w, i) => { w.known = before[i]; });
      redraw();
      say(listId, 'Not saved. Check your connection and try again.', 'error');
    }
  }

  app.addEventListener('input', (event) => {
    if (!event.target.matches('[data-search]')) return;
    S.query = event.target.value.trim().toLowerCase();
    redraw();
  });
  app.addEventListener('submit', async (event) => {
    const form = event.target.closest('[data-addword]');
    if (!form) return;
    event.preventDefault();
    const msg = form.querySelector('[data-addmsg]'), button = form.querySelector('button');
    const value = (name) => form.elements[name].value.trim();
    if (!value('word')) { msg.textContent = 'Type the word first.'; msg.className = 'cp-msg error'; return; }
    button.disabled = true; msg.textContent = 'Saving…'; msg.className = 'cp-msg';
    try {
      const result = await A.post('addWord', { word: value('word'), pos: value('pos'), meaning: value('meaning'), example: value('example'), from: value('from') });
      await refresh(true);
      const after = app.querySelector('[data-addmsg]');
      if (after) { after.textContent = result.duplicate ? 'That word is already in your list.' : 'Added.'; after.className = 'cp-msg success'; }
      const first = app.querySelector('[data-addword] input[name=word]');
      if (first) first.focus();
    } catch (error) {
      msg.textContent = (error && error.message) || 'Not saved. Check your connection and try again.'; msg.className = 'cp-msg error';
      button.disabled = false;
    }
  });
  app.addEventListener('change', (event) => {
    const box = event.target.closest('[data-known]');
    if (!box) return;
    const list = box.closest('[data-fold^="list:"]').dataset.fold.slice(5);
    const word = listById(list).words.filter((w) => w.id === box.dataset.known)[0];
    setKnown([word], box.checked, list);
  });
  // Self-test: tapping a word row (not its Known box or Remove) shows or hides its meaning in place.
  const flip = (row) => {
    if (!S.test || !row) return;
    S.shown[row.dataset.word] = !S.shown[row.dataset.word];
    row.classList.toggle('is-shown', Boolean(S.shown[row.dataset.word]));
  };
  app.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.mean[role=button]')) { event.preventDefault(); flip(event.target.closest('[data-word]')); }
  });
  app.addEventListener('click', async (event) => {
    const mode = event.target.closest('[data-mode]');
    if (mode) {
      S.test = mode.dataset.mode === 'test'; S.shown = {};
      try { localStorage.setItem(MODE_KEY, S.test ? 'test' : 'study'); } catch (error) { /* not remembered */ }
      const note = app.querySelector('[data-test-note]'); if (note) note.hidden = !S.test;
      redraw();
      return;
    }
    const row = event.target.closest('[data-word]');
    if (row && S.test && !event.target.closest('label, button, input')) { flip(row); return; }
    const printButton = event.target.closest('[data-print-page]');
    if (printButton) { printButton.disabled = true; window.CvPrint.print({}).catch(() => window.print()).finally(() => { printButton.disabled = false; }); return; }
    const copy = event.target.closest('[data-copy]'), download = event.target.closest('[data-download]'), remove = event.target.closest('[data-remove]');
    const checkAll = event.target.closest('[data-checkall]'), uncheckAll = event.target.closest('[data-uncheckall]');
    if (checkAll || uncheckAll) {
      const id = (checkAll || uncheckAll).dataset[checkAll ? 'checkall' : 'uncheckall'];
      const words = listById(id).words.filter((w) => w.known !== Boolean(checkAll));
      if (words.length) await setKnown(words, Boolean(checkAll), id);
    } else if (copy) {
      const words = exportWords(copy.dataset.copy);
      if (!words.length) { say(copy.dataset.copy, 'Nothing to copy: every word is ticked.'); return; }
      try {
        await navigator.clipboard.writeText(words.join('\n'));
        say(copy.dataset.copy, skippedNote(copy.dataset.copy, words.length), 'success');
      } catch (error) { say(copy.dataset.copy, 'Copying is blocked here. Use Download instead.', 'error'); }
    } else if (download) {
      const words = exportWords(download.dataset.download);
      if (!words.length) { say(download.dataset.download, 'Nothing to download: every word is ticked.'); return; }
      const link = document.createElement('a');
      link.href = URL.createObjectURL(new Blob([words.join('\n') + '\n'], { type: 'text/plain;charset=utf-8' }));
      link.download = download.dataset.download + '.txt';
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 2000);
    } else if (remove && window.confirm('Remove this word from your list?')) {
      remove.disabled = true;
      try { await A.post('setWordStatus', { wordId: remove.dataset.remove, status: 'removed' }); await refresh(true); }
      catch (error) { remove.disabled = false; }
    }
  });

  A.ready.then(() => refresh(false)).catch((error) => N.fail(app, error));
})();
