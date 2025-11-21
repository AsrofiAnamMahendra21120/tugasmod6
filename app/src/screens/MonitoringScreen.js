import { useCallback, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useMqttSensor } from "../hooks/useMqttSensor.js";
import { Api } from "../services/api.js";
import { DataTable } from "../components/DataTable.js";
import { SafeAreaView } from "react-native-safe-area-context";

export function MonitoringScreen() {
  const { temperature, timestamp, connectionState, error: mqttError } = useMqttSensor();
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [page, setPage] = useState(0);
  const pageSize = 10;

  const fetchReadings = useCallback(async () => {
    setLoading(true);
    setApiError(null);
    try {
      const data = await Api.getSensorReadings();
      setReadings(data ?? []);
      setPage(0);
    } catch (err) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchReadings();
    }, [fetchReadings])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchReadings();
    } finally {
      setRefreshing(false);
    }
  }, [fetchReadings]);

  return (
    <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Realtime Temperature</Text>
        <View style={styles.valueRow}>
          <Text style={styles.temperatureText}>
            {typeof temperature === "number" ? `${temperature.toFixed(2)}°C` : "--"}
          </Text>
        </View>
        <Text style={styles.metaText}>MQTT status: {connectionState}</Text>
        {timestamp && (
          <Text style={styles.metaText}>
            Last update: {new Date(timestamp).toLocaleString()}
          </Text>
        )}
        {mqttError && <Text style={styles.errorText}>MQTT error: {mqttError}</Text>}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Triggered Readings History</Text>
        {loading && <ActivityIndicator />}
      </View>
      {apiError && <Text style={styles.errorText}>Failed to load history: {apiError}</Text>}
      <DataTable
        columns={[
          {
            key: "recorded_at",
            title: "Timestamp",
            render: (value) => (value ? new Date(value).toLocaleString() : "--"),
          },
          {
            key: "temperature",
            title: "Temperature (°C)",
            render: (value) =>
              typeof value === "number" ? `${Number(value).toFixed(2)}` : "--",
          },
          {
            key: "threshold_value",
            title: "Threshold (°C)",
            render: (value) =>
              typeof value === "number" ? `${Number(value).toFixed(2)}` : "--",
          },
        ]}
        data={readings.slice(page * pageSize, (page + 1) * pageSize)}
        keyExtractor={(item) => item.id}
      />
    </ScrollView>
    {/* sticky pagination footer */}
    <View style={styles.footerContainer} pointerEvents="box-none">
      <View style={styles.paginationRowBottom}>
        <TouchableOpacity
          style={[styles.smallButton, page === 0 && styles.buttonDisabled, styles.prevButton]}
          onPress={() => setPage(p => Math.max(0, p - 1))}
          disabled={page === 0}
        >
          <Text style={styles.smallButtonText}>Sebelumnya</Text>
        </TouchableOpacity>

        <Text style={styles.pageInfo}>
          Halaman {readings.length === 0 ? 0 : page + 1} / {Math.max(1, Math.ceil(readings.length / pageSize))}
        </Text>

        <TouchableOpacity
          style={[styles.smallButton, (page >= Math.ceil(readings.length / pageSize) - 1 || readings.length === 0) && styles.buttonDisabled, styles.nextButton]}
          onPress={() => setPage(p => Math.min(p + 1, Math.max(0, Math.ceil(readings.length / pageSize) - 1)))}
          disabled={page >= Math.ceil(readings.length / pageSize) - 1 || readings.length === 0}
        >
          <Text style={styles.smallButtonText}>Berikutnya</Text>
        </TouchableOpacity>
      </View>
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fb",
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
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
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  temperatureText: {
    fontSize: 48,
    fontWeight: "700",
    color: "#ff7a59",
  },
  metaText: {
    marginTop: 8,
    color: "#555",
  },
  errorText: {
    marginTop: 8,
    color: "#c82333",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  paginationRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 12,
  },
  pageInfo: {
    fontSize: 14,
    color: "#444",
  },
  paginationRowBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  smallButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    minWidth: 90,
    alignItems: "center",
  },
  smallButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
  },
  prevButton: {
    backgroundColor: "#ef4444",
  },
  nextButton: {
    backgroundColor: "#2563eb",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});