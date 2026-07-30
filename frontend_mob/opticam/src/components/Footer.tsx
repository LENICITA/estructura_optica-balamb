// src/components/Footer.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const openLink = (url: string) => {
    Linking.openURL(url).catch((err) => {
      console.log('Error al abrir enlace:', err);
    });
  };

  return (
    <View style={styles.footerContainer}>
      <Text style={styles.copyright}>
        © {currentYear} Óptica Balamb. Todos los derechos reservados.
      </Text>
      <View style={styles.socialContainer}>
        <TouchableOpacity onPress={() => openLink('https://facebook.com')}>
          <Ionicons name="logo-facebook" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openLink('https://instagram.com')}>
          <Ionicons name="logo-instagram" size={22} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openLink('https://wa.me/573002374767')}>
          <Ionicons name="logo-whatsapp" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  copyright: {
    color: '#666',
    fontSize: 11,
    marginBottom: 8,
    textAlign: 'center',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
});
