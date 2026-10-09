import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class SettingsProvider extends ChangeNotifier {
  static const String _keyOnboarding = 'onboarding_complete';
  static const String _keyLocationDismissed = 'location_prompt_dismissed';

  bool _isOnboardingComplete = false;
  bool _isLocationPromptDismissed = false;

  bool get isOnboardingComplete => _isOnboardingComplete;
  bool get isLocationPromptDismissed => _isLocationPromptDismissed;

  SettingsProvider([SharedPreferences? initialPrefs]) {
    if (initialPrefs != null) {
      _isOnboardingComplete = initialPrefs.getBool(_keyOnboarding) ?? false;
      _isLocationPromptDismissed = initialPrefs.getBool(_keyLocationDismissed) ?? false;
    } else {
      _loadSettings();
    }
  }

  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    _isOnboardingComplete = prefs.getBool(_keyOnboarding) ?? false;
    _isLocationPromptDismissed = prefs.getBool(_keyLocationDismissed) ?? false;
    notifyListeners();
  }

  Future<void> completeOnboarding() async {
    _isOnboardingComplete = true;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyOnboarding, true);
  }

  Future<void> dismissLocationPrompt() async {
    _isLocationPromptDismissed = true;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool(_keyLocationDismissed, true);
  }
}
