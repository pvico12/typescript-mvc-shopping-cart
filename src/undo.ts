export interface Command {
    do(): void;
    undo(): void;
}
  
export class UndoManager {
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  constructor() {}

  execute(command: Command) {
    this.undoStack.push(command);
    this.redoStack = [];
    console.log(this.toString());
  }

  undo() {
    const command = this.undoStack.pop();
    if (command) {
      this.redoStack.push(command);
      command.undo();
    }
    console.log(this.toString());
  }

  redo() {
    const command = this.redoStack.pop();
    if (command) {
      this.undoStack.push(command);
      command.do();
    }
    console.log(this.toString());
  }

  get canUndo() {
    return this.undoStack.length > 0;
  }

  get canRedo() {
    return this.redoStack.length > 0;
  }

  toString() {
    return `undoStack: ${this.undoStack.length}, redoStack: ${this.redoStack.length}`;
  }
}
  