import '../models/app_models.dart';
import 'api_service.dart';

class RecommendationService {
  Future<OptimizationResult> getRecommendation(RecommendationRequest request) async {
    final data = await apiService.post('/recommendations', request.toJson());
    return OptimizationResult.fromJson(data);
  }
}

final recommendationService = RecommendationService();

