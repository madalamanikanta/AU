# Self-Appraisal Server

This repository contains a simple Node.js + Express + Mongoose backend for a Faculty Self-Appraisal system.

Prerequisites
- Node.js 16+ and npm
- MongoDB (local or remote)

Setup

1. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.
2. Install dependencies: `npm install`
3. Start server: `npm run dev` or `npm start`

Core endpoints (examples)

1) Login

POST /api/auth/login
Body:
{ "email": "faculty@example.com", "password": "securepass" }

Response contains `token` — include in `Authorization: Bearer <token>` for subsequent calls.

2) Submit research (faculty user)

POST /api/forms/submit-research
Headers: `Authorization: Bearer <token>`
Body:
{
  "formYear": 2025,
  "articles": [
    { "title": "Research A", "indexedIn": "WOS", "journalName": "Journal 1", "authors": ["<userid1>"] }
  ]
}

3) HOD approve section

POST /api/hod/approve-section
Headers: `Authorization: Bearer <hod token>`
Body:
{
  "facultyId": "<facultyId>",
  "formYear": 2025,
  "sectionName": "research",
  "status": "ACCEPTED",
  "pointsAwarded": 5,
  "comment": "Good work"
}

Notes & Next steps
- This code is a scaffold and includes validation, error handling, and embedding schemas. Customize business rules (scoring policy, caps, notifications) as needed.
# Self Apprisal - Auth Server

This small Express + Mongoose server provides simple register/login endpoints for the Self Apprisal project.

Quick start

1. Copy `.env.example` to `.env` and set `MONGO_URI` and `JWT_SECRET`.

2. Install dependencies:

   npm install

3. Start server:

   npm start

Endpoints

- POST /api/auth/register
  - body: { email, password, name? }
  - 201 on success

- POST /api/auth/login
  - body: { email, password }
  - returns { token, user }

Notes

- The server stores a JWT in the response. For production, prefer httpOnly cookies instead of localStorage.
- Ensure your MongoDB URI uses the correct credentials and network access.
