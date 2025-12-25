import { Component, input, output, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/** ✅ EXPORT type để component khác import */
export type DrawerFieldType = 'text' | 'textarea' | 'select' | 'date' | 'money' | 'badge';
export type DrawerTone = 'default' | 'danger' | 'success' | 'warn';

export interface DrawerOption {
    value: any;
    label: string;
}

export interface DrawerField<T = any> {
    key: keyof T | string;
    label: string;
    type?: DrawerFieldType;
    editable?: boolean;
    placeholder?: string;
    options?: DrawerOption[];  // select
    badgeTone?: (row: T) => string;
    value?: (row: T) => any;
}

@Component({
    selector: 'ui-detail-drawer',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './ui-detail-drawer.component.html',
    styleUrl: './ui-detail-drawer.component.scss',
})
export class UiDetailDrawerComponent<T = any> {
    open = input<boolean>(false);
    title = input<string>('Chi tiết');
    row = input<T | null>(null);
    fields = input<DrawerField<T>[]>([]);
    statusOptions = input<DrawerOption[]>([]);

    close = output<void>();
    save = output<Partial<T>>();

    editMode = signal(false);
    saving = signal(false);

    draft = signal<Record<string, any>>({});

    constructor() {
        effect(() => {
            if (this.row()) {
                const r: any = this.row();
                const init: Record<string, any> = {};
                this.fields().forEach((f) => {
                    init[this.keyToString(f.key)] = f.value ? f.value(r) : r?.[f.key as any];
                });
                this.draft.set(init);
            }
        });

        effect(() => {
            if (!this.open()) {
                this.editMode.set(false);
            }
        });
    }

    keyToString(k: any) {
        return `${k}`;
    }

    getVal(f: DrawerField<T>) {
        const key = this.keyToString(f.key);
        return this.draft()[key];
    }

    patch(key: string, val: any) {
        this.draft.set({ ...this.draft(), [key]: val });
    }

    onClose() {
        this.close.emit();
    }

    toggleEdit() {
        this.editMode.set(!this.editMode());
    }

    onSave() {
        this.saving.set(true);

        // emit patch only editable fields
        const patch: any = {};
        this.fields().forEach((f) => {
            if (f.editable) {
                const key = this.keyToString(f.key);
                patch[key] = this.draft()[key];
            }
        });

        this.save.emit(patch);
        this.saving.set(false);
        this.editMode.set(false);
    }
}
