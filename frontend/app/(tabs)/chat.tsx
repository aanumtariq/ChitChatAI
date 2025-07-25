import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import useOnlineUsers from '@/hooks/useOnlineUsers';
import { getAllUsers } from '@/services/userService';
import { User } from '@/types';

export default function OnlineUsersScreen() {
  const { user } = useAuth();
  const { onlineUsers } = useOnlineUsers(user?.id);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        console.error('Failed to fetch users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator />
        <Text>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👥 Users</Text>
      {users.map((u) => {
        const isOnline = onlineUsers.includes(u._id!);
        return (
          <View key={u._id} style={styles.userRow}>
            <Text style={styles.userName}>{u.name}</Text>
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isOnline ? 'green' : 'gray' },
              ]}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  userRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  userName: { fontSize: 16, flex: 1 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 8 },
});
