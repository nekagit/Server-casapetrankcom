# Casa Petrada E-commerce Website

A complete e-commerce website recreation of Casa Petrada (https://casa-petrada.de), a German handmade Boho jewelry and fashion store.

## Project Structure

```
casapetrankcom/
├── frontend/              # Astro + TypeScript + Tailwind CSS frontend
│   ├── src/
│   │   ├── components/    # Astro components
│   │   ├── layouts/       # Astro layouts
│   │   ├── pages/         # Astro pages (file-based routing)
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript type definitions
│   │   ├── utils/         # Utility functions
│   │   └── styles/        # Global styles and Tailwind config
│   ├── public/
│   │   └── images/        # Product and category images
│   ├── astro.config.mjs   # Astro configuration
│   ├── tailwind.config.mjs # Tailwind CSS configuration
│   └── package.json       # Frontend dependencies
├── backend/               # FastAPI Python backend
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── core/          # Configuration and database
│   │   ├── models/        # Database models
│   │   └── schemas/       # Pydantic schemas
│   ├── main.py            # FastAPI application entry point
│   ├── run.py             # Development server script
│   └── requirements.txt   # Python dependencies
├── scripts/               # Development and deployment scripts
│   ├── start-astro-dev.sh # Start both frontend and backend
│   └── deploy.sh          # Deployment script
├── .cursorrules           # Development rules and guidelines
├── .gitignore            # Git ignore patterns
├── package.json          # Root project scripts and metadata
└── README.md             # Project documentation
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

### Quick Start

```bash
# Install all dependencies
npm run install:all

# Start both frontend and backend
npm run dev
# or
./dev.sh
```

### Individual Development

#### Frontend Development

```bash
npm run frontend
# or
cd frontend && npm run dev
```

The frontend will be available at http://localhost:4321

#### Backend Development

```bash
npm run backend
# or
cd backend && python run.py
```

The backend API will be available at http://localhost:8000

## Available Scripts

### Root Level Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run frontend         # Start only frontend
npm run backend          # Start only backend
npm run build            # Build frontend for production
npm run preview          # Preview built frontend

# Installation
npm run install:all      # Install all dependencies (frontend + backend)

# Maintenance
npm run clean            # Clean Python cache files
npm run deploy           # Deploy to production
```

### Frontend Scripts

```bash
cd frontend
npm run dev              # Start Astro dev server
npm run build            # Build for production
npm run preview          # Preview production build
npm run astro            # Run Astro CLI commands
```

### Backend Scripts

```bash
cd backend
python run.py            # Start FastAPI dev server
uvicorn main:app --reload # Alternative start method
```

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

- **Frontend**: Astro, TypeScript, Tailwind CSS, Vite
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL
- **Styling**: Tailwind CSS with custom design tokens
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
