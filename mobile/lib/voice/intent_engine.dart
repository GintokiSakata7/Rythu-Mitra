
enum IntentType {
  findBestMarket,
  findNearestMarket,
  searchBuyers,
  postDemand,
  showDemands,
  showPrices,
  useCurrentLocation,
  setCrop,
  setQuantity,
  setVehicle,
  ownVehicle,
  noVehicle,
  showProfile,
  showNotifications,
  openSettings,
  help,
  confirmYes,
  confirmNo,
  unknown,
}

class AssistantIntent {
  final IntentType type;
  final String? crop;         // extracted crop id (e.g. 'Tomato')
  final double? quantity;     // numeric quantity
  final String unit;          // 'quintal', 'kg', 'ton'
  final bool? hasTransport;
  final bool? useGps;
  final String? locationText;
  final String rawText;

  const AssistantIntent({
    required this.type,
    this.crop,
    this.quantity,
    this.unit = 'quintal',
    this.hasTransport,
    this.useGps,
    this.locationText,
    required this.rawText,
  });
}

/// Maps crop names in all three languages to their canonical crop id
final _cropKeywords = <String, String>{
  // English
  'tomato': 'Tomato', 'tomatoes': 'Tomato',
  'paddy': 'Paddy', 'rice': 'Paddy',
  'chilli': 'Chilli', 'chilly': 'Chilli', 'chili': 'Chilli',
  'onion': 'Onion', 'onions': 'Onion',
  'maize': 'Maize', 'corn': 'Maize',
  'cotton': 'Cotton',
  'groundnut': 'Groundnut', 'peanut': 'Groundnut',
  'turmeric': 'Turmeric',
  'soybean': 'Soybean', 'soya': 'Soybean',
  'potato': 'Potato', 'potatoes': 'Potato',
  'brinjal': 'Brinjal', 'eggplant': 'Brinjal', 'baingan': 'Brinjal',
  'cabbage': 'Cabbage',
  'cauliflower': 'Cauliflower',
  'carrot': 'Carrot', 'carrots': 'Carrot',
  'mango': 'Mango',
  'banana': 'Banana',
  'grapes': 'Grapes', 'grape': 'Grapes',
  'wheat': 'Wheat',
  'red gram': 'Red Gram', 'arhar': 'Red Gram', 'toor': 'Red Gram',
  'green gram': 'Green Gram', 'moong': 'Green Gram', 'mung': 'Green Gram',
  'black gram': 'Black Gram', 'urad': 'Black Gram',
  'sugarcane': 'Sugarcane',
  'sunflower': 'Sunflower',
  'sesame': 'Sesame', 'gingelly': 'Sesame',
  // Telugu
  'టమాట': 'Tomato', 'టమాటా': 'Tomato', 'టమాటాలు': 'Tomato',
  'వరి': 'Paddy', 'ధాన్యం': 'Paddy',
  'మిరప': 'Chilli', 'మిరపకాయలు': 'Chilli',
  'ఉల్లిపాయ': 'Onion', 'ఉల్లిపాయలు': 'Onion',
  'మొక్కజొన్న': 'Maize',
  'పత్తి': 'Cotton',
  'వేరుశనగ': 'Groundnut',
  'పసుపు': 'Turmeric',
  'సోయాబీన్': 'Soybean',
  'బంగాళాదుంప': 'Potato',
  'వంకాయ': 'Brinjal',
  'క్యాబేజీ': 'Cabbage',
  'కాలీఫ్లవర్': 'Cauliflower',
  'క్యారెట్': 'Carrot',
  'మామిడి': 'Mango',
  'అరటి': 'Banana',
  'ద్రాక్ష': 'Grapes',
  'గోధుమ': 'Wheat',
  'కందిపప్పు': 'Red Gram',
  'పెసరపప్పు': 'Green Gram',
  'మినపప్పు': 'Black Gram',
  'చెరకు': 'Sugarcane',
  'పొద్దుతిరుగుడు': 'Sunflower',
  'నువ్వులు': 'Sesame',
  // Hindi
  'टमाटर': 'Tomato', 'टमाटा': 'Tomato',
  'धान': 'Paddy', 'चावल': 'Paddy',
  'मिर्च': 'Chilli', 'मिर्ची': 'Chilli',
  'प्याज': 'Onion', 'प्याजा': 'Onion',
  'मक्का': 'Maize', 'मकई': 'Maize',
  'कपास': 'Cotton',
  'मूंगफली': 'Groundnut',
  'हल्दी': 'Turmeric',
  'सोयाबीन': 'Soybean',
  'आलू': 'Potato',
  'बैंगन': 'Brinjal',
  'पत्ता गोभी': 'Cabbage',
  'फूल गोभी': 'Cauliflower',
  'गाजर': 'Carrot',
  'आम': 'Mango',
  'केला': 'Banana',
  'अंगूर': 'Grapes',
  'गेहूं': 'Wheat', 'गेहु': 'Wheat',
  'अरहर': 'Red Gram', 'तूर': 'Red Gram',
  'मूंग': 'Green Gram',
  'उड़द': 'Black Gram',
  'गन्ना': 'Sugarcane',
  'सूरजमुखी': 'Sunflower',
  'तिल': 'Sesame',
};

