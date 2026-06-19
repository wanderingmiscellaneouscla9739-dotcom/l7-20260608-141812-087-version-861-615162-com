const ready = (callback) => {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
};

ready(() => {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
      mobileMenu.classList.toggle("is-open");
    });
  }

  document.querySelectorAll("[data-hero-slider]").forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll("[data-slide-to]"));
    const prev = slider.querySelector("[data-slide-prev]");
    const next = slider.querySelector("[data-slide-next]");
    let index = slides.findIndex((slide) => slide.classList.contains("is-active"));

    if (index < 0) {
      index = 0;
    }

    const show = (target) => {
      index = (target + slides.length) % slides.length;
      slides.forEach((slide, current) => {
        slide.classList.toggle("is-active", current === index);
      });
      dots.forEach((dot, current) => {
        dot.classList.toggle("is-active", current === index);
      });
    };

    prev?.addEventListener("click", () => show(index - 1));
    next?.addEventListener("click", () => show(index + 1));
    dots.forEach((dot) => {
      dot.addEventListener("click", () => show(Number(dot.dataset.slideTo || 0)));
    });

    if (slides.length > 1) {
      window.setInterval(() => show(index + 1), 5000);
    }
  });

  const applyFilter = (query) => {
    const cards = Array.from(document.querySelectorAll("[data-filter-text]"));
    if (cards.length === 0) {
      return;
    }

    const value = query.trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
      const text = card.getAttribute("data-filter-text") || "";
      const match = value === "" || text.includes(value);
      card.classList.toggle("is-filtered-out", !match);
      if (match) {
        visible += 1;
      }
    });

    let empty = document.querySelector("[data-empty-result]");
    const list = document.querySelector("[data-filter-list]") || document.querySelector(".movie-grid");

    if (visible === 0 && list) {
      if (!empty) {
        empty = document.createElement("div");
        empty.className = "empty-result";
        empty.setAttribute("data-empty-result", "");
        empty.textContent = "没有找到匹配的影片";
        list.appendChild(empty);
      }
    } else if (empty) {
      empty.remove();
    }
  };

  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";

  document.querySelectorAll("[data-search-form]").forEach((form) => {
    const input = form.querySelector("[data-search-input]");

    if (input && initialQuery) {
      input.value = initialQuery;
      applyFilter(initialQuery);
    }

    input?.addEventListener("input", () => {
      applyFilter(input.value);
    });

    form.addEventListener("submit", (event) => {
      const action = form.getAttribute("action") || "";
      const currentPath = window.location.pathname.split("/").pop() || "index.html";
      const actionPath = action.split("?")[0].split("/").pop();

      if (!actionPath || actionPath === currentPath) {
        event.preventDefault();
        applyFilter(input?.value || "");
      }
    });
  });

  document.querySelectorAll("[data-player]").forEach((player) => {
    const video = player.querySelector("video");
    const button = player.querySelector("[data-play]");
    const status = player.querySelector("[data-player-status]");
    const videoUrl = player.getAttribute("data-video") || "";
    let mounted = false;
    let mounting = null;

    if (!video || !videoUrl) {
      return;
    }

    const setStatus = (text) => {
      if (status) {
        status.textContent = text;
      }
    };

    const mountVideo = async () => {
      if (mounted) {
        return;
      }

      if (mounting) {
        return mounting;
      }

      mounting = new Promise(async (resolve) => {
        setStatus("载入中...");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = videoUrl;
          mounted = true;
          setStatus("");
          resolve();
          return;
        }

        try {
          const module = await import("./hls.js");
          const Hls = module.H;

          if (Hls && Hls.isSupported()) {
            const hls = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });

            hls.loadSource(videoUrl);
            hls.attachMedia(video);
            video.hlsPlayer = hls;

            let settled = false;
            const finish = () => {
              if (!settled) {
                settled = true;
                mounted = true;
                setStatus("");
                resolve();
              }
            };

            hls.on(Hls.Events.MANIFEST_PARSED, finish);
            hls.on(Hls.Events.ERROR, (event, data) => {
              if (data && data.fatal) {
                finish();
              }
            });
            window.setTimeout(finish, 2400);
          } else {
            video.src = videoUrl;
            mounted = true;
            setStatus("");
            resolve();
          }
        } catch (error) {
          video.src = videoUrl;
          mounted = true;
          setStatus("");
          resolve();
        }
      });

      return mounting;
    };

    const start = async () => {
      button?.classList.add("is-hidden");
      video.controls = true;
      await mountVideo();

      const playTask = video.play();
      if (playTask && typeof playTask.catch === "function") {
        playTask.catch(() => {
          setStatus("点击画面继续播放");
          window.setTimeout(() => setStatus(""), 2200);
        });
      }
    };

    button?.addEventListener("click", start);
    video.addEventListener("click", () => {
      if (video.paused) {
        start();
      }
    });
  });
});
