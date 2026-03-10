import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-loading",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-overlay">
      <div class="spinner"></div>
    </div>
  `,
  styles: [`
    .loading-overlay{
      position: fixed;
      inset: 0;
      background: rgba(255,255,255,0.6);
      display:flex;
      align-items:center;
      justify-content:center;
      z-index:9999;
    }

    .spinner{
      width:48px;
      height:48px;
      border:5px solid #e5e7eb;
      border-top:5px solid #2563eb;
      border-radius:50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin{
      from{ transform: rotate(0deg); }
      to{ transform: rotate(360deg); }
    }
  `]
})
export class LoadingComponent {}