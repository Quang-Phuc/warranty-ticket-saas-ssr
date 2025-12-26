import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import {
  UiTableAction,
  UiTableColumn,
  UiTableHeaderAction,
  UiTableProComponent
} from '../../../../shared/ui/ui-table-pro/ui-table-pro.component';

import {
  DrawerField,
  DrawerOption,
  UiDetailDrawerComponent
} from '../../../../shared/ui/ui-detail-drawer/ui-detail-drawer.component';

import { LicenseHistoryEntry, LicenseService, PagedResponse } from '../../data-access/license.service';

// ✅ NEW: dynamic form add modal
import { FieldConfig } from '../../../../shared/ui/ui-dynamic-form/ui-dynamic-form.types';
import { buildFormData } from '../../../../shared/utils/build-form-data';
import { AddModalService } from '../../../../shared/services/add-modal.service';

export interface StoreDto {
  id: number;
  name: string;
  address?: string;
  note?: string;
}

@Component({
  selector: 'license-history-user',
  standalone: true,
  imports: [CommonModule, UiTableProComponent, UiDetailDrawerComponent],
  templateUrl: './license-history-user.component.html',
  styleUrl: './license-history-user.component.scss',
})
export class LicenseHistoryUserComponent {
  loading = signal(false);
  selectedRows: LicenseHistoryEntry[] = [];

  rows = signal<LicenseHistoryEntry[]>([]);
  total = signal(0);

  page = signal(0);
  pageSize = signal(10);

  keyword = signal('');

  currentRow = signal<LicenseHistoryEntry | null>(null);
  drawerOpen = signal(false);

  // ✅ NEW: store list + selected storeId
  stores = signal<StoreDto[]>([]);
  selectedStoreId = signal<number | null>(null);

