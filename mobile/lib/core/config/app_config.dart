class AppConfig {
  // Base URL for the Node.js backend.
  // Live cloud backend on Render
  static const String baseUrl = 'https://mandi-mitra-nbtv.onrender.com/api';

  // Set to true to use mock/offline data when backend is unavailable
  static const bool useMockFallback = true;

  static const String appName = 'RythuMitra';
  static const String appVersion = '1.0.0';
}
