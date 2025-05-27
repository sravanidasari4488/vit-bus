import { Tabs } from 'expo-router';
import { Bus, Map, User, Settings } from 'lucide-react-native';
// import { useAuth } from '../../context/AuthProvider'; // adjust the path
import { useEffect } from 'react';

// import ThemeProvider from '../(auth)/context/ThemeContext'; // adjust the path
// import { useTheme } from '../(auth)/context/ThemeContext';

// const { theme, isDark } = useTheme();


function TabLayout() {
  //   const { userInfo } = useAuth(); // Access user data

  // useEffect(() => {
  //   console.log('User Info from AuthProvider:', userInfo);
  // }, [userInfo]);
  return (
     
      
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3366FF',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          elevation: 0,
          shadowOpacity: 0.1,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 4,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => <Bus size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="bus-routes"
        options={{
          title: 'Routes',
          tabBarIcon: ({ color, size }) => <Map size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ProfilePage"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => <Settings size={size} color={color} />,
        }}
      />
    </Tabs>
    
    
  );
}

export default TabLayout;
