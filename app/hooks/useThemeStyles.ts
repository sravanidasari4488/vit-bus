import { useTheme } from '../(auth)/context/ThemeContext';

export const useThemeStyles = () => {
  const { currentTheme, isDark, colors } = useTheme();

  // Style objects for inline styles
  const styles = {
    background: { backgroundColor: colors.background },
    surface: { backgroundColor: colors.surface },
    card: { 
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
    },
    text: { color: colors.text },
    textSecondary: { color: colors.textSecondary },
    primary: { color: colors.primary },
    border: { borderColor: colors.border },
    shadow: {
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    cardWithShadow: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 16,
      shadowColor: colors.shadow,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.3 : 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    }
  };

  return {
    currentTheme,
    isDark,
    colors,
    styles,
  };
};