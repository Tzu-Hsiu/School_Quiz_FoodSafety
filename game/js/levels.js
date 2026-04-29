function renderHome() {
  clearTimers();
  updateRank();
  const rankHtml = rankList.map(rank => `
    <div class="rank-chip ${state.rank === rank.name ? "active" : ""}">${rank.name}</div>
  `).join("");
  const badgeHtml = badges.map(b => `
    <div class="badge ${state.badges.includes(b.id) ? "earned" : ""}">${b.label}</div>
  `).join("");
  const levelCards = [
    ["LEVEL 1", "知識測驗", "🔎", "用情境題建立基礎判斷力"],
    ["LEVEL 2", "現場稽查", "🏪", "巡檢五大區域找出衛生紅旗"],
    ["LEVEL 3", "標示鑑定", "🏷️", "限時判讀合格與違規標示"],
    ["LEVEL 4", "決策模擬", "🧭", "用調查點數做團膳決策"],
    ["LEVEL 5", "認證考試", "🎓", "通過後取得認證證書"]
  ].map((item, index) => {
    const level = index + 1;
    const unlocked = lockCheck(level);
    return `<div class="level-card ${unlocked ? "unlocked" : "locked"}">
      <div>
        <div class="icon">${item[2]}</div>
        <h3>${item[0]}</h3>
        <p style="font-size:13px; margin:4px 0 0; color:var(--muted);">${item[1]}</p>
        <p style="font-size:12px; margin:4px 0 0; color:var(--muted);">${item[3]}</p>
      </div>
      <button class="btn ${unlocked ? "btn-primary" : "btn-secondary"}" ${unlocked ? 'onclick="startMission(' + level + ')"' : "disabled"}>${unlocked ? "START" : "LOCKED"}</button>
    </div>`;
  }).join("");
  renderApp(`
    <section class="screen">
      <div class="container">
        ${renderNav()}
        <div class="hero">
          <div class="panel">
            <h1>外食稽查員認證</h1>
            <p class="lead">歡迎加入外食稽查總署。通過五個關卡的考驗，學習如何在日常外食中做出安全的選擇，成為合格的外食稽查員。</p>
            <div class="hero-list">
              <div class="hero-item"><strong>訓練內容：</strong>食品標示判讀、餐廳衛生稽查、危險溫度帶管理、食品添加物辨識、GHP/HACCP 認證識別。</div>
              <div class="hero-item"><strong>關卡流程：</strong>情境測驗 → 餐廳現場稽查 → 限時標示鑑定 → 外食決策模擬 → 綜合認證考試。</div>
            </div>
            <div class="input-group">
              <input id="studentName" class="name-input" value="${state.studentName}" placeholder="輸入你的代號（姓名）">
              <input id="studentClass" class="name-input" value="${state.studentClass}" placeholder="班級">
              <button class="btn btn-gold" onclick="saveName()">REGISTER</button>
            </div>
            <div class="ranks">${rankHtml}</div>
          </div>
          <div class="panel">
            <h2 class="section-title" style="color:var(--gold);">AGENT STATUS</h2>
            <div class="stats">
              <div class="stat">
                <div class="stat-label">TOTAL SCORE</div>
                <div class="stat-value">${state.totalScore}</div>
              </div>
              <div class="stat">
                <div class="stat-label">RANK</div>
                <div class="stat-value" style="font-size:20px;">${state.rank}</div>
              </div>
              <div class="stat">
                <div class="stat-label">LEVELS</div>
                <div class="stat-value">${state.unlockedLevel}/5</div>
              </div>
              <div class="stat">
                <div class="stat-label">BADGES</div>
                <div class="stat-value">${state.badges.length}</div>
              </div>
            </div>
            <div class="badges">${badgeHtml}</div>
          </div>
        </div>
        <div class="level-grid">${levelCards}</div>
        <div class="panel" style="margin-top:20px;">
          <h2 class="section-title" style="color:var(--gold);">LEADERBOARD</h2>
          ${renderLeaderboardHTML()}
        </div>
      </div>
    </section>
  `);
}

