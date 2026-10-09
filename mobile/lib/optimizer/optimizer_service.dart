import 'dart:math';
import '../models/app_models.dart';
import '../services/buyer_service.dart';

class TelanganaMandiDef {
  final String id;
  final String name;
  final String district;
  final double lat;
  final double lng;

  const TelanganaMandiDef({
    required this.id,
    required this.name,
    required this.district,
    required this.lat,
    required this.lng,
  });
}

class OptimizerService {
  // Official Telangana APMC Market Yards from State Marketing Department DB
  static const List<TelanganaMandiDef> telanganaMandis = [
    TelanganaMandiDef(id: 'TS-3', name: 'Bowenpally Wholesale Market', district: 'Hyderabad', lat: 17.48, lng: 78.46),
    TelanganaMandiDef(id: 'TS-1', name: 'Gaddiannaram Market', district: 'Rangareddy', lat: 17.35, lng: 78.54),
    TelanganaMandiDef(id: 'TS-2', name: 'L.B Nagar Market', district: 'Rangareddy', lat: 17.35, lng: 78.55),
    TelanganaMandiDef(id: 'TS-1571', name: 'Gudimalkapur Market', district: 'Hyderabad', lat: 17.39, lng: 78.45),
    TelanganaMandiDef(id: 'TS-1327', name: 'Badepally Market', district: 'Nagarkurnool', lat: 16.55, lng: 78.07),
    TelanganaMandiDef(id: 'TS-886', name: 'Warangal (Enumamula) Market', district: 'Hanamkonda', lat: 18.00, lng: 79.59),
    TelanganaMandiDef(id: 'TS-1067', name: 'Khammam Market', district: 'Khammam', lat: 17.25, lng: 80.15),
    TelanganaMandiDef(id: 'TS-1080', name: 'Nizamabad Market', district: 'Nizamabad', lat: 18.67, lng: 78.10),
    TelanganaMandiDef(id: 'TS-36', name: 'Jammikunta Market', district: 'Karimnagar', lat: 18.30, lng: 79.21),
    TelanganaMandiDef(id: 'TS-1123', name: 'Choppadandi Market', district: 'Karimnagar', lat: 18.54, lng: 79.17),
    TelanganaMandiDef(id: 'TS-1091', name: 'Suryapet Market', district: 'Suryapet', lat: 17.14, lng: 79.62),
    TelanganaMandiDef(id: 'TS-1106', name: 'V Nagar Market', district: 'Nalgonda', lat: 17.05, lng: 79.27),
    TelanganaMandiDef(id: 'TS-1326', name: 'Mahaboobnagar Market', district: 'Mahbubnagar', lat: 16.74, lng: 77.98),
    TelanganaMandiDef(id: 'TS-1330', name: 'Shadnagar Market', district: 'Rangareddy', lat: 17.06, lng: 78.20),
    TelanganaMandiDef(id: 'TS-1198', name: 'Zaheerabad Market', district: 'Sangareddy', lat: 17.68, lng: 77.60),
    TelanganaMandiDef(id: 'TS-1208', name: 'Jogipet Market', district: 'Sangareddy', lat: 17.72, lng: 77.83),
    TelanganaMandiDef(id: 'TS-1215', name: 'Dubbak Market', district: 'Siddipet', lat: 17.87, lng: 78.12),
    TelanganaMandiDef(id: 'TS-11', name: 'Bhainsa Market', district: 'Nirmal', lat: 19.10, lng: 77.96),
    TelanganaMandiDef(id: 'TS-12', name: 'Boath Market', district: 'Adilabad', lat: 19.44, lng: 78.45),
    TelanganaMandiDef(id: 'TS-26', name: 'Jainath Market', district: 'Adilabad', lat: 19.07, lng: 78.27),
    TelanganaMandiDef(id: 'TS-1125', name: 'Jagtial Market', district: 'Jagtial', lat: 18.79, lng: 78.91),
    TelanganaMandiDef(id: 'TS-1177', name: 'Mahabubabad Market', district: 'Mahabubabad', lat: 17.60, lng: 80.00),
    TelanganaMandiDef(id: 'TS-1168', name: 'Kesamudram Market', district: 'Warangal', lat: 17.80, lng: 79.93),
    TelanganaMandiDef(id: 'TS-1340', name: 'Kalwakurthy Market', district: 'Nagarkurnool', lat: 16.58, lng: 78.39),
    TelanganaMandiDef(id: 'TS-1334', name: 'Nagarkurnool Market', district: 'Nagarkurnool', lat: 16.48, lng: 78.32),
    TelanganaMandiDef(id: 'TS-1342', name: 'Narayanpet Market', district: 'Narayanpet', lat: 16.73, lng: 77.50),
    TelanganaMandiDef(id: 'TS-1328', name: 'Gadwal Market', district: 'Jogulamba Gadwal', lat: 16.23, lng: 77.80),
    TelanganaMandiDef(id: 'TS-1344', name: 'Wanaparthy Market', district: 'Wanaparthy', lat: 16.36, lng: 78.06),
    TelanganaMandiDef(id: 'TS-1352', name: 'Devarakadra Market', district: 'Mahbubnagar', lat: 16.12, lng: 77.58),
    TelanganaMandiDef(id: 'TS-37', name: 'Tandur Market', district: 'Vikarabad', lat: 17.25, lng: 77.58),
    TelanganaMandiDef(id: 'TS-1612', name: 'Vantimamidi Market', district: 'Medchal', lat: 17.54, lng: 78.37),
  ];

