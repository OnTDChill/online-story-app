import os
import json
import random
import time
from datetime import datetime, timedelta
import subprocess
import re

# Thư mục đầu ra cho dữ liệu truyện
OUTPUT_DIR = "frontend/public/data/manga"

# Thông tin truyện muốn tải
MANGA_INFO = {
    "one-piece": {
        "id": "a1c7c817-4e59-43b7-9365-09675a149a6f",
        "title": "One Piece",
        "author": "Eiichiro Oda",
        "description": "Gol D. Roger, vua hải tặc với khối tài sản vô giá được cất giấu đâu đó nơi Grand Line - Đại Hải Trình. Để tìm kiếm kho báu này, hàng ngàn người đã đổ xô ra biển và kỷ nguyên hải tặc bắt đầu. Monkey D. Luffy, một cậu bé với ước mơ trở thành Vua Hải Tặc, vô tình ăn phải trái ác quỷ Gomu Gomu, biến cơ thể cậu thành cao su. Giờ đây cậu cùng các đồng đội phiêu lưu trên Đại Hải Trình để tìm kiếm kho báu One Piece.",
        "genre": "Hành động, Phiêu lưu, Hài hước, Siêu nhiên",
        "tags": ["Hành động", "Phiêu lưu", "Hài hước", "Siêu nhiên", "Shounen", "Fantasy"],
        "chapter_limit": 10  # Số chương muốn tải
    },
    "naruto": {
        "id": "28b4fd6d-0904-4abb-8aea-608460da7722",
        "title": "Naruto",
        "author": "Kishimoto Masashi",
        "description": "Naruto là câu chuyện về Uzumaki Naruto, một ninja trẻ muốn tìm kiếm sự công nhận và ước mơ trở thành Hokage, ninja dẫn đầu làng. Cậu được phong ấn Cửu Vĩ Hồ Ly trong người, một con quái vật tấn công làng Lá trước kia. Điều này khiến cậu bị dân làng xa lánh, và vì thế Naruto quyết tâm chứng minh giá trị bản thân.",
        "genre": "Hành động, Phiêu lưu, Võ thuật, Siêu nhiên",
        "tags": ["Hành động", "Phiêu lưu", "Võ thuật", "Siêu nhiên", "Shounen", "Ninja"],
        "chapter_limit": 10  # Số chương muốn tải
    }
}

def create_manga_info(manga_id, manga_data):
    """Tạo thông tin cơ bản về bộ truyện"""
    return {
        "_id": manga_id,
        "title": manga_data["title"],
        "author": manga_data["author"],
        "description": manga_data["description"],
        "thumbnail": f"/data/manga/{manga_id}/cover.jpg",
        "genre": manga_data["genre"],
        "status": "ongoing",
        "views": random.randint(100000, 1000000),
        "likes": random.randint(10000, 100000),
        "rating": round(random.uniform(4.0, 5.0), 1),
        "createdAt": (datetime.now() - timedelta(days=365)).isoformat(),
        "updatedAt": datetime.now().isoformat(),
        "tags": manga_data["tags"]
    }