function saveName() {
  const nameEl = document.getElementById("studentName");
  const clsEl = document.getElementById("studentClass");
  state.studentName = (nameEl ? nameEl.value.trim() : "") || "匿名學員";
  state.studentClass = (clsEl ? clsEl.value.trim() : "") || "未分班";
  renderHome();
}

function renderLevel1() {
  const q = level1Questions[state.l1Index];
  const progress = ((state.l1Index) / level1Questions.length) * 100;
  renderApp(`
    <section class="screen">
      <div class="container">
        ${renderStatus("LEVEL 1 — 食安知識測驗", 1, `
          <div class="status-cell"><div class="status-label">QUESTION</div><div class="status-value">${state.l1Index + 1}/${level1Questions.length}</div></div>
          <div class="status-cell"><div class="status-label">RANK</div><div class="status-value" style="font-size:16px;">${state.rank}</div></div>
        `)}
        ${state.l1Index === 0 && !state.l1Answered ? renderCommander(commanderLines[1]) : ""}
        <div class="panel question-card">
          <div class="small">SCENARIO ${state.l1Index + 1}</div>
          <h3 class="section-title" style="margin-top:8px; font-family:inherit; font-size:18px;">${q.prompt}</h3>
          ${renderSpeedZone("l1-speed")}
          <div class="choice-grid">
            ${q.options.map((option, index) => '<button class="choice" id="l1-option-' + index + '" onclick="answerLevel1(' + index + ')">' + String.fromCharCode(65 + index) + "．" + option + "</button>").join("")}
          </div>
          <div class="progress"><div class="progress-fill" style="width:${progress}%;"></div></div>
          <div class="actions" id="l1-actions">
            ${state.l1Answered ? '<button class="btn btn-primary" onclick="nextLevel1()">' + (state.l1Index === level1Questions.length - 1 ? "MISSION COMPLETE" : "NEXT →") + "</button>" : ""}
          </div>
          <div id="l1-feedback"></div>
        </div>
      </div>
    </section>
  `);
  if (!state.l1Answered) startSpeedTimer("l1-speed");
}

function answerLevel1(index) {
  if (state.l1Answered) return;
  state.l1Answered = true;
  if (state.speedTimer) clearInterval(state.speedTimer);
  const q = level1Questions[state.l1Index];
  const correct = index === q.answer;
  const base = 12;
  const bonus = correct ? getSpeedBonus() : 0;
  if (correct) addScore(1, base + bonus);
  document.querySelectorAll('[id^="l1-option-"]').forEach((el, i) => {
    if (i === q.answer) el.classList.add("correct");
    else if (i === index) el.classList.add("wrong");
    el.disabled = true;
  });
  if (!correct) { triggerShake(); triggerRedFlash(); showDramaticText("VIOLATION DETECTED", "fail"); }
  else { showScorePopup(base, bonus); showDramaticText("TARGET ACQUIRED", "success"); }
  const scoreHtml = correct ? '<div class="score-earned">+' + base + ' BASE' + (bonus > 0 ? ' <span class="speed-glow">+' + bonus + ' SPEED</span>' : '') + '</div>' : '';
  document.getElementById("l1-feedback").innerHTML = `
    <div class="feedback-card ${correct ? "good" : "bad"}">
      ${scoreHtml}
      <div class="feedback-title">${correct ? "✓ 判斷正確" : "✗ 判斷失誤"}</div>
      <p>${q.explanation}</p>
    </div>`;
  document.getElementById("l1-actions").innerHTML = '<button class="btn btn-primary" data-action="nextLevel1()">' + (state.l1Index === level1Questions.length - 1 ? "MISSION COMPLETE" : "NEXT →") + "</button>";
}

function nextLevel1() {
  if (state.l1Index < level1Questions.length - 1) {
    state.l1Index += 1;
    state.l1Answered = false;
    renderLevel1();
    return;
  }
  if (state.levelScores[1] >= 60) awardBadge("quiz");
  completeLevel(1, 10, null);
  showDramaticText("MISSION CLEARED", "clear");
  renderLevelComplete(1, "LEVEL 1 COMPLETE", "第一關完成。接下來進入餐廳現場稽查，巡檢各區域的衛生狀況。",
    [`本關得分：${state.levelScores[1]}`], "PROCEED TO LEVEL 2", () => startMission(2));
}

