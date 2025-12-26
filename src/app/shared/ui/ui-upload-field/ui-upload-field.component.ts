import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ui-upload-field',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule],
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

  /** ✅ single file getter (avoid template type casting) */
  singleFile = computed(() => {
    const v = this.value();
    return v instanceof File ? v : null;
  });

  /** ✅ multi files getter (avoid template type casting) */
  multiFiles = computed(() => {
    const v = this.value();
    return Array.isArray(v) ? (v as File[]) : [];
  });

  onPick(inputEl: HTMLInputElement) {
    const files = Array.from(inputEl.files || []);
    inputEl.value = '';

    const mode = this.mode();

    if (mode === 'file' || mode === 'image') {
      const file = files[0] || null;
      this.valueChange.emit(file);
      this.buildPreview(file ? [file] : []);
      return;
    }

    this.valueChange.emit(files);
    this.buildPreview(files);
  }

  removeAt(i: number) {
    const v = this.value();
    const mode = this.mode();

    if (!v) return;

    if (mode === 'file' || mode === 'image') {
      this.valueChange.emit(null);
      this.previews.set([]);
      return;
    }

    const arr = Array.isArray(v) ? [...v] : [];
    arr.splice(i, 1);
    this.valueChange.emit(arr.length ? arr : null);

    const pv = [...this.previews()];
    pv.splice(i, 1);
    this.previews.set(pv);
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
