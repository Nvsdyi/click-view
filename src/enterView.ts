import { getComicLink, getAllPicPages } from "./getPicPages";
import { createViewPanel } from "./viewPanel";
import { showSnackBar } from "./snackBar";

export async function enterView(e: Event) {
    showSnackBar("加载中...", "info");
    console.debug("enterView", e);

    // Get the comic link
    const comicLink = getComicLink(e);

    // Get all picturePages from the comic link
    const picturePages = await getAllPicPages(comicLink);

    // Create the view panel
    createViewPanel(picturePages);

    // Prevent page scroll
    document.body.style.overflow = "hidden";
}
