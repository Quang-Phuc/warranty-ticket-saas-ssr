import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    UiTableProComponent,
    UiTableColumn,
    UiTableHeaderAction,
} from '../../../../shared/ui/ui-table-pro/ui-table-pro.component';
import { MatDialog } from '@angular/material/dialog';
import { UiFormModalComponent } from '../../../../shared/ui/ui-form-modal/ui-form-modal.component';
import { FieldConfig } from '../../../../shared/ui/ui-dynamic-form/ui-dynamic-form.types';
import { buildFormData } from '../../../../shared/utils/build-form-data';
import { UserService, UserDto } from '../../data-access/user.service';

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, UiTableProComponent],
    templateUrl: './user-management.component.html',
    styleUrl: './user-management.component.scss',
})
export class UserManagementComponent {
    loading = signal(false);

    rows = signal<UserDto[]>([]);
    total = signal(0);

    page = signal(0);
    pageSize = signal(10);
    search = signal('');

    /** ✅ columns */
    columns: UiTableColumn<UserDto>[] = [
        { key: 'id', label: 'ID', width: '80px', sortable: true },
        { key: 'username', label: 'Tài khoản', sortable: true },
        { key: 'fullName', label: 'Họ tên' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'SĐT' },
        { key: 'role', label: 'Quyền' },
        { key: 'status', label: 'Trạng thái' },
    ];

    /** ✅ header actions */
    headerActions: UiTableHeaderAction[] = [
        {
            key: 'add',
            label: 'Thêm mới',
            icon: 'add',
            tone: 'primary',
            run: () => this.openAdd(),
        },
        {
            key: 'reload',
            label: 'Tải lại',
            icon: 'refresh',
            run: () => this.load(),
        },
    ];

    /** ✅ Add User fields */
    addFields: FieldConfig[] = [
        {
            key: 'username',
            label: 'Tài khoản',
            type: 'text',
            required: true,
            placeholder: 'Nhập username',
        },
        {
            key: 'fullName',
            label: 'Họ tên',
            type: 'text',
            required: true,
            placeholder: 'Nhập họ tên',
        },
        { key: 'email', label: 'Email', type: 'text', placeholder: 'abc@gmail.com' },
        { key: 'phone', label: 'SĐT', type: 'text', placeholder: '0987...' },

        {
            key: 'role',
            label: 'Quyền',
            type: 'select',
            required: true,
            options: [
                { label: 'Admin', value: 'ADMIN' },
                { label: 'Nhân viên', value: 'STAFF' },
                { label: 'Khách', value: 'USER' },
            ],
        },

        {
            key: 'status',
            label: 'Trạng thái',
            type: 'select',
            required: true,
            options: [
                { label: 'Hoạt động', value: 'ACTIVE' },
                { label: 'Khoá', value: 'LOCKED' },
            ],
        },

        // ✅ upload avatar
        {
            key: 'avatar',
            label: 'Avatar',
            type: 'image',
            accept: 'image/*',
            multiple: false,
            maxFiles: 1,
        },

        // ✅ upload tài liệu (nhiều file)
        {
            key: 'documents',
            label: 'Tài liệu (nhiều file)',
            type: 'files',
            accept: '*/*',
            multiple: true,
            maxFiles: 10,
        },
    ];

    constructor(private users: UserService, private dialog: MatDialog) {
        // ✅ load 1 lần khi init
        this.load();
    }

    /** ✅ load list */
    load() {
        this.loading.set(true);

        this.users
            .list({
                page: this.page(),
                size: this.pageSize(),
                q: this.search(),
            })
            .subscribe({
                next: (res) => {
                    this.rows.set(res.items || []);
                    this.total.set(res.total || 0);
                    this.loading.set(false);
                },
                error: (err) => {
                    console.error(err);
                    this.loading.set(false);
                },
            });
    }

    /** ✅ open modal add */
    openAdd() {
        const ref = this.dialog.open(UiFormModalComponent, {
            panelClass: 'ui-form-modal-panel',
            width: '1100px',
            maxWidth: '96vw',
            data: {
                title: 'Thêm mới user',
                fields: this.addFields,
                initModel: {
                    status: 'ACTIVE',
                    role: 'USER',
                },
            },
        });

        ref.afterClosed().subscribe((result) => {
            if (!result) return;

            const fd = buildFormData(result, this.addFields);

            this.users.createMultipart(fd).subscribe({
                next: () => this.load(),
                error: (err) => console.error(err),
            });
        });
    }

    /** ✅ search */
    onSearchChange(v: string) {
        this.search.set(v);
        this.page.set(0);
        this.load();
    }

    /** ✅ paging */
    onPageChange(p: number) {
        this.page.set(p);
        this.load();
    }

    onPageSizeChange(sz: number) {
        this.pageSize.set(sz);
        this.page.set(0);
        this.load();
    }
}
