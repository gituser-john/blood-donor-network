# 🩸 Blood Donor Network

A full-stack web application that connects blood donors with patients in need, streamlining donor registration, request matching, broadcast notifications, and donation tracking — replacing manual paper-based record keeping with a searchable, auditable digital system.

**Live demo:** [https://blood-donor-network-ant2ubfzt-gituser-johns-projects.vercel.app/]

---

## Problem

Blood banks and hospital coordinators often rely on handwritten logs to track donors and requests — making it slow to find eligible donors during emergencies, easy to lose historical records, and hard to know who's already been notified or has donated. This project digitizes that entire workflow.

## Key Features

- **Donor Registration** — Register donors with blood group, contact, and location; medical eligibility is tracked automatically.
- **Smart Eligibility Matching** — Availability isn't manually set — it's computed live from each donor's last donation date (56-day minimum gap rule) and medical fitness, so it's never stale.
- **Returning Patient Lookup** — Patients are identified by phone number, so repeat requests don't require re-registration.
- **Location-Aware Matching** — Eligible donor search prioritizes same-district donors first, without excluding others — a lightweight proxy for proximity without needing full geolocation.
- **Broadcast & Notify** — Coordinators can broadcast a request to selected eligible donors; donors see it as an in-app alert and can accept or decline.
- **Multi-Unit Requests** — A single request can require multiple units, fulfilled by one or several donors; the request auto-closes once fully met.
- **Donation Tracking** — Every donation is recorded, automatically updating the donor's last-donated date and the request's fulfillment status.
- **Network Summary Dashboard** — Live aggregate stats: total requests, fulfilled vs. open vs. cancelled, total donations, broadcast responses, and currently eligible donors.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite) |
| Backend | Node.js + Express |
| Database | Supabase (PostgreSQL) |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

## Architecture

```
Client (React) → Express API → Supabase (Postgres)
```

The frontend never talks to the database directly — all business logic (eligibility calculations, cascading updates on donation, request auto-fulfillment) lives in the Express layer, keeping those rules enforceable and explainable rather than hidden in client-side code.

## Data Model

```
donors      donor_id (PK), name, blood_group, phone, district, last_given, medically_unfit, deleted
patients    patient_id (PK), name, phone, blood_group, hospital_name, district
requests    request_id (PK), patient_id (FK), blood_group, units_needed, units_received, status, district, created_at
donations   donation_id (PK), request_id (FK), donor_id (FK), status, units_donated, created_at
```

`donations` acts as the connective table between requests and donors, tracking each match through its lifecycle: `notified → responded → donated`.

## API Overview

| Resource | Routes |
|---|---|
| Donors | `GET/POST /api/donors`, `PUT/DELETE /api/donors/:id`, `GET /api/donors/:id/notifications` |
| Patients | `GET/POST /api/patients`, `GET /api/patients/search?phone=` |
| Requests | `GET/POST /api/requests`, `PATCH /api/requests/:id/cancel`, `GET /api/requests/:id/eligible-donors`, `POST /api/requests/:id/broadcast` |
| Donations | `PATCH /api/donations/:id/respond`, `PATCH /api/donations/:id/donate` |
| Summary | `GET /api/summary` |

## Running Locally

**Backend**
```bash
cd server
npm install
# create a .env file with SUPABASE_URL and SUPABASE_KEY
node index.js
```

**Frontend**
```bash
cd client
npm install
npm run dev
```

The frontend defaults to `http://localhost:5000` for API calls locally; set `VITE_API_URL` in a `client/.env` file to point elsewhere.

## Known Limitations / Next Steps

- Donation recording isn't yet fully race-condition-safe for simultaneous last-unit fulfillment — a Postgres transaction/RPC would harden this.
- No duplicate-broadcast protection yet (a donor could theoretically be notified twice for the same request).
- No real SMS/WhatsApp integration — donor notifications are simulated via in-app polling, per the project brief.
- "Needed by" date field for scheduling future requests was scoped but not completed.

## Why These Choices

- **No stored availability/summary fields** — both are fully derivable from existing data, so they're computed on read instead of stored, avoiding staleness.
- **Soft delete for donors** — preserves referential integrity for past donations rather than breaking foreign key history.
- **Role-based routing instead of full authentication** — this is a proof of concept; full auth was judged a disproportionate time cost against the core requirements.