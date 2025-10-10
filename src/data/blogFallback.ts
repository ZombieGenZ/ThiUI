import type { Database } from '../lib/supabase';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];

export const blogPostsFallback: BlogPost[] = [
  {
    id: 'f1dd01fa-558c-4e76-9f05-5f9d2fe4c1a1',
    title: '5 xu hướng nội thất nổi bật cho không gian sống hiện đại năm 2024',
    slug: '5-xu-huong-noi-that-2024',
    excerpt:
      'Khám phá những xu hướng nội thất dẫn đầu năm 2024 giúp bạn làm mới tổ ấm với phong cách tối giản, bền vững và giàu cảm hứng.',
    content:
      '## Tối giản nhưng tinh tế\nKhông gian sống tối giản tiếp tục được yêu thích nhờ khả năng mang lại cảm giác gọn gàng, thư thái. Sử dụng các gam màu trung tính, nhấn nhá bằng chất liệu tự nhiên giúp tổng thể hài hòa.\n\n## Vật liệu thân thiện môi trường\nNgười tiêu dùng ngày càng quan tâm đến sự bền vững. Các vật liệu tái chế, gỗ FSC và vải hữu cơ được ưu tiên để bảo vệ môi trường nhưng vẫn đảm bảo thẩm mỹ.\n\n## Công nghệ thông minh trong nội thất\nThiết bị thông minh tích hợp trong đồ nội thất giúp nâng cao trải nghiệm sống. Từ hệ thống chiếu sáng điều khiển tự động đến nội thất đa năng đều mang tới sự tiện nghi.\n\n## Nghệ thuật cá nhân hóa\nTrang trí bằng những món đồ mang dấu ấn cá nhân giúp không gian trở nên độc đáo. Hãy thử kết hợp tranh nghệ thuật, đồ thủ công hoặc kỷ vật gia đình.\n\n## Không gian xanh trong nhà\nCây xanh tiếp tục là điểm nhấn giúp thanh lọc không khí và tạo cảm giác thư thái. Những góc vườn mini hoặc chậu cây treo mang đến sức sống cho căn nhà.',
    featured_image_url: 'https://images.pexels.com/photos/8136914/pexels-photo-8136914.jpeg?auto=compress&cs=tinysrgb&w=1600',
    author: 'Thi Interior Studio',
    published_at: '2024-03-18T08:00:00Z',
    created_at: '2024-03-18T08:00:00Z',
    updated_at: '2024-03-18T08:00:00Z',
  },
  {
    id: 'd8c3f830-08a8-4d8d-9cf9-94bf9961eb52',
    title: 'Bí quyết chọn sofa phù hợp với từng diện tích phòng khách',
    slug: 'bi-quyet-chon-sofa-cho-phong-khach',
    excerpt:
      'Sofa là món nội thất trung tâm của phòng khách. Cùng ZShop tìm hiểu cách lựa chọn kích thước, chất liệu và màu sắc phù hợp với diện tích nhà bạn.',
    content:
      '## Đo đạc không gian chính xác\nTrước khi chọn sofa, hãy đo diện tích phòng khách và vị trí đặt sofa để đảm bảo kích thước hài hòa. Đừng quên tính toán lối đi và các khu vực sinh hoạt khác.\n\n## Chọn kiểu dáng theo công năng\nNếu thường xuyên đón khách, sofa chữ L hoặc sofa giường là lựa chọn hợp lý. Với phòng khách nhỏ, sofa hai chỗ kết hợp ghế đôn sẽ tối ưu diện tích.\n\n## Chất liệu và màu sắc\nVải linen, cotton phù hợp với phong cách hiện đại, trong khi da mang lại vẻ sang trọng. Hãy ưu tiên gam màu trung tính và phối với gối tựa nhiều màu sắc.\n\n## Phối hợp với nội thất xung quanh\nSofa cần hài hòa với bàn trà, kệ tivi và đèn chiếu sáng. Đừng quên tạo điểm nhấn bằng thảm trải sàn hoặc tranh treo tường.',
    featured_image_url: 'https://images.pexels.com/photos/276554/pexels-photo-276554.jpeg?auto=compress&cs=tinysrgb&w=1600',
    author: 'Thi Interior Studio',
    published_at: '2024-03-12T08:00:00Z',
    created_at: '2024-03-12T08:00:00Z',
    updated_at: '2024-03-12T08:00:00Z',
  },
  {
    id: 'bb20612b-71f0-4a77-91c8-fd0566f6cb99',
    title: 'Tạo góc làm việc tại nhà tối ưu năng suất và cảm hứng',
    slug: 'goc-lam-viec-tai-nha-toi-uu',
    excerpt:
      'Một góc làm việc khoa học sẽ giúp bạn tập trung và sáng tạo hơn. Tham khảo các gợi ý bố trí nội thất, ánh sáng và màu sắc từ chuyên gia ZShop.',
    content:
      '## Ưu tiên ánh sáng tự nhiên\nĐặt bàn làm việc gần cửa sổ để tận dụng ánh sáng tự nhiên, giúp tinh thần luôn tỉnh táo. Có thể kết hợp rèm mỏng để điều chỉnh ánh sáng.\n\n## Lựa chọn bàn ghế ergonomic\nGhế có khả năng điều chỉnh độ cao và tựa lưng tốt sẽ bảo vệ cột sống. Mặt bàn rộng rãi giúp bạn sắp xếp thiết bị làm việc ngăn nắp.\n\n## Tối giản đồ dùng\nGiữ bề mặt bàn gọn gàng, chỉ để lại các vật dụng thật sự cần thiết. Sử dụng khay đựng tài liệu hoặc kệ treo tường để tiết kiệm diện tích.\n\n## Tạo điểm nhấn trang trí\nCây xanh mini, đèn bàn hoặc tranh trang trí sẽ mang đến nguồn cảm hứng và giảm căng thẳng khi làm việc.',
    featured_image_url: 'https://images.pexels.com/photos/245208/pexels-photo-245208.jpeg?auto=compress&cs=tinysrgb&w=1600',
    author: 'Thi Interior Studio',
    published_at: '2024-03-05T08:00:00Z',
    created_at: '2024-03-05T08:00:00Z',
    updated_at: '2024-03-05T08:00:00Z',
  },
];
