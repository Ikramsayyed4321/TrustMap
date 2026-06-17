# ReviewHub Architecture

## Backend

The API follows a controller-service-repository pattern:

- Controllers parse HTTP input and return responses.
- Services hold business rules and orchestration.
- Repositories isolate Prisma queries and SQL aggregation logic.
- The Prisma schema defines PostgreSQL persistence, indexes, and relationships.
- Middleware handles authentication, validation, rate limiting, security, and errors.

Core modules:

- Auth: registration, login, refresh-token rotation, logout, verification-ready flow.
- Users: profile, roles, reputation, badges, follows, bans.
- Businesses: listings, geospatial search, rating distributions, hours, owner response metadata.
- Reviews: ratings, media, helpful votes, reports, edit history, AI moderation.
- Admin: analytics, moderation queues, user/business/review management.
- AI: OpenAI review summary, sentiment, fake-review detection, smart-search intent parsing.
- Notifications: database notifications and Socket.IO real-time delivery.

## Frontend

The React app uses feature folders and shared UI primitives:

- `features/public`: home, search, business details, categories, profiles, trending, about, contact.
- `features/user`: profile settings, saved places, review history, notifications.
- `features/admin`: analytics dashboard and management screens.
- `components/layout`: shell, navigation, protected routes.
- `components/ui`: ShadCN-style reusable controls.
- `store`: Zustand global session/theme/search state.

## Data

PostgreSQL tables include users, businesses, reviews, categories, reports, notifications, AI summaries, media uploads, saved places, and review likes. Business latitude and longitude are stored first-party in ReviewHub; production distance search can be upgraded to PostGIS.

## AI Flow

1. Review is submitted.
2. API validates content and stores a pending or approved review based on role and moderation state.
3. AI service classifies sentiment and moderation risk.
4. Review metadata is updated with AI results.
5. Business rating aggregates and AI summary are recalculated asynchronously.

## Maps

Leaflet renders OpenStreetMap tiles. Business coordinates are stored in ReviewHub's PostgreSQL database. No Google Maps API or Google review data is used.
