import os

# Define the base directory
BASE_DIR = r"c:\Users\janak\OneDrive\Desktop\mandi-mitra\mobile"

def create_file(path, content):
    full_path = os.path.join(BASE_DIR, path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)
    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)

pubspec_content = """name: mandi_mitra_mobile
description: "MandiMitra - Smart agricultural marketplace assistant."
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: ^3.0.0

dependencies:
  flutter:
    sdk: flutter
  provider: ^6.1.2
  http: ^1.2.1
  geolocator: ^13.0.1
  shared_preferences: ^2.2.3

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0

flutter:
  uses-material-design: true
"""

main_content = """import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'core/theme/app_theme.dart';
import 'screens/splash/splash_screen.dart';
import 'services/optimizer_service.dart';

void main() {
  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => OptimizerService()),
      ],
      child: const MandiMitraApp(),
    ),
  );
}

class MandiMitraApp extends StatelessWidget {
  const MandiMitraApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MandiMitra',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const SplashScreen(),
      debugShowCheckedModeBanner: false,
    );
  }
}
"""

theme_content = """import 'package:flutter/material.dart';

class AppTheme {
  static const Color primaryColor = Color(0xFF2E7D32); // Farm Green
  static const Color secondaryColor = Color(0xFFF9A825); // Harvest Gold
  static const Color surfaceColor = Color(0xFFF1F8E9);
  
  static ThemeData get lightTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        primary: primaryColor,
        secondary: secondaryColor,
        surface: surfaceColor,
      ),
      appBarTheme: const AppBarTheme(
        centerTitle: true,
        backgroundColor: primaryColor,
        foregroundColor: Colors.white,
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 24),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: primaryColor,
        brightness: Brightness.dark,
        primary: primaryColor,
        secondary: secondaryColor,
      ),
    );
  }
}
"""

models_content = """class Market {
  final String id;
  final String name;
  final double lat;
  final double lng;
  final double pricePerQuintal;

  Market({
    required this.id,
    required this.name,
    required this.lat,
    required this.lng,
    required this.pricePerQuintal,
  });
}

class SearchParams {
  final String crop;
  final int quantityKg;
  final double farmerLat;
  final double farmerLng;
  final bool hasOwnVehicle;

  SearchParams({
    required this.crop,
    required this.quantityKg,
    required this.farmerLat,
    required this.farmerLng,
    required this.hasOwnVehicle,
  });
}

class OptimizationResult {
  final Market market;
  final double distanceKm;
  final double grossRevenue;
  final double transportCost;
  final double timeCost;
  final double spoilageCost;
  final double netRealization;
  final bool isBest;
  final String explanation;

  OptimizationResult({
    required this.market,
    required this.distanceKm,
    required this.grossRevenue,
    required this.transportCost,
    required this.timeCost,
    required this.spoilageCost,
    required this.netRealization,
    this.isBest = false,
    this.explanation = "",
  });
}
"""

