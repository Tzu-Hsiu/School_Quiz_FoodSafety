function saveRecord() {
  if (!state.studentName || state.studentName === "匿名學員") return;
  const records = JSON.parse(localStorage.getItem("foodsafety_records") || "[]");
  const rec = {
    id: Date.now(), name: state.studentName, cls: state.studentClass || "未分班",
    score: state.totalScore, levelScores: {...state.levelScores},
    badges: [...state.badges], rank: state.rank, date: getToday()
  };
  const idx = records.findIndex(r => r.name === rec.name && r.cls === rec.cls);
  if (idx >= 0) { if (records[idx].score < rec.score) records[idx] = rec; }
  else records.push(rec);
  localStorage.setItem("foodsafety_records", JSON.stringify(records));
}

function loadRecords() {
  return JSON.parse(localStorage.getItem("foodsafety_records") || "[]");
}

function getClassRankings() {
  const records = loadRecords();
  const classes = {};
  records.forEach(r => {
    const c = r.cls || "未分班";
    if (!classes[c]) classes[c] = { scores: [], certified: 0 };
    classes[c].scores.push(r.score);
    if (r.score >= 340 || (r.badges && r.badges.includes("cert"))) classes[c].certified++;
  });
  return Object.entries(classes).map(([cls, d]) => ({
    cls, avg: Math.round(d.scores.reduce((a, b) => a + b, 0) / d.scores.length),
    count: d.scores.length, certified: d.certified, top: Math.max(...d.scores)
  })).sort((a, b) => b.avg - a.avg);
}

function renderLeaderboardHTML() {
  const records = loadRecords();
  if (records.length === 0) return '<div class="ranking-empty">NO DATA — COMPLETE MISSIONS TO REGISTER</div>';
  const classR = getClassRankings();
  const topAgents = [...records].sort((a, b) => b.score - a.score).slice(0, 10);
  const medals = ["🥇", "🥈", "🥉"];
  let classRows = classR.map((c, i) => `<tr><td>${medals[i] || (i+1)}</td><td><strong>${c.cls}</strong></td><td>${c.avg}</td><td>${c.certified}</td><td>${c.count}</td></tr>`).join("");
  let agentRows = topAgents.map((a, i) => `<tr><td>${medals[i] || (i+1)}</td><td>${a.name}</td><td>${a.cls}</td><td><strong>${a.score}</strong></td><td>${a.rank}</td></tr>`).join("");
  return `<div class="ranking-layout">
    <div>
      <h3 style="margin:0 0 10px; font-size:13px; font-family:Orbitron,monospace; color:var(--gold); letter-spacing:2px;">SQUAD RANKINGS</h3>
      <table class="ranking-table"><thead><tr><th>#</th><th>SQUAD</th><th>AVG</th><th>CERT</th><th>CNT</th></tr></thead><tbody>${classRows}</tbody></table>
    </div>
    <div>
      <h3 style="margin:0 0 10px; font-size:13px; font-family:Orbitron,monospace; color:var(--gold); letter-spacing:2px;">TOP AGENTS</h3>
      <table class="ranking-table"><thead><tr><th>#</th><th>AGENT</th><th>SQUAD</th><th>SCORE</th><th>RANK</th></tr></thead><tbody>${agentRows}</tbody></table>
    </div>
  </div>
  <details class="teacher-zone"><summary>ADMIN ZONE</summary>
    <div class="actions" style="margin-top:12px;">
      <button class="btn btn-secondary" onclick="exportCSV()">EXPORT CSV</button>
      <button class="btn btn-red" onclick="clearLeaderboard()">PURGE ALL RECORDS</button>
    </div>
    <div class="small" style="margin-top:8px;">排行榜資料儲存於此裝置瀏覽器中。如需跨裝置彙整，請使用「EXPORT CSV」。</div>
  </details>`;
}

function clearLeaderboard() {
  if (confirm("確定要清除所有排行紀錄嗎？此動作無法復原。")) {
    localStorage.removeItem("foodsafety_records");
    renderHome();
  }
}

function exportCSV() {
  const records = loadRecords();
  if (records.length === 0) { alert("目前沒有任何紀錄。"); return; }
  let csv = "\uFEFF姓名,班級,總分,階級,L1,L2,L3,L4,L5,日期\n";
  records.forEach(r => {
    const ls = r.levelScores || {};
    csv += [r.name, r.cls, r.score, r.rank, ls[1]||0, ls[2]||0, ls[3]||0, ls[4]||0, ls[5]||0, r.date].join(",") + "\n";
  });
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "food_safety_records.csv";
  a.click();
}

