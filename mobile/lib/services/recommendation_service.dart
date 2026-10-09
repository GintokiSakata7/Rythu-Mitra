import '../models/app_models.dart';
import 'api_service.dart';
import '../optimizer/optimizer_service.dart';

class RecommendationService {
  Future<OptimizationResult> getRecommendation(RecommendationRequest request) async {
    try {
      print('[ENGINE] Requesting optimization for crop=${request.crop}, qty=${request.quantityKg}kg, lat=${request.latitude}, lng=${request.longitude}...');
      final data = await apiService.post('/recommendations', request.toJson());
      print('[ENGINE] [SUCCESS] Optimization result received from backend!');
      return OptimizationResult.fromJson(data);
    } catch (e) {
      print('[ENGINE] [FALLBACK] Backend unreachable or error ($e). Executing local offline heuristic engine...');
      final result = optimizerService.calculateBest(request);
      print('[ENGINE] [FALLBACK] Local engine calculated ${result.alternatives.length + 1} market options successfully.');
      return result;
    }
  }
}

final recommendationService = RecommendationService();