def download_manga(manga_id, manga_data):
    """Tải truyện từ MangaDex sử dụng mangadex-downloader"""
    print(f"Đang tải truyện: {manga_data['title']} ({manga_id})")
    
    # Tạo thư mục cho truyện
    manga_folder = f"{OUTPUT_DIR}/{manga_id}"
    os.makedirs(manga_folder, exist_ok=True)
    os.makedirs(f"{manga_folder}/chapters", exist_ok=True)
    
    # Tải truyện sử dụng mangadex-downloader
    try:
        # Tải bìa truyện
        cover_cmd = f"mangadex-dl --cover-only --id {manga_data['id']} -o {manga_folder}/temp"
        subprocess.run(cover_cmd, shell=True, check=True)
        
        # Di chuyển file bìa vào thư mục chính
        cover_files = os.listdir(f"{manga_folder}/temp")
        if cover_files:
            cover_file = cover_files[0]
            os.rename(f"{manga_folder}/temp/{cover_file}", f"{manga_folder}/cover.jpg")
            os.rmdir(f"{manga_folder}/temp")
        
        # Tải các chương
        chapter_cmd = f"mangadex-dl --id {manga_data['id']} -o {manga_folder}/temp --limit {manga_data['chapter_limit']} --no-group-folder --no-progress"
        subprocess.run(chapter_cmd, shell=True, check=True)
        
        # Xử lý các chương đã tải
        chapters_info = process_downloaded_chapters(manga_id, manga_folder)
        
        # Cập nhật thông tin truyện
        manga_info = create_manga_info(manga_id, manga_data)
        manga_info["chapters"] = len(chapters_info)
        
        # Lưu thông tin truyện vào file JSON
        with open(f"{manga_folder}/info.json", 'w', encoding='utf-8') as f:
            json.dump(manga_info, f, ensure_ascii=False, indent=2)
        
        # Lưu thông tin các chương vào file JSON
        with open(f"{manga_folder}/chapters.json", 'w', encoding='utf-8') as f:
            json.dump(chapters_info, f, ensure_ascii=False, indent=2)
        
        print(f"Đã hoàn thành tải truyện {manga_data['title']}")
        print(f"Dữ liệu được lưu tại: {manga_folder}")
        
    except Exception as e:
        print(f"Lỗi khi tải truyện {manga_id}: {e}")
        # Tạo dữ liệu mẫu nếu có lỗi
        create_sample_data(manga_id, manga_data)

def process_downloaded_chapters(manga_id, manga_folder):
    """Xử lý các chương đã tải và tạo thông tin"""
    chapters_info = []
    temp_folder = f"{manga_folder}/temp"
    
    # Kiểm tra xem thư mục temp có tồn tại không
    if not os.path.exists(temp_folder):
        print(f"Không tìm thấy thư mục {temp_folder}. Tạo dữ liệu mẫu.")
        return create_sample_chapters(manga_id, 10)
    
    # Lấy danh sách chương từ thư mục temp
    chapter_folders = [f for f in os.listdir(temp_folder) if os.path.isdir(os.path.join(temp_folder, f))]
    chapter_folders.sort(key=lambda x: float(re.search(r'Chapter (\d+(\.\d+)?)', x).group(1)) if re.search(r'Chapter (\d+(\.\d+)?)', x) else 0)
    
    for idx, chapter_folder in enumerate(chapter_folders):
        chapter_number = idx + 1
        chapter_path = os.path.join(temp_folder, chapter_folder)
        
        # Tạo thư mục cho chương trong cấu trúc mới
        new_chapter_folder = f"{manga_folder}/chapters/{chapter_number}"
        os.makedirs(new_chapter_folder, exist_ok=True)
        
        # Di chuyển và đổi tên các file ảnh
        image_files = [f for f in os.listdir(chapter_path) if f.endswith(('.jpg', '.png', '.jpeg', '.webp'))]
        image_files.sort()
        
        image_paths = []
        for img_idx, img_file in enumerate(image_files):
            new_img_name = f"{img_idx+1:03d}.jpg"
            os.rename(os.path.join(chapter_path, img_file), os.path.join(new_chapter_folder, new_img_name))
            image_paths.append(f"/data/manga/{manga_id}/chapters/{chapter_number}/{new_img_name}")
        
        # Tạo thông tin chương
        chapter_info = {
            "_id": f"{manga_id}-chapter-{chapter_number}",
            "number": chapter_number,
            "title": f"Chapter {chapter_number}",
            "images": image_paths,
            "views": random.randint(5000, 50000),
            "createdAt": (datetime.now() - timedelta(days=365-chapter_number*7)).isoformat(),
            "isLocked": chapter_number % 10 == 0  # Khóa một số chương VIP
        }
        
        chapters_info.append(chapter_info)
    
    # Xóa thư mục temp sau khi xử lý xong
    import shutil
    shutil.rmtree(temp_folder)
    
    return chapters_info

