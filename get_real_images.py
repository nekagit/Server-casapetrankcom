#!/usr/bin/env python3
"""
Get real images from Casa Petrada website by analyzing the actual page
"""

import requests
from bs4 import BeautifulSoup
import os
import time
from urllib.parse import urljoin
import re
import json

def get_images_from_page():
    """Get images by analyzing the actual website structure"""
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        print("🔍 Analyzing Casa Petrada website structure...")
        response = requests.get("https://casa-petrada.de", headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for images in various ways
        all_images = []
        
        # Method 1: Find all img tags
        img_tags = soup.find_all('img')
        for img in img_tags:
            src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
            if src:
                all_images.append(urljoin("https://casa-petrada.de", src))
        
        # Method 2: Look for background images in CSS
        style_tags = soup.find_all('style')
        for style in style_tags:
            if style.string:
                urls = re.findall(r'url\(["\']?([^"\']+)["\']?\)', style.string)
                for url in urls:
                    all_images.append(urljoin("https://casa-petrada.de", url))
        
        # Method 3: Look for data attributes that might contain image URLs
        elements_with_data = soup.find_all(attrs={'data-src': True})
        for element in elements_with_data:
            src = element.get('data-src')
            if src:
                all_images.append(urljoin("https://casa-petrada.de", src))
        
        print(f"📸 Found {len(all_images)} potential image URLs")
        
        # Filter and categorize images
        product_images = []
        category_images = []
        
        for url in all_images:
            # Skip very small images and common web elements
            if any(skip in url.lower() for skip in ['icon', 'logo', 'favicon', 'sprite', 'pixel', 'tracking']):
                continue
            
            # Look for product-related images
            if any(keyword in url.lower() for keyword in ['product', 'kleid', 'kette', 'armband', 'kimono', 'anhaenger', 'dress', 'necklace', 'bracelet']):
                product_images.append(url)
            # Look for category/collection images
            elif any(keyword in url.lower() for keyword in ['category', 'collection', 'banner', 'hero', 'feature', 'boho']):
                category_images.append(url)
            # Look for large images that might be useful
            elif any(size in url for size in ['800x', '600x', '400x', 'large', 'medium', 'original']):
                product_images.append(url)
        
        print(f"🛍️  Product images found: {len(product_images)}")
        print(f"📂 Category images found: {len(category_images)}")
        
        # Download some of the best images
        download_best_images(product_images, category_images)
        
    except Exception as e:
        print(f"❌ Error analyzing website: {e}")

def download_best_images(product_urls, category_urls):
    """Download the best images found"""
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    base_path = "/var/www/karaweiss/casapetrankcom/frontend/public/images"
    
    # Download some product images
    product_count = 0
    for i, url in enumerate(product_urls[:5]):  # Limit to 5 best product images
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            # Check if it's a reasonable size
            if len(response.content) < 5000:  # Skip very small images
                continue
            
            filename = f"real_product_{i+1}.jpg"
            filepath = os.path.join(base_path, "products", filename)
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            print(f"✅ Downloaded real product image: {filename} ({len(response.content)} bytes)")
            product_count += 1
            
        except Exception as e:
            print(f"❌ Failed to download product image {url}: {e}")
        
        time.sleep(0.5)
    
    # Download some category images
    category_count = 0
    for i, url in enumerate(category_urls[:3]):  # Limit to 3 best category images
        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            # Check if it's a reasonable size
            if len(response.content) < 5000:  # Skip very small images
                continue
            
            filename = f"real_category_{i+1}.jpg"
            filepath = os.path.join(base_path, "categories", filename)
            
            with open(filepath, 'wb') as f:
                f.write(response.content)
            
            print(f"✅ Downloaded real category image: {filename} ({len(response.content)} bytes)")
            category_count += 1
            
        except Exception as e:
            print(f"❌ Failed to download category image {url}: {e}")
        
        time.sleep(0.5)
    
    print(f"\n📊 Real Images Summary:")
    print(f"✅ Downloaded {product_count} real product images")
    print(f"✅ Downloaded {category_count} real category images")

def main():
    """Main function"""
    print("🖼️  Getting real images from Casa Petrada website...")
    get_images_from_page()
    print("\n🎉 Real image download completed!")

if __name__ == "__main__":
    main()
