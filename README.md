# Casa Petrada E-commerce Website

A complete e-commerce website recreation of Casa Petrada (https://casa-petrada.de), a German handmade Boho jewelry and fashion store.

## Project Structure

```
casapetrankcom/
├── frontend/          # Vite + TypeScript frontend
│   ├── src/
│   │   ├── main.ts    # Main application logic
│   │   └── style.css  # Complete CSS styling
│   ├── public/
│   │   └── images/    # Product and category images
│   └── index.html     # Main HTML template
├── backend/           # FastAPI Python backend
│   ├── app/
│   │   ├── api/       # API endpoints
│   │   ├── core/      # Configuration and database
│   │   ├── models/    # Database models
│   │   └── schemas/   # Pydantic schemas
│   ├── static/        # Static files and uploads
│   ├── main.py        # FastAPI application
│   └── requirements.txt
└── .cursorfiles       # Comprehensive development rules
```

## Features Implemented

### Frontend
- ✅ Responsive design with mobile navigation
- ✅ Complete Casa Petrada homepage recreation
- ✅ Product catalog structure
- ✅ Shopping cart preparation
- ✅ Search functionality
- ✅ German language content
- ✅ Boho styling with earth tones

### Backend
- ✅ FastAPI application structure
- ✅ Database models (Users, Products, Orders, Reviews)
- ✅ API endpoints structure
- ✅ PostgreSQL integration ready
- ✅ Authentication preparation
- ✅ Product management system

## Getting Started

### Frontend Development

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at http://localhost:5173

### Backend Development

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

The backend API will be available at http://localhost:8000

## Product Categories

- **Armbänder** (Bracelets): Einfacharmbänder, Wickelarmbänder
- **Ketten** (Necklaces): Kurze Ketten, Wechselketten, Anhänger
- **Fußkettchen** (Anklets)
- **Modeschmuck** (Fashion jewelry)
- **Fashion**: Kleider, Oberteile, Accessories
- **Taschen** (Bags)

## Key Features

1. **Handmade Focus**: Emphasizes artisanal, handcrafted jewelry
2. **Boho Style**: Natural materials, earth tones, organic designs
3. **German Market**: German language, EUR pricing, German shipping
4. **Mobile-First**: Responsive design for all devices
5. **E-commerce Ready**: Cart, checkout, user accounts, reviews

## Technical Stack

- **Frontend**: Vite, TypeScript, CSS3, Font Awesome
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Styling**: CSS Variables, Flexbox, Grid
- **Icons**: Font Awesome 6
- **Fonts**: Inter (body), Playfair Display (headings)

## Brand Guidelines

- **Colors**: Earth tones, beiges, soft pinks, natural browns
- **Typography**: Clean, readable fonts with elegant headings
- **Imagery**: High-quality product photos, lifestyle shots
- **Tone**: Personal, artisanal, natural, feminine

## Development Rules

See `.cursorfiles` for comprehensive development guidelines including:
- Brand identity and design principles
- Technical requirements and standards
- Content guidelines and SEO requirements
- Business logic and e-commerce features

## Next Steps

1. Add product images to `public/images/`
2. Implement product detail pages
3. Add shopping cart functionality
4. Set up user authentication
5. Implement payment processing
6. Add admin panel for product management

## License

This project is created for educational purposes, recreating the Casa Petrada website design and functionality.
