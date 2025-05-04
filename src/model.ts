import { Subject } from "./observer";
import { Command, UndoManager } from "./undo";

export enum Mode {
  Normal,
  EditCategories
}

export type ShoppingItem = {
  id: number;
  name: string;
  quantity: number;
  categoryId?: number;
  bought: boolean;
};

export type Category = {
  id: number;
  icon: string;
  name: string;
  colour: string;
};

const OTHER_CATEGORY_ID = 0;

const sampleItems: ShoppingItem[] = [
  { id: 1, name: "Milk", quantity: 4, bought: false },
  { id: 2, name: "Yogurt", quantity: 1, bought: false },
  { id: 3, name: "Pizza", quantity: 1, bought: false },
  { id: 4, name: "Eggs", quantity: 12, bought: false },
  { id: 5, name: "Olive Oil", quantity: 1, bought: false },
  { id: 6, name: "Cheese", quantity: 1, bought: false },
  { id: 7, name: "Burritos", quantity: 4, bought: false },
  { id: 8, name: "Waffles", quantity: 2, bought: false },
  { id: 9, name: "Bananas", quantity: 6, bought: false },
  { id: 10, name: "Apples", quantity: 3, bought: false },
  { id: 11, name: "Oranges", quantity: 3, bought: false },
];

const categories: Category[] = [
  { id: 1, icon: '🥛', name: "Dairy", colour: `hsl(220, 75%, 75%)` },
  { id: 2, icon: '🧊', name: "Frozen", colour: `hsl(220, 90%, 95%)` },
  { id: 3, icon: '🍌', name: "Fruit", colour: `hsl(140, 75%, 75%)` },
  { id: OTHER_CATEGORY_ID, icon: '🛒', name: "Other", colour: `hsl(0, 0%, 90%)` },
];

let itemCategoryIdMap: { [key: string]: number } = {
  "Milk": 1,
  "Yogurt": 1,
  "Pizza": 2,
  "Eggs": OTHER_CATEGORY_ID,
  "Olive Oil": OTHER_CATEGORY_ID,
  "Cheese": 1,
  "Burritos": 2,
  "Waffles": 2,
  "Bananas": 3,
  "Apples": 3,
  "Oranges": 3,
};


let uniqueId = sampleItems.length + 1;

export class Model extends Subject {
  // Undo/Redo

  private undoManager = new UndoManager();

  undo() {
    this.undoManager.undo();
    this.notifyObservers();
  }

  redo() {
    this.undoManager.redo();
    this.notifyObservers();
  }

  get canUndo() {
    return this.undoManager.canUndo;
  }

  get canRedo() {
    return this.undoManager.canRedo;
  }

  // Mode Handling

  private mode: Mode = Mode.Normal;

  get currentMode(): Mode {
    return this.mode;
  }

  enterEditCategoriesMode() {
    this.mode = Mode.EditCategories;
    this.notifyObservers();
  }

  exitEditCategoriesMode() {
    this.mode = Mode.Normal;
    this.notifyObservers();
  }

  // State
  private items: ShoppingItem[] = sampleItems.sort(() => 0.5 - Math.random()).slice(0, 3); // 3 random items 
  private categories: Category[] = categories;
  private itemCategoryIdMap = itemCategoryIdMap;

  // Business Logic
  getItem(id: number): ShoppingItem | undefined {
    const item = this.items.find((i) => i.id === id);
    // return copy of the item so users can't mutate Model data
    return item ? { ...item } : undefined;
  }

  allItems(): ShoppingItem[] {
    // return copy of each item in a new array so users can't mutate Model data
    return this.items.map((i) => ({
      ...i,
      categoryId: this.itemCategoryIdMap[i.name] || OTHER_CATEGORY_ID,
    }));
  }

  allCategories(): Category[] {
    // return copy of each category in a new array so users can't mutate Model data
    return this.categories.map((c) => ({ ...c }));
  }

  allMappings(): { [key: string]: number } {
    return itemCategoryIdMap;
  }

  createItem(name: string, quantity: number) {
    const existingItem = this.items.find((i) => i.name === name);
    if (existingItem) {
      const originalQuantity = existingItem.quantity;
      this.undoManager.execute({
      do: () => {
        this.items = this.items.map((i) =>
        i.name === name ? { ...i, quantity: i.quantity + quantity } : i
        );
      },
      undo: () => {
        this.items = this.items.map((i) =>
        i.name === name ? { ...i, quantity: originalQuantity } : i
        );
      },
      } as Command);

      this.items = this.items.map((i) =>
      i.name === name ? { ...i, quantity: i.quantity + quantity } : i
      );
    } else {
      let newItem: ShoppingItem = { id: uniqueId++, name, quantity, bought: false };
      const categoryId = this.itemCategoryIdMap[name] || OTHER_CATEGORY_ID;

      this.undoManager.execute({
      do: () => {
        this.items = [...this.items, newItem];
        this.itemCategoryIdMap[name] = categoryId;
      },
      undo: () => {
        this.items = this.items.slice(0, -1);
        delete this.itemCategoryIdMap[name];
      },
      } as Command);

      this.items = [...this.items, newItem];
      this.itemCategoryIdMap[name] = categoryId;
    }
    this.notifyObservers();
  }

  updateItem(id: number, item: { name?: string; quantity?: number; bought?: boolean }) {
    const originalItem = this.items.find((i) => i.id === id);
    if (!originalItem) return;

    this.undoManager.execute({
      do: () => {
        this.items = this.items.map((i) => (i.id === id ? { ...i, ...item } : i));
      },
      undo: () => {
        this.items = this.items.map((i) => (i.id === id ? originalItem : i));
      },
    } as Command);

    this.items = this.items.map((i) => (i.id === id ? { ...i, ...item } : i));
    this.notifyObservers();
  }

  updateItemCategory(itemName: string, categoryId: number) {
    let mappings = this.allMappings();
    if (itemName in mappings) {
      let originalCategoryId = mappings[itemName];
      this.undoManager.execute({
        do: () => {
          this.itemCategoryIdMap[itemName] = categoryId;
        },
        undo: () => {
          this.itemCategoryIdMap[itemName] = originalCategoryId;
        },
      } as Command);
      this.itemCategoryIdMap[itemName] = categoryId;
      this.notifyObservers();
    }
  }

  deleteItem(id: number) {
    const deletedItem = this.items.find((i) => i.id === id);
    if (!deletedItem) return;
    const deletedItemIndex = this.items.findIndex((i) => i.id === id);

    this.undoManager.execute({
      do: () => {
        this.items = this.items.filter((i) => i.id !== id);
      },
      undo: () => {
        this.items = [
          ...this.items.slice(0, deletedItemIndex),
          deletedItem,
          ...this.items.slice(deletedItemIndex),
        ];
      },
    } as Command);

    this.items = this.items.filter((i) => i.id !== id);
    this.notifyObservers();
  }
}