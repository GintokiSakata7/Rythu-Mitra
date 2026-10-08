import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../core/constants/app_constants.dart';

class LanguageProvider extends ChangeNotifier {
  String _langCode = 'en';

  String get langCode => _langCode;

  LanguageProvider() {
    _loadSavedLanguage();
  }

  Future<void> _loadSavedLanguage() async {
    final prefs = await SharedPreferences.getInstance();
    final saved = prefs.getString(AppConstants.prefKeyLanguage);
    if (saved != null) {
      _langCode = saved;
      notifyListeners();
    }
  }

  Future<void> setLanguage(String code) async {
    _langCode = code;
    notifyListeners();
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.prefKeyLanguage, code);
  }

  Future<bool> isLanguageSelected() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.containsKey(AppConstants.prefKeyLanguage);
  }
}
