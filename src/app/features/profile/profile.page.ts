// src/app/features/profile/profile.page.ts
import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, map, Subject, switchMap, takeUntil, tap } from 'rxjs';

import * as L from 'leaflet';
import { ApiClient } from '../../core/http/api-client';
import { AuthService } from '../../core/auth/auth.service';

type Suggestion = {
  display_name: string;
  lat: string;
  lon: string;
};

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.page.html',
  styleUrl: './profile.page.scss',
})
export class ProfilePage implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  saving = signal(false);
  message = signal<string | null>(null);

  gettingLocation = signal<number | null>(null);
  openedMapIndex = signal<number | null>(null);

  avatarPreview = signal<string | null>(null);

  maps = new Map<number, L.Map>();
  markers = new Map<number, L.Marker>();

  suggestions = signal<Record<number, Suggestion[]>>({});
  loadingSuggest = signal<number | null>(null);

  form: FormGroup;

  constructor(
      private fb: FormBuilder,
      private api: ApiClient,
      private auth: AuthService
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required]],
      phone: ['', [Validators.required]], // ✅ readonly in html
      email: ['', [Validators.email]],
      description: [''],
      avatarFile: [null],
      addresses: this.fb.array([]),
    });
  }

  ngOnInit(): void {
    this.loadAuthUser();
    this.ensureOneAddress();
    this.setupAddressSearchStreams();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.maps.forEach((m) => m.remove());
  }

  // =========================
  // ✅ getters
  // =========================
  addresses(): FormArray<FormGroup> {
    return this.form.get('addresses') as FormArray<FormGroup>;
  }

  // =========================
  // ✅ init
  // =========================
  loadAuthUser() {
    const user = this.auth.getCurrentUserSync();

    this.form.patchValue({
      fullName: user?.fullName ?? '',
      phone: user?.username ?? '',
      email: '',
      description: '',
    });
  }

  ensureOneAddress() {
    if (this.addresses().length === 0) this.addAddress();
  }

  addAddress() {
    this.addresses().push(
        this.fb.group({
          label: ['Cửa hàng', Validators.required], // ✅ bỏ "Địa chỉ chính"
          address: ['', Validators.required],
          lat: [null],
          lng: [null],
        })
    );
  }

  removeAddress(i: number) {
    this.addresses().removeAt(i);
    const s = { ...this.suggestions() };
    delete s[i];
    this.suggestions.set(s);
  }

  // =========================
  // ✅ avatar
  // =========================
  onAvatarFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.message.set('❌ File không phải ảnh.');
      return;
    }

    this.form.patchValue({ avatarFile: file });

    const reader = new FileReader();
    reader.onload = () => this.avatarPreview.set(reader.result as string);
    reader.readAsDataURL(file);
  }

  initials() {
    const name = this.form.value.fullName || '';
    const parts = name.trim().split(' ').filter(Boolean);
    const a = parts[0]?.[0] ?? 'U';
    const b = parts.length > 1 ? parts[parts.length - 1][0] : '';
    return (a + b).toUpperCase();
  }

  // =========================
  // ✅ Focus invalid field (FIX)
  // =========================
  focusFirstInvalid() {
    // 1) priority fields
    const priority = ['fullName', 'phone', 'email', 'description'];

    for (const key of priority) {
      const c = this.form.get(key);
      if (c && c.invalid) {
        const el = document.querySelector(`[formControlName="${key}"]`) as HTMLElement;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (el as HTMLInputElement).focus();
          return;
        }
      }
    }

    // 2) addresses array
    for (let i = 0; i < this.addresses().length; i++) {
      const g = this.addresses().at(i);
      const label = g.get('label');
      const address = g.get('address');

      if (label?.invalid) {
        const el = document.querySelector(`#address-${i}-label`) as HTMLElement;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (el as HTMLInputElement).focus();
          return;
        }
      }

      if (address?.invalid) {
        const el = document.querySelector(`#address-${i}-address`) as HTMLElement;
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          (el as HTMLInputElement).focus();
          return;
        }
      }
    }
  }

  // =========================
  // ✅ save
  // =========================
  save() {
    this.message.set(null);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.focusFirstInvalid();
      this.message.set('❌ Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }

    this.saving.set(true);

    const payload: any = {
      fullName: this.form.value.fullName,
      phone: this.form.value.phone,
      email: this.form.value.email,
      description: this.form.value.description,
      addresses: this.form.value.addresses,
    };

    if (this.avatarPreview()) payload.avatarBase64 = this.avatarPreview();

    this.api
        .putData<any>('me', payload)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.message.set('✅ Lưu thông tin thành công!');
            this.saving.set(false);
          },
          error: () => {
            this.message.set('❌ Lưu thất bại, thử lại.');
            this.saving.set(false);
          },
        });
  }

  reset() {
    this.form.reset();
    this.loadAuthUser();
    this.addresses().clear();
    this.ensureOneAddress();
    this.avatarPreview.set(null);
    this.message.set(null);
  }

  // =========================
  // ✅ MAP logic giữ nguyên
  // =========================
  toggleMap(i: number) {
    if (this.openedMapIndex() === i) {
      this.openedMapIndex.set(null);
      return;
    }

    this.openedMapIndex.set(i);
    setTimeout(() => this.initLeaflet(i), 200);
  }

  initLeaflet(i: number) {
    if (this.maps.has(i)) {
      this.maps.get(i)!.invalidateSize();
      return;
    }

    const group = this.addresses().at(i);
    const lat = group.value.lat ?? 21.028511;
    const lng = group.value.lng ?? 105.804817;

    const mapEl = document.getElementById(`map-${i}`);
    if (!mapEl) return;

    const map = L.map(mapEl, { zoomControl: false }).setView([lat, lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    marker.bindPopup('📍 Kéo hoặc click map để chọn vị trí');

    map.on('click', async (e: any) => {
      const lat = e.latlng.lat;
      const lng = e.latlng.lng;
      group.patchValue({ lat, lng, address: '⏳ Đang lấy địa chỉ...' });
      await this.setMarkerAndFillAddress(i, lat, lng, true);
    });

    marker.on('dragend', async (ev: any) => {
      const pos = ev.target.getLatLng();
      group.patchValue({ lat: pos.lat, lng: pos.lng, address: '⏳ Đang lấy địa chỉ...' });
      await this.setMarkerAndFillAddress(i, pos.lat, pos.lng, true);
    });

    this.maps.set(i, map);
    this.markers.set(i, marker);
  }

  async setMarkerAndFillAddress(i: number, lat: number, lng: number, openPopup = false) {
    const group = this.addresses().at(i);
    const map = this.maps.get(i);
    const marker = this.markers.get(i);
    if (!map || !marker) return;

    marker.setLatLng([lat, lng]);
    map.setView([lat, lng], 16, { animate: true });

    if (openPopup) marker.openPopup();

    const addr = await this.reverseGeocode(lat, lng);

    if (addr) {
      group.patchValue({ address: addr });
      if (openPopup) marker.setPopupContent(`✅ Vị trí chọn<br>${addr}`).openPopup();
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const res = await fetch(url);
      const json = await res.json();
      return json?.display_name ?? null;
    } catch {
      return null;
    }
  }

  // ✅ GPS
  useCurrentLocation(i: number) {
    if (!navigator.geolocation) {
      this.message.set('❌ Trình duyệt không hỗ trợ GPS.');
      return;
    }

    if (this.openedMapIndex() !== i) {
      this.toggleMap(i);
      setTimeout(() => this.useCurrentLocation(i), 250);
      return;
    }

    this.gettingLocation.set(i);

    navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;

          const group = this.addresses().at(i);
          group.patchValue({ lat, lng, address: '⏳ Đang lấy địa chỉ...' });

          await this.setMarkerAndFillAddress(i, lat, lng, true);
          this.gettingLocation.set(null);
        },
        () => {
          this.message.set('❌ Không thể lấy vị trí hiện tại.');
          this.gettingLocation.set(null);
        },
        { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  }

  // ✅ Autocomplete
  private search$ = new Subject<{ i: number; q: string }>();

  setupAddressSearchStreams() {
    this.search$
        .pipe(
            debounceTime(450),
            map((x) => ({ ...x, q: x.q.trim() })),
            filter((x) => x.q.length >= 3),
            distinctUntilChanged((a, b) => a.q === b.q),
            tap((x) => this.loadingSuggest.set(x.i)),
            switchMap(({ i, q }) =>
                fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`)
                    .then((r) => r.json())
                    .then((list: Suggestion[]) => ({ i, list }))
            ),
            takeUntil(this.destroy$)
        )
        .subscribe({
          next: ({ i, list }) => {
            const s = { ...this.suggestions() };
            s[i] = list;
            this.suggestions.set(s);
            this.loadingSuggest.set(null);
          },
          error: () => this.loadingSuggest.set(null),
        });
  }

  onAddressTyping(i: number) {
    const group = this.addresses().at(i);
    const q = group.value.address || '';

    if (q.trim().length < 3) {
      const s = { ...this.suggestions() };
      s[i] = [];
      this.suggestions.set(s);
      return;
    }

    this.search$.next({ i, q });
  }

  selectSuggestion(i: number, sug: Suggestion) {
    const group = this.addresses().at(i);
    const lat = parseFloat(sug.lat);
    const lng = parseFloat(sug.lon);

    group.patchValue({ address: sug.display_name, lat, lng });

    const s = { ...this.suggestions() };
    s[i] = [];
    this.suggestions.set(s);

    if (this.openedMapIndex() !== i) this.toggleMap(i);

    setTimeout(() => this.setMarkerAndFillAddress(i, lat, lng, true), 350);
  }
}
