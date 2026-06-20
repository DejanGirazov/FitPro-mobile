import Ionicons from "@expo/vector-icons/Ionicons";
import React from "react";
import { Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";

type PrExercise = {
  exerciseName: string;
  weight: number;
  reps: number;
  previousBestWeight: number;
  previousBestReps: number;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  prExercises: PrExercise[];
  totalTime?: number;
  totalWeight?: number;
  totalReps?: number;
};

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

const WorkoutCompleteModal = ({
  visible,
  onClose,
  prExercises,
  totalTime,
  totalWeight,
  totalReps,
}: Props) => {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.85)",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <View className="bg-[#1C2A4A] rounded-3xl p-6 items-center">
          <View className="bg-[#00BFFF] rounded-full p-4 mb-4">
            <Ionicons name="trophy" size={40} color="white" />
          </View>

          <Text className="text-white text-2xl font-bold tracking-widest text-center">
            WORKOUT COMPLETE!
          </Text>
          <Text className="text-[#8E8E93] text-center mt-2 mb-6">
            Great job, you crushed it 💪
          </Text>

          {(totalTime !== undefined ||
            totalWeight !== undefined ||
            totalReps !== undefined) && (
            <View className="flex-row gap-6 mb-6">
              {totalTime !== undefined && (
                <View className="items-center">
                  <Text className="text-white text-lg font-bold">
                    {formatTime(totalTime)}
                  </Text>
                  <Text className="text-[#8E8E93] text-xs">Duration</Text>
                </View>
              )}
              {totalWeight !== undefined && (
                <View className="items-center">
                  <Text className="text-white text-lg font-bold">
                    {totalWeight}kg
                  </Text>
                  <Text className="text-[#8E8E93] text-xs">Volume</Text>
                </View>
              )}
              {totalReps !== undefined && (
                <View className="items-center">
                  <Text className="text-white text-lg font-bold">
                    {totalReps}
                  </Text>
                  <Text className="text-[#8E8E93] text-xs">Reps</Text>
                </View>
              )}
            </View>
          )}

          {prExercises.length > 0 && (
            <View className="w-full mb-6">
              <View className="flex-row items-center gap-2 mb-3 justify-center">
                <Ionicons name="flame" size={20} color="#f97316" />
                <Text className="text-[#f97316] font-bold uppercase tracking-widest">
                  New Personal Records
                </Text>
              </View>
              <ScrollView style={{ maxHeight: 200 }}>
                {prExercises.map((pr, i) => (
                  <View
                    key={i}
                    className="flex-row justify-between items-center bg-[#0A0F1E] rounded-xl p-3 mb-2"
                  >
                    <View className="flex-row items-center gap-2 flex-1">
                      <Ionicons name="star" size={16} color="#f97316" />
                      <Text className="text-white font-bold" numberOfLines={1}>
                        {pr.exerciseName}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-[#00BFFF] font-bold">
                        {pr.weight}kg × {pr.reps}
                      </Text>
                      <Text className="text-[#8E8E93] text-xs">
                        prev {pr.previousBestWeight}kg × {pr.previousBestReps}
                      </Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <TouchableOpacity
            onPress={onClose}
            className="bg-[#00BFFF] w-full p-4 rounded-xl items-center"
          >
            <Text className="text-white font-bold tracking-widest uppercase">
              Done
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default WorkoutCompleteModal;
