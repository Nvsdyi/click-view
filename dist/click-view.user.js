// ==UserScript==
// @name       click-view
// @namespace  npm/vite-plugin-monkey
// @version    0.0.0
// @icon       https://vitejs.dev/logo.svg
// @match      https://exhentai.org/*
// @match      https://e-hentai.org/*
// @grant      GM_addStyle
// ==/UserScript==

(e=>{if(typeof GM_addStyle=="function"){GM_addStyle(e);return}const t=document.createElement("style");t.textContent=e,document.head.append(t)})(" .click-view-snackbar{position:fixed;width:200px;transform:translate(calc(50vw - 50%),50%);text-align:center;padding:16px;border-radius:15px;box-shadow:0 2px 10px #0000001a;z-index:1000;transition:opacity .25s;opacity:0;font-size:larger}.click-view-snackbar-info{background-color:#2196f3;color:#fff}.click-view-snackbar-error{background-color:#f44336;color:#fff}.click-view-snackbar-show{opacity:1}#view-panel{position:fixed;top:0;left:0;width:100vw;height:100vh;background-color:#000c;display:flex;justify-content:center;align-items:center;z-index:999}#view-panel img{object-fit:contain;max-height:100vh;max-width:100vw} ");

(function () {
  'use strict';

  function getComicLink(e) {
    const href = e.target.closest(".glte > tbody > tr")?.querySelector("a")?.getAttribute("href");
    return href;
  }
  async function getAllPicPages(url) {
    const picturePages = [];
    const response = await fetch(url).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load image: ${url}`);
      }
      return res.text();
    });
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");
    const pages = Array.from(doc.querySelectorAll(".ptt a")).map(
      (page) => page.href
    );
    if (pages.length > 1) pages.pop();
    for (const page of pages) {
      const pics = await getCurrentPagePicPage(page);
      picturePages.push(...pics);
    }
    picturePages.sort((a, b) => {
      const aNum = Number(a.split("-")[1]);
      const bNum = Number(b.split("-")[1]);
      return aNum - bNum;
    });
    return picturePages;
  }
  async function getCurrentPagePicPage(url) {
    const response = await fetch(url).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load image: ${url}`);
      }
      return res.text();
    });
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");
    const picturePages = Array.from(doc.querySelectorAll("#gdt > a")).map(
      (pic) => pic.href
    );
    return picturePages;
  }
  function showSnackBar(message, type, duration = 3e3) {
    const snackBarElement = document.createElement("div");
    snackBarElement.classList = "click-view-snackbar click-view-snackbar-" + type;
    snackBarElement.innerHTML = `
        <span>${message}</span>
    `;
    document.body.prepend(snackBarElement);
    snackBarElement.offsetWidth;
    snackBarElement.classList.add("click-view-snackbar-show");
    setTimeout(() => {
      snackBarElement.classList.remove("click-view-snackbar-show");
      snackBarElement.addEventListener(
        "transitionend",
        () => {
          snackBarElement.remove();
        },
        { once: true }
      );
    }, duration);
  }
  const loaded = /* @__PURE__ */ new Map();
  const loading = /* @__PURE__ */ new Set();
  async function createViewPanel(picturePages) {
    const panel = document.createElement("div");
    panel.id = "view-panel";
    panel.addEventListener("click", (e) => {
      if (e.target === panel) {
        panel.remove();
        document.body.style.overflow = "auto";
      }
    });
    document.body.prepend(panel);
    const handler = (e) => {
      if (e.key === "Escape") {
        panel.remove();
        document.body.style.overflow = "auto";
        window.removeEventListener("keydown", handler);
      } else if (e.key === "ArrowRight") {
        try {
          setImage(panel, picturePages, 1);
        } catch (error) {
          showSnackBar(`加载下一张图片失败 ${error}`, "error");
        }
      } else if (e.key === "ArrowLeft") {
        try {
          setImage(panel, picturePages, -1);
        } catch (error) {
          showSnackBar(`加载上一张图片失败 ${error}`, "error");
        }
      }
    };
    window.addEventListener("keydown", handler);
    const html = `
        <div class="view-panel-content">
            <img id="view-image" index="0" src="${await loadImage(
    picturePages[0]
  )}" alt="Comic Image">
        </div>`;
    panel.innerHTML = html;
    setImage(panel, picturePages, 0);
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
    } else {
      showSnackBar("没有更多图片了", "info");
      return;
    }
    for (let i = 1; i <= 5; i++) {
      if (newIndex + i < picturePages.length) {
        loadImage(picturePages[newIndex + i]);
      }
    }
  }
  async function loadImage(url) {
    if (loaded.has(url) && !loading.has(url)) {
      return loaded.get(url);
    }
    const response = await fetch(url).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to load image: ${url}`);
      }
      return res.text();
    });
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");
    const imgElement = doc.querySelector("#img");
    if (!imgElement) {
      throw new Error(`No image found in the response for: ${url}`);
    }
    loading.add(url);
    const img = new Image();
    img.src = imgElement.src;
    const imgSrc = imgElement.src;
    loaded.set(url, imgSrc);
    loading.delete(url);
    return imgSrc;
  }
  async function enterView(e) {
    showSnackBar("加载中...", "info");
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