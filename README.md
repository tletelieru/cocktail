# Cocktail

Contador de puntos del Cocktail, juego de naipes de 6 juegos para 3 o 4 jugadores. Se ingresa lo que se llevó cada jugador y la app calcula los puntos, el acumulado y si cada juego calza con su total fijo.

PWA offline. Todo queda en el `localStorage` del dispositivo.

## Desarrollo

```sh
pnpm install
pnpm dev
pnpm lint && pnpm test && pnpm build
```

## Deploy

Al publicar en `tletelieru/cocktail`, cada push a `main` despliega en <https://tletelieru.github.io/cocktail/>. Requiere Pages con source "GitHub Actions".

## Licencia

[MIT](LICENSE)
