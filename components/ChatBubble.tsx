import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { Message } from '@/types';
import { Bot } from 'lucide-react-native';

interface ChatBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  onReply?: (message: Message) => void;
  onDelete?: (message: Message) => void;
  onPin?: (message: Message) => void;
  useLongPressReply?: boolean;
  pinnedMessageId?: string | null;
}

export default function ChatBubble({
  message,
  isCurrentUser,
  onReply,
  onDelete,
  onPin,
  useLongPressReply,
  pinnedMessageId,
}: ChatBubbleProps) {
  const { colors } = useTheme();
  const [isModalVisible, setModalVisible] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleLongPress = () => {
    if (useLongPressReply) setModalVisible(true);
  };

  const BubbleContent = () => (
    <View
      style={[
        styles.bubble,
        {
          backgroundColor: message.isAI
            ? colors.surface
            : isCurrentUser
            ? colors.primary
            : colors.surface,
          alignSelf: message.isAI
            ? 'flex-start'
            : isCurrentUser
            ? 'flex-end'
            : 'flex-start',
          marginLeft: message.isAI ? 0 : isCurrentUser ? 40 : 0,
          marginRight: message.isAI ? 40 : isCurrentUser ? 0 : 40,
        },
      ]}
    >
      {message.isAI && (
        <View style={styles.aiHeader}>
          <Bot size={16} color={colors.primary} strokeWidth={2} />
          <Text style={[styles.senderName, { color: colors.primary }]}>AI Assistant</Text>
        </View>
      )}

      {!message.isAI && !isCurrentUser && (
        <Text style={[styles.senderName, { color: colors.textSecondary }]}>{message.senderName}</Text>
      )}

      {message.replyTo && (
        <View
          style={[
            styles.replyPreview,
            { borderLeftColor: isCurrentUser ? '#fff8' : '#0002' },
          ]}
        >
          <Text
            style={[
              styles.replySender,
              { color: isCurrentUser ? colors.background : colors.textSecondary },
            ]}
            numberOfLines={1}
          >
            {message.replyTo.senderName}
          </Text>
          <Text
            style={[
              styles.replyContent,
              { color: isCurrentUser ? colors.background : colors.textSecondary },
            ]}
            numberOfLines={1}
          >
            {message.replyTo.text}
          </Text>
        </View>
      )}

      <Text
        style={[
          styles.messageText,
          { color: isCurrentUser && !message.isAI ? colors.background : colors.text },
        ]}
      >
        {message.text}
      </Text>

      <Text
        style={[
          styles.timestamp,
          {
            color:
              isCurrentUser && !message.isAI
                ? colors.background + '80'
                : colors.textSecondary,
          },
        ]}
      >
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Pressable onLongPress={handleLongPress}>
        <BubbleContent />
      </Pressable>

      <Modal transparent visible={isModalVisible} animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  onReply?.(message);
                }}
              >
                <Text style={styles.modalOption}>Reply</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  onDelete?.(message);
                }}
              >
                <Text style={styles.modalOption}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  onPin?.(message);
                }}
              >
                <Text style={styles.modalOption}>
                  {pinnedMessageId === message.id ? 'Unpin' : 'Pin'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 4 },
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
  replyPreview: {
    borderLeftWidth: 3,
    paddingLeft: 8,
    marginBottom: 6,
  },
  replySender: { fontSize: 12, fontWeight: 'bold' },
  replyContent: { fontSize: 12 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 12,
    width: 200,
    elevation: 5,
  },
  modalOption: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
});
