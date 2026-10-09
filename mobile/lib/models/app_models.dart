// ─── Models ──────────────────────────────────────────────────────────────────

class MarketModel {
  final String id;
  final String name;
  final String? district;
  final String? city;
  final String type; // 'Market' or 'Direct Buyer'
  final double distanceKm;
  final double pricePerKg;
  final double saleValue;
  final double transportCost;
  final double? transportCostMin;
  final double? transportCostMax;
  final String? transportRange;
  final String? vehicleName;
  final String? vehicleNameTe;
  final String? vehicleNameHi;
  final double timeCost;
  final double riskCost;
  final double netRealization;
  final double? netRealizationMin;
  final double? netRealizationMax;
  final String? netRange;
  final double expectedNetPerKg;
  final String? expectedNetPerKgRange;
  final double travelHours;
  final bool? pickupProvided;
  final String? companyName;
  final double? latitude;
  final double? longitude;

  MarketModel({
    required this.id,
    required this.name,
    this.district,
    this.city,
    required this.type,
    required this.distanceKm,
    required this.pricePerKg,
    required this.saleValue,
    required this.transportCost,
    this.transportCostMin,
    this.transportCostMax,
    this.transportRange,
    this.vehicleName,
    this.vehicleNameTe,
    this.vehicleNameHi,
    required this.timeCost,
    required this.riskCost,
    required this.netRealization,
    this.netRealizationMin,
    this.netRealizationMax,
    this.netRange,
    required this.expectedNetPerKg,
    this.expectedNetPerKgRange,
    required this.travelHours,
    this.pickupProvided,
    this.companyName,
    this.latitude,
    this.longitude,
  });

  String get displayName => companyName ?? name;
  String get displayLocation => city ?? district ?? '';

  String localizedVehicleName(String lang) {
    if (lang == 'te' && vehicleNameTe != null && vehicleNameTe!.isNotEmpty) {
      return vehicleNameTe!;
    }
    if (lang == 'hi' && vehicleNameHi != null && vehicleNameHi!.isNotEmpty) {
      return vehicleNameHi!;
    }
    return vehicleName ?? (pickupProvided == true ? 'Free Farmgate Pickup' : 'Transport');
  }

  static MarketModel fromJson(Map<String, dynamic> json) {
    return MarketModel(
      id: json['id']?.toString() ?? '',
      name: json['name']?.toString() ?? '',
      district: json['district']?.toString(),
      city: json['city']?.toString(),
      type: json['type']?.toString() ?? 'Market',
      distanceKm: (json['distanceKm'] ?? 0).toDouble(),
      pricePerKg: (json['pricePerKg'] ?? 0).toDouble(),
      saleValue: (json['saleValue'] ?? 0).toDouble(),
      transportCost: (json['transportCost'] ?? 0).toDouble(),
      transportCostMin: (json['transportCostMin'] as num?)?.toDouble(),
      transportCostMax: (json['transportCostMax'] as num?)?.toDouble(),
      transportRange: json['transportRange']?.toString(),
      vehicleName: json['vehicleName']?.toString(),
      vehicleNameTe: json['vehicleNameTe']?.toString(),
      vehicleNameHi: json['vehicleNameHi']?.toString(),
      timeCost: (json['timeCost'] ?? 0).toDouble(),
      riskCost: (json['riskCost'] ?? 0).toDouble(),
      netRealization: (json['netRealization'] ?? 0).toDouble(),
      netRealizationMin: (json['netRealizationMin'] as num?)?.toDouble(),
      netRealizationMax: (json['netRealizationMax'] as num?)?.toDouble(),
      netRange: json['netRange']?.toString(),
      expectedNetPerKg: (json['expectedNetPerKg'] ?? 0).toDouble(),
      expectedNetPerKgRange: json['expectedNetPerKgRange']?.toString(),
      travelHours: (json['travelHours'] ?? 0).toDouble(),
      pickupProvided: json['pickupProvided'] as bool?,
      companyName: json['companyName']?.toString(),
      latitude: json['latitude'] != null ? (json['latitude'] as num).toDouble() : null,
      longitude: json['longitude'] != null ? (json['longitude'] as num).toDouble() : null,
    );
  }
}

class BuyerModel {
  final String id;
  final String companyName;
  final String type;
  final String crop;
  final int quantityKg;
  final double offerPrice;
  final String city;
  final double latitude;
  final double longitude;
  final bool pickupProvided;
  final String requiredBy;
  final int paymentDays;
  final String status;
  final String grade;
  final bool isVerified;
  final String? verificationId;
  final String? gstin;
  final String? fssai;
  final int trustScore;
  final String? phone;

  BuyerModel({
    required this.id,
    required this.companyName,
    required this.type,
    required this.crop,
    required this.quantityKg,
    required this.offerPrice,
    required this.city,
    required this.latitude,
    required this.longitude,
    required this.pickupProvided,
    required this.requiredBy,
    required this.paymentDays,
    required this.status,
    this.grade = 'A',
    this.isVerified = true,
    this.verificationId,
    this.gstin,
    this.fssai,
    this.trustScore = 98,
    this.phone,
  });