optimizer_service_content = """import 'package:flutter/foundation.dart';
import 'dart:math';
import '../models/app_models.dart';

class OptimizerService extends ChangeNotifier {
  bool isSearching = false;
  List<OptimizationResult> results = [];
  OptimizationResult? bestResult;

  // Seeded fallback data for demonstration
  final List<Market> mockMarkets = [
    Market(id: '1', name: 'Gaddiannaram', lat: 17.37, lng: 78.53, pricePerQuintal: 2850),
    Market(id: '2', name: 'Bowenpally', lat: 17.46, lng: 78.48, pricePerQuintal: 2900),
    Market(id: '3', name: 'Suryapet', lat: 17.14, lng: 79.62, pricePerQuintal: 2600),
    Market(id: '4', name: 'Warangal', lat: 17.97, lng: 79.59, pricePerQuintal: 3100),
  ];

  Future<void> findBestMarket(SearchParams params) async {
    isSearching = true;
    notifyListeners();

    // Simulate adaptive radius search and network delay
    await Future.delayed(const Duration(seconds: 2));

    List<OptimizationResult> tempResults = [];

    for (var market in mockMarkets) {
      double dist = _calculateDistance(params.farmerLat, params.farmerLng, market.lat, market.lng);
      
      // Calculations
      double gross = (market.pricePerQuintal / 100) * params.quantityKg;
      double transport = params.hasOwnVehicle ? (dist * 12) : (dist * 20); // Rs per km
      double time = dist * 2; // Time cost proxy
      double spoilage = dist > 50 ? (gross * 0.02) : (gross * 0.005); // Risk cost
      
      double net = gross - transport - time - spoilage;
      
      tempResults.add(OptimizationResult(
        market: market,
        distanceKm: dist,
        grossRevenue: gross,
        transportCost: transport,
        timeCost: time,
        spoilageCost: spoilage,
        netRealization: net,
      ));
    }

    // Sort by net realization
    tempResults.sort((a, b) => b.netRealization.compareTo(a.netRealization));
    
    // Assign best
    results = tempResults.map((r) {
      if (r == tempResults.first) {
        return OptimizationResult(
          market: r.market,
          distanceKm: r.distanceKm,
          grossRevenue: r.grossRevenue,
          transportCost: r.transportCost,
          timeCost: r.timeCost,
          spoilageCost: r.spoilageCost,
          netRealization: r.netRealization,
          isBest: true,
          explanation: "\${r.market.name} offers the highest net realization of ₹\${r.netRealization.toStringAsFixed(0)}. Although transportation costs ₹\${r.transportCost.toStringAsFixed(0)}, the higher market price fully compensates for it."
        );
      }
      return r;
    }).toList();

    bestResult = results.first;
    isSearching = false;
    notifyListeners();
  }

  double _calculateDistance(double lat1, double lon1, double lat2, double lon2) {
    var p = 0.017453292519943295;
    var c = cos;
    var a = 0.5 - c((lat2 - lat1) * p) / 2 + 
            c(lat1 * p) * c(lat2 * p) * 
            (1 - c((lon2 - lon1) * p)) / 2;
    return 12742 * asin(sqrt(a));
  }
}
"""

splash_content = """import 'package:flutter/material.dart';
import '../language/language_screen.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Future.delayed(const Duration(seconds: 2), () {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LanguageScreen()),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: Color(0xFF2E7D32),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.agriculture, size: 100, color: Colors.white),
            SizedBox(height: 20),
            Text('MandiMitra', style: TextStyle(fontSize: 32, color: Colors.white, fontWeight: FontWeight.bold)),
            SizedBox(height: 10),
            Text('Smart Market Assistant', style: TextStyle(fontSize: 16, color: Colors.white70)),
          ],
        ),
      ),
    );
  }
}
"""

language_content = """import 'package:flutter/material.dart';
import '../home/home_screen.dart';

class LanguageScreen extends StatelessWidget {
  const LanguageScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Choose Language')),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('మాట్లాడటానికి మీ ఇష్టమైన భాషను ఎంచుకోండి', textAlign: TextAlign.center, style: TextStyle(fontSize: 18)),
            const SizedBox(height: 30),
            _langBtn(context, 'తెలుగు', 'Telugu'),
            const SizedBox(height: 16),
            _langBtn(context, 'हिंदी', 'Hindi'),
            const SizedBox(height: 16),
            _langBtn(context, 'English', 'English'),
          ],
        ),
      ),
    );
  }

  Widget _langBtn(BuildContext context, String native, String eng) {
    return ElevatedButton(
      onPressed: () {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (_) => const HomeScreen()),
        );
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(vertical: 12.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(native, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(width: 8),
            Text('($eng)', style: const TextStyle(fontSize: 16)),
          ],
        ),
      ),
    );
  }
}
"""

