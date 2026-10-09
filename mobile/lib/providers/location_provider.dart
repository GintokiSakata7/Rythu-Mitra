import 'dart:math';
import 'package:flutter/foundation.dart';
import '../location/location_service.dart';
import '../services/api_service.dart';

class NearbyMarketItem {
  final String id;
  final String name;
  final String district;
  final double distanceKm;
  final double pricePerKg;
  final double latitude;
  final double longitude;

  const NearbyMarketItem({
    required this.id,
    required this.name,
    required this.district,
    required this.distanceKm,
    required this.pricePerKg,
    required this.latitude,
    required this.longitude,
  });
}

class CropPriceSummary {
  final String crop;
  final String emoji;
  final String priceRange;
  final String trend;
  final double avgPriceKg;

  const CropPriceSummary({
    required this.crop,
    required this.emoji,
    required this.priceRange,
    required this.trend,
    required this.avgPriceKg,
  });
}

class LocationProvider extends ChangeNotifier {
  LocationResult? _currentLocation;
  bool _isLoadingLocation = false;
  bool _isLoadingMarkets = false;
  String? _errorMessage;

  List<NearbyMarketItem> _nearbyMarkets = [];
  List<CropPriceSummary> _cropPrices = [
    const CropPriceSummary(crop: 'Tomato', emoji: '🍅', priceRange: '₹18-24/kg', trend: '+5%', avgPriceKg: 22),
    const CropPriceSummary(crop: 'Onion', emoji: '🧅', priceRange: '₹22-30/kg', trend: '+3%', avgPriceKg: 26),
    const CropPriceSummary(crop: 'Chilli', emoji: '🌶️', priceRange: '₹120-150/kg', trend: '+8%', avgPriceKg: 135),
    const CropPriceSummary(crop: 'Cotton', emoji: '🌾', priceRange: '₹68-75/kg', trend: '+2%', avgPriceKg: 71),
    const CropPriceSummary(crop: 'Paddy', emoji: '🌾', priceRange: '₹21-25/kg', trend: '+1%', avgPriceKg: 23),
  ];

  LocationResult? get currentLocation => _currentLocation;
  bool get isLoadingLocation => _isLoadingLocation;
  bool get isLoadingMarkets => _isLoadingMarkets;
  String? get errorMessage => _errorMessage;
  List<NearbyMarketItem> get nearbyMarkets => _nearbyMarkets;
  List<CropPriceSummary> get cropPrices => _cropPrices;

  double get latitude => _currentLocation?.lat ?? 17.3850;
  double get longitude => _currentLocation?.lng ?? 78.4867;
  String get displayName => _currentLocation?.displayName ?? 'Hyderabad, Telangana';
  bool get hasLocation => _currentLocation != null;

  LocationProvider() {
    // Automatically detect location upon provider initialization
    fetchCurrentLocation();
  }

  Future<void> fetchCurrentLocation({bool force = false}) async {
    if (_isLoadingLocation) return;
    if (_currentLocation != null && !force) return;

    _isLoadingLocation = true;
    _errorMessage = null;
    notifyListeners();

    try {
      final loc = await locationService.getCurrentLocation();
      if (loc.result != null) {
        _currentLocation = loc.result;
        _errorMessage = null;
        print('[LOCATION] Successfully acquired user GPS: ${_currentLocation!.displayName} (${_currentLocation!.lat}, ${_currentLocation!.lng})');
        await fetchNearbyData(_currentLocation!.lat, _currentLocation!.lng);
      } else if (loc.error != null) {
        _errorMessage = loc.error!.message;
        print('[LOCATION] [WARN] GPS acquisition issue: $_errorMessage. Using fallback default location.');
        // Still load nearby markets using default fallback coordinates
        await fetchNearbyData(latitude, longitude);
      }
    } catch (e) {
      _errorMessage = e.toString();
      print('[LOCATION] [ERROR] Location fetch exception: $e');
      await fetchNearbyData(latitude, longitude);
    } finally {
      _isLoadingLocation = false;
      notifyListeners();
    }
  }

