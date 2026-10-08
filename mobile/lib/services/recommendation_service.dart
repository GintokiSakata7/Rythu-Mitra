import '../models/app_models.dart';
import 'api_service.dart';
import '../core/config/app_config.dart';

// Fallback mock data when backend is unavailable
final _mockResult = OptimizationResult(
  recommendation: MarketModel(
    id: 'HYD-01',
    name: 'Bowenpally Wholesale Market',
    district: 'Hyderabad',
    type: 'Market',
    distanceKm: 18.4,
    pricePerKg: 26,
    saleValue: 130000,
    transportCost: 1327,
    timeCost: 262,
    riskCost: 461,
    netRealization: 127950,
    expectedNetPerKg: 25.59,
    travelHours: 0.4,
  ),
  alternatives: [
    MarketModel(
      id: 'NLG-01',
      name: 'Nalgonda Local Mandi',
      district: 'Nalgonda',
      type: 'Market',
      distanceKm: 2.1,
      pricePerKg: 22,
      saleValue: 110000,
      transportCost: 151,
      timeCost: 30,
      riskCost: 52,
      netRealization: 109767,
      expectedNetPerKg: 21.95,
      travelHours: 0.05,
    ),
    MarketModel(
      id: 'NLG-02',
      name: 'Miryalaguda APMC',
      district: 'Nalgonda',
      type: 'Market',
      distanceKm: 35.7,
      pricePerKg: 23,
      saleValue: 115000,
      transportCost: 2570,
      timeCost: 510,
      riskCost: 897,
      netRealization: 111023,
      expectedNetPerKg: 22.20,
      travelHours: 0.85,
    ),
  ],
  search: SearchMeta(candidatesEvaluated: 12, levelsUsed: 2, stopReason: 'Mock data fallback'),
  explanation: 'Bowenpally Wholesale Market is recommended because its higher price of ₹26/kg more than compensates for the additional 18.4 km of travel. After deducting transport, time, and spoilage costs, you take home ₹18,183 more than the nearest local market.',
  opportunityGain: 18183,
);

class RecommendationService {
  Future<OptimizationResult> getRecommendation(RecommendationRequest request) async {
    if (!AppConfig.useMockFallback) {
      final data = await apiService.post('/recommendations', request.toJson());
      return OptimizationResult.fromJson(data);
    }

    try {
      final data = await apiService.post('/recommendations', request.toJson());
      return OptimizationResult.fromJson(data);
    } catch (_) {
      // Return mock data on error
      return _mockResult;
    }
  }
}

final recommendationService = RecommendationService();
