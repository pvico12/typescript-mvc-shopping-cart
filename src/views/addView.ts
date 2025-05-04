import { Model } from "../model";

import "./addView.css";

export class AddView {

  private container: HTMLDivElement;
  get root(): HTMLDivElement {
    return this.container;
  }

  constructor(private model: Model) {
    this.container = document.createElement("div");
    this.container.id = "add-section-container";

    const textField = document.createElement("input");
    textField.type = "text";
    textField.placeholder = "Item Name";
    textField.addEventListener("input", () => {
        // dont allow leading whitespace or non-alphabetic characters
        textField.value = textField.value.replace(/^\s+/, "").replace(/[^a-zA-Z\s]/g, "");
        addButton.disabled = !textField.value.trim().length;
    });

    const quantityInput = document.createElement("input");
    quantityInput.type = "number";
    quantityInput.value = "1";
    quantityInput.min = "1";
    quantityInput.max = "24";
    quantityInput.step = "1";

    const resetButton = document.createElement("button");
    resetButton.textContent = "🔄";
    resetButton.disabled = true;
    resetButton.addEventListener("click", () => {
        quantityInput.value = "1";
        resetButton.disabled = true;
    });

    quantityInput.addEventListener("input", () => {
        resetButton.disabled = quantityInput.value === "1";
    });

    const addButton = document.createElement("button");
    addButton.textContent = "➕";
    addButton.disabled = true;
    addButton.addEventListener("click", () => {
        if (textField.value.trim().length) {
            this.model.createItem(textField.value.trim(), parseInt(quantityInput.value));
            textField.value = "";
            quantityInput.value = "1";
            resetButton.disabled = true;
            addButton.disabled = true;
        }
    });

    textField.addEventListener("keydown", (event) => {
        // trigger add button click on enter keydown
        if (event.key === "Enter" && !addButton.disabled) {
            addButton.click();
        }
    });

    this.container.appendChild(textField);
    this.container.appendChild(quantityInput);
    this.container.appendChild(resetButton);
    this.container.appendChild(addButton);
  }
}