  static BuyerModel fromJson(Map<String, dynamic> json) {
    return BuyerModel(
      id: json['id']?.toString() ?? '',
      companyName: (json['companyName'] ?? json['company_name'])?.toString() ?? 'Direct Buyer',
      type: (json['type'])?.toString() ?? 'Agri Buyer',
      crop: (json['crop'])?.toString() ?? '',
      quantityKg: _parseInt(json['quantityKg'] ?? json['quantity_kg']),
      offerPrice: _parseDouble(json['offerPrice'] ?? json['offer_price']),
      city: (json['city'] ?? json['location'])?.toString() ?? 'Telangana',
      latitude: _parseDouble(json['latitude'] ?? json['lat'] ?? 17.38),
      longitude: _parseDouble(json['longitude'] ?? json['lng'] ?? 78.48),
      pickupProvided: _parseBool(json['pickupProvided'] ?? json['pickup_provided']),
      requiredBy: (json['requiredBy'] ?? json['required_by'])?.toString() ?? '',
      paymentDays: _parseInt(json['paymentDays'] ?? json['payment_days'] ?? 3),
      status: (json['status'])?.toString() ?? 'Open',
      grade: (json['grade'])?.toString() ?? 'A',
      isVerified: json['isVerified'] == true || json['is_verified'] == true || true,
      verificationId: (json['verificationId'] ?? json['verification_id'])?.toString(),
      gstin: (json['gstin'])?.toString(),
      fssai: (json['fssai'])?.toString(),
      trustScore: _parseInt(json['trustScore'] ?? json['trust_score'] ?? 98),
      phone: (json['phone'] ?? json['contact_phone'])?.toString(),
    );
  }

  static int _parseInt(dynamic val) {
    if (val == null) return 0;
    if (val is int) return val;
    if (val is num) return val.toInt();
    return int.tryParse(val.toString()) ?? 0;
  }

  static double _parseDouble(dynamic val) {
    if (val == null) return 0.0;
    if (val is double) return val;
    if (val is num) return val.toDouble();
    return double.tryParse(val.toString()) ?? 0.0;
  }

  static bool _parseBool(dynamic val) {
    if (val == null) return false;
    if (val is bool) return val;
    final str = val.toString().toLowerCase();
    return str == 'true' || str == '1' || str == 't';
  }

  Map<String, dynamic> toJson() => {
    'id': id,
    'companyName': companyName,
    'type': type,
    'crop': crop,
    'quantityKg': quantityKg,
    'offerPrice': offerPrice,
    'city': city,
    'latitude': latitude,
    'longitude': longitude,
    'pickupProvided': pickupProvided,
    'requiredBy': requiredBy,
    'paymentDays': paymentDays,
    'status': status,
    'grade': grade,
    'isVerified': isVerified,
    'verificationId': verificationId,
    'gstin': gstin,
    'fssai': fssai,
    'trustScore': trustScore,
  };
}

class SearchMeta {
  final int candidatesEvaluated;
  final int levelsUsed;
  final String stopReason;

  SearchMeta({
    required this.candidatesEvaluated,
    required this.levelsUsed,
    required this.stopReason,
  });

  static SearchMeta fromJson(Map<String, dynamic> json) {
    return SearchMeta(
      candidatesEvaluated: (json['candidatesEvaluated'] ?? 0).toInt(),
      levelsUsed: (json['levelsUsed'] ?? 1).toInt(),
      stopReason: json['stopReason']?.toString() ?? '',
    );
  }
}

class OptimizationResult {
  final MarketModel recommendation;
  final List<MarketModel> alternatives;
  final SearchMeta search;
  final String explanation;
  final double opportunityGain;

  OptimizationResult({
    required this.recommendation,
    required this.alternatives,
    required this.search,
    required this.explanation,
    required this.opportunityGain,
  });

  static OptimizationResult fromJson(Map<String, dynamic> json) {
    return OptimizationResult(
      recommendation: MarketModel.fromJson(json['recommendation'] as Map<String, dynamic>),
      alternatives: (json['alternatives'] as List<dynamic>? ?? [])
          .map((e) => MarketModel.fromJson(e as Map<String, dynamic>))
          .toList(),
      search: SearchMeta.fromJson(json['search'] as Map<String, dynamic>? ?? {}),
      explanation: json['explanation']?.toString() ?? '',
      opportunityGain: (json['opportunityGain'] ?? 0).toDouble(),
    );
  }
}

class RecommendationRequest {
  final String crop;
  final int quantityKg;
  final double latitude;
  final double longitude;
  final String locationText;
  final String quality;
  final bool hasTransport;
  final String perishability;
  final bool includeBuyers;
  final String language;

  RecommendationRequest({
    required this.crop,
    required this.quantityKg,
    required this.latitude,
    required this.longitude,
    required this.locationText,
    this.quality = 'A',
    this.hasTransport = false,
    this.perishability = 'high',
    this.includeBuyers = true,
    this.language = 'en',
  });

  Map<String, dynamic> toJson() => {
    'crop': crop,
    'quantityKg': quantityKg,
    'latitude': latitude,
    'longitude': longitude,
    'locationText': locationText,
    'quality': quality,
    'hasTransport': hasTransport,
    'perishability': perishability,
    'includeBuyers': includeBuyers,
    'language': language,
  };
}

class DemandModel {
  final String id;
  final String crop;
  final int quantityKg;
  final double expectedPrice;
  final String grade;
  final String harvestDate;
  final String notes;
  final bool canDeliver;
  final String status;

  DemandModel({
    required this.id,
    required this.crop,
    required this.quantityKg,
    required this.expectedPrice,
    required this.grade,
    required this.harvestDate,
    required this.notes,
    required this.canDeliver,
    required this.status,
  });
}

class AppNotification {
  final String id;
  final String title;
  final String message;
  final String time;
  final String iconName;
  final String colorHex;
  bool isRead;

  AppNotification({
    required this.id,
    required this.title,
    required this.message,
    required this.time,
    required this.iconName,
    required this.colorHex,
    this.isRead = false,
  });
}
