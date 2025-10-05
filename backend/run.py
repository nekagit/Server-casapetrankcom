#!/usr/bin/env python3
"""
Casa Petrada Backend Development Server
"""

import uvicorn
import os
from pathlib import Path

if __name__ == "__main__":
    # Get the directory of this script
    backend_dir = Path(__file__).parent
    
    # Change to backend directory
    os.chdir(backend_dir)
    
    # Run the FastAPI server
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[str(backend_dir)],
        log_level="info"
    )