  // Official benchmark modal prices (₹/kg) derived from DB (telangana_market_prices)
  static const Map<String, double> dbModalPricesPerKg = {
    'Tomato': 20.0,
    'Paddy': 27.3,
    'Cotton': 83.8,
    'Chilli': 143.3,
    'Green Chillies': 24.9,
    'Onion': 24.5,
    'Maize': 21.8,
    'Groundnut': 57.7,
    'Groundnut pods': 57.7,
    'Turmeric': 130.2,
    'Tumeric': 130.2,
    'Potato': 14.3,
    'Soyabean': 55.6,
    'Soybean': 55.6,
    'Red Gram': 71.0,
    'Bengal Gram': 57.5,
    'Green Gram': 65.2,
    'Wheat': 25.1,
    'Castor': 61.3,
    'Banana': 22.5,
    'Mango': 30.0,
    'Brinjal': 13.7,
    'Cabbage': 12.8,
    'Cauliflower': 22.9,
    'Ladys Finger': 14.2,
    'Bottle Gourd': 10.0,
    'Bitter Gourd': 20.4,
    'Cucumber': 12.0,
    'Ginger': 70.0,
    'Garlic': 110.0,
  };

  static String detectPerishability(String crop) {
    final c = crop.toLowerCase().trim();
    if (c.contains('tomato') || c.contains('tamata') ||
        c.contains('chilli') || c.contains('mirchi') ||
        c.contains('brinjal') || c.contains('vankaya') ||
        c.contains('cabbage') || c.contains('cauliflower') ||
        c.contains('gourd') || c.contains('kakara') ||
        c.contains('beans') || c.contains('bhendi') || c.contains('finger') ||
        c.contains('banana') || c.contains('papaya') || c.contains('mango') ||
        c.contains('cucumber') || c.contains('kheera')) {
      return 'high';
    }
    if (c.contains('onion') || c.contains('ulli') ||
        c.contains('potato') || c.contains('aloo') ||
        c.contains('garlic') || c.contains('vellulli') ||
        c.contains('ginger') || c.contains('allam') ||
        c.contains('carrot') || c.contains('beet')) {
      return 'medium';
    }
    return 'low';
  }

  static double getMaxSafeDistanceKm(String perishability) {
    if (perishability == 'high') return 65.0;
    if (perishability == 'medium') return 120.0;
    return 250.0;
  }

