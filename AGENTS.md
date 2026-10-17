# Regras do front Inventra

- Toda tela e componente novo deve funcionar em telas estreitas, com teclado e leitor de tela, e com as preferências de acessibilidade salvas. Isso faz parte da entrega.
- Preserve os nomes, os links e a aparência aprovados. Ajustes de acessibilidade não autorizam redesenhar a sidebar ou trocar seus itens.
- Valide 320, 375, 768, 1024 e 1440 pixels; texto em 200%; espaçamento máximo; contrastes; foco; movimento reduzido. Rolagem horizontal deve ficar restrita às tabelas que precisarem dela.
- Use os tokens semânticos do `src/index.css` e as utilidades oficiais do Tailwind. Valores arbitrários e CSS manual somente quando não houver uma utilidade adequada, como aplicação global de preferências.
- Reutilize Button, Input, SearchField, Toggle, Feedback e os componentes de layout. Os modos de acessibilidade são aplicados pelo AccessibilityProvider; páginas não devem manter cópias das preferências.
- Use um `main` com `id="conteudo-principal"` e `tabIndex={-1}` por tela, um `h1`, títulos em ordem e controles nativos. Associe rótulos, instruções e erros aos campos. Ações precisam funcionar sem hover.
- Modais devem confinar o foco enquanto abertos, fechar com Escape e devolver o foco ao acionador. Use `dialog` nativo quando adequado.
- Avisos sempre mantêm texto, mesmo no formato compacto. Cor nunca é a única indicação. Use Feedback para comunicar erro, sucesso e informação.
- Não ofereça como ativável uma integração que ainda não existe. Navegação para páginas futuras deve identificá-las como indisponíveis.
- Não leia senhas ou valores digitados com síntese de voz. Não solicite câmera ou microfone para funcionalidades indisponíveis.
- O back-end pode ser consultado, mas nunca deve ser editado.
- Nomes de branches usam `feat/`, `fix/` ou `refactor/`, sem `codex/`. Descrições de commits em português.

Consulte `docs/acessibilidade.md` para os critérios de entrega e os limites atuais.
