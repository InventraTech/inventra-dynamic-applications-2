# Plano integral de telas e APIs do Inventra Web

**Propósito:** servir como roteiro único para terminar o web, sem inventar contratos e sem remover APIs antes de entender quem depende delas.

**Base consultada:** rotas e serviços do web na branch feat/foto-perfil; controllers, serviços e DTOs do backend no checkout local; docs/levantamento-api-web-mobile.md como inventário complementar de uso no mobile. O backend foi consultado somente para leitura e não foi alterado.

## Decisões que orientam o projeto

1. **A sidebar aprovada continua sendo a navegação principal.** Não criar entradas novas para subpáginas de produtos, formulários, histórico ou notificações.
2. **Toda tela autenticada opera na cozinha do usuário atual.** A cozinha vem de GET /api/users/me; uma lista global de cozinhas ou produtos não pode ser tratada como se fosse o escopo da pessoa.
3. **O backend é a autoridade de autorização e de regras de negócio.** Esconder uma ação no web melhora a experiência, mas não substitui os controles de perfil, cozinha, estado e propriedade existentes na API.
4. **Usar contratos existentes exatamente como publicados.** Não enviar campos fictícios, não supor filtros inexistentes e não apresentar como concluída uma operação que teve sucesso parcial.
5. **Não fabricar dados de painel.** Não há endpoint de dashboard. O Painel com métricas de BI fica para depois da definição das métricas e do contrato de agregação.
6. **Acessibilidade não usa API do Inventra.** As preferências são locais ao navegador e já pertencem ao AccessibilityProvider.
7. **Não tratar uma aprovação de requisição como uma segunda baixa.** O backend aprova e baixa o estoque dentro do próprio fluxo de requisição quando o tipo exige isso.
8. **Não tratar exclusão de alerta como “dispensar para mim”.** A leitura é por usuário; a exclusão remove o alerta compartilhado.
9. **Não declarar transferência entre cozinhas como automática.** Hoje o destino é texto livre e a cozinha de origem baixa o estoque. A cozinha recebedora registra sua entrada separadamente.

## Estado do produto e ordem de entrega

| Ordem | Tela/fluxo | Estado na branch consultada | Prioridade |
|---:|---|---|---|
| 1 | Recuperação de senha | API pronta; link atual informa incorretamente que não está disponível | Fechar logo |
| 2 | Requisições | Item da sidebar marcado “Em breve” | Próxima tela de operação |
| 3 | Estoque | Item da sidebar marcado “Em breve” | Depois de Requisições |
| 4 | Histórico de solicitações e baixas | Rota e tela existentes; aba de retirada hoje consulta requisições de consumo | Corrigir fonte de dados junto da tela de Estoque |
| 5 | Inventários | Item da sidebar marcado “Em breve” | Depois que o fluxo de lotes estiver claro |
| 6 | Fornecedores | Item da sidebar marcado “Em breve” | Necessária para recebimento e vínculos |
| 7 | Cozinha | Item da sidebar marcado “Em breve” | Administração da cozinha vinculada |
| 8 | Entrar em cozinha existente | API pronta; não há onboarding web concluído para esse caso | Fechar após ou junto da Equipe |
| 9 | Central de notificações | Botão global da topbar; APIs existentes | Implementar sem criar tela na sidebar |
| 10 | Painel de BI | Página atual é um estado informativo | Esperar definição dos indicadores pelo responsável de BI |

Login, cadastro, configuração inicial da cozinha, Perfil, Acessibilidade, Equipe e acessos e Produtos já têm rotas ou telas na branch. O plano abaixo registra os contratos que elas devem manter e as correções de escopo necessárias.

## 1. Login, sessão e recuperação de senha

### Login

- **POST /api/auth/login**
  - Corpo: email, password.
  - Resposta: LoginResponse com token, tokenType, expiresIn, refreshToken, refreshExpiresIn e user.
  - refreshToken e refreshExpiresIn podem ser nulos quando o armazenamento de refresh está indisponível; o login ainda pode ter um access token válido.
- **POST /api/auth/refresh**
  - Corpo: refreshToken.
  - Resposta: novo LoginResponse.
  - É renovação de sessão, não uma ação da tela.
- **POST /api/auth/logout**
  - Corpo: refreshToken.
  - Resposta: 204, sem corpo. Chamar ao encerrar a sessão quando houver refresh token.
- **GET /api/users/me**
  - Resposta: UserResponse; hidrata sessão e fornece id, nome, e-mail, foto, cozinha, perfil, situação, hasPassword e datas de conta.

