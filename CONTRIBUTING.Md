# Contribuindo

Obrigado pelo interesse! O projeto quer continuar simples e fácil de manter.

## Começando

1. Faça um fork e crie uma branch: `git checkout -b fix/descricao-curta`
2. Instale e rode os testes (Node 24+):
   ```
   npm install
   npm test
   npm run typecheck
   ```
3. Para testar a coleta sem consultar o OpenStreetMap: `npm run scrape -- --no-geocode`

## Horário que não foi entendido

Se uma paróquia tem um horário que o scraper não transformou em celebração (ele aparece em `notes` no `data/v1/parishes.json`), o caminho é:

1. adicionar a linha original como caso em `packages/scraper/test/schedule.test.ts`;
2. ajustar `packages/scraper/src/diocese/schedule.ts` até o teste passar sem quebrar os outros.

## Pull requests

- Pequenos e focados.
- Mensagens de commit no imperativo: `fix: trata horário sem minutos`.
- Testes e typecheck passando.
- Prints para mudanças visuais.