  void setManualLocation(String name, double lat, double lng) {
    _currentLocation = LocationResult(
      lat: lat,
      lng: lng,
      displayName: name,
    );
    _errorMessage = null;
    notifyListeners();
    fetchNearbyData(lat, lng);
  }

  Future<void> fetchNearbyData(double lat, double lng) async {
    _isLoadingMarkets = true;
    notifyListeners();

    try {
      final res = await apiService.get(
        '/markets/candidates',
        query: {
          'lat': lat.toString(),
          'lng': lng.toString(),
          'crop': 'Tomato',
          'count': '6',
        },
      );

      final list = (res['markets'] as List<dynamic>? ?? []);
      if (list.isNotEmpty) {
        _nearbyMarkets = list.map((m) {
          final dist = (m['distanceKm'] as num?)?.toDouble() ?? _calcDistance(lat, lng, (m['latitude'] as num).toDouble(), (m['longitude'] as num).toDouble());
          final price = (m['modalPrice'] as num?)?.toDouble() ?? 20.0;
          return NearbyMarketItem(
            id: m['id']?.toString() ?? '',
            name: m['name']?.toString() ?? 'Mandi',
            district: m['district']?.toString() ?? m['state']?.toString() ?? 'Telangana',
            distanceKm: dist,
            pricePerKg: price,
            latitude: (m['latitude'] as num?)?.toDouble() ?? lat,
            longitude: (m['longitude'] as num?)?.toDouble() ?? lng,
          );
        }).toList();
        print('[LOCATION] Loaded ${_nearbyMarkets.length} nearby candidate markets from backend.');
      } else {
        _loadFallbackNearbyMarkets(lat, lng);
      }
    } catch (e) {
      print('[LOCATION] [FALLBACK] Failed to fetch nearby markets from backend ($e). Using offline fallback.');
      _loadFallbackNearbyMarkets(lat, lng);
    } finally {
      _isLoadingMarkets = false;
      notifyListeners();
    }
  }

  void _loadFallbackNearbyMarkets(double userLat, double userLng) {
    final offline = [
      {'name': 'Bowenpally Wholesale Market', 'dist': 'Hyderabad', 'lat': 17.4563, 'lng': 78.4975, 'price': 22.0},
      {'name': 'Gaddiannaram Market', 'dist': 'Hyderabad', 'lat': 17.3725, 'lng': 78.5326, 'price': 20.0},
      {'name': 'Madannapeta Market', 'dist': 'Hyderabad', 'lat': 17.3700, 'lng': 78.4800, 'price': 21.0},
      {'name': 'Gudumalkapur Market', 'dist': 'Hyderabad', 'lat': 17.3900, 'lng': 78.4500, 'price': 19.0},
      {'name': 'Enumamula APMC', 'dist': 'Warangal', 'lat': 17.9784, 'lng': 79.6021, 'price': 23.0},
      {'name': 'Nalgonda Local Mandi', 'dist': 'Nalgonda', 'lat': 17.0499, 'lng': 79.2673, 'price': 18.0},
    ];

    final sorted = offline.map((m) {
      final d = _calcDistance(userLat, userLng, m['lat'] as double, m['lng'] as double);
      return NearbyMarketItem(
        id: (m['name'] as String).replaceAll(' ', '-'),
        name: m['name'] as String,
        district: m['dist'] as String,
        distanceKm: d,
        pricePerKg: m['price'] as double,
        latitude: m['lat'] as double,
        longitude: m['lng'] as double,
      );
    }).toList();

    sorted.sort((a, b) => a.distanceKm.compareTo(b.distanceKm));
    _nearbyMarkets = sorted.take(5).toList();
  }

  double _calcDistance(double lat1, double lon1, double lat2, double lon2) {
    const R = 6371.0;
    final dLat = (lat2 - lat1) * (pi / 180.0);
    final dLon = (lon2 - lon1) * (pi / 180.0);
    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(lat1 * (pi / 180.0)) * cos(lat2 * (pi / 180.0)) *
        sin(dLon / 2) * sin(dLon / 2);
    final c = 2 * atan2(sqrt(a), sqrt(1 - a));
    return R * c;
  }
}
