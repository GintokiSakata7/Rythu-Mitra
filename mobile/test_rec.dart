import 'dart:convert';
import 'dart:io';

void main() async {
  final baseUrl = 'https://mandi-mitra-nbtv.onrender.com/api';
  
  print('--- Testing Recommendations API ---');
  try {
    final req = await HttpClient().postUrl(Uri.parse('$baseUrl/recommendations'));
    req.headers.contentType = ContentType.json;
    req.write(jsonEncode({
      "crop": "Tomato",
      "quantityKg": 20000, // 200 quintals = 20000 kg
      "latitude": 17.2473,
      "longitude": 80.1514,
      "locationText": "Khammam",
      "hasTransport": false,
      "language": "en"
    }));
    
    final response = await req.close();
    final body = await response.transform(utf8.decoder).join();
    
    // Pretty print the JSON response
    final decoded = jsonDecode(body);
    print(JsonEncoder.withIndent('  ').convert(decoded));
  } catch(e) {
    print('Error: $e');
  }
}
