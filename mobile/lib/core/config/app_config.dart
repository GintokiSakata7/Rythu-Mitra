class AppConfig {
  // Base URL for the Node.js backend.
  // Android emulator: use 10.0.2.2 (maps to host machine localhost)
  // Physical device on same Wi-Fi: change to your PC's local IP e.g. 192.168.1.10
  static const String baseUrl = 'https://mandi-mitra-nbtv.onrender.com/api';

  // Set to true to use mock data when backend is unavailable
  static const bool useMockFallback = true;

  static const String appName = 'RythuMitra';
  static const String appVersion = '1.0.0';
}
