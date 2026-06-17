# ReviewHub

ReviewHub is a production-oriented, independent review platform for restaurants, hotels, shops, cafes, hospitals, gyms, salons, and local businesses. It does not use Google Maps APIs or external review providers. Maps are powered by OpenStreetMap tiles through Leaflet.

## Stack

- React + TypeScript + Vite
- Tailwind CSS, ShadCN-compatible primitives, Framer Motion, Recharts, Lucide Icons
- Node.js + Express + TypeScript
- PostgreSQL + Prisma
- JWT access tokens + refresh tokens
- Cloudinary upload abstraction
- OpenAI-powered review summaries, sentiment, moderation, and smart-search parsing
- REST API, Swagger docs, Docker support

## Project Layout

```txt
apps/
  api/     Express API, Prisma schema, services, controllers, Swagger
  web/     React app, public pages, user dashboard, admin panel
docs/      Architecture, API, deployment, and production notes
```

## Quick Start

1. Copy environment variables:

```bash
cp .env.example .env
```

2. Install dependencies:

```bash
npm install
```

3. Start PostgreSQL and the apps:

```bash
docker compose up --build
```

4. Open:

- Web: http://localhost:5173
- API: http://localhost:4000/health
- Swagger: http://localhost:4000/api-docs

## Development

```bash
npm run dev
npm run build
npm run lint
```

## Important Environment Variables

- `DATABASE_URL`: PostgreSQL connection string.
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`: strong secrets for auth tokens.
- `CLOUDINARY_*`: media upload credentials.
- `OPENAI_API_KEY`: enables AI review summary, sentiment, spam detection, and smart search.
- `OPENAI_MODEL`: optional model override. Leave empty to use the server default.

## Security Baseline

The API includes Helmet, CORS allow-listing, rate limiting, cookie parsing, request validation, role-based authorization, refresh-token rotation, and centralized error handling. Production deployments should terminate TLS at a reverse proxy or platform load balancer.
