import axios from 'axios';
import { User } from '@/types';

export async function getAllUsers(): Promise<User[]> {
  const response = await axios.get<User[]>('http://10.210.11.117:5000/api/users');
  return response.data;
}
