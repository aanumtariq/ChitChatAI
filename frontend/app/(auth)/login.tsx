import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '@/context/ThemeContext';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { validateEmail } from '@/utils/validators';
import useGoogleAuth from '@/hooks/useGoogleAuth';
import { useAuth } from '@/context/AuthContext';
import { StyleSheet } from 'react-native';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { colors } = useTheme();
  const { login } = useAuth();

  const { promptAsync, request } = useGoogleAuth(
    () => router.replace('/(tabs)'),
    () => Alert.alert('Login Failed', 'Google login failed')
  );

  const validateForm = () => {
    let isValid = true;
    if (!validateEmail(email)) {
      setEmailError('Enter a valid email');
      isValid = false;
    } else setEmailError('');
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else setPasswordError('');
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await login(email, password); // Only navigate if login is successful
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Login Failed', err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16 }}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft color={colors.text} />
          </TouchableOpacity>
          <Text style={{ color: colors.text, fontSize: 24 }}>Welcome Back</Text>
          <Text style={{ color: colors.textSecondary }}>
            Sign in to continue
          </Text>

          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            error={emailError}
            keyboardType="email-address"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            error={passwordError}
            secureTextEntry
          />

          <Button title="Sign In" onPress={handleLogin} loading={loading} />

          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              marginVertical: 8,
            }}
          >
            <View
              style={{ flex: 1, height: 1, backgroundColor: colors.border }}
            />
            <Text style={{ marginHorizontal: 8, color: colors.textSecondary }}>
              or
            </Text>
            <View
              style={{ flex: 1, height: 1, backgroundColor: colors.border }}
            />
          </View>

          <Button
            title="Continue with Google"
            onPress={() => promptAsync()}
            variant="outline"
            loading={loading}
          />

          <TouchableOpacity onPress={() => router.push('/(auth)/signup')}>
            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
              Don't have an account?{' '}
              <Text style={{ color: colors.primary }}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </ScrollView>
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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    paddingHorizontal: 24,
    gap: 20,
  },
  loginButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
  },
  signupLink: {
    alignItems: 'center',
    marginTop: 20,
  },
  signupText: {
    fontSize: 16,
  },
});

// import { useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   ScrollView,
//   StyleSheet,
// } from 'react-native';
// import { useRouter } from 'expo-router';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { ArrowLeft } from 'lucide-react-native';
// import { useTheme } from '@/context/ThemeContext';
// import Input from '@/components/Input';
// import Button from '@/components/Button';
// import { validateEmail } from '@/utils/validators';
// import useGoogleAuth from '@/hooks/useGoogleAuth';

// export default function LoginScreen() {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [emailError, setEmailError] = useState('');
//   const [passwordError, setPasswordError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const router = useRouter();
//   const { colors } = useTheme();

//   const { promptAsync, request } = useGoogleAuth(
//     () => router.replace('/(tabs)'),
//     () => Alert.alert('Login Failed', 'Google login failed')
//   );

//   const validateForm = () => {
//     let isValid = true;
//     if (!validateEmail(email)) {
//       setEmailError('Enter a valid email');
//       isValid = false;
//     } else {
//       setEmailError('');
//     }
//     if (password.length < 6) {
//       setPasswordError('Password must be at least 6 characters');
//       isValid = false;
//     } else {
//       setPasswordError('');
//     }
//     return isValid;
//   };

//   const handleLogin = async () => {
//     if (!validateForm()) return;
//     setLoading(true);
//     try {
//       // Replace with your real login logic, e.g., Firebase or backend API
//       router.replace('/(tabs)');
//     } catch {
//       Alert.alert('Login Failed', 'Invalid email or password');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <SafeAreaView
//       style={[styles.container, { backgroundColor: colors.background }]}
//     >
//       <KeyboardAvoidingView
//         style={styles.keyboardView}
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       >
//         <ScrollView
//           contentContainerStyle={styles.scrollContainer}
//           keyboardShouldPersistTaps="handled"
//         >
//           <View style={styles.header}>
//             <TouchableOpacity
//               style={styles.backButton}
//               onPress={() => router.back()}
//               activeOpacity={0.7}
//             >
//               <ArrowLeft size={24} color={colors.text} />
//             </TouchableOpacity>
//             <Text style={[styles.title, { color: colors.text }]}>
//               Welcome Back
//             </Text>
//             <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
//               Sign in to continue
//             </Text>
//           </View>

//           <View style={styles.form}>
//             <Input
//               label="Email"
//               value={email}
//               onChangeText={setEmail}
//               error={emailError}
//               keyboardType="email-address"
//               autoCapitalize="none"
//             />
//             <Input
//               label="Password"
//               value={password}
//               onChangeText={setPassword}
//               error={passwordError}
//               secureTextEntry
//             />

//             <Button
//               title="Sign In"
//               onPress={handleLogin}
//               loading={loading}
//               style={styles.loginButton}
//             />

//             <View style={styles.divider}>
//               <View
//                 style={[styles.dividerLine, { backgroundColor: colors.border }]}
//               />
//               <Text
//                 style={[styles.dividerText, { color: colors.textSecondary }]}
//               >
//                 or
//               </Text>
//               <View
//                 style={[styles.dividerLine, { backgroundColor: colors.border }]}
//               />
//             </View>

//             <Button
//               title="Continue with Google"
//               onPress={() => promptAsync()}
//               variant="outline"
//               loading={loading}
//             />

//             <TouchableOpacity
//               style={styles.signupLink}
//               onPress={() => router.push('/(auth)/signup')}
//               activeOpacity={0.7}
//             >
//               <Text
//                 style={[styles.signupText, { color: colors.textSecondary }]}
//               >
//                 Don't have an account?{' '}
//                 <Text style={{ color: colors.primary, fontWeight: '600' }}>
//                   Sign Up
//                 </Text>
//               </Text>
//             </TouchableOpacity>
//           </View>
//         </ScrollView>
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
//   scrollContainer: {
//     flexGrow: 1,
//     justifyContent: 'flex-start',
//     paddingBottom: 40,
//   },
//   header: {
//     paddingHorizontal: 24,
//     paddingTop: 20,
//     paddingBottom: 40,
//   },
//   backButton: {
//     width: 40,
//     height: 40,
//     justifyContent: 'center',
//     marginBottom: 24,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     marginBottom: 8,
//   },
//   subtitle: {
//     fontSize: 16,
//   },
//   form: {
//     paddingHorizontal: 24,
//     gap: 20,
//   },
//   loginButton: {
//     marginTop: 8,
//   },
//   divider: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginVertical: 8,
//   },
//   dividerLine: {
//     flex: 1,
//     height: 1,
//   },
//   dividerText: {
//     marginHorizontal: 16,
//     fontSize: 14,
//   },
//   signupLink: {
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   signupText: {
//     fontSize: 16,
//   },
// });
