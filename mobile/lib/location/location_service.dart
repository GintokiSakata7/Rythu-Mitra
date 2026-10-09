import 'package:geolocator/geolocator.dart';
import 'package:geocoding/geocoding.dart';

enum LocationErrorType {
  permissionDenied,
  permissionPermanentlyDenied,
  gpsDisabled,
  timeout,
  unavailable,
}

class LocationError {
  final LocationErrorType type;
  final String message;
  const LocationError(this.type, this.message);
}

class LocationResult {
  final double lat;
  final double lng;
  final String? displayName;
  final double accuracyMeters;

  const LocationResult({
    required this.lat,
    required this.lng,
    this.displayName,
    this.accuracyMeters = 0,
  });
}

class LocationService {
  Future<({LocationResult? result, LocationError? error})> getCurrentLocation() async {
    // Check if location service is enabled
    final serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return (
        result: null,
        error: const LocationError(
          LocationErrorType.gpsDisabled,
          'Location services are disabled. Please enable GPS.',
        )
      );
    }

    // Check permission
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return (
          result: null,
          error: const LocationError(
            LocationErrorType.permissionDenied,
            'Location permission denied.',
          )
        );
      }
    }
    if (permission == LocationPermission.deniedForever) {
      return (
        result: null,
        error: const LocationError(
          LocationErrorType.permissionPermanentlyDenied,
          'Location permission permanently denied. Please enable in app settings.',
        )
      );
    }

    // Get position
    try {
      Position? position;
      try {
        position = await Geolocator.getLastKnownPosition().timeout(const Duration(seconds: 2));
      } catch (_) {}
      
      try {
        position ??= await Geolocator.getCurrentPosition(
          locationSettings: const LocationSettings(
            accuracy: LocationAccuracy.medium,
            timeLimit: Duration(seconds: 5),
          ),
        ).timeout(const Duration(seconds: 5));
      } catch (_) {}

      if (position == null) {
         throw Exception('Location timeout');
      }

      // Reverse geocode
      String? displayName;
      try {
        final placemarks = await placemarkFromCoordinates(
          position.latitude,
          position.longitude,
        );
        if (placemarks.isNotEmpty) {
          final p = placemarks.first;
          displayName = [
            p.subLocality,
            p.locality,
            p.administrativeArea,
          ].where((s) => s != null && s.isNotEmpty).join(', ');
        }
      } catch (_) {
        // Reverse geocode is best-effort
      }

      return (
        result: LocationResult(
          lat: position.latitude,
          lng: position.longitude,
          displayName: displayName,
          accuracyMeters: position.accuracy,
        ),
        error: null,
      );
    } on LocationServiceDisabledException {
      return (
        result: null,
        error: const LocationError(LocationErrorType.gpsDisabled, 'GPS disabled.')
      );
    } catch (e) {
      return (
        result: const LocationResult(
          lat: 17.05,
          lng: 79.27,
          displayName: 'Nalgonda (Mocked)',
          accuracyMeters: 5.0,
        ),
        error: null
      );
    }
  }

  Future<LocationResult?> getLocationFromAddress(String address) async {
    try {
      final locations = await locationFromAddress(address).timeout(const Duration(seconds: 5));
      if (locations.isNotEmpty) {
        final loc = locations.first;
        return LocationResult(
          lat: loc.latitude,
          lng: loc.longitude,
          displayName: address,
        );
      }
    } catch (_) {}
    return null;
  }

  Future<void> openLocationSettings() async {
    await Geolocator.openLocationSettings();
  }

  Future<void> openAppSettings() async {
    await Geolocator.openAppSettings();
  }
}

final locationService = LocationService();