function renderLevel2() {
  const foundCount = state.l2Found.filter(id => inspectionTiles.find(t => t.id === id && t.issue)).length;
  const progress = (foundCount / inspectionTiles.filter(t => t.issue).length) * 100;
  const selected = inspectionTiles.find(tile => tile.id === state.l2Selected);
  renderApp(`
    <section class="screen">
      <div class="container">
        ${renderStatus("LEVEL 2 — 現場稽查", 2, `
          <div class="status-cell"><div class="status-label">FOUND</div><div class="status-value">${foundCount}/${inspectionTiles.filter(t => t.issue).length}</div></div>
          <div class="status-cell"><div class="status-label">PROGRESS</div><div class="status-value">${Math.round(progress)}%</div></div>
        `)}
        ${foundCount === 0 && !selected ? renderCommander(commanderLines[2]) : ""}
        <div class="inspect-layout">
          <div class="panel">
            <div class="inspect-grid">
              ${inspectionTiles.map(tile => {
                const done = state.l2Found.includes(tile.id);
                return '<button class="inspect-tile ' + (done ? "done" : "") + " " + (tile.issue ? "" : "safe") + '" onclick="selectInspectTile(\'' + tile.id + '\')">' +
                  '<div class="inspect-tag">' + tile.area + '</div>' +
                  '<div style="font-size:34px;">' + tile.icon + '</div>' +
                  '<div><div style="font-weight:800; margin-bottom:6px;">' + tile.title + '</div>' +
                  '<div class="small">' + (done ? "CLEARED" : "INSPECT") + '</div></div></button>';
              }).join("")}
            </div>
            <div class="progress"><div class="progress-fill" style="width:${progress}%;"></div></div>
          </div>
          <div class="panel inspect-panel">
            ${selected ? renderInspectPanel(selected) : '<h3 class="section-title">AWAITING INSPECTION</h3><p class="mission-desc">選擇一個區域開始巡檢。</p>'}
            ${foundCount >= inspectionTiles.filter(t => t.issue).length ? '<div class="actions"><button class="btn btn-green" onclick="finishLevel2()">COMPLETE LEVEL 2</button></div>' : ""}
          </div>
        </div>
      </div>
    </section>
  `);
  if (selected && !state.l2Found.includes(selected.id) && selected.issue) {
    startSpeedTimer("l2-speed");
  }
}

function renderInspectPanel(tile) {
  if (!tile.issue) {
    return '<h3 class="section-title">' + tile.title + '</h3><p class="mission-desc">' + tile.detail + '</p>' +
      '<div class="feedback-card good"><div class="feedback-title">✓ POSITIVE OBSERVATION</div><p>' + tile.explanation + '</p></div>';
  }
  const alreadyDone = state.l2Found.includes(tile.id);
  if (alreadyDone) {
    return '<h3 class="section-title">' + tile.title + '</h3><p class="mission-desc">' + tile.detail + '</p>' +
      '<div class="feedback-card good"><div class="feedback-title">✓ RESOLVED</div><p>' + tile.explanation + '</p></div>';
  }
  return '<h3 class="section-title">' + tile.title + '</h3><p class="mission-desc">' + tile.detail + '</p>' +
    renderSpeedZone("l2-speed") +
    '<div class="small" style="margin-top:14px;">選出最適合的改善措施：</div>' +
    tile.fixes.map((fix, index) => '<button class="fix-option" onclick="answerInspect(\'' + tile.id + '\', ' + index + ')">' + String.fromCharCode(65 + index) + "．" + fix + "</button>").join("");
}

function selectInspectTile(id) {
  state.l2Selected = id;
  const tile = inspectionTiles.find(t => t.id === id);
  if (tile && !tile.issue && tile.bonus && !state.l2Found.includes(id)) {
    addScore(2, tile.bonus);
    state.l2Found.push(id);
    showScorePopup(tile.bonus, 0);
  }
  renderLevel2();
}

