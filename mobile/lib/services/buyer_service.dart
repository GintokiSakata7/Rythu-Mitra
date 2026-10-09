import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/app_models.dart';
import 'api_service.dart';

class BuyerService {
  // Direct Supabase REST API credentials (Fail-safe direct connection to DB)
  static const String _supabaseUrl =
      'https://ucgwzgbcjmzmnrdnjlhl.supabase.co/rest/v1/buyer_requirements';
  static const String _supabaseKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZ3d6Z2Jjam16bW5yZG5qbGhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTQ2ODMxOCwiZXhwIjoyMTA3MDQ0MzE4fQ.3Dl_v8PBcVuHTPtkwMT1CDnNrxvXyrpJzcCrLJWHi84';

  /// Fetches real buyer requirements strictly from the database.
  /// No mock data is used.
  Future<List<BuyerModel>> getBuyers({String crop = '', bool forceRefresh = false}) async {
    final cleanCrop = crop.trim();

    // 1. Try backend API first (which queries Supabase via marketRepository)
    try {
      final queryParam = <String, String>{};
      if (cleanCrop.isNotEmpty) queryParam['crop'] = cleanCrop;
      if (forceRefresh) {
        queryParam['refresh'] = 'true';
        queryParam['force'] = 'true';
        queryParam['t'] = DateTime.now().millisecondsSinceEpoch.toString();
      }
      final data = await apiService.get(
        '/buyers/requirements',
        query: queryParam.isNotEmpty ? queryParam : null,
      );
      final list = data['requirements'] as List<dynamic>?;
      if (list != null) {
        return list
            .map((e) => BuyerModel.fromJson(e as Map<String, dynamic>))
            .toList();
      }
    } catch (e) {
      // Backend unavailable or slow; proceed to direct Supabase query
    }

    // 2. Direct Supabase Query (Direct connection to PostgreSQL DB)
    return await _fetchDirectFromSupabase(crop: cleanCrop, forceRefresh: forceRefresh);
  }

  Future<List<BuyerModel>> _fetchDirectFromSupabase({
    String crop = '',
    bool forceRefresh = false,
  }) async {
    try {
      var urlStr = '$_supabaseUrl?select=*&order=created_at.desc';
      if (crop.isNotEmpty) {
        urlStr += '&crop=ilike.*${Uri.encodeComponent(crop)}*';
      }
      if (forceRefresh) {
        urlStr += '&_ts=${DateTime.now().millisecondsSinceEpoch}';
      }

      final uri = Uri.parse(urlStr);
      final response = await http.get(
        uri,
        headers: {
          'apikey': _supabaseKey,
          'Authorization': 'Bearer $_supabaseKey',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      ).timeout(const Duration(seconds: 8));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final decoded = jsonDecode(response.body);
        if (decoded is List) {
          return decoded
              .map((e) => BuyerModel.fromJson(e as Map<String, dynamic>))
              .toList();
        }
      } else {
        throw Exception(
            'Supabase DB returned error status ${response.statusCode}: ${response.body}');
      }
    } catch (e) {
      rethrow;
    }

    return [];
  }

  Future<void> postBuyer(Map<String, dynamic> body) async {
    try {
      await apiService.post('/buyers/requirements', body);
    } catch (e) {
      // Fallback: direct Supabase insert
      final uri = Uri.parse(_supabaseUrl);
      final dbPayload = {
        'company_name': body['companyName'] ?? body['company_name'],
        'type': body['type'] ?? 'Food Processor',
        'crop': body['crop'],
        'quantity_kg': body['quantityKg'] ?? body['quantity_kg'],
        'grade': body['grade'] ?? 'A',
        'offer_price': body['offerPrice'] ?? body['offer_price'],
        'latitude': body['latitude'] ?? 17.38,
        'longitude': body['longitude'] ?? 78.48,
        'city': body['city'] ?? 'Telangana',
        'pickup_provided':
            body['pickupProvided'] ?? body['pickup_provided'] ?? false,
        'required_by': body['requiredBy'] ?? body['required_by'],
        'payment_days': body['paymentDays'] ?? body['payment_days'] ?? 3,
        'status': 'Open',
      };

      await http.post(
        uri,
        headers: {
          'apikey': _supabaseKey,
          'Authorization': 'Bearer $_supabaseKey',
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: jsonEncode(dbPayload),
      );
    }
  }
}

final buyerService = BuyerService();

