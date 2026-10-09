import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/constants/app_constants.dart';
import '../../localization/app_strings.dart';
import '../../providers/language_provider.dart';
import '../../providers/buyer_provider.dart';
import '../../widgets/buyer_card.dart';
import 'buyer_details_screen.dart';

class BuyerListScreen extends StatefulWidget {
  const BuyerListScreen({super.key});

  @override
  State<BuyerListScreen> createState() => _BuyerListScreenState();
}

class _BuyerListScreenState extends State<BuyerListScreen> {
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<BuyerProvider>().loadBuyers(crop: '');
    });
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>().langCode;
    final s = (String k) => AppStrings.get(k, lang);
    final prov = context.watch<BuyerProvider>();

    return Scaffold(
      backgroundColor: AppTheme.warmCream,
      appBar: AppBar(
        title: Text(s('buyer_network')),
      ),
      body: Column(
        children: [
          // Header / Intro
          Container(
            padding: const EdgeInsets.all(20),
            color: Colors.white,
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: AppTheme.forestGreen.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.handshake,
                      color: AppTheme.forestGreen, size: 28),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        s('buyer_network'),
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        s('buyer_network_sub'),
                        style: const TextStyle(
                            fontSize: 13, color: Colors.black54),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Filters
          Container(
            height: 60,
            color: Colors.white,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              children: [
                _FilterChip(
                  label: s('all'),
                  isSelected: prov.selectedCrop == '',
                  onTap: () => prov.loadBuyers(crop: ''),
                ),
                ...AppConstants.crops.map((c) {
                  final title = c[lang] ?? c['en']!;
                  return Padding(
                    padding: const EdgeInsets.only(left: 8),
                    child: _FilterChip(
                      label: title,
                      isSelected: prov.selectedCrop == c['id'],
                      onTap: () => prov.loadBuyers(crop: c['id']!),
                    ),
                  );
                }),
              ],
            ),
          ),
          const Divider(height: 1),

          // List
          Expanded(
            child: prov.loading
                ? const Center(child: CircularProgressIndicator())
                : prov.error.isNotEmpty
                    ? Center(
                        child: Padding(
                          padding: const EdgeInsets.all(24.0),
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(Icons.cloud_off, size: 44, color: Colors.orange),
                              const SizedBox(height: 12),
                              Text(
                                'Could not fetch live buyers from DB:\n${prov.error}',
                                textAlign: TextAlign.center,
                                style: const TextStyle(fontSize: 13, color: Colors.black87),
                              ),
                              const SizedBox(height: 16),
                              ElevatedButton.icon(
                                onPressed: () => prov.loadBuyers(),
                                icon: const Icon(Icons.refresh, size: 18),
                                label: const Text('Retry Database Query'),
                              ),
                            ],
                          ),
                        ),
                      )
                    : prov.buyers.isEmpty
                        ? Center(
                            child: Padding(
                              padding: const EdgeInsets.all(24.0),
                              child: Column(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.search_off, size: 44, color: Colors.grey),
                                  const SizedBox(height: 12),
                                  Text(
                                    prov.selectedCrop.isNotEmpty
                                        ? 'No verified buyers for ${prov.selectedCrop} in database.'
                                        : 'No verified buyers found in database.',
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(fontSize: 14, color: Colors.black54),
                                  ),
                                  const SizedBox(height: 16),
                                  OutlinedButton(
                                    onPressed: () => prov.loadBuyers(crop: ''),
                                    child: const Text('View All Buyers'),
                                  ),
                                ],
                              ),
                            ),
                          )
                        : RefreshIndicator(
                            onRefresh: () => prov.loadBuyers(),
                            child: ListView.builder(
                              padding: const EdgeInsets.all(16),
                              itemCount: prov.buyers.length,
                              itemBuilder: (context, i) {
                                final buyer = prov.buyers[i];
                                return BuyerCard(
                                  buyer: buyer,
                                  distanceKm: prov.getDistance(buyer.id),
                                  onTap: () {
                                    Navigator.push(
                                      context,
                                      MaterialPageRoute(
                                        builder: (_) => BuyerDetailsScreen(
                                            buyer: buyer),
                                      ),
                                    );
                                  },
                                );
                              },
                            ),
                          ),
          ),
        ],
      ),
    );
  }
}

class _FilterChip extends StatelessWidget {
  final String label;
  final bool isSelected;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppTheme.forestGreen : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: isSelected ? AppTheme.forestGreen : const Color(0xFFE0E0E0),
          ),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            color: isSelected ? Colors.white : Colors.black87,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.normal,
          ),
        ),
      ),
    );
  }
}
