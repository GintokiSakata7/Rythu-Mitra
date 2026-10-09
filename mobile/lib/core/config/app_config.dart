class AppConfig {
  // Base URL for the Node.js backend.
  // Live cloud backend on Render
  static const String baseUrl = 'https://mandi-mitra-nbtv.onrender.com/api';

  // Strictly false: use real database data only
  static const bool useMockFallback = false;

  static const String appName = 'RythuMitra';
  static const String appVersion = '1.0.0';
}