O formulário nunca deve persistir nem registrar a senha. A preferência “lembrar de mim” continua sob responsabilidade da sessão web.

### Esqueci e redefinir senha

A recuperação está implementada no backend, mas o botão da tela de login ainda diz que não está disponível. Substituir esse aviso pelo fluxo abaixo:

1. Tela pública “Recuperar senha”: **POST /api/auth/password/forgot**, corpo email, resposta 202 vazia.
   - A mensagem visível deve ser neutra: a API responde da mesma forma para e-mails cadastrados e não cadastrados.
   - Há limite de 5 pedidos por e-mail por hora.
2. Tela para informar o código recebido: **POST /api/auth/password/verify**, corpo email e code (6 dígitos).
   - Resposta: resetToken e expiresInSeconds.
   - Código inválido/expirado retorna erro; após 5 tentativas erradas, é necessário pedir outro.
3. Nova senha: **POST /api/auth/password/reset**, corpo resetToken e newPassword (8–100 caracteres).
   - Resposta 204; token é de uso único e redefinir encerra as sessões anteriores.

O link do e-mail também pode abrir a tela final com o token recebido como parâmetro. Não colocar tokens em logs nem em mensagens de erro.

### Login Google

**POST /api/auth/google** existe, mas não deve aparecer como opção até o web ter Firebase/Google configurado, o envio verificável do ID token e o tratamento do caso 409 REGISTRATION_REQUIRED. Não criar um botão visual sem fechar essas dependências.

## 2. Cadastro, criação de cozinha e pedido para entrar

### Criar conta

- **POST /api/auth/register**
  - Corpo: name (até 120), email (até 150), password (8–100) e accessType (SUPERVISOR, ESTOQUISTA ou COMPRADOR).
  - Resposta: LoginResponse; salvar sessão somente depois de confirmar token e user.
- O web atual inicia o cadastro como SUPERVISOR; manter esse fluxo como criação de cozinha própria, sem fingir que já convidou uma equipe.

### Criar a primeira cozinha

- **POST /api/kitchens**
  - Corpo obrigatório: name (até 120); opcionais: address, city, state, latitude, longitude.
  - Resposta: KitchenResponse com id, name, code, endereço, coordenadas, acceptingRequests, active e createdAt.
- Guardar o id e nome retornados na sessão. A tela pode exibir o código de convite retornado, sem inventar um endpoint de rotação: a API consultada não oferece rotação de código.
- Localização é opcional. Não pedir permissão de GPS/câmera por padrão.

### Entrar em uma cozinha existente

Adicionar como fluxo alternativo de onboarding para uma pessoa que já tem conta e ainda não está vinculada a uma cozinha. Não criar outra opção na sidebar.

- **GET /api/kitchens/by-code/{code}**: confirma apenas id e name; não revela endereço nem código na resposta.
- **POST /api/kitchen-access-requests**: corpo deve conter exatamente um entre kitchenId e code; resposta KitchenAccessRequestResponse.
- **GET /api/kitchen-access-requests/mine**: consulta o pedido mais recente; retorna estado, cozinha, datas, decisão e motivo. Sem pedido, a API responde que não há solicitação.
- Opcional para descoberta sem código: **GET /api/kitchens/discover?q=&lat=&lng=&radiusKm=&page=&size=**.
  - Resposta paginada (content, page, size, totalElements), apenas cozinhas ativas e aceitando pedidos. size padrão 20, máximo 50.
  - Só solicitar localização se a pessoa iniciar a busca por proximidade; busca por nome não precisa de GPS.
- A aprovação é feita pelo supervisor em Equipe e acessos. O pedido pendente expira segundo expiresAt enviado pelo backend; não calcular prazo no front.

## 3. Produtos e catálogo

### Catálogo da cozinha

- **GET /api/products?page={page}&size={size}&sort=name,asc&name={texto}&categoryId={id}&active={true|false}**
  - Filtros name, categoryId e active são opcionais.
  - Resposta é Page<ProductResponse> (content e metadados de paginação do Spring).
  - Cada produto traz id, nome, marca, categoria resumida, unidade resumida, código de barras, photoUrl, active e createdAt.
- **GET /api/categories** e **GET /api/units** abastecem filtros e formulários.
- **GET /api/kitchens/{kitchenId}/stock?name={texto}&categoryId={id}** traz produtos ativos vinculados à cozinha que tenham lote ou parâmetro, com saldo utilizável, quantidade de lotes, próxima validade, estoque mínimo e indicador de baixo estoque.
- **GET /api/stock-batches?kitchenId={kitchenId}** ajuda a identificar produtos inativos que ainda têm lotes.
- **GET /api/products/{productId}/kitchen-parameters** retorna os parâmetros do produto para a cozinha vinculada ao usuário; resposta inclui cozinha, mínimo/máximo, consumo médio, saldo, estimativa de dias e indicadores de baixo/sobreestoque.

