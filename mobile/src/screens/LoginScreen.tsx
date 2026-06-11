import React, { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../store/authStore';
import { theme } from '../theme';

const logo = require('../assets/images/Logo.png');
const officerEmail = 'officer@spectraleaf.io';

type LoginPage = 'intro' | 'login';

const highlights = [
  { icon: 'pulse-outline', label: 'Live Sensors', value: '5 streams' },
  { icon: 'leaf-outline', label: 'Batch Control', value: 'GLP ready' },
  { icon: 'business-outline', label: 'Factory', value: 'FAC001' },
] as const;

export default function LoginScreen() {
  const signIn = useAuthStore(s => s.signIn);
  const [page, setPage] = useState<LoginPage>('intro');
  const [email, setEmail] = useState(officerEmail);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  const onSubmit = () => {
    signIn('FAC001', 'Factory Officer');
  };

  return (
    <SafeAreaView style={styles.safe}>
      {page === 'intro' ? (
        <IntroPage onNext={() => setPage('login')} />
      ) : (
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView contentContainerStyle={styles.loginScroll} keyboardShouldPersistTaps="handled">
            <LoginPageView
              email={email}
              password={password}
              remember={remember}
              showPassword={showPassword}
              setEmail={setEmail}
              setPassword={setPassword}
              setRemember={setRemember}
              setShowPassword={setShowPassword}
              onBack={() => setPage('intro')}
              onSubmit={onSubmit}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

function IntroPage({ onNext }: { onNext: () => void }) {
  return (
    <ScrollView contentContainerStyle={styles.introScroll}>
      <View style={styles.brandRow}>
        <View style={styles.logoBox}>
          <Image source={logo} style={styles.logoImage} resizeMode="contain" />
        </View>
        <View>
          <Text style={styles.brandText}>Spectraleaf</Text>
          <Text style={styles.brandSub}>Factory officer console</Text>
        </View>
      </View>

      <LinearGradient colors={['#050505', '#151515']} style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.livePill}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live monitoring</Text>
          </View>
          <View style={styles.iconButtonDark}>
            <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
          </View>
        </View>
        <Text style={styles.heroTitle}>Fermentation data, ready for action.</Text>
        <Text style={styles.heroText}>
          Monitor sensor readings, manage batches, and complete GLP workflows from the factory floor.
        </Text>
        <View style={styles.heroGrid}>
          {highlights.map(item => (
            <View key={item.label} style={styles.heroTile}>
              <Ionicons name={item.icon} size={18} color={theme.colors.primaryLight} />
              <Text style={styles.heroTileValue}>{item.value}</Text>
              <Text style={styles.heroTileLabel}>{item.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      <View style={styles.whitePanel}>
        <Text style={styles.panelTitle}>Officer workspace</Text>
        <View style={styles.featureRow}>
          <IconBubble icon="thermometer-outline" />
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>Live quality readings</Text>
            <Text style={styles.featureText}>Temperature, RG ratio, MQ137, TGS2620, and TGS822 in one view.</Text>
          </View>
        </View>
        <View style={styles.featureRow}>
          <IconBubble icon="checkmark-done-outline" />
          <View style={{ flex: 1 }}>
            <Text style={styles.featureTitle}>Batch completion</Text>
            <Text style={styles.featureText}>Start fermentation, review history, and submit GLP when ready.</Text>
          </View>
        </View>
        <Pressable onPress={onNext} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>Continue</Text>
          <Ionicons name="arrow-forward" size={19} color="#FFFFFF" />
        </Pressable>
      </View>
    </ScrollView>
  );
}

interface LoginPageViewProps {
  email: string;
  password: string;
  remember: boolean;
  showPassword: boolean;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setRemember: (value: boolean) => void;
  setShowPassword: (value: boolean) => void;
  onBack: () => void;
  onSubmit: () => void;
}

function LoginPageView({
  email,
  password,
  remember,
  showPassword,
  setEmail,
  setPassword,
  setRemember,
  setShowPassword,
  onBack,
  onSubmit,
}: LoginPageViewProps) {
  return (
    <>
      <View style={styles.loginTop}>
        <Pressable onPress={onBack} style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}>
          <Ionicons name="chevron-back" size={21} color={theme.colors.text} />
        </Pressable>
        <View style={styles.logoBoxSmall}>
          <Image source={logo} style={styles.logoImageSmall} resizeMode="contain" />
        </View>
      </View>

      <LinearGradient colors={['#050505', '#151515']} style={styles.loginHero}>
        <Text style={styles.loginKicker}>FAC001 Officer</Text>
        <Text style={styles.loginTitle}>Welcome back</Text>
        <Text style={styles.loginHeroText}>Sign in to continue monitoring live fermentation activity.</Text>
      </LinearGradient>

      <View style={styles.formPanel}>
        <Text style={styles.formTitle}>Account login</Text>
        <Text style={styles.formSubtitle}>Use your officer account details.</Text>

        <Text style={styles.label}>Email</Text>
        <InputRow
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          placeholder="Your email address"
          keyboardType="email-address"
        />

        <View style={styles.labelRow}>
          <Text style={styles.label}>Password</Text>
          <Text style={styles.forgotText}>Forgot password</Text>
        </View>
        <InputRow
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          placeholder="Your password"
          secureTextEntry={!showPassword}
          rightIcon={showPassword ? 'eye-outline' : 'eye-off-outline'}
          onRightPress={() => setShowPassword(!showPassword)}
        />

        <Pressable
          onPress={() => setRemember(!remember)}
          style={({ pressed }) => [styles.rememberRow, pressed && styles.pressed]}
        >
          <View style={[styles.checkbox, remember && styles.checkboxOn]}>
            {remember ? <Ionicons name="checkmark" size={13} color="#FFFFFF" /> : null}
          </View>
          <Text style={styles.rememberText}>Remember me</Text>
        </Pressable>

        <Pressable onPress={onSubmit} style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
          <Text style={styles.primaryButtonText}>Log In</Text>
          <Ionicons name="log-in-outline" size={19} color="#FFFFFF" />
        </Pressable>
      </View>
    </>
  );
}

interface InputRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
}

function InputRow({
  icon,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  rightIcon,
  onRightPress,
}: InputRowProps) {
  return (
    <View style={styles.inputWrap}>
      <Ionicons name={icon} size={18} color={theme.colors.textMuted} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
      {rightIcon ? (
        <Pressable onPress={onRightPress} hitSlop={10}>
          <Ionicons name={rightIcon} size={19} color={theme.colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}

function IconBubble({ icon }: { icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <View style={styles.featureIcon}>
      <Ionicons name={icon} size={20} color={theme.colors.primaryDark} />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  introScroll: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  loginScroll: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xxl,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logoBox: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: theme.colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  logoImage: { width: 31, height: 31 },
  brandText: { color: theme.colors.text, fontSize: 20, fontWeight: '900' },
  brandSub: { color: theme.colors.textMuted, fontSize: theme.font.small, marginTop: 2 },
  heroCard: {
    borderRadius: 38,
    padding: 24,
    minHeight: 330,
    justifyContent: 'space-between',
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 28,
    shadowOffset: { width: 0, height: 18 },
    elevation: 8,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  livePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.colors.primaryLight,
    marginRight: 7,
  },
  liveText: { color: '#FFFFFF', fontSize: theme.font.small, fontWeight: '800' },
  iconButtonDark: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 36,
    lineHeight: 41,
    fontWeight: '900',
    marginTop: 40,
  },
  heroText: {
    color: theme.colors.darkMuted,
    fontSize: theme.font.body,
    lineHeight: 22,
    marginTop: 12,
  },
  heroGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    marginTop: 24,
  },
  heroTile: {
    flex: 1,
    minWidth: 0,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.09)',
    padding: 12,
  },
  heroTileValue: { color: '#FFFFFF', fontSize: theme.font.small, fontWeight: '900', marginTop: 8 },
  heroTileLabel: { color: theme.colors.darkMuted, fontSize: theme.font.tiny, marginTop: 3 },
  whitePanel: {
    backgroundColor: theme.colors.surface,
    borderRadius: 34,
    padding: 22,
    marginTop: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.07,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 3,
  },
  panelTitle: { color: theme.colors.text, fontSize: 22, fontWeight: '900', marginBottom: theme.spacing.md },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  featureIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: theme.colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  featureTitle: { color: theme.colors.text, fontSize: theme.font.body, fontWeight: '900' },
  featureText: { color: theme.colors.textMuted, fontSize: theme.font.small, lineHeight: 19, marginTop: 3 },
  primaryButton: {
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: theme.colors.dark,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: theme.spacing.lg,
  },
  primaryButtonText: { color: '#FFFFFF', fontSize: theme.font.body, fontWeight: '900' },
  loginTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: theme.colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  logoBoxSmall: {
    width: 42,
    height: 42,
    borderRadius: 15,
    backgroundColor: theme.colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImageSmall: { width: 28, height: 28 },
  loginHero: {
    borderRadius: 34,
    padding: 24,
    minHeight: 190,
    justifyContent: 'flex-end',
    marginBottom: theme.spacing.lg,
  },
  loginKicker: {
    color: theme.colors.primaryLight,
    fontSize: theme.font.small,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  loginTitle: { color: '#FFFFFF', fontSize: 34, fontWeight: '900', marginTop: 8 },
  loginHeroText: { color: theme.colors.darkMuted, fontSize: theme.font.body, lineHeight: 22, marginTop: 8 },
  formPanel: {
    backgroundColor: theme.colors.surface,
    borderRadius: 34,
    padding: 22,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: theme.colors.shadow,
    shadowOpacity: 0.07,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 3,
  },
  formTitle: { color: theme.colors.text, fontSize: 24, fontWeight: '900' },
  formSubtitle: { color: theme.colors.textMuted, fontSize: theme.font.small, marginTop: 5, marginBottom: 18 },
  label: { color: theme.colors.text, fontSize: theme.font.small, fontWeight: '900', marginBottom: 8 },
  labelRow: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgotText: { color: theme.colors.primaryDark, fontSize: theme.font.small, fontWeight: '900', marginBottom: 8 },
  inputWrap: {
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surfaceSoft,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 10,
    color: theme.colors.text,
    fontSize: theme.font.body,
    fontWeight: '700',
  },
  rememberRow: { flexDirection: 'row', alignItems: 'center', marginTop: 16 },
  checkbox: {
    width: 19,
    height: 19,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxOn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  rememberText: { color: theme.colors.textMuted, fontSize: theme.font.small, fontWeight: '800' },
  pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
});
