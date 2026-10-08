import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../core/constants/app_constants.dart';
import '../../localization/app_strings.dart';
import '../../providers/language_provider.dart';
import '../../services/buyer_service.dart';

class PostDemandScreen extends StatefulWidget {
  const PostDemandScreen({super.key});

  @override
  State<PostDemandScreen> createState() => _PostDemandScreenState();
}

class _PostDemandScreenState extends State<PostDemandScreen> {
  final _formKey = GlobalKey<FormState>();

  String _crop = 'Tomato';
  String _quantity = '';
  String _price = '';
  String _grade = 'A';
  bool _canDeliver = true;
  bool _isSubmitting = false;
  bool _isDone = false;

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    
    setState(() => _isSubmitting = true);
    
    try {
      await buyerService.postBuyer({
        'companyName': 'Farmer Direct',
        'type': 'Farmer',
        'crop': _crop,
        'quantityKg': int.parse(_quantity),
        'offerPrice': double.parse(_price),
        'grade': _grade,
        'city': 'Nalgonda',
        'latitude': 17.05,
        'longitude': 79.27,
        'pickupProvided': !_canDeliver,
        'requiredBy': DateTime.now().add(const Duration(days: 7)).toIso8601String(),
        'paymentDays': 0,
      });
      
      if (mounted) setState(() => _isDone = true);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final lang = context.watch<LanguageProvider>().langCode;
    final s = (String k) => AppStrings.get(k, lang);

    if (_isDone) {
      return Scaffold(
        backgroundColor: AppTheme.warmCream,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  padding: const EdgeInsets.all(24),
                  decoration: BoxDecoration(
                    color: AppTheme.forestGreen.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.check_circle,
                      color: AppTheme.forestGreen, size: 64),
                ),
                const SizedBox(height: 24),
                Text(
                  s('demand_posted'),
                  style: const TextStyle(
                      fontSize: 24, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Text(
                  s('demand_posted_sub'),
                  textAlign: TextAlign.center,
                  style: const TextStyle(color: Colors.grey, height: 1.5),
                ),
                const SizedBox(height: 48),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () {
                      setState(() {
                        _isDone = false;
                        _quantity = '';
                        _price = '';
                      });
                    },
                    child: Text(s('post_another')),
                  ),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: AppTheme.warmCream,
      appBar: AppBar(title: Text(s('post_demand'))),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                s('post_your_harvest'),
                style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 24),

              // Form fields
              _buildDropdown(s('crop_label'), AppConstants.crops.map((c) => c['id']!).toList(), _crop, (v) => setState(() => _crop = v!)),
              const SizedBox(height: 16),
              
              Row(
                children: [
                  Expanded(
                    child: _buildInput(s('qty_label'), TextInputType.number, (v) => _quantity = v, _quantity),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: _buildInput(s('price_label'), TextInputType.number, (v) => _price = v, _price),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              
              _buildDropdown(s('grade_label'), AppConstants.gradeOptions, _grade, (v) => setState(() => _grade = v!)),
              const SizedBox(height: 24),

              // Switch
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFFE0E0E0)),
                ),
                child: SwitchListTile(
                  title: Text(s('pickup_switch')),
                  value: _canDeliver,
                  onChanged: (v) => setState(() => _canDeliver = v),
                  activeTrackColor: AppTheme.forestGreen,
                  contentPadding: EdgeInsets.zero,
                ),
              ),
              
              const SizedBox(height: 48),
              
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submit,
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 24, height: 24,
                          child: CircularProgressIndicator(color: Colors.white))
                      : Text(s('submit_demand')),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildDropdown(String label, List<String> items, String value, void Function(String?) onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        DropdownButtonFormField<String>(
          initialValue: value,
          items: items.map((i) => DropdownMenuItem(value: i, child: Text(i))).toList(),
          onChanged: onChanged,
        ),
      ],
    );
  }

  Widget _buildInput(String label, TextInputType type, void Function(String) onChanged, String initial) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        TextFormField(
          initialValue: initial,
          keyboardType: type,
          onChanged: onChanged,
          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
        ),
      ],
    );
  }
}
