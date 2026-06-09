import { Text, View } from "react-native";

const BmiScale = ({ bmi }: any) => {
  const segments = [
    { label: "Underweight", range: "<18.5", color: "#378ADD", flex: 2 },
    { label: "Normal", range: "18.5-24.9", color: "#639922", flex: 3 },
    { label: "Overweight", range: "25-29.9", color: "#EF9F27", flex: 2 },
    { label: "Obese", range: "30+", color: "#E24B4A", flex: 2 },
  ];

  return (
    <View className="mt-4">
      <View className="flex-row rounded-xl overflow-hidden h-8">
        {segments.map((seg) => (
          <View
            key={seg.label}
            style={{ flex: seg.flex, backgroundColor: seg.color }}
          />
        ))}
      </View>
      <View className="flex-row mt-2">
        {segments.map((seg) => (
          <View
            key={seg.label}
            style={{ flex: seg.flex, alignItems: "center" }}
          >
            <Text
              style={{ color: seg.color, fontSize: 10, fontWeight: "bold" }}
            >
              {seg.label}
            </Text>
            <Text style={{ color: "#8E8E93", fontSize: 9 }}>{seg.range}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};
export default BmiScale;
