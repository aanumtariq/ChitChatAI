import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Message } from '@/types';
import { Bot } from 'lucide-react-native';

interface ChatBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export default function ChatBubble({ message, isCurrentUser }: ChatBubbleProps) {
  const { colors } = useTheme();

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.bubble,
          {
            backgroundColor: message.isAI 
              ? colors.surface 
              : isCurrentUser 
                ? colors.primary 
                : colors.surface,
            alignSelf: message.isAI ? 'flex-start' : isCurrentUser ? 'flex-end' : 'flex-start',
            marginLeft: message.isAI ? 0 : isCurrentUser ? 40 : 0,
            marginRight: message.isAI ? 40 : isCurrentUser ? 0 : 40,
          }
        ]}
      >
        {message.isAI && (
          <View style={styles.aiHeader}>
            <Bot size={16} color={colors.primary} strokeWidth={2} />
            <Text style={[styles.senderName, { color: colors.primary }]}>
              AI Assistant
            </Text>
          </View>
        )}
        
        {!message.isAI && !isCurrentUser && (
          <Text style={[styles.senderName, { color: colors.textSecondary }]}>
            {message.senderName}
          </Text>
        )}
        
        <Text
          style={[
            styles.messageText,
            {
              color: isCurrentUser && !message.isAI ? colors.background : colors.text,
            }
          ]}
        >
          {message.text}
        </Text>
        
        <Text
          style={[
            styles.timestamp,
            {
              color: isCurrentUser && !message.isAI 
                ? colors.background + '80' 
                : colors.textSecondary,
            }
          ]}
        >
          {formatTime(message.timestamp)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: '80%',
    minWidth: 60,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
});