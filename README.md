# Inventra Web

O Inventra ajuda cozinhas a acompanhar produtos, lotes e saldo de estoque, registrar movimentações, organizar requisições e realizar inventários. A aplicação também reúne a gestão de fornecedores, equipe, preferências de acessibilidade e um assistente com contexto da cozinha.

**Aplicação:** [inventra-dynamic-applications-2-inventra7.vercel.app](https://inventra-dynamic-applications-2-inventra7.vercel.app/)

## O que você encontra

- **Painel:** indicadores operacionais da cozinha.
- **Requisições:** criação e acompanhamento de compras, consumos e transferências, incluindo revisão e decisão conforme o perfil de acesso.
- **Estoque:** consulta de produtos e lotes, alertas de mínimo e validade e registro de entradas e baixas.
- **Inventários:** abertura, contagem física por lote, retomada, fechamento e consulta de inventários anteriores.
- **Produtos e fornecedores:** catálogo da cozinha, categorias e unidades, além do cadastro compartilhado de fornecedores.
- **Cozinha e equipe:** dados da cozinha, código de convite e gerenciamento dos acessos permitidos ao perfil.
- **Perfil e acessibilidade:** dados da conta, segurança e preferências que personalizam a navegação.
- **Assistente IA:** conversas contextualizadas pela cozinha, consulta de documentos e propostas de ação sujeitas à confirmação.

As informações operacionais são obtidas pela API configurada para o ambiente. O assistente também depende da disponibilidade e configuração do serviço de IA.

## Tecnologias

- React 19 e TypeScript
- Vite 8
- Tailwind CSS 4
- React Router 7
- K2D via Fontsource

## Executar localmente

Requisitos: Node.js compatível com Vite 8 e npm.

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

O Vite inicia, por padrão, em `http://localhost:5173`. Edite `.env.local` para apontar para os serviços disponíveis no seu ambiente. O arquivo local é ignorado pelo Git.

### API e assistente

O navegador chama caminhos relativos (`/api` e `/ia`); os proxies de desenvolvimento e produção encaminham essas chamadas aos serviços configurados. Assim, o navegador não precisa chamar a API de outra origem diretamente.

| Variável | Uso |
| --- | --- |
| `API_ORIGIN` | Origem HTTP(S) do backend, sem `/api` no final. Exemplo local: `http://localhost:8080`. |
| `IA_ORIGIN` | Opcional. Origem/base HTTP(S) do serviço de IA quando ele não usa o padrão derivado de `API_ORIGIN`. |
| `VITE_API_BASE_URL` | Base usada pelo cliente web; mantenha `/api` para usar o proxy da aplicação. |

Para desenvolvimento, copie `.env.example` para `.env.local` e informe os endereços locais ou acessíveis da API e, se necessário, da IA. Não coloque tokens ou credenciais no frontend.

Na Vercel, configure `API_ORIGIN` nas variáveis de ambiente dos ambientes **Preview** e **Production**. Configure `IA_ORIGIN` somente quando o serviço de IA estiver em uma origem/base diferente do padrão `${API_ORIGIN}/ia`. Os valores devem apontar para os serviços realmente publicados; não inclua `/api` em `API_ORIGIN`. Depois de alterar variáveis, gere um novo deployment.

## Comandos

```bash
npm run dev                  # ambiente local
npm run build                # verificação TypeScript e build de produção
npm run preview              # servir localmente o build
npm run lint                 # análise estática
npm run test:accessibility   # verificações das preferências de acessibilidade
npm run test:dashboard       # verificações de análise do painel
npm run test:requirements    # verificações dos requisitos do projeto
```

## Organização do código

```text
src/
├── components/   # componentes de interface, layout e fluxos
├── context/      # estado compartilhado da aplicação
├── hooks/        # hooks reutilizáveis
├── pages/        # páginas e fluxos de rota
├── routes/       # roteamento e proteção de acesso
├── services/     # comunicação HTTP e serviços por recurso
├── types/        # tipos de domínio e contratos
└── utils/        # validações e funções auxiliares
```

## Implantação

O projeto é uma SPA servida pela Vercel. `vercel.ts` encaminha `/api/*` ao backend e `/ia/*` ao serviço de IA, preserva os arquivos estáticos e direciona as demais rotas ao `index.html` para o React Router. A implantação precisa das variáveis de ambiente descritas acima; os serviços de API e IA são executados separadamente da interface web.
