import { useWorkoutStore } from "@/app/store/workoutStore";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CreateWorkoutPage from "./createWorkout";
import StartWorkoutPage from "./startWorkout";
import StatsPage from "./stats";

const tabs = [
  { key: "start", label: "Start", icon: "stopwatch-outline" },
  { key: "create", label: "Create", icon: "create-outline" },
  { key: "stats", label: "Stats", icon: "bar-chart-outline" },
];
const TrainingPage = () => {
  const [activeTab, setActiveTab] = useState("start");
  const { isWorkoutActive } = useWorkoutStore();
  return (
    <>
      {!isWorkoutActive && (
        <SafeAreaView className="bg-[#0A0F1E]" edges={["top"]}>
          <View className="px-4 pt-4 pb-2">
            <Text className="text-white text-2xl text-center font-bold tracking-widest mb-4">
              TRAINING
            </Text>

            {/* Slider */}
            <View className="flex-row bg-[#1C2A4A] rounded-2xl p-1">
              {tabs.map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => setActiveTab(tab.key)}
                  className={`flex-1 flex-row items-center justify-center gap-2 py-3 rounded-xl ${
                    activeTab === tab.key ? "bg-[#00BFFF]" : ""
                  }`}
                >
                  <Ionicons
                    name={tab.icon as any}
                    size={16}
                    color={activeTab === tab.key ? "white" : "#8E8E93"}
                  />
                  <Text
                    className={`text-sm font-bold ${
                      activeTab === tab.key ? "text-white" : "text-[#8E8E93]"
                    }`}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </SafeAreaView>
      )}

      {activeTab === "start" && <StartWorkoutPage />}
      {activeTab === "create" && <CreateWorkoutPage />}
      {activeTab === "stats" && <StatsPage />}
    </>
  );
};
export default TrainingPage;
