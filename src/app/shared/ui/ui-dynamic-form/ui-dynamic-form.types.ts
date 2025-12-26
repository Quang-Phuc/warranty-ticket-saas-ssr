export type FieldType =
    | 'text'
    | 'number'
    | 'money'     // ✅ ADD
    | 'textarea'
    | 'select'
    | 'date'
    | 'checkbox'
    | 'switch'
    | 'image'
    | 'images'
    | 'file'
    | 'files';


export interface FieldOption {
  label: string;
  value: any;
}

export interface FieldConfig<T = any> {
  key: string;
  label: string;
  type: FieldType;

  placeholder?: string;
  required?: boolean;

  visible?: (model: any) => boolean;
  disabled?: (model: any) => boolean;

  options?: FieldOption[];

  accept?: string;
  multiple?: boolean;
  maxFiles?: number;

  validator?: (value: any, model: any) => string | null;
}
