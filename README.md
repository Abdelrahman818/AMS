# Asset Management Frontend

Arabic, RTL-first Next.js frontend for the BH-AEP asset management system.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Data sources

The dashboard, asset register, and workspace modules load their demo records from:

- `public/mock-data/dashboard.json`
- `public/mock-data/assets.json`
- `public/mock-data/modules.json`

Edit these JSON files to change the sample data; the UI does not embed demo records. Without an API URL, the asset register reads the JSON file. To connect it to an API, set `NEXT_PUBLIC_API_BASE_URL` in `.env.local`; the frontend requests `GET /api/v1/assets` and accepts a raw array, an array in `data`, or a paginated `data.items` / `data.assets` response. If that request fails or returns no usable data, the register falls back to the JSON sample and displays a notice. Dashboard metrics remain mock data until a dashboard API is available.

Asset detail, add, and edit screens are available in the prototype. Detail tabs include custody (including distributed custody), asset history, attachments placeholders, and vehicle history. Add/edit validates required fields and requires a reason when an existing vehicle's plate or engine number changes. These screens use in-session state only; new records and edits are not saved to the API or JSON files. Custody actions, file uploads, and QR generation remain placeholders until their services are available. CSV export works in the browser.

## Available screens

The prototype includes an admin-style dashboard, a searchable and filterable asset register, dedicated asset detail and add/edit screens, and module screens for custody and transfers, inventory, scrap requests, accessories, reports, notifications, employees and departments, and system administration. Module screens include mock tables, tabs, filters, and session-only actions where applicable. These are frontend demonstrations, not complete business workflows: authentication, permissions, file processing, backups/restores, and API persistence are not implemented.

Screen navigation is currently state-based within the main shell rather than URL routes. Data and interactions are demo-only; changes reset when the page session ends.

The interface uses a muted, low-glare palette, a system Arabic-friendly font stack, and larger text for comfortable reading. The light/dark theme toggle remains available. Numeric values use Western digits (for example, `5423`) without thousands separators; Arabic labels and RTL layout are retained.

## Checks

```bash
npm run lint
npm run build
```
