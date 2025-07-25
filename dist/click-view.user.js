// ==UserScript==
// @name       click-view
// @namespace  npm/vite-plugin-monkey
// @version    0.0.0
// @icon       https://vitejs.dev/logo.svg
// @match      https://exhentai.org/*
// @match      https://e-hentai.org/*
// @grant      GM_addStyle
// ==/UserScript==

(e=>{if(typeof GM_addStyle=="function"){GM_addStyle(e);return}const t=document.createElement("style");t.textContent=e,document.head.append(t)})(" #view-panel{position:fixed;top:0;left:0;width:100vw;height:100vh;background-color:#000c;display:flex;justify-content:center;align-items:center;z-index:999}#view-panel img{object-fit:contain;height:100vh} ");

(function () {
  'use strict';

  function getComicLink(e) {
    const href = e.target.closest(".glte > tbody > tr")?.querySelector("a")?.getAttribute("href");
    return href;
  }
  async function getAllPicPages(url) {
    const picturePages = [];
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    await new Promise((resolve) => {
      iframe.onload = resolve;
    });
    const pages = Array.from(
      iframe.contentDocument?.querySelectorAll(".ptt a") || []
    ).map((page) => page.href);
    if (pages.length > 1) pages.pop();
    for (const page of pages) {
      const pics = await getCurrentPagePicPage(page);
      picturePages.push(...pics);
    }
    document.body.removeChild(iframe);
    return picturePages;
  }
  async function getCurrentPagePicPage(url) {
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    await new Promise((resolve) => {
      iframe.onload = resolve;
    });
    const picturePages = Array.from(
      iframe.contentDocument?.querySelectorAll("#gdt > a") || []
    ).map((pic) => pic.href);
    document.body.removeChild(iframe);
    return picturePages;
  }
  const map = /* @__PURE__ */ new Map();
  async function createViewPanel(picturePages) {
    const panel = document.createElement("div");
    panel.id = "view-panel";
    panel.onclick = () => {
      panel.remove();
      document.body.style.overflow = "auto";
    };
    document.body.prepend(panel);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        panel.remove();
        document.body.style.overflow = "auto";
      } else if (e.key === "ArrowRight") {
        setImage(panel, picturePages, 1);
      } else if (e.key === "ArrowLeft") {
        setImage(panel, picturePages, -1);
      }
    });
    const html = `
        <div class="view-panel-content">
            <img id="view-image" index="0" src="${await loadImage(
    picturePages[0]
  )}" alt="Comic Image">
        </div>`;
    panel.innerHTML = html;
  }
  async function setImage(panel, picturePages, direction) {
    const currentIndex = Number(
      panel.querySelector("#view-image")?.getAttribute(
        "index"
      )
    );
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < picturePages.length) {
      const html = `
        <div class="view-panel-content">
            <img id="view-image" index="${newIndex}" src="${await loadImage(
      picturePages[newIndex]
    )}" alt="Comic Image">
        </div>`;
      panel.innerHTML = html;
    }
    for (let i = 1; i <= 3; i++) {
      if (newIndex + i < picturePages.length) {
        loadImage(picturePages[newIndex + i]);
      }
    }
  }
  async function loadImage(url) {
    if (map.has(url)) {
      return map.get(url);
    }
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.style.display = "none";
    document.body.appendChild(iframe);
    await new Promise((resolve) => {
      iframe.onload = resolve;
    });
    const imgElement = iframe.contentDocument?.querySelector(
      "#img"
    );
    await new Promise((resolve, reject) => {
      if (imgElement.complete) {
        resolve(void 0);
      } else {
        imgElement.onload = () => resolve(void 0);
        imgElement.onerror = reject;
      }
    });
    const imgSrc = imgElement.src;
    map.set(url, imgSrc);
    document.body.removeChild(iframe);
    return imgSrc;
  }
  async function enterView(e) {
    const comicLink = getComicLink(e);
    const picturePages = await getAllPicPages(comicLink);
    createViewPanel(picturePages);
    document.body.style.overflow = "hidden";
  }
  const items = document.querySelectorAll(".glte > tbody > tr");
  items.forEach((item) => {
    const enterViewButton = document.createElement("button");
    enterViewButton.textContent = "Enter View";
    enterViewButton.style.position = "relative";
    enterViewButton.style.margin = "10px 5px";
    enterViewButton.addEventListener("click", (e) => {
      enterView(e);
    });
    item.appendChild(enterViewButton);
  });

})();