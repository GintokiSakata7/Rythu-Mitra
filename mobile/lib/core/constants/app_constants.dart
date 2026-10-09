class AppConstants {
  static const List<Map<String, String>> crops = [
    {'id': 'Tomato', 'emoji': '🍅', 'en': 'Tomato', 'te': 'టమాట', 'hi': 'टमाटर'},
    {'id': 'Paddy', 'emoji': '🌾', 'en': 'Paddy', 'te': 'వరి', 'hi': 'धान'},
    {'id': 'Chilli', 'emoji': '🌶️', 'en': 'Chilli', 'te': 'మిరప', 'hi': 'मिर्च'},
    {'id': 'Onion', 'emoji': '🧅', 'en': 'Onion', 'te': 'ఉల్లిపాయ', 'hi': 'प्याज'},
    {'id': 'Maize', 'emoji': '🌽', 'en': 'Maize', 'te': 'మొక్కజొన్న', 'hi': 'मक्का'},
    {'id': 'Cotton', 'emoji': '☁️', 'en': 'Cotton', 'te': 'పత్తి', 'hi': 'कपास'},
    {'id': 'Groundnut', 'emoji': '🥜', 'en': 'Groundnut', 'te': 'వేరుశనగ', 'hi': 'मूंगफली'},
    {'id': 'Turmeric', 'emoji': '🌿', 'en': 'Turmeric', 'te': 'పసుపు', 'hi': 'हल्दी'},
    {'id': 'Soybean', 'emoji': '🌱', 'en': 'Soybean', 'te': 'సోయాబీన్', 'hi': 'सोयाबीन'},
    {'id': 'Potato', 'emoji': '🥔', 'en': 'Potato', 'te': 'బంగాళాదుంప', 'hi': 'आलू'},
    {'id': 'Brinjal', 'emoji': '🍆', 'en': 'Brinjal', 'te': 'వంకాయ', 'hi': 'बैंगन'},
    {'id': 'Cabbage', 'emoji': '🥬', 'en': 'Cabbage', 'te': 'క్యాబేజీ', 'hi': 'पत्ता गोभी'},
    {'id': 'Cauliflower', 'emoji': '🥦', 'en': 'Cauliflower', 'te': 'కాలీఫ్లవర్', 'hi': 'फूल गोभी'},
    {'id': 'Carrot', 'emoji': '🥕', 'en': 'Carrot', 'te': 'క్యారెట్', 'hi': 'गाजर'},
    {'id': 'Mango', 'emoji': '🥭', 'en': 'Mango', 'te': 'మామిడి', 'hi': 'आम'},
    {'id': 'Banana', 'emoji': '🍌', 'en': 'Banana', 'te': 'అరటి', 'hi': 'केला'},
    {'id': 'Grapes', 'emoji': '🍇', 'en': 'Grapes', 'te': 'ద్రాక్ష', 'hi': 'अंगूर'},
    {'id': 'Wheat', 'emoji': '🌾', 'en': 'Wheat', 'te': 'గోధుమ', 'hi': 'गेहूं'},
    {'id': 'Red Gram', 'emoji': '🥣', 'en': 'Red Gram', 'te': 'కందిపప్పు', 'hi': 'अरहर'},
    {'id': 'Green Gram', 'emoji': '🥣', 'en': 'Green Gram', 'te': 'పెసరపప్పు', 'hi': 'मूंग'},
    {'id': 'Black Gram', 'emoji': '🥣', 'en': 'Black Gram', 'te': 'మినపప్పు', 'hi': 'उड़द'},
    {'id': 'Sugarcane', 'emoji': '🎋', 'en': 'Sugarcane', 'te': 'చెరకు', 'hi': 'गन्ना'},
    {'id': 'Sunflower', 'emoji': '🌻', 'en': 'Sunflower', 'te': 'పొద్దుతిరుగుడు', 'hi': 'सूरजमुखी'},
    {'id': 'Sesame', 'emoji': '🌰', 'en': 'Sesame', 'te': 'నువ్వులు', 'hi': 'तिल'},
  ];

  // Preset locations (matching backend and APMC mandi centers)
  static const List<Map<String, dynamic>> presetLocations = [
    {'name': 'Warangal', 'lat': 17.9784, 'lng': 79.5941},
    {'name': 'Nizamabad', 'lat': 18.6725, 'lng': 78.0941},
    {'name': 'Khammam', 'lat': 17.2473, 'lng': 80.1514},
    {'name': 'Mahabubnagar', 'lat': 16.7488, 'lng': 78.0035},
    {'name': 'Nalgonda', 'lat': 17.0500, 'lng': 79.2700},
    {'name': 'Suryapet', 'lat': 17.1400, 'lng': 79.6200},
    {'name': 'Miryalaguda', 'lat': 16.8700, 'lng': 79.5600},
    {'name': 'Bowenpally (Hyderabad)', 'lat': 17.4720, 'lng': 78.4830},
    {'name': 'Gudimalkapur (Hyderabad)', 'lat': 17.3820, 'lng': 78.4410},
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
