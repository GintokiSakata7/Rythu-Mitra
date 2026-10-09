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
  BuyerModel(
    id: 'BUY-004', companyName: 'Sri Lakshmi Traders', type: 'Wholesaler',
    crop: 'Paddy', quantityKg: 20000, offerPrice: 22.5,
    city: 'Miryalaguda', latitude: 16.87, longitude: 79.56,
    pickupProvided: true, requiredBy: '2026-10-20', paymentDays: 7, status: 'Open',
  ),
  BuyerModel(
    id: 'BUY-005', companyName: 'GreenHarvest Foods', type: 'Supermarket Chain',
    crop: 'Onion', quantityKg: 10000, offerPrice: 32,
    city: 'Warangal', latitude: 17.98, longitude: 79.60,
    pickupProvided: false, requiredBy: '2026-10-12', paymentDays: 1, status: 'Open',
  ),
  BuyerModel(
    id: 'BUY-006', companyName: 'Deccan Agro Processors', type: 'Food Processor',
    crop: 'Chilli', quantityKg: 5000, offerPrice: 185,
    city: 'Vijayawada', latitude: 16.50, longitude: 80.64,
    pickupProvided: true, requiredBy: '2026-10-18', paymentDays: 10, status: 'Open',
  ),
  BuyerModel(
    id: 'BUY-007', companyName: 'FreshCrop Buyers', type: 'Wholesaler',
    crop: 'Cotton', quantityKg: 15000, offerPrice: 72,
    city: 'Nizamabad', latitude: 18.67, longitude: 78.10,
    pickupProvided: true, requiredBy: '2026-10-25', paymentDays: 5, status: 'Open',
  ),
  BuyerModel(
    id: 'BUY-008', companyName: 'Kisan Mart', type: 'Retailer',
    crop: 'Potato', quantityKg: 3000, offerPrice: 28,
    city: 'Karimnagar', latitude: 18.43, longitude: 79.12,
    pickupProvided: false, requiredBy: '2026-10-13', paymentDays: 0, status: 'Open',
  ),
];

class BuyerService {
  Future<List<BuyerModel>> getBuyers({String crop = ''}) async {
    try {
      final data = await apiService.get('/buyers/requirements',
          query: crop.isNotEmpty ? {'crop': crop} : null);
      final list = data['requirements'] as List<dynamic>? ?? [];
      if (list.isEmpty) throw Exception('Empty list from live DB');
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

