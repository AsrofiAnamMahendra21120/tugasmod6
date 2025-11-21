import { useEffect, useContext, useState, useRef } from "react";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNavigationContainerRef } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Ionicons from "@expo/vector-icons/Ionicons";
import { enableScreens } from "react-native-screens";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SplashScreenComponent from "./src/screens/SplashScreen";
import { View } from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import { MonitoringScreen } from "./src/screens/MonitoringScreen.js";
import { ControlScreen } from "./src/screens/ControlScreen.js";
import { LoginScreen } from "./src/screens/LoginScreen.js";
import { ProfileScreen } from "./src/screens/ProfileScreen.js";
import { AuthProvider, AuthContext } from "./src/context/AuthContext.js";
import { assertConfig } from "./src/services/config.js";

const Tab = createBottomTabNavigator();

enableScreens(true);

function MainTabs() {
  const { token } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitle: "IOTWatch",
        headerTitleAlign: "center",
        headerTintColor: "#1f2937",
        headerStyle: { backgroundColor: "#f8f9fb" },
        headerTitleStyle: { fontWeight: "600", fontSize: 18 },
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarIcon: ({ color, size }) => {
          let iconName = "analytics";
          if (route.name === "Control") iconName = "settings";
          else if (route.name === "Account") iconName = "log-in";
          else if (route.name === "Profile") iconName = "person";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Monitoring" component={MonitoringScreen} />
      <Tab.Screen name="Account" component={LoginScreen} />
      {token && <Tab.Screen name="Profile" component={ProfileScreen} />}
      {token && <Tab.Screen name="Control" component={ControlScreen} />}
    </Tab.Navigator>
  );
}

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [showJsSplash, setShowJsSplash] = useState(true);
  const navigationRef = createNavigationContainerRef();

  // Gesture handler (react-native-gesture-handler) - more reliable than PanResponder
  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .failOffsetY([-20, 20])
    .onEnd((e) => {
    const dx = e.translationX;
    if (!navigationRef || !navigationRef.isReady()) return;

    const state = navigationRef.getRootState();
    // derive route names list
    let routeNames = [];
    if (state?.routeNames && state.routeNames.length) routeNames = state.routeNames;
    else if (state?.routes && state.routes.length) routeNames = state.routes.map((r) => r.name);

    const current = navigationRef.getCurrentRoute()?.name;
    const currentIndex = routeNames.indexOf(current);
    if (currentIndex === -1) return;

    if (dx < -50 && currentIndex < routeNames.length - 1) {
      // swipe left -> next tab
      navigationRef.navigate(routeNames[currentIndex + 1]);
    } else if (dx > 50 && currentIndex > 0) {
      // swipe right -> previous tab
      navigationRef.navigate(routeNames[currentIndex - 1]);
    }
  });

  useEffect(() => {
    async function prepare() {
      try {
        // perform any sync/async setup here
        await assertConfig();
        // simulate small resource loading if needed
        await new Promise((res) => setTimeout(res, 800));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: "#f8f9fb",
    },
  };

  return (
    <AuthProvider>
      <SafeAreaProvider>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <GestureDetector gesture={panGesture}>
            <View style={{ flex: 1 }}>
              {appIsReady ? (
                <NavigationContainer ref={navigationRef} theme={theme}>
                  <MainTabs />
                </NavigationContainer>
              ) : null}

              {showJsSplash && (
                <SplashScreenComponent
                  delay={3000}
                  fadeDuration={700}
                  imageSource={require("./assets/temperature_icon.png")}
                  onFinish={() => setShowJsSplash(false)}
                />
              )}
            </View>
          </GestureDetector>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </AuthProvider>
  );
}

