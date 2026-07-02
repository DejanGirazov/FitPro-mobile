import { useWorkoutStore } from "@/app/store/workoutStore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StopWatch, Timer } from "../../../components/watch";
import WorkoutCompleteModal from "../../../components/WorkoutCompleteModal";
import { API_URL } from "../../../constants/api";
import exercises from "./../../data/exercises.json";

const getWorkouts = async () => {
  const res = await fetch(`${API_URL}/api/workout/getWorkouts`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};
const getLogs = async () => {
  const res = await fetch(`${API_URL}/api/workout/getLogs`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

const getPRs = (
  completedExercises: any[],
  previousLogs: any[],
  workoutId: string,
) => {
  const prs: {
    exerciseName: string;
    weight: number;
    reps: number;
    previousBestWeight: number;
    previousBestReps: number;
  }[] = [];

  completedExercises.forEach((exercise) => {
    // Track previous best weight, and the best reps ever done at each weight
    const previousBestRepsByWeight: Record<number, number> = {};
    let previousBestWeight = 0;

    previousLogs?.forEach((log: any) => {
      if (log.workout !== workoutId) return;
      log.exercises?.forEach((ex: any) => {
        if (ex.exerciseName !== exercise.exerciseName) return;
        ex.sets?.forEach((s: any) => {
          const w = Number(s.weight) || 0;
          const r = Number(s.reps) || 0;
          if (w <= 0 || r <= 0) return;
          if (w > previousBestWeight) previousBestWeight = w;
          if (!previousBestRepsByWeight[w] || r > previousBestRepsByWeight[w]) {
            previousBestRepsByWeight[w] = r;
          }
        });
      });
    });

    if (previousBestWeight <= 0) return; // no history yet, nothing to beat

    const previousBestRepsAtTopWeight =
      previousBestRepsByWeight[previousBestWeight] || 0;

    // Find the best current set that lifts AT LEAST the previous best weight
    const bestQualifyingSet = exercise.sets.reduce(
      (best: { weight: number; reps: number } | null, s: any) => {
        const w = Number(s.weight) || 0;
        const r = Number(s.reps) || 0;
        if (w < previousBestWeight) return best;
        if (!best || w > best.weight || (w === best.weight && r > best.reps)) {
          return { weight: w, reps: r };
        }
        return best;
      },
      null,
    );

    if (!bestQualifyingSet) return;

    const isWeightPR = bestQualifyingSet.weight > previousBestWeight;
    const isRepPR =
      bestQualifyingSet.weight === previousBestWeight &&
      bestQualifyingSet.reps > previousBestRepsAtTopWeight;

    if (isWeightPR || isRepPR) {
      prs.push({
        exerciseName: exercise.exerciseName,
        weight: bestQualifyingSet.weight,
        reps: bestQualifyingSet.reps,
        previousBestWeight,
        previousBestReps: previousBestRepsAtTopWeight,
      });
    }
  });

  return prs;
};

const StartWorkoutPage = () => {
  const {
    selectedWorkout,
    editedExercises,
    setSelectedWorkout,
    setEditedExercises,
    clearSession,
    setIsWorkoutActive,
  } = useWorkoutStore();

  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [restTime, setRestTime] = useState(120);
  const [totalTime, setTotalTime] = useState(0);
  const [workoutPickerVisible, setWorkoutPickerVisible] = useState(false);
  const [addExerciseVisible, setAddExerciseVisible] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [emptyWorkoutTitle, setEmptyWorkoutTitle] = useState("");
  const [emptyWorkoutTitleVisible, setEmptyWorkoutTitleVisible] =
    useState(false);

  const [showCongrats, setShowCongrats] = useState(false);
  const [prExercises, setPrExercises] = useState<any[]>([]);
  const [finishedStats, setFinishedStats] = useState<any>({});

  const queryClient = useQueryClient();
  const { data: workouts, isLoading } = useQuery({
    queryKey: ["workouts"],
    queryFn: getWorkouts,
  });

  const { mutate: finishWorkout, isPending: isFinishPending } = useMutation({
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
      clearSession();
      setCurrentExerciseIndex(0);
      queryClient.invalidateQueries({ queryKey: ["logs"] });
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      setShowCongrats(true);
      setIsWorkoutActive(false); // 👈 add this
    },
  });

  const { data: logs } = useQuery({ queryKey: ["logs"], queryFn: getLogs });

  const { mutate: createAndStartWorkout } = useMutation({
    mutationFn: async ({ title }: { title: string }) => {
      const res = await fetch(`${API_URL}/api/workout/newWorkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, exercises: [] }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: (data) => {
      setSelectedWorkout(data);
      setEditedExercises([]);
      setWorkoutPickerVisible(false);
      setEmptyWorkoutTitleVisible(false);
      setEmptyWorkoutTitle("");
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      // Immediately open add exercise modal so user can build the workout
      setAddExerciseVisible(true);
      setIsWorkoutActive(true);
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
          (sum: number, set: any) =>
            sum + Number(set.weight) * Number(set.reps),
          0,
        )
      );
    }, 0);
    const prs = getPRs(editedExercises, logs || [], selectedWorkout._id);
    setPrExercises(prs);
    setFinishedStats({ totalTime, totalWeight, totalReps });

    finishWorkout({
      totalReps,
      totalWeight,
      totalTime,
      exercises: editedExercises,
    });
  };

  const handleAddExercise = (exercise: any) => {
    const newExercise = {
      exerciseId: exercise.id,
      exerciseName: exercise.name,
      sets: [{ reps: 0, weight: 0 }],
    };
    const updated = [...editedExercises];
    updated.splice(currentExerciseIndex + 1, 0, newExercise);
    setEditedExercises(updated);
    setAddExerciseVisible(false);
    setExerciseSearch("");
    setCurrentExerciseIndex(
      editedExercises.length === 0 ? 0 : currentExerciseIndex + 1,
    );
  };

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(exerciseSearch.toLowerCase()),
  );

  const isWorkoutSelected = selectedWorkout?._id;
  const router = useRouter();

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
          <View className="bg-[#1C2A4A] p-4 rounded-xl mb-4">
            <StopWatch
              shouldStart={selectedWorkout}
              onTimeUpdate={setTotalTime}
            />
            <View className="flex-row items-center justify-between mt-4">
              <Text className="text-white font-bold">Rest Time (seconds):</Text>
              <TextInput
                keyboardType="numeric"
                value={String(restTime)}
                onChangeText={(text) => setRestTime(parseInt(text) || 0)}
                className="bg-[#0A0F1E] text-white p-2 rounded-lg w-20 text-center"
              />
            </View>
            <Timer expirySeconds={restTime} />
          </View>
        )}

        {/* Empty workout — no exercises yet */}
        {isWorkoutSelected && editedExercises.length === 0 && (
          <View className="items-center mt-6 gap-4">
            <Ionicons name="barbell-outline" size={48} color="#1C2A4A" />
            <Text className="text-[#8E8E93] text-center">
              No exercises yet. Add one to get started.
            </Text>
            <TouchableOpacity
              onPress={() => setAddExerciseVisible(true)}
              className="bg-[#00BFFF] px-6 py-4 rounded-xl flex-row items-center gap-2"
            >
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text className="text-white font-bold">Add Exercise</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                clearSession();
                setCurrentExerciseIndex(0);
                setIsWorkoutActive(false); // 👈 add this
              }}
              className="bg-red-600 px-6 py-4 rounded-xl flex-row items-center gap-2"
            >
              <Ionicons name="close" size={20} color="white" />
              <Text className="text-white font-bold">Cancel Workout</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Current Exercise */}
        {isWorkoutSelected && editedExercises.length > 0 && (
          <View>
            <Text className="text-white text-2xl font-bold mb-4">
              {editedExercises[currentExerciseIndex]?.exerciseName}
            </Text>

            <View className="bg-[#1C2A4A] p-4 rounded-xl mb-4">
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
                      className="bg-[#0A0F1E] p-2 rounded-lg"
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
            <View className="flex-row items-center justify-center gap-4 mb-4">
              <TouchableOpacity
                onPress={() => setCurrentExerciseIndex((i) => i - 1)}
                disabled={currentExerciseIndex === 0}
                className={`px-6 py-3 rounded-xl ${currentExerciseIndex === 0 ? "bg-[#1C2A4A] opacity-40" : "bg-[#1C2A4A]"}`}
              >
                <Text className="text-white font-bold">Previous</Text>
              </TouchableOpacity>
              <Text className="text-white font-bold">
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

            {/* Add Exercise Button */}
            <TouchableOpacity
              onPress={() => setAddExerciseVisible(true)}
              className="bg-[#1C2A4A] p-3 rounded-xl items-center flex-row justify-center gap-2 mb-6"
            >
              <Ionicons name="add-circle-outline" size={20} color="#00BFFF" />
              <Text className="text-[#00BFFF] font-bold">Add Exercise</Text>
            </TouchableOpacity>

            {/* Close / Finish */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => {
                  clearSession();
                  setCurrentExerciseIndex(0);
                  setIsWorkoutActive(false); // 👈 add this
                }}
                className="flex-1 bg-[#00BFFF] p-4 rounded-xl items-center flex-row justify-center gap-2"
              >
                <Ionicons name="close" size={20} color="white" />
                <Text className="text-white font-bold">Close Workout</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleFinishWorkout}
                disabled={isFinishPending}
                className={`flex-1 p-4 rounded-xl items-center flex-row justify-center gap-2 ${
                  isFinishPending ? "bg-gray-400" : "bg-[#00BFFF]"
                }`}
              >
                {isFinishPending ? (
                  <>
                    <ActivityIndicator size="small" color="white" />
                    <Text className="text-white font-bold">Finishing...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="white" />
                    <Text className="text-white font-bold">Finish Workout</Text>
                  </>
                )}
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
            style={{ maxHeight: "70%" }}
          >
            <Text className="text-white text-xl font-bold mb-4">
              Choose Workout
            </Text>

            {/* Empty Workout Option */}
            <TouchableOpacity
              onPress={() => setEmptyWorkoutTitleVisible(true)}
              className="flex-row items-center gap-3 bg-[#00BFFF] p-4 rounded-xl mb-4"
            >
              <Ionicons name="flash-outline" size={22} color="white" />
              <View>
                <Text className="text-white font-bold">
                  Start Empty Workout
                </Text>
                <Text className="text-white text-xs opacity-80">
                  Build your workout on the spot
                </Text>
              </View>
            </TouchableOpacity>

            {workouts?.length > 0 && (
              <Text className="text-[#8E8E93] text-xs uppercase tracking-widest mb-3">
                Or choose a saved workout
              </Text>
            )}

            <ScrollView>
              {isLoading ? (
                <ActivityIndicator size="large" color="#00BFFF" />
              ) : workouts?.length === 0 ? (
                <View className="items-center py-4 gap-3">
                  <Text className="text-[#8E8E93] text-center">
                    {"You don't have any saved workouts yet."}
                  </Text>
                  <TouchableOpacity
                    onPress={() => {
                      setWorkoutPickerVisible(false);
                      router.push("/(tabs)/training/createWorkout" as any);
                    }}
                    className="bg-[#1C2A4A] px-6 py-3 rounded-xl"
                  >
                    <Text className="text-[#00BFFF] font-bold">
                      Create a Workout
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                workouts?.map((workout: any) => (
                  <TouchableOpacity
                    key={workout._id}
                    onPress={() => {
                      setSelectedWorkout(workout);
                      setEditedExercises(workout.exercises);
                      setWorkoutPickerVisible(false);
                      setIsWorkoutActive(true);
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

      {/* Empty Workout Title Modal */}
      <Modal
        visible={emptyWorkoutTitleVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setEmptyWorkoutTitleVisible(false)}
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
              justifyContent: "center",
              padding: 24,
            }}
          >
            <View className="bg-[#1C2A4A] p-6 rounded-xl">
              <Text className="text-white text-lg font-bold mb-4 uppercase tracking-widest">
                Name Your Workout
              </Text>
              <TextInput
                placeholder="e.g. Push Day, Full Body..."
                placeholderTextColor="#8E8E93"
                className="bg-[#0A0F1E] text-white p-4 rounded-xl mb-4"
                value={emptyWorkoutTitle}
                onChangeText={setEmptyWorkoutTitle}
                autoFocus
              />
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setEmptyWorkoutTitleVisible(false);
                    setEmptyWorkoutTitle("");
                  }}
                  className="flex-1 bg-[#0A0F1E] p-4 rounded-xl items-center"
                >
                  <Text className="text-white font-bold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    if (!emptyWorkoutTitle.trim()) return;
                    createAndStartWorkout({ title: emptyWorkoutTitle.trim() });
                  }}
                  className={`flex-1 p-4 rounded-xl items-center ${emptyWorkoutTitle.trim() ? "bg-[#00BFFF]" : "bg-[#1C2A4A] opacity-40"}`}
                >
                  <Text className="text-white font-bold">Start</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Add Exercise Modal */}
      <Modal
        visible={addExerciseVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setAddExerciseVisible(false);
          setExerciseSearch("");
        }}
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
              style={{ maxHeight: "80%" }}
            >
              <Text className="text-white text-xl font-bold mb-4">
                Add Exercise
              </Text>
              <TextInput
                placeholder="Search exercises..."
                placeholderTextColor="#8E8E93"
                className="bg-[#1C2A4A] text-white p-4 rounded-xl mb-4"
                value={exerciseSearch}
                onChangeText={setExerciseSearch}
                autoFocus
              />
              <ScrollView>
                {filteredExercises.map((exercise: any) => (
                  <TouchableOpacity
                    key={exercise.id}
                    onPress={() => handleAddExercise(exercise)}
                    className="flex-row items-center gap-3 bg-[#1C2A4A] p-4 rounded-xl mb-2"
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={20}
                      color="#00BFFF"
                    />
                    <Text className="text-white flex-1">{exercise.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              <TouchableOpacity
                onPress={() => {
                  setAddExerciseVisible(false);
                  setExerciseSearch("");
                }}
                className="bg-[#1C2A4A] p-4 rounded-xl items-center mt-4"
              >
                <Text className="text-white font-bold">Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      <WorkoutCompleteModal
        visible={showCongrats}
        onClose={() => setShowCongrats(false)}
        prExercises={prExercises}
        totalTime={finishedStats.totalTime}
        totalWeight={finishedStats.totalWeight}
        totalReps={finishedStats.totalReps}
      />
    </SafeAreaView>
  );
};

export default StartWorkoutPage;
