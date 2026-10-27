# Levantamento de APIs para Web e Mobile

**Data:** 26/10/2026  
**Objetivo:** informar quais operações HTTP do backend precisam continuar disponíveis para o mobile atual, o web atual e as telas web previstas na sidebar.

## Resumo para compartilhar

- O backend atualizado contém **100 operações HTTP** mapeadas nos controllers consultados.
- O mobile atual declara **45 métodos de endpoint Retrofit**; todos estão na lista de preservação.
- O web atual acrescenta **22 operações distintas** que não aparecem no mobile.
- As telas web futuras de inventário, fornecedores e cozinha acrescentam **17 operações distintas**.
- A recuperação de senha e o convite oficial de cozinha acrescentam **4 operações** a preservar; o fluxo de convite também usa rotas de pedido/status já contadas no mobile.
- A coleta agregada de cliques é um plano recomendado e acrescenta **1 operação** a preservar.
- A lista de preservação confirmada soma **89 operações HTTP distintas**. Outras **5** devem ficar sem decisão de exclusão até definir estoque por lote e a visualização de analytics. Duas rotas novas de pré-lista dependem de confirmação de uso pela integração/RPA. As **4 restantes** são candidatas para revisão, não para exclusão automática.

As listas contam combinações distintas de método HTTP e caminho, não a quantidade de pedidos feitos durante o uso do aplicativo. Os caminhos abaixo incluem `/api`; `{id}` e nomes entre chaves são parâmetros variáveis. Colchetes indicam parâmetros de consulta opcionais.

## Estado dos repositórios

Web e mobile foram comparados após `git fetch` na auditoria inicial. Em 26/10/2026, o backend foi atualizado com `git pull --ff-only`.

| Repositório | Base consultada | Estado após fetch |
| --- | --- | --- |
| Web | `feat/foto-perfil`, commit `08722b9` | Checkout consultado na auditoria inicial; alteração local em `src/components/layout/Sidebar/index.tsx` preservada. |
| Mobile | `main`, commit `c41abb6` | Checkout consultado na auditoria inicial, sem alterações locais. |
| Backend | `main`, commit `68db79c` | Atualizado e alinhado a `origin/main`; alteração local em `src/main/resources/application.properties` preservada e não consultada. |

O inventário do mobile também foi conferido nas interfaces Retrofit do checkout sincronizado. O web está na branch `feat/foto-perfil`, não em `main`; portanto, a relação de telas implementadas corresponde a essa branch.

### Mudanças de API recebidas no pull

O novo commit removeu oito operações que apareciam como candidatas na versão anterior do levantamento e adicionou duas rotas de pré-lista:

- `GET /api/pre-lists[?kitchenId={id}]` — lista cabeçalhos de pré-listas importadas.
- `GET /api/pre-lists/{id}` — busca uma pré-lista com seus itens.

O controller descreve os dados como pré-listas importadas do banco do 1º ano, somente leitura. As migrações também mencionam `id_source` para impedir reimportação pelo RPA. Não encontrei chamada dessas rotas nos checkouts atuais; confirme com quem mantém o RPA/integração antes de decidir sobre elas.

Foram removidas da versão atual do backend: `POST /api/alerts`, `DELETE /api/alerts/{id}`, as quatro operações de manutenção de `/api/profiles` (criar, buscar por ID, atualizar e excluir) e as duas rotas `/api/products/barcode-registrations`. `GET /api/profiles` continua disponível; `GET /api/alerts/{id}` também continua disponível.

O pull também acrescentou o campo `photoUrl` ao resumo de produto nas respostas de alertas, itens de requisição, baixo estoque, lotes e movimentações. As rotas não mudaram, mas os clientes podem aproveitar esse campo para exibir a foto do produto.

## 1. Preservar: métodos já usados pelo mobile

O mobile declara os 45 métodos abaixo. Algumas rotas também são usadas pelo web. O uso de refresh/logout é parte da sessão, embora não seja uma tela isolada.

### Autenticação e usuário — 9

- `POST /api/auth/login` — login por e-mail e senha.
- `POST /api/auth/register` — cadastro.
- `POST /api/auth/google` — login Google.
- `POST /api/auth/refresh` — renovação automática de tokens.
- `POST /api/auth/logout` — encerramento de sessão.
- `GET /api/users` — membros da cozinha.
- `GET /api/users/me` — usuário da sessão.
- `PUT /api/users/me/photo` — enviar/substituir foto.
- `DELETE /api/users/me/photo` — remover foto.

### Cozinhas e pedidos de acesso — 7

