# ♟️ Game Catur - React + Tailwind CSS

Game catur interaktif dibangun dengan React dan Tailwind CSS.

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js (v16+)
- npm atau yarn

### Instalasi

```bash
# Clone atau download project ini
cd chess-react

# Install dependencies
npm install

# Jalankan development server
npm start
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

### Build untuk Production

```bash
npm run build
```

## 📁 Struktur Project

```
chess-react/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/
│   │   ├── Square.js       # Komponen kotak catur
│   │   ├── ChessBoard.js   # Komponen papan catur
│   │   └── GameInfo.js     # Info game, kontrol, riwayat
│   ├── hooks/
│   │   └── useChessGame.js # Custom hook untuk state game
│   ├── utils/
│   │   └── chessLogic.js   # Logika permainan catur
│   ├── App.js              # Komponen utama
│   ├── index.js            # Entry point
│   └── index.css           # Tailwind + custom styles
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## ✨ Fitur

- ✅ **Gerakan Legal** - Hanya gerakan yang valid sesuai aturan catur
- ✅ **Deteksi Skak** - Papan berkedip merah saat raja terancam
- ✅ **Skakmat** - Deteksi kemenangan otomatis
- ✅ **Stalemate** - Deteksi seri
- ✅ **Promosi Pion** - Otomatis menjadi Queen saat mencapai ujung
- ✅ **Riwayat Langkah** - Notasi algebraic standar
- ✅ **Material Count** - Menghitung keunggulan material

## 🛠️ Tech Stack

- React 18
- Tailwind CSS 3
- Custom Hooks
- Pure Functions (logic terpisah dari UI)
