import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DashboardScreen from '../screens/DashboardScreen';
import SensorsScreen from '../screens/SensorsScreen';
import BatchesScreen from '../screens/BatchesScreen';
import BatchDetailScreen from '../screens/BatchDetailScreen';
import FactoryScreen from '../screens/FactoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LoginScreen from '../screens/LoginScreen';
import { useAuthStore } from '../store/authStore';
import { useConnectionStore } from '../store/connectionStore';
import { AppTheme, useAppTheme } from '../theme';

enableScreens();

export type AppStackParamList = {
  Tabs: undefined;
  BatchDetail: { batchId: string };
};

export type TabParamList = {
  Dashboard: undefined;
  Sensors: undefined;
  Batches: undefined;
  Factory: undefined;
  Profile: undefined;
};

const AppStack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<keyof TabParamList, IconName> = {
  Dashboard: 'home',
  Sensors: 'pulse',
  Batches: 'layers',
  Factory: 'business',
  Profile: 'person',
};

const TAB_ICONS_INACTIVE: Record<keyof TabParamList, IconName> = {
  Dashboard: 'home-outline',
  Sensors: 'pulse-outline',
  Batches: 'layers-outline',
  Factory: 'business-outline',
  Profile: 'person-outline',
};

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const theme = useAppTheme();
  const styles = makeTabStyles(theme);
  const bottom = Math.max(insets.bottom, 12);

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom }]}>
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          const onLongPress = () => {
            navigation.emit({ type: 'tabLongPress', target: route.key });
          };

          const tabName = route.name as keyof TabParamList;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? route.name}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.item,
                focused && styles.itemActive,
                pressed && styles.itemPressed,
              ]}
              hitSlop={6}
            >
              <Ionicons
                name={focused ? TAB_ICONS[tabName] : TAB_ICONS_INACTIVE[tabName]}
                size={20}
                color={focused ? theme.colors.ink : theme.colors.textMuted}
              />
              <Text style={[styles.label, focused && styles.labelActive]}>{route.name}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function MainTabs() {
  const theme = useAppTheme();
  return (
    <Tab.Navigator
      tabBar={props => <FloatingTabBar {...props} />}
      sceneContainerStyle={{ backgroundColor: theme.colors.background }}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Sensors" component={SensorsScreen} />
      <Tab.Screen name="Batches" component={BatchesScreen} />
      <Tab.Screen name="Factory" component={FactoryScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const theme = useAppTheme();
  return (
    <AppStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <AppStack.Screen name="Tabs" component={MainTabs} />
      <AppStack.Screen name="BatchDetail" component={BatchDetailScreen} />
    </AppStack.Navigator>
  );
}

export default function RootNavigator() {
  const theme = useAppTheme();
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const accountReady = useAuthStore(state => state.hasHydrated);
  const connectionReady = useConnectionStore(state => state.hasHydrated);
  const baseTheme = theme.mode === 'dark' ? DarkTheme : DefaultTheme;
  const navigationTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: theme.colors.primary,
      background: theme.colors.background,
      card: theme.colors.surface,
      text: theme.colors.text,
      border: theme.colors.border,
      notification: theme.colors.primary,
    },
  };

  if (!accountReady || !connectionReady) {
    return (
      <View style={[styles.loading, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.textMuted }]}>Loading officer desk</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <AppNavigator />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { fontSize: 12, fontWeight: '700', marginTop: 12 },
});

const makeTabStyles = (theme: AppTheme) => StyleSheet.create({
  wrap: { position: 'absolute', left: 14, right: 14 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.nav,
    borderRadius: 24,
    padding: 6,
    height: 70,
    borderWidth: 1,
    borderColor: theme.colors.navBorder,
    shadowColor: '#000',
    shadowOpacity: theme.mode === 'dark' ? 0.5 : 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 14,
  },
  item: {
    flex: 1,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  itemActive: { backgroundColor: theme.colors.primary },
  itemPressed: { opacity: 0.78, transform: [{ scale: 0.96 }] },
  label: {
    color: theme.colors.textMuted,
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  labelActive: { color: theme.colors.ink },
});
