function getComicLink(e: Event): string {
    const href = (e.target as HTMLElement)
        .closest(".glte > tbody > tr")
        ?.querySelector("a")
        ?.getAttribute("href");
    return href!;
}

async function getAllPicPages(url: string): Promise<string[]> {
    // Get all pictures from the comic link
    const picturePages: string[] = [];

    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    // Wait for the iframe to load
    await new Promise((resolve) => {
        iframe.onload = resolve;
    });

    // 获取所有页面链接
    const pages = Array.from(
        iframe.contentDocument?.querySelectorAll(".ptt a") || []
    ).map((page) => (page as HTMLAnchorElement).href);

    if (pages.length > 1) pages.pop(); // Remove the last page which is usually the next page link

    for (const page of pages) {
        const pics = await getCurrentPagePicPage(page);
        picturePages.push(...pics);
    }

    // Remove the iframe after use
    document.body.removeChild(iframe);

    return picturePages;
}

async function getCurrentPagePicPage(url: string): Promise<string[]> {
    const iframe = document.createElement("iframe");
    iframe.src = url;
    iframe.style.display = "none";
    document.body.appendChild(iframe);

    // Wait for the iframe to load
    await new Promise((resolve) => {
        iframe.onload = resolve;
    });

    // 获取所有图片链接
    const picturePages = Array.from(
        iframe.contentDocument?.querySelectorAll("#gdt > a") || []
    ).map((pic) => (pic as HTMLAnchorElement).href);

    // Remove the iframe after use
    document.body.removeChild(iframe);

    return picturePages;
}

export { getComicLink, getAllPicPages };
