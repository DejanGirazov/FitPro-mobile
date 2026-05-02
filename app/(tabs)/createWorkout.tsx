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
import { API_URL } from "../../constants/api";
import exercises from "./../data/exercises.json";

const getWorkouts = async () => {
  const res = await fetch(`${API_URL}/api/workout/getWorkouts`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message);
  return data;
};

const CreateWorkoutPage = () => {
  const [searchExercise, setSearchExercise] = useState("");
  const queryClient = useQueryClient();
  const [submitted, setSubmitted] = useState(false);
  const [workoutTitle, setWorkoutTitle] = useState("");
  const [selectedExercises, setSelectedExercises] = useState<any[]>([]);
  const [editedExercises, setEditedExercises] = useState<any[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<any>({});
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  const {
    data: workouts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["workouts"],
    queryFn: getWorkouts,
  });

  const { mutate: createWorkout } = useMutation({
    mutationFn: async ({ title, exercises }: any) => {
      const res = await fetch(`${API_URL}/api/workout/newWorkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, exercises }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      setWorkoutTitle("");
      setSelectedExercises([]);
    },
  });

  const { mutate: updateWorkout } = useMutation({
    mutationFn: async ({ exercises }: any) => {
      const res = await fetch(
        `${API_URL}/api/workout/updateWorkout/${selectedWorkout._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ exercises }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
      setEditModalVisible(false);
    },
  });

  const { mutate: deleteWorkout } = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/api/workout/deleteWorkout/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workouts"] });
    },
  });

  const filteredExercises = exercises.filter((ex) =>
    ex.name.toLowerCase().includes(searchExercise.toLowerCase()),
  );

  const handleAddExercises = () => {
    const formattedExercises = selectedExercises.map((ex: any) => ({
      exerciseId: ex.id,
      exerciseName: ex.name,
      sets: [{ reps: 0, weight: 0 }],
    }));
    createWorkout({ title: workoutTitle, exercises: formattedExercises });
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0A0F1E]">
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text className="text-white text-2xl font-bold tracking-widest mb-6">
          CREATE WORKOUT
        </Text>

        {isError && (
          <Text className="text-red-500 mb-4">
            Failed to load workouts. Please try again later.
          </Text>
        )}

        {isLoading ? (
          <ActivityIndicator size="large" color="#00BFFF" />
        ) : (
          workouts?.map((workout: any) => (
            <View
              key={workout._id}
              className="flex-row justify-between items-center bg-[#1C2A4A] p-4 rounded-xl mb-3"
            >
              <Text className="text-white font-bold">{workout.title}</Text>
              <View className="flex-row gap-3">
                <TouchableOpacity
                  onPress={() => {
                    setSelectedWorkout(workout);
                    setEditedExercises(workout.exercises);
                    setEditModalVisible(true);
                  }}
                  className="bg-[#0A0F1E] px-3 py-2 rounded-lg"
                >
                  <Text className="text-white text-sm">Edit Workout</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => deleteWorkout(workout._id)}
                  className="bg-red-600 px-3 py-2 rounded-lg"
                >
                  <Ionicons name="trash-outline" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <TouchableOpacity
          onPress={() => setCreateModalVisible(true)}
          className="flex-row justify-center items-center gap-2 bg-[#1C2A4A] p-4 rounded-xl mt-2"
        >
          <Text className="text-white font-bold uppercase tracking-widest">
            Create Workout
          </Text>
          <Ionicons name="create-outline" size={20} color="white" />
        </TouchableOpacity>
      </ScrollView>

      {/* Create Workout Modal */}
      <Modal
        visible={createModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setCreateModalVisible(false)}
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
            <Text className="text-white text-xl font-bold mb-4">
              Create New Workout
            </Text>

            <TextInput
              placeholder="Workout Title e.g. Push Day"
              placeholderTextColor="#8E8E93"
              className="bg-[#1C2A4A] text-white p-4 rounded-xl mb-4"
              value={workoutTitle}
              onChangeText={setWorkoutTitle}
            />

            <Text className="text-[#00BFFF] font-bold mb-3">
              Select Exercises
            </Text>

            <TextInput
              placeholder="Search exercises..."
              placeholderTextColor="#8E8E93"
              className="bg-[#1C2A4A] text-white p-4 rounded-xl mb-4"
              value={searchExercise}
              onChangeText={setSearchExercise}
            />

            <ScrollView style={{ maxHeight: 300 }}>
              {filteredExercises.map((exercise: any) => {
                const isSelected = selectedExercises.some(
                  (ex: any) => ex.id === exercise.id,
                );
                return (
                  <TouchableOpacity
                    key={exercise.id}
                    onPress={() => {
                      if (isSelected) {
                        setSelectedExercises(
                          selectedExercises.filter(
                            (ex: any) => ex.id !== exercise.id,
                          ),
                        );
                      } else {
                        setSelectedExercises([...selectedExercises, exercise]);
                      }
                    }}
                    className="flex-row items-center gap-3 p-3 mb-1"
                  >
                    <Ionicons
                      name={isSelected ? "checkbox" : "square-outline"}
                      size={22}
                      color={isSelected ? "#00BFFF" : "#8E8E93"}
                    />
                    <Text className="text-white">{exercise.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {submitted && !workoutTitle && (
              <Text className="text-red-500 mt-2">
                Please enter a workout title.
              </Text>
            )}
            {submitted && selectedExercises.length === 0 && (
              <Text className="text-red-500 mt-2">
                Please select at least one exercise.
              </Text>
            )}

            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={() => setCreateModalVisible(false)}
                className="flex-1 bg-[#1C2A4A] p-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold">Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (!workoutTitle || selectedExercises.length === 0) {
                    setSubmitted(true);
                    return;
                  }
                  handleAddExercises();
                  setCreateModalVisible(false);
                }}
                className="flex-1 bg-[#00BFFF] p-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold">Create Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Workout Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setEditModalVisible(false)}
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
            <Text className="text-white text-xl font-bold mb-4">
              {selectedWorkout?.title}
            </Text>

            <ScrollView style={{ maxHeight: 400 }}>
              {editedExercises.map((exercise: any, index: number) => (
                <View
                  key={exercise._id}
                  className="bg-[#1C2A4A] p-4 rounded-xl mb-3"
                >
                  <Text className="text-white font-bold mb-2">
                    {exercise.exerciseName}
                  </Text>
                  {exercise.sets.map((set: any, setIndex: number) => (
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
                          updated[index].sets[setIndex].reps = text;
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
                          updated[index].sets[setIndex].weight = text;
                          setEditedExercises(updated);
                        }}
                        className="bg-[#0A0F1E] text-white p-2 rounded-lg w-14 text-center"
                      />
                      <Text className="text-[#8E8E93]">kg</Text>
                      <TouchableOpacity
                        onPress={() => {
                          const updated = [...editedExercises];
                          updated[index].sets.splice(setIndex, 1);
                          setEditedExercises(updated);
                        }}
                        className="bg-red-600 p-2 rounded-lg"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={16}
                          color="white"
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                  <TouchableOpacity
                    onPress={() => {
                      const updated = [...editedExercises];
                      updated[index].sets.push({ reps: 0, weight: 0 });
                      setEditedExercises(updated);
                    }}
                    className="bg-[#0A0F1E] p-2 rounded-lg items-center mt-2"
                  >
                    <Text className="text-[#00BFFF]">+ Add Set</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <View className="flex-row gap-3 mt-4">
              <TouchableOpacity
                onPress={() => setEditModalVisible(false)}
                className="flex-1 bg-[#1C2A4A] p-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold">Close</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => updateWorkout({ exercises: editedExercises })}
                className="flex-1 bg-[#00BFFF] p-4 rounded-xl items-center"
              >
                <Text className="text-white font-bold">Save Changes</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CreateWorkoutPage;
