const loaded = new Map<string, string>();
const loading = new Set<string>();

async function createViewPanel(picturePages: string[]) {
    const panel = document.createElement("div");
    panel.id = "view-panel";
    panel.addEventListener("click", (e) => {
        if (e.target === panel) {
            panel.remove();
            document.body.style.overflow = "auto";
        }
    });
    document.body.prepend(panel);

    const handler = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
            panel.remove();
            document.body.style.overflow = "auto";
            window.removeEventListener("keydown", handler);
        } else if (e.key === "ArrowRight") {
            // Go to the next image
            setImage(panel, picturePages, 1);
        } else if (e.key === "ArrowLeft") {
            // Go to the previous image
            setImage(panel, picturePages, -1);
        }
    };

    window.addEventListener("keydown", handler);

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

    console.log("New Index:", newIndex);

    if (newIndex >= 0 && newIndex < picturePages.length) {
        const html = `
        <div class="view-panel-content">
            <img id="view-image" index="${newIndex}" src="${await loadImage(
            picturePages[newIndex]
        )}" alt="Comic Image">
        </div>`;
        panel.innerHTML = html;
    } else {
        return;
    }

    // Preload next 3 and previous images
    for (let i = 1; i <= 3; i++) {
        if (newIndex + i < picturePages.length) {
            loadImage(picturePages[newIndex + i]);
        }
    }
}

async function loadImage(url: string): Promise<string> {
    if (loaded.has(url) && !loading.has(url)) {
        return loaded.get(url)!;
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

    loading.add(url);

    // 等待图片完全加载
    const img = new Image();
    img.src = imgElement.src;

    const imgSrc = imgElement.src;
    loaded.set(url, imgSrc);
    loading.delete(url);

    return imgSrc;
}

export { createViewPanel };
