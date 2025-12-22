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
        {
            icon: '📱', name: 'Điện tử - High-tech',
            desc: 'Quản lý Serial/IMEI cực kỳ chính xác. Phù hợp chuỗi bán lẻ điện thoại, laptop.',
            tags: ['IMEI', 'Bảo hành điện tử', 'Linh kiện']
        },
        {
            icon: '🛠️', name: 'Điện lạnh - Gia dụng',
            desc: 'Điều phối kỹ thuật viên hiện trường. Theo dõi vị trí và ảnh nghiệm thu.',
            tags: ['Field Service', 'Vật tư', 'App thợ']
        },
        {
            icon: '🏎️', name: 'Gara & Automotive',
            desc: 'Lịch sử bảo dưỡng theo số KM. Quản lý phụ tùng thay thế và báo giá nhanh.',
            tags: ['Số KM', 'Bảo dưỡng', 'Phụ tùng']
        },
        {
            icon: '🏥', name: 'Thiết bị y tế',
            desc: 'Tuân thủ các tiêu chuẩn bảo trì định kỳ nghiêm ngặt và SLA phản hồi.',
            tags: ['SLA', 'Calibration', 'Ticket']
        },
        {
            icon: '🏢', name: 'Bảo trì tòa nhà',
            desc: 'Quản lý danh mục tài sản, thiết bị điện nước và lịch trực sự cố.',
            tags: ['Asset', 'Facility', 'Sự cố']
        },
        {
            icon: '🚲', name: 'Xe điện - E-Bike',
            desc: 'Quản lý pin, động cơ và trạm sạc bảo hành thông minh.',
            tags: ['Pin', 'Check-list', 'QR Code']
        }
    ];

    testimonials = [
        { name: 'Hoàng Nam', pos: 'Giám đốc kĩ thuật Samsung VN', content: 'Hệ thống giúp chúng tôi tối ưu 40% chi phí vận hành bảo hành trong năm đầu tiên.', avatar: 'https://i.pravatar.cc/100?img=12' },
        { name: 'Minh Thư', pos: 'Founder chuỗi sửa chữa 24h', content: 'Cực kỳ ấn tượng với tính năng Custom Fields. Tôi có thể thêm bất cứ dữ liệu gì khách hàng yêu cầu.', avatar: 'https://i.pravatar.cc/100?img=32' }
    ];
}