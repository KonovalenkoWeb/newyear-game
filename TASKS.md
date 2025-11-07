# 🧩 TASKS.md – För Taskmaster AI & Copilot

## FAS 0 – Projekt
- Skapa monorepo (`apps/server`, `apps/web`, `packages/shared`), TS strict, ESLint/Prettier, vitest.
- Konfigurera ts-alias `@shared/*`.

## FAS 1 – Server
- Express + Socket.IO. Prisma schema enligt README. Seed GameState.
- Socket-rooms: lobby, admin, tv, player:<id>.
- Handlers: player:register, admin:start/stop, admin:selectGame, admin:score:add/set, admin:message:send, admin:player:remove.
- Reset rensar Player/Message och sätter GameState isStarted=false, currentGameKey=null.

## FAS 2 – Web
- Vite React TS med routes: /admin, /tv, /spelare. Tailwind. SocketProvider.
- TV: QR till /spelare, lobbygrid, spelplan (3x4), highlight på game:selected.
- Spelare: namn->kamera->foto->gå med->väntar på start.
- Admin: toggle start/stop, välj spel, poängpanel, meddelanden, kick.

## FAS 3 – Stabilitet & Test
- Reconnect (localStorage playerId), offline markering, toasts.
- vitest: enhetstester för shared-event, integrations-test för reset.
