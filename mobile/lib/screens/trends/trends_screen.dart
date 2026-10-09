import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/language_provider.dart';
import '../../providers/trends_provider.dart';
import '../../models/trend_model.dart';

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

  void _showTrendDetailsSheet(BuildContext context, MarketTrendItem item) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _TrendDetailsSheet(item: item),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>().langCode;
    final prov = context.watch<TrendsProvider>();

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
                            'Live APMC daily market arrivals & auction rates',
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
                            fontSize: 12,
                            fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          ),
                        ),
                      );
                    }
                    final crop = _popularCrops[i - 1];
                    final isSelected = prov.selectedCrop.toLowerCase() == crop['name']!.toLowerCase();
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        avatar: Text(crop['emoji']!, style: const TextStyle(fontSize: 13)),
                        label: Text(crop['name']!),
                        selected: isSelected,
                        onSelected: (_) => prov.selectCrop(isSelected ? '' : crop['name']!),
                        selectedColor: AppTheme.forestGreen,
                        labelStyle: TextStyle(
                          color: isSelected ? Colors.white : Colors.black87,
                          fontSize: 12,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            // Market Filter Dropdown Bar
            SliverToBoxAdapter(
              child: Container(
                padding: const EdgeInsets.fromLTRB(16, 6, 16, 12),
                color: Colors.white,
                child: Row(
                  children: [
                    const Icon(Icons.location_on, size: 16, color: AppTheme.forestGreen),
                    const SizedBox(width: 6),
                    Text(
                      'Market:',
                      style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey.shade700),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 2),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.grey.shade300),
                        ),
                        child: DropdownButtonHideUnderline(
                          child: DropdownButton<String>(
                            isDense: true,
                            isExpanded: true,
                            value: prov.selectedMarket.isEmpty ? 'All Mandis' : prov.selectedMarket,
                            items: _popularMarkets.map((m) {
                              return DropdownMenuItem<String>(
                                value: m,
                                child: Text(m, style: const TextStyle(fontSize: 12.5)),
                              );
                            }).toList(),
                            onChanged: (val) {
                              if (val != null) {
                                prov.selectMarket(val == 'All Mandis' ? '' : val);
                              }
                            },
                          ),
                        ),
                      ),
                    ),
                    if (prov.selectedCrop.isNotEmpty || prov.selectedMarket.isNotEmpty) ...[
                      const SizedBox(width: 8),
                      IconButton(
                        icon: const Icon(Icons.clear, size: 18, color: Colors.grey),
                        tooltip: 'Clear filters',
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                        onPressed: () {
                          prov.selectCrop('');
                          prov.selectMarket('');
                        },
                      ),
                    ],
                  ],
                ),
              ),
            ),

            const SliverToBoxAdapter(child: SizedBox(height: 8)),

            // Body Content based on state
            if (prov.loading && prov.items.isEmpty)
              const SliverFillRemaining(
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      CircularProgressIndicator(color: AppTheme.forestGreen),
                      SizedBox(height: 12),
                      Text('Loading APMC trends from Supabase...'),
                    ],
                  ),
                ),
              )
            else if (prov.error.isNotEmpty && prov.items.isEmpty)
              SliverFillRemaining(
                child: Center(
                  child: Padding(
                    padding: const EdgeInsets.all(24),
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
                        'Tap item for full details',
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
                        onTap: () => _showTrendDetailsSheet(context, item),
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
  final VoidCallback onTap;

  const _TrendCard({required this.item, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
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
                  Expanded(
                    child: Row(
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
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '${item.market} APMC',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                              ),
                              Text(
                                '${item.crop} (${item.variety}) • ${item.date}',
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                                style: TextStyle(fontSize: 11.5, color: Colors.grey.shade600),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
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
                  Expanded(
                    child: Row(
                      children: [
                        Text(
                          '₹${item.minPriceKg.toStringAsFixed(1)} - ₹${item.maxPriceKg.toStringAsFixed(1)}/kg',
                          style: const TextStyle(fontSize: 11.5, color: Colors.black54),
                        ),
                        const SizedBox(width: 8),
                        Flexible(
                          child: Text(
                            '• ${item.arrivalsQuintal.toStringAsFixed(0)} qtl',
                            overflow: TextOverflow.ellipsis,
                            style: const TextStyle(fontSize: 11.5, color: Colors.black54),
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFF1F8F3),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: const Color(0xFFC8E6C9)),
                    ),
                    child: const Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(Icons.info_outline, size: 12, color: AppTheme.forestGreen),
                        SizedBox(width: 4),
                        Text(
                          'Details',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.forestGreen,
                          ),
                        ),
                        SizedBox(width: 2),
                        Icon(Icons.keyboard_arrow_right, size: 13, color: AppTheme.forestGreen),
                      ],
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _TrendDetailsSheet extends StatelessWidget {
  final MarketTrendItem item;

  const _TrendDetailsSheet({required this.item});

  String _formatAmount(double val) {
    if (val <= 0) return '—';
    if (val >= 10000000) return '₹${(val / 10000000).toStringAsFixed(2)} Cr';
    if (val >= 100000) return '₹${(val / 100000).toStringAsFixed(2)} Lakh';
    return '₹${val.toStringAsFixed(0)}';
  }

  @override
  Widget build(BuildContext context) {
    final spreadKg = item.maxPriceKg - item.minPriceKg;
    final spreadQuintal = item.maxPriceQuintal - item.minPriceQuintal;

    return Container(
      decoration: const BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.only(
        top: 12,
        left: 20,
        right: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      child: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Drag handle
            Center(
              child: Container(
                width: 40,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade300,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 16),

            // Top Header: Mandi & Commodity
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.forestGreen.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.storefront, color: AppTheme.forestGreen, size: 28),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '${item.market} APMC',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.forestGreen,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Row(
                        children: [
                          Flexible(
                            child: Text(
                              item.crop,
                              style: const TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.w600,
                                color: Colors.black87,
                              ),
                            ),
                          ),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.grey.shade100,
                              borderRadius: BorderRadius.circular(6),
                              border: Border.all(color: Colors.grey.shade300),
                            ),
                            child: Text(
                              item.variety,
                              style: TextStyle(fontSize: 11, color: Colors.grey.shade700),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                  decoration: BoxDecoration(
                    color: const Color(0xFFE8F5E9),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.calendar_today, size: 12, color: AppTheme.forestGreen),
                      const SizedBox(width: 4),
                      Text(
                        item.date,
                        style: const TextStyle(
                          fontSize: 11,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.forestGreen,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            const Divider(height: 1),
            const SizedBox(height: 16),

            // Price Details Header
            const Text(
              'Price Details',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 10),

            // Modal Price Hero Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFF1F8F3),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFC8E6C9)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Modal / Common Auction Price',
                        style: TextStyle(fontSize: 12, color: Colors.black54),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '₹${item.modalPriceKg.toStringAsFixed(2)} / kg',
                        style: const TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.forestGreen,
                        ),
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      const Text(
                        'Per Quintal',
                        style: TextStyle(fontSize: 11, color: Colors.black45),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '₹${item.modalPriceQuintal.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          color: Colors.black87,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 10),

            // Min, Max, Spread Row
            Row(
              children: [
                Expanded(
                  child: _infoCard(
                    title: 'Minimum Price',
                    primary: '₹${item.minPriceKg.toStringAsFixed(2)}/kg',
                    secondary: '₹${item.minPriceQuintal.toStringAsFixed(0)}/qtl',
                    icon: Icons.trending_down,
                    iconColor: AppTheme.dangerRed,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _infoCard(
                    title: 'Maximum Price',
                    primary: '₹${item.maxPriceKg.toStringAsFixed(2)}/kg',
                    secondary: '₹${item.maxPriceQuintal.toStringAsFixed(0)}/qtl',
                    icon: Icons.trending_up,
                    iconColor: AppTheme.successGreen,
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: _infoCard(
                    title: 'Price Spread',
                    primary: '₹${spreadKg.toStringAsFixed(2)}/kg',
                    secondary: '₹${spreadQuintal.toStringAsFixed(0)}/qtl',
                    icon: Icons.compare_arrows,
                    iconColor: Colors.blueGrey,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),

            // Arrivals & Volume Section
            const Text(
              'Arrivals & Market Volume',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 10),

            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  _detailRow(
                    'Day Arrivals',
                    '${item.arrivalsQuintal.toStringAsFixed(1)} Quintals (${(item.arrivalsQuintal * 100).toStringAsFixed(0)} kg)',
                    Icons.inventory_2_outlined,
                  ),
                  if (item.progArrivalsQuintal > 0) ...[
                    const Divider(height: 16),
                    _detailRow(
                      'Progressive Arrivals',
                      '${item.progArrivalsQuintal.toStringAsFixed(1)} Quintals',
                      Icons.history,
                    ),
                  ],
                  if (item.valuation > 0) ...[
                    const Divider(height: 16),
                    _detailRow(
                      'Daily Valuation',
                      _formatAmount(item.valuation),
                      Icons.currency_rupee,
                    ),
                  ],
                  if (item.marketFee > 0) ...[
                    const Divider(height: 16),
                    _detailRow(
                      'Market Cess / Fee',
                      _formatAmount(item.marketFee),
                      Icons.receipt_long,
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 18),

            // Mandi Information Section
            const Text(
              'Mandi Details',
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.bold,
                color: Colors.black87,
              ),
            ),
            const SizedBox(height: 10),

            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.grey.shade50,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  _detailRow('Market Committee', item.amcName.isNotEmpty ? item.amcName : item.market, Icons.business),
                  const Divider(height: 16),
                  _detailRow('Yard Name', item.market, Icons.location_on_outlined),
                  if (item.yardCode != null && item.yardCode! > 0) ...[
                    const Divider(height: 16),
                    _detailRow('Yard Code', item.yardCode.toString(), Icons.pin),
                  ],
                  const Divider(height: 16),
                  _detailRow('Authority', 'Telangana Agricultural Marketing Dept', Icons.verified_user_outlined),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Notice
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: const Color(0xFFF9FBE7),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: const Color(0xFFE6EE9C)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, size: 16, color: Color(0xFF827717)),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Official daily APMC arrival record. Rates are determined by live open auctions at the mandi yard.',
                      style: TextStyle(fontSize: 11, color: Colors.brown.shade800),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Close Button
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => Navigator.pop(context),
                style: OutlinedButton.styleFrom(
                  padding: const EdgeInsets.symmetric(vertical: 12),
                  side: BorderSide(color: Colors.grey.shade300),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                child: const Text('Close', style: TextStyle(color: Colors.black87, fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _infoCard({
    required String title,
    required String primary,
    required String secondary,
    required IconData icon,
    required Color iconColor,
  }) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 14, color: iconColor),
              const SizedBox(width: 4),
              Expanded(
                child: Text(
                  title,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(fontSize: 10, color: Colors.black54),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
          Text(
            primary,
            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Colors.black87),
          ),
          const SizedBox(height: 2),
          Text(
            secondary,
            style: TextStyle(fontSize: 10, color: Colors.grey.shade600),
          ),
        ],
      ),
    );
  }

  Widget _detailRow(String label, String value, IconData icon) {
    return Row(
      children: [
        Icon(icon, size: 16, color: AppTheme.forestGreen),
        const SizedBox(width: 8),
        Text(
          label,
          style: const TextStyle(fontSize: 12, color: Colors.black54),
        ),
        const Spacer(),
        Flexible(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: Colors.black87),
          ),
        ),
      ],
    );
  }
}
