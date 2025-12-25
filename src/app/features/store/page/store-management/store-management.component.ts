import {Component, signal} from '@angular/core';
import {CommonModule} from '@angular/common';

import {
  UiTableAction, UiTableColumn, UiTableHeaderAction, UiTableProComponent
} from '../../../../shared/ui/ui-table-pro/ui-table-pro.component';
import {
  DrawerField, DrawerOption, UiDetailDrawerComponent
} from '../../../../shared/ui/ui-detail-drawer/ui-detail-drawer.component';
import {Store, StoreService, PagedResponse} from '../../data-access/store.service';  // ✅ Thay đường dẫn phù hợp

@Component({
  selector: 'store-management',
  standalone: true,
  imports: [CommonModule, UiTableProComponent, UiDetailDrawerComponent],
  templateUrl: './store-management.component.html',
  styleUrl: './store-management.component.scss',
})
export class StoreManagementComponent {
  loading = signal(false);
  selectedRows: Store[] = [];

  rows = signal<Store[]>([]);
  total = signal(0);

  page = signal(0);
  pageSize = signal(10);

  keyword = signal('');

  currentRow = signal<Store | null>(null);
  drawerOpen = signal(false);

  /** ✅ Columns */
  columns: UiTableColumn<Store>[] = [
    {key: 'id', label: 'ID', width: '90px', sortable: true},
    {key: 'name', label: 'Tên cửa hàng', sortable: true},
    {key: 'code', label: 'Mã cửa hàng', sortable: true},
    {key: 'address', label: 'Địa chỉ'},
    {key: 'phone', label: 'Số điện thoại'},
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'badge',
      badgeTone: (row: Store) => row.status === 'ACTIVE' ? 'green' : 'gray',
    },
    {key: 'createdAt', label: 'Ngày tạo', type: 'date', sortable: true},
  ];

  /** ✅ Header Actions */
  headerActions: UiTableHeaderAction[] = [
    {
      key: 'add',
      label: 'Thêm cửa hàng',
      icon: '➕',
      tone: 'primary',
      run: () => this.addNew(),
    },
    {
      key: 'refresh',
      label: 'Tải lại',
      icon: '🔄',
      run: () => this.fetch(),
    },
  ];

  /** ✅ Row Actions - Icon trực tiếp (mobile friendly) */
  actions: UiTableAction<Store>[] = [
    {key: 'detail', label: 'Xem chi tiết', icon: '👁️', run: (row) => this.openDrawer(row)},
    {key: 'edit', label: 'Sửa', icon: '✏️', run: (row) => this.openDrawer(row)},
    {
      key: 'delete',
      label: 'Xóa',
      icon: '🗑️',
      tone: 'danger',
      confirm: {
        title: 'Xác nhận xóa',
        message: 'Bạn chắc chắn muốn xóa cửa hàng này? Dữ liệu sẽ mất vĩnh viễn.',
        okText: 'Xóa',
        cancelText: 'Hủy',
      },
      run: (row) => this.deleteRow(row),
    },
  ];

  /** ✅ Drawer config */
  statusOptions: DrawerOption[] = [
    {value: 'ACTIVE', label: 'Hoạt động'},
    {value: 'INACTIVE', label: 'Tạm dừng'},
  ];

  drawerFields = [
    { key: 'id', label: 'ID', readonly: true },                    // chỉ giữ readonly cho ID
    { key: 'name', label: 'Tên cửa hàng' },
    { key: 'code', label: 'Mã cửa hàng' },
    { key: 'address', label: 'Địa chỉ', type: 'textarea' },
    { key: 'phone', label: 'Số điện thoại' },
    {
      key: 'status',
      label: 'Trạng thái',
      type: 'select',
      options: this.statusOptions
    },
    {
      key: 'note',
      label: 'Ghi chú',
      type: 'textarea',
      placeholder: 'Ghi chú thêm...'
    },
  ] as DrawerField<Store>[];

  constructor(private storeService: StoreService) {
    this.fetch();
  }

  fetch() {
    this.loading.set(true);
    this.storeService
      .searchStores({
        page: this.page(),
        size: this.pageSize(),
        keyword: this.keyword(),
      })
      .subscribe({
        next: (res: PagedResponse<Store>) => {
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

  openDrawer(row: Store) {
    this.currentRow.set(row);
    this.drawerOpen.set(true);
  }

  closeDrawer() {
    this.drawerOpen.set(false);
    this.currentRow.set(null);
  }

  saveDrawer(patch: Partial<Store>) {
    const row = this.currentRow();
    if (!row) return;

    const isNew = row.id === null;  // ← kiểm tra id === null → là thêm mới

    const apiCall = isNew
      ? this.storeService.createStore(patch as Store)
      : this.storeService.updateStore(row.id!, patch);  // row.id! vì chắc chắn không null khi update

    apiCall.subscribe({
      next: () => {
        this.closeDrawer();
        this.fetch();
      },
    });
  }

  /** ✅ Thêm mới */
  addNew() {
    const empty: Store = {
      id: null,
      name: '',
      code: '',
      address: '',
      phone: '',
      status: 'ACTIVE',
      note: '',
      createdAt: new Date().toISOString(),
    } as any;

    this.currentRow.set(empty);
    this.drawerOpen.set(true);
  }

  /** ✅ Xóa */
  /** ✅ Xóa */
  deleteRow(row: Store) {
    if (!row?.id) return;  // ← nếu id là null hoặc undefined → không cho xóa (là row mới chưa lưu)

    this.loading.set(true);
    this.storeService.deleteStore(row.id).subscribe({
      next: () => {
        this.loading.set(false);
        this.rows.update((list) => list.filter((x) => x.id !== row.id));
        this.total.update((t) => Math.max(0, t - 1));
        this.selectedRows = this.selectedRows.filter((x) => x.id !== row.id);
      },
      error: () => this.loading.set(false),
    });
  }
}
