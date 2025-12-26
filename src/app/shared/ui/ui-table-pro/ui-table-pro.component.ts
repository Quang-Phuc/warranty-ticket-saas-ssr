import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/** ✅ EXPORT types để component khác import */
export type UiTableAlign = 'left' | 'center' | 'right';
export type UiBadgeTone = 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'gray' | 'warn';

export interface StoreDto {
  id: number;
  name: string;
  address?: string;
  note?: string;
}

export interface UiTableColumn<T = any> {
  key: keyof T | string;
  label: string;
  width?: string;
  hidden?: boolean;
  sortable?: boolean;
  align?: UiTableAlign;
  type?: 'text' | 'money' | 'date' | 'badge' | 'avatar';
  badgeTone?: (row: T) => UiBadgeTone;
  value?: (row: T) => any;
}

export interface UiTableHeaderAction {
  key: string;
  label: string;
  icon?: string;
  tone?: 'default' | 'danger' | 'primary';
  disabled?: boolean;
  /** Optional: confirm trước khi run */
  confirm?: {
    title?: string;
    message: string;
    okText?: string;
    cancelText?: string;
  };
  run: () => void;
}

export interface UiTableAction<T = any> {
  /** Unique key để track action */
  key: string;

  label: string;
  icon?: string;
  tone?: 'default' | 'danger' | 'primary';

  /** Optional: disable theo row */
  disabled?: (row: T) => boolean;

  /** Optional: confirm trước khi run */
  confirm?: {
    title?: string;
    message: string;
    okText?: string;
    cancelText?: string;
  };

  run: (row: T) => void;
}

@Component({
  selector: 'ui-table-pro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './ui-table-pro.component.html',
  styleUrl: './ui-table-pro.component.scss',
})
export class UiTableProComponent<T = any> {
  // inputs
  title = input<string>('Danh sách');
  subtitle = input<string>('');
  loading = input<boolean>(false);

  rows = input<T[]>([]);
  total = input<number>(0);

  page = input<number>(0);
  pageSize = input<number>(10);

  enableSearch = input<boolean>(true);
  enableColumnPicker = input<boolean>(true);
  enableExport = input<boolean>(false);

  enableSelect = input<boolean>(false);

  /** ✅ NEW: actions ở header (Thêm mới, Xóa chọn, Refresh, Import...) */
  headerActions = input<UiTableHeaderAction[]>([]);

  searchPlaceholder = input<string>('Tìm kiếm...');
  columns = input<UiTableColumn<T>[]>([]);
  actions = input<UiTableAction<T>[] | null>(null);

  // ✅ NEW: store filter enable (mặc định tắt)
  enableStoreFilter = input<boolean>(false);

  // outputs
  pageChange = output<number>();
  pageSizeChange = output<number>();
  searchChange = output<string>();
  sortChange = output<{ key: string; dir: 'asc' | 'desc' | '' }>();

  selectionChange = output<T[]>();

  // ✅ NEW: emit storeId khi đổi
  storeChange = output<number>();

  // state
  searchTerm = signal('');
  openColPicker = signal(false);
  openRowActionIndex = signal<number | null>(null);

  /** ✅ Confirm dialog state */
  confirmState = signal<{
    title: string;
    message: string;
    okText: string;
    cancelText: string;
    onOk: () => void;
  } | null>(null);

  /** ✅ sort state */
  sortKey = signal<string>('');
  sortDir = signal<'asc' | 'desc' | ''>('');

  /** ✅ local columns (for hide/show) */
  localCols = signal<UiTableColumn<T>[]>([]);

  /** ✅ selection */
  selectedKeys = signal<Set<number>>(new Set());

  /** ✅ NEW: stores + selected store */
  stores = signal<StoreDto[]>([]);
  selectedStoreId = signal<number | null>(null);

  /** ✅ computed columns visible */
  visibleColumns = computed(() => {
    const cols = this.localCols().length ? this.localCols() : this.columns();
    return cols.filter((c) => !c.hidden);
  });

  /** ✅ pagination */
  pageSizes = [10, 20, 30, 50];

