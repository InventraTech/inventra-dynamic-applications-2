# Acessibilidade do Inventra

Toda tela nova deve ser responsiva, continuar utilizável com texto e espaçamento ampliados e aplicar as preferências salvas. Essas condições fazem parte da entrega, inclusive para estados de carregamento, sucesso, erro e ausência de dados.

## Funcionamento

- `/acessibilidade` pode ser aberta antes do login. Login e cadastro oferecem um acesso para configurar os recursos.
- Os ajustes ficam na prévia até pressionar **Salvar preferências**, disponível no início e no fim da página. **Restaurar padrão** restaura a aplicação inteira imediatamente.
- As preferências são locais a este navegador. A versão 3 migra as versões 1 e 2 e descarta valores inválidos e integrações inexistentes. Se o armazenamento estiver bloqueado, os ajustes funcionam durante a sessão e a interface informa a limitação.
- Escala do texto, fonte alternativa, espaçamento, contraste, paleta de estados, movimento, foco, cursor e formato dos avisos são globais. Textos e componentes usam medidas em `rem` e tokens semânticos.
- Com texto muito ampliado ou espaçamento elevado, a navegação vira menu e os conteúdos passam para uma coluna. A interface aceita rolagem vertical em vez de comprimir ou recortar os textos.
- O cursor ampliado atua em dispositivos com mouse. A régua acompanha ponteiro, toque e foco do teclado; também pode ser movida com os botões das ferramentas de leitura.
- A leitura em voz usa a voz do navegador, com controle manual, por foco ou por ponteiro. Os botões globais permitem ouvir, pausar, continuar e parar. Senhas e valores digitados não são lidos. Navegadores sem síntese de voz mantêm o recurso indisponível.
- O VLibras é carregado quando ativado, com estados de carregamento e erro e opção de tentar novamente. Sua posição e suas dimensões seguem o padrão do widget oficial; foco e movimento reduzido também são respeitados dentro do Shadow DOM.
- Controle por voz próprio e rastreamento ocular estão indisponíveis. Seus cartões informam isso e não oferecem ativação, calibração ou pedido de câmera/microfone.
- A opção de fonte de leitura usa OpenDyslexic, servida localmente com os arquivos WOFF2 e a licença SIL Open Font License 1.1. Os modos de visão de cores adaptam as paletas dos estados, mantendo os nomes e símbolos; não simulam uma deficiência visual.

## Onde manter cada responsabilidade

| Arquivo/componente | Responsabilidade |
| --- | --- |
| `context/AccessibilityContext.tsx` | Aplicar preferências no documento, persistir e integrar o widget |
| `context/accessibility.ts` | Contexto tipado e hook de consumo |
| `utils/accessibilitySettings.ts` | Valores padrão, validação e migração do armazenamento |
| `styles/accessibility.css` | Temas e regras globais que precisam alcançar todas as páginas |
| `layout/AccessibilityTools` | Régua, atalhos e controles de leitura |
| `hooks/useReadAloud.ts` | Síntese de voz, pausa, cancelamento e falhas |
| `services/libras.ts` | Carregar o serviço externo, tratar falha e permitir nova tentativa |
| `ui/Feedback` | Avisos com texto e semântica de erro/sucesso/informação |
| `ui/SearchField` | Busca com rótulo, foco e variantes visuais |
| `layout/RouteAccessibility` | Atalho para o conteúdo, título da aba e foco após navegação |

Os componentes usam Tailwind. CSS global é reservado aos temas, preferências do documento e recursos externos que não recebem classes da aplicação. Valores dinâmicos de cursor, máscara de SVG e posição da régua precisam de propriedades calculadas.

## Critérios de entrega de cada tela

1. Conferir 320, 375, 768, 1024 e 1440 pixels, além de orientações diferentes quando houver alteração de layout.
2. Conferir texto em 200%, espaçamento máximo e fonte alternativa. Conteúdo e ações essenciais devem continuar disponíveis.
3. Conferir zoom do navegador em 200% e 400%, separadamente da escala de texto do Inventra. A largura equivalente a 320 pixels deve manter o fluxo de leitura.
4. Conferir os quatro modos de contraste e as paletas de estados. Texto comum precisa de contraste de pelo menos 4,5:1; texto grande e informação visual de controles precisam de pelo menos 3:1.
5. Percorrer a tela com Tab/Shift+Tab, Enter, Espaço, setas nos controles nativos e Escape nos diálogos. O foco deve permanecer visível e não ficar preso após fechar um menu.
6. Usar um `main`, um `h1`, hierarquia de títulos, controles nativos e nomes acessíveis. Rótulos, instruções e erros devem estar associados aos campos. Valores de formulário não devem ser lidos pela síntese de voz.
7. Anunciar carregamento e resultado sem repetir mensagens desnecessariamente. Avisos compactos também mantêm texto; estados nunca dependem só da cor.
8. Em tabelas largas, manter a rolagem no contêiner da tabela, acessível por teclado, com título e cabeçalhos. A página ao redor continua adaptável.
9. Conferir preferências após navegar e recarregar, restauração do padrão e funcionamento sem armazenamento persistente.
10. Conferir leitor de tela real, como NVDA, antes de afirmar conformidade completa. Uma árvore acessível correta é necessária, mas não substitui esse uso.

## Validação local

```sh
npm run build
npm run lint
npm run test:accessibility
```

O último comando verifica tipos dos testes e executa cinco casos de migração, descarte de valores inválidos e preservação de preferências. Precisa de Node.js com suporte a `--experimental-strip-types`.

Com o Vite aberto, `/tests/accessibility/index.html` permite conferir Topbar, Sidebar, ferramentas, avisos e cartões reais de histórico com dados fictícios de validação. Essa página fica fora do código de entrada da aplicação, não cria sessão e não consulta o back-end; não entra no build de produção.

Na implementação foram conferidos login, cadastro, configurações e componentes compartilhados entre 320 e 1440 pixels, incluindo escala de texto de 200%, fonte alternativa e espaçamento máximo. Foram conferidos erros associados a campos e foco no primeiro campo inválido, Escape e retorno do foco do menu, e controles de leitura em voz. O uso com NVDA/VoiceOver, diferenças entre navegadores e a qualidade da tradução do serviço externo continuam sendo validações específicas de apresentação; não se declara certificação WCAG completa.

Referências: [reflow](https://www.w3.org/WAI/WCAG21/Understanding/reflow.html), [espaçamento de texto](https://www.w3.org/WAI/WCAG21/Understanding/text-spacing.html), [contraste mínimo](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) e [temas com Tailwind](https://tailwindcss.com/docs/dark-mode).
