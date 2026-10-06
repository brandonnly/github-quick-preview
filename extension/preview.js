(() => {
  "use strict";

  const pageIsConversation = () => /^\/[^/]+\/[^/]+\/(?:pull|issues)\/\d+(?:\/|$)/.test(location.pathname);
  let viewer = null;

  function isScreenshot(image) {
    if (!(image instanceof HTMLImageElement) || !image.closest(".markdown-body")) return false;
    if (image.matches(".emoji, .gemoji, .avatar") || image.closest("[contenteditable=true]")) return false;
    for (let details = image.closest("details:not([open])"); details; details = details.parentElement?.closest("details:not([open])")) {
      if (!details.querySelector(":scope > summary")?.contains(image)) return false;
    }
    if (!image.currentSrc && !image.src) return false;
    const rect = image.getBoundingClientRect();
    if (image.naturalWidth) {
      if (image.naturalWidth < 64 || image.naturalHeight < 64) return false;
    } else if (image.complete || rect.width < 64 || rect.height < 64) return false;
    return image.getClientRects().length > 0 && getComputedStyle(image).visibility !== "hidden";
  }

  function captionFor(image) {
    if (image.alt.trim()) return image.alt.trim();
    try {
      const name = decodeURIComponent(new URL(image.currentSrc || image.src).pathname.split("/").pop());
      if (/\.(?:png|jpe?g|gif|webp|avif|svg)$/i.test(name)) return name;
    } catch {}
    return "Screenshot";
  }

  const css = `
    :host { all: initial; }
    *, *::before, *::after { box-sizing: border-box; }
    dialog {
      position: fixed; inset: 0; width: 100vw; height: 100dvh;
      max-width: none; max-height: none; margin: 0; padding: 0; border: 0;
      background: #0a0d12; color: #f0f3f6; overflow: hidden;
      font: 14px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color-scheme: dark;
    }
    dialog::backdrop { background: #0a0d12; }
    .layout { height: 100%; display: grid; grid-template-rows: 64px minmax(0, 1fr) 52px; }
    header { display: flex; align-items: center; gap: 16px; padding: 8px 20px; }
    .caption { margin: 0; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 14px; font-weight: 500; }
    .count { color: #9da7b3; white-space: nowrap; font-variant-numeric: tabular-nums; }
    .spacer { flex: 1; }
    button {
      display: inline-flex; align-items: center; justify-content: center; gap: 8px;
      flex-shrink: 0; min-width: 44px; min-height: 44px; padding: 10px;
      border: 1px solid #30363d; border-radius: 8px; background: #161b22;
      color: #e6edf3; font: inherit; cursor: pointer; touch-action: manipulation;
    }
    button:focus-visible { outline: 2px solid #80bfff; outline-offset: 3px; }
    button:disabled { opacity: .3; cursor: default; }
    svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 1.7; stroke-linecap: round; stroke-linejoin: round; }
    main { min-height: 0; position: relative; display: grid; grid-template-columns: 64px minmax(0, 1fr) 64px; align-items: center; gap: 12px; padding: 0 16px; }
    .stage { height: 100%; min-width: 0; min-height: 0; display: flex; align-items: center; justify-content: center; overflow: auto; overscroll-behavior: contain; }
    .stage > img, .stage > picture > img {
      display: block !important; width: auto !important; height: auto !important;
      max-width: 100% !important; max-height: 100% !important; margin: 0 !important;
      min-width: 0 !important; min-height: 0 !important; border: none !important;
      padding: 0 !important; object-fit: contain !important; cursor: zoom-in;
    }
    .stage > picture { display: contents; }
    .stage.zoomed { display: block; }
    .stage.zoomed img {
      max-width: none !important; max-height: none !important; cursor: zoom-out;
    }
    .stage.zoomed > img, .stage.zoomed > picture > img { margin: 0 auto !important; }
    footer { display: flex; justify-content: center; align-items: center; gap: 16px; color: #9da7b3; font-size: 12px; }
    kbd { font: inherit; color: #c9d1d9; }
    .status { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }
    @media (hover: hover) and (pointer: fine) { button:hover:not(:disabled) { background: #262d36; border-color: #586575; } }
    @media (max-width: 600px) {
      header { padding-inline: 12px; gap: 8px; }
      main { grid-template-columns: 44px minmax(0, 1fr) 44px; gap: 4px; padding-inline: 4px; }
      .zoom-label { display: none; }
      footer { gap: 12px; font-size: 11px; }
    }
  `;

  function icon(path) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    const shape = document.createElementNS(svg.namespaceURI, "path");
    shape.setAttribute("d", path);
    svg.append(shape);
    return svg;
  }

  function button(label, path, action) {
    const element = document.createElement("button");
    element.type = "button";
    element.setAttribute("aria-label", label);
    element.title = label;
    element.append(icon(path));
    element.addEventListener("click", action);
    return element;
  }

  function open(clicked, trigger) {
    const images = Array.from(document.querySelectorAll(".markdown-body img")).filter(isScreenshot);
    let index = images.indexOf(clicked);
    if (index < 0) return;

    const host = document.createElement("div");
    host.id = "github-quick-preview";
    const shadow = host.attachShadow({ mode: "open" });
    const style = document.createElement("style");
    style.textContent = css;
    const dialog = document.createElement("dialog");
    dialog.setAttribute("aria-label", "GitHub screenshot preview");
    const layout = document.createElement("div");
    layout.className = "layout";
    const header = document.createElement("header");
    const caption = document.createElement("h2");
    caption.className = "caption";
    const count = document.createElement("span");
    count.className = "count";
    const spacer = document.createElement("span");
    spacer.className = "spacer";
    const main = document.createElement("main");
    const stage = document.createElement("div");
    stage.className = "stage";
    const status = document.createElement("p");
    status.className = "status";
    status.setAttribute("role", "status");
    const footer = document.createElement("footer");
    for (const text of ["← → Browse", "Click image to zoom", "Esc Close"]) {
      const hint = document.createElement("span");
      hint.textContent = text;
      footer.append(hint);
    }

    let mounted = null;
    let zoomed = false;
    const previousFocus = document.activeElement;
    const scrollPosition = [window.scrollX, window.scrollY];
    const oldOverflow = ["overflow-x", "overflow-y"].map(property => ({
      property,
      value: document.documentElement.style.getPropertyValue(property),
      priority: document.documentElement.style.getPropertyPriority(property)
    }));

    function restoreImage() {
      if (!mounted) return;
      const { node, placeholder } = mounted;
      if (placeholder.isConnected) placeholder.replaceWith(node);
      else node.remove();
      mounted = null;
    }

    function close() {
      if (viewer !== close) return;
      viewer = null;
      document.removeEventListener("keydown", onKey, true);
      document.removeEventListener("turbo:before-render", close);
      window.removeEventListener("pagehide", close);
      restoreImage();
      dialog.close();
      host.remove();
      for (const { property, value, priority } of oldOverflow) {
        if (value) document.documentElement.style.setProperty(property, value, priority);
        else document.documentElement.style.removeProperty(property);
      }
      const focusTarget = trigger?.isConnected ? trigger : previousFocus;
      if (focusTarget instanceof HTMLElement && focusTarget.isConnected) focusTarget.focus({ preventScroll: true });
      window.scrollTo(...scrollPosition);
    }

    function setZoom(value) {
      zoomed = value;
      stage.classList.toggle("zoomed", value);
      zoom.setAttribute("aria-pressed", String(value));
      zoom.querySelector("span").textContent = value ? "Fit" : "Actual size";
      zoom.setAttribute("aria-label", value ? "Fit image to screen" : "Show image at actual size");
      stage.scrollTop = 0;
      stage.scrollLeft = 0;
    }

    function show(nextIndex) {
      if (nextIndex < 0 || nextIndex >= images.length) return;
      if (!images[nextIndex].isConnected) { close(); return; }
      restoreImage();
      index = nextIndex;
      const image = images[index];
      const node = image.parentElement?.tagName === "PICTURE" ? image.parentElement : image;
      const rect = image.getBoundingClientRect();
      const placeholder = document.createElement("span");
      placeholder.setAttribute("aria-hidden", "true");
      placeholder.style.cssText = `display:inline-block;width:${rect.width}px;height:${rect.height}px;max-width:100%;vertical-align:middle;`;
      node.replaceWith(placeholder);
      mounted = { node, placeholder };
      // Moving the existing image keeps its decoded resource and leaves its URL untouched.
      stage.append(node);
      caption.textContent = captionFor(image);
      caption.title = caption.textContent;
      count.textContent = `${index + 1} / ${images.length}`;
      status.textContent = `Image ${index + 1} of ${images.length}. ${caption.textContent}`;
      previous.disabled = index === 0;
      next.disabled = index === images.length - 1;
      setZoom(false);
    }

    function onKey(event) {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const actions = {
        ArrowLeft: () => show(index - 1),
        ArrowRight: () => show(index + 1),
        Home: () => show(0),
        End: () => show(images.length - 1),
        Escape: close
      };
      const action = actions[event.key];
      if (!action) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      action();
    }

    const previous = button("Previous image (Left arrow)", "M15 5l-7 7 7 7", () => show(index - 1));
    const next = button("Next image (Right arrow)", "M9 5l7 7-7 7", () => show(index + 1));
    const zoom = button("Show image at actual size", "M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5", () => setZoom(!zoomed));
    zoom.setAttribute("aria-pressed", "false");
    const zoomLabel = document.createElement("span");
    zoomLabel.className = "zoom-label";
    zoomLabel.textContent = "Actual size";
    zoom.append(zoomLabel);
    const dismiss = button("Close preview (Escape)", "M6 6l12 12M18 6L6 18", close);
    header.append(caption, count, spacer, zoom, dismiss);
    main.append(previous, stage, next);
    layout.append(header, main, footer, status);
    dialog.append(layout);
    shadow.append(style, dialog);
    document.documentElement.append(host);
    viewer = close;
    dialog.addEventListener("cancel", event => { event.preventDefault(); close(); });
    stage.addEventListener("click", event => {
      if (event.target instanceof HTMLImageElement) setZoom(!zoomed);
      else if (event.target === stage) close();
    });
    dialog.addEventListener("click", event => {
      if (event.target === main || event.target === footer) close();
    });
    document.documentElement.style.setProperty("overflow", "hidden", "important");
    dialog.showModal();
    show(index);
    dismiss.focus();
    document.addEventListener("keydown", onKey, true);
    document.addEventListener("turbo:before-render", close);
    window.addEventListener("pagehide", close);
  }

  document.addEventListener("click", event => {
    if (viewer || !pageIsConversation() || event.defaultPrevented) return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target instanceof Element ? event.target : null;
    const anchor = target?.closest("a");
    const image = target?.closest("img") || (anchor && !anchor.textContent.trim() ? anchor.querySelector("img") : null);
    if (!isScreenshot(image)) return;
    const trigger = image.closest("a") || image;
    event.preventDefault();
    event.stopImmediatePropagation();
    open(image, trigger);
  }, true);
})();
