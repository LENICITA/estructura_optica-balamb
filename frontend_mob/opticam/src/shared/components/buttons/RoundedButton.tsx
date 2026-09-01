// src/shared/components/buttons/RoundedButton.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface Props {
  text: string;
  onPress: () => void;
}

export const RoundedButton = ({ text, onPress }: Props) => {
  return (
    <TouchableOpacity style={styles.roundedButton} onPress={() => onPress()}>
      <Text style={styles.textButton}>{text}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  roundedButton: {
    width: '100%',
    height: 40,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  textButton: {
    color: COLORS.white,
    fontWeight: '600',
  },
});