/// GPS trigger words in all three languages
const _gpsKeywords = [
  'current location', 'my location', 'use location', 'gps', 'near me', 'location', 'here',
  'నా లొకేషన్', 'నా స్థానం', 'ప్రస్తుత స్థానం', 'జిపిఎస్', 'లొకేషన్', 'లోకేషన్', 'స్థానం',
  'मेरी लोकेशन', 'मेरा स्थान', 'वर्तमान स्थान', 'जीपीएस', 'लोकेशन', 'स्थान',
];

/// Market search trigger words
const _marketKeywords = [
  'best market', 'find market', 'market', 'mandi', 'nearest market',
  'best price', 'find best', 'search market', 'highest price',
  'మార్కెట్', 'మంది', 'బెస్ట్ మార్కెట్', 'ఉత్తమ మార్కెట్', 'దగ్గర మార్కెట్',
  'बाजार', 'मंडी', 'सबसे अच्छा', 'बेस्ट मार्केट', 'नजदीकी बाजार',
];

/// Buyer search trigger words
const _buyerKeywords = [
  'buyer', 'buyers', 'show buyers', 'nearby buyers', 'purchase', 'trader',
  'కొనుగోలు', 'కొనుగోలుదారు', 'కొనుగోలుదారులు', 'సమీప కొనుగోలుదారులు',
  'खरीदार', 'खरीददार', 'व्यापारी', 'पास के खरीदार',
];

/// Demand trigger words
const _demandKeywords = [
  'post demand', 'my demands', 'show demands', 'demands', 'demand',
  'డిమాండ్', 'నా డిమాండ్లు', 'డిమాండ్ పోస్ట్',
  'डिमांड', 'मांग', 'मेरी मांगें',
];

/// Affirmative words
const _yesWords = [
  'yes', 'yeah', 'yep', 'sure', 'ok', 'okay', 'have', 'own', 'mine',
  'అవును', 'ఉంది', 'వుంది', 'నాది',
  'हाँ', 'हां', 'जी', 'ठीक है',
];

/// Negative words
const _noWords = [
  'no', 'nope', "don't", 'dont', 'not', 'none', 'need',
  'లేదు', 'కాదు',
  'नहीं', 'ना', 'मत',
];