- `POST /api/kitchens` — criar cozinha.
- `GET /api/kitchens/discover` — descobrir cozinhas (`q`, `lat`, `lng`, `size`).
- `POST /api/kitchen-access-requests` — pedir acesso.
- `GET /api/kitchen-access-requests/mine` — consultar o pedido do usuário.
- `GET /api/kitchen-access-requests?status=PENDING` — listar pedidos pendentes.
- `POST /api/kitchen-access-requests/{id}/approve` — aprovar pedido.
- `POST /api/kitchen-access-requests/{id}/reject` — rejeitar pedido.

### Alertas — 4

- `GET /api/alerts?kitchenId={id}[&unread=true]` — listar alertas ou somente não lidos.
- `PATCH /api/alerts/{id}/read` — marcar um alerta como lido.
- `PATCH /api/alerts/read-all?kitchenId={id}` — marcar todos como lidos.
- `POST /api/alerts/unregistered-product` — reportar código de barras sem produto cadastrado.

### Produtos — 6

- `GET /api/products/{id}` — buscar produto.
- `GET /api/products` — pesquisa; o mobile usa `name`, `size`, `active` e `sort`.
- `GET /api/products/by-barcode/{barcode}[?kitchenId={id}]` — busca por código de barras do mobile.
- `POST /api/products` — cadastrar produto.
- `GET /api/units` — listar unidades.
- `GET /api/categories` — listar categorias.

### Estoque — 7

- `POST /api/stock-batches` — registrar entrada/lote.
- `GET /api/stock-batches?kitchenId={id}[&productId={id}]` — consultar lotes.
- `GET /api/stock-batches/expiring-soon?kitchenId={id}&days={n}` — consultar vencimentos próximos.
- `GET /api/stock-batches/low-stock` — consultar itens abaixo do mínimo.
- `GET /api/kitchens/{kitchenId}/stock` — consultar estoque consolidado.
- `GET /api/stock-movements?kitchenId={id}&productId={id}&type={ENTRY|WRITE_OFF}&limit={n}` — consultar movimentações.
- `POST /api/stock-batches/consume` — registrar baixa por produto.

### Fornecedores — 2

- `GET /api/suppliers?kitchenId={id}` — listar fornecedores usados pela cozinha.
- `GET /api/suppliers/{id}` — buscar fornecedor.

### Requisições — 10

- `GET /api/requisitions?kitchenId={id}[&requesterId={id}][&status={status}]` — listar requisições.
- `GET /api/requisitions/{id}` — buscar requisição.
- `GET /api/requisitions/{id}/items` — listar itens.
- `POST /api/requisitions` — criar rascunho.
- `POST /api/requisitions/{id}/items` — incluir item.
- `DELETE /api/requisitions/{id}/items/{itemId}` — remover item.
- `PATCH /api/requisitions/{id}/submit` — enviar para análise.
- `PATCH /api/requisitions/{id}/approve` — aprovar.
- `PATCH /api/requisitions/{id}/reject` — rejeitar.
- `PATCH /api/requisitions/{id}/cancel` — cancelar ou descartar rascunho.

## 2. Preservar: chamadas adicionais já feitas pelo web

Estas **22 operações distintas** já aparecem nos serviços e componentes do web. As chamadas compartilhadas com o mobile já estão na seção anterior.

### Conta e equipe — 6

- `POST /api/users` — criar membro da equipe.
- `PUT /api/users/{id}` — atualizar nome/dados do membro; também usado para atualizar o nome da conta.
- `PATCH /api/users/{id}/password` — alterar senha da conta.
- `PATCH /api/users/{id}/activate` — ativar membro.
- `PATCH /api/users/{id}/deactivate` — desativar membro.
- `GET /api/profiles` — listar perfis para configurar acesso.

### Produtos, categorias e unidades — 16

- `GET /api/products/barcode-lookup?barcode={codigo}` — consulta de código de barras do web. É diferente da rota `by-barcode` usada pelo mobile; manter as duas enquanto ambos os clientes as chamarem.
- `PUT /api/products/{id}` — atualizar produto.
- `PUT /api/products/{id}/photo` — enviar/substituir foto do produto.
- `DELETE /api/products/{id}/photo` — remover foto do produto.
- `PATCH /api/products/{id}/activate` — ativar produto.
- `PATCH /api/products/{id}/deactivate` — desativar produto.
- `GET /api/products/{id}/suppliers` — listar fornecedores associados ao produto.
- `POST /api/products/{id}/suppliers` — associar fornecedor ao produto.
- `GET /api/products/{id}/kitchen-parameters` — consultar parâmetros do produto na cozinha.
- `PUT /api/products/{id}/kitchen-parameters` — configurar parâmetros do produto na cozinha.
- `POST /api/categories` — criar categoria.
- `PUT /api/categories/{id}` — atualizar categoria.
- `DELETE /api/categories/{id}` — remover categoria.
- `POST /api/units` — criar unidade.
- `PUT /api/units/{id}` — atualizar unidade.
- `DELETE /api/units/{id}` — remover unidade.