**Regra de escopo:** /api/products é um catálogo geral e não aceita kitchenId. Não exibir seu resultado bruto como “produtos desta cozinha”. O serviço atual combina o catálogo geral com /kitchens/{id}/stock, lotes e parâmetros para filtrar a cozinha. Preservar esse filtro.

**Lacuna recomendada ao backend:** criar uma listagem paginada de produtos da cozinha (por exemplo, GET /api/kitchens/{id}/products com nome, categoria e ativo), para substituir a busca global de todas as páginas e as consultas de parâmetros produto a produto. Isso é proposta, não rota existente; até existir, manter o filtro composto atual e não simplificá-lo para /products puro.

### Criar e editar produto

- **POST /api/products**: corpo name (até 150), brand opcional (até 80), categoryId opcional, unitId obrigatório e barcode opcional (até 50); resposta ProductResponse.
- **PUT /api/products/{id}**: mesmos campos opcionais para atualização; resposta ProductResponse.
- **PUT /api/products/{id}/photo**: multipart com campo file; resposta ProductResponse com photoUrl.
- **DELETE /api/products/{id}/photo**: remove foto e retorna ProductResponse.
- **PATCH /api/products/{id}/activate** e **PATCH /api/products/{id}/deactivate**: resposta 204.
- Criar produto e vinculá-lo à cozinha são dois atos distintos: POST /products não recebe kitchenId. Para torná-lo visível nessa cozinha, usar **PUT /api/products/{id}/kitchen-parameters** com kitchenId, minStock, maxStock e averageDailyConsumption; mínimo ausente vira zero no backend. Se o segundo passo falhar, informar que o cadastro do catálogo foi feito, mas o vínculo não, e permitir tentar o vínculo novamente.
- Editar parâmetros: mesma rota PUT /api/products/{id}/kitchen-parameters; resposta 204. Consultar com GET /api/products/{id}/kitchen-parameters.

### Código de barras

- **GET /api/products/by-barcode/{barcode}?kitchenId={id}** é a opção mais completa para o fluxo futuro: responde com fonte (CATALOG ou OPEN_FOOD_FACTS), produto e, quando aplicável, saldo da cozinha.
- O web atual chama **GET /api/products/barcode-lookup?barcode={codigo}**, que retorna a resposta do OpenFoodFacts ou 404. Manter enquanto o serviço web ainda o usa; migrar só depois de conferir o tratamento do contrato unificado.
- O leitor USB/Bluetooth que digita no campo pode ser tratado como entrada de texto. A câmera não é requisito atual.
- **POST /api/products/barcode-registrations** e **GET /api/products/barcode-registrations/{eventId}** são um fluxo separado: enfileiram cadastro em background e consultam QUEUED/PROCESSING/COMPLETED/FAILED. Não usar no lugar do cadastro síncrono sem uma decisão de produto para esse processamento assíncrono.

### Categorias e unidades

Dentro de Produtos, manter a área existente de administração de referências:

- **GET /api/categories**, **POST /api/categories** (name, description), **PUT /api/categories/{id}** (campos opcionais name, description) e **DELETE /api/categories/{id}** (204).
- **GET /api/units**, **POST /api/units** (symbol, description obrigatórios), **PUT /api/units/{id}** (campos opcionais symbol, description) e **DELETE /api/units/{id}** (204).
- Criação, alteração e exclusão exigem papel de supervisor. Não há necessidade atual de GET individual: editar pode partir do objeto da lista.
- Exclusões podem ser recusadas por vínculos existentes; mostrar o erro devolvido pela API e não remover o item da tela antes de confirmar sucesso.

## 4. Requisições

Uma tela de operação com lista, filtros, detalhe expansível e criação de rascunho. Não criar uma tela “Histórico de requisições” duplicada: o Histórico permanece uma visualização própria das compras e das movimentações já registradas.

### Lista e detalhe

- **GET /api/requisitions?kitchenId={id}&status={status}&requesterId={uuid}**
  - Informe ao menos um filtro; o web deve sempre fornecer kitchenId.
  - status opcional: DRAFT, UNDER_REVIEW, APPROVED, REJECTED, CANCELLED.
  - Não há filtro de tipo, data, paginação ou busca textual nessa API. Filtrar tipo no cliente após receber a lista; não inventar query params.
  - Resposta de cada linha já inclui id, type, origin, status, motivo, cozinha, solicitante e aprovador (com photoUrl), datas, itemCount, estimatedTotal e itemNames.
