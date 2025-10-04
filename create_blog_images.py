#!/usr/bin/env python3
"""
Create blog placeholder images
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_blog_image(width, height, title, category, filename):
    """Create a blog placeholder image"""
    
    # Create image with a clean background
    img = Image.new('RGB', (width, height), color='#f8f9fa')
    draw = ImageDraw.Draw(img)
    
    # Add a subtle gradient effect
    for y in range(height):
        color_value = int(248 + (y / height) * 7)  # Light gradient
        draw.line([(0, y), (width, y)], fill=(color_value, color_value, color_value))
    
    # Add a blog frame
    frame_margin = 20
    frame_color = '#e9ecef'
    draw.rectangle([frame_margin, frame_margin, width-frame_margin, height-frame_margin], 
                   outline=frame_color, width=2)
    
    # Add inner shadow effect
    shadow_color = '#dee2e6'
    for i in range(3):
        draw.rectangle([frame_margin+i, frame_margin+i, width-frame_margin-i, height-frame_margin-i], 
                       outline=shadow_color, width=1)
    
    # Add category badge
    try:
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 16)
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
    except:
        font_small = ImageFont.load_default()
        font_large = ImageFont.load_default()
    
    # Category badge
    category_bbox = draw.textbbox((0, 0), category, font=font_small)
    category_width = category_bbox[2] - category_bbox[0]
    category_x = width - category_width - 30
    category_y = 30
    
    # Draw category background
    draw.rectangle([category_x - 10, category_y - 5, category_x + category_width + 10, category_y + 25], 
                   fill='#d4af8c', outline='#c9a876')
    
    # Add category text
    draw.text((category_x, category_y), category, font=font_small, fill='#ffffff')
    
    # Add blog title
    title_bbox = draw.textbbox((0, 0), title, font=font_large)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (width - title_width) // 2
    title_y = height // 2 - 20
    
    # Add title shadow
    draw.text((title_x + 2, title_y + 2), title, font=font_large, fill='#6c757d')
    # Add main title
    draw.text((title_x, title_y), title, font=font_large, fill='#495057')
    
    # Add blog icon
    icon_size = 40
    icon_x = width // 2 - icon_size // 2
    icon_y = title_y + 50
    
    # Draw blog icon (simplified)
    draw.ellipse([icon_x, icon_y, icon_x + icon_size, icon_y + icon_size], 
                 outline='#d4af8c', width=3)
    draw.ellipse([icon_x + 5, icon_y + 5, icon_x + icon_size - 5, icon_y + icon_size - 5], 
                 outline='#d4af8c', width=2)
    
    # Add a subtle pattern
    for i in range(0, width, 40):
        for j in range(0, height, 40):
            if (i + j) % 80 == 0:
                draw.point((i, j), fill='#e9ecef')
    
    # Save the image
    filepath = f"/var/www/karaweiss/casapetrankcom/frontend/public/images/blog/{filename}"
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    img.save(filepath, 'JPEG', quality=85)
    
    print(f"✅ Created blog image: {filename}")

def main():
    """Create all blog images"""
    print("🎨 Creating blog placeholder images...")
    
    blog_images = [
        ("Boho Styling Tipps", "STYLING", "boho-styling.jpg"),
        ("Schmuck Pflege", "PFLEGE", "schmuck-pflege.jpg"),
        ("Boho Trends 2024", "TRENDS", "boho-trends-2024.jpg"),
        ("Handgefertigt", "INSPIRATION", "handgefertigt-schmuck.jpg")
    ]
    
    for title, category, filename in blog_images:
        create_blog_image(600, 400, title, category, filename)
    
    print("\n🎉 All blog images created successfully!")

if __name__ == "__main__":
    main()
