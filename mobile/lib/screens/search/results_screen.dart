import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/search_provider.dart';
import '../../providers/language_provider.dart';
import '../../localization/app_strings.dart';
import '../../widgets/market_card.dart';
import '../market_details/market_details_screen.dart';

class ResultsScreen extends StatelessWidget {
  const ResultsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final searchProv = context.watch<SearchProvider>();
    final lang = context.watch<LanguageProvider>().langCode;
    final result = searchProv.result;

    if (result == null) return const Scaffold();

    final s = (String k, {Map<String, String>? params}) =>
        AppStrings.get(k, lang, params: params);

    final isLoss = result.recommendation.netRealization < 0;

    final cleanAlternatives = result.alternatives
        .where((alt) =>
            (alt.id.isEmpty || alt.id != result.recommendation.id) &&
            alt.displayName != result.recommendation.displayName)
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: Text(isLoss ? s('recommendation_warning') : s('best_option')),
        actions: [
          IconButton(
            icon: const Icon(Icons.close),
            onPressed: () {
              searchProv.reset();
              Navigator.popUntil(context, (route) => route.isFirst);
            },
          )
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Metadata Badge
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              margin: const EdgeInsets.only(bottom: 16),
              decoration: BoxDecoration(
                color: isLoss
                    ? Colors.red.withValues(alpha: 0.1)
                    : AppTheme.forestGreen.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    isLoss ? Icons.warning_amber_rounded : Icons.analytics,
                    size: 14,
                    color: isLoss ? AppTheme.dangerRed : AppTheme.forestGreen,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    s('candidates_evaluated', params: {
                      'count': result.search.candidatesEvaluated.toString()
                    }),
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      color: isLoss ? AppTheme.dangerRed : AppTheme.forestGreen,
                    ),
                  ),
                ],
              ),
            ),

            // Best Recommendation
            MarketResultCard(
              market: result.recommendation,
              isBest: true,
              opportunityGain: result.opportunityGain,
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) => MarketDetailsScreen(
                      market: result.recommendation,
                      explanation: result.explanation,
                    ),
                  ),
                );
              },
            ),

            if (cleanAlternatives.isNotEmpty) ...[
              const SizedBox(height: 24),
              Text(
                s('alternatives'),
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 12),

              // Alternatives
              ...cleanAlternatives.map(
                (alt) => MarketResultCard(
                  market: alt,
                  isBest: false,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => MarketDetailsScreen(
                          market: alt,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ],

            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () {
                  searchProv.reset();
                  Navigator.popUntil(context, (route) => route.isFirst);
                },
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  side: const BorderSide(color: AppTheme.forestGreen),
                ),
                child: Text(s('new_search')),
              ),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}
