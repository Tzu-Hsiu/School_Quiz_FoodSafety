function getToday() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y} 年 ${m} 月 ${day} 日`;
}

function updateRank() {
  let current = rankList[0].name;
  for (const rank of rankList) {
    if (state.totalScore >= rank.min) current = rank.name;
  }
  state.rank = current;
}

function resetLevel(level) {
  state.totalScore -= state.levelScores[level];
  if (state.totalScore < 0) state.totalScore = 0;
  state.levelScores[level] = 0;
  updateRank();
}

function addScore(level, points) {
  state.levelScores[level] += points;
  state.totalScore += points;
  updateRank();
}

function awardBadge(id) {
  if (!state.badges.includes(id)) state.badges.push(id);
}

function goHome() {
  clearTimers();
  renderHome();
}

function clearTimers() {
  if (state.l3Timer) clearInterval(state.l3Timer);
  if (state.l5Timer) clearInterval(state.l5Timer);
  if (state.speedTimer) clearInterval(state.speedTimer);
  state.l3Timer = null;
  state.l5Timer = null;
  state.speedTimer = null;
}

function lockCheck(level) {
  return state.unlockedLevel >= level;
}

function getSpeedBonus() {
  if (!state.questionStartTime) return 0;
  const elapsed = (Date.now() - state.questionStartTime) / 1000;
  return Math.max(0, Math.floor(10 - elapsed));
}

function startSpeedTimer(containerId) {
  state.questionStartTime = Date.now();
  if (state.speedTimer) clearInterval(state.speedTimer);
  state.speedTimer = setInterval(() => {
    const el = document.getElementById(containerId);
    if (!el) { clearInterval(state.speedTimer); return; }
    const bonus = getSpeedBonus();
    el.textContent = bonus > 0 ? `+${bonus}` : "—";
    el.className = `speed-value ${bonus > 6 ? "high" : bonus > 3 ? "med" : bonus > 0 ? "low" : "zero"}`;
  }, 100);
}

function showScorePopup(base, bonus) {
  const popup = document.createElement("div");
  popup.className = "score-popup";
  popup.innerHTML = `<div class="score-base">+${base + bonus}</div>${bonus > 0 ? '<div class="score-speed">SPEED BONUS +' + bonus + '</div>' : ''}`;
  document.body.appendChild(popup);
  setTimeout(() => popup.remove(), 2200);
}

function triggerShake() {
  const app = document.getElementById("app");
  app.classList.add("shake");
  setTimeout(() => app.classList.remove("shake"), 500);
}

function triggerRedFlash() {
  const flash = document.createElement("div");
  flash.className = "red-flash";
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 600);
}

function showDramaticText(text, type) {
  const overlay = document.createElement("div");
  overlay.className = `dramatic-overlay dramatic-${type}`;
  overlay.innerHTML = `<div class="dramatic-text">${text}</div>`;
  document.body.appendChild(overlay);
  setTimeout(() => overlay.remove(), 2200);
}

function renderCommander(message) {
  return `<div class="commander-box">
    <div class="commander-avatar">🤖</div>
    <div><div class="commander-name">COMMANDER ARIA</div><div class="commander-msg">${message}</div></div>
  </div>`;
}

function renderXPBar() {
  const maxXP = 500;
  const pct = Math.min(100, (state.totalScore / maxXP) * 100);
  const rankIdx = rankList.findIndex(r => r.name === state.rank);
  const nextRank = rankList[rankIdx + 1];
  const nextLabel = nextRank ? `下一階級 ${nextRank.name} [${nextRank.min}]` : "MAX RANK";
  return `<div class="xp-container">
    <div class="xp-info">
      <span class="xp-rank">${state.rank}</span>
      <span class="xp-points">XP ${state.totalScore}</span>
      <span class="xp-next">${nextLabel}</span>
    </div>
    <div class="xp-track"><div class="xp-fill" style="width:${pct}%"></div></div>
  </div>`;
}

function renderSpeedZone(id) {
  return `<div class="speed-zone">
    <span class="speed-label">SPEED BONUS</span>
    <span class="speed-value high" id="${id}">+10</span>
  </div>`;
}

function startMission(level) {
  state.currentLevel = level;
  if (level === 1) {
    resetLevel(1);
    state.l1Index = 0;
    state.l1Answered = false;
    renderLevel1();
  }
  if (level === 2) {
    resetLevel(2);
    state.l2Found = [];
    state.l2Selected = null;
    state.l2Answered = false;
    renderLevel2();
  }
  if (level === 3) {
    resetLevel(3);
    state.l3Index = 0;
    state.l3Answered = false;
    state.l3TimeLeft = 75;
    renderLevel3();
    startL3Timer();
  }
  if (level === 4) {
    resetLevel(4);
    state.l4MissionIndex = 0;
    state.l4InvestigationsLeft = 3;
    state.l4SelectedRestaurant = null;
    state.l4Completed = [];
    state.l4PendingNews = missions[0].newsFlash;
    renderLevel4();
  }
  if (level === 5) {
    resetLevel(5);
    state.l5Index = 0;
    state.l5Answered = false;
    state.l5TimeLeft = 135;
    renderLevel5();
    startL5Timer();
  }
}

function completeLevel(level, passPoints, badgeId) {
  if (passPoints) addScore(level, passPoints);
  if (badgeId) awardBadge(badgeId);
  if (state.unlockedLevel === level && level < 5) state.unlockedLevel = level + 1;
  saveRecord();
}

function renderApp(html) {
  const app = document.getElementById("app");
  app.innerHTML = html.replace(/onclick="([^"]+)"/g, 'data-action="$1"');
}

function runAction(handler) {
  if (handler === "goHome()") return goHome();
  if (handler === "saveName()") return saveName();
  if (handler === "nextLevel1()") return nextLevel1();
  if (handler === "renderLevel2()") return renderLevel2();
  if (handler === "finishLevel2()") return finishLevel2();
  if (handler === "answerLevel3(true)") return answerLevel3(true);
  if (handler === "answerLevel3(false)") return answerLevel3(false);
  if (handler === "nextLevel3()") return nextLevel3();
  if (handler === "investigateRestaurant()") return investigateRestaurant();
  if (handler === "confirmRestaurant()") return confirmRestaurant();
  if (handler === "nextMission4()") return nextMission4();
  if (handler === "nextLevel5()") return nextLevel5();
  if (handler === "finishExam()") return finishExam();
  if (handler === "window.print()") return window.print();
  if (handler === "clearLeaderboard()") return clearLeaderboard();
  if (handler === "exportCSV()") return exportCSV();
  if (handler === "levelCompleteNext()") return window.levelCompleteNext && window.levelCompleteNext();

  let match = handler.match(/^startMission\((\d+)\)$/);
  if (match) return startMission(Number(match[1]));

  match = handler.match(/^answerLevel1\((\d+)\)$/);
  if (match) return answerLevel1(Number(match[1]));

  match = handler.match(/^selectInspectTile\('([^']+)'\)$/);
  if (match) return selectInspectTile(match[1]);

  match = handler.match(/^answerInspect\('([^']+)',\s*(\d+)\)$/);
  if (match) return answerInspect(match[1], Number(match[2]));

  match = handler.match(/^selectRestaurant\('([^']+)'\)$/);
  if (match) return selectRestaurant(match[1]);

  match = handler.match(/^answerLevel5\((\d+)\)$/);
  if (match) return answerLevel5(Number(match[1]));
}

