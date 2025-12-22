import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
    Component,
    ElementRef,
    Inject,
    PLATFORM_ID,
    ViewChild,
    AfterViewInit,
    OnDestroy,
    HostListener
} from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './home.page.html',
    styleUrl: './home.page.scss'
})
export class HomePage implements AfterViewInit, OnDestroy {
    @ViewChild('testiRow') testiRow?: ElementRef<HTMLDivElement>;

    navScrolled = false;
    scrollProgress = 0;
    showFloatingCta = false;

    private io?: IntersectionObserver;
    private rafId: number | null = null;
    private isBrowser = false;

    constructor(@Inject(PLATFORM_ID) platformId: object) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    // Data nội dung (m có thể thay dễ)
    features = [
        {
            icon: '🧾',
            title: 'Ticket chuẩn hoá quy trình',
            desc: 'Từ tiếp nhận → chẩn đoán → báo giá → sửa → bàn giao trong 1 timeline.',
            bullets: ['Trạng thái linh hoạt', 'Timeline + log đầy đủ', 'Gán kỹ thuật viên & SLA']
        },
        {
            icon: '🔖',
            title: 'Bảo hành điện tử & QR',
            desc: 'Kích hoạt bảo hành theo serial/IMEI/QR. Khách tự tra cứu nhanh.',
            bullets: ['Chính sách theo thời hạn', 'Tra cứu bằng QR/điện thoại', 'Lịch sử sửa chữa']
        },
        {
            icon: '📷',
            title: 'Chống tranh chấp',
            desc: 'Bằng chứng ảnh before/after + checklist phụ kiện + ký nhận bàn giao.',
            bullets: ['Ảnh tự chụp trên mobile', 'Checklist nhận/trả', 'Audit log rõ ràng']
        },
        {
            icon: '💬',
            title: 'Thông báo cho khách',
            desc: 'Gửi thông báo theo trạng thái: đã nhận, báo giá, xong, nhắc nhận máy.',
            bullets: ['Template sẵn', 'Log gửi/nhận', 'Giảm khách hỏi tiến độ']
        },
        {
            icon: '⚙️',
            title: 'Workflow & Custom Fields',
            desc: 'Tùy biến theo từng ngành, không hard-code.',
            bullets: ['State machine linh hoạt', 'Field bắt buộc theo trạng thái', 'Phân quyền role/branch']
        },
        {
            icon: '📊',
            title: 'Báo cáo vận hành',
            desc: 'Xem backlog, SLA, thời gian xử lý, lỗi phổ biến, hiệu suất kỹ thuật.',
            bullets: ['Dashboard theo ngày', 'Xuất Excel/CSV', 'Theo chi nhánh/user']
        }
    ];

    steps = [
        {
            title: 'Tiếp nhận nhanh (≤ 60s)',
            desc: 'Tạo ticket + chụp ảnh + ghi phụ kiện. Dán QR ticket lên sản phẩm.'
        },
        {
            title: 'Báo giá & duyệt rõ ràng',
            desc: 'Tạo báo giá theo hạng mục. Lưu log duyệt – tránh hiểu nhầm.'
        },
        {
            title: 'Hoàn tất & bàn giao',
            desc: 'Ảnh sau sửa + checklist trả đồ + ký nhận. Khách tra cứu lịch sử sau này.'
        }
    ];

    industries = [
        { icon: '📱', name: 'Điện thoại/Laptop', desc: 'IMEI/Serial, timeline sửa, báo giá rõ ràng.' },
        { icon: '🧊', name: 'Điện máy gia dụng', desc: 'Hẹn lịch, onsite, thay linh kiện, bảo hành phần.' },
        { icon: '🏍️', name: 'Gara xe máy/ô tô', desc: 'Bảo dưỡng định kỳ, phụ tùng, lịch sử theo xe.' },
        { icon: '🖨️', name: 'Thiết bị POS/Printer', desc: 'Asset tag, SLA, tracking theo khách/điểm bán.' },
        { icon: '🏭', name: 'Thiết bị công nghiệp', desc: 'Work order, downtime, bảo trì, vật tư.' },
        { icon: '🧑‍💻', name: 'IT Service', desc: 'Triage, SLA, chờ khách, log minh bạch.' },
        { icon: '🪑', name: 'Nội thất/Lắp đặt', desc: 'Bảo hành, lắp đặt, bảo trì theo hẹn.' },
        { icon: '🧪', name: 'Thiết bị chuyên dụng', desc: 'Quy trình tùy biến + phân quyền dữ liệu.' }
    ];

    testimonials = [
        {
            name: 'Anh Tuấn',
            pos: 'Chủ tiệm sửa điện thoại',
            content: 'Giảm hẳn khách hỏi “xong chưa”. Có ảnh before/after nên hết cãi vã.',
            avatar: 'https://i.pravatar.cc/100?img=12'
        },
        {
            name: 'Chị Linh',
            pos: 'Quản lý chuỗi 5 chi nhánh',
            content: 'Tự động hóa quy trình và báo cáo rõ. Nhìn backlog là biết nghẽn ở đâu.',
            avatar: 'https://i.pravatar.cc/100?img=32'
        },
        {
            name: 'Anh Minh',
            pos: 'Gara xe máy',
            content: 'Lịch sử thay phụ tùng + checklist bàn giao giúp làm việc chuyên nghiệp hơn.',
            avatar: 'https://i.pravatar.cc/100?img=7'
        },
        {
            name: 'Chị Hương',
            pos: 'Điện máy gia dụng',
            content: 'Hẹn lịch onsite và theo dõi tiến độ tốt. Khách tự tra cứu nên đỡ gọi hỏi.',
            avatar: 'https://i.pravatar.cc/100?img=45'
        }
    ];

