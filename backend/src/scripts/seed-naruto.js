const mongoose = require('mongoose');
const Story = require('../models/Story');
const Chapter = require('../models/Chapter');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('MongoDB connected for seeding'))
  .catch(err => console.error('MongoDB connection error:', err));

// Naruto story data
const narutoStory = {
  title: 'Naruto',
  description: 'Naruto là câu chuyện về Naruto Uzumaki, một ninja trẻ muốn tìm kiếm sự công nhận và ước mơ trở thành Hokage, người lãnh đạo của làng.',
  author: 'Masashi Kishimoto',
  genre: 'Hành động',
  thumbnail: 'http://localhost:5000/uploads/naruto/naruto-cover.jpg',
  views: 15000,
  status: 'Hoàn thành',
  type: 'normal',
  number_of_chapters: 10
};

// Chapter data
const narutoChapters = [
  {
    title: 'Uzumaki Naruto',
    content: `<p>Mười hai năm trước, Cửu Vĩ Hồ Ly tấn công làng Lá, một con quái vật hùng mạnh đã gây ra sự hỗn loạn và giết chết nhiều người, cho đến khi người đứng đầu làng Lá – Hokage Đệ Tứ đã đánh bại nó bằng cách đổi lấy mạng sống của mình để phong ấn nó vào một đứa trẻ sơ sinh, đứa trẻ đó tên là Naruto Uzumaki.</p>
    <p>Bị cả làng xa lánh vì có con quái vật bên trong người, Naruto đã quyết tâm trở thành Hokage vĩ đại nhất của làng Lá để được mọi người công nhận.</p>
    <p>Naruto tham gia vào Học viện Ninja, nơi mà cậu gặp Sasuke Uchiha và Sakura Haruno, hai người sau này trở thành đồng đội của cậu trong Đội 7 dưới sự hướng dẫn của Kakashi Hatake.</p>`,
    chapter_number: 1
  },
  {
    title: 'Konohamaru và Sexy Jutsu',
    content: `<p>Naruto gặp Konohamaru, cháu trai của Hokage Đệ Tam. Konohamaru muốn đánh bại ông mình để trở thành Hokage, nhưng cậu không biết làm thế nào.</p>
    <p>Naruto dạy cho Konohamaru kỹ thuật Sexy Jutsu, một kỹ thuật biến hình thành một cô gái xinh đẹp để làm phân tâm đối thủ.</p>
    <p>Ebisu, gia sư của Konohamaru, tìm thấy họ và cố gắng ngăn cản Naruto ảnh hưởng đến Konohamaru, nhưng Naruto đánh bại anh ta bằng Harem Jutsu, một phiên bản nâng cao của Sexy Jutsu.</p>
    <p>Konohamaru hiểu rằng không có đường tắt để trở thành Hokage và quyết định coi Naruto là đối thủ của mình.</p>`,
    chapter_number: 2
  },
  {
    title: 'Sasuke Uchiha',
    content: `<p>Naruto và các bạn cùng lớp được chia thành các đội ba người. Naruto được xếp vào Đội 7 cùng với Sasuke Uchiha, người mà cậu coi là đối thủ, và Sakura Haruno, cô gái mà cậu thích.</p>
    <p>Sasuke là người sống sót duy nhất của gia tộc Uchiha, một gia tộc hùng mạnh đã bị anh trai của cậu, Itachi Uchiha, tàn sát. Sasuke sống với mục đích duy nhất là trở nên đủ mạnh để giết Itachi và khôi phục gia tộc của mình.</p>
    <p>Naruto không hiểu tại sao tất cả các cô gái đều thích Sasuke và cậu quyết định thách đấu với Sasuke, nhưng Sasuke dễ dàng đánh bại cậu.</p>`,
    chapter_number: 3
  },
  {
    title: 'Kakashi Hatake',
    content: `<p>Đội 7 gặp giáo viên hướng dẫn của họ, Kakashi Hatake, một jōnin (ninja cấp cao) với biệt danh "Ninja Sao Chép" vì khả năng sao chép hơn 1000 jutsu.</p>
    <p>Kakashi đưa ra một bài kiểm tra chuông, trong đó ba học sinh phải lấy được hai quả chuông từ ông. Ai không lấy được chuông sẽ bị buộc quay lại Học viện.</p>
    <p>Ban đầu, cả ba đều cố gắng một mình và thất bại. Naruto thậm chí bị trói vào cột gỗ vì cố gắng ăn trưa một mình.</p>
    <p>Cuối cùng, họ hiểu rằng mục đích thực sự của bài kiểm tra là về tinh thần đồng đội. Mặc dù họ không lấy được chuông, Kakashi vẫn cho họ đỗ vì họ đã học được bài học quan trọng này.</p>`,
    chapter_number: 4
  },
  {
    title: 'Nhiệm vụ nguy hiểm',
    content: `<p>Đội 7 nhận nhiệm vụ C-rank đầu tiên của họ: hộ tống Tazuna, một thợ xây cầu, trở về Làng Sóng.</p>
    <p>Trên đường đi, họ bị tấn công bởi Anh Em Quỷ Sương Mù, hai ninja phản bội từ Làng Sương Mù. Kakashi dễ dàng đánh bại họ.</p>
    <p>Tazuna thừa nhận rằng ông đã nói dối về mức độ nguy hiểm của nhiệm vụ. Làng của ông đang bị Gatō, một doanh nhân tham nhũng, kiểm soát. Gatō không muốn cây cầu được xây dựng vì nó sẽ phá vỡ sự độc quyền vận chuyển của hắn.</p>
    <p>Mặc dù nhiệm vụ bây giờ được coi là A-rank, quá nguy hiểm cho các genin (ninja mới), Đội 7 vẫn quyết định tiếp tục.</p>`,
    chapter_number: 5
  },
  {
    title: 'Zabuza Momochi',
    content: `<p>Đội 7 đối mặt với Zabuza Momochi, một trong Thất Kiếm Sương Mù, những kiếm sĩ hàng đầu của Làng Sương Mù. Zabuza đã được Gatō thuê để giết Tazuna.</p>
    <p>Kakashi chiến đấu với Zabuza nhưng bị bắt trong Nhà tù Nước của Zabuza. Naruto và Sasuke hợp tác để giải cứu ông.</p>
    <p>Khi Zabuza sắp bị đánh bại, một thợ săn ninja bí ẩn xuất hiện và dường như giết Zabuza, mang xác đi.</p>
    <p>Kakashi nghi ngờ rằng thợ săn ninja đó thực sự là đồng minh của Zabuza và rằng Zabuza vẫn còn sống.</p>`,
    chapter_number: 6
  },
  {
    title: 'Huấn luyện leo cây',
    content: `<p>Để chuẩn bị cho cuộc chiến sắp tới với Zabuza, Kakashi dạy Đội 7 cách leo cây mà không cần dùng tay, một bài tập kiểm soát chakra.</p>
    <p>Sakura nhanh chóng làm chủ kỹ thuật này, trong khi Naruto và Sasuke gặp khó khăn. Hai cậu bé tiếp tục luyện tập suốt đêm, thúc đẩy nhau tiến bộ.</p>
    <p>Trong khi đó, Naruto gặp Haku, người mà cậu không biết chính là thợ săn ninja bí ẩn. Haku nói với Naruto về mong muốn bảo vệ người quan trọng với mình.</p>`,
    chapter_number: 7
  },
  {
    title: 'Những chiếc gương băng',
    content: `<p>Zabuza và Haku tấn công Tazuna và Đội 7 tại cây cầu. Sasuke chiến đấu với Haku, người sử dụng Kekkei Genkai (Huyết Kế Giới Hạn) của mình để tạo ra những tấm gương băng.</p>
    <p>Naruto đến để giúp đỡ và vô tình bị mắc kẹt bên trong kỹ thuật Gương Băng Demonic của Haku cùng với Sasuke.</p>
    <p>Khi Haku chuẩn bị giết Naruto, Sasuke hy sinh bản thân để bảo vệ cậu, dường như chết trong quá trình này.</p>
    <p>Tức giận và đau buồn, Naruto lần đầu tiên sử dụng chakra của Cửu Vĩ, đánh bại Haku.</p>`,
    chapter_number: 8
  },
  {
    title: 'Cái chết của Zabuza và Haku',
    content: `<p>Haku, đã bị đánh bại, yêu cầu Naruto giết cậu ta vì cậu ta đã thất bại trong việc bảo vệ Zabuza. Tuy nhiên, trước khi Naruto có thể quyết định, Haku cảm nhận được Zabuza đang gặp nguy hiểm và dịch chuyển để chặn đòn tấn công của Kakashi, hy sinh bản thân.</p>
    <p>Gatō xuất hiện với một đội lính đánh thuê, tiết lộ rằng hắn đã có kế hoạch phản bội Zabuza từ đầu. Hắn đá xác Haku, khiến Naruto tức giận.</p>
    <p>Naruto thuyết phục Zabuza rằng Haku thực sự quan tâm đến ông ta. Xúc động, Zabuza quyết định giết Gatō, mặc dù bản thân bị thương nặng. Sau khi giết Gatō, Zabuza chết bên cạnh Haku.</p>
    <p>Sasuke, người mà mọi người tưởng đã chết, tỉnh dậy, khiến Sakura vui mừng.</p>`,
    chapter_number: 9
  },
  {
    title: 'Cây cầu Naruto',
    content: `<p>Với Gatō đã chết, Làng Sóng được tự do. Tazuna hoàn thành cây cầu với sự giúp đỡ của dân làng.</p>
    <p>Đội 7 chuẩn bị trở về Làng Lá. Inari, cháu trai của Tazuna, người đã học được lòng can đảm từ Naruto, khóc khi chia tay, và Naruto cũng cố gắng kìm nén nước mắt.</p>
    <p>Tazuna quyết định đặt tên cây cầu là "Cầu Naruto" để tưởng nhớ đến cậu bé đã mang lại can đảm cho Inari và hy vọng cho cả làng.</p>
    <p>Đội 7 trở về Làng Lá, sẵn sàng cho những thử thách mới.</p>`,
    chapter_number: 10
  }
];

// Function to seed the database
async function seedDatabase() {
  try {
    // Clear existing data
    await Story.deleteOne({ title: 'Naruto' });
    await Chapter.deleteMany({ title: { $in: narutoChapters.map(chapter => chapter.title) } });

    console.log('Existing Naruto data cleared');

    // Create the story
    const story = await Story.create(narutoStory);
    console.log(`Created story: ${story.title}`);

    // Create chapters
    for (const chapterData of narutoChapters) {
      const chapter = await Chapter.create({
        ...chapterData,
        story: story._id
      });
      console.log(`Created chapter: ${chapter.title}`);
    }

    console.log('Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedDatabase();
