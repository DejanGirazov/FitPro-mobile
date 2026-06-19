import Ionicons from "@expo/vector-icons/Ionicons";
import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

type GpsStatus = "idle" | "acquiring" | "active" | "error";

type Props = {
  active: boolean;
  onDistanceUpdate: (distance: number) => void;
};

const GpsTracker = ({ active, onDistanceUpdate }: Props) => {
  const [status, setStatus] = useState<GpsStatus>("idle");
  const [distance, setDistance] = useState(0);
  const locationSubRef = useRef<Location.LocationSubscription | null>(null);
  const lastPositionRef = useRef<{
    latitude: number;
    longitude: number;
  } | null>(null);

  useEffect(() => {
    if (active) {
      startTracking();
    } else {
      stopTracking();
      setDistance(0);
      setStatus("idle");
    }
    return () => stopTracking();
  }, [active]);

  const startTracking = async () => {
    setStatus("acquiring");
    const { status: permStatus } =
      await Location.requestForegroundPermissionsAsync();
    if (permStatus !== "granted") {
      setStatus("error");
      return;
    }
    lastPositionRef.current = null;
    locationSubRef.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: 10,
        timeInterval: 3000,
      },
      (loc) => {
        setStatus("active");

        if (loc.coords.accuracy && loc.coords.accuracy > 15) return;

        const { latitude, longitude } = loc.coords;
        if (lastPositionRef.current) {
          const d = haversineDistance(
            lastPositionRef.current.latitude,
            lastPositionRef.current.longitude,
            latitude,
            longitude,
          );
          if (d > 0.01) {
            setDistance((prev) => {
              const next = prev + d;
              onDistanceUpdate(next);
              return next;
            });
          }
        }
        lastPositionRef.current = { latitude, longitude };
      },
    );
  };

  const stopTracking = () => {
    locationSubRef.current?.remove();
    locationSubRef.current = null;
    lastPositionRef.current = null;
  };

  const statusColor =
    status === "active"
      ? "#22c55e"
      : status === "acquiring"
        ? "#f97316"
        : status === "error"
          ? "#E63946"
          : "#8E8E93";

  const statusLabel =
    status === "active"
      ? "GPS Active"
      : status === "acquiring"
        ? "Acquiring signal..."
        : status === "error"
          ? "GPS permission denied"
          : "GPS Idle";

  return (
    <View className="bg-[#1C2A4A] rounded-xl p-4 mt-2">
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center gap-2">
          <Ionicons name="navigate-outline" size={20} color={statusColor} />
          <Text
            style={{ color: statusColor }}
            className="font-bold text-sm uppercase tracking-widest"
          >
            {statusLabel}
          </Text>
        </View>
        {status === "active" && (
          <View className="flex-row items-center gap-1">
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: "#22c55e",
              }}
            />
            <Text className="text-[#22c55e] text-xs font-bold">LIVE</Text>
          </View>
        )}
      </View>

      <Text className="text-[#8E8E93] text-xs uppercase tracking-widest mb-1">
        Distance Tracked
      </Text>
      <Text className="text-white text-3xl font-bold">
        {distance.toFixed(2)} <Text className="text-[#8E8E93] text-lg">km</Text>
      </Text>

      {status === "error" && (
        <TouchableOpacity
          onPress={startTracking}
          className="mt-3 bg-[#0A0F1E] p-3 rounded-xl items-center"
        >
          <Text className="text-[#00BFFF] font-bold">Retry Permission</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default GpsTracker;
