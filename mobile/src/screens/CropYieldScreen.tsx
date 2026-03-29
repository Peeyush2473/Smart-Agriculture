/**
 * CropYieldScreen.tsx
 * Add to: mobile/src/screens/CropYieldScreen.tsx
 * Register in your navigation stack (e.g., AppNavigator.tsx)
 */

import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import api from "../services/api"; // Your existing axios instance

// ─── Types ────────────────────────────────────────────────────────────────────

interface Options {
  crops: string[];
  soil_types: string[];
  seasons: string[];
  season_descriptions: Record<string, string>;
}

interface YieldResult {
  crop: string;
  soil_type: string;
  season: string;
  land_area_acres: number;
  yield_per_acre_quintals: number;
  total_yield_quintals: number;
  confidence_band: { low: number; high: number };
  market_price_per_quintal_inr: number;
  estimated_revenue_inr: number;
  estimated_cost_inr: number;
  estimated_profit_inr: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatINR = (amount: number) =>
  `₹${amount.toLocaleString("en-IN")}`;

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ─── Component ────────────────────────────────────────────────────────────────

export default function CropYieldScreen() {
  const [options, setOptions] = useState<Options | null>(null);
  const [crop, setCrop] = useState("wheat");
  const [soilType, setSoilType] = useState("loamy");
  const [season, setSeason] = useState("rabi");
  const [landArea, setLandArea] = useState("5");
  const [rainfall, setRainfall] = useState("700");
  const [temperature, setTemperature] = useState("25");
  const [fertilizer, setFertilizer] = useState("80");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<YieldResult | null>(null);

  useEffect(() => {
    api.get("/yield/options")
      .then((res) => setOptions(res.data))
      .catch(() => Alert.alert("Error", "Could not load options"));
  }, []);

  const handlePredict = async () => {
    const area = parseFloat(landArea);
    if (isNaN(area) || area <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid land area.");
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const res = await api.post("/yield/predict", {
        crop,
        soil_type: soilType,
        season,
        land_area_acres: area,
        rainfall_mm: parseFloat(rainfall) || 700,
        temperature_c: parseFloat(temperature) || 25,
        fertilizer_kg_per_acre: parseFloat(fertilizer) || 80,
      });
      setResult(res.data);
    } catch (err: any) {
      Alert.alert("Prediction Failed", err.response?.data?.detail || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  if (!options) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
        <Text style={styles.loadingText}>Loading options...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>🌾 Crop Yield Predictor</Text>
      <Text style={styles.subtitle}>
        Enter your farm details to estimate yield and profit
      </Text>

      {/* ── Crop ── */}
      <Text style={styles.label}>Crop</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={crop} onValueChange={setCrop} style={styles.picker}>
          {options.crops.map((c) => (
            <Picker.Item key={c} label={capitalize(c)} value={c} />
          ))}
        </Picker>
      </View>

      {/* ── Soil Type ── */}
      <Text style={styles.label}>Soil Type</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={soilType} onValueChange={setSoilType} style={styles.picker}>
          {options.soil_types.map((s) => (
            <Picker.Item key={s} label={capitalize(s)} value={s} />
          ))}
        </Picker>
      </View>

      {/* ── Season ── */}
      <Text style={styles.label}>Season</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={season} onValueChange={setSeason} style={styles.picker}>
          {options.seasons.map((s) => (
            <Picker.Item
              key={s}
              label={`${capitalize(s)} — ${options.season_descriptions[s]}`}
              value={s}
            />
          ))}
        </Picker>
      </View>

      {/* ── Numeric Inputs ── */}
      {[
        { label: "Land Area (acres)", value: landArea, setter: setLandArea },
        { label: "Expected Rainfall (mm)", value: rainfall, setter: setRainfall },
        { label: "Avg Temperature (°C)", value: temperature, setter: setTemperature },
        { label: "Fertilizer (kg/acre)", value: fertilizer, setter: setFertilizer },
      ].map(({ label, value, setter }) => (
        <View key={label}>
          <Text style={styles.label}>{label}</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setter}
            keyboardType="numeric"
            placeholder={`Enter ${label}`}
            placeholderTextColor="#9e9e9e"
          />
        </View>
      ))}

      {/* ── Predict Button ── */}
      <TouchableOpacity
        style={styles.button}
        onPress={handlePredict}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Predict Yield & Profit</Text>
        )}
      </TouchableOpacity>

      {/* ── Results ── */}
      {result && (
        <View style={styles.resultCard}>
          <Text style={styles.resultTitle}>📊 Prediction Results</Text>

          <ResultRow label="Crop" value={capitalize(result.crop)} />
          <ResultRow label="Season" value={capitalize(result.season)} />
          <ResultRow label="Soil" value={capitalize(result.soil_type)} />
          <ResultRow label="Land Area" value={`${result.land_area_acres} acres`} />

          <View style={styles.divider} />

          <ResultRow
            label="Yield per Acre"
            value={`${result.yield_per_acre_quintals} quintals`}
            highlight
          />
          <ResultRow
            label="Total Yield"
            value={`${result.total_yield_quintals} quintals`}
            highlight
          />
          <ResultRow
            label="Yield Range"
            value={`${result.confidence_band.low} – ${result.confidence_band.high} qtl`}
          />

          <View style={styles.divider} />

          <ResultRow
            label="Market Price"
            value={`${formatINR(result.market_price_per_quintal_inr)}/quintal`}
          />
          <ResultRow
            label="Estimated Revenue"
            value={formatINR(result.estimated_revenue_inr)}
          />
          <ResultRow
            label="Estimated Cost"
            value={formatINR(result.estimated_cost_inr)}
          />

          <View style={[styles.profitBanner,
            result.estimated_profit_inr > 0 ? styles.profitPositive : styles.profitNegative]}>
            <Text style={styles.profitLabel}>Estimated Profit</Text>
            <Text style={styles.profitValue}>
              {formatINR(result.estimated_profit_inr)}
            </Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ResultRow({ label, value, highlight = false }: {
  label: string; value: string; highlight?: boolean
}) {
  return (
    <View style={styles.resultRow}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={[styles.resultValue, highlight && styles.highlightValue]}>{value}</Text>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f1f8e9" },
  content: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 12, color: "#555" },
  title: { fontSize: 24, fontWeight: "bold", color: "#1b5e20", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#555", marginBottom: 20 },
  label: { fontSize: 13, fontWeight: "600", color: "#2e7d32", marginTop: 12, marginBottom: 4 },
  pickerWrapper: {
    backgroundColor: "#fff", borderRadius: 10, borderWidth: 1,
    borderColor: "#c8e6c9", overflow: "hidden",
  },
  picker: { height: 50 },
  input: {
    backgroundColor: "#fff", borderRadius: 10, borderWidth: 1,
    borderColor: "#c8e6c9", paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 15, color: "#212121",
  },
  button: {
    backgroundColor: "#2e7d32", paddingVertical: 15, borderRadius: 12,
    alignItems: "center", marginTop: 24,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  resultCard: {
    marginTop: 24, backgroundColor: "#fff", borderRadius: 14,
    padding: 16, elevation: 3,
  },
  resultTitle: { fontSize: 18, fontWeight: "bold", color: "#1b5e20", marginBottom: 12 },
  resultRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 5 },
  resultLabel: { color: "#555", fontSize: 14 },
  resultValue: { color: "#212121", fontSize: 14, fontWeight: "500" },
  highlightValue: { color: "#2e7d32", fontWeight: "bold", fontSize: 15 },
  divider: { height: 1, backgroundColor: "#e0e0e0", marginVertical: 10 },
  profitBanner: { borderRadius: 10, padding: 14, marginTop: 12, alignItems: "center" },
  profitPositive: { backgroundColor: "#e8f5e9" },
  profitNegative: { backgroundColor: "#ffebee" },
  profitLabel: { fontSize: 13, color: "#555", marginBottom: 4 },
  profitValue: { fontSize: 26, fontWeight: "bold", color: "#1b5e20" },
});
