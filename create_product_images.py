#!/usr/bin/env python3
"""
Create realistic product placeholder images
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_product_image(width, height, product_name, price, filename):
    """Create a realistic product placeholder image"""
    
    # Create image with a clean background
    img = Image.new('RGB', (width, height), color='#f8f9fa')
    draw = ImageDraw.Draw(img)
    
    # Add a subtle gradient effect
    for y in range(height):
        color_value = int(248 + (y / height) * 7)  # Light gradient
        draw.line([(0, y), (width, y)], fill=(color_value, color_value, color_value))
    
    # Add a product frame
    frame_margin = 20
    frame_color = '#e9ecef'
    draw.rectangle([frame_margin, frame_margin, width-frame_margin, height-frame_margin], 
                   outline=frame_color, width=2)
    
    # Add inner shadow effect
    shadow_color = '#dee2e6'
    for i in range(3):
        draw.rectangle([frame_margin+i, frame_margin+i, width-frame_margin-i, height-frame_margin-i], 
                       outline=shadow_color, width=1)
    
    # Add product name
    try:
        # Try to use a nice font
        font_large = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
        font_small = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
    except:
        # Fallback to default font
        font_large = ImageFont.load_default()
        font_small = ImageFont.load_default()
    
    # Calculate text position
    text_bbox = draw.textbbox((0, 0), product_name, font=font_large)
    text_width = text_bbox[2] - text_bbox[0]
    text_x = (width - text_width) // 2
    text_y = height // 2 - 30
    
    # Add text shadow
    draw.text((text_x + 2, text_y + 2), product_name, font=font_large, fill='#6c757d')
    # Add main text
    draw.text((text_x, text_y), product_name, font=font_large, fill='#495057')
    
    # Add price
    price_text = f"ab {price}"
    price_bbox = draw.textbbox((0, 0), price_text, font=font_small)
    price_width = price_bbox[2] - price_bbox[0]
    price_x = (width - price_width) // 2
    price_y = text_y + 40
    
    # Add price shadow
    draw.text((price_x + 1, price_y + 1), price_text, font=font_small, fill='#6c757d')
    # Add main price
    draw.text((price_x, price_y), price_text, font=font_small, fill='#28a745')
    
    # Add a subtle pattern
    for i in range(0, width, 40):
        for j in range(0, height, 40):
            if (i + j) % 80 == 0:
                draw.point((i, j), fill='#e9ecef')
    
    # Save the image
    filepath = f"/var/www/karaweiss/casapetrankcom/frontend/public/images/products/{filename}"
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    img.save(filepath, 'JPEG', quality=85)
    
    print(f"✅ Created: {filename}")

def create_category_image(width, height, category_name, filename):
    """Create a category placeholder image"""
    
    # Create image with category-specific colors
    colors = {
        'armbaender': '#d4af8c',
        'ketten': '#c9a876', 
        'fussketchen': '#b8a082',
        'modeschmuck': '#a68b5b',
        'kleider': '#d4af8c',
        'oberteile': '#c9a876',
        'taschen': '#b8a082',
        'new-arrivals': '#e8d5b7'
    }
    
    base_color = colors.get(category_name.lower(), '#d4af8c')
    
    img = Image.new('RGB', (width, height), color=base_color)
    draw = ImageDraw.Draw(img)
    
    # Add gradient effect
    for y in range(height):
        factor = y / height
        r = int(int(base_color[1:3], 16) * (0.8 + 0.2 * factor))
        g = int(int(base_color[3:5], 16) * (0.8 + 0.2 * factor))
        b = int(int(base_color[5:7], 16) * (0.8 + 0.2 * factor))
        color = (r, g, b)
        draw.line([(0, y), (width, y)], fill=color)
    
    # Add decorative elements
    # Outer border
    draw.rectangle([0, 0, width-1, height-1], outline='#ffffff', width=2)
    
    # Inner border
    draw.rectangle([10, 10, width-11, height-11], outline='#ffffff', width=1)
    
    # Add category name
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
    except:
        font = ImageFont.load_default()
    
    # Calculate text position
    text_bbox = draw.textbbox((0, 0), category_name, font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_x = (width - text_width) // 2
    text_y = height // 2 - 10
    
    # Add text shadow
    draw.text((text_x + 2, text_y + 2), category_name, font=font, fill='#ffffff')
    # Add main text
    draw.text((text_x, text_y), category_name, font=font, fill='#ffffff')
    
    # Add some decorative dots
    for i in range(5):
        x = 20 + i * (width - 40) // 4
        y = height - 30
        draw.ellipse([x-3, y-3, x+3, y+3], fill='#ffffff')
    
    # Save the image
    filepath = f"/var/www/karaweiss/casapetrankcom/frontend/public/images/categories/{filename}"
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    img.save(filepath, 'JPEG', quality=85)
    
    print(f"✅ Created category: {filename}")

def main():
    """Create all product and category images"""
    print("🎨 Creating realistic product and category images...")
    
    # Product images
    products = [
        ("Maxi Kleid SICILIA", "149,00 €", "sicilia-dress.jpg"),
        ("KORSIKA Kette", "49,90 €", "korsika-kette.jpg"),
        ("GOBI Kimono", "54,90 €", "gobi-kimono.jpg"),
        ("MARIA Kette", "69,90 €", "maria-kette.jpg"),
        ("TIBET Armband", "32,90 €", "tibet-armband.jpg"),
        ("Weißes Kleid", "105,00 €", "weisses-kleid.jpg"),
        ("Flügel Anhänger", "9,90 €", "fluegel-anhaenger.jpg"),
        ("LOURDES Kette", "59,90 €", "lourdes-kette.jpg")
    ]
    
    for product_name, price, filename in products:
        create_product_image(400, 400, product_name, price, filename)
    
    # Category images
    categories = [
        ("NEW ARRIVALS", "new-arrivals.jpg"),
        ("BOHO-ARMBÄNDER", "boho-armbaender.jpg"),
        ("BOHO-KETTEN", "boho-ketten.jpg"),
        ("BOHO-ANHÄNGER", "boho-anhaenger.jpg"),
        ("BOHO-KLEIDER", "boho-kleider.jpg"),
        ("OBERTEILE", "oberteile.jpg")
    ]
    
    for category_name, filename in categories:
        create_category_image(300, 200, category_name, filename)
    
    print("\n🎉 All images created successfully!")

if __name__ == "__main__":
    main()