- **GET /api/requisitions/{id}**: resumo completo da requisição com os mesmos campos principais.
- **GET /api/requisitions/{id}/items**: itens com produto (id, name), quantidade, preço estimado, fornecedor sugerido e observação.
- Usar o resumo da lista para cards/tabela. Buscar itens apenas ao abrir detalhes; não carregar itens e detalhes dos produtos de todas as requisições antecipadamente.

### Criar e operar rascunho

- **POST /api/requisitions**: corpo type (PURCHASE, TRANSFER, CONSUMPTION), origin (texto obrigatório, até 20) e kitchenId; solicitante vem da sessão. Resposta RequisitionResponse em estado DRAFT.
- **POST /api/requisitions/{id}/items**: corpo productId, quantity (> 0, até 3 casas), suggestedSupplierId opcional, estimatedPrice opcional e não negativo, note opcional até 255; retorna a requisição atualizada.
- **DELETE /api/requisitions/{id}/items/{itemId}**: remove item somente enquanto rascunho; retorna requisição atualizada. Não há endpoint para editar um item: remover e adicioná-lo novamente.
- **PATCH /api/requisitions/{id}/submit**: sem corpo; transição para análise. Rascunho vazio não pode ser enviado.
- A criação de requisição e a inclusão de itens não são uma transação de front única. Guardar o id do rascunho assim que criado e, se uma inclusão falhar, permitir retomar o rascunho sem criar outro.

### Decisão e cancelamento

- **PATCH /api/requisitions/{id}/approve**: sem corpo; supervisor; retorna a requisição atualizada.
- **PATCH /api/requisitions/{id}/reject**: corpo {reason} obrigatório (1–255); supervisor.
- **PATCH /api/requisitions/{id}/cancel**: corpo {reason} obrigatório (1–255); devolve a requisição atualizada. O backend restringe cancelamento de requisição aprovada ao supervisor e estorna sua baixa.
- A API valida propriedade, estado, cozinha, produtos ativos e saldo. Depois de receber a resposta, atualizar a lista pelo DTO retornado; erro não deve fazer a UI avançar o status.
- Aprovação de CONSUMPTION e TRANSFER faz a baixa de estoque internamente. Aprovação de PURCHASE não cria lote: mercadoria recebida exige POST /api/stock-batches depois.
- TRANSFER hoje baixa da cozinha da requisição e usa origin como texto livre para o destino; não cria uma entrada na outra cozinha. Se o produto precisar de transferência vinculada entre duas cozinhas, o contrato atual precisa mudar antes de prometer essa função.

## 5. Estoque

O Estoque trabalha com saldos e lotes reais. Produtos são catálogo; Inventário é contagem física; não fundir as três responsabilidades.

### Visão por produto e lotes

- **GET /api/kitchens/{kitchenId}/stock?name={texto}&categoryId={id}**: principal lista consolidada. Cada registro traz produto e foto, categoria, unidade, totalQuantity, activeBatches, nextExpirationDate, minStock e lowStock.
  - Saldo consolidado considera lotes ativos e não vencidos. É a quantidade utilizável informada pelo backend, não soma que o front deve recalcular por conta própria.
- **GET /api/stock-batches?kitchenId={id}&productId={id}**: detalhe de lotes; informe kitchenId, productId, ou ambos. Retorna produto, cozinha, fornecedor, número de lote, nota fiscal, quantidade inicial e atual, datas de entrada/validade, preço unitário e estado.
- **GET /api/stock-batches/expiring-soon?kitchenId={id}&days={n}**: lista os lotes dentro do horizonte pedido.
- **GET /api/stock-batches/low-stock**: itens abaixo do mínimo da cozinha do usuário; resposta inclui cozinha/produto, saldo atual e mínimo.
- Não somar lotes vencidos ou baixados no saldo utilizável. Para exibir lotes históricos/vencidos, consultá-los e rotulá-los por status.

### Entrada

- **POST /api/stock-batches**: productId, kitchenId, batchNumber, initialQuantity (> 0), entryDate; opcionais supplierId, invoiceNumber, expirationDate, unitPrice.
- Resposta: StockBatchResponse com lote e seus resumos de produto, cozinha e fornecedor.
- Uma nova entrega é um novo lote porque validade, preço, fornecedor e número pertencem a essa entrada. Não usar “repor” como atalho para alterar lote anterior.

