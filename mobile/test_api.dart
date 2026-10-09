import 'dart:convert';
import 'dart:io';

void main() async {
  final baseUrl = 'https://mandi-mitra-nbtv.onrender.com/api';
  
  print('--- Testing Backend APIs ---');
  print('Base URL: $baseUrl\n');

  try {
    print('1. Testing /health endpoint...');
    final healthRes = await HttpClient().getUrl(Uri.parse('$baseUrl/health')).then((req) => req.close());
    final healthBody = await healthRes.transform(utf8.decoder).join();
    print('Status Code: ${healthRes.statusCode}');
    print('Response: $healthBody\n');
  } catch(e) {
    print('Error hitting health endpoint: $e\n');
  }

  try {
    print('2. Testing /buyers/requirements endpoint...');
    final buyersRes = await HttpClient().getUrl(Uri.parse('$baseUrl/buyers/requirements')).then((req) => req.close());
    final buyersBody = await buyersRes.transform(utf8.decoder).join();
    print('Status Code: ${buyersRes.statusCode}');
    print('Response: ${buyersBody.substring(0, buyersBody.length > 200 ? 200 : buyersBody.length)}... (truncated)\n');
  } catch(e) {
    print('Error hitting buyers endpoint: $e\n');
  }
}
