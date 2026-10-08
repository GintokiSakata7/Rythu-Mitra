import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../../models/app_models.dart';
import 'package:url_launcher/url_launcher.dart';

class BuyerDetailsScreen extends StatelessWidget {
  final BuyerModel buyer;

  const BuyerDetailsScreen({super.key, required this.buyer});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(buyer.companyName),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Main card
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        buyer.type,
                        style: const TextStyle(
                            color: Color(0xFF1565C0),
                            fontWeight: FontWeight.w600),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 4),
                        decoration: BoxDecoration(
                          color: AppTheme.forestGreen.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          buyer.status,
                          style: const TextStyle(
                              color: AppTheme.forestGreen, fontSize: 12),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Text(
                    buyer.companyName,
                    style: const TextStyle(
                        fontSize: 24, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.location_on,
                          color: Colors.grey, size: 16),
                      const SizedBox(width: 4),
                      Text(
                        buyer.city,
                        style: const TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Requirement card
            const Text(
              'Requirement Details',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE0E0E0)),
              ),
              child: Column(
                children: [
                  _ReqRow('Crop', buyer.crop),
                  const Divider(),
                  _ReqRow('Quantity', '${buyer.quantityKg} kg'),
                  const Divider(),
                  _ReqRow('Offer Price', '₹${buyer.offerPrice}/kg',
                      isHighlight: true),
                  const Divider(),
                  _ReqRow('Required By', buyer.requiredBy.split('T')[0]),
                  const Divider(),
                  _ReqRow('Payment Terms', '${buyer.paymentDays} days'),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Logistics
            const Text(
              'Logistics',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFE0E0E0)),
              ),
              child: Row(
                children: [
                  Icon(
                      buyer.pickupProvided
                          ? Icons.local_shipping
                          : Icons.transfer_within_a_station,
                      color: AppTheme.forestGreen),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          buyer.pickupProvided
                              ? 'Buyer provides pickup'
                              : 'Farmer must arrange transport',
                          style: const TextStyle(
                              fontWeight: FontWeight.bold, fontSize: 15),
                        ),
                        if (buyer.pickupProvided)
                          const Text(
                            'Transport costs are covered by the buyer.',
                            style: TextStyle(fontSize: 13, color: Colors.grey),
                          ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            // Action
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                onPressed: () async {
                  final uri = Uri.parse(
                      'tel:1800123456'); // Mock contact
                  if (await canLaunchUrl(uri)) {
                    await launchUrl(uri);
                  }
                },
                icon: const Icon(Icons.phone),
                label: const Text('Contact Buyer'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ReqRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isHighlight;

  const _ReqRow(this.label, this.value, {this.isHighlight = false});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.black54)),
          Text(
            value,
            style: TextStyle(
              fontWeight: FontWeight.bold,
              color: isHighlight ? AppTheme.successGreen : Colors.black87,
              fontSize: isHighlight ? 18 : 14,
            ),
          ),
        ],
      ),
    );
  }
}
