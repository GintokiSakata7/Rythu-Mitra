import 'package:flutter/foundation.dart';
import '../models/app_models.dart';

class NotificationProvider extends ChangeNotifier {
  final List<AppNotification> _notifications = [
    AppNotification(
      id: 'n1',
      title: 'Price Alert: Tomato',
      message: 'Tomato prices increased by 5% in Gaddiannaram Market today.',
      time: '10 mins ago',
      iconName: 'trending_up',
      colorHex: '#4CAF50', // successGreen
      isRead: false,
    ),
    AppNotification(
      id: 'n2',
      title: 'New Buyer Response',
      message: 'A new buyer is interested in your 5000 kg Tomato demand.',
      time: '1 hour ago',
      iconName: 'handshake',
      colorHex: '#2E7D32', // forestGreen
      isRead: false,
    ),
    AppNotification(
      id: 'n3',
      title: 'Demand Update',
      message: 'Your demand received 3 total buyer responses so far.',
      time: '3 hours ago',
      iconName: 'people',
      colorHex: '#2196F3', // blue
      isRead: true,
    ),
    AppNotification(
      id: 'n4',
      title: 'Recommendation Changed',
      message: 'Based on current traffic, Miryalaguda is now your best market option.',
      time: 'Yesterday',
      iconName: 'map',
      colorHex: '#FDB813', // harvestGold
      isRead: true,
    ),
  ];

  List<AppNotification> get notifications => List.unmodifiable(_notifications);

  int get unreadCount => _notifications.where((n) => !n.isRead).length;

  void markAsRead(String id) {
    final index = _notifications.indexWhere((n) => n.id == id);
    if (index != -1 && !_notifications[index].isRead) {
      _notifications[index].isRead = true;
      notifyListeners();
    }
  }

  void markAllAsRead() {
    bool changed = false;
    for (var n in _notifications) {
      if (!n.isRead) {
        n.isRead = true;
        changed = true;
      }
    }
    if (changed) {
      notifyListeners();
    }
  }

  void clearAll() {
    _notifications.clear();
    notifyListeners();
  }
}
