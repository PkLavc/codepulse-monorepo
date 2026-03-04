#!/usr/bin/env python3
"""
Simple local server for CodePulse static HTML
Opens the index.html in your default browser
"""

import os
import webbrowser
from pathlib import Path

def main():
    project_root = Path(__file__).parent.resolve()
    html_file = project_root / "index.html"
    
    print("=" * 60)
    print("CodePulse - Local Viewer")
    print("=" * 60)
    print(f"[INFO] Arquivo HTML: {html_file}")
    print(f"[INFO] Abrindo no navegador...")
    
    # Abrir arquivo HTML no navegador padrão
    file_url = f"file:///{str(html_file).replace(chr(92), '/')}"
    webbrowser.open(file_url)
    
    print(f"[SUCCESS] Arquivo aberto: {file_url}")
    print("=" * 60)

if __name__ == "__main__":
    main()