### Baixa

- **POST /api/stock-batches/consume**: baixa por cozinha/produto; corpo kitchenId, productId, quantity (> 0), reason opcional (USAGE, LOSS, EXPIRED). O backend consome por validade FIFO; se o saldo não bastar, retorna conflito e reverte a operação inteira.
- **PATCH /api/stock-batches/{id}/consume**: baixa de um lote escolhido; corpo quantity e reason. Reservar para fluxo que realmente exija selecionar lote, como perda ou vencimento.
- Não chamar baixa manual depois de aprovar requisição; isso duplicaria o consumo.

### Ajuste e reposição

- **PATCH /api/stock-batches/{id}/adjust** recebe newQuantity (zero ou mais) e retorna lote atualizado. Não recebe motivo; a tela não deve oferecer correção livre sem confirmação e sem decisão de auditoria.
- O fechamento de inventário já usa a operação interna de ajuste para aplicar divergências. A existência dessa chamada interna não obriga o web a chamar o endpoint HTTP de ajuste manual.
- **PATCH /api/stock-batches/{id}/restock** recebe quantity e soma ao mesmo lote. Só usar se a regra de negócio confirmar nova entrada física no mesmo número de lote com os metadados preservados. A entrada normal continua sendo POST de novo lote.

### Movimentações

- **GET /api/stock-movements?kitchenId={id}&productId={id}&type={ENTRY|WRITE_OFF|ADJUSTMENT}&limit={n}**
  - kitchenId obrigatório; filtros productId e type opcionais; limit padrão 200, máximo 500.
  - Retorna id, tipo, motivo, quantidade (com sinal em ajuste), saldo após operação, lote, produto, pessoa, requisitionId e data.
  - Usar na linha do tempo da tela de Estoque e como fonte real da aba de retiradas do Histórico.
  - Não há paginação por cursor/data. Se a cozinha ultrapassar o limite, pedir paginação ou intervalo de datas ao backend antes de prometer histórico completo.

## 6. Inventários

Inventário é uma sessão auditável de contagem, não uma alteração de catálogo nem uma lista simples de lotes.

- **POST /api/inventories**: kitchenId obrigatório, responsibleId UUID opcional (padrão: usuário logado), note opcional até 255. Resposta InventoryResponse com cozinha, responsável (inclui foto), início, fechamento, estado (OPEN, CLOSED, CANCELLED) e observação.
- **GET /api/inventories?kitchenId={id}**: histórico de inventários da cozinha; resposta lista sem paginação.
- **GET /api/inventories/{id}**: detalhe do inventário.
- **GET /api/stock-batches?kitchenId={id}**: lotes que podem ser contados; selecionar lote, não somente produto.
- **POST /api/inventories/{id}/counts**: corpo batchId, physicalQuantity (zero ou mais, até 3 casas) e note opcional. Resposta contém registeredQuantity, physicalQuantity, divergence e resumo do lote.
- **GET /api/inventories/{id}/counts**: lista das contagens.
- **DELETE /api/inventories/{id}/counts/{countId}**: remove contagem para recontagem enquanto aberto; retorna InventoryResponse.
- **PATCH /api/inventories/{id}/close**: sem corpo; só pode fechar inventário aberto com ao menos uma contagem. Retorna inventário final.
- **PATCH /api/inventories/{id}/cancel**: sem corpo; cancela aberto e retorna inventário.

**Cuidado com a divergência:** no registro, a API guarda o saldo registrado no instante em que cada lote é contado. No fechamento, aplica a divergência sobre o saldo então atual, preservando entradas/baixas ocorridas depois da contagem; valores negativos são limitados a zero. Mostrar os valores devolvidos pela API e não calcular uma segunda correção no cliente. Um erro em qualquer atualização deve manter o inventário como aberto na UI.

## 7. Histórico

Manter uma única página com as duas abas aprovadas: **Solicitações de compra** e **Retirada do estoque**.

### Solicitações de compra

- **GET /api/requisitions?kitchenId={id}** para resumir compras; filtrar type === PURCHASE no cliente porque o endpoint não tem filtro type.
- O próprio DTO já fornece solicitante, aprovador, datas, estado, valor estimado, total de itens e nomes.
- Buscar **GET /api/requisitions/{id}/items** somente quando a pessoa expandir o registro.

### Retirada do estoque

