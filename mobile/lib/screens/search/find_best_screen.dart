import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/constants/app_constants.dart';
import '../../localization/app_strings.dart';
import '../../providers/language_provider.dart';
import '../../models/app_models.dart';
import '../../location/location_service.dart';
import 'search_animation_screen.dart';
import 'crop_search_bottom_sheet.dart';

import '../../providers/location_provider.dart';

class FindBestScreen extends StatefulWidget {
  final String? initialCrop;
  final double? initialQuantity;
  final String? initialUnit;

  const FindBestScreen({
    super.key,
    this.initialCrop,
    this.initialQuantity,
    this.initialUnit,
  });

  @override
  State<FindBestScreen> createState() => _FindBestScreenState();
}

class _FindBestScreenState extends State<FindBestScreen> {
  final PageController _pageController = PageController();
  int _currentStep = 0;

  // Form state
  String? _selectedCrop;
  double _quantity = 15; // default 15
  String _quantityUnit = 'Quintal'; // 'Quintal', 'Ton', 'kg'
  final TextEditingController _quantityController = TextEditingController(text: '15');
  String _locationName = 'Hyderabad';
  double _lat = 17.385;
  double _lng = 78.4867;
  bool? _hasTransport;
  bool _isDetectingLocation = false;
  bool _isGpsSelected = false;

