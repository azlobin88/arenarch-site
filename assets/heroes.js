(() => {
  const directory = document.querySelector("[data-heroes]");
  const heroes = window.ARENARCH_HEROES;
  const russian = document.documentElement.lang === "ru";
  const local = values => values[russian ? 0 : 1];
  const t = (ru, en) => russian ? ru : en;
  const img = new URL(directory.dataset.assets, document.baseURI).href;
  const catalog = document.getElementById("hero-catalog");
  const profile = document.getElementById("hero-profile");
  const language = document.querySelector(".nav .lang");
  const languagePage = language.getAttribute("href");

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  }

  function portrait(hero) {
    const picture = element("img", "hero-portrait");
    picture.src = img + hero.portrait;
    picture.alt = "";
    picture.decoding = "async";
    return picture;
  }

  function card(hero) {
    const link = element("a", "hero-card");
    link.href = "#" + hero.id;
    link.style.setProperty("--accent", hero.color);
    if (hero.backdrop) link.style.setProperty("--scene", 'url("' + img + "backdrop-" + hero.backdrop + '.jpg")');
    const picture = portrait(hero);
    picture.loading = "lazy";
    const title = element("div", "hero-card-title");
    title.append(element("span", "", local(hero.race)), element("strong", "", local(hero.name)));
    link.append(picture, title);
    return link;
  }

  for (const hero of heroes) {
    document.getElementById(hero.upcoming ? "hero-upcoming" : "hero-roster").append(card(hero));
  }

  const kinds = {
    ability: ["Способность", "Ability"], ultimate: ["Ульта", "Ultimate"],
    passive: ["Пассивная", "Passive"], trump: ["Козырь", "Trump card"],
    spender: ["Трата ресурса", "Resource spender"], interrupt: ["Прерывание", "Interrupt"]
  };

  function media(ability, name) {
    if (ability.video) {
      const video = element("video", "hero-video");
      video.controls = true;
      video.preload = "none";
      video.playsInline = true;
      video.src = ability.video;
      video.setAttribute("aria-label", name);
      return video;
    }
    const empty = element("div", "hero-video hero-video-empty");
    const mark = element("span", "hero-video-mark", "▷");
    mark.setAttribute("aria-hidden", "true");
    empty.append(mark, element("span", "", t("Видео появится позже", "Video coming later")));
    return empty;
  }

  function abilities(hero, stance) {
    const panel = element("div", "hero-abilities");
    const list = element("div", "ability-list");
    const detail = element("div", "ability-detail");
    detail.setAttribute("aria-live", "polite");
    const options = stance.abilities.map(ability => {
      const translated = !russian && ability.kind === "ultimate";
      const [name, text] = translated ? hero.ultimateEn : [ability.name, ability.text];
      const button = element("button", "ability-choice");
      button.type = "button";
      button.setAttribute("aria-pressed", "false");
      const label = element("span", "", name);
      if (!translated) label.lang = "ru";
      button.append(label, element("small", "", local(kinds[ability.kind])));
      return { ability, button, name, text, translated };
    });

    function show(option) {
      for (const item of options) item.button.setAttribute("aria-pressed", String(item === option));
      const title = element("h3", "", option.name);
      const description = element("p", "", option.text);
      if (!option.translated) title.lang = description.lang = "ru";
      detail.replaceChildren(element("span", "eyebrow", local(kinds[option.ability.kind])),
        title, description, media(option.ability, option.name));
    }

    for (const option of options) {
      list.append(option.button);
      option.button.addEventListener("click", () => {
        show(option);
        if (window.matchMedia("(max-width: 550px)").matches) detail.scrollIntoView({ block: "start" });
      });
    }
    panel.append(list, detail);
    show(options[0]);
    return panel;
  }

  function talents(hero) {
    const section = element("div", "hero-talents");
    section.append(element("h2", "", t("Таланты", "Talents")));
    if (!russian) section.append(element("p", "hero-language-note", "Talent descriptions are currently available in Russian."));
    for (const row of hero.talents) {
      const group = element("div", "talent-row");
      group.lang = "ru";
      group.append(element("h3", "", row.title));
      const options = element("ul", "talent-options");
      for (const talent of row.options) {
        const card = element("li", "talent-option");
        card.append(element("h4", "", talent.name), element("p", "", talent.effect));
        if (talent.cost) card.append(element("p", "talent-cost", talent.cost));
        options.append(card);
      }
      group.append(options);
      section.append(group);
    }
    return section;
  }

  function profileHeader(hero) {
    const banner = element("div", "hero-banner");
    if (hero.backdrop) banner.style.setProperty("--scene", 'url("' + img + "backdrop-" + hero.backdrop + '.jpg")');
    const frame = element("div", "wrap hero-banner-inner");
    const info = element("div", "hero-banner-copy");
    const back = element("a", "hero-back", t("← Все герои", "← All heroes"));
    back.href = "#";
    const heading = element("h1", "", local(hero.name));
    heading.tabIndex = -1;
    info.append(back, element("p", "eyebrow", local(hero.race)), heading, element("p", "", local(hero.bio)));
    frame.append(info, portrait(hero));
    banner.append(frame);
    return banner;
  }

  let renderedHero;
  function render() {
    const [id, stanceId] = location.hash.slice(1).split("/");
    const hero = heroes.find(entry => entry.id === id);
    catalog.hidden = Boolean(hero);
    profile.hidden = !hero;
    language.href = languagePage + (hero ? location.hash : "");
    if (!hero) {
      profile.replaceChildren();
      document.title = t("Герои", "Heroes") + " — ARENARCH";
      if (renderedHero) catalog.querySelector("h1").focus();
      renderedHero = undefined;
      return;
    }

    profile.style.setProperty("--accent", hero.color);
    profile.replaceChildren(profileHeader(hero));
    const content = element("div", "wrap hero-loadout");
    if (hero.upcoming) {
      content.append(element("h2", "", t("К релизу", "Coming at release")));
    } else {
      const stance = hero.stances.find(item => item.id === stanceId) || hero.stances[0];
      const tabs = element("nav", "stance-list");
      tabs.setAttribute("aria-label", t("Стойки оружия", "Weapon styles"));
      for (const item of hero.stances) {
        const link = element("a", "stance-link");
        link.href = "#" + hero.id + "/" + item.id;
        link.append(element("strong", "", local(item.name)), element("span", "", local(item.weapon)));
        if (item === stance) link.setAttribute("aria-current", "true");
        tabs.append(link);
      }
      content.append(element("h2", "", t("Стойки оружия", "Weapon styles")), tabs,
        element("h2", "", t("Способности", "Abilities")));
      if (!russian) content.append(element("p", "hero-language-note", "Full ability descriptions are currently available in Russian."));
      content.append(abilities(hero, stance), talents(hero));
      if (renderedHero === hero) {
        profile.append(content);
        tabs.querySelector("[aria-current]").focus({ preventScroll: true });
        return;
      }
    }
    profile.append(content);
    document.title = local(hero.name) + " — ARENARCH";
    profile.querySelector("h1").focus();
    renderedHero = hero;
  }

  window.addEventListener("hashchange", render);
  render();
})();
