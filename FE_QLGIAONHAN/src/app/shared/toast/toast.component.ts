import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  message = signal('');
  type = signal<'success' | 'error'>('success');
  visible = signal(false);

  show(message: string, type: 'success' | 'error' = 'success') {
    this.message.set(message);
    this.type.set(type);
    this.visible.set(true);

    setTimeout(() => {
      this.visible.set(false);
    }, 3000);
  }
}