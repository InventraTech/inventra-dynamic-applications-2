# Painel de BI do Inventra

O painel usa a API operacional do Inventra, o JWT e a cozinha da sessão autenticada. Não consulta Qlik, Databricks ou banco de dados. Não existe seletor de cozinha nem conjunto de dados fictícios no código de produção.

## Entrega

- `/dashboard` contém Visão geral, Estoque, Requisições e Inventários e alertas.
- O login concluído e a abertura do login com sessão válida levam ao painel. `/home` redireciona para `/dashboard`.
- O item **Painel** da sidebar mantém nome, ícone e link `/home`, incluindo sua indicação de página ativa em `/dashboard`.
- A Topbar existente é reutilizada. A busca filtra produtos; o sino abre a área de controle. A apresentação roxa, ações douradas, cartões brancos, cantos arredondados e fundo suave seguem o redesign web consultado no Figma.
- Todos os filtros começam vazios, incluindo ano, mês e status. Limpar filtros também limpa a busca da Topbar.
- As tabelas possuem ordenação, dez registros por página e rolagem confinada ao próprio contêiner, acessível pelo teclado.

## Integração e cálculos

Os contratos foram consultados no código atual da API, incluindo controllers, DTOs de resposta e enums. A documentação antiga do Qlik serve de referência analítica.

| Área / informação | API utilizada | Transformação |
| --- | --- | --- |
| Produtos e estoque mínimo | `GET /kitchens/{id}/stock` | Metadados dos produtos da cozinha e campo `lowStock` calculado pela API |
| Valor, saldo, validade e entradas | `GET /stock-batches?kitchenId={id}` | Soma de `currentQuantity × unitPrice`, quantidades por unidade, contagem de lotes e agrupamento cronológico por `entryDate` |
| Metadados ausentes | `GET /products/{id}` | Completa categoria/unidade somente de produtos já referenciados por dados da cozinha |
| Requisições e pendências | `GET /requisitions?kitchenId={id}` | Contagem por tipo/status, exibida em barras empilhadas; pendentes = `UNDER_REVIEW`; soma de `estimatedTotal` uma vez por requisição |
| Produtos requisitados e filtros associativos | `GET /requisitions/{id}/items` | Associa categoria/produto/unidade à requisição e agrega ocorrências distintas por produto |
| Consumo diário | `GET /products/{id}/kitchen-parameters` | Soma de `averageDailyConsumption` por unidade, apenas para a cozinha da sessão |
| Fornecedores | `GET /suppliers?kitchenId={id}&active=true`; também `active=false` para supervisores | Contagem de ativos e distribuição das avaliações; somente supervisores recebem cadastros inativos |
| Preços e prazos | `GET /products/{id}/suppliers` | Relações produto/fornecedor; média dos prazos informados e dispersão entre prazo e preço |
| Inventários | `GET /inventories?kitchenId={id}` e `GET /inventories/{id}/counts` | Contagem por status e uso de `divergence` informado pela API; faltas e sobras aparecem em lados opostos, agrupadas por inventário e unidade |
| Alertas | `GET /alerts?kitchenId={id}` | Agrupamento por tipo, severidade e mês; não lidos conforme o usuário conectado |

Os caminhos acima são relativos à URL base existente (`/api` por padrão). `services/api.ts` continua responsável por JWT, erros HTTP e expiração da sessão.

## Semântica e adaptações

- As análises de várias cozinhas do Qlik viraram composição financeira por categoria, divergência por inventário/unidade e evolução mensal dos alertas.
- O período filtra a data de entrada dos lotes, criação das requisições/alertas e início dos inventários. O saldo mostrado continua sendo o saldo **atual** dos lotes selecionados; não é uma reconstrução do saldo histórico.
- O cartão “Entradas no mês atual” tem seu próprio período mensal explícito. Os demais objetos continuam incluindo todos os períodos quando não há filtros.
- Estoque mínimo e consumo cadastrado descrevem os produtos da seleção. Os cálculos da API não são refeitos com regras diferentes.
- Referências e cadastros de fornecedores não representam eventos de compra. Neles, aplicam-se categoria/produto/unidade; período e status/tipo afetam as requisições. A interface explica essa diferença.
- Ao filtrar um produto, a seleção de requisições usa os itens, mas seu valor estimado mantém o total integral de cada requisição selecionada. Isso é informado na área de compras.
- O ranking de produtos requisitados usa número de requisições distintas com o produto. Essa adaptação evita classificar somas de kg, litros e unidades como quantidades equivalentes.
- Quantidades e consumos são separados por unidade, sem conversões arbitrárias. Divergências de um mesmo inventário também ficam separadas por unidade.
- A comparação de cobertura usa o saldo atual dividido pelo mínimo do próprio produto. O marco de 100% representa o mínimo; produtos sem mínimo positivo não entram no gráfico.
- O treemap do painel agrupa produtos por categoria e dimensiona os blocos pelo saldo positivo multiplicado pelo preço conhecido. Lotes sem preço e saldos zerados/negativos não entram; selecionar uma categoria aplica o filtro correspondente.
- O gráfico de requisições empilha os status dentro de cada tipo. O gráfico de inventário preserva o sinal da divergência e não compensa faltas com sobras.
- Preços e prazos ausentes permanecem “Não informado”. Lotes com saldo e sem preço tornam o valor financeiro parcial, com aviso textual. Se nenhum saldo tem preço conhecido, o valor é “Não informado”.
- O cartão de produtos conta os produtos vinculados pelo estoque ou por lotes da cozinha, conforme sua legenda. Ele não conta todo o catálogo global nem afirma cobrir cadastros sem essas relações.
- A API de alertas devolve os alertas visíveis ao usuário conectado. Os indicadores não representam alertas privados de outros usuários.
- Histórico de movimentações limitado não é usado para reconstruir totais completos ou inventar séries temporais.

