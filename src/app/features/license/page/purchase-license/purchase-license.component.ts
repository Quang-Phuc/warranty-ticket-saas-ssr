import {
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize } from 'rxjs/operators';

import { LicenseService, LicensePlan } from '../../data-access/license.service';

@Component({
  selector: 'app-purchase-license',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './purchase-license.component.html',
  styleUrl: './purchase-license.component.scss',
})
export class PurchaseLicenseComponent implements OnInit, OnDestroy {
  constructor(private licenseService: LicenseService) {}

  @ViewChild('pricingEl', { read: ElementRef }) pricingEl?: ElementRef;
  @ViewChild('compareEl', { read: ElementRef }) compareEl?: ElementRef;

  loading = true;
  plans: LicensePlan[] = [];

  selected = signal<LicensePlan | null>(null);

  // payment modal
  paymentOpen = false;
  generatingQr = false;
  confirming = false;

  // qr + transaction
  qrBase64 = '';
  transferContent = '';
  message = '';

  // reveal
  inView = { hero: true, pricing: false, compare: false };
  showFloatingCta = false;
  private io?: IntersectionObserver;

  compareRows = [
    { key: 'store', title: 'Số cửa hàng', desc: 'Tối đa cửa hàng có thể quản lý' },
    { key: 'user', title: 'Số user/cửa hàng', desc: 'Tối đa user cho mỗi cửa hàng' },
    { key: 'report', title: 'Báo cáo', desc: 'Thống kê KPI & xuất báo cáo' },
    { key: 'api', title: 'Tích hợp API', desc: 'Kết nối hệ thống khác' },
    { key: 'support', title: 'Hỗ trợ', desc: 'Hỗ trợ kỹ thuật ưu tiên' },
    { key: 'security', title: 'Bảo mật', desc: 'Phân quyền, audit log, SLA' },
  ];

  ngOnInit(): void {
    this.observeSections();
    this.loadPlans();
  }

  ngOnDestroy(): void {
    this.io?.disconnect();
  }

