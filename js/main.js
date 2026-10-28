/* Lee data.json y construye la página. Todo el texto se inserta con
   textContent, así que el JSON no puede inyectar HTML. */

const $ = (sel, root = document) => root.querySelector(sel);

function el(tag, { cls, text, attrs } = {}, ...children) {
  const node = document.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = text;
  for (const [k, v] of Object.entries(attrs || {})) node.setAttribute(k, v);
  node.append(...children.flat().filter(Boolean));
  return node;
}

// Solo permite enlaces http(s)
function safeUrl(url) {
  try {
    const u = new URL(url, location.href);
    return ["http:", "https:"].includes(u.protocol) ? u.href : null;
  } catch { return null; }
}

function linkButton(label, url, variant = "", icon = "") {
  const href = safeUrl(url);
  if (!href) return null;
  const a = el("a", {
    cls: `nes-btn ${variant}`.trim(),
    attrs: { href, target: "_blank", rel: "noopener" },
  });
  if (icon) a.append(el("i", { cls: `nes-icon ${icon} is-small` }), " ");
  a.append(label);
  return a;
}

function show(id) { $(`#${id}`).hidden = false; }
const has = (arr) => Array.isArray(arr) && arr.length > 0;

function renderHero(d) {
  const hero = $("#hero .hero");
  const githubUser = d.github && d.github !== "TU_USUARIO" ? d.github : null;
  const avatar = d.avatar || (githubUser ? `https://github.com/${githubUser}.png` : "");

  if (avatar && safeUrl(avatar)) {
    hero.append(el("img", {
      cls: "nes-avatar is-large is-rounded",
      attrs: { src: avatar, alt: `Foto de ${d.name || "perfil"}` },
    }));
  }
  hero.append(el("div", {},
    el("h1", { text: d.name || "" }),
    el("p", { text: d.headline || "" }, el("span", { cls: "cursor", attrs: { "aria-hidden": "true" } })),
    d.location ? el("p", { text: d.location }) : null,
  ));

  const links = $("#hero .links");
  links.append(
    d.linkedin ? linkButton("LinkedIn", d.linkedin, "is-primary", "linkedin") : null,
    d.github ? linkButton("GitHub", `https://github.com/${d.github}`, "is-dark", "github") : null,
  );
  show("hero");
}

function renderAbout(d) {
  if (!d.about) return;
  $("#about .content").textContent = d.about;
  show("about");
}

function renderSkills(d) {
  if (!has(d.skills) && !has(d.tools)) return;

  (d.skills || []).forEach((s, i) => {
    const id = `skill-${i}`;
    const level = Math.max(0, Math.min(100, Number(s.level) || 0));
    $("#skills .bars").append(el("div", { cls: "skill" },
      el("label", { text: s.name, attrs: { for: id } }),
      el("progress", {
        cls: `nes-progress is-${s.color || "primary"}`,
        attrs: { id, value: level, max: 100 },
      }),
    ));
  });

  if (has(d.tools)) {
    d.tools.forEach((t) => {
      $("#skills .badges").append(
        el("span", { cls: "nes-badge" }, el("span", { cls: `is-${t.color || "dark"}`, text: t.name })),
      );
    });
    $("#skills .tools").hidden = false;
  }
  show("skills");
}

function renderExperience(d) {
  if (!has(d.experience)) return;
  d.experience.forEach((x) => {
    $("#experience .entries").append(el("div", { cls: "nes-container is-dark entry" },
      el("h2", { text: x.role }),
      el("p", { cls: "meta", text: [x.company, x.period].filter(Boolean).join(" · ") }),
      has(x.highlights) ? el("ul", {}, x.highlights.map((h) => el("li", { text: h }))) : null,
    ));
  });
  show("experience");
}

function renderProjects(d) {
  if (!has(d.projects)) return;
  d.projects.forEach((p) => {
    $("#projects .grid").append(el("div", { cls: "nes-container is-rounded is-dark" },
      el("h2", { text: p.name }),
      el("p", { text: p.description || "" }),
      p.url ? linkButton(p.linkLabel || "Ver proyecto", p.url, "is-small") : null,
    ));
  });
  show("projects");
}

function renderEducation(d) {
  if (!has(d.education)) return;
  d.education.forEach((e) => {
    $("#education .entries").append(el("div", { cls: "entry" },
      el("h2", { text: e.title }),
      el("p", { cls: "meta", text: [e.institution, e.period].filter(Boolean).join(" · ") }),
    ));
  });
  show("education");
}

function renderContact(d) {
  const c = d.contact;
  if (!c) return;
  $("#contact .content").textContent = c.message || "";
  $("#contact .links").append(linkButton(c.buttonLabel || "Contactar", c.url, "is-success"));
  show("contact");
}

async function init() {
  try {
    const res = await fetch("data.json", { cache: "no-cache" });
    if (!res.ok) throw new Error(`No se pudo cargar data.json (${res.status}).`);
    const data = await res.json();

    if (data.name) document.title = `${data.name} · ${data.headline || "Desarrollador"}`;
    renderHero(data);
    renderAbout(data);
    renderSkills(data);
    renderExperience(data);
    renderProjects(data);
    renderEducation(data);
    renderContact(data);
  } catch (err) {
    $("#error-text").textContent =
      location.protocol === "file:"
        ? "El navegador no deja leer data.json al abrir el archivo directamente. Usa un servidor local, por ejemplo: python3 -m http.server"
        : err.message;
    show("error");
  }
}

init();
