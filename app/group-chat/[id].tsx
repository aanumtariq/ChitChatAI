// import { useState, useEffect, useRef } from 'react';
// import { View, Text, StyleSheet, FlatList, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
// import { useRouter, useLocalSearchParams } from 'expo-router';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { ArrowLeft, Users } from 'lucide-react-native';
// import { useTheme } from '@/context/ThemeContext';
// import { useAuth } from '@/context/AuthContext';
// import ChatBubble from '@/components/ChatBubble';
// import ChatInput from '@/components/ChatInput';
// import EmptyState from '@/components/EmptyState';
// import Loader from '@/components/Loader';
// import { getMessages, sendMessage, getGroup } from '@/services/api';
// import { generateAIResponse } from '@/services/openai';
// import { Message, Group } from '@/types';

// export default function GroupChatScreen() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [group, setGroup] = useState<Group | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [aiTyping, setAiTyping] = useState(false);
//   const { colors } = useTheme();
//   const { user } = useAuth();
//   const router = useRouter();
//   const flatListRef = useRef<FlatList>(null);

//   useEffect(() => {
//     if (id) {
//       fetchGroupData();
//       fetchMessages();
//     }
//   }, [id]);

//   const fetchGroupData = async () => {
//     try {
//       const groupData = await getGroup(id!);
//       setGroup(groupData);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to load group');
//     }
//   };

//   const fetchMessages = async () => {
//     try {
//       setLoading(true);
//       const data = await getMessages(id!);
//       setMessages(data);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to load messages');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSendMessage = async (text: string) => {
//     const tempMessage: Message = {
//       id: Date.now().toString(),
//       text,
//       senderId: user!.id,
//       senderName: user!.name,
//       timestamp: new Date().toISOString(),
//       isAI: false,
//     };

//     setMessages(prev => [...prev, tempMessage]);

//     try {
//       const message = await sendMessage(id!, text);
//       setMessages(prev => prev.map(msg =>
//         msg.id === tempMessage.id ? message : msg
//       ));

//       // Generate AI response
//       setTimeout(() => {
//         handleAIResponse(text);
//       }, 1000);
//     } catch (error) {
//       Alert.alert('Error', 'Failed to send message');
//       setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
//     }
//   };

//   const handleAIResponse = async (userMessage: string) => {
//     setAiTyping(true);

//     try {
//       const aiResponse = await generateAIResponse(userMessage, messages);

//       const aiMessage: Message = {
//         id: Date.now().toString(),
//         text: aiResponse,
//         senderId: 'ai-assistant',
//         senderName: 'AI Assistant',
//         timestamp: new Date().toISOString(),
//         isAI: true,
//       };

//       setMessages(prev => [...prev, aiMessage]);
//     } catch (error) {
//       console.log('AI response failed');
//     } finally {
//       setAiTyping(false);
//     }
//   };

//   const scrollToBottom = () => {
//     flatListRef.current?.scrollToEnd({ animated: true });
//   };

//   if (loading) {
//     return <Loader />;
//   }

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
//       <KeyboardAvoidingView
//         style={styles.keyboardView}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
//       >
//         <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
//           <TouchableOpacity
//             style={styles.backButton}
//             onPress={() => router.back()}
//             activeOpacity={0.7}
//           >
//             <ArrowLeft size={24} color={colors.text} />
//           </TouchableOpacity>

//           <View style={styles.headerInfo}>
//             <Text style={[styles.groupName, { color: colors.text }]}>
//               {group?.name || 'Group Chat'}
//             </Text>
//             <Text style={[styles.memberCount, { color: colors.textSecondary }]}>
//               {group?.members.length || 0} members + AI Assistant
//             </Text>
//           </View>

//           <TouchableOpacity style={styles.groupIconButton} activeOpacity={0.7}>
//             <Users size={24} color={colors.primary} strokeWidth={2} />
//           </TouchableOpacity>
//         </View>

//         {messages.length === 0 ? (
//           <EmptyState
//             title="No messages yet"
//             subtitle="Start the conversation and say something!"
//           />
//         ) : (
//           <FlatList
//             ref={flatListRef}
//             data={messages}
//             keyExtractor={(item) => item.id}
//             renderItem={({ item }) => (
//               <ChatBubble
//                 message={item}
//                 isCurrentUser={item.senderId === user?.id}
//               />
//             )}
//             contentContainerStyle={styles.messagesContainer}
//             onContentSizeChange={scrollToBottom}
//             onLayout={scrollToBottom}
//             showsVerticalScrollIndicator={false}
//           />
//         )}

//         {aiTyping && (
//           <View style={styles.typingContainer}>
//             <View style={[styles.typingBubble, { backgroundColor: colors.surface }]}>
//               <Text style={[styles.typingText, { color: colors.textSecondary }]}>
//                 AI Assistant is typing...
//               </Text>
//             </View>
//           </View>
//         )}

//         <ChatInput
//           onSend={handleSendMessage}
//           disabled={aiTyping}
//         />
//       </KeyboardAvoidingView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   keyboardView: {
//     flex: 1,
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   headerInfo: {
//     flex: 1,
//     marginLeft: 8,
//   },
//   groupName: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   memberCount: {
//     fontSize: 14,
//     marginTop: 2,
//   },
//   groupIconButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   messagesContainer: {
//     paddingVertical: 16,
//     paddingHorizontal: 16,
//     flexGrow: 1,
//   },
//   typingContainer: {
//     paddingHorizontal: 16,
//     paddingBottom: 8,
//   },
//   typingBubble: {
//     alignSelf: 'flex-start',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     borderRadius: 20,
//     maxWidth: '80%',
//   },
//   typingText: {
//     fontSize: 14,
//     fontStyle: 'italic',
//   },
// });
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
import { ArrowLeft, Users } from 'lucide-react-native';
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
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const flatListRef = useRef<FlatList>(null);

  if (!id) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Group ID not found in route</Text>
      </View>
    );
  }

  useEffect(() => {
    if (id) {
      fetchGroupData();
      fetchMessages();
    }
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
    };

    setMessages((prev) => [...prev, tempMessage]);

    try {
      const serverMessage = await sendMessage(id!, text);

      // Ensure correct sender info is preserved
      const message: Message = {
        ...serverMessage,
        senderId: user!.id,
        senderName: user!.name,
      };

      setMessages((prev) =>
        prev.map((msg) => (msg.id === tempMessage.id ? message : msg))
      );

      // Generate AI response
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
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.background,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <Text style={[styles.groupName, { color: colors.text }]}>
              {group?.name || 'Group Chat'}
            </Text>
            <Text style={[styles.memberCount, { color: colors.textSecondary }]}>
              {group?.members.length || 0} members + AI Assistan
            </Text>
          </View>

          <TouchableOpacity
            style={styles.groupIconButton}
            activeOpacity={0.7}
            onPress={() => router.push(`/group-members/group-members`)}
          >
            <Users size={24} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
        </View>

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
                message={item}
                isCurrentUser={item.senderId === user?.id}
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

        <ChatInput onSend={handleSendMessage} disabled={aiTyping} />
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
});
