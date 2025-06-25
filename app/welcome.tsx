import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MessageCircle, Users, Zap } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <MessageCircle size={60} color="#007AFF" strokeWidth={2} />
          <Text style={styles.title}>Chit Chat AI</Text>
          <Text style={styles.subtitle}>
            Connect, chat, and collaborate with AI-powered group conversations
          </Text>
        </View>

        <View style={styles.features}>
          <View style={styles.feature}>
            <Users size={24} color="#007AFF" strokeWidth={2} />
            <Text style={styles.featureText}>Group Conversations</Text>
          </View>
          <View style={styles.feature}>
            <Zap size={24} color="#007AFF" strokeWidth={2} />
            <Text style={styles.featureText}>AI Assistant</Text>
          </View>
          <View style={styles.feature}>
            <MessageCircle size={24} color="#007AFF" strokeWidth={2} />
            <Text style={styles.featureText}>Real-time Chat</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.getStartedButton}
          onPress={() => router.push('/(auth)/login')}
          activeOpacity={0.8}
        >
          <Text style={styles.getStartedText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#000000',
    marginTop: 24,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  features: {
    gap: 20,
    marginBottom: 40,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    gap: 16,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  getStartedButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  getStartedText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});