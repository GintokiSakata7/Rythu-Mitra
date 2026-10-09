import 'dart:math';
import 'package:flutter/foundation.dart';
import '../models/app_models.dart';
import '../services/buyer_service.dart';
import '../location/location_service.dart';

class BuyerProvider extends ChangeNotifier {
  List<BuyerModel> _buyers = [];
  bool _loading = false;
  String _error = '';
  String _selectedCrop = '';

  List<BuyerModel> get buyers => _buyers;
  bool get loading => _loading;
  String get error => _error;
  String get selectedCrop => _selectedCrop;
  
  final Map<String, double> _distances = {};

  Future<void> loadBuyers({String? crop}) async {
    final c = crop ?? _selectedCrop;
    _selectedCrop = c;
    _loading = true;
    _error = '';
    notifyListeners();

    try {
      _buyers = await buyerService.getBuyers(crop: c);
      
      // Calculate distances
      final locResult = await locationService.getCurrentLocation();
      if (locResult.result != null) {
        final uLat = locResult.result!.lat;
        final uLng = locResult.result!.lng;
        
        for (final b in _buyers) {
          _distances[b.id] = _haversine(uLat, uLng, b.latitude, b.longitude);
        }
        
        // Sort by distance
        _buyers.sort((a, b) => (_distances[a.id] ?? 9999).compareTo(_distances[b.id] ?? 9999));
      }
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
  
  double getDistance(String buyerId) => _distances[buyerId] ?? -1.0;

  double _haversine(double lat1, double lon1, double lat2, double lon2) {
    final dLat = (lat2 - lat1) * pi / 180.0;
    final dLon = (lon2 - lon1) * pi / 180.0;
    final a = sin(dLat / 2) * sin(dLat / 2) +
              cos(lat1 * pi / 180.0) * cos(lat2 * pi / 180.0) *
              sin(dLon / 2) * sin(dLon / 2);
    return max(1.0, 6371 * 2 * atan2(sqrt(a), sqrt(1 - a)));
  }
}
