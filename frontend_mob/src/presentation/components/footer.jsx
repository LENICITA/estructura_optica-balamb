// src/presentation/components/layout/Footer.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.footerContainer}>
      <View style={styles.footerContent}>
        <Text style={styles.copyright}>
          © {currentYear} Óptica Balamb. Todos los derechos reservados.
        </Text>
        
        <View style={styles.socialContainer}>
          <TouchableOpacity 
            onPress={() => {
              Linking.openURL('https://facebook.com').catch((err) => {
                console.log('Error al abrir Facebook:', err);
              });
            }}
            style={styles.socialButton}
          >
            <Ionicons name="logo-facebook" size={22} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => {
              Linking.openURL('https://instagram.com').catch((err) => {
                console.log('Error al abrir Instagram:', err);
              });
            }}
            style={styles.socialButton}
          >
            <Ionicons name="logo-instagram" size={22} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => {
              Linking.openURL('https://wa.me/573002374767').catch((err) => {
                console.log('Error al abrir WhatsApp:', err);
              });
            }}
            style={styles.socialButton}
          >
            <Ionicons name="logo-whatsapp" size={22} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => {
              Linking.openURL('https://youtube.com').catch((err) => {
                console.log('Error al abrir YouTube:', err);
              });
            }}
            style={styles.socialButton}
          >
            <Ionicons name="logo-youtube" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footerContainer: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#222',
  },
  footerContent: {
    alignItems: 'center',
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
  },
  socialButton: {
    marginHorizontal: 12,
    padding: 4,
  },
});

export default Footer;