function answerInspect(id, index) {
  const tile = inspectionTiles.find(t => t.id === id);
  if (!tile || state.l2Found.includes(id)) return;
  if (state.speedTimer) clearInterval(state.speedTimer);
  const correct = index === tile.answer;
  const base = 10;
  const bonus = correct ? getSpeedBonus() : 0;
  if (correct) {
    addScore(2, base + bonus);
    state.l2Found.push(id);
    showScorePopup(base, bonus);
    showDramaticText("ISSUE RESOLVED", "success");
  } else {
    triggerShake();
    triggerRedFlash();
    showDramaticText("INCORRECT FIX", "fail");
  }
  const panel = document.querySelector(".inspect-panel");
  const scoreHtml = correct ? '<div class="score-earned">+' + base + ' BASE' + (bonus > 0 ? ' <span class="speed-glow">+' + bonus + ' SPEED</span>' : '') + '</div>' : '';
  panel.innerHTML = '<h3 class="section-title">' + tile.title + '</h3><p class="mission-desc">' + tile.detail + '</p>' +
    '<div class="feedback-card ' + (correct ? "good" : "bad") + '">' + scoreHtml +
    '<div class="feedback-title">' + (correct ? "✓ 處置正確" : "✗ 處置失誤") + '</div><p>' + tile.explanation + '</p></div>' +
    '<div class="actions"><button class="btn btn-primary" onclick="renderLevel2()">BACK TO MAP</button></div>';
}

function finishLevel2() {
  if (state.levelScores[2] >= 70) awardBadge("inspect");
  completeLevel(2, 12, null);
  showDramaticText("MISSION CLEARED", "clear");
  renderLevelComplete(2, "LEVEL 2 COMPLETE", "餐廳巡檢完成。下一關是限時食品標示鑑定。",
    [`本關得分：${state.levelScores[2]}`], "PROCEED TO LEVEL 3", () => startMission(3));
}

function startL3Timer() {
  clearTimers();
  state.l3Timer = setInterval(() => {
    state.l3TimeLeft -= 1;
    const timerEl = document.getElementById("l3-timer");
    if (timerEl) {
      timerEl.textContent = state.l3TimeLeft + " s";
      if (state.l3TimeLeft <= 15) timerEl.classList.add("timer-danger");
    }
    if (state.l3TimeLeft <= 0) {
      clearTimers();
      showDramaticText("TIME EXPIRED", "fail");
      renderLevelComplete(3, "LEVEL 3 — TIME UP", "標示判讀講求又快又準。你可以回首頁重新挑戰第三關。",
        [`本關得分：${state.levelScores[3]}`], "RETURN TO HQ", () => goHome());
    }
  }, 1000);
}

function renderLevel3() {
  const item = labelCases[state.l3Index];
  const progress = (state.l3Index / labelCases.length) * 100;
  renderApp(`
    <section class="screen">
      <div class="container">
        ${renderStatus("LEVEL 3 — 標示鑑定", 3, `
          <div class="status-cell"><div class="status-label">TIME</div><div id="l3-timer" class="status-value ${state.l3TimeLeft <= 15 ? 'timer-danger' : ''}">${state.l3TimeLeft} s</div></div>
          <div class="status-cell"><div class="status-label">CASE</div><div class="status-value">${state.l3Index + 1}/${labelCases.length}</div></div>
        `)}
        ${state.l3Index === 0 && !state.l3Answered ? renderCommander(commanderLines[3]) : ""}
        <div class="label-layout">
          <div class="label-card">
            <div class="small">CASE ${state.l3Index + 1}</div>
            <h3 class="section-title" style="margin-top:8px; font-family:inherit; font-size:18px;">${item.product}</h3>
            <p class="mission-desc">${item.context}</p>
            <div class="label-meta">
              ${Object.entries(item.fields).map(([key, value]) => '<div class="label-box"><strong>' + key + '</strong><div>' + value + '</div></div>').join("")}
            </div>
          </div>
          <div class="panel">
            <h3 class="section-title">VERDICT</h3>
            ${renderSpeedZone("l3-speed")}
            <div class="judge-row">
              <button class="btn btn-green" onclick="answerLevel3(true)" ${state.l3Answered ? "disabled" : ""}>PASS ✓</button>
              <button class="btn btn-red" onclick="answerLevel3(false)" ${state.l3Answered ? "disabled" : ""}>FAIL ✗</button>
            </div>
            <div id="l3-feedback"></div>
            <div class="progress"><div class="progress-fill" style="width:${progress}%;"></div></div>
          </div>
        </div>
      </div>
    </section>
  `);
  if (!state.l3Answered) startSpeedTimer("l3-speed");
}

