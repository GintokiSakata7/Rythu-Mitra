# API quick reference

## POST /api/recommendations

Body:

```json
{
  "crop": "Tomato",
  "quantityKg": 5000,
  "latitude": 17.05,
  "longitude": 79.27,
  "locationText": "Nalgonda",
  "quality": "A",
  "hasTransport": false,
  "perishability": "high",
  "includeBuyers": true
}
```

Response includes `recommendation`, `alternatives`, `search.trace`, `search.apiLikeCalls`, `search.stopReason`, and `explanation`.

## POST /api/ai/parse-harvest

Body: `{ "text": "I have 5 tonnes of tomatoes near Nalgonda" }`

Returns structured intent.
