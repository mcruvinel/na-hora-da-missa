# Horários de Missas - Diocese Uberlândia

Este repositório contém um site estático que exibe horários de missas das paróquias da Diocese de Uberlândia, com dados coletados de elodafe.com.br.

## Como funciona

- O site é hospedado via GitHub Pages
- Os dados são coletados através de um scraper
- O arquivo `data/paroquias.json` contém todos os dados exibidos no site

## Como mantenho os dados atualizados

- Todos os dias, as 03:00AM - UTC-03:00, o horarío é atualizado com o portal da diocese de Uberlândia.

## Frequência de atualização

Recomenda-se atualizar os dados pelo menos uma vez por mês, ou sempre que houver alterações significativas nos horários das missas.

## Estrutura do projeto

- `index.html` - Página principal do site
- `css/style.css` - Estilos do site
- `js/app.js` - Script para carregar e exibir os dados
- `data/paroquias.json` - Dados coletados pelo scraper
- `scraper.py` - Script para coletar os dados atualizados

## Licença

Este projeto é para uso não-comercial. Os dados pertencem às respectivas paróquias e são coletados apenas para facilitar o acesso às informações públicas.