import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Modal,
  TouchableWithoutFeedback,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Users, CornerDownLeft } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import ChatBubble from '@/components/ChatBubble';
import ChatInput from '@/components/ChatInput';
import EmptyState from '@/components/EmptyState';
import Loader from '@/components/Loader';
import { getMessages, sendMessage, getGroups, getGroup } from '@/services/api';
import { generateAIResponse } from '@/services/openai';
import { Message, Group } from '@/types';

export default function GroupChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  console.log('ID : ', id);
  const [messages, setMessages] = useState<Message[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiTyping, setAiTyping] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [pinnedMessage, setPinnedMessage] = useState<Message | null>(null);
  const [confirmationModal, setConfirmationModal] = useState({
    visible: false,
    title: '',
    subtitle: '',
    onConfirm: () => {},
  });

  const [forwardModalVisible, setForwardModalVisible] = useState(false);
  const [selectedForwardMessage, setSelectedForwardMessage] =
    useState<Message | null>(null);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [allGroups, setAllGroups] = useState<Group[]>([]);

  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  const storageKey = `${user?.id}_group_${id}_messages`;

  useEffect(() => {
    fetchGroupData();
    loadMessagesFromStorage();
    fetchAllGroups();
  }, [id]);

  useEffect(() => {
    if (!loading) saveMessagesToStorage(messages);
  }, [messages]);

  // Add logging for debugging duplicate keys
  useEffect(() => {
    console.log(
      'Messages:',
      messages.map((m) => m.id)
    );
    console.log(
      'AllGroups:',
      allGroups.map((g) => g._id || g.id)
    );
  }, [messages, allGroups]);

  const fetchGroupData = async () => {
    // console.log('Fetching group data for ID : ', id);
    try {
      const groupData = await getGroup(id!);
      setGroup(groupData);
    } catch {
      setConfirmationModal({
        visible: true,
        title: 'Error',
        subtitle: 'Failed to load group',
        onConfirm: () =>
          setConfirmationModal({ ...confirmationModal, visible: false }),
      });
    }
  };

  const fetchAllGroups = async () => {
    const groups = await getGroups();
    const filtered = groups.filter((g) => (g._id || g.id) !== id);
    setAllGroups(filtered);
  };

  const loadMessagesFromStorage = async () => {
    try {
      setLoading(true);
      const stored = await AsyncStorage.getItem(storageKey);
      let loadedFromStorage = false;
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.messages && parsed.messages.length > 0) {
          setMessages(parsed.messages);
          setPinnedMessage(parsed.pinnedMessage || null);
          setReplyTo(null);
          loadedFromStorage = true;
          console.log('Loaded messages from storage:', parsed.messages.length);
        }
      }
      if (!loadedFromStorage) {
        console.log('Fetching messages from backend for group:', id);
        const fetched = await getMessages(id!);
        const mapped = fetched.map((msg) => ({
          id: msg.id, // Now backend sends 'id'
          text: msg.text,
          senderId: msg.senderId,
          senderName: msg.senderName,
          timestamp: msg.timestamp,
          isAI: msg.isAI,
        }));
        setMessages(mapped);
        setPinnedMessage(null);
        setReplyTo(null);
      }
    } catch (err: any) {
      setConfirmationModal({
        visible: true,
        title: 'Error',
        subtitle: 'Failed to load chat data: ' + (err.message || ''),
        onConfirm: () =>
          setConfirmationModal({ ...confirmationModal, visible: false }),
      });
      console.log('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveMessagesToStorage = async (msgs: Message[]) => {
    try {
      const data = { messages: msgs, pinnedMessage };
      await AsyncStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      console.warn('Failed to save messages locally.');
    }
  };

  const handleSendMessage = async (text: string) => {
    // Generate a unique temp ID
    const tempId =
      Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const tempMessage: Message = {
      id: tempId,
      text,
      senderId: user!.id,
      senderName: user!.name,
      timestamp: new Date().toISOString(),
      isAI: false,
      replyTo: replyTo
        ? { senderName: replyTo.senderName, text: replyTo.text }
        : undefined,
    };
    setMessages((prev) => [...prev, tempMessage]);
    setReplyTo(null);

    try {
      // Always pass groupId (id!) to sendMessage
      const serverMessage = await sendMessage(id!, text, tempMessage.replyTo); // ✅ real backend
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...serverMessage,
                senderId: user!.id,
                senderName: user!.name,
                replyTo: tempMessage.replyTo,
              }
            : msg
        )
      );
      await AsyncStorage.setItem(
        `@lastMessage_${id}`,
        JSON.stringify({ lastMessage: serverMessage })
      );
      setTimeout(() => handleAIResponse(text), 1000);
    } catch {
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setConfirmationModal({
        visible: true,
        title: 'Error',
        subtitle: 'Failed to send message',
        onConfirm: () =>
          setConfirmationModal({ ...confirmationModal, visible: false }),
      });
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
    } finally {
      setAiTyping(false);
    }
  };

  const scrollToBottom = () =>
    flatListRef.current?.scrollToEnd({ animated: true });

  const handleDeleteMessage = (msgId: string) => {
    setConfirmationModal({
      visible: true,
      title: 'Delete Message',
      subtitle: 'Are you sure?',
      onConfirm: () => {
        setMessages((prev) => prev.filter((m) => m.id !== msgId));
        setConfirmationModal({ ...confirmationModal, visible: false });
      },
    });
  };

  const handleClearChat = () => {
    setConfirmationModal({
      visible: true,
      title: 'Clear Chat',
      subtitle: 'Are you sure?',
      onConfirm: async () => {
        setMessages([]);
        setPinnedMessage(null);
        setReplyTo(null);
        await AsyncStorage.removeItem(`@lastMessage_${id}`);
        setConfirmationModal({ ...confirmationModal, visible: false });
      },
    });
  };

  const handlePinMessage = (msg: Message) => {
    const updated = pinnedMessage?.id === msg.id ? null : msg;
    setPinnedMessage(updated);
    AsyncStorage.setItem(
      storageKey,
      JSON.stringify({ messages, pinnedMessage: updated })
    ).catch(() => console.warn('Failed to save pinned message'));
  };

  const handleForwardMessage = (msg: Message) => {
    setSelectedForwardMessage(msg);
    setForwardModalVisible(true);
  };

  const toggleGroupSelection = (groupId: string) => {
    setSelectedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    );
  };

  const confirmForwarding = async () => {
    if (!selectedForwardMessage) return;
    for (const groupId of selectedGroups) {
      const forwardMsg: Message = {
        ...selectedForwardMessage,
        id: Date.now().toString() + Math.random(),
        isForwarded: true,
        isAI: false,
        senderId: user!.id,
        senderName: user!.name,
        timestamp: new Date().toISOString(),
      };
      const key = `${user?.id}_group_${groupId}_messages`;
      const existing = await AsyncStorage.getItem(key);
      const parsed = existing ? JSON.parse(existing) : { messages: [] };
      parsed.messages.push(forwardMsg);
      await AsyncStorage.setItem(key, JSON.stringify(parsed));
    }
    setForwardModalVisible(false);
    setSelectedGroups([]);
    setSelectedForwardMessage(null);
  };

  if (loading) return <Loader />;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
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
            onPress={() => router.push(`/group-members/group-members?id=${id}`)}
          >
            <Users size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {/* Pinned Message */}
        {pinnedMessage && (
          <View
            style={[
              styles.pinnedContainer,
              {
                backgroundColor: colors.surface,
                borderLeftColor: colors.primary,
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              <Text style={[styles.pinnedTitle, { color: colors.primary }]}>
                📌 Pinned Message
              </Text>
              <Text
                style={[styles.pinnedSender, { color: colors.textSecondary }]}
              >
                {pinnedMessage.senderName}
              </Text>
              <Text
                style={[styles.pinnedText, { color: colors.text }]}
                numberOfLines={2}
              >
                {pinnedMessage.text}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setPinnedMessage(null)}>
              <Text style={[styles.unpinText, { color: colors.primary }]}>
                Unpin
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Reply Banner */}

        {replyTo && (
          <View
            style={[
              styles.replyBanner,
              {
                backgroundColor: colors.surface,
                borderLeftColor: colors.primary,
              },
            ]}
          >
            <CornerDownLeft size={16} color={colors.primary} />
            <View style={styles.replyBannerTextContainer}>
              <Text style={[styles.replyBannerText, { color: colors.text }]}>
                Replying to {replyTo.senderName}
              </Text>
              <Text
                style={[
                  styles.replyBannerSubtext,
                  { color: colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {replyTo.text}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyTo(null)}>
              <Text style={{ color: colors.primary, fontWeight: '600' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Messages */}

        {messages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            subtitle="Start the conversation and say something!"
          />
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <ChatBubble
                key={item.id}
                message={item}
                isCurrentUser={item.senderId === user?.id}
                onReply={(msg) => setReplyTo(msg)}
                onDelete={(msg) => handleDeleteMessage(msg.id)}
                onPin={handlePinMessage}
                onClearAll={handleClearChat}
                pinnedMessageId={pinnedMessage?.id}
                useLongPressReply={true}
                onForward={handleForwardMessage}
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
            <View
              style={[styles.typingBubble, { backgroundColor: colors.surface }]}
            >
              <Text
                style={[styles.typingText, { color: colors.textSecondary }]}
              >
                AI Assistant is typing...
              </Text>
            </View>
          </View>
        )}

        <ChatInput
          onSend={handleSendMessage}
          disabled={aiTyping}
          replyTo={replyTo}
          onCancelReply={() => setReplyTo(null)}
        />

        {/* Confirmation Modal */}
        <Modal
          visible={confirmationModal.visible}
          transparent
          animationType="fade"
        >
          <TouchableWithoutFeedback
            onPress={() =>
              setConfirmationModal({ ...confirmationModal, visible: false })
            }
          >
            <View style={styles.modalOverlay}>
              <View
                style={[
                  styles.modalContent,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  {confirmationModal.title}
                </Text>
                <Text
                  style={[
                    styles.modalSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  {confirmationModal.subtitle}
                </Text>
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() =>
                      setConfirmationModal({
                        ...confirmationModal,
                        visible: false,
                      })
                    }
                  >
                    <Text style={[styles.cancelBtn, { color: colors.primary }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={confirmationModal.onConfirm}>
                    <Text
                      style={[
                        styles.confirmBtn,
                        { color: colors.error || '#D11A2A' },
                      ]}
                    >
                      Confirm
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* Forward Modal */}
        <Modal visible={forwardModalVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalContent, { backgroundColor: colors.surface }]}
            >
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Forward Message
              </Text>
              <ScrollView style={{ maxHeight: 200 }}>
                {allGroups.map((grp) => (
                  <TouchableOpacity
                    key={grp._id || grp.id}
                    onPress={() => toggleGroupSelection(grp._id || grp.id)}
                    style={{ padding: 8 }}
                  >
                    <Text
                      style={{
                        color: selectedGroups.includes(grp._id || grp.id)
                          ? 'green'
                          : colors.text,
                      }}
                    >
                      {grp.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity onPress={confirmForwarding}>
                <Text style={[styles.confirmBtn, { color: colors.primary }]}>
                  Forward
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setForwardModalVisible(false)}>
                <Text
                  style={[styles.cancelBtn, { color: colors.textSecondary }]}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: { flex: 1, marginLeft: 8 },
  groupName: { fontSize: 18, fontWeight: '600' },
  memberCount: { fontSize: 14, marginTop: 2 },
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
  replyBannerTextContainer: { flex: 1 },
  replyBannerText: { fontSize: 12, fontWeight: '600' },
  replyBannerSubtext: { fontSize: 12 },
  messagesContainer: { padding: 16, flexGrow: 1 },
  typingContainer: { paddingHorizontal: 16, paddingBottom: 8 },
  typingBubble: {
    alignSelf: 'flex-start',
    padding: 12,
    borderRadius: 20,
    maxWidth: '80%',
  },
  typingText: { fontSize: 14, fontStyle: 'italic' },
  pinnedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    padding: 12,
    margin: 12,
    borderRadius: 12,
    gap: 8,
  },
  pinnedTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
  pinnedSender: { fontSize: 12, fontWeight: '600', marginBottom: 2 },
  pinnedText: { fontSize: 14, maxWidth: '95%' },
  unpinText: { fontSize: 12, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: 300,
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  modalSubtitle: { fontSize: 14, textAlign: 'center' },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    gap: 20,
    marginTop: 10,
  },

  confirmBtn: { fontSize: 16, fontWeight: '600', marginTop: 16 },
  cancelBtn: { fontSize: 16, fontWeight: '600', marginTop: 8 },
});