  totalPages = computed(() => Math.ceil((this.total() || 0) / this.pageSize()));
  from = computed(() => (this.total() === 0 ? 0 : this.page() * this.pageSize() + 1));
  to = computed(() =>
    Math.min((this.page() + 1) * this.pageSize(), this.total() || 0)
  );

  pagesToShow = computed(() => {
    const total = this.totalPages();
    const current = this.page();
    const delta = 2;

    const pages: number[] = [];
    for (let i = Math.max(0, current - delta); i <= Math.min(total - 1, current + delta); i++) {
      pages.push(i);
    }
    return pages;
  });

  /** ✅ selection output */
  selectedRows = computed(() => {
    const idxs = Array.from(this.selectedKeys());
    return idxs.map((i) => this.rows()[i]).filter(Boolean);
  });

  constructor() {
    /** ✅ init local cols sync */
    effect(() => {
      const cols = this.columns();
      if (cols?.length && !this.localCols().length) {
        this.localCols.set(cols.map((c) => ({ ...c })));
      }
    });

    /** ✅ emit selection */
    effect(() => {
      if (this.enableSelect()) {
        this.selectionChange.emit(this.selectedRows());
      }
    });

    // ✅ NEW: load store list from localStorage once
    effect(() => {
      if (this.enableStoreFilter()) {
        this.loadStoresFromStorage();
      }
    });
  }

  // ✅ NEW: load stores + selectedStoreId from localStorage
  loadStoresFromStorage() {
    try {
      const storesRaw = localStorage.getItem('stores');
      const selectedRaw = localStorage.getItem('selectedStoreId');

      const stores: StoreDto[] = storesRaw ? JSON.parse(storesRaw) : [];
      this.stores.set(Array.isArray(stores) ? stores : []);

      const selected = selectedRaw ? Number(selectedRaw) : null;
      const selectedId = selectedRaw && !isNaN(selected as any) ? selected : null;

      // nếu selected invalid => set store đầu
      if (this.stores().length) {
        const isValid = selectedId && this.stores().some((s) => s.id === selectedId);
        const finalId = isValid ? selectedId : this.stores()[0].id;

        this.selectedStoreId.set(finalId);
        localStorage.setItem('selectedStoreId', String(finalId));
      } else {
        this.selectedStoreId.set(null);
        localStorage.removeItem('selectedStoreId');
      }
    } catch {
      this.stores.set([]);
      this.selectedStoreId.set(null);
    }
  }

  // ✅ NEW: user change store
  onStoreChange(v: any) {
    const id = Number(v);
    if (isNaN(id)) return;

    this.selectedStoreId.set(id);
    localStorage.setItem('selectedStoreId', String(id));

    this.storeChange.emit(id);
  }

  // ===== Helpers =====
  keyToString(key: any): string {
    return `${key}`;
  }

  getCellValue(row: any, col: UiTableColumn<T>) {
    if (col.value) return col.value(row);
    return row?.[col.key as any];
  }

  formatMoney(v: any) {
    const num = Number(v || 0);
    return num.toLocaleString('vi-VN') + ' ₫';
  }

  formatDate(v: any) {
    if (!v) return '—';
    const d = new Date(v);
    if (isNaN(d.getTime())) return v;
    return d.toLocaleDateString('vi-VN');
  }

  // ===== Search =====
  onSearchInput(v: string) {
    this.searchTerm.set(v);
    this.searchChange.emit(v);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.searchChange.emit('');
  }

  // ===== Sorting =====
  onSort(c: UiTableColumn<T>) {
    if (!c.sortable) return;

    const key = this.keyToString(c.key);
    const currKey = this.sortKey();
    const currDir = this.sortDir();

    if (currKey !== key) {
      this.sortKey.set(key);
      this.sortDir.set('asc');
    } else {
      const next = currDir === 'asc' ? 'desc' : currDir === 'desc' ? '' : 'asc';
      this.sortDir.set(next);
      if (!next) this.sortKey.set('');
    }

    this.sortChange.emit({ key: this.sortKey(), dir: this.sortDir() });
  }

  isSortedAsc(key: string) {
    return this.sortKey() === key && this.sortDir() === 'asc';
  }
  isSortedDesc(key: string) {
    return this.sortKey() === key && this.sortDir() === 'desc';
  }

