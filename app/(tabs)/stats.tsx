import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from "../../constants/api";
import WorkoutChart from "../components/WorkoutChart";

const getLogs = async () => {
  const res = await fetch(`${API_URL}/api/workout/getLogs`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

const getWorkouts = async () => {
  const res = await fetch(`${API_URL}/api/workout/getWorkouts`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
    .toString()
    .padStart(2, "0");
  const mins = Math.floor((seconds % 3600) / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${hours}:${mins}:${secs}`;
};

const StatsPage = () => {
  const [selectedWorkout, setSelectedWorkout] = useState<any>(null);
  const [tab, setTab] = useState("weight");
  const [expandedLog, setExpandedLog] = useState<any>(null);
  const [workoutPickerVisible, setWorkoutPickerVisible] = useState(false);

  const { data: logs } = useQuery({ queryKey: ["logs"], queryFn: getLogs });
  const { data: workouts, isLoading } = useQuery({
    queryKey: ["workouts"],
    queryFn: getWorkouts,
  });

  const totalWeight =
    logs?.reduce((sum: number, log: any) => sum + log.totalWeight, 0) || 0;
  const totalReps =
    logs?.reduce((sum: number, log: any) => sum + log.totalReps, 0) || 0;
  const totalTime =
    logs?.reduce((sum: number, log: any) => sum + log.totalTime, 0) || 0;
  const totalWorkouts = logs?.length || 0;
  const recentWorkouts = logs?.slice(-5).reverse();

  const getWorkoutName = (workoutId: string) => {
    return workouts?.find((w: any) => w._id === workoutId)?.title || "Unknown";
  };

  const statCards = [
    { label: "Total Weight Lifted", value: `${totalWeight}kg` },
    { label: "Total Reps", value: `${totalReps}` },
    { label: "Time Spent Lifting", value: formatTime(totalTime) },
    { label: "Total Workouts", value: `${totalWorkouts}` },
  ];

  return (
    <SafeAreaView className="flex-1 bg-[#0A0F1E] pb-300">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 80 }}>
        <Text className="text-white text-2xl font-bold tracking-widest mb-6">
          STATS
        </Text>

        {/* Stat Cards */}
        <View className="flex-row flex-wrap gap-3 mb-6">
          {statCards.map((card, i) => (
            <View
              key={i}
              className="bg-[#1C2A4A] rounded-xl p-4 items-center justify-center"
              style={{
                width: "47%",
                borderLeftWidth: 4,
                borderBottomWidth: 4,
                borderColor: "#00BFFF",
              }}
            >
              <Text className="text-[#8E8E93] text-xs text-center mb-1">
                {card.label}
              </Text>
              <Text className="text-white text-2xl font-bold">
                {card.value}
              </Text>
            </View>
          ))}
        </View>

        {/* Workout Progress Chart */}
        <View className="bg-[#1C2A4A] rounded-xl p-4 mb-6">
          <Text className="text-white text-lg font-bold mb-4">
            Progress Over Time
          </Text>

          {!selectedWorkout ? (
            <View className="items-center">
              <Text className="text-[#8E8E93] text-center mb-4">
                Choose a workout to see your progress
              </Text>
              <TouchableOpacity
                onPress={() => setWorkoutPickerVisible(true)}
                className="bg-[#0A0F1E] px-6 py-3 rounded-xl"
              >
                <Text className="text-[#00BFFF] font-bold">Choose Workout</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="items-center">
              <WorkoutChart
                logs={logs}
                selectedWorkout={selectedWorkout}
                tab={tab}
              />
              <View className="flex-row gap-2 mt-4">
                <TouchableOpacity
                  onPress={() => setTab("weight")}
                  className={`px-4 py-2 rounded-xl ${tab === "weight" ? "bg-[#00BFFF]" : "bg-[#0A0F1E]"}`}
                >
                  <Text className="text-white font-bold">Weight</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setTab("reps")}
                  className={`px-4 py-2 rounded-xl ${tab === "reps" ? "bg-[#00BFFF]" : "bg-[#0A0F1E]"}`}
                >
                  <Text className="text-white font-bold">Reps</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedWorkout(null)}
                  className="bg-red-600 px-4 py-2 rounded-xl"
                >
                  <Text className="text-white font-bold">Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Recent Workouts */}
        <Text className="text-white text-xl font-bold mb-4">
          Last 5 Workouts
        </Text>
        {recentWorkouts?.map((workout: any) => (
          <TouchableOpacity
            key={workout._id}
            onPress={() =>
              setExpandedLog(expandedLog === workout._id ? null : workout._id)
            }
            className="bg-[#1C2A4A] rounded-xl p-4 mb-3"
            style={{ borderLeftWidth: 4, borderColor: "#00BFFF" }}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="text-white font-bold text-lg">
                  {getWorkoutName(workout.workout)}
                </Text>
                <Text className="text-[#8E8E93] text-sm">
                  {new Date(workout.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View className="flex-row gap-4">
                <View className="items-center">
                  <Text className="text-[#8E8E93] text-xs">Duration</Text>
                  <Text className="text-white">
                    {formatTime(workout.totalTime)}
                  </Text>
                </View>
                <View className="items-center">
                  <Text className="text-[#8E8E93] text-xs">Weight</Text>
                  <Text className="text-white">{workout.totalWeight}kg</Text>
                </View>
                <View className="items-center">
                  <Text className="text-[#8E8E93] text-xs">Reps</Text>
                  <Text className="text-white">{workout.totalReps}</Text>
                </View>
              </View>
            </View>

            {expandedLog === workout._id && (
              <View className="mt-4 flex-row flex-wrap">
                {workout.exercises.map((exercise: any, i: number) => (
                  <View key={i} className="w-1/2 mb-3 pr-2">
                    <Text className="text-white font-bold">
                      {exercise.exerciseName}
                    </Text>
                    {exercise.sets.map((set: any, j: number) => (
                      <Text key={j} className="text-[#8E8E93] text-sm">
                        Set {j + 1}: {set.reps} reps @ {set.weight}kg
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Workout Picker Modal */}
      <Modal
        visible={workoutPickerVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setWorkoutPickerVisible(false)}
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
            style={{ maxHeight: "60%" }}
          >
            <Text className="text-white text-xl font-bold mb-4">
              Choose Workout
            </Text>
            <ScrollView>
              {isLoading ? (
                <ActivityIndicator size="large" color="#00BFFF" />
              ) : (
                workouts?.map((workout: any) => (
                  <TouchableOpacity
                    key={workout._id}
                    onPress={() => {
                      setSelectedWorkout(workout);
                      setWorkoutPickerVisible(false);
                    }}
                    className="bg-[#1C2A4A] p-4 rounded-xl mb-3"
                  >
                    <Text className="text-white font-bold">
                      {workout.title}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setWorkoutPickerVisible(false)}
              className="bg-[#1C2A4A] p-4 rounded-xl items-center mt-4"
            >
              <Text className="text-white font-bold">Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default StatsPage;
