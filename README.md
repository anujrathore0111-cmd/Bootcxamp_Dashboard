# ROAM/OPS Dashboard

ROAM/OPS is a responsive dashboard for monitoring international SIM sales, revenue, representative performance, and financial settlements. It presents live Supabase data through an Overview screen and a Settlements screen.

## Features

- Daily sales and revenue KPIs
- Month-to-date growth and top-performer summaries
- Interactive daily, monthly, representative-share, and settlement charts
- Sales representative leaderboard and daily progress breakdown
- Financial settlement and payout ledger
- Report-date filtering
- Loading and API error states with retry support
- Print-friendly report export
- Responsive sidebar navigation for smaller screens

## Project Structure

```text
.
├── index.html   # Dashboard markup and Chart.js dependency
├── style.css    # Responsive dashboard styles
├── api.js       # Supabase requests, rendering, navigation, and charts
└── README.md
```

## Getting Started

This is a static, no-build project. A local HTTP server is recommended because the dashboard makes API requests from JavaScript.

### Option 1: Python

```bash
python -m http.server 8000
```

### Option 2: Node.js

```bash
npx serve .
```

Open the local URL shown by the server, such as `http://localhost:8000`.

## Supabase Configuration

The client configuration is currently defined at the top of `api.js`:

```js
const SUPABASE_URL = "https://your-project.supabase.co/rest/v1/";
const SUPABASE_ANON_KEY = "your-publishable-key";
```

The dashboard sends a `POST` request to the `get_sale_dashboard` RPC with this body:

```json
{
  "report_date": "YYYY-MM-DD"
}
```

The RPC response should provide these top-level fields:

- `kpi_cards`
- `leaderboard_metrics`
- `daily_metrics`
- `monthly_metrics`
- settlement data used by the Settlements view

The frontend expects KPI values such as `TODAY_SALES`, `TODAY_REVENUE`, `mtd_sales`, `MTD_REVENUE`, and `PMSD_SALES`. Adjust the rendering code in `api.js` if your database schema uses different names.

## Security Notes

Only use a Supabase publishable/anonymous key in this browser-based client. Do not place a service-role key or other secret in `api.js`. Protect database access with Supabase Row Level Security and RPC permissions. For production deployments, consider routing sensitive operations through a server-side API.

## Deployment

Because the project has no build step, deploy the repository to any static hosting provider, such as GitHub Pages, Netlify, or Vercel. Ensure the deployed origin is allowed by Supabase and that the RPC is available to the client role.

## License

No license has been specified yet.
