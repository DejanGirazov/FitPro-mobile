import GpsTracker from "@/components/GpsTracker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { API_URL } from "../../../constants/api";

const CARDIO_TYPES = [
  { key: "running", label: "Running", icon: "walk-outline" },
  { key: "cycling", label: "Cycling", icon: "bicycle-outline" },
  { key: "swimming", label: "Swimming", icon: "water-outline" },
  { key: "hiit", label: "HIIT", icon: "flame-outline" },
  { key: "hiking", label: "Hiking", icon: "trail-sign-outline" },
  { key: "walking", label: "Walking", icon: "footsteps-outline" },
];

const formatTime = (seconds: number) => {
  const hrs = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${hrs}:${mins}:${secs}`;
};

const Cardio = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedType, setSelectedType] = useState("running");
  const [sessionActive, setSessionActive] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [distance, setDistance] = useState("");
  const [notes, setNotes] = useState("");
  const [useGps, setUseGps] = useState(false);
  const [gpsDistance, setGpsDistance] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (sessionActive) {
      intervalRef.current = setInterval(
        () => setElapsed((prev) => prev + 1),
        1000,
      );
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionActive]);

  const { mutate: saveSession, isPending: isSaving } = useMutation({
    mutationFn: async (session: any) => {
      const res = await fetch(`${API_URL}/api/cardio/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: session.type,
          duration: session.duration,
          distance: session.distance,
          notes: session.notes,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save session");
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["cardioLogs"] }),
    onError: (err: any) => alert(err.message),
  });

  const resetState = () => {
    setSessionActive(false);
    setElapsed(0);
    setDistance("");
    setNotes("");
    setGpsDistance(0);
  };

  const handleStart = () => {
    setElapsed(0);
    setDistance("");
    setNotes("");
    setGpsDistance(0);
    setSessionActive(true);
  };

  const handleFinish = () => {
    setSessionActive(false);
    const finalDistance = useGps
      ? parseFloat(gpsDistance.toFixed(2))
      : distance
        ? parseFloat(distance)
        : null;
    saveSession({
      type: selectedType,
      duration: elapsed,
      distance: finalDistance,
      notes,
    });
    resetState();
    setModalVisible(false);
  };

  const handleClose = () => {
    resetState();
    setModalVisible(false);
  };

  const selectedTypeInfo = CARDIO_TYPES.find((t) => t.key === selectedType);

  return (
    <View className="flex-1 bg-[#0A0F1E]">
      <View className="flex-1 items-center justify-center px-6">
        <View className="w-full bg-[#1C2A4A] rounded-3xl p-8 items-center gap-6">
          <Ionicons name="stopwatch-outline" size={64} color="#00BFFF" />
          <View className="items-center gap-2">
            <Text className="text-white text-2xl font-bold tracking-widest">
              Ready to Train?
            </Text>
            <Text className="text-[#8E8E93] text-center text-sm">
              Choose your activity and start tracking your cardio session
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            className="bg-[#00BFFF] w-full p-5 rounded-2xl items-center flex-row justify-center gap-3"
          >
            <Ionicons name="play-circle-outline" size={28} color="white" />
            <Text className="text-white font-bold text-lg tracking-widest uppercase">
              Start Session
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior="padding"
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "flex-end",
          }}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 25}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.7)",
              justifyContent: "flex-end",
            }}
          >
            <View
              className="bg-[#0A0F1E] rounded-t-3xl p-6"
              style={{ maxHeight: "90%" }}
            >
              <Text className="text-white text-xl font-bold mb-5">
                Cardio Session
              </Text>

              {!sessionActive && (
                <>
                  <Text className="text-[#8E8E93] text-xs uppercase tracking-widest mb-3">
                    Activity Type
                  </Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    className="mb-5"
                  >
                    <View className="flex-row gap-2">
                      {CARDIO_TYPES.map((type) => (
                        <TouchableOpacity
                          key={type.key}
                          onPress={() => setSelectedType(type.key)}
                          className={`items-center px-4 py-3 rounded-xl gap-1 ${
                            selectedType === type.key
                              ? "bg-[#00BFFF]"
                              : "bg-[#1C2A4A]"
                          }`}
                        >
                          <Ionicons
                            name={type.icon as any}
                            size={22}
                            color="white"
                          />
                          <Text className="text-white text-xs font-bold">
                            {type.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </ScrollView>

                  <Text className="text-[#8E8E93] text-xs uppercase tracking-widest mb-3">
                    Distance Tracking
                  </Text>
                  <View className="flex-row gap-2 mb-5">
                    <TouchableOpacity
                      onPress={() => setUseGps(false)}
                      className={`flex-1 p-3 rounded-xl items-center flex-row justify-center gap-2 ${
                        !useGps ? "bg-[#00BFFF]" : "bg-[#1C2A4A]"
                      }`}
                    >
                      <Ionicons name="create-outline" size={18} color="white" />
                      <Text className="text-white font-bold text-sm">
                        Manual
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setUseGps(true)}
                      className={`flex-1 p-3 rounded-xl items-center flex-row justify-center gap-2 ${
                        useGps ? "bg-[#00BFFF]" : "bg-[#1C2A4A]"
                      }`}
                    >
                      <Ionicons
                        name="navigate-outline"
                        size={18}
                        color="white"
                      />
                      <Text className="text-white font-bold text-sm">GPS</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {sessionActive && (
                <View className="items-center py-6">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Ionicons
                      name={selectedTypeInfo?.icon as any}
                      size={24}
                      color="#00BFFF"
                    />
                    <Text className="text-[#00BFFF] font-bold text-lg uppercase tracking-widest">
                      {selectedTypeInfo?.label}
                    </Text>
                  </View>
                  <Text className="text-white text-6xl font-bold tracking-widest">
                    {formatTime(elapsed)}
                  </Text>
                  <Text className="text-[#8E8E93] mt-2">
                    Session in progress
                  </Text>
                </View>
              )}

              {sessionActive && (
                <View className="gap-3 mb-5">
                  {useGps ? (
                    <GpsTracker
                      active={sessionActive}
                      onDistanceUpdate={setGpsDistance}
                    />
                  ) : (
                    <View>
                      <Text className="text-[#8E8E93] text-xs uppercase tracking-widest mb-2">
                        Distance (km) — optional
                      </Text>
                      <TextInput
                        placeholder="e.g. 5.2"
                        placeholderTextColor="#8E8E93"
                        keyboardType="decimal-pad"
                        value={distance}
                        onChangeText={setDistance}
                        className="bg-[#1C2A4A] text-white p-4 rounded-xl"
                      />
                    </View>
                  )}
                  <View>
                    <Text className="text-[#8E8E93] text-xs uppercase tracking-widest mb-2">
                      Notes — optional
                    </Text>
                    <TextInput
                      placeholder="How did it feel?"
                      placeholderTextColor="#8E8E93"
                      value={notes}
                      onChangeText={setNotes}
                      className="bg-[#1C2A4A] text-white p-4 rounded-xl"
                      multiline
                    />
                  </View>
                </View>
              )}

              <View className="flex-row gap-3 mt-2">
                <TouchableOpacity
                  onPress={handleClose}
                  className="flex-1 bg-[#1C2A4A] p-4 rounded-xl items-center flex-row justify-center gap-2"
                >
                  <Ionicons name="close" size={18} color="white" />
                  <Text className="text-white font-bold">
                    {sessionActive ? "Cancel" : "Close"}
                  </Text>
                </TouchableOpacity>

                {!sessionActive ? (
                  <TouchableOpacity
                    onPress={handleStart}
                    className="flex-1 bg-[#00BFFF] p-4 rounded-xl items-center flex-row justify-center gap-2"
                  >
                    <Ionicons name="play" size={18} color="white" />
                    <Text className="text-white font-bold">Start</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={handleFinish}
                    disabled={isSaving}
                    className={`flex-1 p-4 rounded-xl items-center flex-row justify-center gap-2 ${
                      isSaving ? "bg-green-600 opacity-50" : "bg-green-600"
                    }`}
                  >
                    <Ionicons name="checkmark" size={18} color="white" />
                    <Text className="text-white font-bold">
                      {isSaving ? "Saving..." : "Finish"}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default Cardio;
