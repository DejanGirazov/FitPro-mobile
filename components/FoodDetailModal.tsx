import React from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Props = {
  visible: boolean;
  onClose: () => void;
  food: any;
  grams: number;
  setGrams: (v: number) => void;
  onAdd: (food: any, grams: number) => void;
};

const FoodDetailModal = ({
  visible,
  onClose,
  food,
  grams,
  setGrams,
  onAdd,
}: Props) => {
  if (!food) return null;

  const scale = (value: number) => {
    return ((grams / food.BaseWeight) * value).toFixed(1);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
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
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.7)",
          }}
        >
          <View
            style={{
              backgroundColor: "#0A0F1E",
              padding: 20,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            }}
          >
            <Text style={{ color: "white", fontSize: 18, fontWeight: "bold" }}>
              {food.name}
            </Text>

            <Text style={{ color: "#8E8E93", marginTop: 10 }}>Grams</Text>

            <TextInput
              value={String(grams)}
              onChangeText={(v) => setGrams(Number(v))}
              keyboardType="numeric"
              style={{
                backgroundColor: "#1C2A4A",
                color: "white",
                padding: 12,
                borderRadius: 10,
                marginTop: 8,
              }}
            />

            <View style={{ marginTop: 15 }}>
              <Text style={{ color: "white" }}>
                Calories: {scale(food.calories)}
              </Text>
              <Text style={{ color: "white" }}>
                Protein: {scale(food.protein)}
              </Text>
              <Text style={{ color: "white" }}>Carbs: {scale(food.carbs)}</Text>
              <Text style={{ color: "white" }}>Fat: {scale(food.fat)}</Text>
            </View>

            <TouchableOpacity
              onPress={() => onAdd(food, grams)}
              style={{
                backgroundColor: "#00BFFF",
                padding: 15,
                borderRadius: 10,
                marginTop: 20,
              }}
            >
              <Text
                style={{
                  color: "white",
                  textAlign: "center",
                  fontWeight: "bold",
                }}
              >
                Add Food
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={onClose} style={{ marginTop: 10 }}>
              <Text style={{ color: "#8E8E93", textAlign: "center" }}>
                Close
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default FoodDetailModal;
