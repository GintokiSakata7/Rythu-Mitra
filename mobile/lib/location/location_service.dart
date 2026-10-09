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
    // 1. Check if device location service is enabled
    bool serviceEnabled = false;
    try {
      serviceEnabled = await Geolocator.isLocationServiceEnabled();
    } catch (_) {
      serviceEnabled = false;
    }

    if (!serviceEnabled) {
      return (
        result: null,
        error: const LocationError(
          LocationErrorType.gpsDisabled,
          'Location services (GPS) are turned off. Please turn on GPS in your device settings.',
        )
      );
    }

    // 2. Check and request location permission
    LocationPermission permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return (
          result: null,
          error: const LocationError(
            LocationErrorType.permissionDenied,
            'Location permission was denied. Please allow location access to find nearby markets.',
          )
        );
      }
    }

    if (permission == LocationPermission.deniedForever) {
      return (
        result: null,
        error: const LocationError(
          LocationErrorType.permissionPermanentlyDenied,
          'Location permission is permanently denied. Please enable location permissions in App Settings.',
        )
      );
    }

    // 3. Acquire position
    Position? position;

    // Fast check: Try last known position first (instant cached candidate)
    try {
      position = await Geolocator.getLastKnownPosition();
    } catch (_) {}

    // Get fresh accurate position
    try {
      final fresh = await Geolocator.getCurrentPosition(
        locationSettings: const LocationSettings(
          accuracy: LocationAccuracy.high,
          timeLimit: Duration(seconds: 10),
        ),
      );
      position = fresh;
    } catch (_) {
      // High accuracy timed out or failed (e.g. indoors); try medium accuracy
      if (position == null) {
        try {
          position = await Geolocator.getCurrentPosition(
            locationSettings: const LocationSettings(
              accuracy: LocationAccuracy.medium,
              timeLimit: Duration(seconds: 8),
            ),
          );
        } catch (_) {}
      }
    }

    if (position == null) {
      return (
        result: null,
        error: const LocationError(
          LocationErrorType.timeout,
          'Unable to acquire GPS signal. Please move to an open area or select your town manually.',
        )
      );
    }

    // 4. Reverse geocode coordinates to town/village name
    String? displayName;
    try {
      final placemarks = await placemarkFromCoordinates(
        position.latitude,
        position.longitude,
      ).timeout(const Duration(seconds: 4));

      if (placemarks.isNotEmpty) {
        final p = placemarks.first;
        final parts = [
          p.subLocality,
          p.locality,
          p.subAdministrativeArea,
          p.administrativeArea,
        ].where((s) => s != null && s.isNotEmpty && s.trim().isNotEmpty && s != 'null').toSet().toList();

        if (parts.isNotEmpty) {
          displayName = parts.take(2).join(', ');
        }
      }
    } catch (_) {
      // Geocoding network or service failure is non-fatal
    }

    displayName ??= 'GPS Location (${position.latitude.toStringAsFixed(3)}, ${position.longitude.toStringAsFixed(3)})';

    return (
      result: LocationResult(
        lat: position.latitude,
        lng: position.longitude,
        displayName: displayName,
        accuracyMeters: position.accuracy,
      ),
      error: null,
    );
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
