import { enterView } from "./enterView";
import "./index.css";

// Add enter view button for all items
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
