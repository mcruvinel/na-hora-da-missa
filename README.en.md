# Mass Times - Diocese of Uberlândia

This repository contains a static website that displays mass times for the parishes of the Diocese of Uberlândia, with data collected from elodafe.com.br.

## How it works

- The site is hosted via GitHub Pages
- The data is collected through a scraper
- The file `data/churches.json` contains all data about mass times and locations displayed on the site
- The file `data/leitura-diaria.json` contains all data about daily liturgical readings

## How I keep the data updated

- Every day, at 03:00AM - UTC-03:00, the schedule is updated with the portal of the Diocese of Uberlândia.

## Update frequency

It is recommended to update the data at least once a month, or whenever there are significant changes in the mass schedules.

## Project structure

- `index.html` - Main page of the site
- `css/style.css` - Site styles
- `js/app.js` - Script to load and display mass schedule data
- `js/daily-readings.js` - Script to load and display daily liturgical reading data
- `data/churches.json` - Data collected by the scraper for mass schedules
- `data/leitura-diaria.json` - Data collected by the scraper for daily liturgical readings
- `scraper.py` - Script to collect updated data of mass schedules
- `daily_liturgy.py` - Script to collect data of daily liturgical readings

## Questions and Suggestions

If you have any questions or suggestions, contact by email: contato.nahoradamissa@gmail.com

This project is for non-commercial use. The data belongs to the respective parishes and is collected only to facilitate access to public information.

## Contributing

We welcome small, focused PRs:

    UI/UX polish, accessibility, copy updates
    Better errors and edge case handling
    Non-invasive code comments / docs
    Build/dev workflow improvements

Check the CONTRIBUTING.Md file.
