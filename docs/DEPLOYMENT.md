# Deployment Guide

## Build

```bash
npm run build
```

## Docker

```bash
docker compose up --build
```

For production, deploy API and web as separate services, attach a managed PostgreSQL database, and set environment variables in the platform secret manager.

## Production Checklist

- Use strong JWT and cookie secrets.
- Configure CORS to exact production origins.
- Enable TLS.
- Store refresh tokens hashed in PostgreSQL.
- Configure Cloudinary signed uploads or server-side uploads only.
- Set `OPENAI_API_KEY` and monitor AI request costs.
- Add background workers for expensive AI summary regeneration.
- Add CDN caching for uploaded media.
- Add centralized logging and alerting.
- Run database index creation during deployment.
