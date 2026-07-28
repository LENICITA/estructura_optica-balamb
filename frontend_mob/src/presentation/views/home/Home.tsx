// src/presentation/views/home/Home.tsx
import React from "react";
import {
  ScrollView,
  View,
  Text,
  ImageBackground,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

export default function Home() {
  const navigation = useNavigation();

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.contentContainer}
    >
      {/* ===== BANNER HERO ===== */}
      <ImageBackground
        source={require("../../../../assets/imagen-bg.jpeg")}  // ✅ 5 niveles
        style={[styles.hero, { height: height * 0.4 }]}
        resizeMode="cover"
      >
        <TouchableOpacity 
          style={styles.button}
          onPress={() => navigation.navigate('RegisterScreen' as never)}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>¡Únete!</Text>
        </TouchableOpacity>
      </ImageBackground>

      <View style={styles.cardsContainer}>
        
        {/* Tarjeta 1: Conócenos */}
        <TouchableOpacity
          style={styles.cardWrapper}
          onPress={() => navigation.navigate('Contacto' as never)}
          activeOpacity={0.8}
        >
          <ImageBackground
            source={require("../../../../assets/card.jpg")}  // ✅ 5 niveles
            style={styles.smallCard}
            imageStyle={styles.cardImage}
          >
            <View style={styles.overlay}>
              <Text style={styles.cardText}>Conócenos</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* Tarjeta 2: Nuestro Producto */}
        <TouchableOpacity
          style={styles.cardWrapper}
          onPress={() => navigation.navigate('Catalogo' as never)}
          activeOpacity={0.8}
        >
          <ImageBackground
            source={require("../../../../assets/card2.jpg")}  // ✅ 5 niveles
            style={styles.smallCard}
            imageStyle={styles.cardImage}
          >
            <View style={styles.overlay}>
              <Text style={styles.cardText}>Nuestro Producto</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* Tarjeta 3: Haz tu pedido */}
        <TouchableOpacity
          style={styles.cardWrapper}
          onPress={() => navigation.navigate('Carrito' as never)}
          activeOpacity={0.8}
        >
          <ImageBackground
            source={require("../../../../assets/card3.jpg")}  // ✅ 5 niveles
            style={styles.largeCard}
            imageStyle={styles.cardImage}
          >
            <View style={styles.overlay}>
              <Text style={styles.cardText}>¡Haz tu pedido!</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingBottom: 10,
  },
  
  hero: {
    width: width,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#B90F0F',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  cardsContainer: {
    paddingHorizontal: 16,
    paddingTop: 5,
  },
  cardWrapper: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
  },
  smallCard: {
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
  },
  largeCard: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    borderRadius: 12,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardText: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
  },
  bottomSpacing: {
    height: 20,
  },
});