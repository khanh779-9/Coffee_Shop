import { DecimalPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { API_BASE_URL } from '../../core/api.config';
import { AuthService } from '../../core/auth.service';
import { AdminCategory, AdminProduct } from '../../core/models';

@Component({
  selector: 'app-admin-content',
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './admin-content.component.html',
  styleUrl: './admin-content.component.scss'
})
export class AdminContentComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);

  protected readonly categories = signal<AdminCategory[]>([]);
  protected readonly products = signal<AdminProduct[]>([]);
  protected readonly statusMessage = signal('');
  protected readonly errorMessage = signal('');
  protected readonly editingCategoryId = signal<number | null>(null);
  protected readonly editingProductId = signal<number | null>(null);

  protected readonly categoryForm = this.formBuilder.nonNullable.group({
    code: ['', [Validators.required]],
    name: ['', [Validators.required]],
    description: [''],
    sortOrder: [0, [Validators.required]],
    isActive: [true]
  });

  protected readonly productForm = this.formBuilder.nonNullable.group({
    categoryId: [1, [Validators.required]],
    name: ['', [Validators.required]],
    slug: ['', [Validators.required]],
    description: ['', [Validators.required]],
    rating: [4.5, [Validators.required]],
    priceFrom: [30000, [Validators.required]],
    imageUrl: ['', [Validators.required]],
    isFeatured: [false],
    isActive: [true]
  });

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  protected editCategory(category: AdminCategory): void {
    this.editingCategoryId.set(category.id);
    this.categoryForm.reset({
      code: category.code,
      name: category.name,
      description: category.description ?? '',
      sortOrder: category.sortOrder,
      isActive: !!category.isActive
    });
  }

  protected resetCategory(): void {
    this.editingCategoryId.set(null);
    this.categoryForm.reset({ code: '', name: '', description: '', sortOrder: 0, isActive: true });
  }

  protected saveCategory(): void {
    const value = this.categoryForm.getRawValue();
    const request = this.editingCategoryId()
      ? this.http.put(`${API_BASE_URL}/admin/categories/${this.editingCategoryId()}`, value, { headers: this.authService.authHeaders() })
      : this.http.post(`${API_BASE_URL}/admin/categories`, value, { headers: this.authService.authHeaders() });

    request.subscribe({
      next: () => {
        this.statusMessage.set(this.editingCategoryId() ? 'Đã cập nhật danh mục.' : 'Đã tạo danh mục mới.');
        this.resetCategory();
        this.loadCategories();
      },
      error: (error) => this.errorMessage.set(error.error?.message ?? 'Không thể lưu danh mục.')
    });
  }

  protected deleteCategory(id: number): void {
    this.http.delete(`${API_BASE_URL}/admin/categories/${id}`, { headers: this.authService.authHeaders() }).subscribe({
      next: () => {
        this.statusMessage.set('Đã xóa danh mục.');
        this.loadCategories();
      },
      error: (error) => this.errorMessage.set(error.error?.message ?? 'Không thể xóa danh mục.')
    });
  }

  protected editProduct(product: AdminProduct): void {
    this.editingProductId.set(product.id);
    this.productForm.reset({
      categoryId: product.categoryId,
      name: product.name,
      slug: product.slug,
      description: product.description,
      rating: product.rating,
      priceFrom: product.priceFrom,
      imageUrl: product.imageUrl,
      isFeatured: !!product.isFeatured,
      isActive: !!product.isActive
    });
  }

  protected resetProduct(): void {
    this.editingProductId.set(null);
    this.productForm.reset({
      categoryId: this.categories()[0]?.id ?? 1,
      name: '',
      slug: '',
      description: '',
      rating: 4.5,
      priceFrom: 30000,
      imageUrl: '',
      isFeatured: false,
      isActive: true
    });
  }

  protected saveProduct(): void {
    const value = this.productForm.getRawValue();
    const request = this.editingProductId()
      ? this.http.put(`${API_BASE_URL}/admin/products/${this.editingProductId()}`, value, { headers: this.authService.authHeaders() })
      : this.http.post(`${API_BASE_URL}/admin/products`, value, { headers: this.authService.authHeaders() });

    request.subscribe({
      next: () => {
        this.statusMessage.set(this.editingProductId() ? 'Đã cập nhật sản phẩm.' : 'Đã tạo sản phẩm mới.');
        this.resetProduct();
        this.loadProducts();
      },
      error: (error) => this.errorMessage.set(error.error?.message ?? 'Không thể lưu sản phẩm.')
    });
  }

  protected deleteProduct(id: number): void {
    this.http.delete(`${API_BASE_URL}/admin/products/${id}`, { headers: this.authService.authHeaders() }).subscribe({
      next: () => {
        this.statusMessage.set('Đã xóa sản phẩm.');
        this.loadProducts();
      },
      error: (error) => this.errorMessage.set(error.error?.message ?? 'Không thể xóa sản phẩm.')
    });
  }

  private loadCategories(): void {
    this.http.get<{ data: AdminCategory[] }>(`${API_BASE_URL}/admin/categories`, { headers: this.authService.authHeaders() }).subscribe({
      next: (response) => {
        this.categories.set(response.data);
        if (!this.editingProductId() && !this.productForm.controls.name.value) {
          this.productForm.patchValue({ categoryId: response.data[0]?.id ?? 1 });
        }
      },
      error: (error) => this.errorMessage.set(error.error?.message ?? 'Không thể tải danh mục.')
    });
  }

  private loadProducts(): void {
    this.http.get<{ data: AdminProduct[] }>(`${API_BASE_URL}/admin/products`, { headers: this.authService.authHeaders() }).subscribe({
      next: (response) => this.products.set(response.data),
      error: (error) => this.errorMessage.set(error.error?.message ?? 'Không thể tải sản phẩm.')
    });
  }
}
