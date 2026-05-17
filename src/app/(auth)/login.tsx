import { Stack } from 'expo-router'
import { Image, View, Text, StyleSheet, useColorScheme } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import GoogleSignInButton from '@/components/google-sign-in-button'
import { images } from '@/constants/images'
import { typography, spacing } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import type { Theme } from '@/hooks/use-theme'

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
      gap: spacing.xxxl,
      backgroundColor: theme.colors.background,
    },
    logo: {
      width: 120,
      height: 120,
    },
    title: {
      ...typography.displaySmall,
      color: theme.colors.onBackground,
    },
    subtitle: {
      ...typography.bodyLarge,
      color: theme.colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: -spacing.xxl,
      paddingHorizontal: spacing.xxl,
    },
    buttonWrapper: {
      marginTop: spacing.md,
    },
    safeArea: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
  })
}

export default function LoginScreen() {
  const theme = useTheme()
  const styles = createStyles(theme)
  const isDark = useColorScheme() === 'dark'

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.container}>
        <Image
          source={isDark ? images.iconDark : images.iconLight}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>Ord</Text>
        <Text style={styles.subtitle}>Empty Your Mind. Organize Your Life.</Text>
        <View style={styles.buttonWrapper}>
          <GoogleSignInButton />
        </View>
      </View>
    </SafeAreaView>
  )
}
