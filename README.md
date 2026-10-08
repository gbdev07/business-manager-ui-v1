# KODA — identidade visual

Apresentação da identidade visual da KODA, em Next.js.

## Executar

```bash
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

```bash
npm run lint
npm run build
npm run generate:logos
```

`generate:logos` recria os SVG a partir do Plus Jakarta Sans. As fontes ficam em `scripts/.cache`, fora do Git. Os arquivos em `public/brand` já estão gerados.

A frase institucional e os textos da apresentação ficam em `src/lib/brand.ts`.

Diretrizes: `docs/brand-guidelines.md` e `docs/logo-concepts.md`.
