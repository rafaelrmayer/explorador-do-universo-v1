# 🌌 Explorador do Universo — V1

Um pequeno universo para explorar, experimentar e descobrir. Projeto educativo em português, feito com HTML, CSS e JavaScript puro.

## O que funciona nesta versão

- **Home** com navegação para as áreas principais.
- **Explorar**: cartões do Sol, planetas, Terra e Lua com curiosidades.
- **Experimentar**: simulação interativa de gravidade em Canvas. Ajuste a força e solte a bolinha.
- **Lua**: explorador visual das fases da Lua.
- **Observar**: pequenas missões de observação do céu.
- **Acessibilidade**: layout responsivo, foco visível, textos curtos, sem cronômetros ou punições e controle para reduzir movimento.

## Como executar localmente

1. Baixe ou clone este repositório.
2. Abra `index.html` no navegador.

Não é necessário instalar dependências, configurar servidor ou usar uma API.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub, por exemplo `explorador-do-universo`.
2. Envie `index.html`, `style.css`, `app.js` e `README.md` para a raiz do repositório.
3. Abra **Settings → Pages**.
4. Em **Build and deployment**, selecione **Deploy from a branch**.
5. Escolha a branch `main` e a pasta `/ (root)`, depois salve.
6. Aguarde o GitHub Pages publicar o site. O endereço aparecerá na própria seção **Pages**.

## Estrutura

```text
explorador-do-universo/
├── index.html
├── style.css
├── app.js
└── README.md
```

## Nota sobre a simulação

O experimento de gravidade é um modelo didático simplificado: o controle altera a aceleração da bolinha para demonstrar qualitativamente a diferença entre uma queda mais lenta e mais rápida. Não é uma simulação quantitativa em escala física real.

## Próximos passos sugeridos

- Melhorar a representação visual e física das fases da Lua.
- Criar a experiência de órbita com trajetórias e resultados diferentes.
- Testar contraste, navegação por teclado e leitores de tela com usuários.
- Adicionar um ícone e manifest para uma futura versão PWA.

## Licença

Ainda não foi definida. Escolha uma licença antes de aceitar contribuições públicas.
