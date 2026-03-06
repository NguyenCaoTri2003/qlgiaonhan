import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-label',
  standalone: true,
  templateUrl: './form-label.component.html',
})
export class FormLabelComponent {
  @Input() label!: string;
  @Input() control!: AbstractControl | null;
  @Input() required = false;

  get isInvalid() {
    return !!(this.control && this.control.invalid && this.control.touched);
  }
}