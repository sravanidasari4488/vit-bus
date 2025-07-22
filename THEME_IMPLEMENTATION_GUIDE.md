# Theme System Implementation Guide

This guide explains how to use the comprehensive dark/light mode theme system implemented in your React Native Expo app.

## 🎨 Features

- **Three Theme Options**: Light, Dark, and Auto (follows system preference)
- **Persistent Storage**: Theme preference is saved using AsyncStorage
- **System Integration**: Auto mode automatically adapts to system dark/light mode changes
- **NativeWind Support**: Tailwind CSS utilities with theme-aware classes
- **Theme Context**: React Context for global theme state management
- **Pre-built Components**: Ready-to-use theme toggle components
- **Styling Utilities**: Custom hook for easy theme-aware styling

## 🚀 Quick Start

### 1. Using the Theme Context

```tsx
import { useTheme } from '../(auth)/context/ThemeContext';

function MyComponent() {
  const { theme, currentTheme, isDark, colors, toggleTheme, setTheme } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>
        Current theme: {currentTheme}
      </Text>
    </View>
  );
}
```

### 2. Using the Styling Hook

```tsx
import { useThemeStyles } from '../hooks/useThemeStyles';

function StyledComponent() {
  const { styles, tw, isDark } = useThemeStyles();
  
  return (
    <View style={styles.background}>
      <Text style={styles.text}>Styled with theme!</Text>
      <View style={styles.shadow}>
        <Text style={styles.primary}>Accent text</Text>
      </View>
    </View>
  );
}
```

### 3. Adding Theme Toggle to Your Screen

```tsx
import { ThemeToggle, SimpleThemeToggle } from '../components/ThemeToggle';

function SettingsScreen() {
  return (
    <ScrollView>
      {/* Full theme selector with Light/Dark/Auto options */}
      <ThemeToggle />
      
      {/* Or use the simple toggle button */}
      <SimpleThemeToggle />
    </ScrollView>
  );
}
```

## 🛠 Advanced Usage

### Available Theme Properties

```tsx
const { 
  theme,        // 'light' | 'dark' | 'auto' - user's preference
  currentTheme, // 'light' | 'dark' - resolved theme (auto becomes light/dark)
  isDark,       // boolean - true if current theme is dark
  colors,       // color palette for current theme
  toggleTheme,  // function - toggles between light/dark
  setTheme      // function - sets specific theme ('light'|'dark'|'auto')
} = useTheme();
```

### Color Palette

Each theme includes these colors:
- `background`: Main app background
- `surface`: Card/container backgrounds
- `text`: Primary text color
- `textSecondary`: Secondary text color
- `primary`: Brand/accent color
- `border`: Border color
- `shadow`: Shadow color

### Custom Styling with Theme Colors

```tsx
function CustomCard() {
  const { colors, isDark } = useTheme();
  
  const cardStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.shadow,
    shadowOpacity: isDark ? 0.3 : 0.1,
    shadowRadius: 4,
    elevation: 3,
  };
  
  return (
    <View style={cardStyle}>
      <Text style={{ color: colors.text }}>Card content</Text>
    </View>
  );
}
```

### NativeWind/Tailwind Classes

Use the `useThemeStyles` hook for theme-aware Tailwind classes:

```tsx
function NativeWindComponent() {
  const { tw } = useThemeStyles();
  
  return (
    <View className={tw.bg.primary}>
      <Text className={tw.text.primary}>Primary text</Text>
      <Text className={tw.text.secondary}>Secondary text</Text>
    </View>
  );
}
```

## 📱 Status Bar Integration

The theme system automatically adjusts the status bar style:
- Light theme: Dark status bar content
- Dark theme: Light status bar content

This is handled automatically in the root layout.

## 💾 Persistence

Theme preferences are automatically saved to AsyncStorage and restored when the app launches. Users' theme choices persist across app restarts.

## 🎯 Best Practices

1. **Use Theme Colors**: Always use colors from the theme context instead of hardcoded colors
2. **Test Both Themes**: Ensure your UI looks good in both light and dark modes
3. **Consistent Shadows**: Use theme-appropriate shadow opacity (lighter in dark mode)
4. **Accessibility**: Maintain proper contrast ratios in both themes
5. **Icons**: Consider using different icons/colors for light vs dark themes

## 🔧 Customization

### Adding New Colors

Edit `app/constants/colors.ts`:

```tsx
export const colors = {
  light: {
    // existing colors...
    accent: '#FF6B6B',
    warning: '#F59E0B',
  },
  dark: {
    // existing colors...
    accent: '#FF8E8E',
    warning: '#FBBF24',
  },
};
```

### Creating Custom Theme Components

```tsx
function CustomThemeToggle() {
  const { theme, setTheme, currentTheme } = useTheme();
  
  return (
    <View>
      <Button title="Light" onPress={() => setTheme('light')} />
      <Button title="Dark" onPress={() => setTheme('dark')} />
      <Button title="Auto" onPress={() => setTheme('auto')} />
      <Text>Current: {currentTheme}</Text>
    </View>
  );
}
```

## 📦 File Structure

```
app/
├── (auth)/context/
│   └── ThemeContext.tsx       # Main theme context
├── components/
│   └── ThemeToggle.tsx        # Pre-built toggle components
├── constants/
│   └── colors.ts              # Color definitions
├── hooks/
│   └── useThemeStyles.ts      # Styling utilities
└── _layout.tsx                # Root layout with theme setup
```

## 🎨 Example Implementation

Here's a complete example of a themed screen:

```tsx
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { ThemeToggle } from '../components/ThemeToggle';

function ExampleScreen() {
  const { styles, colors, isDark } = useThemeStyles();
  
  return (
    <ScrollView style={styles.background}>
      <View style={[styles.surface, { padding: 20, margin: 16, borderRadius: 12 }]}>
        <Text style={[styles.text, { fontSize: 24, fontWeight: 'bold' }]}>
          Welcome to {isDark ? 'Dark' : 'Light'} Mode!
        </Text>
        <Text style={[styles.textSecondary, { marginTop: 8 }]}>
          This text adapts to your theme preference.
        </Text>
        
        <TouchableOpacity 
          style={[
            { 
              backgroundColor: colors.primary, 
              padding: 12, 
              borderRadius: 8, 
              marginTop: 16 
            }
          ]}
        >
          <Text style={{ color: '#FFFFFF', textAlign: 'center' }}>
            Primary Button
          </Text>
        </TouchableOpacity>
      </View>
      
      <ThemeToggle />
    </ScrollView>
  );
}

export default ExampleScreen;
```

This theme system provides a solid foundation for creating beautiful, accessible interfaces that adapt to user preferences and system settings!