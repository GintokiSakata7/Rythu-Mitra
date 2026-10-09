import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/language_provider.dart';
import '../../providers/trends_provider.dart';
import '../../providers/location_provider.dart';
import '../../models/trend_model.dart';
import '../../models/app_models.dart';
import '../search/search_animation_screen.dart';

class TrendsScreen extends StatefulWidget {
  const TrendsScreen({super.key});

  @override
  State<TrendsScreen> createState() => _TrendsScreenState();
}

class _TrendsScreenState extends State<TrendsScreen> {
  final List<Map<String, String>> _popularCrops = [
    {'name': 'Tomato', 'emoji': '🍅'},
    {'name': 'Green Chillies', 'emoji': '🌶️'},
    {'name': 'Onion', 'emoji': '🧅'},
    {'name': 'Potato', 'emoji': '🥔'},
    {'name': 'Bengal Gram', 'emoji': '🌾'},
    {'name': 'Maize', 'emoji': '🌽'},
    {'name': 'Groundnut pods', 'emoji': '🥜'},
    {'name': 'Cucumber', 'emoji': '🥒'},
    {'name': 'Bitter Gourd', 'emoji': '🥬'},
  ];

  final List<String> _popularMarkets = [
    'All Mandis',
    'Bowenpally',
    'Warangal',
    'Venkateshwar Nagar',
    'Badepally',
    'Bhainsa',
    'Wanaparthy',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<TrendsProvider>().loadTrends();
    });
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>().langCode;
    final prov = context.watch<TrendsProvider>();
    final locProv = context.watch<LocationProvider>();

    return Scaffold(
      backgroundColor: AppTheme.warmCream,
      appBar: AppBar(
        title: Text(
          lang == 'te'
              ? 'మార్కెట్ ధరల ట్రెండ్స్'
              : lang == 'hi'
                  ? 'मंडी मूल्य रुझान'
                  : 'Market Price Trends',
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh trends from DB',
            onPressed: () => prov.loadTrends(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => prov.loadTrends(),
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // Top Header Banner
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                color: Colors.white,
                child: Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: AppTheme.forestGreen.withValues(alpha: 0.1),
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(Icons.trending_up, color: AppTheme.forestGreen, size: 22),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            lang == 'te'
                                ? 'ప్రత్యక్ష తెలంగాణ మార్కెట్ విశ్లేషణ'
                                : 'Telangana APMC Price Trends',
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                          ),
                          Text(
                            'Powered by public.market_prices database table',
                            style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: const Color(0xFFE8F5E9),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.check_circle, size: 12, color: AppTheme.forestGreen),
                          SizedBox(width: 4),
                          Text(
                            'Live DB',
                            style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppTheme.forestGreen),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Crop Filter Pills (Horizontal)
            SliverToBoxAdapter(
              child: Container(
                height: 54,
                color: Colors.white,
                child: ListView.builder(
                  scrollDirection: Axis.horizontal,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  itemCount: _popularCrops.length + 1,
                  itemBuilder: (context, i) {
                    if (i == 0) {
                      final isSelected = prov.selectedCrop.isEmpty;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ChoiceChip(
                          label: const Text('All Crops'),
                          selected: isSelected,
                          onSelected: (_) => prov.selectCrop(''),
                          selectedColor: AppTheme.forestGreen,
                          labelStyle: TextStyle(
                            color: isSelected ? Colors.white : Colors.black87,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                            fontSize: 12,
                          ),
                        ),
                      );
                    }
                    final crop = _popularCrops[i - 1];
                    final isSelected = prov.selectedCrop == crop['name'];
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Text('${crop['emoji']} ${crop['name']}'),
                        selected: isSelected,
                        onSelected: (_) => prov.selectCrop(crop['name']!),
                        selectedColor: AppTheme.forestGreen,
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : Colors.black87,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          fontSize: 12,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            // Market Filter Chips
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                color: Colors.white,
                child: Row(
                  children: [
                    const Icon(Icons.location_on, size: 16, color: Colors.grey),
                    const SizedBox(width: 6),
                    Text(
                      lang == 'te' ? 'మార్కెట్ / నియోజకవర్గం:' : 'Market / Yard:',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black54),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: SingleChildScrollView(
                        scrollDirection: Axis.horizontal,
                        child: Row(
                          children: _popularMarkets.map((m) {
                            final isSel = (m == 'All Mandis' && prov.selectedMarket.isEmpty) ||
                                (prov.selectedMarket == m);
                            return Padding(
                              padding: const EdgeInsets.only(right: 6),
                              child: InkWell(
                                onTap: () => prov.selectMarket(m == 'All Mandis' ? '' : m),
                                borderRadius: BorderRadius.circular(12),
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: isSel ? const Color(0xFFE8F5E9) : const Color(0xFFF5F5F5),
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: isSel ? AppTheme.forestGreen : Colors.transparent,
                                    ),
                                  ),
                                  child: Text(
                                    m,
                                    style: TextStyle(
                                      fontSize: 11.5,
                                      fontWeight: isSel ? FontWeight.bold : FontWeight.normal,
                                      color: isSel ? AppTheme.forestGreen : Colors.black87,
                                    ),
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            const SliverToBoxAdapter(child: Divider(height: 1)),

            // Loading / Error / Content
            if (prov.loading)
              const SliverFillRemaining(
                child: Center(child: CircularProgressIndicator()),
              )
            else if (prov.error.isNotEmpty)
              SliverFillRemaining(
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24.0),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.cloud_off, size: 48, color: Colors.orange),
                        const SizedBox(height: 12),
                        Text(
                          'Database query error:\n${prov.error}',
                          textAlign: TextAlign.center,
                          style: const TextStyle(fontSize: 13),
                        ),
                        const SizedBox(height: 16),
                        ElevatedButton.icon(
                          onPressed: () => prov.loadTrends(),
                          icon: const Icon(Icons.refresh),
                          label: const Text('Retry Query'),
                        ),
                      ],
                    ),
                  ),
                ),
              )
            else if (prov.items.isEmpty)
              SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.search_off, size: 48, color: Colors.grey),
                      const SizedBox(height: 12),
                      Text(
                        'No price records found for ${prov.selectedCrop.isNotEmpty ? prov.selectedCrop : "selected filters"}.',
                        style: const TextStyle(fontSize: 14, color: Colors.black54),
                      ),
                      const SizedBox(height: 16),
                      OutlinedButton(
                        onPressed: () {
                          prov.selectCrop('');
                          prov.selectMarket('');
                        },
                        child: const Text('Show All Market Prices'),
                      ),
                    ],
                  ),
                ),
              )
            else ...[
              // Summary Analytics Card
              if (prov.summary != null)
                SliverToBoxAdapter(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                    child: _SummaryCard(summary: prov.summary!),
                  ),
                ),

              // Section Title
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 8),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Recent Market Arrivals (${prov.items.length})',
                        style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        'Rs/Kg & Rs/Quintal',
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                ),
              ),

              // Recent Prices List
              SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      final item = prov.items[index];
                      return _TrendCard(
                        item: item,
                        onOptimize: () {
                          final req = RecommendationRequest(
                            crop: item.crop,
                            quantityKg: 2000,
                            latitude: locProv.latitude,
                            longitude: locProv.longitude,
                            locationText: locProv.displayName,
                            quality: 'A',
                            hasTransport: false,
                            perishability: 'high',
                            includeBuyers: true,
                            language: context.read<LanguageProvider>().langCode,
                          );
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => SearchAnimationScreen(request: req),
                            ),
                          );
                        },
                      );
                    },
                    childCount: prov.items.length,
                  ),
                ),
              ),

              const SliverToBoxAdapter(child: SizedBox(height: 32)),
            ],
          ],
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final TrendSummary summary;

  const _SummaryCard({required this.summary});

  @override
  Widget build(BuildContext context) {
    final isUp = summary.trendDirection == 'up';
    final trendColor = isUp ? AppTheme.successGreen : AppTheme.dangerRed;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFFE8F5E9)),
        boxShadow: const [
          BoxShadow(color: Color(0x06000000), blurRadius: 10, offset: Offset(0, 3)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${summary.crop} Summary',
                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: trendColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      isUp ? Icons.arrow_upward : Icons.arrow_downward,
                      size: 13,
                      color: trendColor,
                    ),
                    const SizedBox(width: 2),
                    Text(
                      '${summary.changePct > 0 ? "+" : ""}${summary.changePct}% trend',
                      style: TextStyle(
                        fontSize: 11.5,
                        fontWeight: FontWeight.bold,
                        color: trendColor,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: _statBlock(
                  'Latest Modal',
                  '₹${summary.latestModalPriceKg}/kg',
                  subtitle: '₹${(summary.latestModalPriceKg * 100).toInt()}/qtl',
                  color: AppTheme.forestGreen,
                ),
              ),
              Expanded(
                child: _statBlock(
                  'Price Range',
                  '₹${summary.minPriceKg} - ₹${summary.maxPriceKg}',
                  subtitle: 'Min to Max /kg',
                ),
              ),
              Expanded(
                child: _statBlock(
                  'Total Arrivals',
                  '${summary.totalArrivalsQuintals.toStringAsFixed(0)} qtl',
                  subtitle: '${summary.recordCount} reports',
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _statBlock(String title, String val, {String? subtitle, Color? color}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(title, style: const TextStyle(fontSize: 11, color: Colors.grey)),
        const SizedBox(height: 2),
        Text(
          val,
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.bold,
            color: color ?? Colors.black87,
          ),
        ),
        if (subtitle != null)
          Text(subtitle, style: const TextStyle(fontSize: 10, color: Colors.black45)),
      ],
    );
  }
}

