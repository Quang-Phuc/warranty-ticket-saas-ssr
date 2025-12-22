import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    standalone: true,
    imports: [CommonModule],
    templateUrl: './home.page.html',
    styleUrl: './home.page.scss'
})
export class HomePage {
    industries = [
        { icon: '📱', name: 'Điện thoại - Laptop', desc: 'Quản lý IMEI, tình trạng ngoại quan, linh kiện thay thế.' },
        { icon: '🚗', name: 'Gara Ô tô - Xe máy', desc: 'Theo dõi số KM, lịch bảo dưỡng định kỳ, vật tư phụ tùng.' },
        { icon: '❄️', name: 'Điện lạnh - Gia dụng', desc: 'Quản lý team kỹ thuật đi hiện trường, chụp ảnh nghiệm thu.' },
        { icon: '🛋️', name: 'Nội thất - Công trình', desc: 'Bảo hành theo lô sản xuất, quản lý SLA xử lý sự cố.' },
    ];
}