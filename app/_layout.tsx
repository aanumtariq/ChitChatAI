// import { useEffect } from 'react';
// import { Stack } from 'expo-router';
// import { StatusBar } from 'expo-status-bar';
// import { useFrameworkReady } from '@/hooks/useFrameworkReady';
// import { AuthProvider } from '@/context/AuthContext';
// import { ThemeProvider } from '@/context/ThemeContext';
// import { GestureHandlerRootView } from 'react-native-gesture-handler';
// // import { MenuProvider } from 'react-native-popup-menu';

// export default function RootLayout() {
//   useFrameworkReady();

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//     {/* <MenuProvider> */}

//     <ThemeProvider>
//       <AuthProvider>
//         <Stack screenOptions={{ headerShown: false }}>
//           <Stack.Screen name="index" />
//           <Stack.Screen name="welcome" />
//           <Stack.Screen name="(auth)" />
//           <Stack.Screen name="(tabs)" />
//           <Stack.Screen name="group-create" />
//           <Stack.Screen name="group-chat/[id]" />
//           <Stack.Screen name="+not-found" />
//         </Stack>
//         <StatusBar style="auto" />
//       </AuthProvider>
//     </ThemeProvider>
//     {/* </MenuProvider> */}
//     </GestureHandlerRootView>
//   );
// }
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { SafeAreaProvider } from 'react-native-safe-area-context'; // ✅ Add this import

// import { MenuProvider } from 'react-native-popup-menu';


export default function RootLayout() {
  useFrameworkReady();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>

      {/* <MenuProvider> */}
      {/* <SafeAreaProvider> ✅ Wrap entire app in SafeAreaProvider */}

        <ThemeProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="welcome" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="group-create" />
              <Stack.Screen name="group-chat/[id]" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </AuthProvider>
        </ThemeProvider>

      {/* </SafeAreaProvider> */}
      {/* </MenuProvider> */}

    </GestureHandlerRootView>
  );
}
