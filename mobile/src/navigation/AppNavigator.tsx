import React, { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { enableScreens } from 'react-native-screens';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  BottomTabBarProps,
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SensorsScreen from '../screens/SensorsScreen';
import BatchesScreen from '../screens/BatchesScreen';
import BatchDetailScreen from '../screens/BatchDetailScreen';
import FactoryScreen from '../screens/FactoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { theme } from '../theme';

enableScreens();

export type AuthStackParamList = {
  Login: undefined;
};

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

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack  = createNativeStackNavigator<AppStackParamList>();
const Tab       = createBottomTabNavigator<TabParamList>();

type IconName = keyof typeof Ionicons.glyphMap;

const TAB_ICONS: Record<keyof TabParamList, IconName> = {
  Dashboard: 'home',
  Sensors:   'pulse',
  Batches:   'card',
  Factory:   'business',
  Profile:   'settings-sharp',
};

/* -------- Floating pill tab bar (matches the reference image) -------- */

function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 12);

  return (
    <View pointerEvents="box-none" style={[tabStyles.wrap, { bottom }]}>
      <View style={tabStyles.pill}>
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

          const iconName = TAB_ICONS[route.name as keyof TabParamList] ?? 'ellipse';

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel ?? route.name}
              onPress={onPress}
              onLongPress={onLongPress}
              style={tabStyles.item}
              hitSlop={6}
            >
              {focused ? (
                <View style={tabStyles.activeBubble}>
                  <Ionicons name={iconName} size={22} color={theme.colors.primary} />
                </View>
              ) : (
                <Ionicons name={iconName} size={22} color={theme.colors.darkMuted} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.dark,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 9,
    height: 68,
    borderWidth: 1,
    borderColor: theme.colors.darkSoft,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.28,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 12,
  },
  item: {
    width: 55,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

/* -------- Navigators -------- */

function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={props => <FloatingTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerShadowVisible: false,
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: '700', color: theme.colors.text },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Sensors"   component={SensorsScreen} />
      <Tab.Screen name="Batches"   component={BatchesScreen} />
      <Tab.Screen name="Factory"   component={FactoryScreen} />
      <Tab.Screen name="Profile"   component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <AppStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.background },
        headerShadowVisible: false,
        headerTintColor: theme.colors.text,
        headerTitleStyle: { fontWeight: '700', color: theme.colors.text },
      }}
    >
      <AppStack.Screen name="Tabs"        component={MainTabs}         options={{ headerShown: false }} />
      <AppStack.Screen name="BatchDetail" component={BatchDetailScreen} options={{ title: 'Batch Detail' }} />
    </AppStack.Navigator>
  );
}

export default function RootNavigator() {
  const role = useAuthStore(s => s.role);
  const factoryId = useAuthStore(s => s.factoryId);
  const updateProfile = useAuthStore(s => s.updateProfile);

  useEffect(() => {
    if (factoryId === 'F001') {
      updateProfile({ factoryId: 'FAC001' });
    }
  }, [factoryId, updateProfile]);

  return (
    <NavigationContainer>
      {role === null ? <AuthNavigator /> : <AppNavigator />}
    </NavigationContainer>
  );
}
