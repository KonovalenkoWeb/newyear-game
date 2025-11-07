# 🎭 Murderbox - Realtime Party Game

Realtidsbaserat partyspel (Jackbox-liknande) med tre vyer: **/admin**, **/tv** och **/spelare**.
Byggt med **React**, **Vite**, **Node.js/Express**, **Socket.IO** och **Prisma (SQLite)**.

## 🚀 Quick Start

```bash
# Installera dependencies
npm install

# Starta backend server (port 3003)
cd apps/server && npm run dev

# Starta frontend (port 5173) - i ny terminal
cd apps/web && npm run dev
```

## 📁 Projektstruktur
```
/apps
 ├─ server   # Express + Socket.IO + Prisma backend
 └─ web      # Vite + React frontend
/packages
 └─ shared   # Delade TypeScript typer & socket-kontrakt
/lib
 └─ taskmaster-ai.js  # AI-driven projekthantering
```

## 🎮 Spelvyer

- **📱 Player Interface** (`/spelare`) - Spelare registrerar sig och interagerar  
- **📺 TV Display** (`/tv`) - Publik-vy som visar spelstatus
- **⚙️ Admin Panel** (`/admin`) - Spelledare kontrollerar spelet

## 🔧 Tech Stack

**Backend:**
- Node.js + Express
- Socket.IO (realtids-kommunikation)  
- Prisma ORM + SQLite
- TypeScript

**Frontend:**
- React + TypeScript
- Vite (build tool)
- React Router (routing)
- Tailwind CSS (styling)
- Socket.IO Client

## 📊 Database Models
```prisma
model Player {
  id           String   @id @default(cuid())
  name         String
  photoDataUrl String
  score        Int      @default(0)
  isConnected  Boolean  @default(true)
}

model GameState {
  id             Int      @id @default(1)
  isStarted      Boolean  @default(false)
  currentGameKey String?
}
```
4. **Rapportering**: Regelbundna rapporter och rekommendationer

## Exempel på automatiserade tasks
- Kodgranskning och kvalitetskontroll
- Testning och CI/CD
- Dokumentationsuppdateringar
- Deployment och releasehantering

## Support
För support och konfiguration, se Taskmaster AI dokumentation eller kontakta projektägaren.