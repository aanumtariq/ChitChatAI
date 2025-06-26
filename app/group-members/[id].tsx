// import { View, Text, StyleSheet, FlatList } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useTheme } from '@/context/ThemeContext';
// import { useLocalSearchParams, useRouter } from 'expo-router';
// import { useEffect, useState } from 'react';
// import { getGroup } from '@/services/api';
// import { Group, Member } from '@/types';
// import { ArrowLeft } from 'lucide-react-native';
// import { TouchableOpacity } from 'react-native-gesture-handler';

// export default function GroupMembersScreen() {
//   const { id } = useLocalSearchParams<{ id: string }>();
//   const [group, setGroup] = useState<Group | null>(null);
//   const { colors } = useTheme();
//   const router = useRouter();

//   useEffect(() => {
//     if (id) {
//       loadGroup();
//     }
//   }, [id]);

//   const loadGroup = async () => {
//     try {
//       const groupData = await getGroup(id!);
//       setGroup(groupData);
//     } catch (err) {
//       console.error('Failed to load group members');
//     }
//   };

//   const members = group?.members || [];

//   const renderMember = ({ item }: { item: Member | { id: string; name: string } }) => (
//     <View style={[styles.memberItem, { borderBottomColor: colors.border }]}>
//       <View style={styles.avatar}>
//         <Text style={[styles.avatarText, { color: colors.text }]}>
//           {item.name[0].toUpperCase()}
//         </Text>
//       </View>
//       <Text style={[styles.memberName, { color: colors.text }]}>
//         {item.name}
//       </Text>
//       {item.id === 'ai-assistant' && (
//         <Text style={[styles.roleTag, { backgroundColor: colors.primary, color: colors.background }]}>
//           AI
//         </Text>
//       )}
//     </View>
//   );

//   return (
//     <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
//       <View style={styles.header}>
//         <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//           <ArrowLeft size={24} color={colors.text} />
//         </TouchableOpacity>
//         <Text style={[styles.title, { color: colors.text }]}>
//           Group Members
//         </Text>
//       </View>

//       <FlatList
//         data={[...members, { id: 'ai-assistant', name: 'AI Assistant' }]}
//         keyExtractor={(item) => item.id}
//         renderItem={renderMember}
//         contentContainerStyle={styles.list}
//         showsVerticalScrollIndicator={false}
//       />
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   header: {
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 12,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   backButton: {
//     marginRight: 12,
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: '600',
//   },
//   list: {
//     paddingHorizontal: 16,
//     paddingTop: 8,
//   },
//   memberItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     gap: 12,
//   },
//   memberName: {
//     fontSize: 16,
//     flex: 1,
//   },
//   avatar: {
//     width: 36,
//     height: 36,
//     borderRadius: 18,
//     backgroundColor: '#EBAD12',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   avatarText: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   roleTag: {
//     paddingHorizontal: 8,
//     paddingVertical: 2,
//     borderRadius: 6,
//     fontSize: 12,
//     fontWeight: '600',
//   },
// });
