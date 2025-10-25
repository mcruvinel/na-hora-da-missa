# Horários de Missas - Diocese Uberlândia

Este repositório contém um site estático que exibe horários de missas das paróquias da Diocese de Uberlândia, com dados coletados de elodafe.com.br.

## Como funciona

- O site é hospedado via GitHub Pages
- Os dados são coletados através de um scraper
- O arquivo `data/churches.json` contém todos os dados sobre horários e locias de missa exibidos no site
- O arquivo `data/leitura-diaria.json` contém todos os dados sobre as leituras litúrgicas diárias

## Como mantenho os dados atualizados

- Todos os dias, as 03:00AM - UTC-03:00, o horarío é atualizado com o portal da diocese de Uberlândia.

## Frequência de atualização

Recomenda-se atualizar os dados pelo menos uma vez por mês, ou sempre que houver alterações significativas nos horários das missas.

## Estrutura do projeto

- `index.html` - Página principal do site
- `css/style.css` - Estilos do site
- `js/app.js` - Script para carregar e exibir os dados dos horários de missas
- `js/daily-readings.js - Script para carregar e exibir os dados das leituras litúrgicas diárias.`
- `data/churchers.json` - Dados coletados pelo scraper dos horários de missas
- `data/leitura-diaria.json` - Dados coletados pelo scraper da leitura litúrgica diária.
- `scraper.py` - Script para coletar os dados atualizados dos horarios de missas.
- `daily_liturgy.py` - Script para coletaros dados da leitura litúrgica diária.

## Duvidas e Sugestões

Se tiver alguma dúvida ou sugestão, entre em contato pelo email: contato.nahoradamissa@gmail.com

Este projeto é para uso não-comercial. Os dados pertencem às respectivas paróquias e são coletados apenas para facilitar o acesso às informações públicas.

## Contributing

We welcome small, focused PRs:

    UI/UX polish, accessibility, copy updates
    Better errors and edge case handling
    Non-invasive code comments / docs
    Build/dev workflow improvements