  /** ✅ Columns */
  columns: UiTableColumn<LicenseHistoryEntry>[] = [
    { key: 'id', label: 'ID', width: '90px', sortable: true },
    { key: 'packageName', label: 'Gói', sortable: true },
    {
      key: 'amountPaid',
      label: 'Số tiền',
      type: 'money',
      align: 'right',
      sortable: true
    },
    { key: 'purchaseDate', label: 'Ngày mua', type: 'date', sortable: true },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'badge',
      badgeTone: (row: LicenseHistoryEntry) => this.statusTone(row.status),
    },
  ];

  /** ✅ Header Actions */
  headerActions: UiTableHeaderAction[] = [
    {
      key: 'add',
      label: 'Thêm mới',
      icon: '➕',
      tone: 'primary',
      run: () => this.openAddModal(),
    },
    {
      key: 'refresh',
      label: 'Tải lại',
      icon: '🔄',
      tone: 'default',
      run: () => this.load(),
    },
  ];

  /** ✅ Row Actions */
  actions: UiTableAction<LicenseHistoryEntry>[] = [
    {
      key: 'detail',
      label: 'Xem chi tiết',
      icon: '👁️',
      run: (row) => this.openDrawer(row),
    },
    {
      key: 'delete',
      label: 'Xóa',
      icon: '🗑️',
      tone: 'danger',
      confirm: {
        title: 'Xác nhận xóa',
        message: 'Bạn chắc chắn muốn xóa lịch sử license này?',
        okText: 'Xóa',
        cancelText: 'Hủy',
      },
      run: (row) => this.deleteRow(row),
    },
  ];

  /** ✅ Drawer config */
  statusOptions: DrawerOption[] = [
    { value: 'PENDING', label: 'Đang chờ' },
    { value: 'COMPLETED', label: 'Hoàn tất' },
    { value: 'FAILED', label: 'Thất bại' },
    { value: 'CANCELLED', label: 'Đã hủy' },
  ];

  drawerFields: DrawerField<LicenseHistoryEntry>[] = [
    { key: 'id', label: 'ID' },
    { key: 'packageName', label: 'Gói' },
    { key: 'amountPaid', label: 'Số tiền', type: 'money' },
    { key: 'purchaseDate', label: 'Ngày mua', type: 'date' },
    { key: 'status', label: 'Trạng thái', type: 'select', editable: true },
    {
      key: 'note',
      label: 'Ghi chú',
      type: 'textarea',
      editable: true,
      placeholder: 'Nhập ghi chú cho giao dịch...'
    },
  ];

  /** ✅ Add Modal Fields (Dynamic Form) */
  addFields: FieldConfig[] = [
    { key: 'packageName', label: 'Tên gói', type: 'text', required: true },
    { key: 'amountPaid', label: 'Số tiền', type: 'money', required: true },
    { key: 'purchaseDate', label: 'Ngày mua', type: 'date', required: true },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select',
      required: true,
      options: this.statusOptions.map(x => ({ label: x.label, value: x.value }))
    },
    { key: 'note', label: 'Ghi chú', type: 'textarea' },

    // ✅ upload nhiều ảnh
    {
      key: 'images',
      label: 'Ảnh giao dịch',
      type: 'images',
      required: false,
      accept: 'image/*',
      multiple: true,
      maxFiles: 10,
    },
  ];

  constructor(
      private license: LicenseService,
      private addModal: AddModalService
  ) {
    this.loadStoresFromStorage();
    this.fetch();
  }

  /** ✅ load stores + selectedStoreId from localStorage */
  loadStoresFromStorage() {
    try {
      const storesRaw = localStorage.getItem('stores');
      const selectedRaw = localStorage.getItem('selectedStoreId');

      const stores: StoreDto[] = storesRaw ? JSON.parse(storesRaw) : [];
      this.stores.set(Array.isArray(stores) ? stores : []);

      const selected = selectedRaw ? Number(selectedRaw) : null;
      const selectedId = selectedRaw && !isNaN(selected as any) ? selected : null;

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

  /** ✅ user change store */
  onStoreChange(v: any) {
    const id = Number(v);
    if (isNaN(id)) return;

    this.selectedStoreId.set(id);
    localStorage.setItem('selectedStoreId', String(id));

    // ✅ reload list
    this.page.set(0);
    this.fetch();
  }

  fetch() {
    this.loading.set(true);

    this.license
        .searchLicenseHistory({
          page: this.page(),
          size: this.pageSize(),
          keyword: this.keyword(),
          storeId: this.selectedStoreId(), // ✅ ONLY ADD THIS
        })
        .subscribe({
          next: (res: PagedResponse<LicenseHistoryEntry>) => {
            this.loading.set(false);
            this.rows.set(res.content || []);
            this.total.set(res.totalElements || 0);
          },
          error: () => {
            this.loading.set(false);
            this.rows.set([]);
            this.total.set(0);
          },
        });
  }

  onSearch(v: string) {
    this.keyword.set(v);
    this.page.set(0);
    this.fetch();
  }

  onPageChange(p: number) {
    this.page.set(p);
    this.fetch();
  }

  onSizeChange(s: number) {
    this.pageSize.set(s);
    this.page.set(0);
    this.fetch();
  }

  openDrawer(row: LicenseHistoryEntry) {
    this.currentRow.set(row);
    this.drawerOpen.set(true);
  }

  closeDrawer() {
    this.drawerOpen.set(false);
  }

  saveDrawer(patch: Partial<LicenseHistoryEntry>) {
    const row = this.currentRow();
    if (!row) return;

    this.license
        .updateLicenseHistory(row.id, {
          status: patch['status'] as string,
          note: patch['note'] as string,
        })
        .subscribe({
          next: () => {
            this.drawerOpen.set(false);
            this.fetch();
          },
        });
  }

  statusTone(status: string) {
    switch (status) {
      case 'COMPLETED':
        return 'green';
      case 'PENDING':
        return 'warn';
      case 'FAILED':
        return 'red';
      case 'CANCELLED':
        return 'gray';
      default:
        return 'blue';
    }
  }

  openAddModal() {
    const initModel = {
      purchaseDate: new Date().toISOString().slice(0, 10),
      status: 'PENDING',
      amountPaid: 0,
    };

    this.addModal
        .open('Thêm mới lịch sử license', this.addFields, initModel)
        .afterClosed()
        .subscribe((result: any) => {
          if (!result) return;

          const fd = buildFormData(result, this.addFields);

          this.loading.set(true);
          this.license.createLicenseHistory(fd).subscribe({
            next: () => {
              this.loading.set(false);
              this.fetch();
            },
            error: () => {
              this.loading.set(false);
            },
          });
        });
  }

  load() {
    this.fetch();
  }

  deleteRow(row: LicenseHistoryEntry) {
    if (!row?.id) return;

    this.loading.set(true);

    this.license.deleteLicenseHistory(row.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.rows.update((list) => list.filter((x) => x.id !== row.id));
        this.total.update((t) => Math.max(0, t - 1));
        this.selectedRows = this.selectedRows.filter((x) => x.id !== row.id);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }
}
