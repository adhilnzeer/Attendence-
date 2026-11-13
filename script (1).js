(function () {
  "use strict";
  var KEY = "attendance-tracker-v1";
  var state = { students: [], records: {} };

  var $ = function (id) { return document.getElementById(id); };
  var dateInput = $("dateInput"), list = $("list"), empty = $("empty");

  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && Array.isArray(p.students) && p.records) state = p;
      }
    } catch (e) { /* storage unavailable: run in memory */ }
  }
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
  }
  function today() {
    var d = new Date();
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  }
  function dayRecord() { return state.records[dateInput.value] || {}; }

  function overall(id) {
    var marked = 0, attended = 0;
    Object.keys(state.records).forEach(function (d) {
      var s = state.records[d][id];
      if (s) { marked++; if (s !== "A") attended++; }
    });
    return { marked: marked, attended: attended, pct: marked ? Math.round(attended / marked * 100) : null };
  }

  function setStatus(id, status) {
    var d = dateInput.value;
    if (!state.records[d]) state.records[d] = {};
    if (state.records[d][id] === status) delete state.records[d][id];
    else state.records[d][id] = status;
    save(); render();
  }

  function makeBtn(label, cls, id, status, current) {
    var b = document.createElement("button");
    b.type = "button"; b.textContent = label; b.className = cls;
    b.setAttribute("aria-pressed", current === status ? "true" : "false");
    b.addEventListener("click", function () { setStatus(id, status); });
    return b;
  }

  function render(newId) {
    var rec = dayRecord();
    var c = { P: 0, A: 0, L: 0 };
    list.innerHTML = "";
    state.students.forEach(function (s) {
      var cur = rec[s.id];
      if (cur) c[cur]++;
      var o = overall(s.id);
      var li = document.createElement("li");
      li.className = "row" + (s.id === newId ? " added" : "");

      var name = document.createElement("div");
      name.className = "name";
      name.textContent = s.name;
      var sm = document.createElement("small");
      sm.textContent = o.marked ? o.attended + " of " + o.marked + " days attended" : "No days recorded";
      name.appendChild(sm);

      var seg = document.createElement("div");
      seg.className = "seg";
      seg.setAttribute("role", "group");
      seg.setAttribute("aria-label", "Attendance for " + s.name);
      seg.appendChild(makeBtn("Present", "p", s.id, "P", cur));
      seg.appendChild(makeBtn("Absent", "a", s.id, "A", cur));
      seg.appendChild(makeBtn("Late", "l", s.id, "L", cur));

      var pct = document.createElement("div");
      pct.className = "pct";
      pct.textContent = o.pct === null ? "–" : o.pct + "%";

      var del = document.createElement("button");
      del.type = "button"; del.className = "del"; del.textContent = "×";
      del.setAttribute("aria-label", "Remove " + s.name);
      del.addEventListener("click", function () {
        if (!confirm("Remove " + s.name + " and all their records?")) return;
        state.students = state.students.filter(function (x) { return x.id !== s.id; });
        Object.keys(state.records).forEach(function (d) { delete state.records[d][s.id]; });
        save(); render();
      });

      li.appendChild(name); li.appendChild(seg); li.appendChild(pct); li.appendChild(del);
      list.appendChild(li);
    });

    var total = state.students.length;
    empty.style.display = total ? "none" : "block";
    $("cPresent").textContent = c.P;
    $("cAbsent").textContent = c.A;
    $("cLate").textContent = c.L;
    $("cUnmarked").textContent = total - c.P - c.A - c.L;
    var pct = total ? Math.round((c.P + c.L) / total * 100) : 0;
    $("rateNum").textContent = pct + "%";
    $("barFill").style.width = pct + "%";
  }

  $("addForm").addEventListener("submit", function (e) {
    e.preventDefault();
    var input = $("nameInput");
    var name = input.value.trim();
    if (!name) return;
    var dup = state.students.some(function (s) { return s.name.toLowerCase() === name.toLowerCase(); });
    if (dup) { alert(name + " is already in the list."); return; }
    var id = "s" + Date.now();
    state.students.push({ id: id, name: name });
    input.value = "";
    save(); render(id); input.focus();
  });

  $("markAll").addEventListener("click", function () {
    var d = dateInput.value;
    state.records[d] = {};
    state.students.forEach(function (s) { state.records[d][s.id] = "P"; });
    save(); render();
  });

  $("exportBtn").addEventListener("click", function () {
    var dates = Object.keys(state.records).sort();
    var rows = [["Student"].concat(dates).concat(["Attendance rate"])];
    state.students.forEach(function (s) {
      var o = overall(s.id);
      var cells = dates.map(function (d) {
        var v = state.records[d][s.id];
        return v === "P" ? "Present" : v === "A" ? "Absent" : v === "L" ? "Late" : "";
      });
      rows.push([s.name].concat(cells).concat([o.pct === null ? "" : o.pct + "%"]));
    });
    var csv = rows.map(function (r) {
      return r.map(function (v) { return '"' + String(v).replace(/"/g, '""') + '"'; }).join(",");
    }).join("\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "attendance-" + today() + ".csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 500);
  });

  $("resetBtn").addEventListener("click", function () {
    if (!confirm("Delete all students and records? This cannot be undone.")) return;
    state = { students: [], records: {} };
    save(); render();
  });

  dateInput.addEventListener("change", function () {
    if (!dateInput.value) dateInput.value = today();
    render();
  });

  load();
  dateInput.value = today();
  render();
})();
