import requests
from bs4 import BeautifulSoup
import time
import json
import os
import re
from datetime import datetime

def extract_church_address(church_soup):
    """
    Optimized function to extract church addresses, focusing on the specific format shown.
    """
    # Get the full text of the page
    page_text = church_soup.text

    # 1. Search for the "CONTATO" section and the following line containing an address
    contato_match = re.search(r'CONTATO\s*\n(Rua[^,\n]{2,50},?\s*\d+[^,\n]{0,50}(?:-|,)[^,\n]{2,50}(?:/[A-Z]{2})?)', page_text)
    if contato_match:
        return contato_match.group(1).strip()
    
    # 2. Search for specific address patterns with street, number, and neighborhood
    address_match = re.search(r'(Rua[^,\n]{2,50},?\s*\d+\s*(?:-|–)\s*[^,\n]{2,50}(?:/[A-Z]{2})?)', page_text)
    if address_match:
        return address_match.group(1).strip()
    
    # 3. Look for any line starting with "Rua", having a number, and a neighborhood
    lines = page_text.split('\n')
    for line in lines:
        line = line.strip()
        if re.match(r'^Rua[^,\n]{2,50},?\s*\d+', line) and len(line) < 100:
            return line
        
        # For avenues as well
        if re.match(r'^Av[^,\n]{2,50},?\s*\d+', line) and len(line) < 100:
            return line
    
    # 4. For the specific example of "CONTATO" followed by the address line
    for i, line in enumerate(lines):
        if "CONTATO" in line and i < len(lines) - 3:
            for j in range(1, 4):  # Check up to 3 lines after "CONTATO"
                if i + j < len(lines):
                    next_line = lines[i + j].strip()
                    if re.match(r'Rua|Av', next_line) and re.search(r'\d+', next_line):
                        return next_line
    
    # 5. Search for addresses anywhere in the text using a more generic pattern
    address_pattern = re.search(r'(?:Rua|Av|Avenida|R\.|Praça)[^,\n]{2,50},?\s*\d+[^,;\n]{0,50}(?:-|–)[^,;\n]{2,50}', page_text)
    if address_pattern:
        return address_pattern.group(0).strip()
    
    return None

def is_valid_church(church):
    """
    Check if a church entry is valid.
    A church is considered valid if it has a name, link, and at least one community with a valid schedule.
    """
    if not church.get("name") or not church.get("link"):
        return False  # Church must have a name and link
    
    # Check if at least one community has a valid schedule
    for community in church.get("communities", []):
        if community.get("schedule"):
            # Check if the schedule contains valid mass times
            for schedule in community["schedule"]:
                if any(day in schedule for day in ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]):
                    return True  # Valid schedule found
    return False  # No valid schedule found

def scrape_churches():
    """Main function to scrape churches and their mass schedules"""
    # Main URL with the list of churches
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
        if href and any(x in href for x in ['paroquia', 'santuario', 'igreja', 'catedral']) and href not in [l['url'] for l in church_links]:
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
            if name in ["Paróquias", "Regimentos Paroquiais"]:
                continue  # Skip generic names
                
            # Access the church page
            time.sleep(1)  # Pause to avoid overloading the server
            church_response = requests.get(link, headers=headers)
            
            if church_response.status_code != 200:
                print(f"❌ Error accessing {name} (Status Code: {church_response.status_code})")
                continue
                
            church_soup = BeautifulSoup(church_response.text, "html.parser")
            
            # Extract the church address (improved method)
            church_address = extract_church_address(church_soup)
            
            # Look for headers (h2, h3, h4) that might indicate community sections
            communities = []
            current_community = None
            community_schedule = []
            
            # First, look for content in the main body
            main_content = church_soup.find('div', class_='entry-content') or church_soup
            
            # Attempt 1: Look for asterisk structure
            paragraphs = main_content.find_all(['p', 'h2', 'h3', 'h4', 'h5', 'strong', 'li'])
            
            for p in paragraphs:
                text = p.text.strip()
                
                # If the text is empty, skip
                if not text:
                    continue
                
                # Check if it's a community title
                if (re.match(r'^\d+\.?\s+', text) or 
                    'Comunidade' in text or 
                    'Igreja' in text or
                    'Santuário' in text or 
                    'Catedral' in text or
                    'Capela' in text or
                    'Matriz' in text or
                    'Paróquia' in text) and len(text) < 200:
                    
                    # If we were processing a community, save it
                    if current_community:
                        if community_schedule:  # Only add if there are schedules
                            # Try to find the specific community address in nearby text
                            community_address = None
                            for sibling in p.previous_siblings:
                                if sibling.name and sibling.text and ('endereço' in sibling.text.lower() or 
                                                                    'rua' in sibling.text.lower() or 
                                                                    'av' in sibling.text.lower()):
                                    community_address = sibling.text.strip()
                                    break
                            
                            communities.append({
                                "name": current_community,
                                "schedule": community_schedule,
                                "address": community_address  # Add community address if found
                            })
                        community_schedule = []
                    
                    current_community = text
                
                # If we have a current community and the text looks like a schedule
                elif current_community and (any(day in text for day in days_of_week) or 
                      re.search(r'\d{1,2}[h:]\d{0,2}', text.lower())):
                    community_schedule.append(text)
            
            # Add the last community if it exists
            if current_community and community_schedule:
                communities.append({
                    "name": current_community,
                    "schedule": community_schedule,
                    "address": None  # Placeholder for community address
                })
            
            # If we didn't find structured communities, try the general method
            if not communities:
                # Look for elements that mention days of the week, schedules, or masses
                schedule_elements = main_content.find_all(
                    ["p", "li", "div", "span"], 
                    string=lambda text: text and (
                        any(day in text for day in days_of_week) or 
                        re.search(r'\d{1,2}[h:]\d{0,2}', text.lower()) or
                        "missa" in text.lower() or 
                        "celebração" in text.lower()
                    )
                )
                
                general_schedule = []
                for el in schedule_elements:
                    text = el.text.strip()
                    if text and len(text) < 300:  # Avoid very long texts
                        if not any(text in h or h in text for h in general_schedule):
                            general_schedule.append(text)
                
                if general_schedule:
                    communities.append({
                        "name": "General Schedule", 
                        "schedule": general_schedule,
                        "address": None  # Placeholder for community address
                    })
            
            # Check if we found any information
            if communities:
                print(f"✅ Found {len(communities)} communities with schedules for {name}")
                # Add to the results list
                results.append({
                    "name": name,
                    "link": link,
                    "address": church_address,  # Add the church address
                    "communities": communities
                })
            else:
                print(f"⚠ No schedule found for {name}")
                
                # Add even without schedules to keep a record
                results.append({
                    "name": name,
                    "link": link,
                    "address": church_address,  # Add the church address
                    "communities": []
                })
                
        except Exception as e:
            print(f"❌ Error processing church {idx+1}: {e}")
    
    return results

def main():
    """Main function that runs the scraper and saves the data"""
    # Create data folder if it doesn't exist
    os.makedirs("data", exist_ok=True)
    
    print("🚀 Starting church scraping...")
    churches = scrape_churches()
    
    if not churches:
        print("❌ No churches found.")
        return
    
    # Filter out invalid churches
    valid_churches = [church for church in churches if is_valid_church(church)]
    
    # Add collection date and time
    data = {
        "collection_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "total_churches": len(valid_churches),
        "churches": valid_churches
    }
    
    # Save data to JSON
    with open("data/churches.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    
    print(f"\n✅ Data from {len(valid_churches)} churches saved in data/churches.json")

if __name__ == "__main__":
    main()