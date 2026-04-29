function renderNav(extra) {
  extra = extra || "";
  return `<div class="top-nav">
    <div class="brand">
      <div class="brand-mark">🛡️</div>
      <div>
        <div class="brand-title">FOOD SAFETY HQ</div>
        <div class="brand-sub">${state.studentClass || "—"} // ${state.studentName || "UNREGISTERED"}</div>
      </div>
    </div>
    <div class="actions" style="margin:0;">
      ${extra}
      <button class="btn btn-secondary" onclick="goHome()">HQ</button>
    </div>
  </div>
  ${renderXPBar()}`;
}

function renderStatus(levelTitle, levelNo, extraCells) {
  return `${renderNav()}
    <div class="status-bar">
      <div class="status-cell">
        <div class="status-label">MISSION</div>
        <div class="status-value" style="font-size:16px; letter-spacing:1px;">${levelTitle}</div>
      </div>
      <div class="status-cell">
        <div class="status-label">TOTAL</div>
        <div class="status-value">${state.totalScore}</div>
      </div>
      <div class="status-cell">
        <div class="status-label">LEVEL SCORE</div>
        <div class="status-value">${state.levelScores[levelNo]}</div>
      </div>
      ${extraCells}
    </div>`;
}