class IntentEngine {
  /// Fast local extraction — works fully offline
  AssistantIntent extractLocal(String text, String lang) {
    final lower = text.toLowerCase().trim();

    // --- Detect crop ---
    String? detectedCrop;
    for (final entry in _cropKeywords.entries) {
      if (lower.contains(entry.key.toLowerCase())) {
        detectedCrop = entry.value;
        break;
      }
    }

    // --- Detect quantity ---
    double? quantity;
    String unit = 'quintal';
    final numMatch = RegExp(r'(\d+(?:\.\d+)?)').firstMatch(lower);
    if (numMatch != null) {
      quantity = double.tryParse(numMatch.group(0)!);
    } else {
      // Look for word-based numbers in Telugu, Hindi, English
      const numberWords = <String, double>{
        'ఒకటి': 1, 'ఒక': 1, 'రెండు': 2, 'మూడు': 3, 'నాలుగు': 4, 'ఐదు': 5,
        'ఆరు': 6, 'ఏడు': 7, 'ఎనిమిది': 8, 'తొమ్మిది': 9, 'పది': 10,
        'యాభై': 50, 'వంద': 100,
        'एक': 1, 'दो': 2, 'तीन': 3, 'चार': 4, 'पांच': 5, 'पाँच': 5,
        'छह': 6, 'सात': 7, 'आठ': 8, 'नौ': 9, 'दस': 10,
        'पचास': 50, 'सौ': 100,
        'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5, 
        'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
        'fifty': 50, 'hundred': 100,
      };
      for (final entry in numberWords.entries) {
        if (lower.contains(entry.key)) {
          quantity = entry.value;
          break;
        }
      }
    }
    
    if (lower.contains('kg') || lower.contains('kilo') || lower.contains('కిలో') || lower.contains('किलो')) {
      unit = 'kg';
    } else if (lower.contains('ton') || lower.contains('tonne') || lower.contains('టన్ను') || lower.contains('टन')) {
      unit = 'ton';
    } else if (lower.contains('quintal') || lower.contains('క్వింటాళ్') || lower.contains('క్వింటాల్') || lower.contains('क्विंटल') || lower.contains('quintal')) {
      unit = 'quintal';
    }

    // --- Detect GPS intent ---
    final bool useGps = _gpsKeywords.any((kw) => lower.contains(kw.toLowerCase()));

    // --- Detect transport ---
    bool? hasTransport;
    final isYes = _yesWords.any((w) => lower.contains(w));
    final isNo = _noWords.any((w) => lower.contains(w));
    if (lower.contains('vehicle') || lower.contains('transport') || lower.contains('truck') ||
        lower.contains('వాహనం') || lower.contains('వాహన') || lower.contains('वाहन') || lower.contains('गाड़ी')) {
      if (isYes) hasTransport = true;
      if (isNo) hasTransport = false;
    }
    // Own/No vehicle explicit
    if (lower.contains('own vehicle') || lower.contains('my vehicle') || lower.contains('స్వంత వాహన') || lower.contains('अपनी गाड़ी')) {
      hasTransport = true;
    }
    if (lower.contains('no vehicle') || lower.contains("don't have vehicle") || lower.contains('వాహనం లేదు') || lower.contains('गाड़ी नहीं')) {
      hasTransport = false;
    }

    // --- Detect YES/NO standalone (for transport question) ---
    if (detectedCrop == null && quantity == null && !useGps && hasTransport == null) {
      if (isYes && !isNo) {
        return AssistantIntent(type: IntentType.confirmYes, rawText: text);
      }
      if (isNo && !isYes) {
        return AssistantIntent(type: IntentType.confirmNo, rawText: text);
      }
    }

    // --- Detect primary intent ---
    if (_buyerKeywords.any((kw) => lower.contains(kw.toLowerCase()))) {
      return AssistantIntent(type: IntentType.searchBuyers, rawText: text, useGps: useGps);
    }
    if (_demandKeywords.any((kw) => lower.contains(kw.toLowerCase()))) {
      final isDemandPost = lower.contains('post') || lower.contains('పోస్ట్') || lower.contains('पोस्ट');
      return AssistantIntent(
        type: isDemandPost ? IntentType.postDemand : IntentType.showDemands,
        rawText: text,
      );
    }
    if (lower.contains('price') || lower.contains('ధర') || lower.contains('भाव') || lower.contains('दाम')) {
      return AssistantIntent(type: IntentType.showPrices, rawText: text, crop: detectedCrop);
    }
    if (lower.contains('profile') || lower.contains('ప్రొఫైల్') || lower.contains('प्रोफाइल')) {
      return AssistantIntent(type: IntentType.showProfile, rawText: text);
    }
    if (lower.contains('notification') || lower.contains('నోటిఫికేషన్') || lower.contains('सूचना')) {
      return AssistantIntent(type: IntentType.showNotifications, rawText: text);
    }
    if (lower.contains('setting') || lower.contains('సెట్టింగ్') || lower.contains('सेटिंग')) {
      return AssistantIntent(type: IntentType.openSettings, rawText: text);
    }
    if (lower.contains('help') || lower.contains('సహాయం') || lower.contains('मदद')) {
      return AssistantIntent(type: IntentType.help, rawText: text);
    }

    // --- GPS standalone ---
    if (useGps) {
      return AssistantIntent(type: IntentType.useCurrentLocation, rawText: text, useGps: true);
    }

    // --- Market search (with or without crop/quantity) ---
    if (_marketKeywords.any((kw) => lower.contains(kw.toLowerCase())) ||
        (detectedCrop != null || quantity != null)) {
      return AssistantIntent(
        type: IntentType.findBestMarket,
        rawText: text,
        crop: detectedCrop,
        quantity: quantity,
        unit: unit,
        hasTransport: hasTransport,
        useGps: useGps,
      );
    }

    return AssistantIntent(type: IntentType.unknown, rawText: text);
  }
}

final intentEngine = IntentEngine();
