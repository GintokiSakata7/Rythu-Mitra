class AppConfig {
  // Base URL for the Node.js backend.
  // Android emulator: use 10.0.2.2 (maps to host machine localhost)
  // With 'adb reverse tcp:4000 tcp:4000', physical device connects directly to localhost:4000
  static const String baseUrl = 'http://localhost:4000/api';

  // Set to true to use mock data when backend is unavailable
  static const bool useMockFallback = false;

  static const String appName = 'RythuMitra';
  static const String appVersion = '1.0.0';
}
