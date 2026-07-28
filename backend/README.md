# SpectraLeaf Backend

Node.js + Express backend for the SpectraLeaf IoT Tea Fermentation monitoring system.
Connects to AWS DynamoDB table `FermentationData`.

---

## Installation

```bash
cd backend
npm install
```

---

## Environment Setup

Copy `.env.example` to `.env` and fill in your AWS credentials:

```bash
cp .env.example .env
```

```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
DYNAMODB_TABLE_NAME=FermentationData
PORT=5000
CORS_ORIGIN=http://localhost:3000
```

---

## Run the Backend

```bash
# Development (auto-restart on file changes)
npm run dev

# Production
npm start
```

Server starts on **http://localhost:5000**

---

## DynamoDB Table Structure

**Table name:** `FermentationData`

| Attribute | Type | Description |
|---|---|---|
| DEVICE_ID | String (PK) | Device ID or "BATCH#<batchId>" for summaries |
| TIMESTAMP | String (SK) | ISO 8601 timestamp or "SUMMARY" |
| TYPE | String | "SENSOR" or "SUMMARY" |
| FACTORY_ID | String | Factory identifier |
| BATCH_ID | String | Batch identifier |
| COLOR | Number | Average RGB color value (SENSOR only) |
| TEMPERATURE | Number | Temperature in °C (SENSOR only) |
| MQ135 | Number | NH3 gas sensor value in ppm (SENSOR only) |
| GLP | Number | Good Leaf Percentage 0–100 (SUMMARY only) |
| PRICE | Number | Selling price (SUMMARY only) |
| SUMMARY_KEY | String | Always "SUMMARY" (SUMMARY items only) |

### GSI Indexes Required

| Index | PK | SK | Projected |
|---|---|---|---|
| GSI_BATCH_SUMMARY | BATCH_ID | SUMMARY_KEY | FACTORY_ID, PRICE, GLP, TYPE |
| GSI_BATCH_TIME | BATCH_ID | TIMESTAMP | FACTORY_ID, MQ135, TEMPERATURE, **COLOR**, TYPE |
| GSI_FACTORY_PRICE | FACTORY_ID | PRICE | BATCH_ID, TYPE, GLP |
| GSI_FACTORY_TIME | FACTORY_ID | TIMESTAMP | COLOR, BATCH_ID, MQ135, TEMPERATURE, TYPE |

> ⚠️ **GSI_BATCH_TIME must include COLOR** in its projection for the color graph to work.
> Update it in the AWS Console → DynamoDB → FermentationData → Indexes → GSI_BATCH_TIME → Edit → Add COLOR.

---

## API Endpoints

### Health

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Check server and config status |

### Sensor

| Method | Path | Description |
|---|---|---|
| POST | `/api/sensor` | Ingest a sensor reading from ESP32 |

### Batch

| Method | Path | Description |
|---|---|---|
| GET | `/api/batches/:batchId/readings` | All sensor readings for a batch |
| GET | `/api/batches/:batchId/graphs` | Graph-ready arrays (temperature, color, mq135) |
| GET | `/api/batches/:batchId/summary` | GLP and price summary for a batch |
| PUT | `/api/batches/:batchId/glp` | Set or update Good Leaf Percentage |
| PUT | `/api/batches/:batchId/price` | Set or update selling price |

### Factory

| Method | Path | Description |
|---|---|---|
| GET | `/api/factories/:factoryId/readings` | Recent sensor readings for a factory |
| GET | `/api/factories/:factoryId/batches` | All batches with latest readings + summary |
| GET | `/api/factories/:factoryId/highest-price` | Batch with highest selling price |
| GET | `/api/factories/:factoryId/lowest-price` | Batch with lowest selling price |
| GET | `/api/factories/:factoryId/dashboard` | Full factory dashboard data |

Query params for `/readings`: `?limit=100&startTime=2026-04-01T00:00:00Z&endTime=2026-04-30T00:00:00Z`

### General Manager

| Method | Path | Description |
|---|---|---|
| GET | `/api/general/factories?ids=FAC001,FAC002` | Summary per factory |
| GET | `/api/general/summary?ids=FAC001,FAC002` | Combined analytics across factories |

---

## Sample Request Bodies

### POST /api/sensor — Sensor reading from ESP32

```json
{
  "DEVICE_ID": "DEV001",
  "TIMESTAMP": "2026-04-23T10:20:00Z",
  "FACTORY_ID": "FAC001",
  "BATCH_ID": "BAT001",
  "COLOR": 67.2,
  "TEMPERATURE": 29.8,
  "MQ135": 410
}
```

### PUT /api/batches/BAT001/glp — Set Good Leaf Percentage

```json
{
  "factoryId": "FAC001",
  "glp": 84.5
}
```

### PUT /api/batches/BAT001/price — Set Selling Price

```json
{
  "factoryId": "FAC001",
  "price": 1500
}
```

---

## Response Format

All responses follow this structure:

```json
{
  "success": true,
  "message": "OK",
  "data": { ... }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Missing required fields: TEMPERATURE",
  "data": null
}
```
