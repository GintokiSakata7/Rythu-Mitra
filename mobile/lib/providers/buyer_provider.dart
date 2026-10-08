import 'package:flutter/foundation.dart';
import '../models/app_models.dart';
import '../services/buyer_service.dart';

class BuyerProvider extends ChangeNotifier {
  List<BuyerModel> _buyers = [];
  bool _loading = false;
  String _error = '';
  String _selectedCrop = 'Tomato';

  List<BuyerModel> get buyers => _buyers;
  bool get loading => _loading;
  String get error => _error;
  String get selectedCrop => _selectedCrop;

  Future<void> loadBuyers({String? crop}) async {
    final c = crop ?? _selectedCrop;
    _selectedCrop = c;
    _loading = true;
    _error = '';
    notifyListeners();

    try {
      _buyers = await buyerService.getBuyers(crop: c);
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
}
