import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ui-upload-field',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ui-upload-field.component.html',
  styleUrl: './ui-upload-field.component.scss',
})
export class UiUploadFieldComponent {
  mode = input<'file' | 'files' | 'image' | 'images'>('file');
  accept = input<string>('*/*');
  disabled = input<boolean>(false);

  value = input<File | File[] | null>(null);
  valueChange = output<File | File[] | null>();

  previews = signal<string[]>([]);

  singleFile = computed(() => {
    const v = this.value();
    return v instanceof File ? v : null;
  });

  multiFiles = computed(() => {
    const v = this.value();
    return Array.isArray(v) ? (v as File[]) : [];
  });

  onPick(inputEl: HTMLInputElement) {
    const files = Array.from(inputEl.files || []);
    inputEl.value = '';

    const mode = this.mode();

    // ✅ single
    if (mode === 'file' || mode === 'image') {
      const file = files[0] || null;
      this.valueChange.emit(file);
      this.buildPreview(file ? [file] : []);
      return;
    }

    // ✅ multi => append
    const current = this.multiFiles();
    const next = [...current, ...files];

    this.valueChange.emit(next.length ? next : null);
    this.buildPreview(next);
  }

  removeAt(i: number) {
    const mode = this.mode();

    if (mode === 'file' || mode === 'image') {
      this.valueChange.emit(null);
      this.previews.set([]);
      return;
    }

    const arr = [...this.multiFiles()];
    arr.splice(i, 1);

    this.valueChange.emit(arr.length ? arr : null);
    this.buildPreview(arr);
  }

  private buildPreview(files: File[]) {
    const mode = this.mode();

    if (mode !== 'image' && mode !== 'images') {
      this.previews.set([]);
      return;
    }

    const readers = files.map(
        f =>
            new Promise<string>(resolve => {
              const r = new FileReader();
              r.onload = () => resolve(r.result as string);
              r.readAsDataURL(f);
            })
    );

    Promise.all(readers).then(urls => this.previews.set(urls));
  }
}
