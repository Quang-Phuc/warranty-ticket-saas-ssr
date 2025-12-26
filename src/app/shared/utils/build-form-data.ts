import { FieldConfig } from '../ui/ui-dynamic-form/ui-dynamic-form.types';

export function buildFormData(
    model: Record<string, any>,
    fields: FieldConfig[],
    options?: { arrayKeyStyle?: 'repeat' | 'brackets' }
): FormData {
    const fd = new FormData();
    const style = options?.arrayKeyStyle || 'repeat';

    const visibleFields = fields.filter(f => (f.visible ? f.visible(model) : true));

    for (const f of visibleFields) {
        const key = String(f.key);
        const val = model?.[key];

        if (val === undefined || val === null || val === '') continue;

        // File
        if (val instanceof File) {
            fd.append(key, val);
            continue;
        }

        // File[]
        if (Array.isArray(val) && val.length && val[0] instanceof File) {
            for (const file of val as File[]) {
                fd.append(style === 'brackets' ? `${key}[]` : key, file);
            }
            continue;
        }

        // array primitive
        if (Array.isArray(val)) {
            for (const item of val) {
                fd.append(style === 'brackets' ? `${key}[]` : key, String(item));
            }
            continue;
        }

        // object
        if (typeof val === 'object') {
            fd.append(key, JSON.stringify(val));
            continue;
        }

        // primitive
        fd.append(key, String(val));
    }

    return fd;
}
