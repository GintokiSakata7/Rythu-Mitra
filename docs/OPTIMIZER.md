# MandiRoute Optimizer

The optimizer is intentionally deterministic and inspectable.

## Search ladder

- Level 1: nearest 5 markets within 45 km
- Level 2: nearest 10 markets within 90 km
- Level 3: nearest 15 markets within 180 km

The ladder is configurable through environment variables.

## Economics

For a market or buyer:

`Net = quantity × price - transport - time - risk`

Transport is lower when the buyer provides pickup or the farmer has transport. Time uses a configurable value-per-hour. Risk is a prototype coefficient intended to represent perishability and uncertainty over longer travel distances.

## Pruning

The engine estimates a break-even price for a farther candidate. If the current price envelope cannot justify that additional journey, the search stops.

This keeps the candidate set small and makes the recommendation explainable.
