// import { useState, useEffect, useCallback } from 'react';
// import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
// import { useRouter, useFocusEffect } from 'expo-router';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { Plus, MessageCircle } from 'lucide-react-native';
// import { useTheme } from '@/context/ThemeContext';
// import { useAuth } from '@/context/AuthContext';
// import ChatCard from '@/components/ChatCard';
// import FloatingButton from '@/components/FloatingButton';
// import EmptyState from '@/components/EmptyState';
// import Loader from '@/components/Loader';
// import { getGroups, deleteGroup } from '@/services/api';
// import { Group } from '@/types';

// export default function ChatListScreen() {
//   const [groups, setGroups] = useState<Group[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const { colors } = useTheme();
//   const { user } = useAuth();
//   const router = useRouter();

//   const fetchGroups = async (isRefresh = false) => {
//     try {
//       if (isRefresh) setRefreshing(true);
//       const data = await getGroups();
//       setGroups(data);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to load chats');
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   // Refresh groups when screen comes into focus (when user navigates back)
//   useFocusEffect(
//     useCallback(() => {
//       fetchGroups();
//     }, [])
//   );

//   useEffect(() => {
//     fetchGroups();
//   }, []);

//   const handleDeleteGroup = async (groupId: string) => {
//     Alert.alert(
//       'Delete Chat',
//       'Are you sure you want to delete this chat?',
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             try {
//               await deleteGroup(groupId);
//               setGroups(prev => prev.filter(group => group.id !== groupId));
//               Alert.alert('Success', 'Chat deleted');
//             } catch (error) {
//               Alert.alert('Error', 'Failed to delete chat');
//             }
//           },
//         },
//       ]
//     );
//   };

//   const handlePinGroup = (groupId: string) => {
//     setGroups(prev => {
//       const group = prev.find(g => g.id === groupId);
//       if (!group) return prev;

//       const updatedGroup = { ...group, pinned: !group.pinned };
//       const filtered = prev.filter(g => g.id !== groupId);
      
//       if (updatedGroup.pinned) {
//         return [updatedGroup, ...filtered];
//       } else {
//         return [...filtered, updatedGroup].sort((a, b) => 
//           new Date(b.lastMessage?.timestamp || b.createdAt).getTime() - 
//           new Date(a.lastMessage?.timestamp || a.createdAt).getTime()
//         );
//       }
//     });
//   };

//   const handleChatPress = (groupId: string) => {
//     router.push(`/group-chat/${groupId}`);
//   };

//   if (loading) {
//     return <Loader />;
//   }

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
//       <View style={styles.header}>
//         <Text style={[styles.title, { color: colors.text }]}>Chats</Text>
//         <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
//           Welcome back, {user?.name}
//         </Text>
//       </View>

//       {groups.length === 0 ? (
//         <EmptyState
//           icon={MessageCircle}
//           title="No chats yet"
//           subtitle="Start a conversation and connect with others"
//           buttonText="Create Group"
//           onButtonPress={() => router.push('/group-create')}
//         />
//       ) : (
//         <FlatList
//           data={groups}
//           keyExtractor={(item) => item.id}
//           renderItem={({ item }) => (
//             <ChatCard
//               group={item}
//               onPress={() => handleChatPress(item.id)}
//               onPin={() => handlePinGroup(item.id)}
//               onDelete={() => handleDeleteGroup(item.id)}
//             />
//           )}
//           contentContainerStyle={styles.listContainer}
//           refreshing={refreshing}
//           onRefresh={() => fetchGroups(true)}
//           showsVerticalScrollIndicator={false}
//         />
//       )}

//       <FloatingButton
//         icon={Plus}
//         onPress={() => router.push('/group-create')}
//         style={styles.floatingButton}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     paddingHorizontal: 24,
//     paddingTop: 12,
//     paddingBottom: 20,
//   },
//   title: {
//     fontSize: 32,
//     fontWeight: '700',
//     marginBottom: 4,
//   },
//   subtitle: {
//     fontSize: 16,
//   },
//   listContainer: {
//     paddingHorizontal: 24,
//     paddingBottom: 100,
//   },
//   floatingButton: {
//     position: 'absolute',
//     bottom: 100,
//     right: 24,
//   },
// });
import { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Plus, MessageCircle, X, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import ChatCard from '@/components/ChatCard';
import FloatingButton from '@/components/FloatingButton';
import EmptyState from '@/components/EmptyState';
import Loader from '@/components/Loader';
import { getGroups, deleteGroup } from '@/services/api';
import { Group } from '@/types';

export default function ChatListScreen() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();

  const fetchGroups = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const data = await getGroups();
      setGroups(data);
    } catch (error) {
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

  const handleDeleteGroupConfirmed = async () => {
    if (!selectedGroupId) return;
    try {
      await deleteGroup(selectedGroupId);
      setGroups(prev => prev.filter(group => group.id !== selectedGroupId));
      alert('Chat deleted');
    } catch (error) {
      alert('Failed to delete chat');
    } finally {
      setSelectedGroupId(null);
    }
  };

  const handleDeleteGroup = (groupId: string) => {
    setSelectedGroupId(groupId);
  };

  const handlePinGroup = (groupId: string) => {
    setGroups(prev => {
      const group = prev.find(g => g.id === groupId);
      if (!group) return prev;

      const updatedGroup = { ...group, pinned: !group.pinned };
      const filtered = prev.filter(g => g.id !== groupId);

      if (updatedGroup.pinned) {
        return [updatedGroup, ...filtered];
      } else {
        return [...filtered, updatedGroup].sort((a, b) =>
          new Date(b.lastMessage?.timestamp || b.createdAt).getTime() -
          new Date(a.lastMessage?.timestamp || a.createdAt).getTime()
        );
      }
    });
  };

  const handleChatPress = (groupId: string) => {
    router.push(`/group-chat/${groupId}`);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
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
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ChatCard
              group={item}
              onPress={() => handleChatPress(item.id)}
              onPin={() => handlePinGroup(item.id)}
              onDelete={() => handleDeleteGroup(item.id)}
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
        style={styles.floatingButton}
      />

      {/*  Confirm Dialog Modal  */}
      <Modal
        transparent
        animationType="fade"
        visible={!!selectedGroupId}
        onRequestClose={() => setSelectedGroupId(null)}
      >
        <View style={styles.overlay}>
          <View style={[styles.dialog, { backgroundColor: colors.surface }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>Delete Chat?</Text>
            <Text style={[styles.dialogMessage, { color: colors.textSecondary }]}>
              Are you sure you want to delete this chat? This action cannot be undone.
            </Text>
            <View style={styles.dialogButtons}>
              <TouchableOpacity
                style={[styles.dialogBtn, { backgroundColor: colors.border }]}
                onPress={() => setSelectedGroupId(null)}
              >
                <Text style={[styles.dialogBtnText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.dialogBtn, { backgroundColor: colors.error }]}
                onPress={handleDeleteGroupConfirmed}
              >
                <Text style={[styles.dialogBtnText, { color: '#fff' }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  listContainer: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 100,
    right: 24,
  },
  // ✅ Modal styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    elevation: 4,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  dialogMessage: {
    fontSize: 16,
    marginBottom: 20,
  },
  dialogButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  dialogBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  dialogBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
