import '../models/app_models.dart';
import 'api_service.dart';

class BuyerService {
  Future<List<BuyerModel>> getBuyers({String crop = ''}) async {
    final data = await apiService.get(
      '/buyers/requirements',
      query: crop.isNotEmpty ? {'crop': crop} : null,
    );
    final list = data['requirements'] as List<dynamic>? ?? [];
    return list.map((e) => BuyerModel.fromJson(e as Map<String, dynamic>)).toList();
  }

  Future<void> postBuyer(Map<String, dynamic> body) async {
    await apiService.post('/buyers/requirements', body);
  }
}

final buyerService = BuyerService();

