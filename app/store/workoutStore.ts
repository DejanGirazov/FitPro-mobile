import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface WorkoutSession {
  selectedWorkout: any;
  editedExercises: any[];
  currentExerciseIndex: number;
  startTimestamp: number | null;
  isWorkoutActive: boolean;

  setSelectedWorkout: (workout: any) => void;
  setEditedExercises: (exercises: any[]) => void;
  setCurrentExerciseIndex: (index: number) => void;
  setIsWorkoutActive: (active: boolean) => void; // ← add this
  clearSession: () => void;
}

export const useWorkoutStore = create<WorkoutSession>()(
  persist(
    (set) => ({
      selectedWorkout: null,
      editedExercises: [],
      currentExerciseIndex: 0,
      startTimestamp: null,
      isWorkoutActive: false,
      setIsWorkoutActive: (active) => set({ isWorkoutActive: active }),

      setSelectedWorkout: (workout) => {
        set({
          selectedWorkout: workout,
          isWorkoutActive: !!workout,
          startTimestamp: Date.now(),
        });
      },
      setEditedExercises: (exercises) => set({ editedExercises: exercises }),
      setCurrentExerciseIndex: (index) => set({ currentExerciseIndex: index }),
      clearSession: () =>
        set({
          selectedWorkout: null,
          editedExercises: [],
          currentExerciseIndex: 0,
          startTimestamp: null,
          isWorkoutActive: false,
        }),
    }),
    {
      name: "workout-session",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);

export default useWorkoutStore;
