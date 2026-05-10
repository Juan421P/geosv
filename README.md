<div align="center">

# GeoSV API

### Reverse Geocoding API for El Salvador

</div>

---

## What is this?

This is a specialized API for reverse geocoding in El Salvador. It helps turn coordinates (latitude and longitude) into actual, readable addresses.

The project follows the country's specific administrative hierarchy, including departments, municipalities, districts, subdistricts, settlements, and street segments.

---

## Why does this exist?

Getting clean geographic data for El Salvador can be tricky. This project was built to organize that data into a usable structure for developers needing to verify addresses or find locations within the country’s boundaries.

---

## Where does the data come from?

All geographic data was obtained from OpenStreetMap (OSM).

Because OSM data is crowdsourced, it can sometimes have inaccurate shapes.

This backend includes custom scripts to repair those shapes (closing loops, fixing topology) to ensure compatibility with database spatial indexes, this means some borders might not reflect the actual boundaries. This is mostly a problem with the specified settlements (Colonias, Urbanizaciones, Barrios), it was not a problem with departments or municipalities.

---

## What does this API do?

### Reverse Geocoding
Converts a point into a full address string.

### Administrative Hierarchy
Supports the latest territorial divisions (Departments → Municipalities → Districts).

### Street Matching
Finds the nearest road segment to any given point.

### Spatial Accuracy
Uses MongoDB 2dsphere indexing for fast, accurate `$geoIntersects` and `$near` queries.

---

## Tech stack

| Technology | Usage |
|---|---|
| Node.js | Runtime |
| Express | Framework |
| MongoDB (Mongoose) | Database |
| Turf.js | Geometry repair and processing |

---

## Setup

### Clone the repo

```bash
git clone <repository-url>
```

### Move to the backend/ directory
```bash
cd backend
```

### Install dependencies
```bash
npm i
```

### Set up a .env file
```bash
MONGODB_URI=your_mongodb_uri
```

### Run the seeders to populate the DB
```bash
node seeders/seeder.js
```

### Start the API
```bash
npm run dev
```
