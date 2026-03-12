import { Injectable, signal } from "@angular/core";

@Injectable({ providedIn: "root" })
export class ToastService {

  toasts = signal<any[]>([]);

  show(data: any, duration = 10000) {

    const id = Date.now();

    this.toasts.update(list => [
      ...list,
      { ...data, id }
    ]);

    setTimeout(() => {
      this.remove(id);
    }, duration);
  }

  remove(id: number) {
    this.toasts.update(list => list.filter(t => t.id !== id));
  }
}