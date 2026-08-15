# FleetLog

- A fuel and fleet expense tracker for transport operators in Ghana which is used to
  log fuel purchases, watch km/L efficiency and cost-per-km update automatically, and
  stay ahead of vehicle maintenance.

- Built with Next.js 16, TypeScript, MongoDB/Mongoose, and Tailwind CSS v4.

## Project Stack

| Layer      | Choice                                                                        |
| ---------- | ----------------------------------------------------------------------------- |
| Framework  | Next.js 16 (App Router, Turbopack, Server Components)                         |
| Language   | TypeScript                                                                    |
| Database   | MongoDB via Mongoose                                                          |
| Auth       | Custom JWT sessions (`jose`) in httpOnly cookies, `bcryptjs` password hashing |
| Validation | Zod (shared client/server schemas)                                            |
| Styling    | Tailwind CSS v4, self-hosted fonts (Sora / Inter / IBM Plex Mono)             |
| Charts     | Recharts + a hand-built SVG efficiency gauge                                  |
| Testing    | Vitest (unit tests for the calculation/validation engine)                     |

## Project Structure

```
src/
  app/
    page.tsx                # public landing page
    about/, contact/         # public marketing pages
    login/                   # sign-in (any role)
    signup/                  # public driver sign-up (→ PENDING)
    [secret]/                # admin/manager portal (sign-in + sign-up), gated by env
    dashboard/                # authenticated app shell + pages
      layout.tsx              # server-side auth guard, loads current user
      page.tsx                 # role-aware overview (fleet analytics / personal stats)
      vehicles/, fuel-logs/, maintenance/, users/, audit/, profile/
    api/                      # route handlers (REST-ish JSON API)
  components/
    ui/                       # Button, Input/Select/Textarea, Modal, Toast, Card, Badge, Faq…
    layout/                    # DashboardShell (sidebar/topbar), PublicNavbar/Footer
    auth/                       # LoginForm, RegisterForm, PortalView (shared by login/signup/portal)
    contact/                     # ContactForm
    dashboard/                    # entity forms (VehicleForm, FuelLogForm, UserForm, …)
    charts/                        # EfficiencyGauge, SpendTrendChart, VehicleSpendBar
    icons/                          # Logo
  lib/
    calculations.ts          # pure fuel-efficiency engine (distance/km-L/cost-per-km) — unit tested
    validation.ts             # Zod schemas shared by forms and API routes
    auth.ts / session.ts      # JWT signing/verification, route-handler auth guard
    register.ts                # shared "create user (+ optional session)" helper
    portal.ts                   # resolves a secret URL segment to ADMIN/MANAGER portal config
    rbac.ts                      # role → permission map (Admin / Manager / Driver)
    db.ts                         # cached Mongoose connection for serverless
    queries.ts                     # shared read-models for analytics & driver overview
    serializers.ts                  # Mongoose documents → plain DTOs for Client Components
  models/                     # Mongoose schemas: User, Vehicle, FuelLog, Maintenance, AuditLog, ContactMessage
  types/                       # shared DTO types
scripts/seed.ts                 # demo data seeder
tests/                           # Vitest unit tests
```

## Getting started

### 1. Prerequisites

- Node.js 20+
- A MongoDB connection string to a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster.

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example file and fill in your own values:

```bash
cp .env.example .env.local
```

| Variable              | Description                                               |
| --------------------- | --------------------------------------------------------- |
| `MONGODB_URI`         | Connect MongoDB connection string here.                   |
| `AUTH_SECRET`         | Random string used to sign session JWTs.                  |
| `ADMIN_PORTAL_PATH`   | Secret URL for the Admin sign-up/sign-in portal.          |
| `MANAGER_PORTAL_PATH` | Secret URL for the Fleet Manager sign-up/sign-in portal.  |

### 4. Run the dev server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000).

## How accounts work

FleetLog has three self-service entry points, deliberately kept apart:

- **`/signup`** (linked from "Get started" everywhere): public driver
  sign-up. New accounts are created with status `PENDING` and can't sign in
  until a fleet manager or admin approves them from the **Users**/**Drivers**
  page in the dashboard.
- **`/login`** (sign-in for any role): The password is the real access
  control here, so there's no reason to gate sign-*in* by URL, only
  sign-*up* for the elevated roles below is gated.
- **`/<ADMIN_PORTAL_PATH>`** and **`/<MANAGER_PORTAL_PATH>`** — private
  portals (e.g. `/admin-portal-8x2k`) that combine a sign-in tab with a
  "create account" tab for that specific role. Accounts created here are
  **active immediately**, no approval step. Anyone who doesn't know the
  exact secret path gets an ordinary 404, the page doesn't reveal that a
  portal exists at all.

- Beyond self-service sign-up, **admins can create any account** (driver,
  fleet manager, or admin) directly from the Users page, and **fleet managers
  can create driver accounts only** — both bypass the pending-approval queue
  since a privileged user created them directly.

- **Heads up:** the admin/manager portal paths are security-through-obscurity, a real
  production rollout would want time-limited, single-use invite tokens instead of a
  static secret URL. Documented as a known trade-off for this project's scope.

## Roles at a glance

- **Driver**: Logs fuel for vehicles, sees their own fuel history and the
  vehicle list. Signs up publicly and waits for approval.
- **Fleet Manager**: Everything a driver can do, plus manages vehicles,
  maintenance records, adds/approves drivers, and views fleet-wide
  analytics. Registers via the private manager portal.
- **System Admin**: Everything a manager can do, plus manages every
  account/role and reviews the audit log. Registers via the private admin
  portal. 
