# Vistoria dos requisitos do front-end

Esta revisão parte do commit atual de `develop` `b52a25d` e está na branch `refactor/ajustes-gerais`. Os critérios abaixo separam implementação local de evidências que dependem de apresentação, leitor de tela ou publicação.

## Implementação no código

| Critério | Evidência no projeto |
| --- | --- |
| Vite, React e TypeScript; sem `.js`/`.jsx` em `src/` | `package.json`, `src/` e `npm run build` |
| Componentes e páginas em diretórios próprios com `index.tsx` | `src/components/` e `src/pages/`; todos os módulos de tela seguem a convenção |
| Seis ou mais componentes de apresentação com responsabilidade única | `ui/Button`, `ui/Input`, `ui/SearchField`, `ui/Toggle`, `ui/Feedback` e `ui/Breadcrumb`; nenhum acessa serviços ou contém regras de domínio |
| Tipos para entidades e props; sem `any` em `src/` | `src/types/` por domínio e interfaces locais aos componentes |
| Acesso HTTP centralizado e tipado | Só `src/services/api.ts` executa `fetch`; `apiRequest<T>` centraliza erros, cabeçalhos e cancelamento, e `src/services/` organiza os recursos |
| Estado compartilhado por Context e reducer tipado | `src/context/AuthContext.tsx`, `src/context/auth.ts` e `src/types/auth.ts` |
| Carregamento assíncrono com loading, erro e cancelamento | `useResource<T>` em `src/hooks/useDashboard.ts` usa `AbortController` e retorna `DashboardResource<T>` tipado; outros hooks seguem o mesmo padrão |
| Páginas carregadas sob demanda | `React.lazy` e `Suspense` por rota em `src/routes/AppRoutes.tsx` |
| Persistência com versão | Sessão, preferências de acessibilidade e preferência da sidebar validam `_versao`; incompatibilidades são descartadas com segurança |
| Otimizações com justificativa | `useCallback`/`useMemo` em `src/hooks/useDashboard.ts`, `src/context/AuthContext.tsx` e `src/pages/Profile/index.tsx`, com comentários sobre estabilidade e re-renderização |
| Conteúdo externo sem HTML executável | Nenhum `dangerouslySetInnerHTML` ou `innerHTML` em `src/`; o conteúdo é renderizado por JSX |
| Validação tipada antes de operações | Utilitários em `src/utils/`, incluindo `loginValidation.ts`, `productKitchenValidation.ts`, `productReferenceValidation.ts`, `productSupplierValidation.ts`, `teamAccessValidation.ts` e validadores por domínio |
| Autenticação privada centralizada | `src/routes/PrivateRoute.tsx` consulta `useAuth`; páginas não decidem autenticação lendo o armazenamento |
| Navegação e rota de erro | React Router em `src/routes/AppRoutes.tsx`, navegação por links e rota curinga para `NotFound` |
| Semântica e acessibilidade no layout | `main#conteudo-principal`, navegação rotulada, cabeçalhos, rodapé acessível, botões nativos, feedback textual e diálogos nativos |
| Foco de diálogos | Diálogo compartilhado confina foco por `showModal`, fecha por Escape e devolve foco ao acionador; menus e diálogos próprios têm tratamento de fechamento |
| Histórico do repositório | A branch herda mais de 20 commits `feat:`, `fix:`, `refactor:` ou `docs:` em uma janela de quatro semanas; o histórico começa em 23/08/2026 e chega a 01/11/2026 |

## Verificação executada nesta branch

- `npm run build` — passou.
- `npm run lint` — passou sem erros; ainda imprime avisos `react(set-state-in-effect)` em efeitos existentes.
- `npm run test:accessibility` — 5 testes passaram.
- `npm run test:dashboard` — 11 testes passaram.
- `npm run test:requirements` — 10 testes passaram, incluindo validações de formulários de produto, acesso e estoque.
- A checagem de código não encontrou `any`, `fetch` fora de `src/services/api.ts`, `alert()`, `console.log`, `window.location.href` ou inserção HTML direta em `src/`.

O teste de dashboard referenciava um nome de propriedade que já não existe no resultado atual de `analyzeDashboard`; a expectativa foi alinhada a `inventoryDivergences`, mantendo a regra de não somar quantidades de unidades diferentes.

## Evidências externas ainda necessárias

1. A aplicação precisa ser publicada e aberta ao vivo. A configuração Vercel usa `vercel.ts`; configure `API_ORIGIN` nos ambientes de Preview e Production e registre a URL verificada no `README.md`.
2. A apresentação precisa mostrar carregamento de cada rota na aba Network e a otimização no React DevTools Profiler.
3. O grupo precisa demonstrar prop drilling resolvido pelo Auth Context e a escolha do reducer com estado/action tipados.
4. O roteiro manual deve percorrer 320, 375, 768, 1024 e 1440 px; zoom/texto a 200%; espaçamento máximo; contrastes; foco; movimento reduzido; formulários; menus e diálogos.
5. A demonstração com NVDA ou VoiceOver precisa ser executada em navegador real. Testes automatizados e árvore de acessibilidade não substituem essa verificação.

Não foi inventado um endereço de produção. A publicação e as demonstrações ao vivo só podem ser marcadas como entregues depois que ocorrerem e houver URL/evidência para conferência.
