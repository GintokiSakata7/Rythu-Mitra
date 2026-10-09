import 'dart:convert';
import 'package:http/http.dart' as http;
import '../core/config/app_config.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;
  ApiException(this.message, {this.statusCode});
  @override
  String toString() => message;
}

class ApiService {
  final List<String> _baseUrls = [
    AppConfig.baseUrl,
    'http://127.0.0.1:4000/api',
    'http://10.0.2.2:4000/api',
  ];
  String _activeBaseUrl = AppConfig.baseUrl;
  final Duration _timeout = const Duration(seconds: 10);

  Future<Map<String, dynamic>> get(String path, {Map<String, String>? query}) async {
    dynamic lastError;
    for (final base in [_activeBaseUrl, ..._baseUrls.where((u) => u != _activeBaseUrl)]) {
      try {
        Uri uri = Uri.parse('$base$path');
        if (query != null) uri = uri.replace(queryParameters: query);
        final response = await http.get(uri).timeout(_timeout);
        final result = _handleResponse(response);
        _activeBaseUrl = base;
        return result;
      } catch (e) {
        lastError = e;
      }
    }
    if (lastError is ApiException) throw lastError;
    throw ApiException('Network error: $lastError');
  }

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body) async {
    dynamic lastError;
    for (final base in [_activeBaseUrl, ..._baseUrls.where((u) => u != _activeBaseUrl)]) {
      try {
        final uri = Uri.parse('$base$path');
        final response = await http.post(
          uri,
          headers: {'Content-Type': 'application/json'},
          body: jsonEncode(body),
        ).timeout(_timeout);
        final result = _handleResponse(response);
        _activeBaseUrl = base;
        return result;
      } catch (e) {
        lastError = e;
      }
    }
    if (lastError is ApiException) throw lastError;
    throw ApiException('Network error: $lastError');
  }

  Map<String, dynamic> _handleResponse(http.Response response) {
    final data = jsonDecode(response.body) as Map<String, dynamic>;
    if (response.statusCode >= 400) {
      throw ApiException(data['error']?.toString() ?? 'Request failed', statusCode: response.statusCode);
    }
    return data;
  }
}

// Singleton instance
final apiService = ApiService();
