import { Injectable, computed, signal } from '@angular/core';
import { DrinkItem } from './models';

export interface CartLine {
  id: number;
  name: string;
  imageUrl: string;
  unitPrice: number;
  quantity: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly storageKey = 'coffee_shop_cart_lines_v1';
  private readonly linesState = signal<CartLine[]>([]);
  private readonly openState = signal(false);
  private readonly lastAddedItemIdState = signal<number | null>(null);

  readonly lines = computed(() => this.linesState());
  readonly isOpen = computed(() => this.openState());
  readonly lastAddedItemId = computed(() => this.lastAddedItemIdState());
  readonly totalCount = computed(() => this.linesState().reduce((sum, line) => sum + line.quantity, 0));
  readonly totalAmount = computed(() => this.linesState().reduce((sum, line) => sum + line.unitPrice * line.quantity, 0));

  constructor() {
    this.restoreFromStorage();
  }

  open(): void {
    this.openState.set(true);
  }

  close(): void {
    this.openState.set(false);
  }

  toggle(): void {
    this.openState.update(current => !current);
  }

  clear(): void {
    this.linesState.set([]);
    this.persistToStorage();
  }

  addDrink(drink: DrinkItem): void {
    this.lastAddedItemIdState.set(drink.id);

    this.linesState.update(lines => {
      const index = lines.findIndex(line => line.id === drink.id);
      if (index === -1) {
        return [
          ...lines,
          {
            id: drink.id,
            name: drink.name,
            imageUrl: drink.imageUrl,
            unitPrice: drink.priceFrom,
            quantity: 1
          }
        ];
      }

      const next = [...lines];
      next[index] = {
        ...next[index],
        quantity: next[index].quantity + 1
      };
      return next;
    });

    this.persistToStorage();
    this.open();

    setTimeout(() => {
      if (this.lastAddedItemIdState() === drink.id) {
        this.lastAddedItemIdState.set(null);
      }
    }, 520);
  }

  increase(itemId: number): void {
    this.linesState.update(lines => lines.map(line =>
      line.id === itemId
        ? { ...line, quantity: line.quantity + 1 }
        : line
    ));
    this.persistToStorage();
  }

  decrease(itemId: number): void {
    this.linesState.update(lines => lines
      .map(line => line.id === itemId ? { ...line, quantity: line.quantity - 1 } : line)
      .filter(line => line.quantity > 0)
    );
    this.persistToStorage();
  }

  remove(itemId: number): void {
    this.linesState.update(lines => lines.filter(line => line.id !== itemId));
    this.persistToStorage();
  }

  private persistToStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(this.storageKey, JSON.stringify(this.linesState()));
  }

  private restoreFromStorage(): void {
    if (typeof window === 'undefined') {
      return;
    }

    const raw = window.localStorage.getItem(this.storageKey);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as CartLine[];
      if (Array.isArray(parsed)) {
        const normalized = parsed.filter(item =>
          typeof item.id === 'number' &&
          typeof item.name === 'string' &&
          typeof item.imageUrl === 'string' &&
          typeof item.unitPrice === 'number' &&
          typeof item.quantity === 'number' &&
          item.quantity > 0
        );
        this.linesState.set(normalized);
      }
    } catch {
      this.linesState.set([]);
    }
  }
}
