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
    final isLoss = market.netRealization < 0;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isBest
                ? (isLoss ? Colors.red.shade400 : AppTheme.harvestGold)
                : (isLoss ? Colors.red.shade200 : const Color(0xFFE8F5E9)),
            width: isBest ? 2.5 : 1,
          ),
          boxShadow: [
            BoxShadow(
              color: isBest
                  ? (isLoss ? Colors.red.withValues(alpha: 0.15) : AppTheme.harvestGold.withValues(alpha: 0.15))
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
                color: isBest
                    ? (isLoss ? const Color(0xFFC62828) : AppTheme.forestGreen)
                    : (isLoss ? Colors.red.shade50 : Colors.transparent),
                borderRadius: const BorderRadius.only(
                  topLeft: Radius.circular(18),
                  topRight: Radius.circular(18),
                ),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  if (isBest) ...[
                    Text(isLoss ? '⚠️' : '🏆', style: const TextStyle(fontSize: 20)),
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
                              color: isLoss ? Colors.white.withValues(alpha: 0.25) : AppTheme.harvestGold,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              isLoss
                                  ? AppStrings.get('net_loss_warning', lang)
                                  : AppStrings.get('best_option', lang),
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.bold,
                                color: isLoss ? Colors.white : Colors.black87,
                              ),
                            ),
                          ),
                        Text(
                          market.displayName,
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: isBest ? Colors.white : Colors.black87,
                          ),
                        ),
                        const SizedBox(height: 2),
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
                        if (market.feasibility == 'excessive_distance') ...[
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.red.shade100,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              '⚠️ High Transit Spoilage Risk',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: Colors.red.shade900,
                              ),
                            ),
                          ),
                        ] else if (market.distanceKm <= 40) ...[
                          const SizedBox(height: 4),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: isBest ? Colors.white24 : Colors.green.shade50,
                              borderRadius: BorderRadius.circular(4),
                            ),
                            child: Text(
                              '🟢 Local & Fresh (<40 km)',
                              style: TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.bold,
                                color: isBest ? Colors.white : Colors.green.shade800,
                              ),
                            ),
                          ),
                        ],
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
                          color: isBest
                              ? Colors.white
                              : (isLoss ? AppTheme.dangerRed : AppTheme.successGreen),
                        ),
                      ),
                      Text(
                        market.expectedNetPerKgRange != null
                            ? '${market.expectedNetPerKgRange}/kg'
                            : (isLoss
                                ? AppStrings.get('net_loss', lang)
                                : AppStrings.get('net_realization', lang)),
                        style: TextStyle(
                          fontSize: 11,
                          color: isBest
                              ? Colors.white70
                              : (isLoss ? AppTheme.dangerRed.withValues(alpha: 0.8) : Colors.grey),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: () async {
                      final tts = FlutterTts();
                      final marketName = market.displayName;
                      final distance = market.distanceKm.toStringAsFixed(1);
                      final transportCost = market.transportCost.toStringAsFixed(0);
                      final profit = market.netRealization.abs().toStringAsFixed(0);

                      final text = lang == 'te' 
                          ? (isLoss
                              ? "హెచ్చరిక: $marketName వద్ద రవాణా ఖర్చు $transportCost రూపాయలు. దీని వలన మీకు దాదాపు $profit రూపాయల నికర నష్టం వచ్చే అవకాశం ఉంది. చిన్న పంటకు ఒంటరి వాహనం తీసుకోవద్దు."
                              : "${isBest ? "ఉత్తమ " : ""}మార్కెట్ $marketName. ఇది $distance కిలోమీటర్ల దూరంలో ఉంది. రవాణా ఖర్చు $transportCost రూపాయలు, మరియు మీ నికర లాభం $profit రూపాయలు.") 
                          : lang == 'hi' 
                              ? (isLoss
                                  ? "चेतावनी: $marketName पर ढुलाई खर्च $transportCost रुपये है। इससे आपको लगभग $profit रुपये का शुद्ध नुकसान हो सकता है।"
                                  : "${isBest ? "सबसे अच्छा " : ""}बाज़ार $marketName है। यह $distance किलोमीटर दूर है। परिवहन खर्च $transportCost रुपये है और आपका शुद्ध लाभ $profit रुपये होगा।") 
                              : (isLoss
                                  ? "Warning: Transport to $marketName costs $transportCost rupees, resulting in an estimated net loss of $profit rupees."
                                  : "The ${isBest ? "best " : ""}market is $marketName. It is $distance kilometers away. The transport cost is $transportCost rupees, and your net profit will be $profit rupees.");
                      
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
                        color: isBest ? Colors.white.withValues(alpha: 0.2) : (isLoss ? Colors.red.withValues(alpha: 0.1) : AppTheme.forestGreen.withValues(alpha: 0.1)),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(Icons.volume_up, color: isBest ? Colors.white : (isLoss ? AppTheme.dangerRed : AppTheme.forestGreen), size: 24),
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
                  if (isLoss) ...[
                    Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: Colors.red.shade50,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.red.shade200),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.warning_amber_rounded,
                              color: Colors.red.shade800, size: 20),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              AppStrings.get('loss_advisory', lang),
                              style: TextStyle(
                                fontSize: 11.5,
                                color: Colors.red.shade900,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
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
                        ? 'Free Farmgate Pickup'
                        : (market.vehicleName != null ? 'Round-trip logistics' : null),
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
                    sub: market.spoilageLossPct != null ? '${(market.spoilageLossPct! * 100).toInt()}% transit risk' : null,
                  ),
                  if (market.transitWarning != null) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade50,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.amber.shade300),
                      ),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('⚠️', style: TextStyle(fontSize: 14)),
                          const SizedBox(width: 6),
                          Expanded(
                            child: Text(
                              market.transitWarning!,
                              style: TextStyle(
                                fontSize: 11,
                                color: Colors.amber.shade900,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  const Divider(height: 20),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        isLoss
                            ? AppStrings.get('net_loss', lang)
                            : AppStrings.get('net_realization', lang),
                        style: const TextStyle(
                            fontWeight: FontWeight.bold, fontSize: 15),
                      ),
                      Text(
                        market.netRange ?? CurrencyFormatter.format(market.netRealization),
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 15,
                          color: isLoss ? AppTheme.dangerRed : AppTheme.successGreen,
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
                          side: BorderSide(color: isLoss ? Colors.red.shade700 : AppTheme.forestGreen),
                          foregroundColor: isLoss ? Colors.red.shade700 : AppTheme.forestGreen,
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
