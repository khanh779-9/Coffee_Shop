import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-admin-login',
  imports: [ReactiveFormsModule],
  templateUrl: './admin-login.component.html',
  styleUrl: './admin-login.component.scss'
})
export class AdminLoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly errorMessage = signal('');
  protected readonly isSubmitting = signal(false);

  protected readonly loginForm = this.formBuilder.nonNullable.group({
    email: ['admin@aromacoffee.vn', [Validators.required, Validators.email]],
    password: ['Admin@123', [Validators.required, Validators.minLength(6)]]
  });

  protected submit(): void {
    this.errorMessage.set('');
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const { email, password } = this.loginForm.getRawValue();
    this.isSubmitting.set(true);
    this.authService.login(email, password).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigateByUrl('/admin/orders');
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message ?? 'Không thể đăng nhập admin.');
        this.isSubmitting.set(false);
      }
    });
  }
}
