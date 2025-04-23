# Airwallex Google Pay Demo

A minimal demo app integrating **Google Pay** via [Airwallex Embedded Elements](https://www.airwallex.com/docs/js/payments/googlepaybutton) using:

- Node.js (Express backend)
- Vite + Vanilla JS frontend (no React)
- airwallex-payment-elements via npm

## Setup

1. **Clone & install dependencies**:

```bash
npm install
cd frontend
npm install
```

2. **Create `.env`** in root:

```bash
AIRWALLEX_API_KEY=your_demo_api_key"
AIRWALLEX_CLIENT_ID=your_demo_client_id
AIRWALLEX_ENV=demo
```

3. **Run backend**:

```bash
node server.js
```

4. **Run frontend**:

```bash
cd frontend
npm run dev
```

Visit: [http://localhost:5173](http://localhost:5173)
