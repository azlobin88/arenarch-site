// The survey goes to the author's Google Form («ARENARCH — опрос»): one text field per question, the choices sent as
// the words the visitor saw. A copy stays in this browser too.
(function () {
  var FORM = "https://docs.google.com/forms/d/e/1FAIpQLSc-CiYe3GCa-Y-w-rAyxXKisbGx9ulb16J0c6TqLLpvZElSOg/formResponse";
  var FIELDS = {
    q1: "entry.1336654084",
    q2: "entry.1643245941",
    q3: "entry.1111130888",
    q4: "entry.847717234",
    q5: "entry.1569629079",
    q6: "entry.60061372",
    q7: "entry.2130039652",
    q7contact: "entry.1297740471",
    q8: "entry.227041099"
  };
  var LANGUAGE = "entry.980998252";

  var form = document.getElementById("survey");
  var status = document.getElementById("status");
  var send = document.getElementById("send");
  if (!form) { return; }
  var ru = document.documentElement.lang === "ru";

  /** What the visitor read next to the box, not its code */
  function shown(input) {
    var label = input.closest("label");
    return label ? label.textContent.trim() : input.value;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var answers = {};
    Array.prototype.forEach.call(form.elements, function (input) {
      if (!input.name || !FIELDS[input.name]) { return; }
      if ((input.type === "radio" || input.type === "checkbox") && !input.checked) { return; }
      var value = input.type === "radio" || input.type === "checkbox" ? shown(input) : input.value.trim();
      if (!value) { return; }
      answers[input.name] = answers[input.name] ? answers[input.name] + ", " + value : value;
    });
    try { localStorage.setItem("arenarch-survey", JSON.stringify(answers)); } catch (e) {}

    var body = new URLSearchParams();
    Object.keys(answers).forEach(function (name) { body.append(FIELDS[name], answers[name]); });
    body.append(LANGUAGE, ru ? "ru" : "en");

    send.disabled = true;
    // Google answers without CORS headers: the request goes, the reply can't be read (no-cors)
    fetch(FORM, { method: "POST", mode: "no-cors", body: body })
      .then(function () {
        status.textContent = ru ? "Спасибо! Ответы отправлены разработчику." : "Thank you! Your answers went to the developer.";
        status.hidden = false;
        form.reset();
      })
      .catch(function () {
        status.textContent = ru ? "Не получилось отправить: проверь интернет и попробуй ещё раз." : "Couldn't send: check your connection and try again.";
        status.hidden = false;
      })
      .then(function () { send.disabled = false; });
  });
})();
