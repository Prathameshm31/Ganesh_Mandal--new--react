# Ganesh Mandal - Frontend Demo

A standalone React frontend demo application for managing a Ganesh Mandal (community festival committee). This is a **frontend-only** demo that uses static/mock data — no backend server required.

## Features

- **Dashboard** — Stats cards, monthly/pie/trend/colony charts, top contributors, goal progress
- **Members** — CRUD operations, search, filter by status/colony, member profiles with donation history
- **Donations** — Add/view/filter donations, payment modes, receipts, CSV export
- **Ganesh Murti** — Murti records across years, donor info, prasad sponsorship management
- **Volunteers** — Volunteer dashboard, categories, roles, attendance, birthday tracking
- **Events** — Festival event management with categories and schedules
- **Activities** — Social initiatives and community activities
- **Colony Management** — Colony-wise stats and collection tracking
- **Notifications** — Notification history, templates, reminder sending (simulated)
- **Reports** — Daily/monthly/yearly/colony-wise reports with charts
- **Settings** — Mandal info, bank details, UPI, notification config (persisted in session)
- **Dark Mode** — Toggle between light and dark themes

## Tech Stack

| Technology | Version |
|---|---|
| React | 18.3 |
| Vite | 2.9 |
| MUI (Material UI) | 9.x |
| React Router | 6.x |
| Recharts | 3.x |
| Framer Motion | 12.x |
| React Hook Form | 7.x |
| React Toastify | 11.x |

## Getting Started

### Prerequisites

- **Node.js** v16+ (v18+ recommended)
- **npm** v8+

### Installation

```bash
cd Frontend/ganesh-mandal-app
npm install
```

### Development Server

```bash
npm run dev
```

Opens at `http://localhost:3000`

### Production Build

```bash
npm run build
```

Output is in the `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Login Credentials

| Username | Password | Role |
|---|---|---|
| `admin` | `admin123` | Admin |
| `user` | `user123` | User |

## Mock Data

All data is stored in-memory in `src/mock-data/`:

| File | Records | Description |
|---|---|---|
| `members.js` | 510 | Community members with Pune-based addresses |
| `donations.js` | 2,300+ | Donation records across multiple years |
| `colonies.js` | 10 | Pune neighborhood colonies |
| `activities.js` | 20 | Social/cultural activities |
| `volunteers.js` | 20 | Volunteers across 9 categories |
| `events.js` | 15 | Festival events (Ganesh Chaturthi 2026) |
| `murtis.js` | 6 | Ganesh murti records (2021-2026) |
| `prasad.js` | 10 | Prasad sponsorship records |
| `attendance.js` | 25 | Volunteer attendance records |
| `notifications.js` | 10 | Notification history + 4 templates |
| `settings.js` | — | App settings (mandal info, bank, UPI) |
| `dashboard.js` | — | Computed dashboard statistics |

CRUD operations work within the session — add/edit/delete records and they persist until the page is refreshed.

## Project Structure

```
src/
├── assets/logo/          # Brand logo
├── components/           # Reusable UI components (charts, cards, skeletons)
├── config/               # App branding config
├── context/              # Auth and Theme context providers
├── layouts/              # Main layout (sidebar+appbar) and Auth layout
├── mock-data/            # All static data files
├── pages/                # Page components organized by module
├── services/             # Service layer (reads/writes mock data)
├── styles/               # Theme and global CSS
├── App.jsx               # Root component with routing
└── main.jsx              # Entry point
```
