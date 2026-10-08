import '../models/app_models.dart';
import 'api_service.dart';

final _mockBuyers = [
  BuyerModel(
    id: 'BUY-001', companyName: 'Deccan Fresh Foods', type: 'Food Processor',
    crop: 'Tomato', quantityKg: 5000, offerPrice: 29,
    city: 'Hyderabad', latitude: 17.39, longitude: 78.48,
    pickupProvided: true, requiredBy: '2026-10-15', paymentDays: 3, status: 'Open',
  ),
  BuyerModel(
    id: 'BUY-002', companyName: 'Urban Bowl Kitchens', type: 'Restaurant Group',
    crop: 'Tomato', quantityKg: 2500, offerPrice: 27,
    city: 'Bhongir', latitude: 17.22, longitude: 79.01,
    pickupProvided: false, requiredBy: '2026-10-11', paymentDays: 2, status: 'Open',
  ),
  BuyerModel(
    id: 'BUY-003', companyName: 'Nizam Agro Processing', type: 'Processing Unit',
    crop: 'Tomato', quantityKg: 8000, offerPrice: 25.5,
    city: 'Bhuvanagiri', latitude: 17.56, longitude: 78.67,
    pickupProvided: true, requiredBy: '2026-10-14', paymentDays: 5, status: 'Open',
  ),
];

class BuyerService {
  Future<List<BuyerModel>> getBuyers({String crop = ''}) async {
    try {
      final data = await apiService.get('/buyers/requirements',
          query: crop.isNotEmpty ? {'crop': crop} : null);
      final list = data['requirements'] as List<dynamic>? ?? [];
      return list.map((e) => BuyerModel.fromJson(e as Map<String, dynamic>)).toList();
    } catch (_) {
      return _mockBuyers.where((b) => crop.isEmpty || b.crop == crop).toList();
    }
  }

  Future<void> postBuyer(Map<String, dynamic> body) async {
    await apiService.post('/buyers/requirements', body);
  }
}

final buyerService = BuyerService();
