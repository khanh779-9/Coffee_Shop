import { HttpClient } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { API_BASE_URL } from '../../core/api.config';
import { CartService } from '../../core/cart.service';
import { DrinkItem, HeroContent, MenuTab } from '../../core/models';

const HERO_CONTENT: HeroContent = {
  badge: 'Cửa hàng cà phê số 1 thành phố',
  title: 'Hương vị đánh thức mọi giác quan',
  description:
    'Khám phá nghệ thuật pha chế thủ công từ những hạt cà phê tuyển chọn nhất, mang đến cho bạn trải nghiệm thưởng thức đích thực.',
  primaryAction: 'Đặt hàng ngay',
  secondaryAction: 'Xem thực đơn',
  backgroundImage: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2000&auto=format&fit=crop'
};

const MENU_ERROR_MESSAGE = 'Không thể tải thực đơn lúc này. Vui lòng thử lại sau.';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly cartService = inject(CartService);

  protected readonly hero = signal<HeroContent>(HERO_CONTENT);
  protected readonly menuTabs = signal<MenuTab[]>([]);
  protected readonly activeTab = signal('all');
  protected readonly drinks = signal<DrinkItem[]>([]);
  protected readonly filteredDrinks = computed(() => this.drinks());
  private readonly menuErrors = signal<Record<string, string>>({});
  protected readonly menuErrorMessage = computed(() => {
    const errors = Object.values(this.menuErrors());
    return errors.length ? errors[0] : '';
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts('all');
  }

  protected setActiveTab(tabCode: string): void {
    this.activeTab.set(tabCode);
    this.loadProducts(tabCode);
  }

  protected retryMenuLoad(): void {
    this.menuErrors.set({});
    this.loadCategories();
    this.loadProducts(this.activeTab());
  }

  protected toCurrency(value: number): string {
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  }

  protected addToCart(drink: DrinkItem): void {
    this.cartService.addDrink(drink);
  }

  private loadCategories(): void {
    this.http.get<{ data: MenuTab[] }>(`${API_BASE_URL}/menu/categories`).subscribe({
      next: (response) => {
        this.menuTabs.set(response.data);
        this.clearMenuError('categories');
      },
      error: () => {
        this.menuTabs.set([]);
        this.setMenuError('categories');
      }
    });
  }

  private loadProducts(categoryCode: string): void {
    const query = categoryCode !== 'all' ? `?category=${categoryCode}` : '';
    this.http.get<{ data: DrinkItem[] }>(`${API_BASE_URL}/menu/products${query}`).subscribe({
      next: (response) => {
        this.drinks.set(response.data);
        this.clearMenuError('products');
      },
      error: () => {
        this.drinks.set([]);
        this.setMenuError('products');
      }
    });
  }

  private setMenuError(key: string): void {
    this.menuErrors.update(current => ({
      ...current,
      [key]: MENU_ERROR_MESSAGE
    }));
  }

  private clearMenuError(key: string): void {
    this.menuErrors.update(current => {
      if (!current[key]) {
        return current;
      }

      const next = { ...current };
      delete next[key];
      return next;
    });
  }
}
