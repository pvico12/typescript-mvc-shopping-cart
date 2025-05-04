import View from "./view";
import { Model, Category, ShoppingItem } from "../model";

import "./listView.css";

export class ListView implements View {
  //#region observer pattern

  update(): void {
    this.render();
  }

  //#endregion

  // the view root container
  private container: HTMLDivElement;
  get root(): HTMLDivElement {
    return this.container;
  }

  constructor(private model: Model) {
    this.container = document.createElement("div");
    this.container.id = "list-view";

    this.model.addObserver(this);

    this.render();
  }

  private render(): void {
    // Clear the container
    this.container.innerHTML = "";

    const categories = this.model.allCategories();
    const shoppingItems = this.model.allItems();

    categories.forEach(category => {
      const categorySection = document.createElement("div");
      categorySection.classList.add("category-section");
      categorySection.style.backgroundColor = category.colour;

      const header = document.createElement("div");
      header.classList.add("category-header");

      const icon = document.createElement("span");
      icon.textContent = category.icon;
      header.appendChild(icon);

      const name = document.createElement("span");
      name.textContent = category.name;
      header.appendChild(name);

      categorySection.appendChild(header);

      const itemList = document.createElement("div");
      itemList.classList.add("item-list");

      // Filter and sort items by category
      const items = shoppingItems
        .filter(item => item.categoryId === category.id)
        .sort((a, b) => a.name.localeCompare(b.name));

      items.forEach(item => {
        const itemRow = document.createElement("div");
        itemRow.classList.add("item-row");

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = item.bought;
        checkbox.addEventListener("change", () => {
          this.model.updateItem(item.id, { bought: checkbox.checked });
        });
        itemRow.appendChild(checkbox);

        const label = document.createElement("label");
        label.textContent = item.name.length > 30 ? item.name.substring(0, 27) + "..." : item.name;
        if (item.bought) {
          label.classList.add("bought");
        }
        itemRow.appendChild(label);

        if (!item.bought) {
          const quantityInput = document.createElement("input");
          quantityInput.type = "number";
          quantityInput.value = item.quantity.toString();
          quantityInput.min = "1";
          quantityInput.addEventListener("change", () => {
            this.model.updateItem(item.id, { quantity: parseInt(quantityInput.value) });
          });
          itemRow.appendChild(quantityInput);

          const resetButton = document.createElement("button");
          resetButton.textContent = "🔄";
          resetButton.disabled = item.quantity === 1;
          resetButton.addEventListener("click", () => {
            this.model.updateItem(item.id, { quantity: 1 });
          });
          itemRow.appendChild(resetButton);
        }

        const removeButton = document.createElement("button");
        removeButton.textContent = "🗑️";
        removeButton.addEventListener("click", () => {
          this.model.deleteItem(item.id);
        });
        itemRow.appendChild(removeButton);

        itemList.appendChild(itemRow);
      });

      if (items.length !== 0) {
        categorySection.appendChild(itemList);
        this.container.appendChild(categorySection);
      }
    });
  }
}