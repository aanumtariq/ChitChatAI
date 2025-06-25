import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  User, 
  Bell, 
  Palette, 
  UserPlus, 
  LogOut, 
  ChevronRight,
  Moon,
  Sun,
  Share
} from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

interface SettingItem {
  icon: any;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
}

export default function ProfileScreen() {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  
  const [notifications, setNotifications] = useState({
    push: true,
    mentions: true,
    previews: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const stored = await SecureStore.getItemAsync('notification_settings');
      if (stored) {
        setNotifications(JSON.parse(stored));
      }
    } catch (error) {
      console.log('Failed to load settings');
    }
  };

  const saveNotificationSettings = async (newSettings: typeof notifications) => {
    try {
      await SecureStore.setItemAsync('notification_settings', JSON.stringify(newSettings));
      setNotifications(newSettings);
    } catch (error) {
      console.log('Failed to save settings');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/welcome');
          },
        },
      ]
    );
  };

  const handleShare = () => {
    Alert.alert('Invite Friends', 'Share Chit Chat AI with your friends!');
  };

  const notificationSettings: SettingItem[] = [
    {
      icon: Bell,
      title: 'Push Notifications',
      subtitle: 'Receive notifications for new messages',
      showSwitch: true,
      switchValue: notifications.push,
      onSwitchChange: (value) => saveNotificationSettings({ ...notifications, push: value }),
    },
    {
      icon: Bell,
      title: 'Mention Notifications',
      subtitle: 'Get notified when mentioned',
      showSwitch: true,
      switchValue: notifications.mentions,
      onSwitchChange: (value) => saveNotificationSettings({ ...notifications, mentions: value }),
    },
    {
      icon: Bell,
      title: 'Message Previews',
      subtitle: 'Show message content in notifications',
      showSwitch: true,
      switchValue: notifications.previews,
      onSwitchChange: (value) => saveNotificationSettings({ ...notifications, previews: value }),
    },
  ];

  const appearanceSettings: SettingItem[] = [
    {
      icon: isDark ? Moon : Sun,
      title: 'Dark Mode',
      subtitle: 'Toggle between light and dark theme',
      showSwitch: true,
      switchValue: isDark,
      onSwitchChange: toggleTheme,
    },
  ];

  const otherSettings: SettingItem[] = [
    {
      icon: Share,
      title: 'Invite Friends',
      subtitle: 'Share the app with others',
      onPress: handleShare,
    },
    {
      icon: LogOut,
      title: 'Logout',
      subtitle: 'Sign out of your account',
      onPress: handleLogout,
    },
  ];

  const renderSettingItem = (item: SettingItem) => (
    <TouchableOpacity
      key={item.title}
      style={[styles.settingItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
      onPress={item.onPress}
      disabled={item.showSwitch}
      activeOpacity={0.7}
    >
      <View style={styles.settingContent}>
        <item.icon size={24} color={colors.primary} strokeWidth={2} />
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: colors.text }]}>{item.title}</Text>
          {item.subtitle && (
            <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>
              {item.subtitle}
            </Text>
          )}
        </View>
      </View>
      {item.showSwitch ? (
        <Switch
          value={item.switchValue}
          onValueChange={item.onSwitchChange}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={colors.background}
        />
      ) : (
        <ChevronRight size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <User size={32} color={colors.background} strokeWidth={2} />
          </View>
          <Text style={[styles.name, { color: colors.text }]}>{user?.name}</Text>
          <Text style={[styles.email, { color: colors.textSecondary }]}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.surface }]}>
            {notificationSettings.map(renderSettingItem)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.surface }]}>
            {appearanceSettings.map(renderSettingItem)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Other</Text>
          <View style={[styles.settingsGroup, { backgroundColor: colors.surface }]}>
            {otherSettings.map(renderSettingItem)}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  settingsGroup: {
    marginHorizontal: 24,
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  settingContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
    marginLeft: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
});