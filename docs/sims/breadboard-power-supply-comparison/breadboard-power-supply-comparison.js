// Breadboard Power Supply Comparison - sourced comparison table
// Every specification cell carries a verification verdict and a citation.
// CANVAS_HEIGHT: 840

(function () {
  'use strict';

  var data = null;
  var selectedScenario = 'any';
  var openCellKey = null;

  // Small inline SVG icons, one per supply. Kept as markup rather than files
  // so the sim stays self-contained and never shows a broken-image box.
  var ICONS = {
    battery:
      '<svg viewBox="0 0 40 24" aria-hidden="true">' +
      '<rect x="1" y="5" width="30" height="14" rx="2" fill="#e8eef5" stroke="#4a5b6d" stroke-width="2"/>' +
      '<rect x="31" y="9" width="4" height="6" rx="1" fill="#4a5b6d"/>' +
      '<rect x="4" y="8" width="7" height="8" fill="#22c55e"/>' +
      '<rect x="13" y="8" width="7" height="8" fill="#22c55e"/>' +
      '<rect x="22" y="8" width="6" height="8" fill="#22c55e"/></svg>',
    plug:
      '<svg viewBox="0 0 40 24" aria-hidden="true">' +
      '<rect x="6" y="3" width="19" height="18" rx="3" fill="#e8eef5" stroke="#4a5b6d" stroke-width="2"/>' +
      '<rect x="25" y="10" width="10" height="4" rx="1" fill="#4a5b6d"/>' +
      '<rect x="11" y="8" width="3" height="8" rx="1" fill="#4a5b6d"/>' +
      '<rect x="17" y="8" width="3" height="8" rx="1" fill="#4a5b6d"/></svg>',
    module:
      '<svg viewBox="0 0 40 24" aria-hidden="true">' +
      '<rect x="3" y="4" width="34" height="16" rx="2" fill="#1f3349" stroke="#4a5b6d" stroke-width="1.5"/>' +
      '<circle cx="10" cy="12" r="3" fill="#FF9800"/>' +
      '<rect x="17" y="8" width="8" height="8" rx="1" fill="#cbd5e1"/>' +
      '<rect x="28" y="9" width="6" height="6" rx="1" fill="#22c55e"/></svg>',
    bench:
      '<svg viewBox="0 0 40 24" aria-hidden="true">' +
      '<rect x="2" y="3" width="36" height="18" rx="2" fill="#e8eef5" stroke="#4a5b6d" stroke-width="2"/>' +
      '<rect x="5" y="6" width="15" height="8" rx="1" fill="#1f3349"/>' +
      '<text x="12.5" y="12.6" font-size="6" fill="#22c55e" text-anchor="middle" font-family="monospace">5.0</text>' +
      '<circle cx="27" cy="10" r="4" fill="none" stroke="#4a5b6d" stroke-width="2"/>' +
      '<line x1="27" y1="10" x2="27" y2="7" stroke="#4a5b6d" stroke-width="2"/>' +
      '<circle cx="34" cy="17" r="2" fill="#ef4444"/></svg>'
  };

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function stars(n) {
    var filled = '', empty = '';
    for (var i = 0; i < n; i++) filled += '★';
    for (var j = n; j < 5; j++) empty += '★';
    return '<span class="stars stars-' + n + '">' + filled + '</span>' +
           '<span class="stars-empty">' + empty + '</span>';
  }

  // ---------------------------------------------------------------- rendering

  function buildControls() {
    var wrap = document.getElementById('controls');
    wrap.innerHTML = '';

    var label = el('label', 'control-label', 'Who is building?');
    label.setAttribute('for', 'scenario-select');

    var select = el('select', 'scenario-select');
    select.id = 'scenario-select';
    data.scenarios.forEach(function (s) {
      var opt = el('option', null, s.label);
      opt.value = s.id;
      select.appendChild(opt);
    });
    select.addEventListener('change', function () {
      selectedScenario = select.value;
      render();
    });

    wrap.appendChild(label);
    wrap.appendChild(select);
  }

  function currentScenario() {
    for (var i = 0; i < data.scenarios.length; i++) {
      if (data.scenarios[i].id === selectedScenario) return data.scenarios[i];
    }
    return data.scenarios[0];
  }

  function buildRationale() {
    var s = currentScenario();
    var box = document.getElementById('rationale');
    var pickName = '';
    if (s.pick) {
      data.rows.forEach(function (r) { if (r.id === s.pick) pickName = r.name; });
      box.innerHTML = '<strong>Recommended: ' + pickName + '.</strong> ' + s.why;
      box.className = 'rationale active';
    } else {
      box.innerHTML = s.why;
      box.className = 'rationale';
    }
  }

  function cellButton(row, colKey) {
    var cell = row.cells[colKey];
    var td = el('td', 'spec-cell');
    var key = row.id + '|' + colKey;
    var colName = colKey;
    data.columns.forEach(function (c) { if (c.key === colKey) colName = c.name; });

    var btn = el('button', 'cell-btn');
    btn.type = 'button';
    // Screen readers get the full sentence; sighted users read it from the
    // row and column headers, so the visible cell stays short.
    btn.setAttribute('aria-label',
      row.name + ', ' + colName + ': ' + cell.value +
      '. ' + data.verdicts[cell.verdict].label + '. Show the source.');
    btn.setAttribute('aria-expanded', openCellKey === key ? 'true' : 'false');
    btn.innerHTML =
      '<span class="cell-value">' + cell.value + '</span>' +
      '<span class="verdict-dot" style="background:' + data.verdicts[cell.verdict].color + '" ' +
      'title="' + data.verdicts[cell.verdict].label + '"></span>';
    if (openCellKey === key) btn.classList.add('open');

    btn.addEventListener('click', function () {
      openCellKey = (openCellKey === key) ? null : key;
      render();
      if (openCellKey) {
        document.getElementById('detail-panel').scrollIntoView({ block: 'nearest' });
      }
    });

    td.appendChild(btn);
    return td;
  }

  function buildTable() {
    var host = document.getElementById('table-host');
    host.innerHTML = '';

    var scenario = currentScenario();
    var table = el('table', 'comparison-table');

    var thead = el('thead');
    var hrow = el('tr');
    hrow.appendChild(el('th', 'col-supply', 'Power Supply'));
    data.columns.forEach(function (c) {
      hrow.appendChild(el('th', null, c.name));
    });
    hrow.appendChild(el('th', null, 'Safety'));
    hrow.appendChild(el('th', 'col-best', 'Best For'));
    thead.appendChild(hrow);
    table.appendChild(thead);

    var tbody = el('tbody');
    data.rows.forEach(function (row) {
      var tr = el('tr');
      if (scenario.pick) {
        tr.className = (scenario.pick === row.id) ? 'picked' : 'dimmed';
      }

      var nameCell = el('td', 'item-cell');
      nameCell.innerHTML =
        '<span class="item-icon">' + ICONS[row.icon] + '</span>' +
        '<span class="item-text"><span class="item-name">' + row.name + '</span>' +
        '<span class="difficulty ' + row.badgeClass + '">' + row.badge + '</span></span>';
      tr.appendChild(nameCell);

      data.columns.forEach(function (c) {
        tr.appendChild(cellButton(row, c.key));
      });

      var safety = el('td', 'rating');
      safety.innerHTML = stars(row.safety);
      safety.title = row.safetyNote;
      tr.appendChild(safety);

      tr.appendChild(el('td', 'description-cell', row.bestFor));
      tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    host.appendChild(table);
  }

  function buildDetail() {
    var panel = document.getElementById('detail-panel');

    if (!openCellKey) {
      panel.className = 'detail-panel empty';
      panel.innerHTML =
        '<div class="detail-prompt">Click any specification cell above to see the source it came from, ' +
        'the exact wording in that source, and how confident this book is in the number.</div>';
      return;
    }

    var parts = openCellKey.split('|');
    var row = null, i;
    for (i = 0; i < data.rows.length; i++) {
      if (data.rows[i].id === parts[0]) row = data.rows[i];
    }
    var cell = row.cells[parts[1]];
    var colName = '';
    data.columns.forEach(function (c) { if (c.key === parts[1]) colName = c.name; });

    var verdict = data.verdicts[cell.verdict];
    var html = '';

    html += '<div class="detail-head">' +
            '<span class="detail-where">' + row.name + ' &middot; ' + colName + '</span>' +
            '<span class="verdict-badge" style="background:' + verdict.color + '">' +
            verdict.label + '</span>' +
            '</div>';

    html += '<div class="detail-value">' + cell.value + '</div>';
    html += '<div class="detail-meaning">' + verdict.meaning + '</div>';
    html += '<div class="detail-body">' + cell.detail + '</div>';

    if (cell.quote) {
      html += '<blockquote class="detail-quote">&ldquo;' + cell.quote + '&rdquo;</blockquote>';
    }
    if (cell.alsoQuote) {
      html += '<blockquote class="detail-quote">&ldquo;' + cell.alsoQuote + '&rdquo;</blockquote>';
    }

    var cited = [];
    if (cell.src) cited.push(cell.src);
    if (cell.alsoSee && cited.indexOf(cell.alsoSee) === -1) cited.push(cell.alsoSee);

    if (cited.length) {
      html += '<div class="detail-sources"><span class="src-label">Source' +
              (cited.length > 1 ? 's' : '') + ':</span> ';
      cited.forEach(function (id, idx) {
        var s = data.sources[id];
        if (!s) return;
        html += (idx ? ' &nbsp;·&nbsp; ' : '') +
                '<a href="' + s.url + '" target="_blank" rel="noopener">' + s.citation + '</a>' +
                ' <span class="src-kind">' + s.kind + '</span>';
      });
      html += '</div>';
    } else {
      html += '<div class="detail-sources no-src">No external source needed — this follows from the ' +
              'absence of a regulator or protection device, not from a published figure.</div>';
    }

    panel.className = 'detail-panel';
    panel.innerHTML = html;
  }

  function buildLegend() {
    var legend = document.getElementById('legend');
    var html = '<span class="legend-title">How solid is each number?</span>';
    Object.keys(data.verdicts).forEach(function (k) {
      var v = data.verdicts[k];
      html += '<span class="legend-item">' +
              '<span class="verdict-dot" style="background:' + v.color + '"></span>' +
              v.label + '</span>';
    });
    legend.innerHTML = html;
  }

  function render() {
    buildRationale();
    buildTable();
    buildDetail();
  }

  // ------------------------------------------------------------------ startup

  function init(loaded) {
    data = loaded;
    document.getElementById('sim-title').textContent = data.title;
    document.getElementById('sim-subtitle').textContent = data.subtitle;
    document.getElementById('footnote').innerHTML =
      '<strong>A caveat worth reading:</strong> ' + data.footnote;
    buildControls();
    buildLegend();
    render();
  }

  document.addEventListener('DOMContentLoaded', function () {
    fetch('data.json')
      .then(function (r) { return r.json(); })
      .then(init)
      .catch(function (err) {
        document.getElementById('table-host').innerHTML =
          '<p class="load-error">Could not load data.json: ' + err.message + '</p>';
      });
  });
})();