home_content = """import 'package:flutter/material.dart';
import '../crop_selection/crop_selection_screen.dart';
import '../assistant/assistant_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('MandiMitra Dashboard'),
        actions: [
          IconButton(icon: const Icon(Icons.person), onPressed: () {}),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Welcome Farmer!', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            const Row(
              children: [
                Icon(Icons.location_on, color: Colors.grey, size: 18),
                SizedBox(width: 4),
                Text('Nalgonda, Telangana', style: TextStyle(color: Colors.grey, fontSize: 16)),
              ],
            ),
            const SizedBox(height: 32),
            
            // Search Produce Button
            InkWell(
              onTap: () {
                Navigator.push(context, MaterialPageRoute(builder: (_) => const CropSelectionScreen()));
              },
              child: Container(
                padding: const EdgeInsets.all(24),
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 10, offset: Offset(0, 4))],
                ),
                child: const Row(
                  children: [
                    Icon(Icons.search, color: Colors.white, size: 32),
                    SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Find Best Market', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
                          Text('Calculate transport & risk', style: TextStyle(color: Colors.white70, fontSize: 14)),
                        ],
                      ),
                    ),
                    Icon(Icons.arrow_forward_ios, color: Colors.white),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 24),
            const Text('Recent Prices Near You', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            
            _priceCard('Tomato', '₹2,500 - ₹3,100 / qtl', Icons.eco),
            const SizedBox(height: 8),
            _priceCard('Cotton', '₹7,200 - ₹7,800 / qtl', Icons.cloud),
            
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(context, MaterialPageRoute(builder: (_) => const AssistantScreen()));
        },
        icon: const Icon(Icons.mic),
        label: const Text('Voice Assistant'),
        backgroundColor: Theme.of(context).colorScheme.secondary,
      ),
    );
  }

  Widget _priceCard(String crop, String price, IconData icon) {
    return Card(
      elevation: 2,
      child: ListTile(
        leading: CircleAvatar(backgroundColor: Colors.green.shade100, child: Icon(icon, color: Colors.green.shade800)),
        title: Text(crop, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text('Avg: $price'),
        trailing: const Icon(Icons.trending_up, color: Colors.green),
      ),
    );
  }
}
"""

crop_selection_content = """import 'package:flutter/material.dart';
import '../../models/app_models.dart';
import 'package:provider/provider.dart';
import '../../services/optimizer_service.dart';
import '../results/results_screen.dart';

class CropSelectionScreen extends StatefulWidget {
  const CropSelectionScreen({super.key});

  @override
  State<CropSelectionScreen> createState() => _CropSelectionScreenState();
}

class _CropSelectionScreenState extends State<CropSelectionScreen> {
  String crop = 'Tomato';
  double quantity = 5000;
  bool ownVehicle = true;

  void _submit() {
    // Hardcoded farmer location for demo
    final params = SearchParams(
      crop: crop,
      quantityKg: quantity.toInt(),
      farmerLat: 17.05, 
      farmerLng: 79.27,
      hasOwnVehicle: ownVehicle,
    );

    final optimizer = Provider.of<OptimizerService>(context, listen: false);
    optimizer.findBestMarket(params);

    Navigator.push(context, MaterialPageRoute(builder: (_) => const ResultsScreen()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Enter Details')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text('Crop', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          DropdownButtonFormField<String>(
            value: crop,
            items: ['Tomato', 'Onion', 'Potato', 'Cotton'].map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
            onChanged: (v) => setState(() => crop = v!),
          ),
          const SizedBox(height: 20),
          
          Text('Quantity: \${quantity.toInt()} kg', style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          Slider(
            value: quantity,
            min: 100,
            max: 20000,
            divisions: 199,
            label: '\${quantity.toInt()} kg',
            onChanged: (v) => setState(() => quantity = v),
          ),
          const SizedBox(height: 20),
          
          const Text('Transportation', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          SwitchListTile(
            title: const Text('I have my own vehicle'),
            value: ownVehicle,
            onChanged: (v) => setState(() => ownVehicle = v),
          ),
          const SizedBox(height: 40),
          
          ElevatedButton(
            onPressed: _submit,
            child: const Text('Find Most Profitable Market', style: TextStyle(fontSize: 18)),
          ),
        ],
      ),
    );
  }
}
"""

