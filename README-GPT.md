# 🎭 Partyspel – "Murderbox" (arbetsnamn)

Realtidsbaserat partyspel (Jackbox-liknande) med tre vyer: **/admin**, **/tv** och **/spelare**.
Byggt med **React**, **Vite**, **Node.js/Express**, **Socket.IO** och **Prisma (SQLite)**.

## Struktur
```
/apps
 ├─ server   # Express + Socket.IO + Prisma
 └─ web      # Vite + React + Router + Tailwind
/packages
 └─ shared   # Delade typer & socket-kontrakt
```

## Datamodell (Prisma)
```prisma
model Player {
  id           String   @id @default(cuid())
  name         String
  photoDataUrl String
  score        Int      @default(0)
  joinedAt     DateTime @default(now())
  isConnected  Boolean  @default(true)
}
model Message {
  id        String   @id @default(cuid())
  playerId  String
  player    Player   @relation(fields: [playerId], references: [id])
  text      String
  expiresAt DateTime?
  createdAt DateTime @default(now())
}
model GameState {
  id             Int      @id @default(1)
  isStarted      Boolean  @default(false)
  currentGameKey String?
}
```

## Snabbstart
```bash
pnpm install
cd apps/server && pnpm prisma migrate dev && cd ../..
pnpm dev
```
Öppna: `http://localhost:5173/tv`, `/spelare`, `/admin`.

## Socket-händelser (MVP)
- player:register → player:joined
- admin:start / admin:stop → game:started / game:reset
- admin:selectGame → game:selected
- admin:score:add / admin:score:set → score:updated
- admin:message:send → secret:message (till en spelare)
- admin:player:remove → player:removed
