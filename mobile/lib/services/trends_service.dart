import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/trend_model.dart';
import 'api_service.dart';

class TrendsResponse {
  final List<MarketTrendItem> items;
  final TrendSummary? summary;
  final String source;

  TrendsResponse({
    required this.items,
    this.summary,
    required this.source,
  });
}

class TrendsService {
  static const String _supabaseUrl =
      'https://ucgwzgbcjmzmnrdnjlhl.supabase.co/rest/v1/day_prices_between_01_08_2026_31_08_2026';
  static const String _supabaseKey =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZ3d6Z2Jjam16bW5yZG5qbGhsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTQ2ODMxOCwiZXhwIjoyMTA3MDQ0MzE4fQ.3Dl_v8PBcVuHTPtkwMT1CDnNrxvXyrpJzcCrLJWHi84';

  Future<TrendsResponse> getTrends({String crop = '', String market = '', int limit = 60}) async {
    final cleanCrop = crop.trim();
    final cleanMarket = market.trim();

    // 1. Try Backend API first
    try {
      final query = <String, String>{};
      if (cleanCrop.isNotEmpty) query['crop'] = cleanCrop;
      if (cleanMarket.isNotEmpty) query['market'] = cleanMarket;
      query['limit'] = limit.toString();

      final data = await apiService.get('/markets/trends', query: query);
      final rawList = data['trends'] as List<dynamic>? ?? [];
      final items = rawList.map((e) => MarketTrendItem.fromJson(e as Map<String, dynamic>)).toList();
      final summary = data['summary'] != null
          ? TrendSummary.fromJson(data['summary'] as Map<String, dynamic>)
          : null;

      return TrendsResponse(
        items: items,
        summary: summary,
        source: data['source']?.toString() ?? 'Live Backend',
      );
    } catch (e) {
      // Backend unavailable; fall back to direct Supabase REST query
    }

    // 2. Direct Supabase Query (Fail-Safe directly from DB)
    return await _fetchDirectFromSupabase(crop: cleanCrop, market: cleanMarket, limit: limit);
  }

  Future<TrendsResponse> _fetchDirectFromSupabase({
    String crop = '',
    String market = '',
    int limit = 60,
  }) async {
    try {
      var urlStr = '$_supabaseUrl?select=*&order=DDate.desc&limit=$limit';
      if (crop.isNotEmpty) {
        urlStr += '&or=(CommName.ilike.*${Uri.encodeComponent(crop)}*,commodity.ilike.*${Uri.encodeComponent(crop)}*)';
      }
      if (market.isNotEmpty) {
        urlStr += '&or=(YardName.ilike.*${Uri.encodeComponent(market)}*,yard_name.ilike.*${Uri.encodeComponent(market)}*,AmcName.ilike.*${Uri.encodeComponent(market)}*)';
      }

      final uri = Uri.parse(urlStr);
      final response = await http.get(
        uri,
        headers: {
          'apikey': _supabaseKey,
          'Authorization': 'Bearer $_supabaseKey',
          'Content-Type': 'application/json',
        },
      ).timeout(const Duration(seconds: 8));

      if (response.statusCode >= 200 && response.statusCode < 300) {
        final decoded = jsonDecode(response.body);
        if (decoded is List) {
          final items = decoded.map((e) => MarketTrendItem.fromJson(e as Map<String, dynamic>)).toList();

          // Calculate summary locally
          TrendSummary? summary;
          if (items.isNotEmpty) {
            final modalPrices = items.map((x) => x.modalPriceKg).where((p) => p > 0).toList();
            final latestPrice = modalPrices.isNotEmpty ? modalPrices.first : 0.0;
            final avgPrice = modalPrices.isNotEmpty
                ? modalPrices.reduce((a, b) => a + b) / modalPrices.length
                : latestPrice;
            final minPrice = items.map((x) => x.minPriceKg).where((p) => p > 0).reduce((a, b) => a < b ? a : b);
            final maxPrice = items.map((x) => x.maxPriceKg).where((p) => p > 0).reduce((a, b) => a > b ? a : b);
            final prevPrice = modalPrices.length > 1 ? modalPrices[1] : avgPrice;
            final changePct = prevPrice > 0 ? ((latestPrice - prevPrice) / prevPrice) * 100 : 0.0;

            summary = TrendSummary(
              crop: crop.isNotEmpty ? crop : 'All Commodities',
              market: market.isNotEmpty ? market : 'Telangana Mandis',
              latestModalPriceKg: latestPrice,
              avgModalPriceKg: double.parse(avgPrice.toStringAsFixed(2)),
              minPriceKg: minPrice,
              maxPriceKg: maxPrice,
              changePct: double.parse(changePct.toStringAsFixed(1)),
              trendDirection: changePct > 0 ? 'up' : changePct < 0 ? 'down' : 'stable',
              totalArrivalsQuintals: items.fold(0.0, (acc, item) => acc + item.arrivalsQuintal),
              recordCount: items.length,
            );
          }

          return TrendsResponse(
            items: items,
            summary: summary,
            source: 'Supabase (day_prices table)',
          );
        }
      }
    } catch (_) {}

    return TrendsResponse(items: [], summary: null, source: 'Empty');
  }
}

final trendsService = TrendsService();
