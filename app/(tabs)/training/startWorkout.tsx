import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StopWatch, Timer } from "../../../components/watch";
import { API_URL } from "../../../constants/api";

const getWorkouts = async () => {
  const res = await fetch(`${API_URL}/api/workout/getWorkouts`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

const StartWorkoutPage = () => {
  const [selectedWorkout, setSelectedWorkout] = useState<any>({});
  const [editedExercises, setEditedExercises] = useState<any[]>([]);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [restTime, setRestTime] = useState(120);
  const [totalTime, setTotalTime] = useState(0);
  const [workoutPickerVisible, setWorkoutPickerVisible] = useState(false);

  const queryClient = useQueryClient();
  const { data: workouts, isLoading } = useQuery({
    queryKey: ["workouts"],
    queryFn: getWorkouts,
  });

  const { mutate: finishWorkout } = useMutation({
    mutationFn: async ({
      totalReps,
      totalWeight,
      totalTime,
      exercises,
    }: any) => {
      const res = await fetch(
        `${API_URL}/api/workout/updateLogs/${selectedWorkout._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            totalReps,
            totalWeight,
            totalTime,
            exercises,
          }),
        },
      );
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Failed to update workout logs");
      return data;
    },
    onSuccess: () => {
      setSelectedWorkout({});
      setCurrentExerciseIndex(0);
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  const handleFinishWorkout = () => {
    const totalReps = editedExercises.reduce((total, exercise) => {
      return (
        total +
        exercise.sets.reduce(
          (sum: number, set: any) => sum + Number(set.reps),
          0,
        )
      );
    }, 0);
    const totalWeight = editedExercises.reduce((total, exercise) => {
      return (
        total +
        exercise.sets.reduce(
          (sum: number, set: any) => sum + Number(set.weight),
          0,
        )
      );
    }, 0);
    finishWorkout({
      totalReps,
      totalWeight,
      totalTime,
      exercises: editedExercises,
    });
  };

  const isWorkoutSelected = selectedWorkout?._id;

  return (
    <SafeAreaView className="flex-1 bg-[#0A0F1E]">
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 200 }}>
        <Text className="text-white text-2xl font-bold tracking-widest mb-6">
          START WORKOUT
        </Text>

        {/* Workout Picker */}
        {!isWorkoutSelected && (
          <View className="items-center mt-10">
            <Text className="text-white text-2xl font-bold text-center mb-6">
              Choose one of workouts to start
            </Text>
            <TouchableOpacity
              onPress={() => setWorkoutPickerVisible(true)}
              className="bg-[#1C2A4A] px-6 py-4 rounded-xl"
            >
              <Text className="text-[#00BFFF] font-bold tracking-widest">
                WORKOUT
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Rest Time */}
        {isWorkoutSelected && (
          <View className="bg-[#1C2A4A] p-5 rounded-xl mb-4">
            {/* Stopwatch */}
            <View
              className="items-center mb-5 pb-5"
              style={{ borderBottomWidth: 1, borderBottomColor: "#ffffff15" }}
            >
              <Text className="text-[#8E8E93] text-xs tracking-widest uppercase mb-2">
                Workout Duration
              </Text>
              <StopWatch
                shouldStart={selectedWorkout}
                onTimeUpdate={setTotalTime}
              />
            </View>

            {/* Rest Timer */}
            <View className="items-center">
              <Text className="text-[#8E8E93] text-xs tracking-widest uppercase mb-3">
                Rest Timer
              </Text>
              <Timer expirySeconds={restTime} />
              <View className="flex-row items-center gap-3 mt-4">
                <Text className="text-[#8E8E93] text-sm">
                  Rest duration (sec):
                </Text>
                <TextInput
                  keyboardType="numeric"
                  value={String(restTime)}
                  onChangeText={(text) => setRestTime(parseInt(text) || 0)}
                  className="bg-[#0A0F1E] text-white p-2 rounded-lg w-20 text-center"
                />
              </View>
            </View>
          </View>
        )}
        {/* Current Exercise */}
        {isWorkoutSelected && editedExercises.length > 0 && (
          <View>
            <Text className="text-white text-2xl font-bold mb-4">
              {selectedWorkout?.title}
            </Text>

            <View className="bg-[#1C2A4A] p-4 rounded-xl mb-4">
              <Text className="text-white text-xl font-bold mb-3">
                {editedExercises[currentExerciseIndex]?.exerciseName}
              </Text>

              {editedExercises[currentExerciseIndex]?.sets.map(
                (set: any, setIndex: number) => (
                  <View
                    key={setIndex}
                    className="flex-row items-center gap-2 mb-2"
                  >
                    <Text className="text-white">Set {setIndex + 1}</Text>
                    <Text className="text-[#8E8E93]">Reps:</Text>
                    <TextInput
                      keyboardType="numeric"
                      value={String(set.reps)}
                      onChangeText={(text) => {
                        const updated = [...editedExercises];
                        updated[currentExerciseIndex].sets[setIndex].reps =
                          text;
                        setEditedExercises(updated);
                      }}
                      className="bg-[#0A0F1E] text-white p-2 rounded-lg w-14 text-center"
                    />
                    <Text className="text-[#8E8E93]">Weight:</Text>
                    <TextInput
                      keyboardType="numeric"
                      value={String(set.weight)}
                      onChangeText={(text) => {
                        const updated = [...editedExercises];
                        updated[currentExerciseIndex].sets[setIndex].weight =
                          text;
                        setEditedExercises(updated);
                      }}
                      className="bg-[#0A0F1E] text-white p-2 rounded-lg w-14 text-center"
                    />
                    <Text className="text-[#8E8E93]">kg</Text>
                    <TouchableOpacity
                      onPress={() => {
                        const updated = [...editedExercises];
                        updated[currentExerciseIndex].sets.splice(setIndex, 1);
                        setEditedExercises(updated);
                      }}
                      className="bg-red-600 p-2 rounded-lg"
                    >
                      <Ionicons name="trash-outline" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ),
              )}

              <TouchableOpacity
                onPress={() => {
                  const updated = [...editedExercises];
                  updated[currentExerciseIndex].sets.push({
                    reps: 0,
                    weight: 0,
                  });
                  setEditedExercises(updated);
                }}
                className="bg-[#0A0F1E] p-3 rounded-lg items-center mt-2"
              >
                <Text className="text-[#00BFFF]">+ Add Set</Text>
              </TouchableOpacity>
            </View>

            {/* Previous / Next */}
            <View className="flex-row items-center justify-center gap-4 mb-6">
              <TouchableOpacity
                onPress={() => setCurrentExerciseIndex((i) => i - 1)}
                disabled={currentExerciseIndex === 0}
                className={`px-6 py-3 rounded-xl ${currentExerciseIndex === 0 ? "bg-[#1C2A4A] opacity-40" : "bg-[#1C2A4A]"}`}
              >
                <Text className="text-white font-bold">Previous</Text>
              </TouchableOpacity>
              <Text className="text-white">
                {currentExerciseIndex + 1} / {editedExercises.length}
              </Text>
              <TouchableOpacity
                onPress={() => setCurrentExerciseIndex((i) => i + 1)}
                disabled={currentExerciseIndex === editedExercises.length - 1}
                className={`px-6 py-3 rounded-xl ${currentExerciseIndex === editedExercises.length - 1 ? "bg-[#1C2A4A] opacity-40" : "bg-[#1C2A4A]"}`}
              >
                <Text className="text-white font-bold">Next</Text>
              </TouchableOpacity>
            </View>

            {/* Close / Finish */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  setSelectedWorkout({});
                  setCurrentExerciseIndex(0);
                }}
                className="flex-1 bg-red-600 p-4 rounded-xl items-center flex-row justify-center gap-2"
              >
                <Ionicons name="close" size={20} color="white" />
                <Text className="text-white font-bold">Close Workout</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFinishWorkout}
                className="flex-1 bg-green-600 p-4 rounded-xl items-center flex-row justify-center gap-2"
              >
                <Ionicons name="checkmark" size={20} color="white" />
                <Text className="text-white font-bold">Finish Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
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
                      setEditedExercises(workout.exercises);
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

export default StartWorkoutPage;
