import 'package:flutter/foundation.dart';

class AppConfig {
  static const String _envUrl = String.fromEnvironment('API_BASE_URL', defaultValue: '');

  // Base URL for the Node.js backend.
  // Priority: 1. --dart-define=API_BASE_URL 2. localhost if Web 3. Production Render server
  static String get baseUrl {
    if (_envUrl.isNotEmpty) return _envUrl;
    if (kIsWeb) return 'http://localhost:4000/api';
    return 'https://mandi-mitra-nbtv.onrender.com/api';
  }

  // Set to true to use mock data when backend is unavailable
  static const bool useMockFallback = true;

  static const String appName = 'RythuMitra';
  static const String appVersion = '1.0.0';
}
