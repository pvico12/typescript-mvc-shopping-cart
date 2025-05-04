import View from "./view";
import { Model } from "../model";
import { EditCategoriesView } from "./editCategoriesView";

import "./settingsView.css";

export class SettingsView implements View {

  update() {
    this.undoButton.disabled = !this.model.canUndo;
    this.redoButton.disabled = !this.model.canRedo;
  }

  private container: HTMLDivElement;
  private editButton: HTMLButtonElement;
  private undoButton: HTMLButtonElement;
  private redoButton: HTMLButtonElement;
  private editCategoriesView: EditCategoriesView;

  get root(): HTMLDivElement {
    return this.container;
  }

  constructor(private model: Model) {
    this.container = document.createElement("div");
    this.container.id = "settings";

    this.editButton = document.createElement("button");
    this.editButton.textContent = "✍🏻 Edit Categories";
    this.editButton.addEventListener("click", () => {
      this.model.enterEditCategoriesMode();
    });
    this.container.appendChild(this.editButton);

    const buttonContainer = document.createElement("div");
    buttonContainer.classList.add("button-container");

    this.undoButton = document.createElement("button");
    this.undoButton.textContent = "↩️ Undo";
    this.undoButton.addEventListener("click", () => {
      model.undo();
    });
    buttonContainer.appendChild(this.undoButton);

    this.redoButton = document.createElement("button");
    this.redoButton.textContent = "↪️ Redo";
    this.redoButton.addEventListener("click", () => {
      model.redo();
    });
    buttonContainer.appendChild(this.redoButton);

    this.container.appendChild(buttonContainer);

    this.editCategoriesView = new EditCategoriesView(this.model);
    document.body.appendChild(this.editCategoriesView.root);

    this.model.addObserver(this);
  }
}
