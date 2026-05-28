import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { lightTheme, darkTheme } from './theme';

export default function ThemeExample() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? darkTheme : lightTheme;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    scrollContent: {
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      ...theme.typography.titleMedium,
      color: theme.colors.onBackground,
      marginBottom: theme.spacing.md,
    },
    card: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.lg,
      padding: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      ...theme.shadows.sm,
    },
    cardText: {
      ...theme.typography.bodyMedium,
      color: theme.colors.onSurface,
      marginBottom: theme.spacing.sm,
    },
    cardSubtext: {
      ...theme.typography.bodySmall,
      color: theme.colors.onSurfaceVariant,
    },
    button: {
      ...theme.componentStyles.button,
      backgroundColor: theme.colors.primary,
      marginVertical: theme.spacing.sm,
    },
    buttonOutlined: {
      ...theme.componentStyles.button,
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.outline,
      marginVertical: theme.spacing.sm,
    },
    buttonText: {
      ...theme.typography.labelLarge,
      color: theme.colors.onPrimary,
    },
    buttonTextOutlined: {
      ...theme.typography.labelLarge,
      color: theme.colors.primary,
    },
    input: {
      ...theme.componentStyles.input,
      backgroundColor: theme.colors.surface,
      color: theme.colors.onSurface,
      borderColor: theme.colors.outline,
      marginBottom: theme.spacing.md,
    },
    buttonGroup: {
      flexDirection: 'row' as const,
      gap: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    colorBox: {
      flex: 1,
      height: 80,
      borderRadius: theme.borderRadius.lg,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Theme Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Theme Mode</Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            <Text style={styles.buttonText}>
              {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Card Example */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Card Component</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              {"This is a card with the app\u2019s clean aesthetic"}
            </Text>
            <Text style={styles.cardSubtext}>
              Minimal shadows, clean borders
            </Text>
          </View>
        </View>

        {/* Input Example */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Input Fields</Text>
          <TextInput
            placeholder="Enter text"
            style={styles.input}
            placeholderTextColor={theme.colors.onSurfaceVariant}
          />
        </View>

        {/* Button Variants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Button Variants</Text>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Contained Button</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buttonOutlined}>
            <Text style={styles.buttonTextOutlined}>Outlined Button</Text>
          </TouchableOpacity>
        </View>

        {/* Typography Showcase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Typography</Text>
          <View style={styles.card}>
            <Text style={[theme.typography.headlineSmall, { color: theme.colors.onSurface }]}>
              Headline Small
            </Text>
            <Text style={[theme.typography.bodyMedium, { color: theme.colors.onSurface, marginTop: theme.spacing.sm }]}>
              Body Medium
            </Text>
            <Text style={[theme.typography.bodySmall, { color: theme.colors.onSurfaceVariant, marginTop: theme.spacing.sm }]}>
              Body Small
            </Text>
          </View>
        </View>

        {/* Spacing Demo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spacing Scale</Text>
          <View style={styles.card}>
            {Object.entries(theme.spacing).map(([key, value]) => (
              <View key={key} style={{ marginBottom: theme.spacing.sm, flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[theme.typography.labelSmall, { color: theme.colors.onSurface, width: 50 }]}>
                  {key}
                </Text>
                <View
                  style={{
                    height: 20,
                    width: value * 2,
                    backgroundColor: theme.colors.primary,
                    borderRadius: 4,
                  }}
                />
                <Text style={[theme.typography.labelSmall, { color: theme.colors.onSurfaceVariant, marginLeft: theme.spacing.md }]}>
                  {value}px
                </Text>
              </View>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
}
