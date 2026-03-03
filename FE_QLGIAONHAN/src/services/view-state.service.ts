import { Injectable, signal } from "@angular/core";
import { ViewState } from "../type/models";

@Injectable({ providedIn: "root" })
export class ViewStateService {
  activeView = signal<ViewState>("DASHBOARD");

  setView(view: ViewState) {
    this.activeView.set(view);
  }
}