- **GET /api/stock-movements?kitchenId={id}&type=WRITE_OFF&limit=500**.
- Mostrar motivo (USAGE, LOSS, EXPIRED, REQUISITION), produto, lote, quantidade retirada, saldo após a movimentação, pessoa, data e requisitionId se houver.
- **Correção necessária:** a implementação atual da aba “Retirada do estoque” consulta requisições do tipo CONSUMPTION; isso omite baixas avulsas e pode representar incorretamente o que saiu de cada lote. Trocar a fonte para stock-movements. Requisição de consumo pode aparecer como contexto pelo requisitionId, mas não substitui o registro da movimentação.
- Não criar uma segunda entrada na sidebar para histórico de baixas.

## 8. Fornecedores

- **GET /api/suppliers?kitchenId={id}** retorna ativos que já forneceram para a cozinha.
- **GET /api/suppliers** retorna fornecedores ativos sem filtro de cozinha.
- **GET /api/suppliers/{id}** carrega detalhe.
- **POST /api/suppliers**: legalName e cnpj obrigatórios; opcionais email, whatsapp, rating de 1 a 5. Retorna SupplierResponse.
- **PUT /api/suppliers/{id}**: aceita legalName, email, whatsapp e rating; **não aceita alterar CNPJ**. A UI deve tratá-lo como imutável após cadastro.
- **PATCH /api/suppliers/{id}/activate** e **PATCH /api/suppliers/{id}/deactivate**: 204.
- Criação, atualização e ativação exigem supervisor.

**Lacuna:** não existe query para listar fornecedores inativos (GET /suppliers lista ativos). Depois de desativar, a tela não consegue carregar a lista completa para reativação. Antes de prometer administração bidirecional, solicitar GET /api/suppliers?active={true|false} ou uma rota de listagem administrativa. Até isso existir, manter os IDs/resultado imediato após desativar e sinalizar o limite; não afirmar que a tela permite localizar qualquer inativo.

## 9. Cozinha

É uma página para a cozinha vinculada ao usuário; o nome singular da sidebar deve ser preservado.

- Buscar primeiro o kitchen.id em **GET /api/users/me**, então **GET /api/kitchens/{id}**.
- KitchenResponse inclui name, code, endereço, cidade/UF, coordenadas, acceptingRequests, active e criação.
- **PUT /api/kitchens/{id}** recebe os campos editáveis: name, address, city, state, coordenadas e acceptingRequests. Não enviar campos somente de resposta.
- **PATCH /api/kitchens/{id}/activate** e **PATCH /api/kitchens/{id}/deactivate**: 204. Desativação precisa de confirmação explícita e explicação do impacto em requisições/acessos.
- Exibir o código de convite recebido pela resposta, sem botão para regenerar: não há endpoint de rotação.
- **Não usar GET /api/kitchens como seletor da cozinha atual:** retorna cozinhas ativas e não substitui o vínculo em /users/me.

## 10. Equipe e acessos

Tela existente; manter fotos devolvidas pela API e separar pessoas já vinculadas de pedidos pendentes.

### Membros

- **GET /api/users** (supervisor): membros da cozinha atual; cada UserResponse inclui id, nome, e-mail, photoUrl, cozinha, perfil, ativo, hasPassword e datas.
- **GET /api/profiles**: perfis disponíveis para atribuição. A API lista todos.
- **POST /api/users**: cria membro diretamente, não envia convite por e-mail. Corpo name, email, password (8–100), kitchenId opcional e profileId obrigatório.
- **PUT /api/users/{id}**: enviar somente o que a tela realmente altera entre name, kitchenId e profileId.
- **PATCH /api/users/{id}/activate** e **PATCH /api/users/{id}/deactivate**: 204.
- A pessoa autenticada não pode editar a si mesma na seção de cozinha. O web deve excluir/ocultar essas ações para o próprio id; edição de nome e senha fica no Perfil. Não enviar update próprio via endpoint genérico.

### Pedidos de entrada

- **GET /api/kitchen-access-requests?status=PENDING** para a fila de decisão do supervisor. A resposta inclui estado, cozinha, pessoa, photoUrl, createdAt, expiresAt, decisão e motivo.
- **POST /api/kitchen-access-requests/{id}/approve**: sem corpo; resposta atualizada.
- **POST /api/kitchen-access-requests/{id}/reject**: corpo opcional {reason}; resposta atualizada.
- Mostrar expiresAt devolvido pela API, incluindo pedido expirado/removido com estado do servidor. Não inventar reenvio.
- GET /api/kitchen-access-requests/mine é para a pessoa que solicitou, não para a fila administrativa.

