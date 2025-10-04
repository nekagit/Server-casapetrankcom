#!/usr/bin/env python3
"""
Scrape images from Casa Petrada website
"""

import requests
from bs4 import BeautifulSoup
import os
import time
from urllib.parse import urljoin, urlparse
import re

def scrape_website_images():
    """Scrape images from the Casa Petrada website"""
    base_url = "https://casa-petrada.de"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        print("🔍 Scraping Casa Petrada website for images...")
        response = requests.get(base_url, headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all images
        images = soup.find_all('img')
        
        print(f"📸 Found {len(images)} images on the website")
        
        # Filter for product and category images
        product_images = []
        category_images = []
        
        for img in images:
            src = img.get('src') or img.get('data-src')
            if not src:
                continue
                
            # Convert relative URLs to absolute
            full_url = urljoin(base_url, src)
            
            # Skip very small images (likely icons)
            if 'w=' in full_url:
                try:
                    width = int(re.search(r'w=(\d+)', full_url).group(1))
                    if width < 200:
                        continue
                except:
                    pass
            
            # Categorize images
            if any(keyword in full_url.lower() for keyword in ['product', 'kleid', 'kette', 'armband', 'kimono']):
                product_images.append(full_url)
            elif any(keyword in full_url.lower() for keyword in ['category', 'banner', 'hero', 'collection']):
                category_images.append(full_url)
            else:
                # Check if it's a large image that might be useful
                if any(size in full_url for size in ['800x', '600x', '400x', 'large', 'medium']):
                    product_images.append(full_url)
        
        print(f"🛍️  Product images found: {len(product_images)}")
        print(f"📂 Category images found: {len(category_images)}")
        
        return product_images, category_images
        
    except Exception as e:
        print(f"❌ Error scraping website: {e}")
        return [], []

def download_image(url, filepath):
    """Download an image from URL and save to filepath"""
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
        
        response = requests.get(url, headers=headers, timeout=30)
        response.raise_for_status()
        
        # Create directory if it doesn't exist
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'wb') as f:
            f.write(response.content)
        
        print(f"✅ Downloaded: {os.path.basename(filepath)}")
        return True
        
    except Exception as e:
        print(f"❌ Failed to download {url}: {e}")
        return False

def main():
    """Main function"""
    print("🖼️  Starting image scraping and download...")
    
    # Scrape images from website
    product_urls, category_urls = scrape_website_images()
    
    if not product_urls and not category_urls:
        print("❌ No images found to download")
        return
    
    base_path = "/var/www/karaweiss/casapetrankcom/frontend/public/images"
    
    # Download product images
    success_count = 0
    total_count = 0
    
    # Download first few product images
    for i, url in enumerate(product_urls[:8]):  # Limit to 8 product images
        filename = f"product_{i+1}.jpg"
        filepath = os.path.join(base_path, "products", filename)
        
        if download_image(url, filepath):
            success_count += 1
        total_count += 1
        time.sleep(0.5)
    
    # Download first few category images
    for i, url in enumerate(category_urls[:6]):  # Limit to 6 category images
        filename = f"category_{i+1}.jpg"
        filepath = os.path.join(base_path, "categories", filename)
        
        if download_image(url, filepath):
            success_count += 1
        total_count += 1
        time.sleep(0.5)
    
    print(f"\n📊 Download Summary:")
    print(f"✅ Successfully downloaded: {success_count}/{total_count} images")

if __name__ == "__main__":
    main()
