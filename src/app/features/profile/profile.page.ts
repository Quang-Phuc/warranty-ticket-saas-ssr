import { CommonModule } from '@angular/common';
import { Component, signal, OnDestroy } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import * as L from 'leaflet';

type NominatimSearchItem = {
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
export class ProfilePage implements OnDestroy {
  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      fullName: ['', Validators.required],
      email: [''],
      phone: [''],
      industry: [''],
      description: [''],
      website: [''],
      addresses: this.fb.array<FormGroup>([]),
    });
  }

  form!: FormGroup;

  saving = signal(false);
  message = signal<string | null>(null);

  avatarPreview = signal<string | null>(null);

  openedMapIndex = signal<number | null>(null);
  addressSuggestions = signal<Record<number, NominatimSearchItem[]>>({});

  maps = new Map<number, L.Map>();
  markers = new Map<number, L.Marker>();

  ngOnInit() {
    if (this.addresses().length === 0) this.addAddress();
    this.loadProfile();
  }

  ngOnDestroy() {
    this.maps.forEach((m) => m.remove());
  }

  // ===========================
  // ✅ Form helpers
  // ===========================
  addresses() {
    return this.form.get('addresses') as FormArray<FormGroup>;
  }

  addAddress() {
    this.addresses().push(
        this.fb.group({
          name: ['', Validators.required],
          address: ['', Validators.required],
          lat: [null],
          lng: [null],
        })
    );
  }

  removeAddress(i: number) {
    this.addresses().removeAt(i);
    this.maps.get(i)?.remove();
    this.maps.delete(i);
    this.markers.delete(i);
    if (this.openedMapIndex() === i) this.openedMapIndex.set(null);
  }

  initials() {
    const n = this.form.value.fullName || '';
    const parts = n.trim().split(' ').filter(Boolean);
    if (!parts.length) return 'NA';
    return (
        (parts[0][0] || '').toUpperCase() +
        (parts[parts.length - 1][0] || '').toUpperCase()
    );
  }

  // ===========================
  // ✅ Avatar upload (NO CROP)
  // ===========================
  onAvatarFileChange(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    // ✅ preview base64
    const reader = new FileReader();
    reader.onload = () => {
      this.avatarPreview.set(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  // ===========================
  // ✅ Load profile from API
  // ===========================
  loadProfile() {
    this.http.get<any>('api/me').subscribe({
      next: (res) => {
        this.form.patchValue({
          fullName: res.fullName,
          email: res.email,
          phone: res.phone,
          industry: res.industry,
          description: res.description,
          website: res.website,
        });

        this.avatarPreview.set(res.avatarUrl || null);

        this.addresses().clear();
        (res.addresses || []).forEach((a: any) => {
          this.addresses().push(
              this.fb.group({
                name: [a.name, Validators.required],
                address: [a.address, Validators.required],
                lat: [a.lat],
                lng: [a.lng],
              })
          );
        });

        if (this.addresses().length === 0) this.addAddress();
      },
    });
  }

  // ===========================
  // ✅ Address Autocomplete
  // ===========================
  async onAddressInput(i: number) {
    const group = this.addresses().at(i);
    const q = group.value.address;

    if (!q || q.length < 4) {
      this.addressSuggestions.update((s) => ({ ...s, [i]: [] }));
      return;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
        q
    )}&addressdetails=1&limit=6&accept-language=vi`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'WarrantyPro-App' },
    });

    const data = (await res.json()) as NominatimSearchItem[];
    this.addressSuggestions.update((s) => ({ ...s, [i]: data }));
  }

  selectSuggestion(i: number, s: NominatimSearchItem) {
    const group = this.addresses().at(i);

    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);

    group.patchValue({
      address: s.display_name,
      lat,
      lng,
    });

    // ✅ auto zoom map
    const map = this.maps.get(i);
    const marker = this.markers.get(i);

    if (map && marker) {
      marker.setLatLng([lat, lng]);
      map.setView([lat, lng], 16, { animate: true });
    } else {
      this.toggleMap(i);
      setTimeout(() => {
        const map2 = this.maps.get(i);
        const marker2 = this.markers.get(i);
        if (map2 && marker2) {
          marker2.setLatLng([lat, lng]);
          map2.setView([lat, lng], 16, { animate: true });
        }
      }, 450);
    }

    this.addressSuggestions.update((state) => ({ ...state, [i]: [] }));
  }

  // ===========================
  // ✅ Map + Reverse geocode
  // ===========================
  toggleMap(i: number) {
    if (this.openedMapIndex() === i) {
      this.openedMapIndex.set(null);
      return;
    }
    this.openedMapIndex.set(i);
    setTimeout(() => this.initMap(i), 60);
  }

  initMap(i: number) {
    if (this.maps.has(i)) return;

    const el = document.getElementById(`map-${i}`);
    if (!el) return;

    const group = this.addresses().at(i);
    const lat = group.value.lat ?? 10.762622;
    const lng = group.value.lng ?? 106.660172;

    const map = L.map(`map-${i}`, { zoomControl: false }).setView([lat, lng], 14);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const marker = L.marker([lat, lng], {
      draggable: true,
      icon: L.divIcon({
        className: 'marker-pin',
        html: `<div class="pin"></div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      }),
    }).addTo(map);

    const popup = L.popup();

    marker.on('dragend', async () => {
      const pos = marker.getLatLng();
      group.patchValue({ lat: pos.lat, lng: pos.lng });

      const addr = await this.reverseGeocode(pos.lat, pos.lng);
      if (addr) group.patchValue({ address: addr });

      popup.setLatLng(pos).setContent(`📍 ${addr || 'Đã chọn'}`).openOn(map);
    });

    map.on('click', async (e: any) => {
      const pos = e.latlng;

      marker.setLatLng(pos);
      group.patchValue({ lat: pos.lat, lng: pos.lng });

      const addr = await this.reverseGeocode(pos.lat, pos.lng);
      if (addr) group.patchValue({ address: addr });

      popup.setLatLng(pos).setContent(`📍 ${addr || 'Đã chọn'}`).openOn(map);

      map.setView(pos, 16, { animate: true });
    });

    this.maps.set(i, map);
    this.markers.set(i, marker);

    setTimeout(() => map.invalidateSize(), 300);
  }

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=vi`;
      const res = await fetch(url, { headers: { 'User-Agent': 'WarrantyPro-App' } });
      const data = await res.json();
      return data?.display_name || null;
    } catch {
      return null;
    }
  }

  // ===========================
  // ✅ Save profile to API (PUT /me)
  // ===========================
  save() {
    if (this.form.invalid) {
      this.message.set('❌ Vui lòng nhập đầy đủ thông tin bắt buộc.');
      return;
    }

    this.saving.set(true);
    this.message.set(null);

    const payload = {
      ...this.form.value,
      avatarBase64: this.avatarPreview(),
    };

    this.http.put('api/me', payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.message.set('✅ Lưu thành công!');
      },
      error: () => {
        this.saving.set(false);
        this.message.set('❌ Lưu thất bại. Vui lòng thử lại.');
      },
    });
  }

  reset() {
    this.loadProfile();
    this.message.set(null);
  }
}