function answerLevel3(verdict) {
  if (state.l3Answered) return;
  state.l3Answered = true;
  if (state.speedTimer) clearInterval(state.speedTimer);
  const item = labelCases[state.l3Index];
  const correct = verdict === item.verdict;
  const base = 14;
  const bonus = correct ? getSpeedBonus() : 0;
  if (correct) {
    addScore(3, base + bonus);
    showScorePopup(base, bonus);
    showDramaticText("INTEL VERIFIED", "success");
  } else {
    triggerShake();
    triggerRedFlash();
    showDramaticText("MISREAD", "fail");
  }
  const scoreHtml = correct ? '<div class="score-earned">+' + base + ' BASE' + (bonus > 0 ? ' <span class="speed-glow">+' + bonus + ' SPEED</span>' : '') + '</div>' : '';
  document.getElementById("l3-feedback").innerHTML =
    '<div class="feedback-card ' + (correct ? "good" : "bad") + '" style="margin-top:18px;">' + scoreHtml +
    '<div class="feedback-title">' + (correct ? "✓ 判讀正確" : "✗ 判讀失誤") + '</div><p>' + item.explanation + '</p></div>' +
    '<div class="actions"><button class="btn btn-primary" onclick="nextLevel3()">' + (state.l3Index === labelCases.length - 1 ? "COMPLETE LEVEL 3" : "NEXT CASE →") + '</button></div>';
}

function nextLevel3() {
  if (state.l3Index < labelCases.length - 1) {
    state.l3Index += 1;
    state.l3Answered = false;
    renderLevel3();
    return;
  }
  clearTimers();
  if (state.levelScores[3] >= 60) awardBadge("label");
  completeLevel(3, 12, null);
  showDramaticText("MISSION CLEARED", "clear");
  renderLevelComplete(3, "LEVEL 3 COMPLETE", "標示鑑定完成。下一關是外食決策模擬。",
    [`本關得分：${state.levelScores[3]}`], "PROCEED TO LEVEL 4", () => startMission(4));
}

function renderLevel4() {
  const mission = missions[state.l4MissionIndex];
  const selected = mission.restaurants.find(r => r.name === state.l4SelectedRestaurant);
  renderApp(`
    <section class="screen">
      <div class="container">
        ${renderStatus("LEVEL 4 — 決策模擬", 4, `
          <div class="status-cell"><div class="status-label">MISSION</div><div class="status-value">${state.l4MissionIndex + 1}/${missions.length}</div></div>
          <div class="status-cell"><div class="status-label">INTEL PTS</div><div class="status-value">${state.l4InvestigationsLeft}</div></div>
        `)}
        ${state.l4MissionIndex === 0 && !selected ? renderCommander(commanderLines[4]) : ""}
        <div class="panel mission-card">
          <div class="small">DECISION ${state.l4MissionIndex + 1}</div>
          <h2 class="mission-title" style="margin-top:8px;">${mission.title}</h2>
          <p class="mission-desc">${mission.prompt}</p>
          ${state.l4PendingNews ? '<div class="news-flash"><strong>⚠ BREAKING:</strong> ' + state.l4PendingNews + '</div>' : ""}
        </div>
        <div class="mission-layout">
          <div class="panel">
            <div class="restaurant-grid">
              ${mission.restaurants.map(r => '<button class="restaurant-card ' + (state.l4SelectedRestaurant === r.name ? "selected" : "") + '" onclick="selectRestaurant(\'' + r.name + '\')">' +
                '<div style="font-size:30px;">🍽️</div>' +
                '<h3 style="margin:10px 0 6px;">' + r.name + '</h3>' +
                '<div class="small">單價：' + r.price + ' 元</div>' +
                '<div class="pill-row"><div class="pill good">' + r.cert + '</div><div class="pill warn">' + r.vibe + '</div></div>' +
                '</button>').join("")}
            </div>
          </div>
          <div class="panel mission-panel">
            ${selected ? renderRestaurantPanel(selected) : '<h3 class="section-title">SELECT TARGET</h3><p class="mission-desc">點選一家餐廳查看詳情。</p>'}
          </div>
        </div>
      </div>
    </section>
  `);
}

