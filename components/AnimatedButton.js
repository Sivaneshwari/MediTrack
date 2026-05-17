// components/AnimatedButton.js
import { useRef } from "react";
import { Animated, Pressable, StyleSheet, Text } from "react-native";
import { COLORS } from "../constants/colors";

export default function AnimatedButton({ title, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Pressable
      onPressIn={() => Animated.spring(scale,{toValue:0.96,useNativeDriver:true}).start()}
      onPressOut={() => Animated.spring(scale,{toValue:1,useNativeDriver:true}).start()}
      onPress={onPress}
    >
      <Animated.View style={[styles.btn,{transform:[{scale}]}]}>
        <Text style={styles.text}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
