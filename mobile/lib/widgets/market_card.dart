import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_tts/flutter_tts.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/currency_formatter.dart';
import '../../localization/app_strings.dart';
import '../../providers/language_provider.dart';
import '../../models/app_models.dart';

class MarketResultCard extends StatelessWidget {
  final MarketModel market;
  final bool isBest;
  final double? opportunityGain;
  final VoidCallback? onTap;

  const MarketResultCard({
    super.key,
    required this.market,
    this.isBest = false,
    this.opportunityGain,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>().langCode;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isBest ? AppTheme.harvestGold : const Color(0xFFE8F5E9),
            width: isBest ? 2.5 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: isBest
                  ? AppTheme.harvestGold.withValues(alpha: 0.15)
                  : const Color(0x0A000000),
              blurRadius: isBest ? 16 : 8,
              offset: const Offset(0, 4),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: isBest ? AppTheme.forestGreen : Colors.transparent,
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(18),
                  topRight: Radius.circular(18),
                ),
              ),
              child: Row(
                children: [
                  if (isBest) ...[
                    const Text('🏆', style: TextStyle(fontSize: 20)),
                    const SizedBox(width: 8),
                  ],
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (isBest)
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 2),
                            margin: const EdgeInsets.only(bottom: 4),
                            decoration: BoxDecoration(
                              color: AppTheme.harvestGold,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              AppStrings.get('best_option', lang),
                              style: const TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: Colors.black87,
                              ),
                            ),
                          ),
                        Text(
                          market.displayName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.bold,
                            color: isBest ? Colors.white : Colors.black87,
                          ),
                        ),
                        Row(
                          children: [
                            Icon(Icons.location_on,
                                size: 13,
                                color: isBest ? Colors.white70 : Colors.grey),
                            const SizedBox(width: 2),
                            Expanded(
                              child: Text(
                                '${market.distanceKm.toStringAsFixed(1)} ${AppStrings.get('km', lang)} • ${market.displayLocation}',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(
                                  fontSize: 12,
                                  color: isBest ? Colors.white70 : Colors.grey,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        market.netRange ?? CurrencyFormatter.format(market.netRealization),
                        style: TextStyle(
                          fontSize: market.netRange != null ? 14 : 18,
                          fontWeight: FontWeight.bold,
                          color: isBest ? Colors.white : AppTheme.successGreen,
                        ),
                      ),
                      Text(
                        market.expectedNetPerKgRange != null
                            ? '${market.expectedNetPerKgRange}/kg'
                            : AppStrings.get('net_realization', lang),
                        style: TextStyle(
                          fontSize: 11,
                          color: isBest ? Colors.white70 : Colors.grey,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () async {
                      final tts = FlutterTts();
                      final marketName = market.name;
                      final distance = market.distanceKm.toStringAsFixed(1);
                      final transportCost = market.transportCost.toStringAsFixed(0);
                      final profit = market.netRealization.toStringAsFixed(0);

                      final text = lang == 'te' 
                          ? "${isBest ? "ఉత్తమ " : ""}మార్కెట్ $marketName. ఇది $distance కిలోమీటర్ల దూరంలో ఉంది. రవాణా ఖర్చు $transportCost రూపాయలు, మరియు మీ నికర లాభం $profit రూపాయలు." 
                          : lang == 'hi' 
                              ? "${isBest ? "सबसे अच्छा " : ""}बाज़ार $marketName है। यह $distance किलोमीटर दूर है। परिवहन खर्च $transportCost रुपये है और आपका शुद्ध लाभ $profit रुपये होगा।" 
                              : "The ${isBest ? "best " : ""}market is $marketName. It is $distance kilometers away. The transport cost is $transportCost rupees, and your net profit will be $profit rupees.";
                      
                      String ttsLang = 'en-US';
                      if (lang == 'te') ttsLang = 'te-IN';
                      if (lang == 'hi') ttsLang = 'hi-IN';
                      
                      try {
                        final res = await tts.setLanguage(ttsLang);
                        if (res != 1 && res != true) {
                          await tts.setLanguage('en-IN');
                        }
                        await tts.speak(text);
                      } catch (_) {}
                    },
                    child: Container(
                      padding: const EdgeInsets.all(6),
                      decoration: BoxDecoration(
                        color: isBest ? Colors.white.withValues(alpha: 0.2) : AppTheme.forestGreen.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.volume_up, color: isBest ? Colors.white : AppTheme.forestGreen, size: 24),
                    ),
                  ),

                ],
              ),
            ),

            // Cost breakdown
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _breakdownRow(
                    AppStrings.get('gross_revenue', lang),
                    market.saleValue,
                    isPositive: true,
                    sub: '₹${market.pricePerKg.toStringAsFixed(0)}/kg',
                  ),
                  _breakdownRow(
                    market.localizedVehicleName(lang),
                    -market.transportCost,
                    isPositive: market.transportCost == 0,
                    sub: market.pickupProvided == true
                        ? AppStrings.get('free_pickup', lang)
                        : (market.vehicleName != null ? AppStrings.get('round_trip', lang) : null),
                    customValue: market.transportRange != null
                        ? (market.transportCost == 0
                            ? market.transportRange
                            : '− ${market.transportRange}')
                        : null,
                  ),
                  _breakdownRow(
                    AppStrings.get('time_cost', lang),
                    -market.timeCost,
                    isPositive: false,
                    sub: '${market.travelHours} ${AppStrings.get('hrs', lang)}',
                  ),
                  _breakdownRow(
                    AppStrings.get('expected_loss', lang),
                    -market.riskCost,
                    isPositive: false,
                  ),
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        AppStrings.get('net_realization', lang),
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                      Text(
                        market.netRange ?? CurrencyFormatter.format(market.netRealization),
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                          color: AppTheme.successGreen,
                        ),
                      ),
                    ],
                  ),

                  // Opportunity gain
                  if (isBest && opportunityGain != null && opportunityGain! > 0) ...[
                    const SizedBox(height: 12),
                    Container(
                      padding: const EdgeInsets.symmetric(
                          horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE8F5E9),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Row(
                        children: [
                          const Icon(Icons.trending_up,
                              color: AppTheme.successGreen, size: 18),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              AppStrings.get('you_earn_more', lang, params: {
                                'amount': CurrencyFormatter.format(opportunityGain!)
                              }),
                              style: const TextStyle(
                                fontSize: 13,
                                color: AppTheme.successGreen,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],

                  if (onTap != null) ...[
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: OutlinedButton(
                        onPressed: onTap,
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppTheme.forestGreen),
                          foregroundColor: AppTheme.forestGreen,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                        ),
                        child: Text(AppStrings.get('view_details', lang)),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _breakdownRow(String label, double amount,
      {required bool isPositive, String? sub, String? customValue}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style:
                        const TextStyle(fontSize: 13, color: Colors.black54)),
                if (sub != null)
                  Text(sub,
                      style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ],
            ),
          ),
          Text(
            customValue ?? '${amount < 0 ? "-" : ""}${CurrencyFormatter.format(amount.abs())}',
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: isPositive ? AppTheme.successGreen : AppTheme.dangerRed,
            ),
          ),
        ],
      ),
    );
  }
}
