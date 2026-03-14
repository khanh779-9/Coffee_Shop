import { HttpClient } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { API_BASE_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';
import { CartService } from '../../core/cart.service';
import { CreateOrderPayload, CreatedOrder } from '../../core/models';

@Component({
  selector: 'app-order',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent {
  private readonly http = inject(HttpClient);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly cartService = inject(CartService);

  protected readonly cartLines = computed(() => this.cartService.lines());
  protected readonly successMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly isSubmitting = signal(false);

  protected readonly orderForm = this.formBuilder.nonNullable.group({
    customerName: ['', [Validators.required, Validators.minLength(2)]],
    customerPhone: ['', [Validators.required, Validators.minLength(8)]],
    customerAddress: [''],
    note: ['']
  });

  protected increaseQuantity(productId: number): void {
    this.cartService.increase(productId);
  }

  protected decreaseQuantity(productId: number): void {
    this.cartService.decrease(productId);
  }

  protected removeItem(productId: number): void {
    this.cartService.remove(productId);
  }

  protected lineTotal(unitPrice: number, quantity: number): number {
    return unitPrice * quantity;
  }

  protected cartTotal(): number {
    return this.cartService.totalAmount();
  }

  protected toCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  }

  protected submitOrder(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const items = this.cartLines().map((line) => ({
      productId: line.id,
      quantity: line.quantity
    }));

    if (!items.length) {
      this.errorMessage.set('Bạn cần chọn ít nhất 1 sản phẩm.');
      return;
    }

    const payload: CreateOrderPayload = {
      ...this.orderForm.getRawValue(),
      items
    };

    this.isSubmitting.set(true);
    this.http
      .post<{ data: CreatedOrder }>(`${API_BASE_URL}/orders`, payload, {
        headers: this.authService.authHeaders()
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          this.successMessage.set(`Đặt hàng thành công. Mã đơn #${response.data.id}`);
          this.orderForm.reset({
            customerName: '',
            customerPhone: '',
            customerAddress: '',
            note: ''
          });
          this.cartService.clear();
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message ?? 'Không thể tạo đơn hàng.');
        }
      });
  }
}
