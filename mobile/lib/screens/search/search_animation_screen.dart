import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/app_models.dart';
import '../../providers/search_provider.dart';
import '../../providers/language_provider.dart';
import '../../localization/app_strings.dart';
import '../../widgets/search_radar_animation.dart';
import 'results_screen.dart';

class SearchAnimationScreen extends StatefulWidget {
  final RecommendationRequest request;

  const SearchAnimationScreen({super.key, required this.request});

  @override
  State<SearchAnimationScreen> createState() => _SearchAnimationScreenState();
}

class _SearchAnimationScreenState extends State<SearchAnimationScreen> {
  int _logIndex = 0;
  List<String> _currentLogs = [];
  bool _navigating = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _startSearchFlow();
    });
  }

  Future<void> _startSearchFlow() async {
    final searchProv = context.read<SearchProvider>();
    final lang = context.read<LanguageProvider>().langCode;

    // Start background API call
    final searchFuture = searchProv.runSearch(widget.request);

    // Simulate animated logs while waiting
    final logs = [
      AppStrings.get('scanning_radius', lang, params: {'radius': '45'}),
      AppStrings.get('markets_found', lang, params: {'count': '5'}),
      AppStrings.get('expanding', lang),
      AppStrings.get('scanning_radius', lang, params: {'radius': '90'}),
      AppStrings.get('markets_found', lang, params: {'count': '12'}),
      AppStrings.get('calculating', lang),
      AppStrings.get('comparing', lang),
    ];

    for (int i = 0; i < logs.length; i++) {
      await Future.delayed(const Duration(milliseconds: 800));
      if (!mounted) return;
      setState(() {
        _logIndex = i;
        _currentLogs.insert(0, logs[i]);
      });
    }

    // Wait for the actual API to finish if it hasn't
    await searchFuture;

    if (!mounted || _navigating) return;
    _navigating = true;

    if (searchProv.state == SearchState.done && searchProv.result != null) {
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (_, __, ___) => const ResultsScreen(),
          transitionsBuilder: (_, anim, __, child) =>
              FadeTransition(opacity: anim, child: child),
        ),
      );
    } else if (searchProv.state == SearchState.error) {
      // Fallback/Error UI
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(searchProv.errorMessage)),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>().langCode;

    return Scaffold(
      backgroundColor: const Color(0xFFFFF8E1),
      body: Center(
        child: SearchRadarAnimation(
          statusText: AppStrings.get('searching', lang),
          logLines: _currentLogs,
        ),
      ),
    );
  }
}