class _TrendCard extends StatelessWidget {
  final MarketTrendItem item;
  final VoidCallback onOptimize;

  const _TrendCard({required this.item, required this.onOptimize});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: const Color(0xFFE8F0E9)),
        boxShadow: const [
          BoxShadow(color: Color(0x04000000), blurRadius: 6, offset: Offset(0, 2)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: const Color(0xFFE8F5E9),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.storefront, color: AppTheme.forestGreen, size: 16),
                  ),
                  const SizedBox(width: 8),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${item.market} APMC',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                      Text(
                        '${item.crop} (${item.variety}) • ${item.date}',
                        style: TextStyle(fontSize: 11.5, color: Colors.grey.shade600),
                      ),
                    ],
                  ),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '₹${item.modalPriceKg.toStringAsFixed(1)}/kg',
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.successGreen,
                    ),
                  ),
                  Text(
                    '₹${item.modalPriceQuintal.toStringAsFixed(0)} / qtl',
                    style: TextStyle(fontSize: 11, color: Colors.grey.shade600),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 10),
          const Divider(height: 1),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Row(
                children: [
                  Text(
                    'Range: ₹${item.minPriceKg.toStringAsFixed(1)} - ₹${item.maxPriceKg.toStringAsFixed(1)}/kg',
                    style: const TextStyle(fontSize: 11.5, color: Colors.black54),
                  ),
                  const SizedBox(width: 8),
                  Text(
                    '• ${item.arrivalsQuintal.toStringAsFixed(0)} qtl arrived',
                    style: const TextStyle(fontSize: 11.5, color: Colors.black54),
                  ),
                ],
              ),
              InkWell(
                onTap: onOptimize,
                borderRadius: BorderRadius.circular(8),
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFF1F8F3),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: const Color(0xFFC8E6C9)),
                  ),
                  child: const Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        'Optimize',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.forestGreen,
                        ),
                      ),
                      SizedBox(width: 2),
                      Icon(Icons.arrow_forward_ios, size: 9, color: AppTheme.forestGreen),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
