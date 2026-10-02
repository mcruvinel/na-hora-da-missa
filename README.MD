# Hora da Missa

Horários de missa das paróquias da Diocese de Uberlândia e as leituras do dia. Hoje é um site estático; o próximo passo é o app para iOS e Android.

## Como funciona

Todo dia às 03:00 (horário de Brasília) um job do GitHub Actions roda o scraper, que:

1. lista as paróquias pela API pública do site da Diocese;
2. lê a página de cada paróquia e transforma o texto dos horários em dados estruturados (dia, horário, tipo de celebração e observação);
3. busca a localização aproximada de cada igreja no OpenStreetMap, com cache;
4. lê as leituras do dia;
5. valida tudo contra o schema e só grava se o resultado estiver completo.

Os dados ficam versionados em `data/` e são servidos junto com o site.

## Dados

| Arquivo | Conteúdo |
| --- | --- |
| `data/v1/parishes.json` | Paróquias, comunidades, celebrações estruturadas, contato e localização |
| `data/v1/liturgy/today.json` | Celebração, cor litúrgica e leituras do dia |
| `data/churches.json` | Formato antigo, usado pelo site atual |

O formato dos arquivos `v1` está definido em `packages/schema` (zod) e é compartilhado com o app.

## Estrutura

```
packages/
  schema/    tipos e validação dos dados
  scraper/   coleta, interpretação dos horários e geocodificação
data/        dados gerados
index.html, leitura-diaria.html, js/, css/   site atual
```

## Rodando localmente

Requer Node 24 ou mais recente.

```
npm install
npm test
npm run scrape                 # paróquias e leituras
npm run scrape -- parishes     # só paróquias
npm run scrape -- liturgy      # só leituras
npm run scrape -- --no-geocode # sem consultar o OpenStreetMap
```

## Contato

Dúvidas e sugestões: contato.nahoradamissa@gmail.com

Projeto sem fins comerciais e sem vínculo oficial com a Diocese de Uberlândia. Os horários pertencem às respectivas paróquias e são reunidos aqui apenas para facilitar o acesso a uma informação pública.
