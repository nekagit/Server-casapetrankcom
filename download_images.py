#!/usr/bin/env python3
"""
Download images from Casa Petrada website
"""

import requests
import os
from urllib.parse import urljoin, urlparse
import time

# Base URL of the original website
BASE_URL = "https://casa-petrada.de"

# Image URLs from the original website (these would need to be updated with actual URLs)
IMAGE_URLS = {
    # Product images
    "sicilia-dress.jpg": "https://casa-petrada.de/cdn/shop/products/sicilia-kleid.jpg",
    "korsika-kette.jpg": "https://casa-petrada.de/cdn/shop/products/korsika-kette.jpg", 
    "gobi-kimono.jpg": "https://casa-petrada.de/cdn/shop/products/gobi-kimono.jpg",
    "maria-kette.jpg": "https://casa-petrada.de/cdn/shop/products/maria-kette.jpg",
    "tibet-armband.jpg": "https://casa-petrada.de/cdn/shop/products/tibet-armband.jpg",
    "weisses-kleid.jpg": "https://casa-petrada.de/cdn/shop/products/weisses-kleid.jpg",
    "fluegel-anhaenger.jpg": "https://casa-petrada.de/cdn/shop/products/fluegel-anhaenger.jpg",
    "lourdes-kette.jpg": "https://casa-petrada.de/cdn/shop/products/lourdes-kette.jpg",
    
    # Category images
    "new-arrivals.jpg": "https://casa-petrada.de/cdn/shop/files/new-arrivals.jpg",
    "boho-armbaender.jpg": "https://casa-petrada.de/cdn/shop/files/boho-armbaender.jpg",
    "boho-ketten.jpg": "https://casa-petrada.de/cdn/shop/files/boho-ketten.jpg",
    "boho-anhaenger.jpg": "https://casa-petrada.de/cdn/shop/files/boho-anhaenger.jpg",
    "boho-kleider.jpg": "https://casa-petrada.de/cdn/shop/files/boho-kleider.jpg",
    "oberteile.jpg": "https://casa-petrada.de/cdn/shop/files/oberteile.jpg",
}

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
    """Download all images"""
    print("🖼️  Starting image download from Casa Petrada...")
    
    base_path = "/var/www/karaweiss/casapetrankcom/frontend/public/images"
    
    success_count = 0
    total_count = len(IMAGE_URLS)
    
    for filename, url in IMAGE_URLS.items():
        # Determine if it's a product or category image
        if filename.startswith(('sicilia', 'korsika', 'gobi', 'maria', 'tibet', 'weisses', 'fluegel', 'lourdes')):
            filepath = os.path.join(base_path, "products", filename)
        else:
            filepath = os.path.join(base_path, "categories", filename)
        
        if download_image(url, filepath):
            success_count += 1
        
        # Be respectful - add a small delay
        time.sleep(0.5)
    
    print(f"\n📊 Download Summary:")
    print(f"✅ Successfully downloaded: {success_count}/{total_count} images")
    print(f"❌ Failed downloads: {total_count - success_count}/{total_count} images")

if __name__ == "__main__":
    main()
