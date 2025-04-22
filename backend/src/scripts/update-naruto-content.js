require('dotenv').config();
const mongoose = require('mongoose');
const Chapter = require('../models/Chapter');

// Nội dung mẫu cho các chương Naruto
const chapterContents = [
  {
    title: "Uzumaki Naruto",
    content: `<h2>Uzumaki Naruto</h2>
    <p>Mười hai năm trước, Cửu Vĩ Hồ Ly tấn công làng Lá, một con quái vật hùng mạnh đã gây ra sự hỗn loạn và chết chóc cho đến khi nó bị đánh bại bởi vị Hokage Đệ Tứ và bị phong ấn vào một đứa trẻ sơ sinh.</p>
    <p>Đứa trẻ đó là Uzumaki Naruto, người giờ đây đã trở thành một ninja học việc hiếu động và nghịch ngợm, người luôn tìm kiếm sự công nhận. Naruto có một giấc mơ lớn: trở thành Hokage, ninja mạnh nhất trong làng.</p>
    <p>Câu chuyện bắt đầu khi Naruto tốt nghiệp từ Học viện Ninja sau nhiều lần thất bại. Dưới sự hướng dẫn của giáo viên Iruka, Naruto học được về sức mạnh thực sự của mình và lý do tại sao anh luôn bị dân làng xa lánh.</p>`
  },
  {
    title: "Konohamaru",
    content: `<h2>Konohamaru</h2>
    <p>Sau khi chính thức trở thành một Genin, Naruto gặp Konohamaru, cháu trai của Hokage Đệ Tam. Konohamaru, giống như Naruto, muốn được công nhận vì chính bản thân mình, không phải vì danh tiếng của ông mình.</p>
    <p>Naruto dạy cho Konohamaru Sexy no Jutsu, một kỹ thuật biến hình gây xao nhãng mà anh đã tự phát triển. Thông qua tình bạn với Naruto, Konohamaru học được rằng không có con đường tắt để đạt được ước mơ - chỉ có sự chăm chỉ và kiên trì mới có thể giúp cậu trở thành Hokage trong tương lai.</p>
    <p>Trong khi đó, Naruto chuẩn bị cho cuộc sống mới của mình với tư cách là một ninja thực thụ, mong đợi được phân vào một đội ba người để thực hiện các nhiệm vụ.</p>`
  },
  {
    title: "Sasuke Uchiha",
    content: `<h2>Sasuke Uchiha</h2>
    <p>Naruto được phân vào Đội 7 cùng với Haruno Sakura, cô gái mà anh thích, và Uchiha Sasuke, người mà anh coi là đối thủ. Sasuke là người sống sót duy nhất của thảm sát gia tộc Uchiha, một sự kiện kinh hoàng do chính anh trai của cậu, Itachi, gây ra.</p>
    <p>Sasuke sống với mục đích duy nhất là trở nên đủ mạnh để giết Itachi và trả thù cho gia tộc mình. Tài năng thiên bẩm và thái độ lạnh lùng của cậu khiến Sasuke trở thành học sinh xuất sắc nhất và là đối tượng ngưỡng mộ của nhiều bạn nữ, bao gồm cả Sakura.</p>
    <p>Naruto và Sasuke bắt đầu với mối quan hệ đối đầu, nhưng dần dần phát triển một sự tôn trọng miễn cưỡng đối với nhau khi họ cùng đối mặt với những thử thách.</p>`
  },
  {
    title: "Kakashi Sensei",
    content: `<h2>Kakashi Sensei</h2>
    <p>Đội 7 được dẫn dắt bởi Hatake Kakashi, một Jounin nổi tiếng với biệt danh "Ninja Sao Chép" vì khả năng sử dụng Sharingan để sao chép hơn 1000 jutsu. Kakashi nổi tiếng với việc luôn đến muộn và thích đọc cuốn sách "Icha Icha Paradise".</p>
    <p>Kakashi đặt ra một bài kiểm tra chuông cho Đội 7, yêu cầu họ lấy được hai chiếc chuông từ ông trong khi chỉ có hai chuông cho ba người. Mục đích thực sự của bài kiểm tra là để xem liệu họ có thể làm việc như một đội hay không.</p>
    <p>Ban đầu, cả ba đều thất bại vì hành động riêng lẻ, nhưng cuối cùng họ đã học được giá trị của tinh thần đồng đội - một bài học quan trọng mà Kakashi muốn truyền đạt.</p>`
  },
  {
    title: "Nhiệm vụ đầu tiên",
    content: `<h2>Nhiệm vụ đầu tiên</h2>
    <p>Đội 7 được giao nhiệm vụ C-rank đầu tiên: hộ tống người xây cầu Tazuna về Làng Sóng. Tuy nhiên, nhiệm vụ nhanh chóng trở nên nguy hiểm hơn khi họ bị tấn công bởi Anh em Quỷ Sương Mù, những ninja đào tẩu từ Làng Sương Mù.</p>
    <p>Kakashi phát hiện ra rằng Tazuna đã nói dối về mức độ nguy hiểm của nhiệm vụ. Làng Sóng đang bị kiểm soát bởi Gato, một doanh nhân tàn nhẫn, và Tazuna là mục tiêu vì cây cầu ông đang xây sẽ phá vỡ sự độc quyền của Gato.</p>
    <p>Mặc dù nhiệm vụ đã vượt quá cấp độ của họ, Đội 7 quyết định tiếp tục, đặc biệt là sau khi Naruto thề sẽ không bao giờ lùi bước trước nguy hiểm.</p>`
  },
  {
    title: "Zabuza Momochi",
    content: `<h2>Zabuza Momochi</h2>
    <p>Đội 7 đối mặt với Zabuza Momochi, một trong Thất Kiếm Sương Mù, những kiếm sĩ huyền thoại của Làng Sương Mù. Zabuza là một ninja cấp S nguy hiểm, được thuê bởi Gato để giết Tazuna.</p>
    <p>Trong trận chiến đầu tiên, Kakashi bị Zabuza bắt giữ, buộc Naruto và Sasuke phải làm việc cùng nhau để giải cứu thầy của họ. Họ thành công nhờ một kế hoạch thông minh, nhưng Zabuza được cứu bởi một ninja bí ẩn đeo mặt nạ tên Haku.</p>
    <p>Kakashi dạy cho Đội 7 cách leo cây bằng chakra để chuẩn bị cho trận chiến tiếp theo với Zabuza. Naruto tập luyện đến kiệt sức, quyết tâm trở nên mạnh hơn.</p>`
  },
  {
    title: "Haku",
    content: `<h2>Haku</h2>
    <p>Trong khi tập luyện trong rừng, Naruto gặp Haku, không nhận ra cậu là đồng minh của Zabuza. Haku chia sẻ triết lý của mình về việc bảo vệ người quan trọng và làm thế nào điều đó mang lại sức mạnh thực sự.</p>
    <p>Khi Zabuza tấn công lần thứ hai tại cây cầu, Sasuke đối đầu với Haku và khả năng Kekkei Genkai của cậu ta - Hyoton (Phong cách Băng). Haku nhốt Sasuke trong Kỹ thuật Gương Băng Tử, tạo ra nhiều phản chiếu của mình để tấn công.</p>
    <p>Naruto đến để giúp đỡ, và trong trận chiến, Sasuke dường như hy sinh bản thân để bảo vệ Naruto. Điều này kích hoạt chakra của Cửu Vĩ trong Naruto, cho phép anh đánh bại Haku.</p>`
  },
  {
    title: "Chakra của Cửu Vĩ",
    content: `<h2>Chakra của Cửu Vĩ</h2>
    <p>Khi Naruto tin rằng Sasuke đã chết, cơn giận dữ của anh giải phóng một phần chakra của Cửu Vĩ Hồ Ly bị phong ấn bên trong anh. Chakra màu đỏ bao quanh Naruto, tăng cường sức mạnh và tốc độ của anh đến mức đáng kinh ngạc.</p>
    <p>Với sức mạnh mới này, Naruto dễ dàng đánh bại Haku, nhưng dừng lại khi phát hiện ra đối thủ của mình là người cậu đã gặp trong rừng. Haku, cảm thấy mình đã thất bại trong việc bảo vệ Zabuza, yêu cầu Naruto giết cậu ta.</p>
    <p>Trước khi Naruto có thể quyết định, Haku cảm nhận được Zabuza đang gặp nguy hiểm và hy sinh bản thân để bảo vệ chủ nhân của mình khỏi đòn tấn công của Kakashi.</p>`
  },
  {
    title: "Cây cầu của Dũng khí",
    content: `<h2>Cây cầu của Dũng khí</h2>
    <p>Gato xuất hiện với một đội lính đánh thuê, tiết lộ rằng hắn đã có kế hoạch phản bội Zabuza từ đầu. Zabuza, bị xúc động bởi sự hy sinh của Haku, quyết định trả thù mặc dù bị thương nặng.</p>
    <p>Với một kunai trong miệng, Zabuza xông qua đám lính đánh thuê để đến chỗ Gato và giết hắn, nhưng cũng bị thương chết người trong quá trình này. Trước khi chết, Zabuza yêu cầu được đặt bên cạnh Haku, thừa nhận tình cảm của mình dành cho người học trò.</p>
    <p>Dân làng, được truyền cảm hứng bởi sự dũng cảm của Naruto, đứng lên chống lại những tên lính đánh thuê còn lại. Sau khi nhiệm vụ hoàn thành, cây cầu được đặt tên là "Cầu Naruto" để tôn vinh lòng dũng cảm của chàng trai trẻ đã mang lại hy vọng cho Làng Sóng.</p>`
  },
  {
    title: "Trở về Làng Lá",
    content: `<h2>Trở về Làng Lá</h2>
    <p>Sau khi hoàn thành nhiệm vụ tại Làng Sóng, Đội 7 trở về Làng Lá với kinh nghiệm và sự trưởng thành mới. Trải nghiệm chiến đấu thực sự đã thay đổi họ, đặc biệt là Naruto và Sasuke, những người đã bắt đầu phát triển một mối liên kết đặc biệt.</p>
    <p>Hokage Đệ Tam thông báo rằng Kỳ thi Chunin sắp diễn ra, một cơ hội để các Genin thể hiện kỹ năng và có thể được thăng cấp. Kakashi đề cử cả Đội 7 tham gia, tin tưởng vào khả năng của học trò mình.</p>
    <p>Naruto hào hứng với cơ hội này để chứng minh bản thân và tiến gần hơn đến ước mơ trở thành Hokage. Sasuke xem đây là cơ hội để kiểm tra sức mạnh của mình và tiến gần hơn đến mục tiêu trả thù. Sakura, mặc dù lo lắng về khả năng của mình, quyết định tham gia để không làm đồng đội thất vọng.</p>`
  }
];

// Kết nối đến MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // ID của truyện Naruto
    const narutostoryId = '6807722cf2d1107e375d6e9d';
    
    try {
      // Lấy danh sách các chương hiện có
      const existingChapters = await Chapter.find({ story: narutostoryId }).sort({ chapter_number: 1 });
      console.log(`Found ${existingChapters.length} existing Naruto chapters`);
      
      // Cập nhật nội dung cho từng chương
      for (let i = 0; i < Math.min(existingChapters.length, chapterContents.length); i++) {
        const chapter = existingChapters[i];
        const newContent = chapterContents[i];
        
        // Cập nhật tiêu đề và nội dung
        chapter.title = newContent.title;
        chapter.content = newContent.content;
        
        await chapter.save();
        console.log(`Updated chapter ${chapter.chapter_number}: ${chapter.title}`);
      }
      
      console.log('All chapters updated successfully');
    } catch (error) {
      console.error('Error updating Naruto chapters:', error);
    }
    
    // Ngắt kết nối
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });
