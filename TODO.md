# TODO — Hora da Missa (app iOS)

Reestruturação do site em um app nativo, mobile-first, publicado na App Store.
O site atual vira referência de ideia e de dados; a interface será refeita do zero a partir do design.

**Stack:** Expo (React Native + TypeScript), Expo Router, EAS Build/Submit.
Os dados continuam estáticos: scrapers no GitHub Actions publicam JSON versionado, e o app consome e guarda em cache.
Escolhida porque há planos de lançar no Android no futuro, usando o mesmo código.

---

## Fase 0 — Fundação
- [x] Decidir a stack final: Expo (iOS agora, Android depois)
- [x] Definir o nome do app: **Hora da Missa**
- [ ] Definir o subtítulo e verificar a disponibilidade do nome na App Store Connect
- [ ] Reservar o Bundle ID (ex.: `com.nahoradamissa.app`) no Apple Developer
- [ ] Criar o app na App Store Connect (nome, idioma primário pt-BR, categoria: Estilo de vida ou Referência)
- [x] Monorepo npm com `packages/schema` e `packages/scraper`
- [ ] Adicionar o app em `apps/mobile` e mover o site legado para `apps/web` (ou trocar por uma landing do app)

## Fase 1 — Conteúdo e questões legais (bloqueia a publicação)
- [ ] Pedir à Diocese de Uberlândia autorização por escrito para usar os horários das missas
- [ ] Resolver a fonte das leituras diárias:
  - [ ] Opção A: licença ou autorização (Canção Nova / CNBB)
  - [ ] Opção B: mostrar apenas a referência bíblica + link para o texto completo
- [ ] Não usar brasões ou logos oficiais sem permissão; manter o aviso "sem vínculo oficial"
- [ ] Escrever a Política de Privacidade (pt-BR) e publicá-la em uma URL fixa
- [ ] Criar uma página de suporte (URL) com o e-mail de contato

