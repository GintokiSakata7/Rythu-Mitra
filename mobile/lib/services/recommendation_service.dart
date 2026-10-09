import '../models/app_models.dart';
import 'api_service.dart';
import '../optimizer/optimizer_service.dart';

class RecommendationService {
  Future<OptimizationResult> getRecommendation(RecommendationRequest request) async {
    try {
      final data = await apiService.post('/recommendations', request.toJson());
      return OptimizationResult.fromJson(data);
    } catch (_) {
      return optimizerService.calculateBest(request);
    }
  }
}

final recommendationService = RecommendationService();

