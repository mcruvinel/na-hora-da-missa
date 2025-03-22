import requests
from bs4 import BeautifulSoup
import json
import os
from datetime import datetime

def extract_readings(soup):
    """
    Extract the daily readings from the Liturgia Diária page.
    """
    readings = {
        "data": datetime.now().strftime("%Y-%m-%d"),
        "primeira_leitura": {"titulo": None, "texto": None},
        "salmo": {"titulo": None, "texto": None},
        "evangelho": {"titulo": None, "texto": None}
    }
    
    # Extract the first reading
    primeira_leitura_div = soup.find("div", id="liturgia-1")
    if primeira_leitura_div:
        titulo = primeira_leitura_div.find("p", text=lambda t: t and "Primeira Leitura" in t)
        texto = primeira_leitura_div.find_all("p")[1:]  # Ignore the first <p> containing the title
        if titulo and texto:
            readings["primeira_leitura"]["titulo"] = titulo.text.strip()
            readings["primeira_leitura"]["texto"] = "\n".join([p.text.strip() for p in texto])
        else:
            print("⚠ First reading title or text not found.")
    else:
        print("⚠ First reading div not found.")
    
    # Extract the psalm
    salmo_div = soup.find("div", id="liturgia-2")
    if salmo_div:
        titulo = salmo_div.find("p", text=lambda t: t and "Responsório" in t)
        texto = salmo_div.find_all("p")[1:]  # Ignore the first <p> containing the title
        if titulo and texto:
            readings["salmo"]["titulo"] = titulo.text.strip()
            readings["salmo"]["texto"] = "\n".join([p.text.strip() for p in texto])
        else:
            print("⚠ Psalm title or text not found.")
    else:
        print("⚠ Psalm div not found.")
    
    # Extract the gospel
    evangelho_div = soup.find("div", id="liturgia-4")
    if evangelho_div:
        titulo = evangelho_div.find("p", text=lambda t: t and "Evangelho" in t)
        texto = evangelho_div.find_all("p")[1:]  # Ignore the first <p> containing the title
        if titulo and texto:
            readings["evangelho"]["titulo"] = titulo.text.strip()
            readings["evangelho"]["texto"] = "\n".join([p.text.strip() for p in texto])
        else:
            print("⚠ Gospel title or text not found.")
    else:
        print("⚠ Gospel div not found.")
    
    return readings

def scrape_daily_readings():
    """
    Main function to scrape the daily readings from the Liturgia Diária website.
    """
    # URL of the Liturgia Diária page
    base_url = "https://liturgia.cancaonova.com/pb/"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    
    print(f"🔎 Making request to {base_url}...")
    response = requests.get(base_url, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Error accessing the main page. Status Code: {response.status_code}")
        return None
        
    print(f"✅ Connection successful! Status Code: {response.status_code}")
    soup = BeautifulSoup(response.text, "html.parser")
    
    # Extract the readings
    readings = extract_readings(soup)
    
    if readings:
        # Save the readings to a JSON file
        os.makedirs("data", exist_ok=True)
        with open("data/leitura-diaria.json", "w", encoding="utf-8") as f:
            json.dump({
                "collection_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "leituras": readings
            }, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Daily readings saved successfully!")
        return readings
    else:
        print("❌ No readings found.")
        return None

if __name__ == "__main__":
    scrape_daily_readings()