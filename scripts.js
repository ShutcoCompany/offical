"use strict";

(() => {
  const intro = document.getElementById("intro");
  const orbLayer = document.getElementById("orbLayer");
  const orb = document.getElementById("orb");
  const orbHint = document.getElementById("orbHint");
  const sound = document.getElementById("destructionSound");
  const flash = document.getElementById("transitionFlash");
  const modernSite = document.getElementById("modernSite");
  const canvas = document.getElementById("networkCanvas");
  const menuToggle = document.getElementById("menuToggle");
  const mainNav = document.getElementById("mainNav");
  const errorNotice = document.getElementById("errorNotice");
  const statusText = document.getElementById("statusText");

  let dragging = false;
  let destroyed = false;
  let dragStartX = 0;
  let dragStartY = 0;
  let orbX = window.innerWidth / 2;
  let orbY = window.innerHeight / 2;
  let dragOffsetX = 0;
  let dragOffsetY = 0;
  let destructionTimer = null;

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  // Показываем ошибку, не ломая остальную страницу.
  function showError(message) {
    errorNotice.textContent = message;
    errorNotice.classList.add("visible");

    window.setTimeout(() => {
      errorNotice.classList.remove("visible");
    }, 5000);
  }

  // Положение шара и подписи.
  function positionOrb(x, y) {
    orbX = x;
    orbY = y;

    orb.style.left = `${x}px`;
    orb.style.top = `${y}px`;

    orbHint.style.left = `${x}px`;
    orbHint.style.top = `${y + 66}px`;
  }

  positionOrb(orbX, orbY);

  // Появление аномалии ровно через 3 секунды после загрузки.
  window.setTimeout(() => {
    if (destroyed) return;

    orb.classList.add("visible");
    orbHint.classList.add("visible");

    if (statusText) {
      statusText.textContent = "ANOMALY DETECTED";
    }
  }, 3000);

  // Небольшие глитч-полосы вокруг шара.
  function spawnGlitch() {
    if (destroyed || !orb.classList.contains("visible")) return;

    for (let i = 0; i < 3; i++) {
      const glitch = document.createElement("div");

      const width = 15 + Math.random() * 65;
      const height = 2 + Math.random() * 5;
      const offsetX = (Math.random() - 0.5) * 140;
      const offsetY = (Math.random() - 0.5) * 120;

      glitch.style.cssText = `
        position: fixed;
        z-index: 99;
        left: ${orbX + offsetX}px;
        top: ${orbY + offsetY}px;
        width: ${width}px;
        height: ${height}px;
        background: ${
          Math.random() > 0.5 ? "#63ff9a" : "#baffcc"
        };
        opacity: ${0.3 + Math.random() * 0.6};
        pointer-events: none;
        box-shadow: 0 0 10px rgba(99,255,154,.7);
      `;

      orbLayer.appendChild(glitch);

      window.setTimeout(() => glitch.remove(), 100 + Math.random() * 180);
    }

    window.setTimeout(spawnGlitch, 90 + Math.random() * 150);
  }

  spawnGlitch();

  // Захват шара.
  orb.addEventListener("pointerdown", (event) => {
    if (destroyed || !orb.classList.contains("visible")) return;

    event.preventDefault();

    dragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragOffsetX = event.clientX - orbX;
    dragOffsetY = event.clientY - orbY;

    orb.classList.add("dragging");

    try {
      orb.setPointerCapture(event.pointerId);
    } catch (_) {
      // Захват указателя необязателен для работы анимации.
    }
  });

  // Перетаскивание шара мышью или пальцем.
  orb.addEventListener("pointermove", (event) => {
    if (!dragging || destroyed) return;

    event.preventDefault();

    const x = event.clientX - dragOffsetX;
    const y = event.clientY - dragOffsetY;

    positionOrb(x, y);

    const distance = Math.hypot(
      event.clientX - dragStartX,
      event.clientY - dragStartY
    );

    if (distance > 55) {
      destroyWebsite();
    }
  });

  function stopDragging() {
    dragging = false;
    orb.classList.remove("dragging");
  }

  orb.addEventListener("pointerup", stopDragging);
  orb.addEventListener("pointercancel", stopDragging);
  orb.addEventListener("lostpointercapture", stopDragging);

  // Создание падающих фрагментов ретро-сайта.
  function createFragments() {
    const targets = [
      intro.querySelector(".browser-title"),
      intro.querySelector(".browser-menu"),
      intro.querySelector(".address-bar"),
      intro.querySelector(".retro-page"),
      intro.querySelector(".browser-status")
    ].filter(Boolean);

    const palette = [
      "#ffffff",
      "#c0c0c0",
      "#eeeeee",
      "#008080",
      "#000080",
      "#1084d0",
      "#dddddd",
      "#f1f1f1"
    ];

    const fragments = [];
    const cell = window.innerWidth < 600 ? 35 : 45;

    for (const target of targets) {
      const rect = target.getBoundingClientRect();

      if (!rect.width || !rect.height) continue;

      const cols = Math.ceil(rect.width / cell);
      const rows = Math.ceil(rect.height / cell);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const piece = document.createElement("div");

          const left = rect.left + col * cell;
          const top = rect.top + row * cell;
          const width = Math.min(cell, rect.right - left);
          const height = Math.min(cell, rect.bottom - top);

          if (width <= 0 || height <= 0) continue;

          piece.className = "fragment";
          piece.style.left = `${left}px`;
          piece.style.top = `${top}px`;
          piece.style.width = `${width}px`;
          piece.style.height = `${height}px`;

          piece.style.background =
            palette[Math.floor(Math.random() * palette.length)];

          piece.style.border = "1px solid rgba(0,0,0,.12)";
          piece.style.setProperty(
            "--dx",
            `${(Math.random() - 0.5) * window.innerWidth * 0.7}px`
          );
          piece.style.setProperty(
            "--dy",
            `${window.innerHeight * (0.6 + Math.random() * 0.8)}px`
          );
          piece.style.setProperty(
            "--rotation",
            `${(Math.random() - 0.5) * 1100}deg`
          );
          piece.style.setProperty(
            "--duration",
            `${0.9 + Math.random() * 1.3}s`
          );

          fragments.push(piece);
        }
      }
    }

    // Сначала создаём все кусочки, затем добавляем их на экран.
    const batch = document.createDocumentFragment();

    for (const piece of fragments) {
      batch.appendChild(piece);
    }

    document.body.appendChild(batch);

    window.setTimeout(() => {
      for (const piece of fragments) {
        piece.remove();
      }
    }, 2500);
  }

  function playDestructionSound() {
    if (!sound) return;

    sound.pause();
    sound.currentTime = 0;

    // Вызов происходит непосредственно в результате жеста пользователя.
    const playPromise = sound.play();

    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        showError(
          "Не удалось воспроизвести 2.mp3. Проверь наличие файла рядом с index.html."
        );
      });
    }
  }

  // Главная последовательность разрушения.
  function destroyWebsite() {
    if (destroyed) return;
    destroyed = true;

    stopDragging();

    if (statusText) {
      statusText.textContent = "SYSTEM FAILURE";
    }

    orbHint.classList.remove("visible");
    orb.classList.remove("visible");
    orbLayer.style.pointerEvents = "none";

    // Запускаем звук сразу, пока браузер ещё учитывает действие пользователя.
    playDestructionSound();

    // Глитч и короткая вспышка.
    flash.classList.remove("flash");
    void flash.offsetWidth;
    flash.classList.add("flash");

    intro.classList.add("shaking");

    if (!reducedMotion) {
      intro.animate(
        [
          { transform: "translate(0,0) skew(0)" },
          { transform: "translate(-9px,4px) skew(-1deg)" },
          { transform: "translate(7px,-5px) skew(1deg)" },
          { transform: "translate(-5px,-2px) skew(0)" },
          { transform: "translate(0,0) skew(0)" }
        ],
        { duration: 320, iterations: 3 }
      );
    }

    // Разбиваем старую страницу на кусочки.
    createFragments();

    // Убираем ретро-страницу после старта разрушения.
    destructionTimer = window.setTimeout(() => {
      intro.classList.add("destroyed");
      orb.remove();

      // Показываем современный сайт.
      modernSite.classList.add("revealed");
      modernSite.setAttribute("aria-hidden", "false");

      document.body.classList.remove("locked");

      startNetworkAnimation();
    }, reducedMotion ? 150 : 700);
  }

  // Мобильное меню.
  menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");

    menuToggle.setAttribute("aria-expanded", String(isOpen));
    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "Close navigation" : "Open navigation"
    );
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      mainNav.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });

  // Год в подвале.
  document.getElementById("currentYear").textContent =
    new Date().getFullYear();

  // Анимированная сеть точек на фоне.
  let networkAnimationStarted = false;
  let animationFrame = null;
  let points = [];
  let canvasWidth = 0;
  let canvasHeight = 0;
  let pixelRatio = 1;

  const context = canvas.getContext("2d");

  function resizeCanvas() {
    pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvasWidth = window.innerWidth;
    canvasHeight = Math.max(
      modernSite.scrollHeight,
      window.innerHeight
    );

    canvas.width = Math.floor(canvasWidth * pixelRatio);
    canvas.height = Math.floor(canvasHeight * pixelRatio);
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const amount = Math.min(
      120,
      Math.max(35, Math.floor((canvasWidth * canvasHeight) / 14000))
    );

    points = Array.from({ length: amount }, () => ({
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: 1 + Math.random() * 1.4
    }));
  }

  function drawNetwork() {
    if (!networkAnimationStarted) return;

    context.clearRect(0, 0, canvasWidth, canvasHeight);

    for (const point of points) {
      point.x += point.vx;
      point.y += point.vy;

      if (point.x < 0 || point.x > canvasWidth) point.vx *= -1;
      if (point.y < 0 || point.y > canvasHeight) point.vy *= -1;

      context.beginPath();
      context.arc(
        point.x,
        point.y,
        point.radius,
        0,
        Math.PI * 2
      );
      context.fillStyle = "rgba(99,255,154,.7)";
      context.fill();
    }

    // Соединяем только близкие точки.
    const maxDistance = canvasWidth < 600 ? 95 : 140;

    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const a = points[i];
        const b = points[j];
        const distance = Math.hypot(a.x - b.x, a.y - b.y);

        if (distance >= maxDistance) continue;

        const opacity = (1 - distance / maxDistance) * 0.23;

        context.beginPath();
        context.moveTo(a.x, a.y);
        context.lineTo(b.x, b.y);
        context.strokeStyle = `rgba(99,255,154,${opacity})`;
        context.lineWidth = 0.7;
        context.stroke();
      }
    }

    animationFrame = window.requestAnimationFrame(drawNetwork);
  }

  function startNetworkAnimation() {
    if (networkAnimationStarted) return;

    networkAnimationStarted = true;
    resizeCanvas();

    if (!reducedMotion) {
      drawNetwork();
    } else {
      drawNetworkStatic();
    }
  }

  function drawNetworkStatic() {
    context.clearRect(0, 0, canvasWidth, canvasHeight);

    for (const point of points) {
      context.beginPath();
      context.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
      context.fillStyle = "rgba(99,255,154,.55)";
      context.fill();
    }
  }

  window.addEventListener("resize", () => {
    if (!networkAnimationStarted) return;

    resizeCanvas();

    if (reducedMotion) {
      drawNetworkStatic();
    }
  });

  // Если вкладка скрыта, не расходуем ресурсы на анимацию.
  document.addEventListener("visibilitychange", () => {
    if (!networkAnimationStarted || reducedMotion) return;

    if (document.hidden) {
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    } else if (animationFrame === null) {
      drawNetwork();
    }
  });

  // Если браузер не поддерживает Canvas, остальной сайт работает.
  if (!context) {
    canvas.style.display = "none";
  }
})();