import 'dart:math';
import '../models/app_models.dart';

class MockMarket {
  final String id;
  final String name;
  final String city;
  final double lat;
  final double lng;
  final double pricePerQuintal;
  final bool isBuyer;
  final bool? pickup;

  const MockMarket({
    required this.id,
    required this.name,
    required this.city,
    required this.lat,
    required this.lng,
    required this.pricePerQuintal,
    this.isBuyer = false,
    this.pickup,
  });
}

class OptimizerService {
  // Base prices in ₹/quintal
  static const _basePrices = <String, double>{
    'Tomato': 1800.0,
    'Paddy': 2150.0,
    'Chilli': 15000.0,
    'Onion': 2400.0,
    'Maize': 1850.0,
    'Cotton': 6500.0,
    'Groundnut': 5400.0,
    'Turmeric': 12000.0,
    'Potato': 1600.0,
    'Soybean': 3800.0,
  };

  OptimizationResult calculateBest(RecommendationRequest req) {
    // Determine base price based on crop
    double basePrice = _basePrices[req.crop] ?? 2000.0;
    
    // Convert to ₹/kg for calculation
    double basePriceKg = basePrice / 100.0;

    final mockMarkets = [
      MockMarket(id: 'HYD-01', name: 'Bowenpally Wholesale Market', city: 'Hyderabad', lat: 17.4563, lng: 78.4975, pricePerQuintal: basePrice * 1.1),
      MockMarket(id: 'HYD-02', name: 'Gaddiannaram Market', city: 'Hyderabad', lat: 17.3725, lng: 78.5326, pricePerQuintal: basePrice * 1.05),
      MockMarket(id: 'WGL-01', name: 'Enumamula APMC', city: 'Warangal', lat: 17.9784, lng: 79.6021, pricePerQuintal: basePrice * 1.02),
      MockMarket(id: 'VJA-01', name: 'Gollapudi Market', city: 'Vijayawada', lat: 16.5334, lng: 80.5921, pricePerQuintal: basePrice * 1.08),
      MockMarket(id: 'KHM-01', name: 'Khammam APMC', city: 'Khammam', lat: 17.2473, lng: 80.1514, pricePerQuintal: basePrice * 1.03),
      MockMarket(id: 'NLG-01', name: 'Nalgonda Local Mandi', city: 'Nalgonda', lat: 17.0499, lng: 79.2673, pricePerQuintal: basePrice * 0.95),
      MockMarket(id: 'NLG-02', name: 'Miryalaguda APMC', city: 'Nalgonda', lat: 16.8680, lng: 79.5570, pricePerQuintal: basePrice * 0.98),
      MockMarket(id: 'NZB-01', name: 'Nizamabad Market', city: 'Nizamabad', lat: 18.6715, lng: 78.0989, pricePerQuintal: basePrice * 1.0),
      MockMarket(id: 'KNR-01', name: 'Karimnagar Market', city: 'Karimnagar', lat: 18.4386, lng: 79.1288, pricePerQuintal: basePrice * 1.01),
      MockMarket(id: 'MHB-01', name: 'Mahabubnagar Mandi', city: 'Mahabubnagar', lat: 16.7379, lng: 77.9870, pricePerQuintal: basePrice * 0.97),
      MockMarket(id: 'ADD-01', name: 'Adoni Market', city: 'Adoni', lat: 15.6276, lng: 77.2739, pricePerQuintal: basePrice * 1.04),
      MockMarket(id: 'KDP-01', name: 'Kadapa APMC', city: 'Kadapa', lat: 14.4665, lng: 78.8241, pricePerQuintal: basePrice * 1.06),
      MockMarket(id: 'GNT-01', name: 'Guntur Mirchi Yard', city: 'Guntur', lat: 16.3008, lng: 80.4428, pricePerQuintal: basePrice * 1.12),
      MockMarket(id: 'ONG-01', name: 'Ongole Market', city: 'Ongole', lat: 15.5057, lng: 80.0499, pricePerQuintal: basePrice * 1.03),
      // Direct buyers
      MockMarket(id: 'BUY-01', name: 'Deccan Fresh Foods', city: 'Hyderabad', lat: 17.4123, lng: 78.4089, pricePerQuintal: basePrice * 1.15, isBuyer: true, pickup: true),
      MockMarket(id: 'BUY-02', name: 'GreenHarvest Foods', city: 'Warangal', lat: 17.9734, lng: 79.5960, pricePerQuintal: basePrice * 1.07, isBuyer: true, pickup: false),
    ];

    final List<MarketModel> evaluated = [];
    for (final m in mockMarkets) {
      final distanceKm = _haversine(req.latitude, req.longitude, m.lat, m.lng);
      
      final pricePerKg = m.pricePerQuintal / 100.0;
      final saleValue = pricePerKg * req.quantityKg;
      
      // Transport: ₹15/km for own vehicle, ₹25/km for hired. But wait, no hired vehicle.
      // So if hasTransport (own vehicle), cost is distance * 15. 
      // If no transport, cost is 0 (assuming pickup or handled by buyer) but they can't go to APMC easily without vehicle.
      // Let's model it: If no transport, APMC is very expensive (hired vehicle implicit at ₹25/km).
      // Or if buyer has pickup, transport cost is 0.
      double transportCost;
      if (m.isBuyer && m.pickup == true) {
        transportCost = 0.0;
      } else {
        transportCost = req.hasTransport ? distanceKm * 15.0 : distanceKm * 25.0; 
      }
      
      // Time cost: 40km/h average, ₹100/hr value of time
      final timeCost = (distanceKm / 40.0) * 100.0; 
      
      // Risk cost: Spoilage risk (0.1% loss per 10km for perishables)
      final riskCost = saleValue * (0.001 * (distanceKm / 10.0));

      final actualTransportCost = transportCost;

      final netRealization = saleValue - actualTransportCost - timeCost - riskCost;

      evaluated.add(MarketModel(
        id: m.id,
        name: m.name,
        district: m.city,
        city: m.city,
        type: m.isBuyer ? 'Direct Buyer' : 'Market',
        distanceKm: double.parse(distanceKm.toStringAsFixed(1)),
        pricePerKg: double.parse(pricePerKg.toStringAsFixed(2)),
        saleValue: saleValue,
        transportCost: actualTransportCost,
        timeCost: timeCost,
        riskCost: riskCost,
        netRealization: netRealization,
        expectedNetPerKg: netRealization / req.quantityKg,
        travelHours: distanceKm / 40.0,
        pickupProvided: m.isBuyer ? m.pickup : null,
      ));
    }

    // Sort by Net Realization descending
    evaluated.sort((a, b) => b.netRealization.compareTo(a.netRealization));

    final best = evaluated.first;
    final alts = evaluated.skip(1).take(2).toList();
    
    final opportunityGain = alts.isNotEmpty ? best.netRealization - alts.first.netRealization : 0.0;

    return OptimizationResult(
      recommendation: best,
      alternatives: alts,
      search: SearchMeta(candidatesEvaluated: evaluated.length, levelsUsed: 3, stopReason: 'Found best in local radius'),
      explanation: '${best.name} offers the highest net return after deducting transport (₹${best.transportCost.toInt()}) and time costs. You earn ₹${best.netRealization.toInt()} which is higher than nearby alternatives.',
      opportunityGain: opportunityGain,
    );
  }

  double _haversine(double lat1, double lon1, double lat2, double lon2) {
    final dLat = (lat2 - lat1) * pi / 180.0;
    final dLon = (lon2 - lon1) * pi / 180.0;
    final a = sin(dLat / 2) * sin(dLat / 2) +
              cos(lat1 * pi / 180.0) * cos(lat2 * pi / 180.0) *
              sin(dLon / 2) * sin(dLon / 2);
    return max(1.0, 6371 * 2 * atan2(sqrt(a), sqrt(1 - a)));
  }
}

final optimizerService = OptimizerService();
