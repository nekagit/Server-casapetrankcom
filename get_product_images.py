#!/usr/bin/env python3
"""
Get specific product images from Casa Petrada
"""

import requests
from bs4 import BeautifulSoup
import os
import time
from urllib.parse import urljoin
import re

def get_product_images():
    """Get images from specific product pages"""
    
    # Product URLs from the original website
    product_pages = [
        "https://casa-petrada.de/products/maxi-kleid-schwarz-sicilia-mit-volants-und-broderie-anglaise",
        "https://casa-petrada.de/products/korsika-boho-kette-mit-buddha-anhaenger", 
        "https://casa-petrada.de/products/kimono-gobi-mit-fransen-und-print",
        "https://casa-petrada.de/products/maria-lange-boho-kette-mit-einem-grossen-kreuzanhaenger",
        "https://casa-petrada.de/products/tibet-armband-aus-dzi-beads",
        "https://casa-petrada.de/products/boho-kleid-in-weiss-mit-stickerei-in-schwarz-von-piti-cuiti",
        "https://casa-petrada.de/products/boho-schmuck-anhaenger-fluegel-silvershiny-der-firma-schautime",
        "https://casa-petrada.de/products/lourdes-kurze-kette-mit-madonna-anhaenger"
    ]
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    base_path = "/var/www/karaweiss/casapetrankcom/frontend/public/images/products"
    
    # Mapping of product names to our filenames
    product_mapping = {
        "sicilia": "sicilia-dress.jpg",
        "korsika": "korsika-kette.jpg", 
        "gobi": "gobi-kimono.jpg",
        "maria": "maria-kette.jpg",
        "tibet": "tibet-armband.jpg",
        "weiss": "weisses-kleid.jpg",
        "fluegel": "fluegel-anhaenger.jpg",
        "lourdes": "lourdes-kette.jpg"
    }
    
    success_count = 0
    
    for i, url in enumerate(product_pages):
        try:
            print(f"🔍 Scraping product page {i+1}: {url}")
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            
            soup = BeautifulSoup(response.content, 'html.parser')
            
            # Find product images
            images = soup.find_all('img')
            
            for img in images:
                src = img.get('src') or img.get('data-src')
                if not src:
                    continue
                    
                full_url = urljoin(url, src)
                
                # Look for product images (usually contain product-related keywords)
                if any(keyword in full_url.lower() for keyword in ['product', 'kleid', 'kette', 'armband', 'kimono', 'anhaenger']):
                    # Determine filename based on URL content
                    filename = None
                    for key, value in product_mapping.items():
                        if key in full_url.lower() or key in url.lower():
                            filename = value
                            break
                    
                    if filename:
                        filepath = os.path.join(base_path, filename)
                        
                        # Download the image
                        try:
                            img_response = requests.get(full_url, headers=headers, timeout=30)
                            img_response.raise_for_status()
                            
                            with open(filepath, 'wb') as f:
                                f.write(img_response.content)
                            
                            print(f"✅ Downloaded: {filename}")
                            success_count += 1
                            break  # Found the main product image, move to next product
                            
                        except Exception as e:
                            print(f"❌ Failed to download {full_url}: {e}")
            
            time.sleep(1)  # Be respectful
            
        except Exception as e:
            print(f"❌ Error scraping {url}: {e}")
    
    print(f"\n📊 Product Images Summary:")
    print(f"✅ Successfully downloaded: {success_count} product images")

def get_category_images():
    """Get category images from the main page"""
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        print("🔍 Getting category images from main page...")
        response = requests.get("https://casa-petrada.de", headers=headers, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Look for category images in specific sections
        category_sections = soup.find_all(['div', 'section'], class_=re.compile(r'category|collection|feature'))
        
        base_path = "/var/www/karaweiss/casapetrankcom/frontend/public/images/categories"
        
        # Category mapping
        category_mapping = {
            "armband": "boho-armbaender.jpg",
            "kette": "boho-ketten.jpg", 
            "anhaenger": "boho-anhaenger.jpg",
            "kleid": "boho-kleider.jpg",
            "oberteil": "oberteile.jpg",
            "new": "new-arrivals.jpg"
        }
        
        success_count = 0
        
        for section in category_sections:
            images = section.find_all('img')
            
            for img in images:
                src = img.get('src') or img.get('data-src')
                if not src:
                    continue
                    
                full_url = urljoin("https://casa-petrada.de", src)
                
                # Determine category filename
                filename = None
                for key, value in category_mapping.items():
                    if key in full_url.lower() or key in str(img.get('alt', '')).lower():
                        filename = value
                        break
                
                if filename:
                    filepath = os.path.join(base_path, filename)
                    
                    try:
                        img_response = requests.get(full_url, headers=headers, timeout=30)
                        img_response.raise_for_status()
                        
                        with open(filepath, 'wb') as f:
                            f.write(img_response.content)
                        
                        print(f"✅ Downloaded category: {filename}")
                        success_count += 1
                        
                    except Exception as e:
                        print(f"❌ Failed to download {full_url}: {e}")
        
        print(f"\n📊 Category Images Summary:")
        print(f"✅ Successfully downloaded: {success_count} category images")
        
    except Exception as e:
        print(f"❌ Error getting category images: {e}")

def main():
    """Main function"""
    print("🖼️  Getting product and category images from Casa Petrada...")
    
    get_product_images()
    get_category_images()
    
    print("\n🎉 Image download process completed!")

if __name__ == "__main__":
    main()
