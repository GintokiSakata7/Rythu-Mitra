import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class SearchRadarAnimation extends StatefulWidget {
  final String statusText;
  final List<String> logLines;

  const SearchRadarAnimation({
    super.key,
    required this.statusText,
    required this.logLines,
  });

  @override
  State<SearchRadarAnimation> createState() => _SearchRadarAnimationState();
}

class _SearchRadarAnimationState extends State<SearchRadarAnimation>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Radar animation
        SizedBox(
          width: 180,
          height: 180,
          child: AnimatedBuilder(
            animation: _controller,
            builder: (context, child) {
              return CustomPaint(
                painter: _RadarPainter(_controller.value),
                child: const Center(
                  child: Icon(
                    Icons.agriculture_rounded,
                    color: AppTheme.forestGreen,
                    size: 48,
                  ),
                ),
              );
            },
          ),
        ),
        const SizedBox(height: 32),

        // Status text
        Text(
          widget.statusText,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
            color: AppTheme.forestGreen,
          ),
          textAlign: TextAlign.center,
        ),
        const SizedBox(height: 20),

        // Log lines
        ...widget.logLines.map(
          (line) => Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.check_circle,
                    color: AppTheme.leafGreen, size: 16),
                const SizedBox(width: 8),
                Text(
                  line,
                  style: const TextStyle(
                      fontSize: 14, color: Colors.black54),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _RadarPainter extends CustomPainter {
  final double animValue;
  _RadarPainter(this.animValue);

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final maxRadius = size.width / 2;

    for (int i = 0; i < 3; i++) {
      final phase = (animValue + i / 3) % 1.0;
      final radius = maxRadius * phase;
      final opacity = (1.0 - phase) * 0.4;

      final paint = Paint()
        ..color = AppTheme.forestGreen.withValues(alpha: opacity)
        ..style = PaintingStyle.stroke
        ..strokeWidth = 2.0;

      canvas.drawCircle(center, radius, paint);
    }

    // Center circle
    final centerPaint = Paint()
      ..color = AppTheme.forestGreen.withValues(alpha: 0.1)
      ..style = PaintingStyle.fill;
    canvas.drawCircle(center, 50, centerPaint);
  }

  @override
  bool shouldRepaint(_RadarPainter oldDelegate) =>
      oldDelegate.animValue != animValue;
}
