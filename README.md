# NoteFlow

Minimalist, high-performance daily productivity app. Everything lives in one chronological stream — **The Universal Flow** — with three frictionless content types: Quick Notes, Task Checklists, and Web/Media Links.

## Documentation

- [Product idea & scope](docs/idea.md) — problem, target user, v1 features, and future options.
- [Project management](docs/project-management.md) — Kanban workflow, Trello cards, and implementation order.
- [AI setup (Cursor)](docs/ai-setup.md) — project rules and how they are applied.
- [React Native theory](docs/react-native-teoria.md) — RN architecture, Metro, Expo Go vs Dev Build, UI library choice.

## Stack

- **Expo SDK 56** + **Expo Router** (Tabs + Stack + Modal) + **TypeScript**
- **Gluestack UI v3** + **NativeWind** — design system
- **Zustand** — global state (API como fuente de verdad)
- **expo-secure-store** — token JWT cifrado en keychain
- **FlashList** — high-performance lists
- **Zod** — form validation
- **expo-haptics** — tactile feedback

## Run locally

```bash
# App móvil
npm install
cp .env.example .env   # EXPO_PUBLIC_API_URL apuntando a la API
npm start

# API (carpeta noteflow-api)
cd noteflow-api
npm install
cp .env.example .env.local   # DATABASE_URL + JWT_SECRET
npm run dev
```

Ver [noteflow-api/README.md](noteflow-api/README.md) para setup de Neon, endpoints y despliegue en Vercel.

## Project board

- **Trello:** [NoteFlow board](https://trello.com/b/7K2m8loX)

## Status

Functional Expo app sincronizada con API REST: notas, checklists e ideas en PostgreSQL (Neon), autenticación JWT, tres tabs + archivadas.
