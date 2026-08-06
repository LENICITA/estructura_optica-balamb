import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  hero: {
    height: 300,
    justifyContent: "flex-end",
    alignItems: "flex-end",
    padding: 20,
  },

  button: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
  },

  buttonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },

  cards: {
    padding: 16,
  },

  smallCard: {
    height: 180,
    marginBottom: 16,
    justifyContent: "center",
  },

  largeCard: {
    height: 260,
    justifyContent: "center",
  },

  image: {
    borderRadius: 12,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },

  cardText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },

});