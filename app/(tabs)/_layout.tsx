import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import React from "react";

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarItemStyle: {
          width: "100%",
          height: "100%",
          justifyContent: "center",
          alignItems: "center",
        },
        tabBarStyle: {
          backgroundColor: "#0f0D23",
          borderRadius: 50,
          marginHorizontal: 20,
          height: 55,
          marginBottom: 30,
          position: "absolute",
          overflow: "hidden",
        },
      }}
    >
      <Tabs.Screen
        name="home/index"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <>
              <Ionicons name="home-outline" size={24} color={color} />
            </>
          ),
        }}
      />
      <Tabs.Screen name="home/profile" options={{ href: null }} />
      <Tabs.Screen name="home/details" options={{ href: null }} />
      <Tabs.Screen
        name="training/index"
        options={{
          title: "Training",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <>
              <Ionicons name="barbell-outline" size={24} color={color} />
            </>
          ),
        }}
      />
      <Tabs.Screen name="training/startWorkout" options={{ href: null }} />
      <Tabs.Screen name="training/createWorkout" options={{ href: null }} />
      <Tabs.Screen name="training/stats" options={{ href: null }} />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: "Nutrition",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <>
              <Ionicons name="nutrition-outline" size={24} color={color} />
            </>
          ),
        }}
      />
      <Tabs.Screen
        name="cardio/index"
        options={{
          title: "Cardio",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name="bicycle-outline" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="cardio/startSession" options={{ href: null }} />
      <Tabs.Screen name="cardio/stats" options={{ href: null }} />
    </Tabs>
  );
};

export default _layout;
