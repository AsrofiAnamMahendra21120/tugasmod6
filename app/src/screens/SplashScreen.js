import React, { useEffect, useRef } from "react";
import { Animated, View, Text, StyleSheet, Image } from "react-native";

export default function SplashScreen({
  delay = 3000,
  fadeDuration = 700,
  backgroundColor = "#b32a2aff",
  imageSource = require("../../assets/temperature_icon.png"),
  title = "Sistem Monitoring \n Suhu - Kelompok 7 Tampan",
  onFinish,
}) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: fadeDuration,
        useNativeDriver: true,
      }).start(() => {
        if (onFinish) onFinish();
      });
    }, delay);

    return () => clearTimeout(t);
  }, [delay, fadeDuration]);

  return (
    <Animated.View style={[styles.container, { backgroundColor, opacity }]}> 
      <View style={styles.inner}>
        <Image source={imageSource} style={styles.logo} />
        <Text style={styles.title}>{title}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    elevation: 999,
    zIndex: 999,
  },
  inner: {
    alignItems: "center",
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 18,
    resizeMode: "contain",
  },
  title: {
    color: "#000000",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.6,
    textAlign: "center"
  },
});
