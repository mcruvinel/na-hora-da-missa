import requests
from bs4 import BeautifulSoup
import time
import json
import os
import re
from datetime import datetime

def scrape_churches():
    """Main function to scrape churches and their mass schedules"""
    base_url = "https://elodafe.com.br/paroquia/"
    headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
    
    print(f"🔎 Making request to {base_url}...")
    response = requests.get(base_url, headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Error accessing the main page. Status Code: {response.status_code}")
        return []
        
    print(f"✅ Connection successful! Status Code: {response.status_code}")
    soup = BeautifulSoup(response.text, "html.parser")
    
    # Find all links that might be churches
    church_links = []
    for a in soup.find_all('a'):
        href = a.get('href')
        if href and 'paroquia' in href and href not in [l['url'] for l in church_links]:
            title = a.text.strip() or href.split('/')[-2].replace('-', ' ').title()
            church_links.append({'url': href, 'title': title})
    
    print(f"🔎 Found {len(church_links)} unique churches.")
    
    results = []
    days_of_week = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
    
    for idx, church in enumerate(church_links):
        try:
            link = church['url']
            name = church['title']
            
            print(f"🏛 ({idx+1}/{len(church_links)}) Accessing {name}")
            if name == "Paróquias":
                continue
            time.sleep(1)  # Prevent overloading the server
            church_response = requests.get(link, headers=headers)
            
            if church_response.status_code != 200:
                print(f"❌ Error accessing {name} (Status Code: {church_response.status_code})")
                continue
                
            church_soup = BeautifulSoup(church_response.text, "html.parser")
            
            # Extract the church address
            church_address = None
            address_element = church_soup.find('p', class_='address') or church_soup.find('address')
            if address_element:
                church_address = address_element.text.strip()
            
            communities = []
            current_community = None
            community_schedule = []
            
            main_content = church_soup.find('div', class_='entry-content') or church_soup
            paragraphs = main_content.find_all(['p', 'h2', 'h3', 'h4', 'h5', 'strong', 'li'])
            
            for p in paragraphs:
                text = p.text.strip()
                if not text:
                    continue
                
                if (re.match(r'^\d+\.?\s+', text) or 
                    'Comunidade' in text or 
                    'Igreja' in text or 
                    'Capela' in text or
                    'Matriz' in text or
                    'Paróquia' in text) and len(text) < 200:
                    
                    if current_community:
                        if community_schedule:
                            communities.append({
                                "name": current_community,
                                "schedule": community_schedule,
                                "address": None  # Placeholder for community address
                            })
                        community_schedule = []
                    
                    current_community = text
                
                elif current_community and (any(day in text for day in days_of_week) or 
                      re.search(r'\d{1,2}[h:]\d{0,2}', text.lower())):
                    community_schedule.append(text)
            
            if current_community and community_schedule:
                communities.append({
                    "name": current_community,
                    "schedule": community_schedule,
                    "address": None
                })
            
            if not communities:
                schedule_elements = main_content.find_all(
                    ["p", "li", "div", "span"], 
                    string=lambda text: text and (
                        any(day in text for day in days_of_week) or 
                        re.search(r'\d{1,2}[h:]\d{0,2}', text.lower()) or
                        "missa" in text.lower() or 
                        "celebração" in text.lower()
                    )
                )
                
                # general_schedule = []
                # for el in schedule_elements:
                #     text = el.text.strip()
                #     if text and len(text) < 300:
                #         if not any(text in h or h in text for h in general_schedule):
                #             general_schedule.append(text)
                
                # if general_schedule:
                #     communities.append({
                #         "name": "General Schedule", 
                #         "schedule": general_schedule,
                #         "address": None
                #     })
            
            # Only add churches that have valid schedules
            if any(comm["schedule"] for comm in communities):
                print(f"✅ Found {len(communities)} communities with schedules for {name}")
                results.append({
                    "name": name,
                    "link": link,
                    "address": church_address,
                    "communities": communities
                })
            else:
                print(f"⚠ No valid schedule found for {name}, skipping")
                
        except Exception as e:
            print(f"❌ Error processing church {idx+1}: {e}")
    
    return results

def main():
    """Main function that runs the scraper and saves the data"""
    os.makedirs("data", exist_ok=True)
    
    print("🚀 Starting church scraping...")
    churches = scrape_churches()
    
    if not churches:
        print("❌ No valid churches found.")
        return
    
    data = {
        "collection_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_churches": len(churches),
        "churches": churches
    }
    
    with open("data/churches.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Data from {len(churches)} churches saved in data/churches.json")

if __name__ == "__main__":
    main()