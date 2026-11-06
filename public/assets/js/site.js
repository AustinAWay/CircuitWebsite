(function () {
  "use strict";

  function el(tag, attrs, text) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (key) {
      node.setAttribute(key, attrs[key]);
    });
    if (text) node.textContent = text;
    return node;
  }

  function safeUrl(value) {
    try {
      var url = new URL(value, window.location.href);
      return url.protocol === "https:" || url.origin === window.location.origin ? url.href : null;
    } catch (e) {
      return null;
    }
  }

  function embedFor(clip) {
    if (clip.type === "youtube" && /^[\w-]{6,20}$/.test(clip.id || "")) {
      return el("iframe", {
        src: "https://www.youtube-nocookie.com/embed/" + clip.id,
        title: clip.title,
        loading: "lazy",
        allow: "encrypted-media; picture-in-picture; fullscreen",
        referrerpolicy: "strict-origin-when-cross-origin"
      });
    }
    if (clip.type === "vimeo" && /^\d{4,15}$/.test(String(clip.id || ""))) {
      return el("iframe", {
        src: "https://player.vimeo.com/video/" + clip.id + "?dnt=1",
        title: clip.title,
        loading: "lazy",
        allow: "picture-in-picture; fullscreen"
      });
    }
    var src = safeUrl(clip.src || "");
    if (!src) return null;
    var video = el("video", { controls: "", preload: "metadata", playsinline: "", "aria-label": clip.title });
    var poster = clip.poster && safeUrl(clip.poster);
    if (poster) video.setAttribute("poster", poster);
    video.appendChild(el("source", { src: src, type: clip.mime || "video/mp4" }));
    return video;
  }

  function renderDeck(section, clips) {
    var list = section.querySelector(".deck__grid");
    clips.forEach(function (clip) {
      if (!clip || !clip.title) return;
      var media = embedFor(clip);
      if (!media) return;

      var item = el("li", clip.feature ? { class: "deck__item--feature" } : {});
      var figure = el("figure");
      var frame = el("div", { class: "deck__frame" });
      frame.appendChild(media);
      figure.appendChild(frame);
      figure.appendChild(el("figcaption", { class: "deck__title" }, clip.title));
      item.appendChild(figure);
      list.appendChild(item);
    });
  }

  function loadDecks() {
    var sections = document.querySelectorAll("[data-clips-src]");
    Array.prototype.forEach.call(sections, function (section) {
      fetch(section.getAttribute("data-clips-src"), { headers: { Accept: "application/json" } })
        .then(function (response) {
          return response.ok ? response.json() : { clips: [] };
        })
        .then(function (data) {
          if (data && Array.isArray(data.clips)) renderDeck(section, data.clips);
        })
        .catch(function () {});
    });
  }

  function pauseOthersOnPlay() {
    document.addEventListener(
      "play",
      function (event) {
        Array.prototype.forEach.call(document.querySelectorAll("video"), function (video) {
          if (video !== event.target && !video.paused) video.pause();
        });
      },
      true
    );
  }

  function highlightCurrentSection() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".bar__nav a[href^='#']"));
    if (!links.length || !("IntersectionObserver" in window)) return;

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            if (link.getAttribute("href") === "#" + entry.target.id) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        });
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    links.forEach(function (link) {
      var section = document.getElementById(link.getAttribute("href").slice(1));
      if (section) observer.observe(section);
    });
  }

  loadDecks();
  pauseOthersOnPlay();
  highlightCurrentSection();
})();