## Carregamento e falhas

Estoque consolidado, lotes, requisições e alertas carregam independentemente. Detalhes de parâmetros, fornecedores, itens, inventários e contagens são consultados quando a área correspondente é aberta; itens e contagens também são carregados quando um filtro de produto/categoria/unidade/busca precisa deles. Resultados são mantidos enquanto o painel está montado.

Consultas por entidade têm concorrência máxima de seis, IDs deduplicados e cancelamento por `AbortController`. Uma falha secundária preserva os demais grupos; indicadores dependentes de detalhes incompletos ficam indisponíveis e oferecem nova tentativa. Atualizar recarrega os grupos já consultados. Trocar de sessão/cozinha remonta os dados e filtros.

## Validação

Arquivos criados para a funcionalidade:

- `src/pages/Dashboard/index.tsx`;
- `src/components/features/Dashboard/DashboardFilters.tsx`, `DashboardPrimitives.tsx` e `DashboardViews.tsx`;
- `src/hooks/useDashboard.ts`, `src/services/dashboard.ts` e `src/types/dashboard.ts`;
- `src/utils/dashboardAggregations.ts` e `src/utils/dashboardAnalysis.ts`;
- `tests/dashboard.test.ts`, `tests/accessibility-settings.test.ts`, `tests/tsconfig.json` e a página isolada em `tests/dashboard/`;
- este relatório.

Arquivos existentes modificados: `package.json`, `src/routes/AppRoutes.tsx`, páginas `Home` e `Login`, formulário `LoginForm`, layouts `Topbar` e `Sidebar`, e `src/types/topbar.ts`. A Topbar aceita busca controlada e deixa de ser fixa com preferências de texto ampliado. Na sidebar, a única adaptação é reconhecer `/dashboard` como o destino ativo do link existente do Painel.

```sh
npm run build
npm run lint
npm run test:accessibility
npm run test:dashboard
npm run dev:dashboard-validation
```

A validação visual usa um servidor separado em `http://127.0.0.1:5174/tests/dashboard/index.html`. Seus substitutos de sessão e API existem somente na configuração de testes. Não criam sessão no aplicativo de produção nem consultam o back-end. Os estados `?state=empty`, `error`, `partial` e `loading` permitem verificar os respectivos cenários. Essa página e os dados de teste não entram no build de produção.

Foram conferidas as quatro áreas em 320, 375, 768, 1024 e 1440 pixels, com preferências padrão e com texto de 200%, espaçamento máximo, OpenDyslexic e movimento reduzido. Também foram conferidos os quatro contrastes, persistência após recarregar, foco das abas, busca/filtros, limpeza, ordenação, paginação, rolagem das tabelas por teclado e estados de ausência/falha/carregamento.

Os testes automatizados cobrem onze cenários analíticos e cinco cenários de preferências. A conferência autenticada contra dados reais, o uso de um leitor de tela real (como NVDA) e o zoom próprio do navegador em 200% e 400% permanecem validações específicas; não se declara conformidade WCAG completa. Os atalhos de zoom foram tentados no navegador integrado, que manteve a escala original; essa tentativa não foi contabilizada como validação de zoom.

Nenhuma biblioteca de gráficos ou outra dependência foi adicionada. Os gráficos usam SVG e estruturas HTML responsivas; os valores também aparecem em texto, listas ou tabelas. O scatter explicita os eixos e oferece a relação produto/fornecedor com os valores de cada ponto.
