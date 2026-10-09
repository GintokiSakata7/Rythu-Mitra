import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../core/theme/app_theme.dart';
import '../../providers/notification_provider.dart';
import '../../models/app_models.dart';

class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final prov = context.watch<NotificationProvider>();
    final notifications = prov.notifications;

    return Scaffold(
      backgroundColor: AppTheme.warmCream,
      appBar: AppBar(
        title: const Text('Notifications'),
        actions: [
          if (prov.unreadCount > 0)
            TextButton(
              onPressed: () => prov.markAllAsRead(),
              child: const Text('Mark all read', style: TextStyle(color: Colors.white)),
            ),
          IconButton(
            icon: const Icon(Icons.delete_outline),
            onPressed: () => prov.clearAll(),
            tooltip: 'Clear All',
          )
        ],
      ),
      body: notifications.isEmpty
          ? const Center(child: Text('No notifications right now.'))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: notifications.length,
              itemBuilder: (context, i) {
                final n = notifications[i];
                return _buildNotificationCard(
                  context,
                  notification: n,
                  onTap: () {
                    prov.markAsRead(n.id);
                  },
                );
              },
            ),
    );
  }

  Widget _buildNotificationCard(
    BuildContext context, {
    required AppNotification notification,
    required VoidCallback onTap,
  }) {
    IconData icon;
    switch (notification.iconName) {
      case 'trending_up': icon = Icons.trending_up; break;
      case 'handshake': icon = Icons.handshake; break;
      case 'people': icon = Icons.people; break;
      case 'map': icon = Icons.map; break;
      default: icon = Icons.notifications;
    }

    Color color;
    switch (notification.colorHex) {
      case '#4CAF50': color = AppTheme.successGreen; break;
      case '#2E7D32': color = AppTheme.forestGreen; break;
      case '#2196F3': color = Colors.blue; break;
      case '#FDB813': color = AppTheme.harvestGold; break;
      default: color = AppTheme.forestGreen;
    }

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: !notification.isRead ? Colors.white : Colors.grey.shade50,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: !notification.isRead ? AppTheme.harvestGold.withValues(alpha: 0.5) : const Color(0xFFE0E0E0),
            width: !notification.isRead ? 2 : 1,
          ),
          boxShadow: !notification.isRead
              ? [
                  BoxShadow(
                    color: AppTheme.harvestGold.withValues(alpha: 0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  )
                ]
              : null,
        ),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.1),
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: color, size: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          notification.title,
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: !notification.isRead ? FontWeight.bold : FontWeight.w600,
                          ),
                        ),
                      ),
                      Text(
                        notification.time,
                        style: TextStyle(
                          fontSize: 12,
                          color: !notification.isRead ? AppTheme.forestGreen : Colors.grey,
                          fontWeight: !notification.isRead ? FontWeight.bold : FontWeight.normal,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 6),
                  Text(
                    notification.message,
                    style: TextStyle(
                      fontSize: 14,
                      color: !notification.isRead ? Colors.black87 : Colors.black54,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

