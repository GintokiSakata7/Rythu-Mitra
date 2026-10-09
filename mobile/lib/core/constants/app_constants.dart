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

  // Top 4 popular preset locations shown by default
  static const List<Map<String, dynamic>> topPresetLocations = [
    {'name': 'Warangal', 'lat': 17.9784, 'lng': 79.5941, 'te': 'వరంగల్'},
    {'name': 'Nizamabad', 'lat': 18.6725, 'lng': 78.0941, 'te': 'నిజామాబాద్'},
    {'name': 'Khammam', 'lat': 17.2473, 'lng': 80.1514, 'te': 'ఖమ్మం'},
    {'name': 'Mahabubnagar', 'lat': 16.7488, 'lng': 78.0035, 'te': 'మహబూబ్ నగర్'},
  ];

  // All 33 districts of Telangana + major APMC mandi hubs
  static const List<Map<String, dynamic>> telanganaDistricts = [
    {'name': 'Adilabad', 'lat': 19.6641, 'lng': 78.5320, 'te': 'ఆదిలాబాద్'},
    {'name': 'Badepally (Jadcherla)', 'lat': 16.7720, 'lng': 78.1360, 'te': 'బాదేపల్లి (జడ్చర్ల)'},
    {'name': 'Bhadradri Kothagudem', 'lat': 17.5550, 'lng': 80.6178, 'te': 'భద్రాద్రి కొత్తగూడెం'},
    {'name': 'Bowenpally (Hyderabad)', 'lat': 17.4720, 'lng': 78.4830, 'te': 'బోయిన్‌పల్లి (హైదరాబాద్)'},
    {'name': 'Gudimalkapur (Hyderabad)', 'lat': 17.3820, 'lng': 78.4410, 'te': 'గుడిమల్కాపూర్ (హైదరాబాద్)'},
    {'name': 'Hanumakonda', 'lat': 18.0138, 'lng': 79.5615, 'te': 'హనుమకొండ'},
    {'name': 'Hyderabad', 'lat': 17.3850, 'lng': 78.4867, 'te': 'హైదరాబాద్'},
    {'name': 'Jagtial', 'lat': 18.7942, 'lng': 78.9126, 'te': 'జగిత్యాల'},
    {'name': 'Jangaon', 'lat': 17.7247, 'lng': 79.1558, 'te': 'జనగామ'},
    {'name': 'Jayashankar Bhupalpally', 'lat': 18.4358, 'lng': 79.8653, 'te': 'జయశంకర్ భూపాలపల్లి'},
    {'name': 'Jogulamba Gadwal', 'lat': 16.2335, 'lng': 77.8080, 'te': 'జోగులాంబ గద్వాల'},
    {'name': 'Kamareddy', 'lat': 18.3243, 'lng': 78.3396, 'te': 'కామారెడ్డి'},
    {'name': 'Karimnagar', 'lat': 18.4386, 'lng': 79.1288, 'te': 'కరీంనగర్'},
    {'name': 'Khammam', 'lat': 17.2473, 'lng': 80.1514, 'te': 'ఖమ్మం'},
    {'name': 'Kumuram Bheem Asifabad', 'lat': 19.3639, 'lng': 79.2891, 'te': 'కుమురం భీమ్ ఆసిఫాబాద్'},
    {'name': 'Mahabubabad', 'lat': 17.5997, 'lng': 79.9990, 'te': 'మహబూబాబాద్'},
    {'name': 'Mahabubnagar', 'lat': 16.7488, 'lng': 78.0035, 'te': 'మహబూబ్ నగర్'},
    {'name': 'Mancherial', 'lat': 18.8679, 'lng': 79.4639, 'te': 'మంచిర్యాల'},
    {'name': 'Medak', 'lat': 18.0454, 'lng': 78.2625, 'te': 'మెదక్'},
    {'name': 'Medchal-Malkajgiri', 'lat': 17.6297, 'lng': 78.4814, 'te': 'మేడ్చల్-మల్కాజ్‌గిరి'},
    {'name': 'Miryalaguda', 'lat': 16.8700, 'lng': 79.5600, 'te': 'మిర్యాలగూడ'},
    {'name': 'Mulugu', 'lat': 18.1925, 'lng': 79.9407, 'te': 'ములుగు'},
    {'name': 'Nagarkurnool', 'lat': 16.4854, 'lng': 78.3275, 'te': 'నాగర్ కర్నూల్'},
    {'name': 'Nalgonda', 'lat': 17.0500, 'lng': 79.2700, 'te': 'నల్గొండ'},
    {'name': 'Narayanpet', 'lat': 16.7337, 'lng': 77.4983, 'te': 'నారాయణపేట'},
    {'name': 'Nirmal', 'lat': 19.0964, 'lng': 78.3428, 'te': 'నిర్మల్'},
    {'name': 'Nizamabad', 'lat': 18.6725, 'lng': 78.0941, 'te': 'నిజామాబాద్'},
    {'name': 'Peddapalli', 'lat': 18.6162, 'lng': 79.3734, 'te': 'పెద్దపల్లి'},
    {'name': 'Rajanna Sircilla', 'lat': 18.3846, 'lng': 78.8051, 'te': 'రాజన్న సిరిసిల్ల'},
    {'name': 'Rangareddy', 'lat': 17.1956, 'lng': 78.4747, 'te': 'రంగారెడ్డి'},
    {'name': 'Sangareddy', 'lat': 17.6190, 'lng': 78.0818, 'te': 'సంగారెడ్డి'},
    {'name': 'Siddipet', 'lat': 18.1018, 'lng': 78.8520, 'te': 'సిద్దిపేట'},
    {'name': 'Suryapet', 'lat': 17.1400, 'lng': 79.6200, 'te': 'సూర్యాపేట'},
    {'name': 'Vikarabad', 'lat': 17.3364, 'lng': 77.9048, 'te': 'వికారాబాద్'},
    {'name': 'Wanaparthy', 'lat': 16.3624, 'lng': 78.0628, 'te': 'వనపర్తి'},
    {'name': 'Warangal', 'lat': 17.9784, 'lng': 79.5941, 'te': 'వరంగల్'},
    {'name': 'Yadadri Bhuvanagiri', 'lat': 17.5108, 'lng': 78.8878, 'te': 'యాదాద్రి భువనగిరి'},
  ];

  // Preserved for backwards compatibility
  static const List<Map<String, dynamic>> presetLocations = telanganaDistricts;

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
