// src/components/Footer.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { COLORS } from '../constants/colors';
import { FontAwesome } from '@expo/vector-icons'; //

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.footer}>
      <View style={styles.column}>
        <Text style={styles.columnTitle}>Contacto</Text>
        <TouchableOpacity onPress={() => openLink('mailto:opticavirtualbalamb@gmail.com')}>
          <Text style={styles.link}>opticavirtualbalamb@gmail.com</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => openLink('tel:+573002374767')}>
          <Text style={styles.link}>+57 300 237 4767</Text>
        </TouchableOpacity>
        <Text style={styles.text}>Lunes a Viernes: 8am - 6pm</Text>
        <Text style={styles.text}>Sábados: 9am - 1pm</Text>
      </View>

      <View style={styles.column}>
        <Text style={styles.columnTitle}>Tienda</Text>
        <Text style={styles.text}>Inicio</Text>
        <Text style={styles.text}>Catálogo</Text>
        <Text style={styles.text}>Acerca de</Text>
      </View>

      <View style={styles.column}>
        <Text style={styles.columnTitle}>Síguenos</Text>
        <View style={styles.socialContainer}>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => openLink('https://facebook.com')}
          >
            <FontAwesome name="facebook" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => openLink('https://instagram.com')}
          >
            <FontAwesome name="instagram" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => openLink('https://wa.me/573002374767')}
          >
            <FontAwesome name="whatsapp" size={24} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.socialButton}
            onPress={() => openLink('https://youtube.com')}
          >
            <FontAwesome name="youtube" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.copyright}>
          © {currentYear} Óptica Balamb. Todos los derechos reservados.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#000',
    paddingVertical: 30,
    paddingHorizontal: 20,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  column: {
    width: '30%',
    minWidth: 100,
    marginBottom: 16,
  },
  columnTitle: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  link: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
    textDecorationLine: 'underline',
  },
  text: {
    color: '#ccc',
    fontSize: 12,
    marginBottom: 4,
  },
  socialContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  socialButton: {
    padding: 4,
  },
  copyright: {
    color: '#666',
    fontSize: 10,
    marginTop: 4,
  },
});