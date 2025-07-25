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

    const response = await fetch(url).then((res) => {
        if (!res.ok) {
            throw new Error(`Failed to load image: ${url}`);
        }
        return res.text();
    });

    // Build the DOM tree
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");

    // Retrieve all page links
    const pages = Array.from(doc.querySelectorAll(".ptt a")).map(
        (page) => (page as HTMLAnchorElement).href
    );

    if (pages.length > 1) pages.pop(); // Remove the last page which is usually the next page link

    for (const page of pages) {
        const pics = await getCurrentPagePicPage(page);
        picturePages.push(...pics);
    }

    picturePages.sort((a, b) => {
        const aNum = Number(a.split("-")[1]);
        const bNum = Number(b.split("-")[1]);
        return aNum - bNum;
    });

    console.log("All picture pages:", picturePages);

    return picturePages;
}

async function getCurrentPagePicPage(url: string): Promise<string[]> {
    const response = await fetch(url).then((res) => {
        if (!res.ok) {
            throw new Error(`Failed to load image: ${url}`);
        }
        return res.text();
    });

    // Build the DOM tree
    const parser = new DOMParser();
    const doc = parser.parseFromString(response, "text/html");

    // Retrieve all image links
    const picturePages = Array.from(doc.querySelectorAll("#gdt > a")).map(
        (pic) => (pic as HTMLAnchorElement).href
    );

    return picturePages;
}

export { getComicLink, getAllPicPages };