  // -----------------------------
  // LOAD PLANS
  // -----------------------------
  loadPlans() {
    this.loading = true;
    this.licenseService
      .getLicensePlans()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (plans) => {
          this.plans = (plans || []).map((p) => this.enrichUiPlan(p));
          setTimeout(() => this.computeFloatingCta(), 150);
        },
        error: () => {
          this.message = 'Không tải được danh sách gói license. Vui lòng thử lại.';
        },
      });
  }

  enrichUiPlan(plan: LicensePlan): LicensePlan {
    let features: string[] = [];
    let isPopular = false;
    let themeColor: LicensePlan['themeColor'] = 'blue';

    if (plan.name === 'TRIAL') {
      features = [
        `Quản lý ${plan.maxStore} cửa hàng`,
        `${plan.maxUserPerStore} tài khoản/cửa hàng`,
        `Dùng thử ${plan.durationDays} ngày`,
        'Hỗ trợ cơ bản',
      ];
      themeColor = 'green';
    } else if (plan.name.toLowerCase().includes('cá nhân')) {
      features = [
        `Quản lý ${plan.maxStore} cửa hàng`,
        `${plan.maxUserPerStore} tài khoản/cửa hàng`,
        'Báo cáo cơ bản',
        'Hỗ trợ Email',
      ];
      themeColor = 'blue';
    } else if (plan.name.toLowerCase().includes('chuyên')) {
      features = [
        `Quản lý ${plan.maxStore} cửa hàng`,
        `${plan.maxUserPerStore} tài khoản/cửa hàng`,
        'Báo cáo nâng cao',
        'Tích hợp API',
        'Hỗ trợ ưu tiên 24/7',
      ];
      isPopular = true;
      themeColor = 'purple';
    } else {
      features = [
        `Quản lý ${plan.maxStore} cửa hàng`,
        `${plan.maxUserPerStore} tài khoản/cửa hàng`,
        'Tùy chỉnh tính năng',
        'Server riêng',
        'Hỗ trợ chuyên dụng',
      ];
      themeColor = 'orange';
    }

    return { ...plan, features, isPopular, themeColor };
  }

  // -----------------------------
  // PRICING LOGIC
  // -----------------------------
  finalPrice(p: LicensePlan) {
    const price = Number(p.price || 0);
    const discount = Number(p.discount || 0);
    if (!discount) return price;
    return Math.round(price * (1 - discount / 100));
  }

  selectPlan(p: LicensePlan) {
    this.selected.set(p);
    this.paymentOpen = true;
    this.message = '';
    this.qrBase64 = '';
    this.transferContent = this.generateTransferContent(p);

    this.generateQr(p);
  }

  generateTransferContent(p: LicensePlan) {
    const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
    return `WPRO-${p.id}-${rand}`;
  }

  // -----------------------------
  // API FLOW
  // -----------------------------
  generateQr(p: LicensePlan) {
    this.generatingQr = true;
    this.qrBase64 = '';

    const price = this.finalPrice(p);
    const content = this.transferContent;

    this.licenseService
      .createQrCode(price, content)
      .pipe(finalize(() => (this.generatingQr = false)))
      .subscribe({
        next: (res) => {
          this.qrBase64 = res?.base64Data || '';
          if (!this.qrBase64) this.message = 'Không tạo được QR, hãy thử lại.';
        },
        error: () => {
          this.message = 'Không tạo được QR, hãy thử lại.';
        },
      });
  }

  confirmTransfer() {
    const s = this.selected();
    if (!s) return;

    this.confirming = true;
    this.message = '';

    this.licenseService
      .confirmPayment({
        licensePackageId: s.id,
        transactionCode: this.transferContent,
      })
      .pipe(finalize(() => (this.confirming = false)))
      .subscribe({
        next: (res) => {
          this.message = res?.message || '✅ Xác nhận thành công. License sẽ được kích hoạt trong vài phút.';
        },
        error: () => {
          this.message = '❌ Xác nhận thất bại. Vui lòng thử lại.';
        },
      });
  }

  closePayment() {
    this.paymentOpen = false;
    this.generatingQr = false;
    this.confirming = false;
  }

  // -----------------------------
  // COMPARE HELPERS
  // -----------------------------
  hasFeature(p: LicensePlan, key: string): string | boolean {
    switch (key) {
      case 'store':
        return `${p.maxStore}`;
      case 'user':
        return `${p.maxUserPerStore}`;
      case 'report':
        return (p.features || []).some((x) => x.toLowerCase().includes('báo cáo'));
      case 'api':
        return (p.features || []).some((x) => x.toLowerCase().includes('api'));
      case 'support':
        return (p.features || []).some((x) => x.toLowerCase().includes('hỗ trợ'));
      case 'security':
        return (p.features || []).some(
          (x) =>
            x.toLowerCase().includes('bảo mật') ||
            x.toLowerCase().includes('server riêng') ||
            x.toLowerCase().includes('sla')
        );
      default:
        return false;
    }
  }

  // -----------------------------
  // SCROLL
  // -----------------------------
  scrollToPricing() {
    this.pricingEl?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollToCompare() {
    this.compareEl?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.computeFloatingCta();
  }

  computeFloatingCta() {
    const y = window.scrollY || 0;
    this.showFloatingCta = y > 560;
  }

  // -----------------------------
  // REVEAL ANIMATION
  // -----------------------------
  observeSections() {
    this.io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const key = (e.target as HTMLElement).dataset['section'];
          if (!key) continue;
          (this.inView as any)[key] = e.isIntersecting;
        }
      },
      { threshold: 0.15 }
    );

    setTimeout(() => {
      document.querySelectorAll('.hero').forEach((el) => {
        (el as HTMLElement).dataset['section'] = 'hero';
        this.io?.observe(el);
      });

      document.querySelectorAll('section.section-soft').forEach((el) => {
        (el as HTMLElement).dataset['section'] = 'pricing';
        this.io?.observe(el);
      });

      document.querySelectorAll('section.section').forEach((el) => {
        if ((el as HTMLElement).querySelector('.compare-wrap')) {
          (el as HTMLElement).dataset['section'] = 'compare';
          this.io?.observe(el);
        }
      });
    }, 60);
  }
}
