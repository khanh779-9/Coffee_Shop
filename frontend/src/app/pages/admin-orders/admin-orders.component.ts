import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { API_BASE_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';
import { AdminOrder } from '../../core/models';

@Component({
  selector: 'app-admin-orders',
  imports: [RouterLink],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.scss'
})
export class AdminOrdersComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly orders = signal<AdminOrder[]>([]);
  protected readonly errorMessage = signal('');
  protected readonly statusMessage = signal('');
  protected readonly adminName = this.authService.user;
  protected readonly orderStatuses: AdminOrder['status'][] = ['pending', 'confirmed', 'completed', 'cancelled'];
  private readonly orderStatusSet = new Set<AdminOrder['status']>(this.orderStatuses);

  ngOnInit(): void {
    this.loadOrders();
  }

  protected logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/admin/login');
  }

  protected parseItems(rawItems: AdminOrder['items']): Array<{ productName: string; quantity: number; lineTotal: number }> {
    if (Array.isArray(rawItems)) {
      return rawItems as Array<{ productName: string; quantity: number; lineTotal: number }>;
    }

    try {
      return JSON.parse(rawItems) as Array<{ productName: string; quantity: number; lineTotal: number }>;
    } catch {
      return [];
    }
  }

  protected toCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  }

  protected onStatusChange(orderId: number, event: Event): void {
    const target = event.target;
    if (!(target instanceof HTMLSelectElement)) {
      return;
    }

    this.updateStatus(orderId, target.value);
  }

  protected updateStatus(orderId: number, rawStatus: string): void {
    if (!this.orderStatusSet.has(rawStatus as AdminOrder['status'])) {
      this.errorMessage.set('Trạng thái đơn hàng không hợp lệ.');
      return;
    }

    const status = rawStatus as AdminOrder['status'];
    this.http
      .patch(`${API_BASE_URL}/orders/${orderId}/status`, { status }, { headers: this.authService.authHeaders() })
      .subscribe({
        next: () => {
          this.statusMessage.set(`Đã cập nhật trạng thái đơn #${orderId}.`);
          this.orders.update((orders) =>
            orders.map((order) => (order.id === orderId ? { ...order, status } : order))
          );
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message ?? 'Không thể cập nhật trạng thái đơn hàng.');
        }
      });
  }

  private loadOrders(): void {
    this.http
      .get<{ data: AdminOrder[] }>(`${API_BASE_URL}/orders`, {
        headers: this.authService.authHeaders()
      })
      .subscribe({
        next: (response) => {
          this.orders.set(response.data);
        },
        error: (error) => {
          this.errorMessage.set(error.error?.message ?? 'Không thể tải danh sách đơn hàng.');
        }
      });
  }
}