function selectRestaurant(name) {
  state.l4SelectedRestaurant = name;
  state.questionStartTime = Date.now();
  renderLevel4();
}

function renderRestaurantPanel(r) {
  const mission = missions[state.l4MissionIndex];
  const revealedCount = state.l4Completed.filter(item => item.mission === state.l4MissionIndex && item.restaurant === r.name).length;
  return '<h3 class="section-title">' + r.name + '</h3><p class="mission-desc">' + r.safety + '</p>' +
    '<div class="evidence-list" style="margin-top:14px;">' +
    (r.reveals.slice(0, revealedCount).map(text => '<div class="evidence-item"><strong>INTEL:</strong> ' + text + '</div>').join("") || '<div class="evidence-item"><strong>STATUS:</strong> 尚未使用調查點數深入查核。</div>') +
    '</div><div class="actions">' +
    '<button class="btn btn-secondary" onclick="investigateRestaurant()" ' + (state.l4InvestigationsLeft <= 0 || revealedCount >= r.reveals.length ? "disabled" : "") + '>INVESTIGATE (-1 pt)</button>' +
    '<button class="btn btn-gold" onclick="confirmRestaurant()">CONFIRM CHOICE</button></div>';
}

function investigateRestaurant() {
  const mission = missions[state.l4MissionIndex];
  const r = mission.restaurants.find(item => item.name === state.l4SelectedRestaurant);
  if (!r || state.l4InvestigationsLeft <= 0) return;
  const revealedCount = state.l4Completed.filter(item => item.mission === state.l4MissionIndex && item.restaurant === r.name).length;
  if (revealedCount >= r.reveals.length) return;
  state.l4Completed.push({ mission: state.l4MissionIndex, restaurant: r.name, reveal: revealedCount });
  state.l4InvestigationsLeft -= 1;
  state.l4PendingNews = null;
  renderLevel4();
}

function confirmRestaurant() {
  const mission = missions[state.l4MissionIndex];
  const selected = mission.restaurants.find(item => item.name === state.l4SelectedRestaurant);
  if (!selected) return;
  const correct = selected.name === mission.best;
  const base = correct ? 26 : (selected.score >= 26 ? 16 : 0);
  const bonus = correct ? getSpeedBonus() : 0;
  if (base > 0) addScore(4, base + bonus);
  if (correct) {
    showScorePopup(base, bonus);
    showDramaticText("OPTIMAL CHOICE", "success");
  } else {
    triggerShake();
    showDramaticText("SUBOPTIMAL", "fail");
  }
  const scoreHtml = correct ? '<div class="score-earned">+' + base + ' BASE' + (bonus > 0 ? ' <span class="speed-glow">+' + bonus + ' SPEED</span>' : '') + '</div>' : '';
  const panel = document.querySelector(".mission-panel");
  panel.innerHTML = '<div class="feedback-card ' + (correct ? "good" : "bad") + '">' + scoreHtml +
    '<div class="feedback-title">' + (correct ? "✓ 決策正確" : "✗ 決策待改進") + '</div>' +
    '<p>' + mission.explanation + '</p><p><strong>你的選擇：</strong>' + selected.name + '</p><p><strong>最佳選擇：</strong>' + mission.best + '</p></div>' +
    '<div class="actions"><button class="btn btn-primary" onclick="nextMission4()">' + (state.l4MissionIndex === missions.length - 1 ? "COMPLETE LEVEL 4" : "NEXT DECISION →") + '</button></div>';
}

