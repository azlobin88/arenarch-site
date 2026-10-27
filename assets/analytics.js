// Yandex Metrika, only after the visitor agrees (152-FZ, GDPR): the banner asks once, the answer stays in this browser.
// Goals: "discord" (any Discord link), "survey" (the survey sent), "steam" (a Steam link, once there is one).
(function () {
  var COUNTER = 113823389;
  var KEY = "arenarch-analytics";
  var ru = document.documentElement.lang === "ru";
  var text = ru
    ? { msg: "Мы используем cookie и Яндекс Метрику, чтобы понимать, как люди пользуются сайтом.", yes: "Принять", no: "Отказаться", more: "Подробнее", page: "privacy.html" }
    : { msg: "We use cookies and Yandex Metrica to understand how people use this site.", yes: "Accept", no: "Decline", more: "Details", page: "privacy.html" };

  function choice() {
    try { return localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function remember(value) {
    try { localStorage.setItem(KEY, value); } catch (e) {}
  }

  function goal(name) {
    if (typeof window.ym === "function") { window.ym(COUNTER, "reachGoal", name); }
  }

  function start() {
    (function (m, e, t, r, i, k, a) {
      m[i] = m[i] || function () { (m[i].a = m[i].a || []).push(arguments); };
      m[i].l = 1 * new Date();
      for (var j = 0; j < e.scripts.length; j++) { if (e.scripts[j].src === r) { return; } }
      k = e.createElement(t); a = e.getElementsByTagName(t)[0]; k.async = 1; k.src = r; a.parentNode.insertBefore(k, a);
    })(window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
    window.ym(COUNTER, "init", { clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true });

    document.addEventListener("click", function (event) {
      var link = event.target.closest ? event.target.closest("a[href]") : null;
      if (!link) { return; }
      if (link.href.indexOf("discord.gg") !== -1 || link.href.indexOf("discord.com") !== -1) { goal("discord"); }
      if (link.href.indexOf("store.steampowered.com") !== -1) { goal("steam"); }
    });
    var survey = document.getElementById("survey");
    if (survey) { survey.addEventListener("submit", function () { goal("survey"); }); }
  }

  function banner() {
    var box = document.createElement("div");
    box.className = "consent";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-label", ru ? "Cookie" : "Cookies");
    box.innerHTML = '<div class="wrap"><p></p><div class="consent-actions">'
      + '<button class="btn" type="button" data-yes></button>'
      + '<button class="btn ghost" type="button" data-no></button></div></div>';
    var p = box.querySelector("p");
    p.textContent = text.msg + " ";
    var more = document.createElement("a");
    more.href = text.page;
    more.textContent = text.more;
    p.appendChild(more);
    box.querySelector("[data-yes]").textContent = text.yes;
    box.querySelector("[data-no]").textContent = text.no;
    box.querySelector("[data-yes]").addEventListener("click", function () { remember("yes"); box.remove(); start(); });
    box.querySelector("[data-no]").addEventListener("click", function () { remember("no"); box.remove(); });
    document.body.appendChild(box);
  }

  // the privacy page can reopen the question
  window.arenarchConsent = function () { try { localStorage.removeItem(KEY); } catch (e) {} location.reload(); };

  var answer = choice();
  if (answer === "yes") { start(); }
  else if (answer !== "no") { banner(); }
})();
