import React, { useState, useContext } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { AuthContext } from "../context/AuthContext.js";
import { Api } from "../services/api.js";

export function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [status, setStatus] = useState(null);
  const { login, logout, token, user } = useContext(AuthContext);

  async function onLogin() {
    setError(null);
    try {
      const ok = await login(username, password);
      if (!ok) setError("Invalid credentials");
      else setStatus("Logged in");
    } catch (err) {
      setError(err.message || String(err));
    }
  }

  async function onLogout() {
    await logout();
    setStatus("Logged out");
  }

  async function checkToken() {
    setStatus("Checking...");
    try {
      if (!token) {
        setStatus("No token stored");
        return;
      }
      const res = await Api.validateToken(token);
      setStatus(res?.valid ? `Token valid (user: ${res.username})` : "Token invalid");
    } catch (err) {
      setStatus(`Validation error: ${err.message || err}`);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login (optional)</Text>

      {user ? (
        <>
          <Text style={{ marginBottom: 8 }}>Signed in as: {user.username}</Text>
          <Button title="Logout" onPress={onLogout} />
          <View style={{ height: 12 }} />
          <Button title="Check token" onPress={checkToken} />
          {status && <Text style={{ marginTop: 8 }}>{status}</Text>}
        </>
      ) : (
        <>
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            autoCapitalize="none"
          />
          <TextInput
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            style={styles.input}
            secureTextEntry
          />
          {error && <Text style={styles.error}>{error}</Text>}
          <Button title="Login" onPress={onLogin} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f8f9fb" },
  title: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  error: { color: "#12a52dff", marginBottom: 8 },
});
