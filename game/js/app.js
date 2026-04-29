renderHome();

document.getElementById("app").addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target || target.disabled) return;
  runAction(target.getAttribute("data-action"));
});
