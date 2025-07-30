import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { Plus, MessageCircle } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import ChatCard from '@/components/ChatCard';
import FloatingButton from '@/components/FloatingButton';
import EmptyState from '@/components/EmptyState';
import Loader from '@/components/Loader';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getGroups } from '@/services/api';
import { Group } from '@/types';
import Toast from 'react-native-toast-message';
import io from 'socket.io-client';

// Socket connection for real-time updates
const SOCKET_URL = 'http://192.168.61.187:5000';
const socket = io(SOCKET_URL, {
  transports: ['websocket', 'polling'],
  timeout: 10000,
  forceNew: true,
});

export default function ChatListScreen() {
  const insets = useSafeAreaInsets();
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const updateGroupLastMessages = async (groupsData: Group[]) => {
    const updated = await Promise.all(
      groupsData.map(async (group) => {
        const key = `@lastMessage_${group._id}`;
        const stored = await AsyncStorage.getItem(key);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            return { ...group, lastMessage: parsed?.lastMessage || null };
          } catch {
            return group;
          }
        }
        return group;
      })
    );
    return updated;
  };

  const fetchGroups = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const data = await getGroups();
      const updatedGroups = await updateGroupLastMessages(data);
      setGroups(updatedGroups);
    } catch {
      alert('Failed to load chats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchGroups();
    }, [])
  );

  useEffect(() => {
    fetchGroups();
  }, []);

  // Real-time message listening
  useEffect(() => {
    if (user?.id) {
      socket.emit('userConnected', user.id);

      socket.on('newMessage', (message: any) => {
        console.log('📨 New message received in chat list:', message);
        // Update the group's last message and move to top
        setGroups((prev) => {
          const updatedGroups = prev.map((group) => {
            if (group._id === message.groupId) {
              return {
                ...group,
                lastMessage: message,
                unreadCount: (group.unreadCount || 0) + 1,
              };
            }
            return group;
          });

          // Move the updated group to the top (most recent message)
          const updatedGroup = updatedGroups.find(
            (g) => g._id === message.groupId
          );
          if (updatedGroup) {
            const filteredGroups = updatedGroups.filter(
              (g) => g._id !== message.groupId
            );
            return [updatedGroup, ...filteredGroups];
          }
          return updatedGroups;
        });
      });

      return () => {
        socket.off('newMessage');
      };
    }
  }, [user?.id]);

  const handleDeleteGroupConfirmed = async () => {
    if (!selectedGroupId) return;
    try {
      // TODO: Implement deleteGroup API call
      setGroups((prev) => prev.filter((g) => g._id !== selectedGroupId));
      Toast.show({
        type: 'success',
        text1: 'Chat deleted',
      });
    } catch {
      Toast.show({
        type: 'error',
        text1: 'Failed to delete chat',
      });
    } finally {
      setSelectedGroupId(null);
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  const handlePinGroup = (groupId: string) => {
    setGroups((prev) => {
      const group = prev.find((g) => g._id === groupId);
      if (!group) return prev;

      const updatedGroup = { ...group, pinned: !group.pinned };
      const filtered = prev.filter((g) => g._id !== groupId);

      if (updatedGroup.pinned) {
        return [updatedGroup, ...filtered];
      } else {
        return [...filtered, updatedGroup].sort(
          (a, b) =>
            new Date(b.lastMessage?.timestamp || b.createdAt).getTime() -
            new Date(a.lastMessage?.timestamp || a.createdAt).getTime()
        );
      }
    });
  };

  const handleChatPress = (groupId: string) => {
    // Reset unread count when entering chat
    setGroups((prev) =>
      prev.map((group) => {
        if (group._id === groupId) {
          return { ...group, unreadCount: 0 };
        }
        return group;
      })
    );
    router.push(`/group-chat/${groupId}`);
  };

  if (loading) return <Loader />;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Chats</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Welcome back, {user?.name}
        </Text>
      </View>

      {groups.length === 0 ? (
        <EmptyState
          icon={MessageCircle}
          title="No chats yet"
          subtitle="Start a conversation and connect with others"
          buttonText="Create Group"
          onButtonPress={() => router.push('/group-create')}
        />
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item._id!}
          renderItem={({ item }) => (
            <ChatCard
              group={item}
              onPress={() => handleChatPress(item._id!)}
              onPin={() => handlePinGroup(item._id!)}
              onDelete={() => handleDeleteGroup(item._id!)}
            />
          )}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={() => fetchGroups(true)}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FloatingButton
        icon={Plus}
        onPress={() => router.push('/group-create')}
        style={{
          position: 'absolute',
          bottom: insets.bottom + 10,
          right: 25,
        }}
      />

      <Modal
        transparent
        animationType="fade"
        visible={!!selectedGroupId}
        onRequestClose={() => setSelectedGroupId(null)}
      >
        <View style={styles.overlay}>
          <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>
              Delete Chat?
            </Text>
            <Text
              style={[styles.dialogMessage, { color: colors.textSecondary }]}
            >
              Are you sure you want to delete this chat? This action cannot be
              undone.
            </Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={[styles.dialogBtn, { backgroundColor: colors.border }]}
                onPress={() => setSelectedGroupId(null)}
              >
                <Text style={[styles.dialogBtnText, { color: colors.text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogBtn, { backgroundColor: colors.error }]}
                onPress={handleDeleteGroupConfirmed}
              >
                <Text style={[styles.dialogBtnText, { color: '#fff' }]}>
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 20 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 4 },
  subtitle: { fontSize: 16 },
  listContainer: { paddingHorizontal: 24, paddingBottom: 100 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: { width: '100%', borderRadius: 16, padding: 20, elevation: 4 },
  dialogTitle: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  dialogMessage: { fontSize: 16, marginBottom: 20 },
  dialogButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  dialogBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  dialogBtnText: { fontSize: 16, fontWeight: '600' },
});