  Future<OptimizationResult> calculateBest(RecommendationRequest req) async {
    final perishability = detectPerishability(req.crop);
    final maxSafeDist = getMaxSafeDistanceKm(perishability);

    // 1. Fetch real buyers from Supabase DB (buyer_requirements table)
    List<BuyerModel> realBuyers = [];
    try {
      realBuyers = await buyerService.getBuyers(crop: req.crop);
    } catch (_) {
      realBuyers = [];
    }

    final double basePricePerKg = dbModalPricesPerKg[req.crop] ?? 22.0;

    final List<MarketModel> evaluated = [];

    // Evaluate Real Telangana Mandis
    for (final m in telanganaMandis) {
      final distanceKm = _haversine(req.latitude, req.longitude, m.lat, m.lng);
      
      // Filter out mandis that drastically exceed search radius for this crop
      if (distanceKm > maxSafeDist * 1.5) continue;

      final econ = _calculateEcon(
        quantityKg: req.quantityKg.toDouble(),
        pricePerKg: basePricePerKg,
        distanceKm: distanceKm,
        hasTransport: req.hasTransport,
        isBuyerPickup: false,
        perishability: perishability,
      );

      evaluated.add(MarketModel(
        id: m.id,
        name: m.name,
        district: m.district,
        city: m.district,
        type: 'Market',
        distanceKm: double.parse(distanceKm.toStringAsFixed(1)),
        pricePerKg: double.parse(basePricePerKg.toStringAsFixed(2)),
        saleValue: econ.saleValue,
        transportCost: econ.transportCost,
        transportRange: econ.transportRange,
        vehicleName: econ.vehicleName,
        timeCost: econ.timeCost,
        riskCost: econ.riskCost,
        spoilageLossPct: econ.spoilageLossPct,
        netRealization: econ.netRealization,
        expectedNetPerKg: econ.netRealization / req.quantityKg,
        travelHours: econ.travelHours,
        pickupProvided: false,
        latitude: m.lat,
        longitude: m.lng,
        feasibility: econ.feasibility,
        transitWarning: econ.transitWarning,
      ));
    }

    // Evaluate Real Registered Buyers from DB
    for (final b in realBuyers) {
      final distanceKm = _haversine(req.latitude, req.longitude, b.latitude, b.longitude);
      final double targetQty = min(req.quantityKg.toDouble(), b.quantityKg.toDouble());

      // Realistic Farmgate Pickup Gate:
      // Direct buyers only offer free pickup within their local cluster (<= 50 km)
      // OR for large bulk truckloads (>= 5,000 kg).
      final isEligibleForPickup = b.pickupProvided && (distanceKm <= 50.0 || targetQty >= 5000.0);

      final econ = _calculateEcon(
        quantityKg: targetQty,
        pricePerKg: b.offerPrice,
        distanceKm: distanceKm,
        hasTransport: isEligibleForPickup ? false : req.hasTransport,
        isBuyerPickup: isEligibleForPickup,
        perishability: perishability,
      );

      evaluated.add(MarketModel(
        id: b.id,
        name: b.companyName,
        companyName: b.companyName,
        district: b.city,
        city: b.city,
        type: 'Direct Buyer',
        distanceKm: double.parse(distanceKm.toStringAsFixed(1)),
        pricePerKg: double.parse(b.offerPrice.toStringAsFixed(2)),
        saleValue: econ.saleValue,
        transportCost: econ.transportCost,
        transportRange: econ.transportRange,
        vehicleName: isEligibleForPickup ? 'Buyer Farmgate Pickup (Free)' : econ.vehicleName,
        timeCost: econ.timeCost,
        riskCost: econ.riskCost,
        spoilageLossPct: econ.spoilageLossPct,
        netRealization: econ.netRealization,
        expectedNetPerKg: econ.netRealization / targetQty,
        travelHours: econ.travelHours,
        pickupProvided: isEligibleForPickup,
        latitude: b.latitude,
        longitude: b.longitude,
        feasibility: econ.feasibility,
        transitWarning: econ.transitWarning,
      ));
    }

    if (evaluated.isEmpty) {
      // Fallback to closest 3 Telangana mandis
      for (final m in telanganaMandis.take(3)) {
        final distanceKm = _haversine(req.latitude, req.longitude, m.lat, m.lng);
        final econ = _calculateEcon(
          quantityKg: req.quantityKg.toDouble(),
          pricePerKg: basePricePerKg,
          distanceKm: distanceKm,
          hasTransport: req.hasTransport,
          isBuyerPickup: false,
          perishability: perishability,
        );
        evaluated.add(MarketModel(
          id: m.id,
          name: m.name,
          district: m.district,
          city: m.district,
          type: 'Market',
          distanceKm: double.parse(distanceKm.toStringAsFixed(1)),
          pricePerKg: double.parse(basePricePerKg.toStringAsFixed(2)),
          saleValue: econ.saleValue,
          transportCost: econ.transportCost,
          transportRange: econ.transportRange,
          timeCost: econ.timeCost,
          riskCost: econ.riskCost,
          netRealization: econ.netRealization,
          expectedNetPerKg: econ.netRealization / req.quantityKg,
          travelHours: econ.travelHours,
          pickupProvided: false,
          latitude: m.lat,
          longitude: m.lng,
          feasibility: econ.feasibility,
          transitWarning: econ.transitWarning,
        ));
      }
    }

    // Sort by realistic score: prioritize safe transit & highest net realization
    evaluated.sort((a, b) {
      final scoreA = _calcScore(a, maxSafeDist);
      final scoreB = _calcScore(b, maxSafeDist);
      return scoreB.compareTo(scoreA);
    });

    final best = evaluated.first;
    final alts = evaluated.skip(1).take(4).toList();
    final opportunityGain = alts.isNotEmpty ? max(0.0, best.netRealization - alts.first.netRealization) : 0.0;

    final explanation = best.type == 'Direct Buyer' && best.pickupProvided == true
        ? '${best.name} offers ₹${best.pricePerKg.toStringAsFixed(0)}/kg with free farmgate pickup within safe local distance (${best.distanceKm.toStringAsFixed(0)} km). Net return: ₹${best.netRealization.toStringAsFixed(0)}.'
        : '${best.name} in ${best.district} offers the highest net return of ₹${best.netRealization.toStringAsFixed(0)} after realistic transport and transit risk for ${req.crop}.';

    return OptimizationResult(
      recommendation: best,
      alternatives: alts,
      search: SearchMeta(
        candidatesEvaluated: evaluated.length,
        levelsUsed: 1,
        stopReason: 'Optimized using real Telangana market & buyer database with crop transit safety thresholds.',
      ),
      explanation: explanation,
      opportunityGain: opportunityGain,
    );
  }

