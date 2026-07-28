// src/components/Layout.tsx
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Header } from './Header';
import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
  navigation: any;
  showFooter?: boolean;
}

export const Layout = ({ children, navigation, showFooter = true }: LayoutProps) => {
  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
      {showFooter && <Footer />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
});