O web usa também rotas compartilhadas para buscar produtos, unidades, categorias, fornecedores, lotes e estoque da cozinha. A área de categorias/unidades usa as operações de listagem e manutenção acima; ela não busca uma categoria ou unidade individual pelo ID.

## 3. Preservar para as telas web futuras da sidebar

Na branch consultada, estas opções da sidebar estão marcadas `coming-soon`, sem rota ativa: **Requisições, Estoque, Inventários, Fornecedores e Cozinha**. A recomendação abaixo usa o escopo sugerido pelos nomes e as operações existentes no backend.

### Recuperação de senha — fluxo oficial

Preservar as três operações do fluxo por código/link de e-mail:

- `POST /api/auth/password/forgot` — pedir código/link de redefinição.
- `POST /api/auth/password/verify` — validar o código e obter token de redefinição.
- `POST /api/auth/password/reset` — definir nova senha com token válido.

Isso é diferente da troca de senha autenticada já usada em Configurações da conta (`PATCH /api/users/{id}/password`).

### Convite oficial para entrar em uma cozinha

Preservar `GET /api/kitchens/by-code/{code}` para consultar/resumir a cozinha pelo código. O backend permite então enviar `POST /api/kitchen-access-requests` com o código ou com `kitchenId`, e consultar o resultado em `GET /api/kitchen-access-requests/mine`. As duas últimas já são usadas pelo mobile e precisam ser consideradas parte do fluxo web futuro também.

### Analytics de uso — preservar coleta, definir escopo

- `POST /api/events/clicks` — receber um lote de contagens por elemento de interface. O backend guarda totais agregados identificados por chave de plataforma/tela/elemento, não uma sequência de navegação por usuário.
- Sugestão de implementação: acumular eventos de ações relevantes e enviar em lote, em vez de fazer uma chamada a cada clique. Começar com perguntas de produto concretas, como uso de inventário, envio de requisições ou entrada de estoque. Não registrar texto digitado, senhas ou conteúdo de formulários.
- O backend ignora chaves de evento que não conhece; por isso, nomes/telas precisam ser combinados com o responsável pelo backend antes da instrumentação.
- `GET /api/events/clicks/ranking?platform=WEB|MOBILE` pode alimentar uma tela de análise para supervisores, mas ainda não há tela definida. Deixar essa rota sem decisão até se definir quem verá o ranking e quais decisões ele deve apoiar.

### Requisições

O fluxo completo já está coberto pelas 10 rotas da seção Mobile/Requisições: lista, detalhe, itens, rascunho, envio, aprovação, rejeição e cancelamento. A tela de Histórico do web já chama listagem de requisições, itens e detalhes de produto. Não remover nenhuma dessas rotas.

### Estoque e painel

O fluxo esperado para a tela de estoque já está coberto pelas rotas de lotes, estoque consolidado, movimentações, entrada, baixa, baixo estoque e vencimentos que o mobile usa. O Painel web existe, mas seu componente informa que as métricas estão em preparação. Alertas, vencimentos e baixo estoque são necessários se o web implementar notificações e cartões de estoque como os fluxos do mobile.

### Inventários — 8 operações ainda sem chamada nos clientes

- `POST /api/inventories` — abrir inventário.
- `GET /api/inventories?kitchenId={id}` — listar inventários da cozinha.
- `GET /api/inventories/{id}` — buscar inventário.
- `POST /api/inventories/{id}/counts` — registrar contagem.
- `GET /api/inventories/{id}/counts` — listar contagens.
- `DELETE /api/inventories/{id}/counts/{countId}` — remover contagem.
- `PATCH /api/inventories/{id}/close` — fechar inventário.
- `PATCH /api/inventories/{id}/cancel` — cancelar inventário.

### Fornecedores — 4 operações adicionais para a futura gestão

As listagens e o detalhe já são usados pelo mobile. Para criar e manter fornecedores pela tela web, preservar também:

- `POST /api/suppliers` — criar fornecedor.
- `PUT /api/suppliers/{id}` — atualizar fornecedor.
- `PATCH /api/suppliers/{id}/activate` — ativar fornecedor.
- `PATCH /api/suppliers/{id}/deactivate` — desativar fornecedor.

### Ações por lote — manter até fechar o fluxo de estoque

