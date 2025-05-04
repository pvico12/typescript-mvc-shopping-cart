export interface Observer {
    update(): void;
}
  
export class Subject {
  private observers: Observer[] = [];

  protected notifyObservers() {
    for (const o of this.observers) {
      o.update();
    }
  }

  addObserver(observer: Observer) {
    this.observers.push(observer);
    observer.update();
  }

  removeObserver(observer: Observer) {
    this.observers.splice(this.observers.indexOf(observer), 1);
  }
}
  