  double _calcScore(MarketModel m, double maxSafeDist) {
    double score = m.netRealization;
    if (m.feasibility == 'excessive_distance' || m.distanceKm > maxSafeDist * 1.5) {
      score *= 0.25;
    } else if (m.feasibility == 'transit_risk' || m.distanceKm > maxSafeDist) {
      score *= 0.70;
    }
    return score;
  }

  _EconResult _calculateEcon({
    required double quantityKg,
    required double pricePerKg,
    required double distanceKm,
    required bool hasTransport,
    required bool isBuyerPickup,
    required String perishability,
  }) {
    final qty = max(quantityKg, 1.0);
    final dist = max(distanceKm, 0.0);
    final roundTripKm = dist * 2;
    final travelHours = double.parse((dist / 38.0).toStringAsFixed(1));

    double transportCost = 0.0;
    String transportRange = '₹0';
    String vehicleName = 'Tata Ace / Bolero';

    if (isBuyerPickup) {
      transportCost = 0.0;
      transportRange = '₹0 (Free Farm Pickup)';
      vehicleName = 'Buyer Farmgate Pickup (Free)';
    } else if (hasTransport) {
      // Farmer own vehicle: fuel only (~₹14/km)
      transportCost = roundTripKm * 14.0;
      transportRange = '₹${(transportCost * 0.9).toInt()} – ₹${(transportCost * 1.1).toInt()}';
      vehicleName = 'Own Vehicle';
    } else {
      // Commercial hire (~₹30/km round trip + ₹700 base)
      transportCost = 700.0 + (roundTripKm * 28.0);
      transportRange = '₹${(transportCost * 0.95).toInt()} – ₹${(transportCost * 1.15).toInt()}';
      vehicleName = 'Hired Pickup / Auto';
    }

    final timeCost = travelHours * 80.0; // ₹80/hr opportunity cost

    // Realistic non-linear spoilage loss
    double spoilageLossPct = 0.0;
    String feasibility = 'safe';
    String? transitWarning;

    if (perishability == 'high') {
      if (dist <= 35.0) {
        spoilageLossPct = 0.015;
      } else if (dist <= 65.0) {
        spoilageLossPct = 0.015 + ((dist - 35.0) / 30.0) * 0.05;
      } else if (dist <= 100.0) {
        spoilageLossPct = 0.065 + ((dist - 65.0) / 35.0) * 0.155;
        feasibility = 'transit_risk';
        transitWarning = 'Transit distance (${dist.toStringAsFixed(0)} km / ~$travelHours hrs) exceeds safe limits for fresh produce.';
      } else {
        spoilageLossPct = min(0.22 + ((dist - 100.0) / 100.0) * 0.35, 0.60);
        feasibility = 'excessive_distance';
        transitWarning = 'Excessive distance (${dist.toStringAsFixed(0)} km / ~$travelHours hrs). Fresh produce will suffer severe heat spoilage.';
      }
    } else if (perishability == 'medium') {
      if (dist <= 60.0) {
        spoilageLossPct = 0.01;
      } else if (dist <= 120.0) {
        spoilageLossPct = 0.01 + ((dist - 60.0) / 60.0) * 0.05;
      } else {
        spoilageLossPct = min(0.06 + ((dist - 120.0) / 100.0) * 0.12, 0.25);
        feasibility = 'transit_risk';
        transitWarning = 'Transit distance (${dist.toStringAsFixed(0)} km / ~$travelHours hrs) may cause moisture loss and sprouting.';
      }
    } else {
      // Low perishability: grains, cotton, oilseeds
      spoilageLossPct = min(0.005 + (dist / 250.0) * 0.01, 0.02);
    }

    final saleValue = qty * pricePerKg;
    final riskCost = saleValue * spoilageLossPct;
    final netRealization = saleValue - transportCost - timeCost - riskCost;

    return _EconResult(
      saleValue: saleValue,
      transportCost: transportCost,
      transportRange: transportRange,
      vehicleName: vehicleName,
      timeCost: timeCost,
      riskCost: riskCost,
      spoilageLossPct: double.parse(spoilageLossPct.toStringAsFixed(3)),
      travelHours: travelHours,
      netRealization: netRealization,
      feasibility: feasibility,
      transitWarning: transitWarning,
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

class _EconResult {
  final double saleValue;
  final double transportCost;
  final String transportRange;
  final String vehicleName;
  final double timeCost;
  final double riskCost;
  final double spoilageLossPct;
  final double travelHours;
  final double netRealization;
  final String feasibility;
  final String? transitWarning;

  _EconResult({
    required this.saleValue,
    required this.transportCost,
    required this.transportRange,
    required this.vehicleName,
    required this.timeCost,
    required this.riskCost,
    required this.spoilageLossPct,
    required this.travelHours,
    required this.netRealization,
    required this.feasibility,
    this.transitWarning,
  });
}

final optimizerService = OptimizerService();