- `PATCH /api/stock-batches/{id}/consume` baixa de um lote escolhido. Pode atender baixa de um lote específico, como perda/validade; a baixa normal por produto já usa `POST /api/stock-batches/consume`, que retira dos lotes que vencem primeiro.
- `PATCH /api/stock-batches/{id}/adjust` define o saldo de um lote. Pode ajudar a corrigir divergência de contagem, mas o request atual só recebe a nova quantidade; não pede motivo. Eu manteria a rota enquanto a tela de Inventários/Estoque é desenhada e exigiria confirmação clara na interface.
- `PATCH /api/stock-batches/{id}/restock` soma quantidade ao mesmo lote. Para uma nova entrega, prefiro criar um lote com `POST /api/stock-batches`, preservando validade, fornecedor e preço próprios daquela entrada. Não usaria `restock` como ação padrão do web; deixaria a rota sem decisão até confirmar o caso de negócio.

Minha recomendação é não excluir essas três operações agora. Depois de desenhar as telas, o uso de `adjust` e da baixa por lote pode ser confirmado; `restock` é a menos provável para o fluxo normal de recebimento.

### Cozinha — 5 operações adicionais para configuração administrativa

Criação, descoberta e estoque da cozinha já aparecem no mobile/web. Para a tela administrativa, preservar também:

- `GET /api/kitchens` — listar cozinhas acessíveis.
- `GET /api/kitchens/{id}` — buscar dados da cozinha.
- `PUT /api/kitchens/{id}` — atualizar cozinha.
- `PATCH /api/kitchens/{id}/activate` — ativar cozinha.
- `PATCH /api/kitchens/{id}/deactivate` — desativar cozinha.

O fluxo oficial de convite por código está descrito na subseção “Convite oficial para entrar em uma cozinha”; essa busca não está entre as cinco operações administrativas adicionais listadas aqui.

## 4. Rotas sem chamada atual: adiar ou revisar antes de remover

Estas rotas existem no backend, mas não aparecem nas chamadas atuais dos clientes. A recuperação de senha, o convite, a coleta de analytics e as três ações por lote já foram movidos para as seções de preservação ou decisão acima, conforme o escopo confirmado nesta conversa.

### Adiar a exclusão — 5 operações

- `PATCH /api/stock-batches/{id}/consume`
- `PATCH /api/stock-batches/{id}/restock`
- `PATCH /api/stock-batches/{id}/adjust`
- `GET /api/stock-batches/ranking` — não há cartão/ranking de estoque definido no Painel web atual.
- `GET /api/events/clicks/ranking` — depende de existir uma visualização para interpretar e usar esses totais.

### Rotas novas que dependem de confirmação do consumidor — 2 operações

- `GET /api/pre-lists[?kitchenId={id}]`
- `GET /api/pre-lists/{id}`

São somente leitura e aparecem no backend atualizado para dados importados. Não as inclua na lista de remoção sem confirmar se o RPA ou outro sistema as consumirá.

### Candidatas para confirmar com o responsável pelo backend — 4 operações

- `GET /api/users/{id}` — buscar usuário individual; as telas atuais usam listagem ou o próprio usuário.
- `GET /api/categories/{id}` — buscar categoria individual; o web edita a partir da listagem.
- `GET /api/units/{id}` — buscar unidade individual; o web edita a partir da listagem.
- `GET /api/alerts/{id}` — busca individual de alerta; os clientes atuais trabalham com a lista.

## Recomendação de remoção

1. Passe ao responsável as **89 operações a preservar** (seções 1–3).
2. Mantenha as **5 operações adiadas** até fechar o desenho de estoque e a visualização de analytics.
3. Confirme o consumidor das **2 rotas de pré-lista** com quem mantém o RPA/integração.
4. Trate as **4 candidatas** como revisão, não como autorização automática de exclusão.
5. Antes de apagar qualquer rota, confira logs/métricas de uso do backend e confirme com quem mantém integrações, analytics e requisitos de produto. O código local não revela consumidores fora destes três repositórios.
6. Se uma rota for removida, registre o caminho e a decisão para permitir restauração precisa caso uma tela futura venha a precisar dela.

## Fontes e limites

- Web: `src/routes/AppRoutes.tsx`, `src/routes/PrivateRoute.tsx`, `src/services/*.ts` e componentes de funcionalidades. A acessibilidade é configurada no navegador e não adiciona rota do Inventra backend.
- Mobile: `app/src/main/java/com/inventraoficial/inventra/data/remote/api/*.kt` e inventário de chamadas enviado junto a esta conversa.
- Backend: anotações HTTP nos controllers de `src/main/java/com/inventra/api/infrastructure/controller/`.
- O inventário cobre rotas REST declaradas nesses checkouts, não chamadas internas entre serviços, jobs, provedores externos nem tráfego real medido em produção. O SDK Google/Firebase também faz chamadas próprias fora das rotas REST listadas.
- Nenhum arquivo do backend foi editado.
