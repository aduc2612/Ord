import { View, Text, StyleSheet, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { useAuthContext } from '@/hooks/use-auth-context'
import SignOutButton from '@/components/sign-out-button'
import { typography, spacing, componentStyles, interaction } from '@/constants/theme'
import { useTheme } from '@/hooks/use-theme'
import type { Theme } from '@/hooks/use-theme'

function createStyles(theme: Theme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
      gap: spacing.xl,
      backgroundColor: theme.colors.background,
    },
    title: {
      ...typography.headlineLarge,
      color: theme.colors.onBackground,
    },
    profileContainer: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    label: {
      ...typography.labelMedium,
      color: theme.colors.onSurfaceVariant,
    },
    value: {
      ...typography.bodyMedium,
      color: theme.colors.onSurface,
    },
    dbTestButton: {
      ...componentStyles.button,
      backgroundColor: theme.colors.secondaryContainer,
    },
    dbTestButtonText: {
      ...typography.labelLarge,
      color: theme.colors.onSecondaryContainer,
    },
  })
}

export default function HomeScreen() {
  const { profile } = useAuthContext()
  const theme = useTheme()
  const styles = createStyles(theme)
  const router = useRouter()

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome!</Text>
      <View style={styles.profileContainer}>
        <Text style={styles.label}>Profile ID</Text>
        <Text style={styles.value}>{profile?.id ?? 'N/A'}</Text>
      </View>
      <Pressable
        style={({ pressed }) => [
          styles.dbTestButton,
          { opacity: pressed ? interaction.pressedOpacity : 1 },
        ]}
        onPress={() => router.push('/db-test')}
      >
        <Text style={styles.dbTestButtonText}>DB Test</Text>
      </Pressable>
      <SignOutButton />
    </SafeAreaView>
  )
}
