# QuickBites

QuickBites is a restaurant table-reservation system with separate experiences for customers, restaurant staff, and administrators. Customers can discover restaurants, reserve available tables, make reservation payments, manage reservations, and leave reviews. Staff can manage assigned restaurants' tables and reservations, while administrators can manage restaurant details, employees, cuisines, and images.

## Technology Stack

- React 19 and Vite
- Tailwind CSS
- Node.js and Express
- Microsoft SQL Server
- `mssql` for database access

## Main Features

- Customer, staff, and administrator roles
- Restaurant discovery, details, cuisines, images, and reviews
- Capacity- and timeslot-based table availability
- First-come, first-served reservations with a PKR 100 fee
- Reservation approval, cancellation, and completion workflows
- Support for assigning staff members to multiple restaurants
- Customer preferences and payment history
- Restaurant, table, staff, and administrator management

## Local Setup

### 1. Database

Create a SQL Server database named `QuickBites`, then run the scripts in this order:

1. `Deliverable 1.sql`
2. `Deliverable 2.sql`

### 2. Backend environment

Create `backend/.env` with your SQL Server connection details:

```env
PORT=5000
DB_USER=your_sql_server_user
DB_PASSWORD=your_sql_server_password
DB_SERVER=your_server_or_instance
DB_PORT=1433
DB_NAME=QuickBites
```

For SQL Server Express, the server value may look like `MACHINE_NAME\SQLEXPRESS`. A named instance commonly uses dynamic ports, so use the port configured for that instance.

### 3. Install and run

```bash
cd backend
npm install
npm run dev
```

The backend runs at `http://localhost:5000`, and the Vite frontend is started from the `frontend` directory by the combined development command.

## Contributors

The contribution summaries below are based on the repository's Git history. Commit identities sharing the same email address have been consolidated.

### 1. Shehryar Hassan - `shehryarhassan789`

- Established the main project structure and much of the frontend foundation.
- Set up React, Vite, and Tailwind CSS.
- Implemented login, signup, navigation, profiles, and routing.
- Built and integrated customer restaurant, reservation, payment, and review flows.
- Added restaurant management pages and admin-facing restaurant features.
- Developed staff reservation screens and contributed extensive API integration.
- Added restaurant integration, SQL query updates, profile-image fixes, and general bug fixes.
- Managed and merged a large portion of the project's feature branches and pull requests.

### 2. Meerab Munir - `fastcel`

- Integrated tables, reservations, and payments with SQL Server.
- Added SQL queries and customer reservation pages.
- Built dashboard, restaurant employee, staff, and administrator functionality.
- Added reservation modification and admin/staff API integration.
- Expanded staff support to multiple assigned restaurants.
- Fixed signup, restaurant, staff, reservation, payment, review, and table-availability workflows.
- Added access controls and hardened customer, staff, and administrator operations.

### 3. Ahmad Rauf - `levi426`

- Implemented cuisine controller, model, route, and SQL integration work.
- Implemented review controller, model, route, and SQL integration work.

### 4. Hadiya Kashif - `hadiya-kashif`

- Added the initial sample backend used during the project's early development.

## Contribution Notes

Some Git history contains merge commits, abbreviated messages, and multiple author names for the same email address. The summaries above group related commits by verified Git email identity and describe the main areas visible in those commits.
