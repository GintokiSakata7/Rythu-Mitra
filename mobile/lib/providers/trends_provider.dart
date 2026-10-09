import 'dart:async';
import 'package:flutter/foundation.dart';
import '../models/trend_model.dart';
import '../services/trends_service.dart';

class TrendsProvider extends ChangeNotifier {
  List<MarketTrendItem> _items = [];
  TrendSummary? _summary;
  bool _loading = false;
  String _error = '';
  String _selectedCrop = '';
  String _selectedMarket = '';
  String _userLocalMarket = '';
  bool _isLocalFilterActive = true;
  String _source = '';
  Timer? _debounceTimer;

  List<MarketTrendItem> get items => _items;
  TrendSummary? get summary => _summary;
  bool get loading => _loading;
  String get error => _error;
  String get selectedCrop => _selectedCrop;
  String get selectedMarket => _selectedMarket;
  String get userLocalMarket => _userLocalMarket;
  bool get isLocalFilterActive => _isLocalFilterActive;
  String get source => _source;

  static String normalizeCropName(String raw) {
    final lower = raw.trim().toLowerCase();
    if (lower.isEmpty) return '';
    if (lower.contains('vari') || lower.contains('vadlu') || lower.contains('biyyam') || lower.contains('dhan')) {
      return 'Paddy';
    }
    if (lower.contains('palli') || lower.contains('verusanaga') || lower.contains('groundnut') || lower.contains('mungfali')) {
      return 'Groundnut';
    }
    if (lower.contains('mirchi') || lower.contains('chilli') || lower.contains('chillies') || lower.contains('mirpakaya')) {
      return 'Chilli';
    }
    if (lower.contains('patti') || lower.contains('kapas') || lower.contains('cotton')) {
      return 'Cotton';
    }
    if (lower.contains('tamata') || lower.contains('tamatar') || lower.contains('tomato')) {
      return 'Tomato';
    }
    if (lower.contains('makka') || lower.contains('jonna') || lower.contains('maize') || lower.contains('bhutta')) {
      return 'Maize';
    }
    if (lower.contains('ulli') || lower.contains('pyaz') || lower.contains('onion') || lower.contains('vulligadda')) {
      return 'Onion';
    }
    if (lower.contains('allam') || lower.contains('ginger') || lower.contains('adrak')) {
      return 'Ginger';
    }
    if (lower.contains('pasupu') || lower.contains('turmeric') || lower.contains('haldi')) {
      return 'Turmeric';
    }
    if (lower.contains('senaga') || lower.contains('chana') || lower.contains('bengal gram')) {
      return 'Bengal Gram';
    }
    if (lower.contains('kandulu') || lower.contains('arhar') || lower.contains('toor') || lower.contains('red gram')) {
      return 'Red Gram';
    }
    return raw.trim();
  }

  Future<void> initLocationTrends(String localMarket) async {
    _userLocalMarket = localMarket.trim();
    _isLocalFilterActive = _userLocalMarket.isNotEmpty;
    _selectedMarket = _isLocalFilterActive ? _userLocalMarket : '';
    _selectedCrop = '';
    await loadTrends(market: _selectedMarket, crop: '');
    // If local query returned no results, fall back to statewide mandis
    if (_items.isEmpty && _isLocalFilterActive) {
      _isLocalFilterActive = false;
      _selectedMarket = '';
      await loadTrends(market: '', crop: '');
    }
  }

  void toggleLocationFilter(bool useLocal) {
    _isLocalFilterActive = useLocal;
    _selectedMarket = useLocal ? _userLocalMarket : '';
    loadTrends(market: _selectedMarket, crop: _selectedCrop);
  }

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
        limit: 120,
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

  void searchCrop(String query) {
    _debounceTimer?.cancel();
    _debounceTimer = Timer(const Duration(milliseconds: 350), () {
      final normalized = normalizeCropName(query);
      _selectedCrop = normalized;
      loadTrends(crop: normalized);
    });
  }

  void selectCrop(String crop) {
    _debounceTimer?.cancel();
    final normalized = normalizeCropName(crop);
    if (_selectedCrop.toLowerCase() == normalized.toLowerCase()) {
      _selectedCrop = '';
    } else {
      _selectedCrop = normalized;
    }
    loadTrends(crop: _selectedCrop);
  }

  void selectMarket(String market) {
    _selectedMarket = market;
    _isLocalFilterActive = (_userLocalMarket.isNotEmpty && market.toLowerCase() == _userLocalMarket.toLowerCase());
    loadTrends(market: market);
  }

  void clearAllFilters() {
    _debounceTimer?.cancel();
    _selectedCrop = '';
    _selectedMarket = '';
    _isLocalFilterActive = false;
    loadTrends(crop: '', market: '');
  }

  @override
  void dispose() {
    _debounceTimer?.cancel();
    super.dispose();
  }
}
