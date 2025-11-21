import React, { useState, useContext } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { AuthContext } from "../context/AuthContext.js";
import { Api } from "../services/api.js";
import { SafeAreaView } from "react-native-safe-area-context";

export function ProfileScreen() {
  const { user, token, logout } = useContext(AuthContext);
  const [tokenStatus, setTokenStatus] = useState(null);
  const [checking, setChecking] = useState(false);

  async function checkTokenStatus() {
    setChecking(true);
    try {
      if (!token) {
        setTokenStatus("No token");
        return;
      }
      const res = await Api.validateToken(token);
      if (res?.valid) {
        const expiresAt = new Date(res.expiresAt);
        const now = new Date();
        const hoursLeft = Math.ceil((expiresAt - now) / (1000 * 60 * 60));
        setTokenStatus(`Valid - Expires in ${hoursLeft} hours`);
      } else {
        setTokenStatus("Invalid or expired");
      }
    } catch (err) {
      setTokenStatus(`Error: ${err.message}`);
    } finally {
      setChecking(false);
    }
  }

  async function handleLogout() {
    await logout();
  }

  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <ScrollView style={styles.container}>
          <View style={styles.card}>
            <Text style={styles.title}>Not Logged In</Text>
            <Text style={styles.text}>Please go to Account tab to login.</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
      <ScrollView style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>User Profile</Text>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Username</Text>
            <Text style={styles.value}>{user.username}</Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Authentication Status</Text>
            <Text style={[styles.value, styles.statusText]}>
              {token ? "Logged In" : "Not Logged In"}
            </Text>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.label}>Token Status</Text>
            {tokenStatus ? (
              <Text style={styles.value}>{tokenStatus}</Text>
            ) : (
              <Text style={styles.value}>Not checked yet</Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, styles.checkButton]}
            onPress={checkTokenStatus}
            disabled={checking}
          >
            {checking ? (
              <ActivityIndicator color="#ce7474ff" />
            ) : (
              <Text style={styles.buttonText}>Check Token Status</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.logoutButton]}
            onPress={handleLogout}
          >
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Session Info</Text>
          <Text style={styles.infoText}>
            You are logged in and can access the Control tab to manage thresholds.
          </Text>
          <Text style={styles.infoText}>
            Your token is valid for 24 hours from login. Use the Check Token Status button to verify remaining time.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#497adbff",
    padding: 16,
  },
  card: {
    backgroundColor: "#805a5aff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 20,
    color: "#1f2937",
  },
  infoSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  value: {
    fontSize: 16,
    color: "#1f2937",
    fontWeight: "500",
  },
  statusText: {
    color: "#10b981",
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  checkButton: {
    backgroundColor: "#3b82f6",
  },
  logoutButton: {
    backgroundColor: "#ef4444",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
  },
  infoCard: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#3b82f6",
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
    marginBottom: 8,
  },
});
