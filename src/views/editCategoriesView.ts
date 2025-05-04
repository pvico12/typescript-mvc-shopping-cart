import View from "./view";
import { Model, Mode } from "../model";

import "./editCategoriesView.css";

type ItemCategoryChange = {
    itemName: string;
    categoryId: number;
};

export class EditCategoriesView implements View {
  update() {
    this.toggleOverlay(this.model.currentMode === Mode.EditCategories);
    this.render();
  }

  private container: HTMLDivElement;
  private changeList: ItemCategoryChange[] = [];

  get root(): HTMLDivElement {
    return this.container;
  }

  constructor(private model: Model) {
    this.container = document.createElement("div");
    this.container.id = "edit-categories-overlay";

    this.model.addObserver(this);

    this.render();
  }

  render(): void {
    // Clear the container
    this.container.innerHTML = "";

    const panel = document.createElement("div");
    panel.id = "edit-categories-overlay-panel";
    this.container.appendChild(panel);

    const label = document.createElement("div");
    label.id = "title";
    label.textContent = "✍🏻 Edit Categories";
    panel.appendChild(label);

    const categoriesContainer = document.createElement("div");
    categoriesContainer.id = "categories-container";
    panel.appendChild(categoriesContainer);

    const allMappings = this.model.allMappings();

    Object.keys(allMappings).sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase())).forEach(key => {
        const itemContainer = document.createElement("div");
        itemContainer.className = "item-container";

        const targetCategory = allMappings[key];

        const label = document.createElement("label");
        label.className = "item-label";
        label.textContent = key;
        document.body.appendChild(label); // Temporarily add to measure
        if (label.offsetWidth > 70) {
            label.textContent = key.substring(0, 7) + "...";
        }
        document.body.removeChild(label); // Remove after measuring
        itemContainer.appendChild(label);

        const select = document.createElement("select");
        select.className = "category-select";
        this.model.allCategories().forEach(category => {
            const option = document.createElement("option");
            option.value = category.id.toString();
            option.textContent = `${category.icon} ${category.name}`;
            if (targetCategory === category.id) {
                option.selected = true;
            }
            select.appendChild(option);
        });

        select.addEventListener("change", (event) => {
            const selectedCategoryId = parseInt((event.target as HTMLSelectElement).value, 10);
            // if setting back to normal category, remove from changeList
            if (selectedCategoryId === targetCategory) {
                this.changeList = this.changeList.filter((change) => change.itemName !== key);
            } else {
                // remove all changes that are in the list for this item id, then add the new change
                this.changeList = this.changeList.filter((change) => change.itemName !== key);
                this.changeList.push({ itemName: key, categoryId: selectedCategoryId });
            }
            
        });

        itemContainer.appendChild(select);
        categoriesContainer.appendChild(itemContainer);
    });

    // Apply and Cancel buttons
    const buttonsContainer = document.createElement("div");
    buttonsContainer.id = "edit-categories-buttons";
    panel.appendChild(buttonsContainer);

    const applyButton = document.createElement("button");
    applyButton.textContent = "✅ Apply";
    applyButton.addEventListener("click", () => {
        for (const change of this.changeList) {
            this.model.updateItemCategory(change.itemName, change.categoryId);
        }
        console.log(this.model.allItems());
        this.model.exitEditCategoriesMode();
    });
    buttonsContainer.appendChild(applyButton);

    const cancelButton = document.createElement("button");
    cancelButton.textContent = "🚫 Cancel";
    cancelButton.addEventListener("click", () => {
        this.model.exitEditCategoriesMode();
    });
    buttonsContainer.appendChild(cancelButton);

    // Close Overlay Handling
    this.container.addEventListener("click", (event) => {
        if (event.target === this.container) {
            this.model.exitEditCategoriesMode();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && this.model.currentMode === Mode.EditCategories) {
            this.model.exitEditCategoriesMode();
        }
    });
  }

  private toggleOverlay(show: boolean) {
    this.container.style.display = show ? "block" : "none";
  }
}