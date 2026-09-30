import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-toasts',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './toasts.component.html',
  styleUrl: './toasts.component.scss',
})
export class ToastsComponent {
  constructor(private toast: ToastService) {}

  get toasts() {
    return this.toast.toasts();
  }

  dismiss(id: number): void {
    this.toast.dismiss(id);
  }
}