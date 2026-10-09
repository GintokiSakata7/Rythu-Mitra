import 'package:flutter/foundation.dart';
import '../models/trend_model.dart';
import '../services/trends_service.dart';

class TrendsProvider extends ChangeNotifier {
  List<MarketTrendItem> _items = [];
  TrendSummary? _summary;
  bool _loading = false;
  String _error = '';
  String _selectedCrop = 'Tomato';
  String _selectedMarket = '';
  String _source = '';

  List<MarketTrendItem> get items => _items;
  TrendSummary? get summary => _summary;
  bool get loading => _loading;
  String get error => _error;
  String get selectedCrop => _selectedCrop;
  String get selectedMarket => _selectedMarket;
  String get source => _source;

  Future<void> loadTrends({String? crop, String? market}) async {
    if (crop != null) _selectedCrop = crop;
    if (market != null) _selectedMarket = market;

    _loading = true;
    _error = '';
    notifyListeners();

    try {
      final res = await trendsService.getTrends(
        crop: _selectedCrop,
        market: _selectedMarket,
        limit: 100,
      );

      _items = res.items;
      _summary = res.summary;
      _source = res.source;
    } catch (e) {
      _error = e.toString();
    } finally {
      _loading = false;
      notifyListeners();
    }
  }

  void selectCrop(String crop) {
    if (_selectedCrop == crop) return;
    _selectedCrop = crop;
    loadTrends(crop: crop);
  }

  void selectMarket(String market) {
    if (_selectedMarket == market) return;
    _selectedMarket = market;
    loadTrends(market: market);
  }
}
