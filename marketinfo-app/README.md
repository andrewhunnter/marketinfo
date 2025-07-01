# MarketInfo Dashboard

A full-stack application with Next.js frontend and Flask backend that displays cryptocurrency charts, economic calendar data, and push notifications from your existing data sources.

## Project Structure

```
marketinfo-app/
├── frontend/          # Next.js + TypeScript + Tailwind CSS
├── backend/           # Flask API
└── README.md
```

## Data Sources

The application connects to your existing data:
- **Crypto CSV Data**: `cli-charts/data/` (BTC.csv, ETH.csv, SOL.csv)
- **Economic Calendar**: `calendar/data/economic_calendar.json`
- **Crypto Push Data**: `pushes/crypto_data/latest.json`
- **Macro Push Data**: `pushes/macro_data/latest.json`

## Setup Instructions

### Backend Setup (Flask)

1. Navigate to the backend directory:
```bash
cd marketinfo-app/backend
```

2. Create and activate a virtual environment:
```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the Flask server:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

### Frontend Setup (Next.js)

1. Navigate to the frontend directory:
```bash
cd marketinfo-app/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/data/overview` - Overview of all available data
- `GET /api/crypto/prices` - All crypto price data
- `GET /api/crypto/prices/{symbol}` - Specific crypto data (BTC, ETH, SOL)
- `GET /api/pushes/crypto` - Latest crypto push data
- `GET /api/pushes/macro` - Latest macro push data
- `GET /api/calendar/economic` - Economic calendar events

## Features

- 📊 **Interactive Charts**: Cryptocurrency price charts using Chart.js
- 📅 **Economic Calendar**: Display of economic events and data
- 📱 **Push Data Display**: Latest crypto and macro push notifications
- 📈 **Data Overview**: Status of all data sources
- 🎨 **Modern UI**: Clean, responsive design with Tailwind CSS

## Quick Start

Run both services with these commands in separate terminals:

**Terminal 1 (Backend):**
```bash
cd marketinfo-app/backend
source venv/bin/activate
python app.py
```

**Terminal 2 (Frontend):**
```bash
cd marketinfo-app/frontend
npm run dev
```

Then open `http://localhost:3000` in your browser.

## Troubleshooting

- Make sure the Flask backend is running on port 5000 before starting the frontend
- Check that all data files exist in the correct locations relative to the project root
- If you get CORS errors, ensure Flask-CORS is properly installed and configured 