function nextMission4() {
  if (state.l4MissionIndex < missions.length - 1) {
    state.l4MissionIndex += 1;
    state.l4InvestigationsLeft = 3;
    state.l4SelectedRestaurant = null;
    state.l4PendingNews = missions[state.l4MissionIndex].newsFlash;
    renderLevel4();
    return;
  }
  if (state.levelScores[4] >= 60) awardBadge("decision");
  completeLevel(4, 16, null);
  showDramaticText("MISSION CLEARED", "clear");
  renderLevelComplete(4, "LEVEL 4 COMPLETE", "決策模擬完成。最終關卡：綜合認證考試。",
    [`本關得分：${state.levelScores[4]}`, "通過考試即可獲得認證證書。"],
    "PROCEED TO FINAL EXAM", () => startMission(5));
}

function startL5Timer() {
  clearTimers();
  state.l5Timer = setInterval(() => {
    state.l5TimeLeft -= 1;
    const timerEl = document.getElementById("l5-timer");
    if (timerEl) {
      timerEl.textContent = state.l5TimeLeft + " s";
      if (state.l5TimeLeft <= 20) timerEl.classList.add("timer-danger");
    }
    if (state.l5TimeLeft <= 0) {
      clearTimers();
      showDramaticText("TIME EXPIRED", "fail");
      finishExam();
    }
  }, 1000);
}

function renderLevel5() {
  const q = finalExam[state.l5Index];
  const progress = (state.l5Index / finalExam.length) * 100;
  renderApp(`
    <section class="screen">
      <div class="container">
        ${renderStatus("LEVEL 5 — 認證考試", 5, `
          <div class="status-cell"><div class="status-label">TIME</div><div id="l5-timer" class="status-value ${state.l5TimeLeft <= 20 ? 'timer-danger' : ''}">${state.l5TimeLeft} s</div></div>
          <div class="status-cell"><div class="status-label">QUESTION</div><div class="status-value">${state.l5Index + 1}/${finalExam.length}</div></div>
        `)}
        ${state.l5Index === 0 && !state.l5Answered ? renderCommander(commanderLines[5]) : ""}
        <div class="exam-layout">
          <div class="panel">
            <div class="small">${q.type}</div>
            <h3 class="section-title" style="margin-top:8px; font-family:inherit; font-size:17px;">${q.prompt}</h3>
            ${renderSpeedZone("l5-speed")}
            <div class="exam-option-list">
              ${q.options.map((option, index) => '<button class="exam-option" id="l5-option-' + index + '" onclick="answerLevel5(' + index + ')">' + String.fromCharCode(65 + index) + "．" + option + "</button>").join("")}
            </div>
            <div class="progress"><div class="progress-fill" style="width:${progress}%;"></div></div>
          </div>
          <div class="panel">
            <div id="l5-feedback"></div>
          </div>
        </div>
      </div>
    </section>
  `);
  if (!state.l5Answered) startSpeedTimer("l5-speed");
}

function answerLevel5(index) {
  if (state.l5Answered) return;
  state.l5Answered = true;
  if (state.speedTimer) clearInterval(state.speedTimer);
  const q = finalExam[state.l5Index];
  const correct = index === q.answer;
  const base = 16;
  const bonus = correct ? getSpeedBonus() : 0;
  if (correct) addScore(5, base + bonus);
  document.querySelectorAll('[id^="l5-option-"]').forEach((el, i) => {
    if (i === q.answer) el.classList.add("correct");
    else if (i === index) el.classList.add("wrong");
    el.disabled = true;
  });
  if (!correct) { triggerShake(); triggerRedFlash(); }
  else { showScorePopup(base, bonus); }
  const scoreHtml = correct ? '<div class="score-earned">+' + base + ' BASE' + (bonus > 0 ? ' <span class="speed-glow">+' + bonus + ' SPEED</span>' : '') + '</div>' : '';
  document.getElementById("l5-feedback").innerHTML =
    '<div class="feedback-card ' + (correct ? "good" : "bad") + '" style="margin-top:16px;">' + scoreHtml +
    '<div class="feedback-title">' + (correct ? "✓ CORRECT" : "✗ INCORRECT") + '</div><p>' + q.explanation + '</p></div>' +
    '<div class="actions"><button class="btn btn-primary" onclick="nextLevel5()">' + (state.l5Index === finalExam.length - 1 ? "SUBMIT EXAM" : "NEXT →") + '</button></div>';
}

