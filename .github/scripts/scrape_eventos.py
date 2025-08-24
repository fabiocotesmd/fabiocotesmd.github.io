#!/usr/bin/env python3
"""
Script para hacer scraping de eventos de la Sociedad Chilena de Nefrología
y actualizar el cache mensual en el repositorio.
"""

import json
import re
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import os

def scrape_eventos_scn():
    """Extrae eventos de la página de la SCN"""
    url = 'https://www.nefro.cl/web/eventos_webinar.php'
    base_url = 'https://www.nefro.cl/web/'
    
    try:
        response = requests.get(url, timeout=30)
        response.raise_for_status()
        
        soup = BeautifulSoup(response.content, 'html.parser')
        eventos = []
        
        # Buscar todos los enlaces a eventos
        enlaces = soup.find_all('a', href=lambda x: x and 'evento.php' in x)
        
        for enlace in enlaces:
            href = enlace.get('href')
            titulo = enlace.get_text(strip=True)
            
            if not titulo or len(titulo) < 5:
                continue
                
            # Obtener información del contenedor padre
            contenedor_texto = ''
            if enlace.parent:
                contenedor_texto = enlace.parent.get_text()
            
            # Extraer cualquier texto que parezca una fecha
            fecha_patterns = [
                r'\d{1,2}\s+de\s+\w+\s+de\s+\d{4}',
                r'\w+\s+\d{1,2},?\s+\d{4}',
                r'\d{1,2}/\d{1,2}/\d{4}'
            ]
            
            fecha_texto = 'Fecha por confirmar'
            for pattern in fecha_patterns:
                match = re.search(pattern, contenedor_texto, re.IGNORECASE)
                if match:
                    fecha_texto = match.group(0)
                    break
            
            # Construir URL completa
            url_evento = href if href.startswith('http') else base_url + href
            
            eventos.append({
                'titulo': titulo,
                'fecha': fecha_texto,
                'url': url_evento,
                'descripcion': 'Evento de la Sociedad Chilena de Nefrología'
            })
        
        # Limitar a máximo 10 eventos
        return eventos[:10]
        
    except Exception as e:
        print(f"Error al hacer scraping: {e}")
        return []

def update_cache_file(eventos):
    """Actualiza el archivo de cache con los nuevos eventos"""
    now = datetime.now()
    mes_actual = now.month + now.year * 12
    
    cache_data = {
        'mes': mes_actual,
        'eventos': eventos,
        'fecha': now.isoformat()
    }
    
    cache_file_path = 'assets/data/eventos-cache.json'
    
    try:
        with open(cache_file_path, 'w', encoding='utf-8') as f:
            json.dump(cache_data, f, ensure_ascii=False, indent=2)
        
        print(f"Cache actualizado con {len(eventos)} eventos para el mes {mes_actual}")
        return True
        
    except Exception as e:
        print(f"Error al actualizar cache: {e}")
        return False

def main():
    """Función principal"""
    print("Iniciando scraping de eventos SCN...")
    
    # Hacer scraping
    eventos = scrape_eventos_scn()
    
    if not eventos:
        print("No se encontraron eventos. Manteniendo cache anterior.")
        return
    
    print(f"Se encontraron {len(eventos)} eventos:")
    for i, evento in enumerate(eventos, 1):
        print(f"  {i}. {evento['titulo']} - {evento['fecha']}")
    
    # Actualizar cache
    if update_cache_file(eventos):
        print("Cache actualizado exitosamente")
    else:
        print("Error al actualizar cache")

if __name__ == '__main__':
    main()