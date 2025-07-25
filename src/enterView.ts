import { getComicLink, getAllPicPages } from "./getPicPages";
import { createViewPanel } from "./viewPanel";

export async function enterView(e: Event) {
    // Get the comic link
    const comicLink = getComicLink(e);

    // Get all picturePages from the comic link
    const picturePages = await getAllPicPages(comicLink);

    // Create the view panel
    createViewPanel(picturePages);

    // Prevent page scroll
    document.body.style.overflow = "hidden";
}
