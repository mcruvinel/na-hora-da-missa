import requests
from bs4 import BeautifulSoup
import json
import os
from datetime import datetime

def extract_readings(soup):
    readings = {
        "date": datetime.now().strftime("%Y-%m-%d"),
        "first_reading": {"title": None, "text": None},
        "psalm": {"title": None, "text": None},
        "gospel": {"title": None, "text": None}
    }

    # First Reading
    first_div = soup.find("div", id="liturgia-1")
    if first_div:
        paragraphs = first_div.find_all("p")
        if paragraphs:
            readings["first_reading"]["title"] = paragraphs[0].text.strip()
            readings["first_reading"]["text"] = "\n".join(p.text.strip() for p in paragraphs[1:])
    else:
        print("⚠ First reading div not found.")

    # Psalm
    psalm_div = soup.find("div", id="liturgia-2")
    if psalm_div:
        paragraphs = psalm_div.find_all("p")
        if paragraphs:
            readings["psalm"]["title"] = paragraphs[0].text.strip()
            readings["psalm"]["text"] = "\n".join(p.text.strip() for p in paragraphs[1:])
    else:
        print("⚠ Psalm div not found.")

    # Gospel
    gospel_div = soup.find("div", id="liturgia-4")
    if gospel_div:
        paragraphs = gospel_div.find_all("p")
        if paragraphs:
            readings["gospel"]["title"] = paragraphs[0].text.strip()
            readings["gospel"]["text"] = "\n".join(p.text.strip() for p in paragraphs[1:])
    else:
        print("⚠ Gospel div not found.")

    return readings

def scrape_daily_readings():
    url = "https://liturgia.cancaonova.com/pb/"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}

    print(f"🔎 Fetching daily readings from {url}...")
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        print(f"❌ Error accessing the page. Status Code: {response.status_code}")
        return None

    print(f"✅ Connection successful! Status Code: {response.status_code}")
    soup = BeautifulSoup(response.text, "html.parser")

    readings = extract_readings(soup)

    if readings:
        os.makedirs("data", exist_ok=True)
        json_path = "data/daily_readings.json"
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump({
                "collection_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "readings": readings
            }, f, ensure_ascii=False, indent=2)
        print(f"✅ Daily readings saved successfully to {json_path}!")
        return readings
    else:
        print("❌ No readings found.")
        return None

if __name__ == "__main__":
    scrape_daily_readings()
