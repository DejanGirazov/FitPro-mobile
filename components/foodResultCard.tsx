import { Text, TouchableOpacity } from "react-native";

const FoodResultCard = ({
  food,
  onPress,
  selected,
}: {
  food: any;
  onPress: () => void;
  selected: boolean;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-xl mb-2 p-4 ${selected ? "bg-[#00BFFF]" : "bg-[#1C2A4A]"}`}
    >
      <Text className="text-white font-bold" numberOfLines={1}>
        {food.name}
      </Text>
    </TouchableOpacity>
  );
};

export default FoodResultCard;