function nextLevel5() {
  if (state.l5Index < finalExam.length - 1) {
    state.l5Index += 1;
    state.l5Answered = false;
    renderLevel5();
    return;
  }
  finishExam();
}

function finishExam() {
  clearTimers();
  if (state.levelScores[5] >= 72) awardBadge("cert");
  saveRecord();
  showDramaticText("EXAM COMPLETE", "clear");
  setTimeout(() => renderCertificate(), 500);
}

function renderCertificate() {
  updateRank();
  const passed = state.totalScore >= 340 || state.levelScores[5] >= 72;
  renderApp(`
    <section class="screen">
      <div class="container">
        ${renderNav('<button class="btn btn-primary" onclick="window.print()">PRINT</button>')}
        <div class="certificate">
          <h2>${passed ? "CERTIFIED AGENT" : "TRAINING COMPLETE"}</h2>
          <div class="certificate-sub">${passed ? "合格外食稽查員認證證書" : "外食稽查員培訓結業證明"}</div>
          <div class="certificate-name">${state.studentName || "匿名學員"}</div>
          <div class="certificate-sub" style="font-size:18px; margin-top:4px;">${state.studentClass || "未分班"}</div>
          <p style="text-align:center; line-height:1.9;">
            ${passed ? "已完成外食稽查總署五階段高強度特訓，通過綜合認證考試，具備餐廳現場稽查、食品標示判讀、溫度風險管理與外食決策能力。特此認證。" : "已完成外食稽查總署培訓流程。建議針對薄弱環節再次挑戰，強化溫控判斷、標示鑑定與綜合決策能力後重新應考。"}
          </p>
          <div class="certificate-grid">
            <div class="certificate-cell">
              <div class="small">TOTAL SCORE</div>
              <div class="stat-value">${state.totalScore}</div>
            </div>
            <div class="certificate-cell">
              <div class="small">EXAM SCORE</div>
              <div class="stat-value">${state.levelScores[5]}</div>
            </div>
            <div class="certificate-cell">
              <div class="small">RANK</div>
              <div class="stat-value" style="font-size:18px;">${passed ? "合格外食稽查員" : state.rank}</div>
            </div>
          </div>
          <div class="certificate-footer">CERTIFIED ${getToday()}</div>
        </div>
        <div class="panel" style="margin-top:18px;">
          <h3 class="section-title">SCORE BREAKDOWN</h3>
          <div class="feedback-list">
            <div class="feedback-item"><strong>LEVEL 1：</strong>${state.levelScores[1]} pts</div>
            <div class="feedback-item"><strong>LEVEL 2：</strong>${state.levelScores[2]} pts</div>
            <div class="feedback-item"><strong>LEVEL 3：</strong>${state.levelScores[3]} pts</div>
            <div class="feedback-item"><strong>LEVEL 4：</strong>${state.levelScores[4]} pts</div>
            <div class="feedback-item"><strong>LEVEL 5：</strong>${state.levelScores[5]} pts</div>
          </div>
          <div class="actions">
            <button class="btn btn-gold" onclick="goHome()">RETURN TO HQ</button>
            <button class="btn btn-secondary" onclick="startMission(5)">RETAKE EXAM</button>
          </div>
        </div>
      </div>
    </section>
  `);
}

function renderLevelComplete(level, title, desc, bullets, ctaLabel, ctaAction) {
  renderApp(`
    <section class="screen">
      <div class="container">
        ${renderNav()}
        <div class="panel" style="max-width:760px; margin:0 auto;">
          <h2 class="mission-title">${title}</h2>
          <p class="mission-desc">${desc}</p>
          <div class="feedback-list" style="margin-top:18px;">
            ${bullets.map(text => '<div class="feedback-item">' + text + '</div>').join("")}
          </div>
          <div class="actions">
            <button class="btn btn-primary" onclick="levelCompleteNext()">${ctaLabel}</button>
            <button class="btn btn-secondary" onclick="goHome()">RETURN TO HQ</button>
          </div>
        </div>
      </div>
    </section>
  `);
  window.levelCompleteNext = ctaAction;
}