  // ===== Column picker =====
  toggleColPicker() {
    this.openColPicker.set(!this.openColPicker());
  }
  toggleColumn(c: UiTableColumn<T>) {
    const cols = this.localCols().length ? this.localCols() : this.columns();
    const next = cols.map((x) =>
      this.keyToString(x.key) === this.keyToString(c.key) ? { ...x, hidden: !x.hidden } : x
    );
    this.localCols.set(next);
  }
  resetColumns() {
    this.localCols.set(this.columns().map((c) => ({ ...c, hidden: false })));
  }
  hasAnyHidden() {
    const cols = this.localCols().length ? this.localCols() : this.columns();
    return cols.some((c) => c.hidden);
  }

  // ===== actions dropdown =====
  toggleRowActions(i: number, ev: MouseEvent) {
    ev.stopPropagation();
    this.openRowActionIndex.set(this.openRowActionIndex() === i ? null : i);
  }
  runAction(a: UiTableAction<T>, row: T, ev: MouseEvent) {
    ev.stopPropagation();

    if (a.disabled?.(row)) return;

    const doRun = () => {
      a.run(row);
      this.openRowActionIndex.set(null);
    };

    if (a.confirm) {
      this.openRowActionIndex.set(null);
      this.openConfirm({
        title: a.confirm.title || 'Xác nhận',
        message: a.confirm.message,
        okText: a.confirm.okText || 'Đồng ý',
        cancelText: a.confirm.cancelText || 'Hủy',
        onOk: doRun,
      });
      return;
    }

    doRun();
  }

  // ===== Header actions =====
  runHeaderAction(a: UiTableHeaderAction, ev: MouseEvent) {
    ev.stopPropagation();
    if (a.disabled) return;

    const doRun = () => a.run();

    if (a.confirm) {
      this.openConfirm({
        title: a.confirm.title || 'Xác nhận',
        message: a.confirm.message,
        okText: a.confirm.okText || 'Đồng ý',
        cancelText: a.confirm.cancelText || 'Hủy',
        onOk: doRun,
      });
      return;
    }

    doRun();
  }

  // ===== Confirm modal =====
  openConfirm(cfg: {
    title: string;
    message: string;
    okText: string;
    cancelText: string;
    onOk: () => void;
  }) {
    this.confirmState.set(cfg);
  }

  confirmOk() {
    const st = this.confirmState();
    if (!st) return;
    st.onOk();
    this.confirmState.set(null);
  }

  confirmCancel() {
    this.confirmState.set(null);
  }

  @HostListener('document:click')
  onDocClick() {
    this.openRowActionIndex.set(null);
    this.openColPicker.set(false);
  }

  // ===== pagination =====
  goPrev() {
    if (this.page() <= 0) return;
    this.pageChange.emit(this.page() - 1);
  }
  goNext() {
    if (this.page() >= this.totalPages() - 1) return;
    this.pageChange.emit(this.page() + 1);
  }
  goPage(p: number) {
    this.pageChange.emit(p);
  }
  onPageSizeChange(v: number) {
    this.pageSizeChange.emit(Number(v));
  }

  // ===== selection =====
  toggleRow(i: number) {
    const s = new Set(this.selectedKeys());
    s.has(i) ? s.delete(i) : s.add(i);
    this.selectedKeys.set(s);
  }
  toggleAll() {
    const all = this.rows();
    const s = new Set<number>();
    if (!this.allChecked()) {
      all.forEach((_, i) => s.add(i));
    }
    this.selectedKeys.set(s);
  }
  clearSelection() {
    this.selectedKeys.set(new Set());
  }
  allChecked() {
    return this.rows().length > 0 && this.selectedKeys().size === this.rows().length;
  }
  someChecked() {
    return this.selectedKeys().size > 0 && !this.allChecked();
  }

  trackByRow = (_: number, row: any) => row?.id ?? _;
  trackByCol = (_: number, col: UiTableColumn<T>) => this.keyToString(col.key);

  exportCsv() {
    // TODO: implement export later (optional)
    // hiện tại chỉ để tránh build error
    console.log('[UiTablePro] Export CSV clicked');
  }
}
