# Horários de Missas - Diocese Uberlândia

Este repositório contém um site estático que exibe horários de missas das paróquias da Diocese de Uberlândia, com dados coletados de elodafe.com.br.

## Como funciona

- O site é hospedado via GitHub Pages
- Os dados são coletados através de um scraper
- O arquivo `data/paroquias.json` contém todos os dados exibidos no site

## Como atualizar os dados

Para manter os dados atualizados, siga estas etapas:

1. Clone o repositório em seu computador
   ```
   git clone https://github.com/seu-usuario/horarios-missa.git
   cd horarios-missa
   ```

2. Instale as dependências necessárias
   ```
   pip install requests beautifulsoup4
   ```

3. Execute o scraper para atualizar os dados
   ```
   python scraper.py
   ```

4. Envie as alterações para o GitHub
   ```
   git add data/paroquias.json
   git commit -m "Atualiza dados de horários de missa"
   git push
   ```

5. O GitHub Pages atualizará automaticamente o site com os novos dados

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