    plans = [
        {
            name: 'Starter',
            price: '199k',
            sub: 'Phù hợp tiệm nhỏ bắt đầu chuẩn hóa vận hành.',
            popular: false,
            items: ['1 chi nhánh', '2 user', '100 ticket/tháng', 'QR bảo hành + portal tra cứu', 'Ảnh before/after']
        },
        {
            name: 'Pro',
            price: '499k',
            sub: 'Dùng ổn định – nhiều ticket – cần báo cáo rõ.',
            popular: true,
            items: ['3 chi nhánh', '10 user', '500 ticket/tháng', 'Báo giá + log duyệt', 'Báo cáo nâng cao', 'Template thông báo']
        },
        {
            name: 'Business',
            price: '999k',
            sub: 'Chuỗi/đơn vị vận hành nặng – cần tuỳ biến.',
            popular: false,
            items: ['Nhiều chi nhánh', 'Không giới hạn ticket', 'RBAC + phân quyền', 'Workflow/field tuỳ biến', 'Xuất dữ liệu, API (tuỳ chọn)']
        }
    ];

    faqs = [
        { q: 'Dùng thử miễn phí có cần thẻ không?', a: 'Không. Mày dùng thử 14 ngày, không cần thẻ và có thể hủy bất kỳ lúc nào.' },
        { q: 'Có dùng được trên điện thoại không?', a: 'Có. UI mobile-first để chụp ảnh, tạo ticket, cập nhật trạng thái nhanh.' },
        { q: 'Có tuỳ biến theo ngành không?', a: 'Có. Workflow + custom field giúp map đúng quy trình từng ngành.' },
        { q: 'Khách có tra cứu được tiến độ không?', a: 'Có. Portal cho khách tra cứu bảo hành và tiến độ ticket theo mã/QR.' }
    ];

    ngAfterViewInit(): void {
        if (!this.isBrowser) return;

        // Scroll reveal
        const els = Array.from(document.querySelectorAll('.reveal')) as HTMLElement[];
        this.io = new IntersectionObserver(
            (entries) => {
                for (const e of entries) {
                    if (e.isIntersecting) {
                        (e.target as HTMLElement).classList.add('in-view');
                        this.io?.unobserve(e.target);
                    }
                }
            },
            { threshold: 0.12 }
        );
        els.forEach((el) => this.io?.observe(el));

        // Init scroll metrics once
        this.onScroll();

        // Click ripple origin for buttons
        document.addEventListener('pointerdown', this.setRippleOrigin, { passive: true });
    }

    ngOnDestroy(): void {
        this.io?.disconnect();
        if (this.isBrowser) document.removeEventListener('pointerdown', this.setRippleOrigin as any);
        if (this.rafId) cancelAnimationFrame(this.rafId);
    }

    // Scroll metrics (nav state + progress + floating CTA)
    @HostListener('window:scroll')
    onScroll(): void {
        if (!this.isBrowser) return;

        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.rafId = requestAnimationFrame(() => {
            const y = window.scrollY || 0;
            this.navScrolled = y > 10;

            const doc = document.documentElement;
            const max = Math.max(1, doc.scrollHeight - doc.clientHeight);
            this.scrollProgress = Math.min(100, Math.max(0, (y / max) * 100));

            // show floating CTA after passing hero
            this.showFloatingCta = y > 520;
        });
    }

    // Smooth scroll for anchor links
    smoothScroll(evt: Event): void {
        if (!this.isBrowser) return;
        evt.preventDefault();

        const a = evt.currentTarget as HTMLAnchorElement;
        const id = a.getAttribute('href')?.replace('#', '');
        if (!id) return;

        const el = document.getElementById(id);
        if (!el) return;

        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    scrollToTop(evt: Event): void {
        if (!this.isBrowser) return;
        evt.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // testimonials horizontal scroll
    scrollTesti(dir: number): void {
        if (!this.isBrowser) return;
        const el = this.testiRow?.nativeElement;
        if (!el) return;
        el.scrollBy({ left: dir * 360, behavior: 'smooth' });
    }

    // make CTA pop a little on click
    pulseCta(): void {
        // placeholder hook (m có thể add tracking sau)
    }

    // set CSS vars for ripple origin
    private setRippleOrigin = (e: PointerEvent) => {
        const t = e.target as HTMLElement | null;
        if (!t) return;
        const btn = t.closest('button, a') as HTMLElement | null;
        if (!btn) return;

        const r = btn.getBoundingClientRect();
        const rx = ((e.clientX - r.left) / r.width) * 100;
        const ry = ((e.clientY - r.top) / r.height) * 100;
        btn.style.setProperty('--rx', `${rx}%`);
        btn.style.setProperty('--ry', `${ry}%`);
    };
}
