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
  String get _baseUrl => AppConfig.baseUrl;
  final Duration _timeout = const Duration(seconds: 15);

  Future<Map<String, dynamic>> get(String path, {Map<String, String>? query}) async {
    Uri uri = Uri.parse('$_baseUrl$path');
    if (query != null) uri = uri.replace(queryParameters: query);

    try {
      final response = await http.get(uri).timeout(_timeout);
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: $e');
    }
  }

  Future<Map<String, dynamic>> post(String path, Map<String, dynamic> body) async {
    final uri = Uri.parse('$_baseUrl$path');
    try {
      final response = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode(body),
      ).timeout(_timeout);
      return _handleResponse(response);
    } catch (e) {
      if (e is ApiException) rethrow;
      throw ApiException('Network error: $e');
    }
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
