# Zaujain

> The world's most beautiful personalized digital gift platform.

---

## What is Zaujain?

Zaujain is a premium digital gifting platform where people create unforgettable experiences for the people they love. Unlike traditional gifts, Zaujain experiences come alive through memories, games, surprises, and beautiful interactions.

Every experience should feel like opening a handcrafted gift.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Media | Cloudinary |
| Hosting | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase account and project
- A Cloudinary account
- A Vercel account (for deployment)

### 1. Clone the repository

```bash
git clone https://github.com/your-org/zaujain.git
cd zaujain
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=zaujain_unsigned
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Copy your Project URL and anon key to `.env.local`
3. Run the database migrations (see `/docs/database-setup.md`)
4. Enable Email authentication in Supabase Auth settings

### 5. Set up Cloudinary

1. Create a Cloudinary account at [cloudinary.com](https://cloudinary.com)
2. Create an **unsigned upload preset** named `zaujain_unsigned`
   - Go to Settings → Upload → Upload presets → Add upload preset
   - Set signing mode to **Unsigned**
   - Set the folder to `zaujain`
3. Copy your cloud name, API key, and API secret to `.env.local`

### 6. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
src/
├── app/                    # Next.js App Router pages and layouts
├── components/
│   ├── ui/                 # Primitive UI components (Button, Card, Input...)
│   ├── layout/             # Layout components (Header, Footer, Navigation...)
│   └── shared/             # Shared business components
├── features/               # Feature modules (self-contained)
│   ├── auth/               # Authentication
│   ├── gift/               # Gift creation and viewing
│   ├── time-capsule/       # Time Capsule feature
│   ├── games/              # All couple games
│   ├── memory-vault/       # Memory management
│   ├── love-canvas/        # Drawing feature
│   ├── themes/             # Theme system
│   ├── notifications/      # Notification system
│   └── admin/              # Admin dashboard
├── hooks/                  # Custom React hooks
├── lib/
│   ├── supabase/           # Supabase client utilities
│   └── cloudinary.ts       # Cloudinary utilities
├── services/               # API service layer
├── types/                  # TypeScript type definitions
├── utils/                  # Pure utility functions
└── styles/
    └── globals.css         # Global styles and CSS variables
```

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format with Prettier |
| `npm run type-check` | TypeScript type check |

---

## Design System

Zaujain uses a custom design system built on Tailwind CSS.

### Typography

- **Display:** Cormorant Garamond — elegant, literary, romantic
- **Body/UI:** DM Sans — friendly, clean, modern
- **Mono:** DM Mono — for activation keys and code

### Colors

- **Rose** (`#C4717A`) — primary brand accent
- **Gold** (`#B8935A`) — secondary warmth
- **Ink** (`#1C1917`) — deep warm text
- **Parchment** (`#FAF8F5`) — base background

All colors are CSS variables that themes can override at runtime.

### Themes

The theme system allows any experience to adopt a completely different visual identity — colors, animations, decorations, and mood — while sharing the same component library.

Available themes: Default, Sakura, Galaxy, Korean Journal, Luxury Paper, Glass, Minimal, AMOLED, Valentine's, Ramadan, Eid, Christmas.

---

## Development Guidelines

- **Mobile-first:** All components designed for mobile, then enhanced for desktop
- **Accessibility:** All interactive elements must be keyboard-navigable with visible focus states
- **Performance:** Images lazy-loaded, animations GPU-accelerated, code split per feature
- **Emotion first:** If a feature doesn't improve the emotional experience, reconsider it

See the `/docs` folder for detailed guidelines on each area.

---

## Deployment

Zaujain deploys to Vercel automatically on push to `main`.

1. Connect your GitHub repository to Vercel
2. Add all environment variables in Vercel's dashboard
3. Deploy — Vercel handles the rest

---

## License

Private — all rights reserved.
