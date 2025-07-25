const map = new Map<string, string>();

async function createViewPanel(picturePages: string[]) {
    const panel = document.createElement("div");
    panel.id = "view-panel";
    panel.onclick = (e) => {
        if (e.target === panel) {
            panel.remove();
            document.body.style.overflow = "auto";
        }
    };
    document.body.prepend(panel);

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            panel.remove();
            document.body.style.overflow = "auto";
        } else if (e.key === "ArrowRight") {
            // Go to the next image
            setImage(panel, picturePages, 1);
        } else if (e.key === "ArrowLeft") {
            // Go to the previous image
            setImage(panel, picturePages, -1);
        }
    });

    // Set the initial image
    const html = `
        <div class="view-panel-content">
            <img id="view-image" index="0" src="${await loadImage(
                picturePages[0]
            )}" alt="Comic Image">
        </div>`;
    panel.innerHTML = html;
}

async function setImage(
    panel: HTMLElement,
    picturePages: string[],
    direction: number
) {
    const currentIndex = Number(
        (panel.querySelector("#view-image") as HTMLImageElement)?.getAttribute(
            "index"
        )!
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

    // Preload next 3 and previous images
    for (let i = 1; i <= 3; i++) {
        if (newIndex + i < picturePages.length) {
            loadImage(picturePages[newIndex + i]);
        }
    }
}

async function loadImage(url: string): Promise<string> {
    if (map.has(url)) {
        return map.get(url)!;
    }

    const response = await fetch(url).then((res) => {
        if (!res.ok) {
            throw new Error(`Failed to load image: ${url}`);
        }
        return res.text();
    });

    // 构建DOM树
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");

    const imgElement = doc.querySelector("#img") as HTMLImageElement;
    if (!imgElement) {
        throw new Error(`No image found in the response for: ${url}`);
    }

    // 等待图片完全加载
    await new Promise((resolve, reject) => {
        const img = new Image();
        img.src = imgElement.src;
        img.onload = resolve;
        img.onerror = () =>
            reject(new Error(`Failed to load image: ${imgElement.src}`));
    });

    const imgSrc = imgElement.src;
    map.set(url, imgSrc);

    return imgSrc;
}

export { createViewPanel };
