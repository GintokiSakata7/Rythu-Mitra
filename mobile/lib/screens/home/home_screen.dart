import 'package:flutter/material.dart';
import 'package:showcaseview/showcaseview.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../localization/app_strings.dart';
import '../../providers/language_provider.dart';
import '../search/find_best_screen.dart';
import '../buyers/buyer_list_screen.dart';
import '../demand/post_demand_screen.dart';
import '../demand/my_demands_screen.dart';
import '../assistant/assistant_screen.dart';
import '../profile/profile_screen.dart';
import '../notifications/notifications_screen.dart';
import '../../providers/settings_provider.dart';

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
  final GlobalKey _demandKey = GlobalKey();
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
      const PostDemandScreen(),
    ];
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _checkShowcase();
    });
  }
  
  Future<void> _checkShowcase() async {
    final settingsProvider = context.read<SettingsProvider>();
    if (!settingsProvider.isOnboardingComplete && mounted) {
      ShowCaseWidget.of(context).startShowCase([
        _homeKey,
        _findBestKey,
        _voiceKey,
        _buyersKey,
        _demandKey,
        _notificationsKey,
        _profileKey,
      ]);
      await settingsProvider.completeOnboarding();
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>().langCode;

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
                  label: AppStrings.get('nav_home', lang),
                  label2: AppStrings.get('nav_home', lang),
                  index: 0,
                  lang: lang,
                  key: _homeKey,
                  description: AppStrings.get('guide_home', lang),
                ),
                _navItem(
                  icon: Icons.search_rounded,
                  label: AppStrings.get('nav_find_best', lang),
                  label2: AppStrings.get('nav_find_best', lang),
                  index: 1,
                  lang: lang,
                  key: _findBestKey,
                  description: AppStrings.get('guide_find_best', lang),
                ),
                // Center Voice Button
                Expanded(
                  child: Showcase(
                    key: _voiceKey,
                    description: AppStrings.get('guide_voice', lang),
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
                  label: AppStrings.get('nav_buyers', lang),
                  label2: AppStrings.get('nav_buyers', lang),
                  index: 3,
                  lang: lang,
                  key: _buyersKey,
                  description: AppStrings.get('guide_buyers', lang),
                ),
                _navItem(
                  icon: Icons.post_add_rounded,
                  label: AppStrings.get('nav_demand', lang),
                  label2: AppStrings.get('nav_demand', lang),
                  index: 4,
                  lang: lang,
                  key: _demandKey,
                  description: AppStrings.get('guide_demand', lang),
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
                    textAlign: TextAlign.center,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
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

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>().langCode;
    final s = (String k, {Map<String, String>? p}) =>
        AppStrings.get(k, lang, params: p);

    return Scaffold(
      backgroundColor: AppTheme.warmCream,
      body: CustomScrollView(
        slivers: [
          // App Bar
          SliverAppBar(
            expandedHeight: 160,
            floating: false,
            pinned: true,
            backgroundColor: AppTheme.forestGreen,
            actions: [
              Showcase(
                key: notificationsKey,
                description: s('guide_notifications'),
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
                description: s('guide_profile'),
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
                    padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
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
                        const Row(
                          children: [
                            Icon(Icons.location_on,
                                color: Colors.white70, size: 14),
                            SizedBox(width: 4),
                            Text(
                              'Nalgonda, Telangana',
                              style:
                                  TextStyle(color: Colors.white70, fontSize: 13),
                            ),
                          ],
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
                  // Hero CTA
                  GestureDetector(
                    onTap: () {
                      final homeState =
                          context.findAncestorStateOfType<_HomeScreenState>();
                      homeState?.setTab(1);
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
                      child: Row(
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
                        icon: Icons.post_add_rounded,
                        label: s('post_demand'),
                        color: const Color(0xFF6A1B9A),
                        bgColor: const Color(0xFFF3E5F5),
                        onTap: () {
                          final homeState = context
                              .findAncestorStateOfType<_HomeScreenState>();
                          homeState?.setTab(4);
                        },
                      ),
                      const SizedBox(width: 10),
                      _quickActionCard(
                        context,
                        icon: Icons.history_rounded,
                        label: s('history'),
                        color: const Color(0xFFE65100),
                        bgColor: const Color(0xFFFFF3E0),
                        onTap: () => Navigator.push(context,
                            MaterialPageRoute(builder: (_) => const MyDemandsScreen())),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  // Mandi Prices
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        s('mandi_prices'),
                        style: const TextStyle(
                            fontSize: 17, fontWeight: FontWeight.bold),
                      ),
                      Text('Live',
                          style: TextStyle(
                              fontSize: 12,
                              color: Colors.green.shade600,
                              fontWeight: FontWeight.w600)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 80,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: const [
                        _PriceChip(crop: '🍅 Tomato', price: '₹22-26/kg', trend: '+5%'),
                        _PriceChip(crop: '🧅 Onion', price: '₹18-22/kg', trend: '+2%'),
                        _PriceChip(crop: '🥔 Potato', price: '₹12-15/kg', trend: '-1%'),
                        _PriceChip(crop: '🌶️ Chilli', price: '₹45-55/kg', trend: '+8%'),
                        _PriceChip(crop: '🌾 Cotton', price: '₹72-78/kg', trend: '+3%'),
                      ],
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Nearby Markets
                  Text(
                    s('nearby_markets'),
                    style: const TextStyle(
                        fontSize: 17, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  _MarketPreviewCard(
                      name: 'Nalgonda Local Mandi', dist: '2.1 km', price: '₹22/kg'),
                  _MarketPreviewCard(
                      name: 'Miryalaguda APMC', dist: '35 km', price: '₹23/kg'),
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
                    children: const [
                      _RecentChip(text: '🍅 Tomato • Nalgonda • 5000 kg'),
                      _RecentChip(text: '🧅 Onion • Hyderabad • 2500 kg'),
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

  const _PriceChip(
      {required this.crop, required this.price, required this.trend});

  @override
  Widget build(BuildContext context) {
    final isPositive = trend.startsWith('+');
    return Container(
      margin: const EdgeInsets.only(right: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE8F5E9)),
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
          Text(trend,
              style: TextStyle(
                  fontSize: 11,
                  color: isPositive ? AppTheme.successGreen : AppTheme.dangerRed)),
        ],
      ),
    );
  }
}

class _MarketPreviewCard extends StatelessWidget {
  final String name;
  final String dist;
  final String price;

  const _MarketPreviewCard(
      {required this.name, required this.dist, required this.price});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFE8F5E9)),
      ),
      child: Row(
        children: [
          const Icon(Icons.store, color: AppTheme.forestGreen, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Text(name,
                style: const TextStyle(fontWeight: FontWeight.w600)),
          ),
          Text(dist,
              style: const TextStyle(fontSize: 12, color: Colors.grey)),
          const SizedBox(width: 12),
          Text(price,
              style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  color: AppTheme.successGreen)),
        ],
      ),
    );
  }
}

class _RecentChip extends StatelessWidget {
  final String text;
  const _RecentChip({required this.text});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFFE0E0E0)),
      ),
      child: Text(text, style: const TextStyle(fontSize: 12)),
    );
  }
}
