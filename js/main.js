(() => {
  // Lógica del selector de modo Claro / Oscuro
  const initThemeToggle = () => {
    const toggleBtn = document.querySelector("#theme-toggle");
    const htmlElement = document.documentElement;

    // Recuperar preferencia guardada o usar 'dark' por defecto
    const savedTheme = localStorage.getItem("portfolio_theme") || "dark";
    htmlElement.setAttribute("data-theme", savedTheme);
    updateThemeButton(savedTheme);

    toggleBtn.addEventListener("click", () => {
      const currentTheme = htmlElement.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";

      htmlElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("portfolio_theme", newTheme);
      updateThemeButton(newTheme);
    });
  };

  const updateThemeButton = (theme) => {
    const toggleBtn = document.querySelector("#theme-toggle");
    if (theme === "light") {
      toggleBtn.innerHTML = "🌙 DARK";
    } else {
      toggleBtn.innerHTML = "☀️ LIGHT";
    }
  };

  const render = (profile) => {
    document.title = `${profile.name} | ${profile.headline}`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.content = `${profile.name}, ${profile.headline}.`;
    }

    document.querySelector("#name").textContent = profile.name;
    document.querySelector("#headline").textContent = profile.headline;
    document.querySelector("#location").textContent = `📍 ${profile.location}`;
    document.querySelector("#about").textContent = profile.about;
    document.querySelector("#experience").textContent = profile.experience;
    document.querySelector("#cta-copy").textContent = profile.callToAction;
    
    document.querySelector("#linkedin-link").href = profile.linkedin;
    document.querySelector("#github-link").href = profile.github;

    const avatarContainer = document.querySelector("#avatar-container");
    const profileImgSrc = "img/avatar.jpg"; 

    const img = new Image();
    img.src = profileImgSrc;
    img.alt = profile.name;
    
    img.onload = () => {
      avatarContainer.innerHTML = "";
      avatarContainer.appendChild(img);
    };
    
    img.onerror = () => {
      console.log("No se encontró imagen de perfil, usando respaldo de iniciales.");
    };

    const skillsContainer = document.querySelector("#skills");
    skillsContainer.innerHTML = "";

    profile.skills.forEach((skillName) => {
      const badge = document.createElement("span");
      badge.className = "skill-badge";
      badge.textContent = skillName;
      skillsContainer.append(badge);
    });
  };

  initThemeToggle();

  fetch("data.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: No se pudo cargar data.json`);
      }
      return response.json();
    })
    .then(render)
    .catch((error) => {
      console.error(error);
      document.querySelector("#name").textContent = "ERROR DE CARGA";
      document.querySelector("#about").textContent =
        "No se pudo leer data.json. Verifica que estés ejecutando el sitio desde un servidor local.";
    });
})();