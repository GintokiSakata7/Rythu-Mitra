import 'package:intl/intl.dart';

class CurrencyFormatter {
  static final _inrFormat = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 0,
  );

  static final _inrDecimalFormat = NumberFormat.currency(
    locale: 'en_IN',
    symbol: '₹',
    decimalDigits: 2,
  );

  static String format(double amount) {
    if (amount < 0) {
      return '−₹${_inrFormat.format(amount.abs()).replaceAll('₹', '').trim()}';
    }
    return _inrFormat.format(amount);
  }

  static String formatDecimal(double amount) {
    if (amount < 0) {
      return '−₹${_inrDecimalFormat.format(amount.abs()).replaceAll('₹', '').trim()}';
    }
    return _inrDecimalFormat.format(amount);
  }

  static String formatCompact(double amount) {
    final prefix = amount < 0 ? '−₹' : '₹';
    final absAmount = amount.abs();
    if (absAmount >= 100000) {
      return '$prefix${(absAmount / 100000).toStringAsFixed(1)}L';
    } else if (absAmount >= 1000) {
      return '$prefix${(absAmount / 1000).toStringAsFixed(1)}K';
    }
    return format(amount);
  }
}