  @override
  void initState() {
    super.initState();
    if (widget.initialCrop != null) {
      _selectedCrop = widget.initialCrop;
    }
    if (widget.initialQuantity != null) {
      _quantity = widget.initialQuantity!;
      _quantityController.text = _quantity.toStringAsFixed(0);
    }
    if (widget.initialUnit != null) {
      _quantityUnit = widget.initialUnit!;
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final locProv = context.read<LocationProvider>();
      if (locProv.currentLocation != null) {
        setState(() {
          _isGpsSelected = true;
          _locationName = locProv.currentLocation!.displayName ?? locProv.displayName;
          _lat = locProv.currentLocation!.lat;
          _lng = locProv.currentLocation!.lng;
        });
      } else if (locProv.hasLocation) {
        setState(() {
          _locationName = locProv.displayName;
          _lat = locProv.latitude;
          _lng = locProv.longitude;
        });
      }
    });
  }

  Future<void> _detectGpsLocation() async {
    setState(() => _isDetectingLocation = true);
    final loc = await locationService.getCurrentLocation();
    if (!mounted) return;
    setState(() => _isDetectingLocation = false);

    if (loc.result != null) {
      final res = loc.result!;
      setState(() {
        _locationName = res.displayName ?? 'Current Device Location';
        _lat = res.lat;
        _lng = res.lng;
        _isGpsSelected = true;
      });
      // Also update global provider
      context.read<LocationProvider>().setManualLocation(_locationName, _lat, _lng);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('📍 GPS Detected: $_locationName'),
          backgroundColor: AppTheme.forestGreen,
          duration: const Duration(seconds: 3),
        ),
      );
    } else if (loc.error != null) {
      if (loc.error!.type == LocationErrorType.gpsDisabled) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Row(
              children: [
                Icon(Icons.location_off, color: AppTheme.dangerRed),
                SizedBox(width: 8),
                Text('GPS Disabled'),
              ],
            ),
            content: const Text(
              'Location services are disabled on your phone. Please turn on GPS to allow RythuMitra to detect your farm coordinates.',
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
      } else if (loc.error!.type == LocationErrorType.permissionPermanentlyDenied) {
        showDialog(
          context: context,
          builder: (ctx) => AlertDialog(
            title: const Text('Location Permission Needed'),
            content: const Text(
              'Location permission was permanently denied. Please grant permission in App Settings to use device GPS.',
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
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(loc.error!.message)),
        );
      }
    }
  }

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

  @override
  void dispose() {
    _pageController.dispose();
    _quantityController.dispose();
    super.dispose();
  }

  Future<void> _submitSearch() async {
    // Convert to kg based on unit
    double quantityInKg = _quantity;
    if (_quantityUnit == 'Quintal') {
      quantityInKg = _quantity * 100;
    } else if (_quantityUnit == 'Ton') {
      quantityInKg = _quantity * 1000;
    }

    final request = RecommendationRequest(
      crop: _selectedCrop!,
      quantityKg: quantityInKg.toInt(),
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
        actions: [
          IconButton(
            icon: const Icon(Icons.help_outline),
            onPressed: () {
              showModalBottomSheet(
                context: context,
                backgroundColor: Colors.transparent,
                builder: (_) => Container(
                  padding: const EdgeInsets.all(24),
                  decoration: const BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Icon(Icons.info_outline, size: 48, color: AppTheme.forestGreen),
                      const SizedBox(height: 16),
                      const Text('How does this work?', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                      const SizedBox(height: 16),
                      const Text(
                        'Enter your crop, quantity, and location. We calculate the net realization (revenue minus transport and other costs) to find the most profitable market for you, not just the one with the highest price.',
                        style: TextStyle(fontSize: 16, height: 1.5, color: Colors.black87),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        style: ElevatedButton.styleFrom(backgroundColor: AppTheme.forestGreen, foregroundColor: Colors.white),
                        child: const Text('Got it'),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ],
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
        itemCount: 6, // Show first 5 crops + 1 View All button
        itemBuilder: (context, i) {
          if (i == 5) {
            return Semantics(
              button: true,
              label: 'View All Crops',
              child: GestureDetector(
                onTap: () async {
                  final result = await showModalBottomSheet<String>(
                    context: context,
                    isScrollControlled: true,
                    backgroundColor: Colors.transparent,
                    builder: (_) => CropSearchBottomSheet(
                        langCode: context.read<LanguageProvider>().langCode),
                  );
                  if (result != null) {
                    setState(() => _selectedCrop = result);
                    Future.delayed(const Duration(milliseconds: 300), _nextStep);
                  }
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: AppTheme.harvestGold.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppTheme.harvestGold),
                  ),
                  child: const Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.search, color: AppTheme.harvestGold, size: 32),
                      SizedBox(height: 8),
                      Text('View All',
                          style: TextStyle(
                              color: AppTheme.harvestGold,
                              fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            );
          }

          final crop = AppConstants.crops[i];
          final isSelected = _selectedCrop == crop['id'];
          final lang = context.watch<LanguageProvider>().langCode;
          final title = crop[lang] ?? crop['en']!;

          return Semantics(
            button: true,
            label: 'Select $title',
            child: GestureDetector(
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
          Expanded(
            child: SingleChildScrollView(
              child: Column(
                children: [
          Container(
            padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFFE8F5E9)),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                SizedBox(
                  width: 120,
                  child: TextFormField(
                    controller: _quantityController,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    textAlign: TextAlign.center,
                    style: const TextStyle(
                      fontSize: 48,
                      fontWeight: FontWeight.bold,
                      color: AppTheme.forestGreen,
                    ),
                    decoration: InputDecoration(
                      border: InputBorder.none,
                      isDense: true,
                      contentPadding: EdgeInsets.zero,
                      hintText: '0',
                      hintStyle: TextStyle(
                        fontSize: 48,
                        color: Colors.grey.withValues(alpha: 0.5),
                      ),
                    ),
                    onChanged: (val) {
                      final parsed = double.tryParse(val);
                      if (parsed != null && parsed >= 0) {
                        setState(() => _quantity = parsed);
                      }
                    },
                  ),
                ),
                const SizedBox(width: 16),
                DropdownButton<String>(
                  value: _quantityUnit,
                  underline: const SizedBox(),
                  icon: const Icon(Icons.keyboard_arrow_down_rounded, color: AppTheme.forestGreen),
                  style: const TextStyle(fontSize: 24, color: Colors.grey, fontWeight: FontWeight.w500),
                  items: ['Quintal', 'Ton', 'kg']
                      .map((unit) => DropdownMenuItem(
                            value: unit,
                            child: Text(unit),
                          ))
                      .toList(),
                  onChanged: (val) {
                    if (val != null) {
                      setState(() => _quantityUnit = val);
                    }
                  },
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
              value: _quantity.clamp(0.0, 500.0),
              min: 0,
              max: 500,
              divisions: 100,
              onChanged: (v) {
                setState(() {
                  _quantity = v;
                  _quantityController.text = v.toStringAsFixed(v.truncateToDouble() == v ? 0 : 1);
                });
              },
            ),
          ),
          const SizedBox(height: 24),
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [5, 10, 15, 25, 50, 100].map((q) {
              final isSelected = _quantity == q.toDouble();
              return ChoiceChip(
                label: Text(
                  '$q $_quantityUnit',
                  style: TextStyle(
                    color: isSelected ? Colors.white : Colors.black87,
                  ),
                ),
                selected: isSelected,
                onSelected: (_) {
                  setState(() {
                    _quantity = q.toDouble();
                    _quantityController.text = _quantity.toStringAsFixed(0);
                  });
                },
                selectedColor: AppTheme.forestGreen,
              );
            }).toList(),
          ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _prevStep,
                  child: Text(s('back')),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    final parsed = double.tryParse(_quantityController.text);
                    if (parsed == null || parsed <= 0) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please enter a valid quantity greater than 0.')),
                      );
                      return;
                    }
                    _nextStep();
                  },
                  child: Text(s('next')),
                ),
              ),
            ],
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
          if (_isGpsSelected)
            Container(
              margin: const EdgeInsets.only(bottom: 16),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFFE8F5E9),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: AppTheme.forestGreen, width: 2),
                boxShadow: [
                  BoxShadow(
                    color: AppTheme.forestGreen.withValues(alpha: 0.1),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: const BoxDecoration(
                      color: AppTheme.forestGreen,
                      shape: BoxShape.circle,
                    ),
                    child: const Icon(Icons.check, color: Colors.white, size: 20),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          '📍 GPS LOCATION ACTIVE',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.bold,
                            color: AppTheme.forestGreen,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          _locationName,
                          style: const TextStyle(
                            fontSize: 15,
                            fontWeight: FontWeight.bold,
                            color: Colors.black87,
                          ),
                        ),
                        Text(
                          'Lat: ${_lat.toStringAsFixed(4)}, Lng: ${_lng.toStringAsFixed(4)}',
                          style: const TextStyle(fontSize: 11, color: Colors.black54),
                        ),
                      ],
                    ),
                  ),
                  IconButton(
                    icon: _isDetectingLocation
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.forestGreen),
                          )
                        : const Icon(Icons.refresh, color: AppTheme.forestGreen),
                    tooltip: 'Re-detect GPS',
                    onPressed: _isDetectingLocation ? null : _detectGpsLocation,
                  ),
                ],
              ),
            )
          else
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: _isDetectingLocation ? null : _detectGpsLocation,
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
                  style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.bold, fontSize: 15),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.harvestGold,
                  foregroundColor: Colors.black87,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  elevation: 2,
                ),
              ),
            ),
          const SizedBox(height: 20),
          const Row(
            children: [
              Expanded(child: Divider()),
              Padding(
                padding: EdgeInsets.symmetric(horizontal: 16),
                child: Text('OR CHOOSE TOWN / MANDI',
                    style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
              ),
              Expanded(child: Divider()),
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView(
              children: AppConstants.presetLocations.map((loc) {
                final isSelected = !_isGpsSelected && _locationName == loc['name'];
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
                    leading: Icon(Icons.location_city, color: isSelected ? AppTheme.forestGreen : Colors.grey),
                    title: Text(loc['name']!, style: TextStyle(fontWeight: isSelected ? FontWeight.bold : FontWeight.normal)),
                    subtitle: Text('Lat: ${loc['lat']}, Lng: ${loc['lng']}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
                    trailing: isSelected
                        ? const Icon(Icons.check_circle, color: AppTheme.forestGreen)
                        : null,
                    onTap: () {
                      setState(() {
                        _isGpsSelected = false;
                        _locationName = loc['name'];
                        _lat = (loc['lat'] as num).toDouble();
                        _lng = (loc['lng'] as num).toDouble();
                      });
                    },
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _prevStep,
                  child: Text(s('back')),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: ElevatedButton(
                  onPressed: () {
                    if (_locationName.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Please select a location first.')),
                      );
                      return;
                    }
                    _nextStep();
                  },
                  child: Text(s('next')),
                ),
              ),
            ],
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
            title: s('no_vehicle'),
            subtitle: s('no_vehicle_sub'),
            icon: Icons.not_listed_location,
            isSelected: _hasTransport == false, // False means no transport
            onTap: () {
              setState(() => _hasTransport = false);
              _submitSearch();
            },
          ),
          const Spacer(),
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: _prevStep,
              child: Text(s('back')),
            ),
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