def create_sample_data(manga_id, manga_data):
    """Tạo dữ liệu mẫu nếu không tải được từ MangaDex"""
    print(f"Tạo dữ liệu mẫu cho truyện {manga_data['title']}")
    
    manga_folder = f"{OUTPUT_DIR}/{manga_id}"
    os.makedirs(manga_folder, exist_ok=True)
    os.makedirs(f"{manga_folder}/chapters", exist_ok=True)
    
    # Tạo ảnh bìa mẫu
    try:
        cover_url = f"https://picsum.photos/800/1200?random={random.randint(1, 1000)}"
        cover_data = requests.get(cover_url).content
        with open(f"{manga_folder}/cover.jpg", 'wb') as f:
            f.write(cover_data)
    except:
        print("Không thể tạo ảnh bìa mẫu")
    
    # Tạo thông tin truyện
    manga_info = create_manga_info(manga_id, manga_data)
    manga_info["chapters"] = 10
    
    # Lưu thông tin truyện
    with open(f"{manga_folder}/info.json", 'w', encoding='utf-8') as f:
        json.dump(manga_info, f, ensure_ascii=False, indent=2)
    
    # Tạo các chương mẫu
    chapters_info = create_sample_chapters(manga_id, 10)
    
    # Lưu thông tin các chương
    with open(f"{manga_folder}/chapters.json", 'w', encoding='utf-8') as f:
        json.dump(chapters_info, f, ensure_ascii=False, indent=2)
    
    print(f"Đã tạo dữ liệu mẫu cho truyện {manga_data['title']}")

def create_sample_chapters(manga_id, num_chapters):
    """Tạo các chương mẫu với ảnh từ picsum.photos"""
    import requests
    
    chapters_info = []
    
    for chapter_number in range(1, num_chapters + 1):
        chapter_folder = f"{OUTPUT_DIR}/{manga_id}/chapters/{chapter_number}"
        os.makedirs(chapter_folder, exist_ok=True)
        
        # Tạo các ảnh mẫu
        num_images = random.randint(5, 15)
        image_paths = []
        
        for img_idx in range(1, num_images + 1):
            img_path = f"{chapter_folder}/{img_idx:03d}.jpg"
            image_paths.append(f"/data/manga/{manga_id}/chapters/{chapter_number}/{img_idx:03d}.jpg")
            
            # Kiểm tra xem ảnh đã tồn tại chưa
            if not os.path.exists(img_path):
                try:
                    img_url = f"https://picsum.photos/800/1200?random={random.randint(1, 10000)}"
                    img_data = requests.get(img_url).content
                    with open(img_path, 'wb') as f:
                        f.write(img_data)
                    time.sleep(0.2)  # Tránh gửi quá nhiều request
                except Exception as e:
                    print(f"Lỗi khi tạo ảnh mẫu: {e}")
        
        # Tạo thông tin chương
        chapter_info = {
            "_id": f"{manga_id}-chapter-{chapter_number}",
            "number": chapter_number,
            "title": f"Chapter {chapter_number}",
            "images": image_paths,
            "views": random.randint(5000, 50000),
            "createdAt": (datetime.now() - timedelta(days=365-chapter_number*7)).isoformat(),
            "isLocked": chapter_number % 10 == 0  # Khóa một số chương VIP
        }
        
        chapters_info.append(chapter_info)
    
    return chapters_info

def main():
    # Tạo thư mục output nếu chưa tồn tại
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Kiểm tra xem mangadex-downloader đã được cài đặt chưa
    try:
        subprocess.run(["mangadex-dl", "--version"], capture_output=True, check=True)
        print("mangadex-downloader đã được cài đặt")
    except:
        print("Đang cài đặt mangadex-downloader...")
        subprocess.run(["pip", "install", "mangadex-downloader"], check=True)
    
    # Tải từng truyện
    for manga_id, manga_data in MANGA_INFO.items():
        download_manga(manga_id, manga_data)

if __name__ == "__main__":
    # Thêm thư viện requests nếu chưa có
    try:
        import requests
    except ImportError:
        subprocess.run(["pip", "install", "requests"], check=True)
        import requests
    
    main()