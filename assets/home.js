// Home: what to do next and the Class Logbook (newest class first).
(() => {
  const N = window.Cv, app = document.getElementById('app');
  N.A.ready.then(async () => {
    try {
      const data = await N.A.request('getHome', {});
      N.previewNote(data.env);
      const todo = data.todo.length
        ? `<div class="cp-cards">${data.todo.map(N.taskCard).join('')}</div>`
        : '<p class="cp-empty">No homework is waiting.</p>';
      const logItem = (c) => `<li><a href="class/?id=${encodeURIComponent(c.id)}"><span class="num">${N.esc(c.number)}</span><span><strong>${N.esc(c.title)}</strong><span class="date">Class ${N.esc(c.number)} | ${N.esc(N.longDate(c.date))}${c.focus ? ' | ' + N.esc(c.focus) : ''}</span></span><span class="go">Open</span></a></li>`;
      const classes = data.classes.length
        ? `<ol class="cp-log">${data.classes.map(logItem).join('')}</ol>`
        : '<p class="cp-empty">Class records will appear here after each class.</p>';
      // Classes and homework already gone over in class; still open to read and print.
      const archive = data.archive || { classes: [], tasks: [] };
      const archived = archive.classes.length + archive.tasks.length;
      const archiveBody = (archive.classes.length ? `<ol class="cp-log">${archive.classes.map(logItem).join('')}</ol>` : '') +
        (archive.tasks.length ? `<div class="cp-cards">${archive.tasks.map(N.taskCard).join('')}</div>` : '');
      app.innerHTML = `
        <p class="cp-kicker">English as an Additional Language</p>
        <h1>Welcome, Kingsley</h1>
        <p class="cp-lead">Your class handouts, class summaries and homework, all in one place.</p>
        <div class="cp-tiles">
          <a class="cp-tile" href="mistake-log/"><b>${data.counts.mistakesOpen}</b><strong>Mistake Log</strong><span>Mistakes to review</span></a>
          <a class="cp-tile" href="vocabulary/"><b>${data.counts.words}</b><strong>Vocabulary</strong><span>Words from class and my words</span></a>
        </div>
        ${N.foldBar()}
        <details class="cp-section cp-fold" data-fold="todo"><summary><h2>To do <small>${data.todo.length}</small></h2></summary>${todo}</details>
        <details class="cp-section cp-fold" data-fold="classes"><summary><h2>Class Logbook <small>${data.classes.length}</small></h2></summary>${classes}</details>
        ${archived ? `<details class="cp-section cp-fold" data-fold="archive"><summary><h2>Archive <small>${archived}</small></h2></summary>${archiveBody}</details>` : ''}`;
      N.folds(app, 'home');
    } catch (error) { N.fail(app, error); }
  });
})();
