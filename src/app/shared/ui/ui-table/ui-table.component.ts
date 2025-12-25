import {
    Component,
    ChangeDetectionStrategy,
    computed,
    effect,
    input,
    output,
    signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export type UiColumnType = 'text' | 'date' | 'money' | 'badge' | 'avatar' | 'actions';

export type UiBadgeTone = 'green' | 'blue' | 'purple' | 'orange' | 'red' | 'gray';

export type UiColumn<T> = {
    key: keyof T | string;
    label: string;
    width?: string;
    hidden?: boolean;
    sortable?: boolean;
    type?: UiColumnType;
    align?: 'left' | 'center' | 'right';
    formatter?: (row: T) => string;
    badgeTone?: (row: T) => UiBadgeTone;
};

export type UiRowAction<T> = {
    label: string;
    icon?: string;
    tone?: 'normal' | 'danger';
    onClick: (row: T) => void;
};

export type UiSort = { key: string; dir: 'asc' | 'desc' } | null;

@Component({
    selector: 'ui-table',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './ui-table.component.html',
    styleUrl: './ui-table.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UiTableComponent<T extends Record<string, any>> {
    // ===== INPUTS =====
    tableId = input<string>('ui-table'); // unique key localStorage
    title = input<string>('Danh sách');
    subtitle = input<string>('');
    rows = input<T[]>([]);
    columns = input<UiColumn<T>[]>([]);
    loading = input<boolean>(false);

    page = input<number>(0);
    pageSize = input<number>(10);
    total = input<number>(0);

    enableSearch = input<boolean>(true);
    searchPlaceholder = input<string>('Tìm kiếm...');
    searchTerm = input<string>('');

    enableSelect = input<boolean>(true);
    enableColumnPicker = input<boolean>(true);
    enableExport = input<boolean>(true);

    actions = input<UiRowAction<T>[]>([]);

    // ===== OUTPUTS =====
    pageChange = output<number>();
    pageSizeChange = output<number>();
    sortChange = output<UiSort>();
    searchChange = output<string>();
    selectionChange = output<T[]>();

    // ===== INTERNAL =====
    sort = signal<UiSort>(null);
    localCols = signal<UiColumn<T>[]>([]);
    openColPicker = signal(false);

    selectedKeys = signal<Set<number>>(new Set()); // index based
    openRowActionIndex = signal<number | null>(null);

    pageSizes = [10, 20, 30, 50, 100];

    totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
    from = computed(() => (this.total() === 0 ? 0 : this.page() * this.pageSize() + 1));
    to = computed(() => Math.min(this.total(), (this.page() + 1) * this.pageSize()));

    visibleColumns = computed(() =>
        (this.localCols().length ? this.localCols() : this.columns()).filter((c) => !c.hidden)
    );

    hasAnyHidden = computed(() =>
        (this.localCols().length ? this.localCols() : this.columns()).some((c) => c.hidden)
    );

    selectedRows = computed(() => {
        const keys = this.selectedKeys();
        const data = this.rows();
        return Array.from(keys).map((idx) => data[idx]).filter(Boolean);
    });

    constructor() {
        // clone columns and load persisted settings
        effect(() => {
            const cols = this.columns();
            if (!cols?.length) return;

            const saved = this.loadCols();
            if (saved) {
                // merge saved hidden states by key
                const merged = cols.map((c) => {
                    const found = saved.find((x) => String(x.key) === String(c.key));
                    return found ? { ...c, hidden: !!found.hidden } : c;
                });
                this.localCols.set(merged);
            } else {
                this.localCols.set(cols.map((c) => ({ ...c })));
            }
        });

        effect(() => {
            // emit selection when changed
            this.selectionChange.emit(this.selectedRows());
        });

        // close dropdown on outside click
        effect(() => {
            const fn = (e: any) => {
                const target = e?.target as HTMLElement;
                if (!target) return;
                if (!target.closest('.row-actions') && !target.closest('.col-picker')) {
                    this.openRowActionIndex.set(null);
                    this.openColPicker.set(false);
                }
            };
            window.addEventListener('click', fn);
            return () => window.removeEventListener('click', fn);
        });
    }

    // ===== COLUMN PICKER =====
    toggleColPicker() {
        this.openColPicker.set(!this.openColPicker());
    }

    toggleColumn(col: UiColumn<T>) {
        const cols = [...this.localCols()];
        const idx = cols.findIndex((x) => String(x.key) === String(col.key));
        if (idx < 0) return;
        cols[idx] = { ...cols[idx], hidden: !cols[idx].hidden };
        this.localCols.set(cols);
        this.persistCols(cols);
    }

    resetColumns() {
        const cols = this.columns().map((c) => ({ ...c, hidden: false }));
        this.localCols.set(cols);
        this.persistCols(cols);
    }

    private persistCols(cols: UiColumn<T>[]) {
        try {
            localStorage.setItem(`ui_table_cols_${this.tableId()}`, JSON.stringify(cols.map((c) => ({
                key: c.key,
                hidden: !!c.hidden,
            }))));
        } catch {}
    }

    private loadCols(): { key: string; hidden: boolean }[] | null {
        try {
            const raw = localStorage.getItem(`ui_table_cols_${this.tableId()}`);
            if (!raw) return null;
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    // ===== SORT =====
    onSort(col: UiColumn<T>) {
        if (!col.sortable) return;
        const key = String(col.key);

        const s = this.sort();
        if (!s || s.key !== key) {
            this.sort.set({ key, dir: 'asc' });
        } else {
            this.sort.set({ key, dir: s.dir === 'asc' ? 'desc' : 'asc' });
        }
        this.sortChange.emit(this.sort());
    }

    isSortedAsc(key: string) {
        const s = this.sort();
        return s?.key === key && s?.dir === 'asc';
    }

    isSortedDesc(key: string) {
        const s = this.sort();
        return s?.key === key && s?.dir === 'desc';
    }

    // ===== SEARCH =====
    onSearchInput(v: string) {
        this.searchChange.emit(v);
    }

    clearSearch() {
        this.searchChange.emit('');
    }

    // ===== PAGINATION =====
    goPrev() {
        if (this.page() <= 0) return;
        this.pageChange.emit(this.page() - 1);
    }

    goNext() {
        if (this.page() >= this.totalPages() - 1) return;
        this.pageChange.emit(this.page() + 1);
    }

    goPage(i: number) {
        if (i < 0 || i >= this.totalPages()) return;
        this.pageChange.emit(i);
    }

    onPageSizeChange(size: number) {
        this.pageSizeChange.emit(Number(size));
    }

    pagesToShow(): number[] {
        const total = this.totalPages();
        const current = this.page();
        const windowSize = 5;

        const start = Math.max(0, current - Math.floor(windowSize / 2));
        const end = Math.min(total - 1, start + windowSize - 1);

        const actualStart = Math.max(0, end - windowSize + 1);
        const pages = [];
        for (let i = actualStart; i <= end; i++) pages.push(i);
        return pages;
    }

    // ===== SELECTION =====
    toggleAll() {
        const data = this.rows();
        const set = new Set<number>(this.selectedKeys());
        if (set.size === data.length) {
            this.selectedKeys.set(new Set());
            return;
        }
        const next = new Set<number>();
        data.forEach((_, idx) => next.add(idx));
        this.selectedKeys.set(next);
    }

    toggleRow(idx: number) {
        const set = new Set<number>(this.selectedKeys());
        if (set.has(idx)) set.delete(idx);
        else set.add(idx);
        this.selectedKeys.set(set);
    }

    allChecked() {
        return this.rows().length > 0 && this.selectedKeys().size === this.rows().length;
    }

    someChecked() {
        const size = this.selectedKeys().size;
        return size > 0 && size < this.rows().length;
    }

    clearSelection() {
        this.selectedKeys.set(new Set());
    }

    // ===== ACTIONS =====
    toggleRowActions(idx: number, e: MouseEvent) {
        e.stopPropagation();
        this.openRowActionIndex.set(this.openRowActionIndex() === idx ? null : idx);
    }

    runAction(action: UiRowAction<T>, row: T, e: MouseEvent) {
        e.stopPropagation();
        this.openRowActionIndex.set(null);
        action.onClick(row);
    }

    // ===== UTIL =====
    getCellValue(row: T, col: UiColumn<T>): any {
        if (col.formatter) return col.formatter(row);
        const key = String(col.key);
        return (row as any)?.[key];
    }

    formatMoney(val: any): string {
        const num = Number(val || 0);
        return num.toLocaleString('vi-VN') + '₫';
    }

    formatDate(val: any): string {
        if (!val) return '';
        try {
            const d = new Date(val);
            return d.toLocaleDateString('vi-VN');
        } catch {
            return String(val);
        }
    }

    exportCsv() {
        const cols = this.visibleColumns();
        const rows = this.rows();

        const header = cols.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(',');
        const lines = rows.map((r) =>
            cols
                .map((c) => {
                    const v = this.getCellValue(r, c);
                    return `"${String(v ?? '').replace(/"/g, '""')}"`;
                })
                .join(',')
        );

        const csv = [header, ...lines].join('\n');
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${this.tableId()}.csv`;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    trackByCol = (_: number, c: UiColumn<T>) => String(c.key);
    trackByRow = (i: number) => i;
}
