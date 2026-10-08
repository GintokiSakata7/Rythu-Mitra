class AppConstants {
  // Crops
  static const List<Map<String, String>> crops = [
    {'id': 'Tomato', 'emoji': '🍅', 'en': 'Tomato', 'te': 'టమాట', 'hi': 'टमाटर'},
    {'id': 'Onion', 'emoji': '🧅', 'en': 'Onion', 'te': 'ఉల్లిపాయ', 'hi': 'प्याज'},
    {'id': 'Potato', 'emoji': '🥔', 'en': 'Potato', 'te': 'బంగాళాదుంప', 'hi': 'आलू'},
    {'id': 'Chilli', 'emoji': '🌶️', 'en': 'Chilli', 'te': 'మిరప', 'hi': 'मिर्च'},
    {'id': 'Cotton', 'emoji': '🌾', 'en': 'Cotton', 'te': 'పత్తి', 'hi': 'कपास'},
  ];

  // Preset locations (matching backend demo data)
  static const List<Map<String, dynamic>> presetLocations = [
    {'name': 'Nalgonda', 'lat': 17.05, 'lng': 79.27},
    {'name': 'Miryalaguda', 'lat': 16.87, 'lng': 79.56},
    {'name': 'Suryapet', 'lat': 17.14, 'lng': 79.62},
    {'name': 'Hyderabad', 'lat': 17.385, 'lng': 78.4867},
  ];

  // Quantity presets in kg
  static const List<int> quantityPresets = [1000, 2500, 5000, 10000];

  // Search radius levels (matches server config)
  static const List<int> searchRadiiKm = [45, 90, 180];

  // Perishability options
  static const List<String> perishabilityOptions = ['high', 'medium', 'low'];

  // Grade options
  static const List<String> gradeOptions = ['A', 'B+', 'B'];

  // SharedPrefs keys
  static const String prefKeyLanguage = 'selected_language';
  static const String prefKeyRecentSearches = 'recent_searches';
  static const String prefKeyMyDemands = 'my_demands';
}
