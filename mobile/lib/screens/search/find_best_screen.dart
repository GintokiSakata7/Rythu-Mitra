import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/constants/app_constants.dart';
import '../../localization/app_strings.dart';
import '../../providers/language_provider.dart';
import '../../models/app_models.dart';
import 'search_animation_screen.dart';

class FindBestScreen extends StatefulWidget {
  const FindBestScreen({super.key});

  @override
  State<FindBestScreen> createState() => _FindBestScreenState();
}

class _FindBestScreenState extends State<FindBestScreen> {
  final PageController _pageController = PageController();
  int _currentStep = 0;

  // Form state
  String? _selectedCrop;
  int _quantity = 2500;
  String _locationName = 'Nalgonda';
  double _lat = 17.05;
  double _lng = 79.27;
  bool? _hasTransport;
  bool _isDetectingLocation = false;

  void _nextStep() {
    if (_currentStep < 3) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _prevStep() {
    if (_currentStep > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  Future<void> _submitSearch() async {
    final request = RecommendationRequest(
      crop: _selectedCrop!,
      quantityKg: _quantity,
      latitude: _lat,
      longitude: _lng,
      locationText: _locationName,
      hasTransport: _hasTransport ?? false,
      language: context.read<LanguageProvider>().langCode,
    );

    // Provide immediate feedback and let animation screen take over
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
    final s = (String k) => AppStrings.get(k, lang);

    return Scaffold(
      appBar: AppBar(
        title: Text(s('find_best')),
        leading: _currentStep > 0
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: _prevStep,
              )
            : null,
      ),
      body: Column(
        children: [
          // Progress indicator
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(vertical: 16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                4,
                (index) => Container(
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: 30,
                  height: 4,
                  decoration: BoxDecoration(
                    color: index <= _currentStep
                        ? AppTheme.forestGreen
                        : const Color(0xFFE0E0E0),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
            ),
          ),
          Expanded(
            child: PageView(
              controller: _pageController,
              physics: const NeverScrollableScrollPhysics(),
              onPageChanged: (i) => setState(() => _currentStep = i),
              children: [
                _buildCropStep(s),
                _buildQuantityStep(s),
                _buildLocationStep(s),
                _buildTransportStep(s),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ─── Step 1: Crop ───────────────────────────────────────────────
  Widget _buildCropStep(String Function(String) s) {
    return _StepContainer(
      title: s('your_crop'),
      subtitle: s('select_crop'),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 1.5,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
        ),
        itemCount: AppConstants.crops.length,
        itemBuilder: (context, i) {
          final crop = AppConstants.crops[i];
          final isSelected = _selectedCrop == crop['id'];
          final lang = context.watch<LanguageProvider>().langCode;
          final title = crop[lang] ?? crop['en']!;

          return GestureDetector(
            onTap: () {
              setState(() => _selectedCrop = crop['id']);
              Future.delayed(const Duration(milliseconds: 300), _nextStep);
            },
            child: AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              decoration: BoxDecoration(
                color: isSelected ? AppTheme.forestGreen : Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: isSelected
                      ? AppTheme.forestGreen
                      : const Color(0xFFE0E0E0),
                ),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppTheme.forestGreen.withValues(alpha: 0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 4),
                        )
                      ]
                    : null,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(crop['emoji']!, style: const TextStyle(fontSize: 32)),
                  const SizedBox(height: 8),
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: isSelected ? Colors.white : Colors.black87,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  // ─── Step 2: Quantity ─────────────────────────────────────────────
  Widget _buildQuantityStep(String Function(String) s) {
    return _StepContainer(
      title: s('quantity'),
      subtitle: s('quantity_sub'),
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.symmetric(vertical: 32),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE8F5E9)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.baseline,
                  textBaseline: TextBaseline.alphabetic,
                  children: [
                    Text(
                      _quantity.toString(),
                      style: const TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.forestGreen,
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      'kg',
                      style: TextStyle(fontSize: 20, color: Colors.grey),
                    ),
                  ],
                ),
                Text(
                  '${(_quantity / 1000).toStringAsFixed(1)} tons',
                  style: const TextStyle(color: Colors.grey),
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          SliderTheme(
            data: SliderTheme.of(context).copyWith(
              activeTrackColor: AppTheme.forestGreen,
              inactiveTrackColor: const Color(0xFFE8F5E9),
              thumbColor: AppTheme.harvestGold,
              overlayColor: AppTheme.harvestGold.withValues(alpha: 0.2),
              trackHeight: 8,
            ),
            child: Slider(
              value: _quantity.toDouble(),
              min: 500,
              max: 20000,
              divisions: 39, // 500kg steps
              onChanged: (v) => setState(() => _quantity = v.toInt()),
            ),
          ),
          const SizedBox(height: 24),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: AppConstants.quantityPresets.map((q) {
              return ChoiceChip(
                label: Text(
                  q >= 1000 ? '${q ~/ 1000} ton' : '$q kg',
                  style: TextStyle(
                    color: _quantity == q ? Colors.white : Colors.black87,
                  ),
                ),
                selected: _quantity == q,
                onSelected: (_) => setState(() => _quantity = q),
                selectedColor: AppTheme.forestGreen,
              );
            }).toList(),
          ),
          const Spacer(),
          ElevatedButton(
            onPressed: _nextStep,
            child: Text(s('next')),
          ),
        ],
      ),
    );
  }

  // ─── Step 3: Location ─────────────────────────────────────────────
  Widget _buildLocationStep(String Function(String) s) {
    return _StepContainer(
      title: s('location'),
      subtitle: s('location_sub'),
      child: Column(
        children: [
          ElevatedButton.icon(
            onPressed: () async {
              setState(() => _isDetectingLocation = true);
              // Mock GPS delay
              await Future.delayed(const Duration(seconds: 1));
              setState(() {
                _locationName = 'Current Location';
                _lat = 17.38; // Mock GPS coords
                _lng = 78.48;
                _isDetectingLocation = false;
              });
            },
            icon: _isDetectingLocation
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      color: Colors.black87,
                      strokeWidth: 2,
                    ),
                  )
                : const Icon(Icons.my_location, color: Colors.black87),
            label: Text(
              _isDetectingLocation ? s('detecting') : s('use_gps'),
              style: const TextStyle(color: Colors.black87),
            ),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.harvestGold,
              foregroundColor: Colors.black87,
            ),
          ),
          const SizedBox(height: 32),
          const Row(
            children: [
              Expanded(child: Divider()),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: Text('OR CHOOSE TOWN',
                    style: TextStyle(color: Colors.grey, fontSize: 12)),
              ),
              Expanded(child: Divider()),
            ],
          ),
          const SizedBox(height: 24),
          ...AppConstants.presetLocations.map((loc) {
            final isSelected = _locationName == loc['name'];
            return Padding(
              padding: const EdgeInsets.only(bottom: 12),
              child: ListTile(
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                  side: BorderSide(
                    color: isSelected ? AppTheme.forestGreen : Colors.white,
                    width: isSelected ? 2 : 0,
                  ),
                ),
                tileColor: Colors.white,
                leading: const Icon(Icons.location_city, color: Colors.grey),
                title: Text(loc['name']!),
                trailing: isSelected
                    ? const Icon(Icons.check_circle, color: AppTheme.forestGreen)
                    : null,
                onTap: () {
                  setState(() {
                    _locationName = loc['name'];
                    _lat = loc['lat'];
                    _lng = loc['lng'];
                  });
                },
              ),
            );
          }),
          const Spacer(),
          ElevatedButton(
            onPressed: _nextStep,
            child: Text(s('next')),
          ),
        ],
      ),
    );
  }

  // ─── Step 4: Transport ────────────────────────────────────────────
  Widget _buildTransportStep(String Function(String) s) {
    return _StepContainer(
      title: s('transport'),
      subtitle: s('transport_sub'),
      child: Column(
        children: [
          _TransportCard(
            title: s('own_vehicle'),
            subtitle: s('own_vehicle_sub'),
            icon: Icons.local_shipping,
            isSelected: _hasTransport == true,
            onTap: () {
              setState(() => _hasTransport = true);
              _submitSearch();
            },
          ),
          const SizedBox(height: 16),
          _TransportCard(
            title: s('rental_vehicle'),
            subtitle: s('rental_vehicle_sub'),
            icon: Icons.delivery_dining,
            isSelected: _hasTransport == false, // Treats rental as normal cost
            onTap: () {
              setState(() => _hasTransport = false);
              _submitSearch();
            },
          ),
          const SizedBox(height: 16),
          _TransportCard(
            title: s('no_vehicle'),
            subtitle: s('no_vehicle_sub'),
            icon: Icons.not_listed_location,
            isSelected: _hasTransport == null, // Wait for buyer pickup
            onTap: () {
              setState(() => _hasTransport = null); // Handled differently in a full impl
              // For now, map to false to let optimizer run
              setState(() => _hasTransport = false);
              _submitSearch();
            },
          ),
        ],
      ),
    );
  }
}

class _StepContainer extends StatelessWidget {
  final String title;
  final String subtitle;
  final Widget child;

  const _StepContainer({
    required this.title,
    required this.subtitle,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(title,
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(subtitle,
              style: const TextStyle(fontSize: 14, color: Colors.grey)),
          const SizedBox(height: 32),
          Expanded(child: child),
        ],
      ),
    );
  }
}

class _TransportCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final bool isSelected;
  final VoidCallback onTap;

  const _TransportCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.isSelected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: isSelected ? AppTheme.forestGreen : const Color(0xFFE0E0E0),
            width: isSelected ? 2 : 1,
          ),
          boxShadow: const [
            BoxShadow(
              color: Color(0x0A000000),
              blurRadius: 8,
              offset: Offset(0, 2),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: AppTheme.forestGreen.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, color: AppTheme.forestGreen),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title,
                      style: const TextStyle(
                          fontSize: 16, fontWeight: FontWeight.bold)),
                  Text(subtitle,
                      style: const TextStyle(fontSize: 13, color: Colors.grey)),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
          ],
        ),
      ),
    );
  }
}
