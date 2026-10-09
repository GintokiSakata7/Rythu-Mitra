import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/currency_formatter.dart';
import '../../models/app_models.dart';
import '../../localization/app_strings.dart';
import '../../providers/language_provider.dart';

class MarketDetailsScreen extends StatelessWidget {
  final MarketModel market;
  final String? explanation;

  const MarketDetailsScreen({super.key, required this.market, this.explanation});

  Future<void> _launchMaps() async {
    if (market.latitude != null && market.longitude != null) {
      final lat = market.latitude!;
      final lng = market.longitude!;
      
      // Try Android navigation intent
      final url = Uri.parse('google.navigation:q=$lat,$lng');
      if (await canLaunchUrl(url)) {
        await launchUrl(url);
      } else {
        // Fallback to web directions (works on iOS and Android)
        final webUrl = Uri.parse('https://www.google.com/maps/dir/?api=1&destination=$lat,$lng');
        await launchUrl(webUrl, mode: LaunchMode.externalApplication);
      }
    } else {
      // Fallback to name search if coordinates are missing
      final q = Uri.encodeComponent('${market.displayName}, ${market.displayLocation}');
      final url = Uri.parse('geo:0,0?q=$q');
      if (await canLaunchUrl(url)) {
        await launchUrl(url);
      } else {
        final webUrl = Uri.parse('https://maps.google.com/?q=$q');
        await launchUrl(webUrl, mode: LaunchMode.externalApplication);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>().langCode;
    String s(String k) => AppStrings.get(k, lang);
    final isLoss = market.netRealization < 0;

    return Scaffold(
      appBar: AppBar(
        title: Text(market.displayName),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: isLoss ? const Color(0xFFC62828) : AppTheme.forestGreen,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: (isLoss ? const Color(0xFFC62828) : AppTheme.forestGreen).withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  )
                ],
              ),
              child: Column(
                children: [
                  Text(
                    s(isLoss ? 'net_loss' : 'net_realization'),
                    style: const TextStyle(color: Colors.white70, fontSize: 14),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    market.netRange ?? CurrencyFormatter.format(market.netRealization),
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: market.netRange != null ? 24 : 36,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  if (market.vehicleName != null || market.pickupProvided == true) ...[
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white.withValues(alpha: 0.18),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        '🚚 ${market.localizedVehicleName(lang)} (${market.transportRange ?? "Free"})',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      _Stat(
                          icon: Icons.location_on,
                          label: s('distance'),
                          val: '${market.distanceKm.toStringAsFixed(1)} ${s('km')}'),
                      Container(width: 1, height: 30, color: Colors.white24),
                      _Stat(
                          icon: Icons.sell,
                          label: s('price_per_kg'),
                          val: '₹${market.pricePerKg.toStringAsFixed(0)}'),
                      Container(width: 1, height: 30, color: Colors.white24),
                      _Stat(
                          icon: Icons.timer,
                          label: s('travel_time'),
                          val: '${market.travelHours} ${s('hrs')}'),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // AI Explanation
            if (explanation != null && explanation!.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isLoss ? Colors.amber.shade50 : AppTheme.harvestGold.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: isLoss ? Colors.amber.shade400 : AppTheme.harvestGold.withValues(alpha: 0.3)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Icon(isLoss ? Icons.warning_amber_rounded : Icons.auto_awesome,
                            color: isLoss ? Colors.amber.shade900 : AppTheme.harvestGold, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          s('why_recommended'),
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            color: isLoss ? Colors.amber.shade900 : Colors.black87,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text(
                      explanation!,
                      style: const TextStyle(
                          fontSize: 14, color: Colors.black87, height: 1.5),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
            ],

            // Cost Ledger
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE0E0E0)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _LedgerRow(s('gross_revenue'), market.saleValue, isPositive: true),
                  const Divider(height: 24),
                  _LedgerRow(
                    market.localizedVehicleName(lang),
                    market.transportCost,
                    isPositive: market.transportCost == 0,
                    sub: market.pickupProvided == true
                        ? 'Free Farmgate Pickup'
                        : 'Round-trip logistics',
                    customValue: market.transportRange != null
                        ? (market.transportCost == 0
                            ? market.transportRange
                            : '− ${market.transportRange}')
                        : null,
                  ),
                  _LedgerRow(s('time_cost'), market.timeCost, isPositive: false),
                  _LedgerRow(s('expected_loss'), market.riskCost, isPositive: false),
                  const Divider(height: 24, thickness: 2),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        s(isLoss ? 'net_loss' : 'net_realization'),
                        style: const TextStyle(
                            fontSize: 18, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        market.netRange ?? CurrencyFormatter.format(market.netRealization),
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: isLoss ? AppTheme.dangerRed : AppTheme.successGreen,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Action
            ElevatedButton.icon(
              onPressed: _launchMaps,
              icon: const Icon(Icons.directions),
              label: Text(s('get_directions')),
            ),
            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }
}

class _Stat extends StatelessWidget {
  final IconData icon;
  final String label;
  final String val;

  const _Stat({required this.icon, required this.label, required this.val});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: Colors.white70, size: 20),
        const SizedBox(height: 4),
        Text(val,
            style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 15)),
        Text(label, style: const TextStyle(color: Colors.white60, fontSize: 11)),
      ],
    );
  }
}

class _LedgerRow extends StatelessWidget {
  final String label;
  final double amount;
  final bool isPositive;
  final String? customValue;
  final String? sub;

  const _LedgerRow(
    this.label,
    this.amount, {
    required this.isPositive,
    this.customValue,
    this.sub,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(label,
                    style: const TextStyle(fontSize: 15, color: Colors.black87)),
                if (sub != null)
                  Text(sub!,
                      style: const TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
          ),
          Text(
            customValue ?? '${isPositive ? "" : "− "}${CurrencyFormatter.format(amount)}',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.w600,
              color: isPositive ? AppTheme.successGreen : AppTheme.dangerRed,
            ),
          ),
        ],
      ),
    );
  }
}
