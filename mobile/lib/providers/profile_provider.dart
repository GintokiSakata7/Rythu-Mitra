import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:shared_preferences/shared_preferences.dart';

class ProfileProvider extends ChangeNotifier {
  static const String _prefKey = 'user_profile';

  String name = 'Farmer';
  String phone = '';
  String location = '';
  String vehicleType = 'No Vehicle';
  List<String> preferredCrops = [];

  ProfileProvider() {
    _load();
  }

  Future<void> _load() async {
    final prefs = await SharedPreferences.getInstance();
    final data = prefs.getString(_prefKey);
    if (data != null) {
      try {
        final map = jsonDecode(data) as Map<String, dynamic>;
        name = map['name'] ?? 'Farmer';
        phone = map['phone'] ?? '';
        location = map['location'] ?? '';
        vehicleType = map['vehicleType'] ?? 'No Vehicle';
        preferredCrops = List<String>.from(map['preferredCrops'] ?? []);
        notifyListeners();
      } catch (_) {}
    }
  }

  Future<void> saveProfile({
    required String newName,
    required String newPhone,
    required String newLocation,
    required String newVehicleType,
    required List<String> newPreferredCrops,
  }) async {
    name = newName;
    phone = newPhone;
    location = newLocation;
    vehicleType = newVehicleType;
    preferredCrops = newPreferredCrops;
    
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_prefKey, jsonEncode({
      'name': name,
      'phone': phone,
      'location': location,
      'vehicleType': vehicleType,
      'preferredCrops': preferredCrops,
    }));
  }
}
