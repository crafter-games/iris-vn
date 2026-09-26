# Iris.exe

Visual novel web de citas y misterio. Diseño completo en [`GDD.md`](GDD.md).

**Jugar:** https://iris.crafter.run

## Desarrollo

```bash
pnpm install
pnpm dev          # servidor local con recarga
pnpm build        # typecheck + build a dist/
pnpm preview      # sirve dist/ en :4173
pnpm playtest     # recorre el guion en Chromium headless y guarda capturas en playtest/
```

- El guion vive en `story/*.ink` ([Ink](https://github.com/inkle/ink)). Se compila a JSON en build (`tools/vite-plugin-ink.ts`).
- `Nombre: texto` es diálogo; una línea sin prefijo es narración.
- Deploy: cada push a `main` se despliega solo en el VPS de Crafter (Dokploy, `Dockerfile`).