**Decisão de perfis:** o sistema de autorização atual reconhece papéis fixos SUPERVISOR, ESTOQUISTA e COMPRADOR. Não criar uma tela de CRUD de perfis personalizados sem primeiro definir como um perfil novo recebe permissões. Os endpoints de CRUD de /profiles não são necessários para a tela atual de equipe; manter apenas a listagem usada na seleção.

## 11. Perfil e conta

- **GET /api/users/me**: fonte da conta atual, foto, nome, e-mail, cozinha, perfil e hasPassword.
- **PUT /api/users/{id}** com {name} para alterar apenas o próprio nome; obter o id de /users/me. Não enviar e-mail, perfil ou cozinha pelo formulário de Perfil.
- **PUT /api/users/me/photo**: multipart file; atualiza/substitui e retorna UserResponse.
- **DELETE /api/users/me/photo**: remove e retorna UserResponse.
- **PATCH /api/users/{id}/password**: corpo newPassword (8–100) e currentPassword quando a conta já tem senha. Para conta Google sem senha (hasPassword === false), o backend dispensa a atual.
- Não há endpoint para trocar e-mail. Mostrar como dado de conta sem edição. A foto vem de photoUrl; sem foto, usar iniciais.
- Após PATCH de senha, renovar ou encerrar sessão conforme o comportamento de sessão da API; o backend encerra sessões abertas ao redefinir via fluxo público.

## 12. Acessibilidade

Não chamar endpoint do backend. As opções pertencem ao AccessibilityProvider, têm schema versionado no armazenamento local e são aplicadas globalmente. A implementação deve seguir docs/acessibilidade.md; componentes não devem copiar preferências em estado próprio nem oferecer integrações que o produto não suporta.

## 13. Notificações globais

Implementar no botão da topbar como painel/popover acessível, sem adicionar item na sidebar.

- **GET /api/alerts?kitchenId={id}&unread=true** para os não lidos; omitir unread para todos.
- Cada AlertResponse tem id, tipo, severidade, lote/produto/cozinha opcionais, mensagem, read, refKey e createdAt. O estado read é específico da pessoa.
- **PATCH /api/alerts/{id}/read** marca um aviso para a pessoa atual.
- **PATCH /api/alerts/read-all?kitchenId={id}** marca os avisos visíveis da pessoa atual; 204.
- O badge pode usar o tamanho da resposta não lida; não existe endpoint dedicado de contagem.
- Resolver refKey para uma rota somente quando o tipo e o destino forem conhecidos. Se não houver tela para o destino, abrir o aviso em contexto ou manter ação de leitura; nunca navegar para uma página inventada.
- **GET /api/alerts/{id}** só é necessário se a experiência tiver detalhe sob demanda; o DTO da listagem já tem mensagem e referências.
- Não usar **DELETE /api/alerts/{id}** como dispensar individual: a operação apaga globalmente e é restrita a supervisor.
- **POST /api/alerts** é criação manual de alerta para supervisor; não faz parte do fluxo padrão de notificações. Alertas normais são publicados pelos eventos de negócio.
- **POST /api/alerts/unregistered-product** só deve ser acionado se o fluxo decidir registrar para supervisores um produto não encontrado. Não é substituto de criar o produto.

## 14. Painel e BI

O /home atual deve continuar informando que as métricas estão em preparação até o responsável de BI definir cada indicador, período, agregação, público e regra de atualização.

Fontes operacionais disponíveis caso o escopo seja aprovado:

- alertas e pendências: **GET /api/alerts?kitchenId={id}&unread=true**;
- baixo estoque: **GET /api/stock-batches/low-stock**;
- validade em horizonte explícito: **GET /api/stock-batches/expiring-soon?kitchenId={id}&days={n}**;
- requisições: **GET /api/requisitions?kitchenId={id}&status={status}**;
- ranking de validade em Redis: **GET /api/stock-batches/ranking?kitchenId={id}&limit={n}**;
- ranking de cliques: **GET /api/events/clicks/ranking?platform=WEB**.

Essas respostas têm semânticas diferentes e não compõem um dashboard coeso automaticamente. POST /api/events/clicks guarda contagens agregadas conhecidas pelo backend; só instrumentar ações após definir os nomes de tela/ação com o responsável. Não registrar textos, senhas nem dados de formulário. O ranking de cliques não é métrica de estoque, desempenho de equipe ou resultado de negócio.

**Lacuna recomendada ao backend/BI:** um endpoint agregado, paginado/filtrável por período e cozinha, com definição formal de cada métrica. Não simular esse endpoint em React a partir de muitas consultas nem fazer fan-out como solução definitiva.

