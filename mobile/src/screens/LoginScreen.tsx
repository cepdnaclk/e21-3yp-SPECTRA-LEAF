import React, { useEffect, useState } from 'react';
import {
  ImageBackground,
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
import { authImages } from '../assets/images/auth';
import { useAuthStore } from '../store/authStore';
import { theme } from '../theme';

const slides = [
  {
    image: authImages.fermentation,
    quote: '"The finest teas are born from patience — every leaf tells the story of its fermentation."',
    meta: 'Spectraleaf · Fermentation Intelligence',
  },
  {
    image: authImages.monitoring,
    quote: '"Real-time data turns instinct into certainty — measure every degree, every second."',
    meta: 'Spectraleaf · IoT Tea Monitoring',
  },
  {
    image: authImages.quality,
    quote: '"From leaf to cup, quality begins in the fermentation chamber."',
    meta: 'Spectraleaf · Quality Intelligence',
  },
];

const logo = require('../assets/images/Logo.png');

type LoginPage = 'intro' | 'login';

export default function LoginScreen() {
  const signIn = useAuthStore(s => s.signIn);
  const [page, setPage] = useState<LoginPage>('intro');
  const [slide, setSlide] = useState(0);
  const [email, setEmail] = useState('officer@spectraleaf.io');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);

  useEffect(() => {
    if (page !== 'intro') return;
    const id = setInterval(() => {
      setSlide(current => (current + 1) % slides.length);
    }, 3500);
    return () => clearInterval(id);
  }, [page]);

  const onSubmit = () => {
    signIn('FAC001', 'Factory Officer');
  };

  return (
    <ImageBackground
      source={page === 'intro' ? slides[slide].image : slides[1].image}
      style={styles.background}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safe}>
        {page === 'intro' ? (
          <IntroPage
            currentSlide={slide}
            onNext={() => setPage('login')}
            onSelectSlide={setSlide}
          />
        ) : (
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
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}

function IntroPage({
  currentSlide,
  onNext,
  onSelectSlide,
}: {
  currentSlide: number;
  onNext: () => void;
  onSelectSlide: (index: number) => void;
}) {
  const active = slides[currentSlide];

  return (
    <LinearGradient
      colors={['rgba(3, 20, 12, 0.04)', 'rgba(3, 20, 12, 0.34)', 'rgba(3, 20, 12, 0.94)']}
      locations={[0, 0.44, 1]}
      style={styles.overlay}
    >
      <View style={styles.screen}>
        <View style={styles.brandRow}>
          <View style={styles.logoBox}>
            <Image source={logo} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.brandText}>Spectraleaf</Text>
        </View>

        <View style={styles.introSpacer} />

        <View style={styles.introContent}>
          <View style={styles.slideDots}>
            {slides.map((_, index) => (
              <Pressable
                key={index}
                onPress={() => onSelectSlide(index)}
                style={index === currentSlide ? styles.dotActive : styles.dotMuted}
              />
            ))}
          </View>

          <Text style={styles.quote}>
            {active.quote}
          </Text>
          <Text style={styles.quoteMeta}>{active.meta}</Text>

          <View style={styles.introPanel}>
            <Text style={styles.introTitle}>Officer batch monitoring</Text>
            <Text style={styles.introText}>
              Review live sensors, batch history, GLP completion, and factory activity from FAC001.
            </Text>

            <Pressable
              onPress={onNext}
              style={({ pressed }) => [styles.nextButton, pressed && styles.pressed]}
            >
              <Text style={styles.nextButtonText}>Get Started</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>
      </View>
    </LinearGradient>
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
    <LinearGradient
      colors={['rgba(3, 20, 12, 0.44)', 'rgba(3, 20, 12, 0.16)', 'rgba(245, 247, 246, 0.50)']}
      locations={[0, 0.34, 1]}
      style={styles.overlay}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.loginScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.topActions}>
            <Pressable
              onPress={onBack}
              style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
            >
              <Ionicons name="chevron-back" size={22} color="#fff" />
            </Pressable>
          </View>

          <View style={styles.loginHero}>
            <Text style={styles.loginKicker}>FAC001 Officer Console</Text>
            <Text style={styles.loginImageTitle}>Quality begins with the data.</Text>
          </View>

          <View style={styles.formSheet}>
            <View style={styles.sheetHandle} />
            <Text style={styles.formTitle}>Welcome Back</Text>
            <Text style={styles.formSubtitle}>Welcome back! please enter your details.</Text>

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
              <Pressable>
                <Text style={styles.forgotText}>Forget your password</Text>
              </Pressable>
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

            <Text style={styles.label}>Role</Text>
            <View style={styles.roleCard}>
              <View style={styles.radioOuter}>
                <View style={styles.radioInner} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.roleTitle}>Factory Officer</Text>
                <Text style={styles.roleSub}>Monitor sensors · edit GLP</Text>
              </View>
              <Ionicons name="flask-outline" size={22} color={theme.colors.primary} />
            </View>

            <Pressable
              onPress={() => setRemember(!remember)}
              style={({ pressed }) => [styles.rememberRow, pressed && styles.pressed]}
            >
              <View style={[styles.checkbox, remember && styles.checkboxOn]}>
                {remember ? <Ionicons name="checkmark" size={12} color="#fff" /> : null}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </Pressable>

            <Pressable
              onPress={onSubmit}
              style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
            >
              <Text style={styles.loginButtonText}>Log In</Text>
            </Pressable>

            <Text style={styles.footerText}>
              Don't have an account? <Text style={styles.footerLink}>Sign up</Text>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
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
      <Ionicons name={icon} size={17} color={theme.colors.textMuted} />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#96a6b8"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
      />
      {rightIcon ? (
        <Pressable onPress={onRightPress} hitSlop={10}>
          <Ionicons name={rightIcon} size={18} color="#8aa0b8" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: theme.colors.primaryDark },
  overlay: { flex: 1 },
  safe: { flex: 1 },
  screen: {
    flex: 1,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    paddingHorizontal: 22,
    paddingBottom: 18,
  },
  brandRow: { flexDirection: 'row', alignItems: 'center', paddingTop: 14 },
  logoBox: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoImage: { width: 25, height: 25 },
  brandText: { color: '#fff', fontSize: 17, fontWeight: '900' },
  introSpacer: { flex: 1 },
  introContent: { paddingBottom: 10 },
  slideDots: { flexDirection: 'row', gap: 7, marginBottom: 18 },
  dotMuted: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.45)' },
  dotActive: { width: 22, height: 8, borderRadius: 4, backgroundColor: '#fff' },
  quote: {
    color: '#fff',
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '900',
    maxWidth: 350,
  },
  quoteMeta: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: theme.font.small,
    marginTop: 12,
    marginBottom: 22,
  },
  introPanel: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 28,
    padding: 24,
    shadowColor: '#03140c',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
  },
  introTitle: { color: theme.colors.primary, fontSize: 23, fontWeight: '900', marginBottom: 9 },
  introText: { color: theme.colors.textMuted, fontSize: theme.font.body, lineHeight: 22 },
  nextButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 22,
  },
  nextButtonText: { color: '#fff', fontSize: theme.font.body, fontWeight: '900' },
  loginScroll: {
    flexGrow: 1,
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 10,
  },
  topActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginHero: {
    minHeight: 132,
    justifyContent: 'flex-end',
    paddingBottom: 12,
    paddingHorizontal: 8,
  },
  loginKicker: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: theme.font.small,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  loginImageTitle: {
    color: '#fff',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    marginTop: 6,
    maxWidth: 320,
  },
  formSheet: {
    borderRadius: 28,
    backgroundColor: theme.colors.surfaceSoft,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: theme.colors.border,
    shadowColor: '#03140c',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },
  sheetHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#d6e3dc',
    alignSelf: 'center',
    marginBottom: 18,
  },
  formTitle: { color: theme.colors.text, fontSize: 27, fontWeight: '900' },
  formSubtitle: { color: theme.colors.textMuted, fontSize: theme.font.small, marginTop: 5, marginBottom: 16 },
  label: { color: theme.colors.text, fontSize: theme.font.small, fontWeight: '800', marginBottom: 8 },
  labelRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  forgotText: { color: theme.colors.primary, fontSize: theme.font.small, fontWeight: '800', marginBottom: 8 },
  inputWrap: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    height: 46,
    paddingHorizontal: 10,
    color: theme.colors.text,
    fontSize: theme.font.body,
  },
  roleCard: {
    minHeight: 62,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  radioInner: { width: 8, height: 8, borderRadius: 4, backgroundColor: theme.colors.primary },
  roleTitle: { color: theme.colors.primaryDark, fontSize: theme.font.body, fontWeight: '900' },
  roleSub: { color: '#7a8fa4', fontSize: theme.font.tiny, marginTop: 2 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: {
    width: 17,
    height: 17,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#cbd7d2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxOn: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  rememberText: { color: theme.colors.textMuted, fontSize: theme.font.small, fontWeight: '700' },
  loginButton: {
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonText: { color: '#fff', fontSize: theme.font.body, fontWeight: '900' },
  footerText: { color: theme.colors.textMuted, fontSize: theme.font.small, textAlign: 'center', marginTop: 22 },
  footerLink: { color: theme.colors.primary, fontWeight: '900' },
  pressed: { opacity: 0.86, transform: [{ scale: 0.99 }] },
});
