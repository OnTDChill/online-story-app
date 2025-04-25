#!/usr/bin/env python3
import zipfile
import os
import shutil
import sys
import json
import re
from PIL import Image
import argparse

def sanitize_filename(filename):
    """
    Sanitize a filename to make it safe for filesystem use.
    Remove special characters and replace spaces with underscores.
    """
    # Remove invalid characters and replace spaces with underscores
    sanitized = re.sub(r'[^\w\s-]', '', filename)
    sanitized = re.sub(r'\s+', '_', sanitized)
    return sanitized.lower()

def extract_cbz(cbz_path, manga_name, output_base_dir):
    """
    Extract a CBZ file to the specified output directory.

    Args:
        cbz_path (str): Path to the CBZ file
        manga_name (str): Name of the manga (for folder naming)
        output_base_dir (str): Base directory where manga will be extracted

    Returns:
        dict: Information about the extracted manga
    """
    print(f"Starting extraction of {cbz_path}")
    print(f"Manga name: {manga_name}")
    print(f"Output directory: {output_base_dir}")

    # Sanitize manga name for folder name - make it short and clean
    folder_name = sanitize_filename(manga_name)
    if len(folder_name) > 30:  # Limit folder name length
        folder_name = folder_name[:30]

    print(f"Sanitized folder name: {folder_name}")

    # Create full output path
    output_dir = os.path.join(output_base_dir, folder_name)
    chapters_dir = os.path.join(output_dir, "chapters", "1")  # Default to chapter 1

    print(f"Full output path: {output_dir}")
    print(f"Chapters directory: {chapters_dir}")

    # Create output directories
    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(chapters_dir, exist_ok=True)

    # Information to return
    manga_info = {
        "title": manga_name,
        "folder": folder_name,
        "cover": None,
        "pages": 0,
        "chapter_images": []
    }

    try:
        # Open the CBZ file (which is a ZIP file)
        with zipfile.ZipFile(cbz_path, 'r') as zip_ref:
            # Get list of files in the archive
            file_list = sorted([f for f in zip_ref.namelist() if not f.endswith('/')])
            print(f"Found {len(file_list)} files in archive")

            # Filter image files
            image_extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
            image_files = [f for f in file_list if os.path.splitext(f.lower())[1] in image_extensions]
            print(f"Found {len(image_files)} image files")

            # Sort image files naturally (so page10 comes after page9, not after page1)
            def natural_sort_key(s):
                return [int(text) if text.isdigit() else text.lower() for text in re.split(r'(\d+)', s)]

            image_files = sorted(image_files, key=natural_sort_key)

            if not image_files:
                print("No image files found in the CBZ archive")
                return None

            # Use the first image as cover
            cover_file = image_files[0]
            cover_ext = os.path.splitext(cover_file)[1]
            cover_path = os.path.join(output_dir, f"cover{cover_ext}")
            print(f"Using {cover_file} as cover image")

            # Extract cover
            with zip_ref.open(cover_file) as source, open(cover_path, 'wb') as target:
                shutil.copyfileobj(source, target)

            print(f"Cover extracted to {cover_path}")

            # Create relative path for frontend
            cover_rel_path = f"/data/manga/{folder_name}/cover{cover_ext}"
            manga_info["cover"] = cover_rel_path
            print(f"Cover path for frontend: {cover_rel_path}")

            # Extract all other images as chapter pages
            for i, img_file in enumerate(image_files):
                # Skip the first image if it's already used as cover and we have more than one image
                if i == 0 and len(image_files) > 1:
                    continue

                # Generate page number with leading zeros
                page_num = i
                page_filename = f"{page_num+1:03d}{os.path.splitext(img_file)[1]}"
                page_path = os.path.join(chapters_dir, page_filename)

                print(f"Extracting page {i+1}/{len(image_files)}: {img_file} -> {page_filename}")

                # Extract the image
                try:
                    with zip_ref.open(img_file) as source, open(page_path, 'wb') as target:
                        shutil.copyfileobj(source, target)

                    # Add to chapter images list
                    rel_path = f"/data/manga/{folder_name}/chapters/1/{page_filename}"
                    manga_info["chapter_images"].append(rel_path)
                    print(f"  - Extracted to {page_path}")
                    print(f"  - Frontend path: {rel_path}")
                except Exception as e:
                    print(f"  - Error extracting {img_file}: {str(e)}")

            manga_info["pages"] = len(manga_info["chapter_images"])

            print(f"Successfully extracted {cbz_path} to {output_dir}")
            print(f"Total pages: {manga_info['pages']}")
            print(f"Chapter images: {len(manga_info['chapter_images'])}")

            # Create info.json file
            from datetime import datetime
            current_time = datetime.now().isoformat()

            info_json = {
                "_id": folder_name,
                "title": manga_name,
                "author": "Unknown",
                "artist": "Unknown",
                "description": f"Imported from CBZ file: {os.path.basename(cbz_path)}",
                "genre": "Manga",
                "genres": ["Manga"],
                "status": "ongoing",
                "thumbnail": manga_info["cover"],
                "type": "normal",
                "releaseYear": datetime.now().year,
                "chapters": 1,
                "number_of_chapters": 1,
                "views": 0,
                "likes": 0,
                "rating": 5.0,
                "tags": ["Manga", "Imported"],
                "createdAt": current_time,
                "updatedAt": current_time
            }

            info_path = os.path.join(output_dir, "info.json")
            with open(info_path, 'w', encoding='utf-8') as f:
                json.dump(info_json, f, indent=2)

            print(f"Created info.json at {info_path}")

            # Create chapters.json file
            chapters_json = [
                {
                    "_id": f"{folder_name}-vol-1",
                    "number": 1,
                    "title": "Chapter 1",
                    "url": f"/data/manga/{folder_name}/chapters/1",
                    "pages": manga_info["pages"],
                    "images": manga_info["chapter_images"],
                    "createdAt": current_time,
                    "updatedAt": current_time
                }
            ]

            chapters_path = os.path.join(output_dir, "chapters.json")
            with open(chapters_path, 'w', encoding='utf-8') as f:
                json.dump(chapters_json, f, indent=2)

            print(f"Created chapters.json at {chapters_path}")

            return manga_info

    except zipfile.BadZipFile:
        print("Error: The file is not a valid CBZ/ZIP file")
        print(f"File path: {cbz_path}")
        print(f"File exists: {os.path.exists(cbz_path)}")
        print(f"File size: {os.path.getsize(cbz_path) if os.path.exists(cbz_path) else 'N/A'} bytes")
        return None
    except Exception as e:
        print(f"An error occurred: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def main():
    parser = argparse.ArgumentParser(description='Extract CBZ manga file')
    parser.add_argument('cbz_path', help='Path to the CBZ file')
    parser.add_argument('--name', help='Name of the manga (defaults to filename)')
    parser.add_argument('--output', default='../../frontend/public/data/manga',
                        help='Base output directory (default: ../../frontend/public/data/manga)')

    args = parser.parse_args()

    # Print arguments for debugging
    print(f"Arguments: cbz_path={args.cbz_path}, name={args.name}, output={args.output}")
    print(f"Python version: {sys.version}")
    print(f"Current working directory: {os.getcwd()}")

    # If name not provided, use filename without extension
    manga_name = args.name if args.name else os.path.splitext(os.path.basename(args.cbz_path))[0]
    print(f"Using manga name: {manga_name}")

    # Get absolute path for output directory
    output_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), args.output))
    print(f"Output directory (absolute): {output_dir}")

    # Get absolute path for CBZ file
    cbz_path = os.path.abspath(args.cbz_path)
    print(f"CBZ file (absolute): {cbz_path}")
    print(f"CBZ file exists: {os.path.exists(cbz_path)}")

    if os.path.exists(cbz_path):
        print(f"CBZ file size: {os.path.getsize(cbz_path)} bytes")
    else:
        print("WARNING: CBZ file does not exist!")
        return 1

    # Ensure output directory exists
    try:
        os.makedirs(output_dir, exist_ok=True)
        print(f"Created output directory: {output_dir}")
    except Exception as e:
        print(f"Error creating output directory: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

    # Extract the CBZ file
    try:
        result = extract_cbz(cbz_path, manga_name, output_dir)
    except Exception as e:
        print(f"Unexpected error during extraction: {str(e)}")
        import traceback
        traceback.print_exc()
        return 1

    if result:
        # Output result as JSON for the calling process
        json_result = json.dumps(result)
        print(f"RESULT_JSON_START{json_result}RESULT_JSON_END")
        print("Extraction completed successfully!")
        return 0
    else:
        print("Extraction failed, no result returned")
        return 1

if __name__ == "__main__":
    sys.exit(main())
