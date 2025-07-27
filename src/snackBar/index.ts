import "./index.css";

function showSnackBar(
    message: string,
    type: string,
    duration: number = 3000
): void {
    console.debug("showSnackBar", message, type, duration);

    const snackBarElement = document.createElement("div");
    snackBarElement.classList =
        "click-view-snackbar click-view-snackbar-" + type;
    snackBarElement.innerHTML = `
        <span>${message}</span>
    `;

    document.body.prepend(snackBarElement);
    snackBarElement.offsetWidth; // Trigger reflow to restart the animation
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

export { showSnackBar };
