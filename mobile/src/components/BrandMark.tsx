import React from 'react';
import { Image, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { useAppTheme } from '../theme';

interface Props {
  compact?: boolean;
  showName?: boolean;
  style?: ViewStyle;
}

export default function BrandMark({ compact = false, showName = true, style }: Props) {
  const theme = useAppTheme();
  const size = compact ? 42 : 54;

  return (
    <View style={[styles.row, style]}>
      <View
        style={[
          styles.mark,
          {
            width: size,
            height: size,
            borderRadius: compact ? 14 : 18,
            backgroundColor: theme.colors.primary,
          },
        ]}
      >
        <Image
          source={require('../assets/images/Logo.png')}
          resizeMode="contain"
          style={{ width: compact ? 27 : 35, height: compact ? 27 : 35 }}
        />
      </View>
      {showName ? (
        <View style={styles.copy}>
          <Text style={[styles.name, { color: theme.colors.text }]}>SpectraLeaf</Text>
          <Text style={[styles.product, { color: theme.colors.textMuted }]}>OFFICER</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  mark: { alignItems: 'center', justifyContent: 'center' },
  copy: { marginLeft: 11 },
  name: { fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  product: { marginTop: 2, fontSize: 8, fontWeight: '900', letterSpacing: 2.2 },
});