## Fase 2 — Dados (API estática)
- [x] Reescrever o scraper em TypeScript (monorepo npm: `packages/schema` + `packages/scraper`), sem Python
- [x] Corrigir o descompasso das leituras (agora em `data/v1/liturgy/today.json`, com celebração, cor e versículos)
- [x] Definir o schema v1 versionado com zod (`data/v1/parishes.json`, `data/v1/liturgy/today.json`), compartilhado com o app
- [x] Estruturar os horários: recorrência semanal, mensal por semana (1ª sexta, último sábado) e dia fixo do mês, com tipo e observação (97% das linhas)
- [x] ID estável para paróquias (ID do WordPress da Diocese) e comunidades
- [x] Geocodificar com cache e precisão (`address` | `street` | `place`), limitado à região da Diocese
- [x] Validar no CI: schema zod + mínimo de 40 paróquias e 300 celebrações antes de gravar; falha de uma paróquia mantém os dados anteriores dela
- [x] Atualizar o workflow (Node 24, `checkout@v4`, testes antes da coleta)
- [x] Site atual lendo as leituras do formato v1 (corrige as leituras paradas desde 25/10/2025)
- [ ] Correções manuais de localização (`overrides.json`) para as ~85 comunidades que o OpenStreetMap não encontra
- [ ] Revisar com a Diocese as paróquias com horários incompletos (ex.: Matriz Sant'Ana sem horários, São João Batista sem comunidades)
- [ ] Calcular o tempo litúrgico e a cor do dia no próprio app (a cor do dia já vem da fonte das leituras)
- [ ] Gerar leituras de N dias à frente, se a fonte permitir (para o app funcionar offline)

## Fase 3 — Design (Claude Design, só mobile)
Canvas: https://claude.ai/artifact/JE9xnDM4WFqsKwt6ZkDyDC

- [x] Definir a identidade visual: paleta litúrgica (cor do tempo como accent), tipografia e ícones
- [x] Desenhar o ícone do app (conceito: relógio + cruz; variantes padrão/escuro/tingido)
- [x] Desenhar a tela de abertura (splash)
- [ ] Exportar o ícone em 1024×1024 PNG (+ variantes escuro/tingido)
- [ ] Telas:
  - [x] **Hoje (home):** data, tempo litúrgico, próximas missas perto de mim, atalho para as leituras
  - [x] **Missas:** busca, filtros (dia, horário, bairro, cidade), lista de paróquias
  - [x] **Mapa:** igrejas próximas com pin e cartão de resumo
  - [x] **Detalhe da paróquia:** comunidades, grade de horários, endereço, "Como chegar", favoritar, link oficial
  - [x] **Leituras do dia:** 1ª leitura, salmo, (2ª leitura), evangelho, controle de tamanho da fonte, seletor de data
  - [x] **Preparação para a missa** (conteúdo da página atual, revisado)
  - [x] **Favoritos**
  - [x] **Ajustes:** notificações, tamanho da fonte, sobre, privacidade, contato
  - [x] Estados vazio, offline e erro
  - [x] Estado carregando (skeleton)
  - [x] Onboarding curto + pedido de permissões (localização e notificações) com explicação
- [x] Modo escuro (tela Hoje como referência) e contraste
- [ ] Validar Dynamic Type e VoiceOver no app de verdade
- [x] Tokens de design (cores, tipografia, espaçamento, raios) no canvas
- [ ] Levar os tokens para o código (`theme.ts`) na Fase 4

## Fase 4 — App (base)
- [ ] Criar o projeto Expo + TypeScript em `app/`
- [ ] Configurar navegação por abas: Hoje · Missas · Mapa · Leituras · Ajustes
- [ ] Implementar o tema a partir dos tokens do design (claro/escuro + cor litúrgica)
- [ ] Camada de dados: fetch do JSON, cache em disco, fallback offline, indicador de "atualizado em"
- [ ] Implementar todas as telas da Fase 3
- [ ] Busca sem acento e sem diferenciar maiúsculas ("sao jose" encontra "São José")
- [ ] Persistência local de favoritos e preferências

## Fase 5 — Recursos nativos (o diferencial para passar na Guideline 4.2)
- [ ] Localização: "missas perto de mim" ordenadas por distância e horário
- [ ] Mapa nativo (Apple Maps) + "Como chegar" abrindo Maps/Waze/Google Maps
- [ ] Notificações locais: leituras do dia (horário escolhido) e lembrete X min antes de uma missa favorita
- [ ] Widget iOS: próxima missa favorita e/ou evangelho do dia
- [ ] Compartilhar leitura/horário (share sheet)
- [ ] Adicionar missa ao calendário (opcional)

## Fase 6 — Qualidade
- [ ] Testes unitários: parser de horários, cálculo de "próxima missa", busca
- [ ] Testes nos dispositivos: iPhone SE (tela pequena) até Pro Max, iOS mínimo definido
- [ ] Revisão de acessibilidade (VoiceOver, Dynamic Type no tamanho máximo)
- [ ] Monitoramento de crashes (Sentry ou similar, sem rastreamento de usuário)
- [ ] Nenhum analytics com rastreamento (não usar GA, para evitar o pedido de permissão de rastreamento/ATT)

## Fase 7 — App Store
- [ ] Configurar o EAS Build/Submit com a conta Apple
- [ ] Preencher os textos de permissão no `Info.plist` (localização, notificações, calendário)
- [ ] Preencher o App Privacy na App Store Connect (provável: "Data Not Collected")
- [ ] Gerar screenshots (6.9" e 6.5"), descrição, palavras-chave, texto promocional
- [ ] Classificação etária
- [ ] Beta no TestFlight com amigos e paroquianos
- [ ] Notas para o revisor: explicar a origem dos dados + anexar a autorização da Diocese
- [ ] Enviar para revisão e publicar

## Fase 8 — Pós-lançamento
- [ ] Alerta quando o scraper falhar (o CI notifica por e-mail/issue)
- [ ] Canal de "reportar horário errado" dentro do app
- [ ] Avaliar Android (mesmo código Expo)
- [ ] Avaliar expansão para outras dioceses
- [ ] Desativar ou redirecionar o site antigo para uma landing do app
