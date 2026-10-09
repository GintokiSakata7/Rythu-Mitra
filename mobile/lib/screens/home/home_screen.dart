import 'package:flutter/material.dart';
import 'package:showcaseview/showcaseview.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../localization/app_strings.dart';
import '../../providers/language_provider.dart';
import '../search/find_best_screen.dart';
import '../buyers/buyer_list_screen.dart';
import '../trends/trends_screen.dart';
import '../assistant/assistant_screen.dart';
import '../profile/profile_screen.dart';
import '../notifications/notifications_screen.dart';
import '../../providers/settings_provider.dart';
import '../../providers/location_provider.dart';
import '../../models/app_models.dart';
import '../search/search_animation_screen.dart';
import '../../location/location_service.dart';
import '../../core/constants/app_constants.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _currentIndex = 0;

  late final List<Widget> _screens;
  
  final GlobalKey _homeKey = GlobalKey();
  final GlobalKey _findBestKey = GlobalKey();
  final GlobalKey _voiceKey = GlobalKey();
  final GlobalKey _buyersKey = GlobalKey();
  final GlobalKey _trendsKey = GlobalKey();
  final GlobalKey _profileKey = GlobalKey();
  final GlobalKey _notificationsKey = GlobalKey();

  void setTab(int index) {
    if (mounted) setState(() => _currentIndex = index);
  }

  @override
  void initState() {
    super.initState();
    _screens = [
      _HomeTab(
        profileKey: _profileKey,
        notificationsKey: _notificationsKey,
      ),
      const FindBestScreen(),
      const AssistantScreen(),
      const BuyerListScreen(),
      const TrendsScreen(),
    ];
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkShowcase();
      _checkInitialLocation();
    });
  }

  Future<void> _checkInitialLocation() async {
    final locProv = context.read<LocationProvider>();
    if (!locProv.hasLocation) {
      final success = await locProv.fetchCurrentLocation(force: true);
      if (!success && mounted && !locProv.hasLocation) {
        _showLocationPromptSheet(isAutoStartup: true);
      }
    }
  }

  void _showLocationPromptSheet({bool isAutoStartup = false}) {
    final lang = context.read<LanguageProvider>().langCode;
    final s = (String k) => AppStrings.get(k, lang);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _LocationPromptBottomSheet(
        lang: lang,
        s: s,
        isAutoStartup: isAutoStartup,
      ),
    );
  }
  
  Future<void> _checkShowcase() async {
    final settingsProvider = context.read<SettingsProvider>();
    if (!settingsProvider.isOnboardingComplete && mounted) {
      ShowCaseWidget.of(context).startShowCase([
        _homeKey,
        _findBestKey,
        _voiceKey,
        _buyersKey,
        _trendsKey,
        _notificationsKey,
        _profileKey,
      ]);
      await settingsProvider.completeOnboarding();
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>().langCode;
    final s = (String k) => AppStrings.get(k, lang);

    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens.asMap().entries.map((entry) {
          return ExcludeSemantics(
            excluding: _currentIndex != entry.key,
            child: entry.value,
          );
        }).toList(),
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Color(0x1A000000),
              blurRadius: 16,
              offset: Offset(0, -4),
            ),
          ],
        ),
        child: SafeArea(
          child: SizedBox(
            height: 64,
            child: Row(
              children: [
                _navItem(
                  icon: Icons.home_rounded,
                  label: AppStrings.get('profile', lang) == 'Profile'
                      ? 'Home'
                      : 'హోమ్',
                  label2: 'Home',
                  index: 0,
                  lang: lang,
                  key: _homeKey,
                  description: 'View your dashboard and daily market updates.',
                ),
                _navItem(
                  icon: Icons.search_rounded,
                  label: 'Find Best',
                  label2: 'Find Best',
                  index: 1,
                  lang: lang,
                  key: _findBestKey,
                  description: 'Find the most profitable market based on your location and transport costs.',
                ),
                // Center Voice Button
                Expanded(
                  child: Showcase(
                    key: _voiceKey,
                    description: 'Tap to speak! Ask for crop prices or best markets in your local language.',
                    child: Semantics(
                      label: 'Voice Assistant, button',
                      button: true,
                      selected: _currentIndex == 2,
                      child: GestureDetector(
                        onTap: () => setState(() => _currentIndex = 2),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Container(
                              width: 54,
                              height: 54,
                              decoration: BoxDecoration(
                                color: _currentIndex == 2
                                    ? AppTheme.forestGreen
                                    : AppTheme.harvestGold,
                                shape: BoxShape.circle,
                                boxShadow: [
                                  BoxShadow(
                                    color: (_currentIndex == 2
                                            ? AppTheme.forestGreen
                                            : AppTheme.harvestGold)
                                        .withValues(alpha: 0.4),
                                    blurRadius: 12,
                                    offset: const Offset(0, 4),
                                  ),
                                ],
                              ),
                              child: const Icon(Icons.mic_rounded,
                                  color: Colors.white, size: 28),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                ),
                _navItem(
                  icon: Icons.storefront_rounded,
                  label: 'Buyers',
                  label2: 'Buyers',
                  index: 3,
                  lang: lang,
                  key: _buyersKey,
                  description: 'Connect directly with verified buyers and traders.',
                ),
                _navItem(
                  icon: Icons.trending_up_rounded,
                  label: 'Trends',
                  label2: s('trends'),
                  index: 4,
                  lang: lang,
                  key: _trendsKey,
                  description: 'Track real-time commodity prices and market trends.',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _navItem({
    required IconData icon,
    required String label,
    required String label2,
    required int index,
    required String lang,
    required GlobalKey key,
    required String description,
  }) {
    final isSelected = _currentIndex == index;
    return Expanded(
      child: Showcase(
        key: key,
        description: description,
        child: Semantics(
          label: '$label2, tab',
          button: true,
          selected: isSelected,
          child: GestureDetector(
            onTap: () => setState(() => _currentIndex = index),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                ExcludeSemantics(
                  child: Icon(
                    icon,
                    color: isSelected ? AppTheme.forestGreen : Colors.grey,
                    size: 24,
                  ),
                ),
                const SizedBox(height: 2),
                ExcludeSemantics(
                  child: Text(
                    label2,
                    style: TextStyle(
                      fontSize: 10,
                      color: isSelected ? AppTheme.forestGreen : Colors.grey,
                      fontWeight:
                          isSelected ? FontWeight.w600 : FontWeight.normal,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ─── Home Tab Content ─────────────────────────────────────────────────────────

class _HomeTab extends StatelessWidget {
  final GlobalKey profileKey;
  final GlobalKey notificationsKey;

  const _HomeTab({
    required this.profileKey,
    required this.notificationsKey,
  });

  void _runQuickPrediction(
    BuildContext context, {
    required String crop,
    required double qtyKg,
    required LocationProvider locProv,
    required String lang,
  }) {
    final request = RecommendationRequest(
      crop: crop,
      quantityKg: qtyKg.toInt(),
      latitude: locProv.latitude,
      longitude: locProv.longitude,
      locationText: locProv.displayName,
      hasTransport: false,
      language: lang,
    );

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => SearchAnimationScreen(request: request),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>().langCode;
    final locProv = context.watch<LocationProvider>();
    final s = (String k, {Map<String, String>? p}) =>
        AppStrings.get(k, lang, params: p);

    return Scaffold(
      backgroundColor: AppTheme.warmCream,
      body: CustomScrollView(
        slivers: [
          // App Bar
          SliverAppBar(
            expandedHeight: 165,
            floating: false,
            pinned: true,
            backgroundColor: AppTheme.forestGreen,
            actions: [
              Showcase(
                key: notificationsKey,
                description: 'See market updates and buyer responses.',
                child: IconButton(
                  icon: const Icon(Icons.notifications_outlined, color: Colors.white),
                  onPressed: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => const NotificationsScreen()),
                    );
                  },
                ),
              ),
              const SizedBox(width: 8),
              Showcase(
                key: profileKey,
                description: 'Manage your profile and preferences.',
                child: GestureDetector(
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (_) => const ProfileScreen()),
                  ),
                  child: Container(
                    width: 36,
                    height: 36,
                    decoration: BoxDecoration(
                      color: Colors.white24,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.person_rounded, color: Colors.white, size: 22),
                  ),
                ),
              ),
              const SizedBox(width: 16),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppTheme.forestGreen, AppTheme.leafGreen],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 14, 20, 0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '${s('welcome')}, ${s('farmer')} 🌾',
                                    style: const TextStyle(
                                      color: Colors.white70,
                                      fontSize: 14,
                                    ),
                                  ),
                                  const Text(
                                    'RythuMitra',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 24,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        // Live GPS Location Selector Badge
                        InkWell(
                          onTap: () {
                            final homeState = context
                                .findAncestorStateOfType<_HomeScreenState>();
                            homeState?._showLocationPromptSheet();
                          },
                          borderRadius: BorderRadius.circular(20),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: locProv.isDefaultLocation
                                  ? const Color(0xFFF57F17).withValues(alpha: 0.35)
                                  : Colors.black.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: locProv.isDefaultLocation
                                    ? const Color(0xFFFFD54F)
                                    : Colors.white24,
                                width: locProv.isDefaultLocation ? 1.5 : 1.0,
                              ),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                locProv.isLoadingLocation
                                    ? const SizedBox(
                                        width: 12,
                                        height: 12,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          color: AppTheme.harvestGold,
                                        ),
                                      )
                                    : Icon(
                                        locProv.isDefaultLocation
                                            ? Icons.location_searching_rounded
                                            : Icons.my_location_rounded,
                                        color: locProv.isDefaultLocation
                                            ? const Color(0xFFFFD54F)
                                            : AppTheme.harvestGold,
                                        size: 14,
                                      ),
                                const SizedBox(width: 6),
                                ConstrainedBox(
                                  constraints: const BoxConstraints(maxWidth: 220),
                                  child: Text(
                                    locProv.isLoadingLocation
                                        ? 'Detecting GPS...'
                                        : (locProv.isDefaultLocation
                                            ? 'Tap to set location'
                                            : locProv.displayName),
                                    style: TextStyle(
                                      color: locProv.isDefaultLocation
                                          ? const Color(0xFFFFF9C4)
                                          : Colors.white,
                                      fontSize: 12,
                                      fontWeight: FontWeight.w600,
                                    ),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                                const SizedBox(width: 4),
                                const Icon(Icons.arrow_drop_down_rounded, color: Colors.white70, size: 16),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Location missing notice banner
                  if (locProv.isDefaultLocation) ...[
                    Container(
                      margin: const EdgeInsets.only(bottom: 16),
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                      decoration: BoxDecoration(
                        color: const Color(0xFFFFF8E1),
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: const Color(0xFFFFD54F), width: 1.2),
                        boxShadow: const [
                          BoxShadow(
                            color: Color(0x14000000),
                            blurRadius: 8,
                            offset: Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Row(
                        children: [
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFFECB3),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Icon(
                              Icons.location_searching_rounded,
                              color: Color(0xFFE65100),
                              size: 22,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  lang == 'te'
                                      ? 'మీ పొలం స్థానాన్ని సెట్ చేయండి'
                                      : (lang == 'hi'
                                          ? 'खेत का स्थान सेट करें'
                                          : 'Set Your Farm Location'),
                                  style: const TextStyle(
                                    fontSize: 13,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFFE65100),
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  lang == 'te'
                                      ? 'సమీప మండీలు & ఖచ్చితమైన లాభాల కోసం GPS ఆన్ చేయండి.'
                                      : (lang == 'hi'
                                          ? 'सटीक मंडी कीमतों के लिए GPS अनुमति दें।'
                                          : 'Detect GPS for accurate local mandi prices & transport.'),
                                  style: const TextStyle(
                                    fontSize: 11,
                                    color: Colors.black87,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          const SizedBox(width: 8),
                          ElevatedButton(
                            onPressed: () {
                              final homeState = context
                                  .findAncestorStateOfType<_HomeScreenState>();
                              homeState?._showLocationPromptSheet();
                            },
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.forestGreen,
                              foregroundColor: Colors.white,
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 12, vertical: 8),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                              elevation: 0,
                            ),
                            child: Text(
                              lang == 'te'
                                  ? 'సెట్ చేయండి'
                                  : (lang == 'hi' ? 'सेट करें' : 'Set GPS'),
                              style: const TextStyle(
                                  fontSize: 12, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                  // Hero CTA
                  GestureDetector(
                    onTap: () {
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (_) => const FindBestScreen(),
                        ),
                      );
                    },
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(22),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppTheme.forestGreen, AppTheme.leafGreen],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.forestGreen.withValues(alpha: 0.35),
                            blurRadius: 16,
                            offset: const Offset(0, 6),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: Colors.white24,
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                child: const Icon(Icons.search_rounded,
                                    color: Colors.white, size: 32),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      s('find_best'),
                                      style: const TextStyle(
                                        color: Colors.white,
                                        fontSize: 18,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      s('find_best_sub'),
                                      style: const TextStyle(
                                        color: Colors.white70,
                                        fontSize: 13,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const Icon(Icons.arrow_forward_ios,
                                  color: Colors.white70, size: 16),
                            ],
                          ),
                          const SizedBox(height: 12),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                const Icon(Icons.check_circle_rounded, color: AppTheme.harvestGold, size: 14),
                                const SizedBox(width: 6),
                                Flexible(
                                  child: Text(
                                    'Auto-locked to: ${locProv.displayName}',
                                    style: const TextStyle(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600),
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 20),

                  // Quick Actions
                  Row(
                    children: [
                      _quickActionCard(
                        context,
                        icon: Icons.storefront_rounded,
                        label: s('buyer_network'),
                        color: const Color(0xFF1565C0),
                        bgColor: const Color(0xFFE3F2FD),
                        onTap: () {
                          final homeState = context
                              .findAncestorStateOfType<_HomeScreenState>();
                          homeState?.setTab(3);
                        },
                      ),
                      const SizedBox(width: 10),
                      _quickActionCard(
                        context,
                        icon: Icons.trending_up_rounded,
                        label: s('market_trends'),
                        color: const Color(0xFF00796B),
                        bgColor: const Color(0xFFE0F2F1),
                        onTap: () {
                          final homeState = context
                              .findAncestorStateOfType<_HomeScreenState>();
                          homeState?.setTab(4);
                        },
                      ),
                      const SizedBox(width: 10),
                      _quickActionCard(
                        context,
                        icon: Icons.calculate_rounded,
                        label: s('find_best'),
                        color: const Color(0xFFE65100),
                        bgColor: const Color(0xFFFFF3E0),
                        onTap: () {
                          final homeState = context
                              .findAncestorStateOfType<_HomeScreenState>();
                          homeState?.setTab(1);
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Live Mandi Prices Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            s('mandi_prices'),
                            style: const TextStyle(
                                fontSize: 17, fontWeight: FontWeight.bold),
                          ),
                          const Text(
                            'Tap any crop to run instant profit calculation',
                            style: TextStyle(fontSize: 11, color: Colors.grey),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: const Color(0xFFE8F5E9),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Container(
                              width: 6,
                              height: 6,
                              decoration: const BoxDecoration(
                                color: AppTheme.forestGreen,
                                shape: BoxShape.circle,
                              ),
                            ),
                            const SizedBox(width: 4),
                            Text('Live',
                                style: TextStyle(
                                    fontSize: 11,
                                    color: Colors.green.shade700,
                                    fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Dynamic Mandi Prices List
                  SizedBox(
                    height: 86,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      itemCount: locProv.cropPrices.length,
                      itemBuilder: (ctx, i) {
                        final item = locProv.cropPrices[i];
                        return _PriceChip(
                          crop: '${item.emoji} ${item.crop}',
                          price: item.priceRange,
                          trend: item.trend,
                          onTap: () {
                            _runQuickPrediction(
                              context,
                              crop: item.crop,
                              qtyKg: 1500, // 15 Quintals default
                              locProv: locProv,
                              lang: lang,
                            );
                          },
                        );
                      },
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Nearby Markets Header
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            s('nearby_markets'),
                            style: const TextStyle(
                                fontSize: 17, fontWeight: FontWeight.bold),
                          ),
                          Text(
                            'Calculated from ${locProv.displayName}',
                            style: const TextStyle(fontSize: 11, color: Colors.grey),
                          ),
                        ],
                      ),
                      if (locProv.isLoadingMarkets)
                        const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.forestGreen),
                        ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Dynamic Nearby Markets List
                  if (locProv.nearbyMarkets.isEmpty && !locProv.isLoadingMarkets)
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Center(
                        child: Text('No nearby mandis detected within 100km radius.'),
                      ),
                    )
                  else
                    ...locProv.nearbyMarkets.map((m) {
                      return _MarketPreviewCard(
                        name: m.name,
                        dist: '${m.distanceKm.toStringAsFixed(1)} km',
                        price: '₹${m.pricePerKg.toStringAsFixed(0)}/kg',
                        onTap: () {
                          _runQuickPrediction(
                            context,
                            crop: 'Tomato',
                            qtyKg: 1500,
                            locProv: locProv,
                            lang: lang,
                          );
                        },
                      );
                    }),

                  const SizedBox(height: 24),

                  // Recent Searches
                  Text(
                    s('recent_searches'),
                    style: const TextStyle(
                        fontSize: 17, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: [
                      _RecentChip(
                        text: '🍅 Tomato • ${locProv.displayName} • 1500 kg',
                        onTap: () {
                          _runQuickPrediction(
                            context,
                            crop: 'Tomato',
                            qtyKg: 1500,
                            locProv: locProv,
                            lang: lang,
                          );
                        },
                      ),
                      _RecentChip(
                        text: '🧅 Onion • ${locProv.displayName} • 2500 kg',
                        onTap: () {
                          _runQuickPrediction(
                            context,
                            crop: 'Onion',
                            qtyKg: 2500,
                            locProv: locProv,
                            lang: lang,
                          );
                        },
                      ),
                      _RecentChip(
                        text: '🌾 Cotton • ${locProv.displayName} • 1000 kg',
                        onTap: () {
                          _runQuickPrediction(
                            context,
                            crop: 'Cotton',
                            qtyKg: 1000,
                            locProv: locProv,
                            lang: lang,
                          );
                        },
                      ),
                    ],
                  ),
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _quickActionCard(
    BuildContext context, {
    required IconData icon,
    required String label,
    required Color color,
    required Color bgColor,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 10),
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Column(
            children: [
              Icon(icon, color: color, size: 26),
              const SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(
                    fontSize: 11, fontWeight: FontWeight.w600, color: color),
                textAlign: TextAlign.center,
                maxLines: 2,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PriceChip extends StatelessWidget {
  final String crop;
  final String price;
  final String trend;
  final VoidCallback onTap;

  const _PriceChip({
    required this.crop,
    required this.price,
    required this.trend,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isPositive = trend.startsWith('+');
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(right: 10),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE8F5E9)),
          boxShadow: const [
            BoxShadow(
              color: Color(0x06000000),
              blurRadius: 6,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(crop, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600)),
            const SizedBox(height: 2),
            Text(price,
                style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.successGreen)),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(trend,
                    style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.bold,
                        color: isPositive ? AppTheme.successGreen : AppTheme.dangerRed)),
                const SizedBox(width: 4),
                const Icon(Icons.touch_app_outlined, size: 12, color: Colors.grey),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _MarketPreviewCard extends StatelessWidget {
  final String name;
  final String dist;
  final String price;
  final VoidCallback onTap;

  const _MarketPreviewCard({
    required this.name,
    required this.dist,
    required this.price,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: const Color(0xFFE8F5E9)),
          boxShadow: const [
            BoxShadow(
              color: Color(0x04000000),
              blurRadius: 4,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: const Color(0xFFE8F5E9),
                borderRadius: BorderRadius.circular(8),
              ),
              child: const Icon(Icons.store, color: AppTheme.forestGreen, size: 20),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name,
                      style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      const Icon(Icons.near_me_outlined, size: 12, color: Colors.grey),
                      const SizedBox(width: 2),
                      Text(dist,
                          style: const TextStyle(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                ],
              ),
            ),
            Column(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Text(price,
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                        color: AppTheme.successGreen)),
                const Text('Check Net >',
                    style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: AppTheme.forestGreen)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _RecentChip extends StatelessWidget {
  final String text;
  final VoidCallback onTap;

  const _RecentChip({required this.text, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: const Color(0xFFE0E0E0)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.history, size: 13, color: Colors.grey),
            const SizedBox(width: 6),
            Text(text, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }
}

// ─── Location Prompt Bottom Sheet ─────────────────────────────────────────────

class _LocationPromptBottomSheet extends StatefulWidget {
  final String lang;
  final String Function(String) s;
  final bool isAutoStartup;

  const _LocationPromptBottomSheet({
    required this.lang,
    required this.s,
    this.isAutoStartup = false,
  });

  @override
  State<_LocationPromptBottomSheet> createState() => _LocationPromptBottomSheetState();
}

class _LocationPromptBottomSheetState extends State<_LocationPromptBottomSheet> {
  bool _isDetecting = false;

  Future<void> _detectGps() async {
    setState(() => _isDetecting = true);
    final locProv = context.read<LocationProvider>();
    final success = await locProv.fetchCurrentLocation(force: true);
    if (!mounted) return;
    setState(() => _isDetecting = false);

    if (success) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle_rounded, color: Colors.white, size: 18),
              const SizedBox(width: 8),
              Expanded(child: Text('📍 GPS Detected: ${locProv.displayName}')),
            ],
          ),
          backgroundColor: AppTheme.forestGreen,
          duration: const Duration(seconds: 3),
          behavior: SnackBarBehavior.floating,
        ),
      );
    } else {
      final err = locProv.errorMessage ?? '';
      if (err.contains('turned off') || err.contains('GPS')) {
        _showGpsDisabledDialog();
      } else if (err.contains('denied') || err.contains('permission')) {
        _showPermissionDialog();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(err.isNotEmpty ? err : 'Could not detect GPS signal.'),
            behavior: SnackBarBehavior.floating,
          ),
        );
      }
    }
  }

  void _showGpsDisabledDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.location_off, color: AppTheme.dangerRed),
            SizedBox(width: 8),
            Text('Turn On GPS'),
          ],
        ),
        content: const Text(
          'Location services (GPS) are turned off on your device. Please turn on GPS so RythuMitra can detect your nearest mandi.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              locationService.openLocationSettings();
            },
            child: const Text('Open Settings'),
          ),
        ],
      ),
    );
  }

  void _showPermissionDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Location Permission Needed'),
        content: const Text(
          'Location permission was denied. Please allow location access in App Settings to detect your farm coordinates.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(ctx);
              locationService.openAppSettings();
            },
            child: const Text('App Settings'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final lang = widget.lang;
    final title = lang == 'te'
        ? 'మీ వ్యవసాయ స్థానాన్ని సెట్ చేయండి'
        : (lang == 'hi' ? 'खेत का स्थान सेट करें' : 'Set Your Farm Location');
    final subtitle = lang == 'te'
        ? 'రైతుల కోసం ఖచ్చితమైన రవాణా ఖర్చులు, సమీప మండీలు మరియు క్రేతలను గుర్తించడానికి మీ స్థానం అవసరం.'
        : (lang == 'hi'
            ? 'सटीक परिवहन लागत, नज़दीकी मंडियों और खरीदारों के लिए अपना स्थान सेट करें।'
            : 'RythuMitra calculates real transport cost, travel time, and finds nearest mandis & buyers based on your farm location.');

    return SafeArea(
      child: Container(
        padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
        decoration: const BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 40,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.grey.shade300,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppTheme.forestGreen.withValues(alpha: 0.12),
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(
                      Icons.my_location_rounded,
                      color: AppTheme.forestGreen,
                      size: 26,
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 3),
                        Text(
                          subtitle,
                          style: const TextStyle(
                            fontSize: 12,
                            color: Colors.black54,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 20),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _isDetecting ? null : _detectGps,
                  icon: _isDetecting
                      ? const SizedBox(
                          width: 18,
                          height: 18,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: Colors.white,
                          ),
                        )
                      : const Icon(Icons.gps_fixed_rounded, color: Colors.white),
                  label: Text(
                    _isDetecting
                        ? (lang == 'te'
                            ? 'గుర్తిస్తున్నాం...'
                            : (lang == 'hi' ? 'स्थान ढूंढ रहे हैं...' : 'Detecting GPS...'))
                        : (lang == 'te'
                            ? '📍 నా GPS స్థానాన్ని ఉపయోగించు'
                            : (lang == 'hi'
                                ? '📍 मेरा GPS स्थान उपयोग करें'
                                : '📍 Use My GPS Location')),
                    style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: Colors.white),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppTheme.forestGreen,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                    elevation: 2,
                  ),
                ),
              ),
              const SizedBox(height: 14),
              Row(
                children: [
                  const Expanded(child: Divider()),
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Text(
                      lang == 'te'
                          ? 'లేదా పట్టణం/మండీని ఎంచుకోండి'
                          : (lang == 'hi' ? 'या शहर / मंडी चुनें' : 'OR SELECT TOWN / MANDI'),
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.black45),
                    ),
                  ),
                  const Expanded(child: Divider()),
                ],
              ),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: AppConstants.presetLocations.map((loc) {
                  return ActionChip(
                    avatar: const Icon(Icons.location_city_rounded, size: 16, color: AppTheme.forestGreen),
                    label: Text(
                      loc['name'].toString(),
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600),
                    ),
                    backgroundColor: const Color(0xFFF1F8E9),
                    side: const BorderSide(color: Color(0xFFC8E6C9)),
                    onPressed: () {
                      final name = loc['name'].toString();
                      final lat = (loc['lat'] as num).toDouble();
                      final lng = (loc['lng'] as num).toDouble();
                      context.read<LocationProvider>().setManualLocation(name, lat, lng);
                      Navigator.pop(context);
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Row(
                            children: [
                              const Icon(Icons.check_circle_rounded, color: Colors.white, size: 18),
                              const SizedBox(width: 8),
                              Expanded(child: Text('📍 Location set: $name')),
                            ],
                          ),
                          backgroundColor: AppTheme.forestGreen,
                          duration: const Duration(seconds: 2),
                          behavior: SnackBarBehavior.floating,
                        ),
                      );
                    },
                  );
                }).toList(),
              ),
              if (widget.isAutoStartup) ...[
                const SizedBox(height: 16),
                Center(
                  child: TextButton(
                    onPressed: () => Navigator.pop(context),
                    child: Text(
                      lang == 'te'
                          ? 'తరువాత సెట్ చేయండి (హైదరాబాద్ డిఫాల్ట్)'
                          : (lang == 'hi' ? 'बाद में सेट करें' : 'Continue with Hyderabad Default'),
                      style: const TextStyle(fontSize: 12, color: Colors.black45),
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}

