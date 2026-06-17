# REST API Summary

Base URL: `/api/v1`

## Auth

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/verify-email`

## Businesses

- `GET /businesses`
- `POST /businesses`
- `GET /businesses/:id`
- `PATCH /businesses/:id`
- `DELETE /businesses/:id`
- `GET /businesses/:id/reviews`
- `GET /businesses/:id/nearby`
- `POST /businesses/:id/owner-response`

## Reviews

- `POST /reviews`
- `PATCH /reviews/:id`
- `DELETE /reviews/:id`
- `POST /reviews/:id/helpful`
- `POST /reviews/:id/report`
- `GET /reviews/:id/history`

## Search

- `GET /search`
- `GET /search/autocomplete`
- `POST /search/smart`
- `GET /search/trending`

## Admin

- `GET /admin/analytics`
- `GET /admin/users`
- `PATCH /admin/users/:id/ban`
- `GET /admin/reviews/moderation`
- `PATCH /admin/reviews/:id/approve`
- `PATCH /admin/reviews/:id/reject`
- `GET /admin/reports`
- `PATCH /admin/reports/:id`
- `GET /admin/revenue`

## AI

- `POST /ai/reviews/:id/analyze`
- `POST /ai/businesses/:id/summary`
- `POST /ai/search-intent`
