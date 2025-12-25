import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UiTableProComponent, UiTableColumn, UiTableAction } from '../../../../shared/ui/ui-table-pro/ui-table-pro.component';
import { UiDetailDrawerComponent, DrawerField, DrawerOption } from '../../../../shared/ui/ui-detail-drawer/ui-detail-drawer.component';
import { LicenseService, LicenseHistoryEntry, PagedResponse } from '../../data-access/license.service';

@Component({
    selector: 'license-history-user',
    standalone: true,
    imports: [CommonModule, UiTableProComponent, UiDetailDrawerComponent],
    templateUrl: './license-history-user.component.html',
    styleUrl: './license-history-user.component.scss',
})
export class LicenseHistoryUserComponent {
    loading = signal(false);

    rows = signal<LicenseHistoryEntry[]>([]);
    total = signal(0);

    page = signal(0);
    pageSize = signal(10);

    keyword = signal('');

    currentRow = signal<LicenseHistoryEntry | null>(null);
    drawerOpen = signal(false);

    /** ✅ Columns */
    columns: UiTableColumn<LicenseHistoryEntry>[] = [
        { key: 'id', label: 'ID', width: '90px', sortable: true },
        { key: 'packageName', label: 'Gói', sortable: true },
        { key: 'amountPaid', label: 'Số tiền', type: 'money', align: 'right', sortable: true },
        { key: 'purchaseDate', label: 'Ngày mua', type: 'date', sortable: true },
        {
            key: 'status',
            label: 'Trạng thái',
            type: 'badge',
            badgeTone: (row: LicenseHistoryEntry) => this.statusTone(row.status),
        },
    ];

    /** ✅ Actions */
    actions: UiTableAction<LicenseHistoryEntry>[] = [
        {
            label: 'Xem chi tiết',
            icon: '👁️',
            run: (row) => this.openDrawer(row),
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
        { key: 'note', label: 'Ghi chú', type: 'textarea', editable: true, placeholder: 'Nhập ghi chú cho giao dịch...' },
    ];

    constructor(private license: LicenseService) {
        this.fetch();
    }

    fetch() {
        this.loading.set(true);

        this.license
            .searchLicenseHistory({
                page: this.page(),
                size: this.pageSize(),
                keyword: this.keyword(),
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
            case 'COMPLETED': return 'green';
            case 'PENDING': return 'warn';
            case 'FAILED': return 'red';
            case 'CANCELLED': return 'gray';
            default: return 'blue';
        }
    }
}
