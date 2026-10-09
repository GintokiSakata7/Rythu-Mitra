import 'package:flutter/foundation.dart';
import '../models/app_models.dart';
import '../core/constants/app_constants.dart';
import 'intent_engine.dart';

enum ConvStep {
  idle,
  needCrop,
  needQuantity,
  needLocation,
  needTransport,
  running,
}

class ConversationManager extends ChangeNotifier {
  ConvStep _step = ConvStep.idle;
  String? _crop;
  double? _quantityQuintals;
  bool? _hasTransport;
  double? _lat;
  double? _lng;
  String? _locationText;
  bool _usingGps = false;

  ConvStep get step => _step;
  String? get crop => _crop;
  double? get quantityQuintals => _quantityQuintals;
  bool? get hasTransport => _hasTransport;
  double? get lat => _lat;
  double? get lng => _lng;
  String? get locationText => _locationText;
  bool get usingGps => _usingGps;

  bool get isReadyToSearch =>
      _crop != null && _quantityQuintals != null && _hasTransport != null &&
      (_usingGps || _locationText != null);

  void reset() {
    _step = ConvStep.idle;
    _crop = null;
    _quantityQuintals = null;
    _hasTransport = null;
    _lat = null;
    _lng = null;
    _locationText = null;
    _usingGps = false;
    notifyListeners();
  }

  void setGpsLocation(double lat, double lng, String displayName) {
    _lat = lat;
    _lng = lng;
    _locationText = displayName;
    _usingGps = true;
    notifyListeners();
  }

  void setLocationFromText(String town, {double? lat, double? lng}) {
    _locationText = town;
    _usingGps = false;
    if (lat != null && lng != null) {
      _lat = lat;
      _lng = lng;
    } else {
      final clean = town.trim().toLowerCase();
      bool matched = false;
      for (final preset in AppConstants.presetLocations) {
        final pName = (preset['name'] as String).toLowerCase();
        if (pName.contains(clean) || clean.contains(pName)) {
          _lat = (preset['lat'] as num).toDouble();
          _lng = (preset['lng'] as num).toDouble();
          _locationText = preset['name'];
          matched = true;
          break;
        }
      }
      if (!matched) {
        // Fallback default coordinates (Telangana central)
        _lat ??= 17.385;
        _lng ??= 78.4867;
      }
    }
    notifyListeners();
  }

  /// Process an extracted intent and return the next question to ask (localized).
  /// Returns null if enough data is collected (caller should fire search).
  String? processIntent(AssistantIntent intent, String lang) {
    // Apply any extracted entities
    if (intent.crop != null && intent.crop!.isNotEmpty) {
      _crop = intent.crop;
    }

    if (intent.quantity != null && intent.quantity! > 0) {
      double qInQuintals = intent.quantity!;
      if (intent.unit == 'kg') qInQuintals = intent.quantity! / 100.0;
      if (intent.unit == 'ton') qInQuintals = intent.quantity! * 10.0;
      _quantityQuintals = qInQuintals;
    }

    if (intent.hasTransport != null) {
      _hasTransport = intent.hasTransport;
    }
    
    if (intent.useGps == true) {
      _usingGps = true;
    } else if (intent.locationText != null && intent.locationText!.isNotEmpty) {
      setLocationFromText(intent.locationText!);
    } else if (_step == ConvStep.needLocation && intent.rawText.trim().isNotEmpty) {
      // If we asked for location and they answered with a location name, use it!
      setLocationFromText(intent.rawText.trim());
    }

    // Handle explicit yes/no (for transport question)
    if (_step == ConvStep.needTransport) {
      if (intent.type == IntentType.confirmYes) _hasTransport = true;
      if (intent.type == IntentType.confirmNo) _hasTransport = false;
    }

    // Determine next step
    notifyListeners();
    return _nextQuestion(lang);
  }

  String? _nextQuestion(String lang) {
    if (_crop == null) {
      _step = ConvStep.needCrop;
      return _l(lang,
        en: 'Which crop do you want to sell?',
        te: 'మీరు ఏ పంట అమ్ముతున్నారు? (ఉదా: టమాట, ఉల్లి, వరి)',
        hi: 'आप कौन सी फसल बेचना चाहते हैं? (जैसे: टमाटर, प्याज, धान)',
      );
    }
    if (_quantityQuintals == null) {
      _step = ConvStep.needQuantity;
      return _l(lang,
        en: 'How many quintals of $_crop do you have?',
        te: 'మీ దగ్గర ఎంత పరిమాణం $_crop ఉంది? (ఉదా: 10 లేదా 20 క్వింటాళ్లు)',
        hi: 'आपके पास कितने क्विंटल $_crop है? (जैसे: 10 या 20 क्विंटल)',
      );
    }
    if (!_usingGps && _locationText == null) {
      _step = ConvStep.needLocation;
      return _l(lang,
        en: "Where is your farm? Tap '📍 Use Current Location' below or say your town name.",
        te: "మీ పొలం ఎక్కడుంది? క్రింద ఉన్న '📍 నా లొకేషన్' బటన్ నొక్కండి లేదా మీ ఊరి పేరు చెప్పండి.",
        hi: "आपका खेत कहाँ है? नीचे दिए गए '📍 मेरी लोकेशन' बटन दबाएं या अपने गाँव का नाम बताएं।",
      );
    }
    if (_hasTransport == null) {
      _step = ConvStep.needTransport;
      return _l(lang,
        en: 'Do you have your own vehicle? (Say Yes or No)',
        te: 'మీకు స్వంత రవాణా వాహనం ఉందా? (అవును లేదా లేదు చెప్పండి)',
        hi: 'क्या आपके पास अपना वाहन है? (हाँ या नहीं बोलें)',
      );
    }
    // All data collected
    _step = ConvStep.running;
    return null; // Caller launches search
  }

  String _l(String lang, {required String en, required String te, required String hi}) {
    if (lang == 'te') return te;
    if (lang == 'hi') return hi;
    return en;
  }

  RecommendationRequest buildRequest(String lang) {
    return RecommendationRequest(
      crop: _crop ?? 'Tomato',
      quantityKg: ((_quantityQuintals ?? 10) * 100).toInt(),
      latitude: _lat ?? 17.385,
      longitude: _lng ?? 78.4867,
      locationText: _locationText ?? 'Current Device Location',
      hasTransport: _hasTransport ?? false,
      language: lang,
    );
  }

  String confirmationMessage(String lang) => _l(lang,
    en: "Got it! Searching for the best market for ${_quantityQuintals?.toStringAsFixed(1)} quintals of $_crop near ${_locationText ?? 'your location'}...",
    te: "అర్థమైంది! ${_locationText ?? 'మీ ప్రాంతం'} సమీపంలో ${_quantityQuintals?.toStringAsFixed(1)} క్వింటాళ్ళ $_crop కి అత్యధిక లాభదాయక మార్కెట్ వెతుకుతున్నాను...",
    hi: "समझ गया! ${_locationText ?? 'आपके स्थान'} के पास ${_quantityQuintals?.toStringAsFixed(1)} क्विंटल $_crop के लिए सबसे अच्छा बाज़ार खोज रहा हूँ...",
  );
}
