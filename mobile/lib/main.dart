import 'package:flutter/material.dart';
import 'package:showcaseview/showcaseview.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import 'core/theme/app_theme.dart';
import 'providers/language_provider.dart';
import 'providers/search_provider.dart';
import 'providers/buyer_provider.dart';
import 'providers/settings_provider.dart';
import 'providers/profile_provider.dart';
import 'providers/notification_provider.dart';
import 'screens/splash/splash_screen.dart';

import 'providers/location_provider.dart';
import 'providers/trends_provider.dart';
import 'services/demand_service.dart';
import 'voice/conversation_manager.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Force portrait mode
  await SystemChrome.setPreferredOrientations([
    DeviceOrientation.portraitUp,
    DeviceOrientation.portraitDown,
  ]);
  
  // Configure system UI
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
      systemNavigationBarColor: Colors.white,
      systemNavigationBarIconBrightness: Brightness.dark,
    ),
  );

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
        ChangeNotifierProvider(create: (_) => LocationProvider()),
        ChangeNotifierProvider(create: (_) => SearchProvider()),
        ChangeNotifierProvider(create: (_) => TrendsProvider()),
        ChangeNotifierProvider(create: (_) => BuyerProvider()),
        ChangeNotifierProvider(create: (_) => SettingsProvider()),
        ChangeNotifierProvider(create: (_) => ProfileProvider()),
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
        ChangeNotifierProvider(create: (_) => ConversationManager()),
        ChangeNotifierProvider.value(value: demandService),
      ],
      child: const RythuMitraApp(),
    ),
  );
}

class RythuMitraApp extends StatelessWidget {
  const RythuMitraApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'RythuMitra',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      builder: (context, child) => ShowCaseWidget(
        blurValue: 2.0,
        builder: (context) => child!,
      ),
      home: const SplashScreen(),
    );
  }
}