## 15. Contratos que precisam de decisão do responsável pelo backend

| Tema | Limite encontrado | Proposta |
|---|---|---|
| Catálogo por cozinha | /products é global; o front precisa combinar catálogo, estoque, lotes e parâmetros por produto | Criar listagem paginada por cozinha e filtros |
| Transferência | destino é texto livre; só a cozinha da requisição tem baixa automática | Confirmar se “transferência” é retirada para destino externo ou transferência entre cozinhas; para a segunda opção, incluir cozinha destino e recebimento rastreável |
| Fornecedores inativos | listagem só retorna ativos, embora haja ativar/desativar | Adicionar filtro administrativo ativo/inativo |
| Histórico de movimentação | limite máximo 500; não há cursor nem intervalo de datas | Adicionar paginação/intervalo antes de exigir histórico completo |
| Requisições | sem paginação nem filtro por tipo/data | Adicionar paginação e filtros antes de grandes volumes |
| Ajuste manual de lote | define quantidade final, mas não recebe motivo | Confirmar auditoria e autorização antes de expor como ação comum |
| Perfis personalizados | RBAC conhece três papéis fixos | Não usar CRUD de perfil até haver matriz/atribuição real de permissões |
| Painel | não há agregação própria nem especificação de BI | Definir métricas e endpoint agregado com o responsável |
| Cadastro assíncrono por código de barras | existe fila Redis e consulta por eventId; web usa cadastro síncrono e lookup do OpenFoodFacts | Manter sem uso até confirmar que a fila é requisito oficial |

São propostas de evolução, não chamadas existentes. Nenhuma deve ser implementada como endpoint fictício no cliente.

## 16. Política para os endpoints sem tela atual

- Manter os métodos já utilizados pelo mobile; esta proposta não substitui o inventário mobile/web já produzido.
- Manter as chamadas do web em uso e as rotas necessárias às telas aprovadas.
- Marcar como “sem consumidor web definido” os GET individuais de usuário/categoria/unidade, CRUD de perfil, alertas manuais/detalhe/exclusão e fila de cadastro de código de barras; decidir com responsável e logs antes de remover.
- Para ajuste/baixa/reposição por lote e rankings, aguardar a implementação/definição de Estoque, Inventários e BI. A decisão sobre rota REST direta não autoriza remover a regra interna usada pelo fechamento de inventário ou requisições.
- Verificar tráfego real, mobile e consumidores externos antes de qualquer exclusão. O código dos dois repositórios locais não revela integrações fora deles.

## 17. Sequência de implementação recomendada

1. Completar recuperação de senha pública e corrigir o aviso do login.
2. Fechar Requisições com rascunho, detalhe, estados e regras de aprovação/cancelamento.
3. Criar Estoque com saldo por cozinha, consulta de lotes, entrada, baixa, validade e movimentações.
4. Corrigir a aba de retirada do Histórico para usar stock-movements; manter a aba de compras em requisitions.
5. Implementar Inventários e validar com o backend a reconciliação de divergência no fechamento.
6. Implementar Fornecedores e solicitar listagem de inativos antes de prometer reativação completa.
7. Implementar administração da Cozinha vinculada, incluindo estado de pedidos e código de convite.
8. Fechar onboarding para pedir entrada em cozinha existente e acompanhar decisão.
9. Completar a central de notificações e destinos conhecidos.
10. Fazer o Painel somente depois de métricas/contrato de BI definidos.

Cada entrega continua obrigada às regras do AGENTS.md e docs/acessibilidade.md: responsividade a 320/375/768/1024/1440 px, preferências salvas em vigor, teclado/leitor de tela, estados de carregamento/sucesso/erro/vazio, foco e movimento reduzido. Reutilizar os componentes existentes, manter um main#conteudo-principal e um h1, e testar listas com dados extensos sem criar rolagem horizontal na página inteira.

## Fontes de contrato consultadas

- Web: src/routes/AppRoutes.tsx, src/routes/PrivateRoute.tsx, src/services/*.ts, src/components/features/History/ e src/components/features/Products/.
- Backend: controllers AuthController, UserController, KitchenController, KitchenAccessRequestController, RequisitionController, StockBatchController, StockMovementController, InventoryController, ProductController, SupplierController, CategoryController, UnitController, ProfileController e AlertController; DTOs e serviços correspondentes.
- Inventário complementar: docs/levantamento-api-web-mobile.md. A seção mobile permanece como proteção contra remoção de APIs utilizadas pelo outro cliente.
