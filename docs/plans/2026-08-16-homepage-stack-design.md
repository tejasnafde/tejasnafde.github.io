# Homepage tools and stack design

## Goal

Show a concise and defensible technical profile. Do not turn the section into a complete résumé keyword inventory.

## Content

- Languages: Python, TypeScript, SQL
- Backend: FastAPI, Flask, Node.js, WebSockets
- Data: PostgreSQL/PostGIS, BigQuery, MongoDB, Redis, SQLite
- Infrastructure: GCP, Cloud Run, Pub/Sub, Airflow, Docker, Linux
- AI: Gemini, Vertex AI

Do not include a Frontend or Quality row. Do not list Firestore, pytest, Vitest, or OpenTelemetry.

## Presentation

Keep the existing compact index rows, mono category labels, slash separators, and hairline borders. The content wraps naturally on narrow screens.

## Verification

- Test all five categories and their exact items.
- Test that removed categories and tools stay absent.
- Run the production build.
- Inspect the section at 1440px and 375px in light and dark themes.
