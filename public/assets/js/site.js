(function () {
  "use strict";

  function highlightCurrentSection() {
    var links = Array.prototype.slice.call(document.querySelectorAll(".toc a[href^='#']"));
    if (!links.length || !("IntersectionObserver" in window)) return;

    var byId = {};
    links.forEach(function (link) {
      byId[link.getAttribute("href").slice(1)] = link;
    });

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (link) {
            link.removeAttribute("aria-current");
          });
          var active = byId[entry.target.id];
          if (active) active.setAttribute("aria-current", "true");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );

    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) observer.observe(section);
    });
  }

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
    var video = el("video", { controls: "", preload: "none", playsinline: "" });
    var poster = clip.poster && safeUrl(clip.poster);
    if (poster) video.setAttribute("poster", poster);
    video.appendChild(el("source", { src: src, type: clip.mime || "video/mp4" }));
    var captions = clip.captions && safeUrl(clip.captions);
    if (captions) {
      video.appendChild(el("track", { kind: "captions", src: captions, srclang: "en", label: "English" }));
    }
    return video;
  }

  function renderClips(container, clips) {
    var list = container.querySelector(".clips__grid");
    var rendered = 0;

    clips.forEach(function (clip) {
      if (!clip || !clip.title) return;
      var media = embedFor(clip);
      if (!media) return;

      var item = el("li");
      var figure = el("figure");
      var frame = el("div", { class: "clips__frame" });
      frame.appendChild(media);
      figure.appendChild(frame);

      var caption = el("figcaption");
      caption.appendChild(el("span", { class: "clips__title" }, clip.title));
      if (clip.caption) caption.appendChild(document.createTextNode(clip.caption));
      figure.appendChild(caption);

      item.appendChild(figure);
      list.appendChild(item);
      rendered += 1;
    });

    if (rendered) container.hidden = false;
  }

  function loadClips() {
    var container = document.querySelector("[data-clips-src]");
    if (!container || !window.fetch) return;

    fetch(container.getAttribute("data-clips-src"), { headers: { Accept: "application/json" } })
      .then(function (response) {
        return response.ok ? response.json() : { clips: [] };
      })
      .then(function (data) {
        if (data && Array.isArray(data.clips) && data.clips.length) renderClips(container, data.clips);
      })
      .catch(function () {});
  }

  highlightCurrentSection();
  loadClips();
})();
