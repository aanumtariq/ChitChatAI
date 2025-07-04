import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Users, CornerDownLeft } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import ChatBubble from '@/components/ChatBubble';
import ChatInput from '@/components/ChatInput';
import EmptyState from '@/components/EmptyState';
import Loader from '@/components/Loader';
import { getMessages, sendMessage, getGroup } from '@/services/api';
import { generateAIResponse } from '@/services/openai';
import { Message, Group } from '@/types';

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiTyping, setAiTyping] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [pinnedMessage, setPinnedMessage] = useState<Message | null>(null);
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchGroupData();
    fetchMessages();
  }, [id]);

  const fetchGroupData = async () => {
    try {
      const groupData = await getGroup(id!);
      setGroup(groupData);
    } catch (error) {
      Alert.alert('Error', 'Failed to load group');
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getMessages(id!);
      setMessages(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const tempMessage: Message = {
      id: Date.now().toString(),
      text,
      senderId: user!.id,
      senderName: user!.name,
      timestamp: new Date().toISOString(),
      isAI: false,
      replyTo: replyTo
        ? {
            senderName: replyTo.senderName,
            text: replyTo.text,
          }
        : undefined,
    };

    setMessages((prev) => [...prev, tempMessage]);
    setReplyTo(null);

    try {
      const serverMessage = await sendMessage(id!, text, tempMessage.replyTo);
      const message: Message = {
        ...serverMessage,
        senderId: user!.id,
        senderName: user!.name,
        replyTo: tempMessage.replyTo,
      };

      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempMessage.id ? message : msg))
      );

      setTimeout(() => {
        handleAIResponse(text);
      }, 1000);
    } catch (error) {
      Alert.alert('Error', 'Failed to send message');
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessage.id));
    }
  };

  const handleAIResponse = async (userMessage: string) => {
    setAiTyping(true);

    try {
      const aiResponse = await generateAIResponse(userMessage, messages);

      const aiMessage: Message = {
        id: Date.now().toString(),
        text: aiResponse,
        senderId: 'ai-assistant',
        senderName: 'AI Assistant',
        timestamp: new Date().toISOString(),
        isAI: true,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.log('AI response failed');
    } finally {
      setAiTyping(false);
    }
  };

  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()} activeOpacity={0.7}>
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={[styles.groupName, { color: colors.text }]}>              
              {group?.name || 'Group Chat'}
            </Text>
            <Text style={[styles.memberCount, { color: colors.textSecondary }]}>              
              {group?.members.length || 0} members + AI Assistant
            </Text>
          </View>

          <TouchableOpacity
            style={styles.groupIconButton}
            activeOpacity={0.7}
            onPress={() => router.push(`/group-members/group-members?id=${id}`)}
          >
            <Users size={24} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

        {pinnedMessage && (
          <View style={[styles.pinnedContainer, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.pinnedTitle, { color: colors.primary }]}>📌 Pinned Message</Text>
              <Text style={[styles.pinnedSender, { color: colors.textSecondary }]}>{pinnedMessage.senderName}</Text>
              <Text style={[styles.pinnedText, { color: colors.text }]} numberOfLines={2}>{pinnedMessage.text}</Text>
            </View>
            <TouchableOpacity onPress={() => setPinnedMessage(null)}>
              <Text style={[styles.unpinText, { color: colors.primary }]}>Unpin</Text>
            </TouchableOpacity>
          </View>
        )}

        {replyTo && (
          <View style={[styles.replyBanner, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}>
            <CornerDownLeft size={16} color={colors.primary} />
            <View style={styles.replyBannerTextContainer}>
              <Text style={[styles.replyBannerText, { color: colors.text }]}>Replying to {replyTo.senderName}</Text>
              <Text style={[styles.replyBannerSubtext, { color: colors.textSecondary }]} numberOfLines={1}>{replyTo.text}</Text>
            </View>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {messages.length === 0 ? (
          <EmptyState title="No messages yet" subtitle="Start the conversation and say something!" />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatBubble
                message={item}
                isCurrentUser={item.senderId === user?.id}
                onReply={(msg) => setReplyTo(msg)}
                onDelete={(msg) => {
                  Alert.alert(
                    'Delete Message',
                    'Are you sure you want to delete this message?',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => setMessages((prev) => prev.filter((m) => m.id !== msg.id)),
                      },
                    ]
                  );
                }}
                onPin={(msg) => {
                  if (pinnedMessage?.id === msg.id) {
                    setPinnedMessage(null);
                    Alert.alert('Unpinned', 'Message has been unpinned');
                  } else {
                    setPinnedMessage(msg);
                    Alert.alert('Pinned', 'Message pinned at the top');
                  }
                }}
                pinnedMessageId={pinnedMessage?.id}
                useLongPressReply
              />
            )}
            contentContainerStyle={styles.messagesContainer}
            onContentSizeChange={scrollToBottom}
            onLayout={scrollToBottom}
            showsVerticalScrollIndicator={false}
          />
        )}

        {aiTyping && (
          <View style={styles.typingContainer}>
            <View style={[styles.typingBubble, { backgroundColor: colors.surface }]}>
              <Text style={[styles.typingText, { color: colors.textSecondary }]}>AI Assistant is typing...</Text>
            </View>
          </View>
        )}

        <ChatInput onSend={handleSendMessage} disabled={aiTyping} replyTo={replyTo} onCancelReply={() => setReplyTo(null)} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 8,
  },
  groupName: {
    fontSize: 18,
    fontWeight: '600',
  },
  memberCount: {
    fontSize: 14,
    marginTop: 2,
  },
  groupIconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  replyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 8,
  },
  replyBannerTextContainer: {
    flex: 1,
  },
  replyBannerText: {
    fontSize: 12,
    fontWeight: '600',
  },
  replyBannerSubtext: {
    fontSize: 12,
  },
  messagesContainer: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    flexGrow: 1,
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  typingBubble: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    maxWidth: '80%',
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  pinnedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    padding: 12,
    margin: 12,
    borderRadius: 12,
    gap: 8,
  },
  pinnedTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pinnedSender: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  pinnedText: {
    fontSize: 14,
    maxWidth: '95%',
  },
  unpinText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