results_content = """import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../services/optimizer_service.dart';
import '../../widgets/market_card.dart';

class ResultsScreen extends StatelessWidget {
  const ResultsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Recommended Markets')),
      body: Consumer<OptimizerService>(
        builder: (context, optimizer, child) {
          if (optimizer.isSearching) {
            return _buildLoading();
          }

          if (optimizer.results.isEmpty) {
            return const Center(child: Text('No markets found'));
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: optimizer.results.length,
            itemBuilder: (context, index) {
              final result = optimizer.results[index];
              return MarketCard(result: result);
            },
          );
        },
      ),
    );
  }

  Widget _buildLoading() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          CircularProgressIndicator(),
          SizedBox(height: 20),
          Text('Adaptive Radius Search...'),
          Text('Scanning 10km...', style: TextStyle(color: Colors.grey)),
          Text('Expanding to 50km...', style: TextStyle(color: Colors.grey)),
          Text('Calculating transport & risk costs...', style: TextStyle(color: Colors.grey)),
        ],
      ),
    );
  }
}
"""

market_card_content = """import 'package:flutter/material.dart';
import '../models/app_models.dart';

class MarketCard extends StatelessWidget {
  final OptimizationResult result;

  const MarketCard({super.key, required this.result});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: result.isBest ? 4 : 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(
          color: result.isBest ? Colors.green : Colors.transparent,
          width: 2,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (result.isBest)
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.green.shade100,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(Icons.emoji_events, color: Colors.green, size: 16),
                    SizedBox(width: 4),
                    Text('Best Net Profit', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(result.market.name, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                Text('₹\${result.netRealization.toStringAsFixed(0)}', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Colors.green)),
              ],
            ),
            Text('Distance: \${result.distanceKm.toStringAsFixed(1)} km | Price: ₹\${result.market.pricePerQuintal}/qtl', style: const TextStyle(color: Colors.grey)),
            
            const Divider(height: 24),
            
            _costRow('Gross Revenue', result.grossRevenue, true),
            _costRow('Transport Cost', -result.transportCost, false),
            _costRow('Time Cost', -result.timeCost, false),
            _costRow('Expected Loss', -result.spoilageCost, false),
            
            const Divider(),
            _costRow('Net Realization', result.netRealization, true, isBold: true),

            if (result.isBest && result.explanation.isNotEmpty)
               Container(
                 margin: const EdgeInsets.top(16),
                 padding: const EdgeInsets.all(12),
                 decoration: BoxDecoration(
                   color: Colors.blue.shade50,
                   borderRadius: BorderRadius.circular(8),
                   border: BorderSide(color: Colors.blue.shade200),
                 ),
                 child: Row(
                   crossAxisAlignment: CrossAxisAlignment.start,
                   children: [
                     const Icon(Icons.auto_awesome, color: Colors.blue, size: 20),
                     const SizedBox(width: 8),
                     Expanded(child: Text(result.explanation, style: TextStyle(color: Colors.blue.shade900, fontSize: 13))),
                   ],
                 ),
               )
          ],
        ),
      ),
    );
  }

  Widget _costRow(String label, double amount, bool isPositive, {bool isBold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
          Text(
            '\${amount < 0 ? '-' : ''}₹\${amount.abs().toStringAsFixed(0)}',
            style: TextStyle(
              color: isPositive ? Colors.green : Colors.red,
              fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }
}
"""

assistant_content = """import 'package:flutter/material.dart';

class AssistantScreen extends StatelessWidget {
  const AssistantScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Voice Assistant')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.mic, size: 80, color: Colors.green),
            const SizedBox(height: 20),
            const Text('Listening...', style: TextStyle(fontSize: 24)),
            const SizedBox(height: 10),
            const Text('Speak your crop, quantity, and location', style: TextStyle(color: Colors.grey)),
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel'),
            )
          ],
        ),
      ),
    );
  }
}
"""

# Write files
create_file("pubspec.yaml", pubspec_content)
create_file("lib/main.dart", main_content)
create_file("lib/core/theme/app_theme.dart", theme_content)
create_file("lib/models/app_models.dart", models_content)
create_file("lib/services/optimizer_service.dart", optimizer_service_content)
create_file("lib/screens/splash/splash_screen.dart", splash_content)
create_file("lib/screens/language/language_screen.dart", language_content)
create_file("lib/screens/home/home_screen.dart", home_content)
create_file("lib/screens/crop_selection/crop_selection_screen.dart", crop_selection_content)
create_file("lib/screens/results/results_screen.dart", results_content)
create_file("lib/widgets/market_card.dart", market_card_content)
create_file("lib/screens/assistant/assistant_screen.dart", assistant_content)

print("Scaffolding complete!")
