class MarketTrendItem {
  final int id;
  final String date;
  final String market;
  final String amcName;
  final int? yardCode;
  final String crop;
  final String variety;
  final double arrivalsQuintal;
  final double progArrivalsQuintal;
  final double minPriceQuintal;
  final double maxPriceQuintal;
  final double modalPriceQuintal;
  final double minPriceKg;
  final double maxPriceKg;
  final double modalPriceKg;
  final double valuation;
  final double marketFee;

  MarketTrendItem({
    required this.id,
    required this.date,
    required this.market,
    required this.amcName,
    this.yardCode,
    required this.crop,
    required this.variety,
    required this.arrivalsQuintal,
    this.progArrivalsQuintal = 0.0,
    required this.minPriceQuintal,
    required this.maxPriceQuintal,
    required this.modalPriceQuintal,
    required this.minPriceKg,
    required this.maxPriceKg,
    required this.modalPriceKg,
    this.valuation = 0.0,
    this.marketFee = 0.0,
  });

  factory MarketTrendItem.fromJson(Map<String, dynamic> json) {
    final minQ = _parseDouble(
        json['minPriceQuintal'] ?? json['min_price'] ?? json['Minimum']);
    final maxQ = _parseDouble(
        json['maxPriceQuintal'] ?? json['max_price'] ?? json['Maximum']);
    final modQ = _parseDouble(
        json['modalPriceQuintal'] ?? json['modal_price'] ?? json['Model']);

    final minKg = json['minPriceKg'] != null
        ? _parseDouble(json['minPriceKg'])
        : (minQ / 100.0);
    final maxKg = json['maxPriceKg'] != null
        ? _parseDouble(json['maxPriceKg'])
        : (maxQ / 100.0);
    final modKg = json['modalPriceKg'] != null
        ? _parseDouble(json['modalPriceKg'])
        : (modQ / 100.0);

    return MarketTrendItem(
      id: _parseInt(json['id']),
      date: (json['date'] ?? json['DDate'] ?? json['price_date'])?.toString() ?? '',
      market: (json['market'] ?? json['yard_name'] ?? json['YardName'] ?? json['AmcName'] ?? json['amc_name'])?.toString() ?? 'Telangana Mandi',
      amcName: (json['amcName'] ?? json['AmcName'] ?? json['amc_name'])?.toString() ?? '',
      yardCode: json['yardCode'] != null
          ? _parseInt(json['yardCode'])
          : (json['YardCode'] != null ? _parseInt(json['YardCode']) : _parseInt(json['yard_code'])),
      crop: (json['crop'] ?? json['commodity'] ?? json['CommName'] ?? json['commodity_name'])?.toString() ?? '',
      variety: (json['variety'] ?? json['VarityName'] ?? json['variety_name'])?.toString() ?? 'Common',
      arrivalsQuintal: _parseDouble(json['arrivalsQuintal'] ?? json['Arrivals'] ?? json['arrivals']),
      progArrivalsQuintal: _parseDouble(json['progArrivalsQuintal'] ?? json['ProgArrivals'] ?? json['prog_arrivals']),
      minPriceQuintal: minQ,
      maxPriceQuintal: maxQ,
      modalPriceQuintal: modQ,
      minPriceKg: double.parse(minKg.toStringAsFixed(2)),
      maxPriceKg: double.parse(maxKg.toStringAsFixed(2)),
      modalPriceKg: double.parse(modKg.toStringAsFixed(2)),
      valuation: _parseDouble(json['valuation'] ?? json['Valuation']),
      marketFee: _parseDouble(json['marketFee'] ?? json['MarketFee']),
    );
  }

  static int _parseInt(dynamic val) {
    if (val == null) return 0;
    if (val is int) return val;
    if (val is num) return val.toInt();
    return int.tryParse(val.toString()) ?? 0;
  }

  static double _parseDouble(dynamic val) {
    if (val == null) return 0.0;
    if (val is double) return val;
    if (val is num) return val.toDouble();
    return double.tryParse(val.toString()) ?? 0.0;
  }
}

class TrendSummary {
  final String crop;
  final String market;
  final double latestModalPriceKg;
  final double avgModalPriceKg;
  final double minPriceKg;
  final double maxPriceKg;
  final double changePct;
  final String trendDirection; // 'up', 'down', 'stable'
  final double totalArrivalsQuintals;
  final int recordCount;

  TrendSummary({
    required this.crop,
    required this.market,
    required this.latestModalPriceKg,
    required this.avgModalPriceKg,
    required this.minPriceKg,
    required this.maxPriceKg,
    required this.changePct,
    required this.trendDirection,
    required this.totalArrivalsQuintals,
    required this.recordCount,
  });

  factory TrendSummary.fromJson(Map<String, dynamic> json) {
    return TrendSummary(
      crop: json['crop']?.toString() ?? '',
      market: json['market']?.toString() ?? '',
      latestModalPriceKg: _parseDouble(json['latestModalPriceKg']),
      avgModalPriceKg: _parseDouble(json['avgModalPriceKg']),
      minPriceKg: _parseDouble(json['minPriceKg']),
      maxPriceKg: _parseDouble(json['maxPriceKg']),
      changePct: _parseDouble(json['changePct']),
      trendDirection: json['trendDirection']?.toString() ?? 'stable',
      totalArrivalsQuintals: _parseDouble(json['totalArrivalsQuintals']),
      recordCount: _parseInt(json['recordCount']),
    );
  }

  static double _parseDouble(dynamic val) {
    if (val == null) return 0.0;
    if (val is double) return val;
    if (val is num) return val.toDouble();
    return double.tryParse(val.toString()) ?? 0.0;
  }

  static int _parseInt(dynamic val) {
    if (val == null) return 0;
    if (val is int) return val;
    if (val is num) return val.toInt();
    return int.tryParse(val.toString()) ?? 0;
  }
}
