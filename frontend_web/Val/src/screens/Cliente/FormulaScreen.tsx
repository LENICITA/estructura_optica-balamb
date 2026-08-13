import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  textInput,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { RoundedButton } from '../../components/RoundedButton';

const COLORS = {
  primary: '#B90F0F',
  black: '#000',
  white: '#FFF',
  gray: '#666',
  border: '#CBD5E1',
};

const condiciones = [
  'ASTIGMATISMO',
  'MIOPIA',
  'DALTONISMO',
  'BAJA VISION',
];

interface FormulaItem {
  id: number;
  fecha: string;
  descripcion: string;
  condicion: string;
  imagen: string;
  estado: 'Pendiente' | 'Aprobado' | 'Rechazado';
  costo: number;
}

export default function FormulaScreen() {
  const hoy = new Date().toISOString().split('T')[0];

  const [fecha, setFecha] = useState(hoy);
  const [descripcion, setDescripcion] = useState('');
  const [condicion, setCondicion] = useState('');
  const [imagen, setImagen] = useState<string | null>(null);
  const [dropdown, setDropdown] = useState(false);

  const [formulas, setFormulas] = useState<FormulaItem[]>([]);

  const seleccionarImagen = async () => {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permiso.granted) {
      Alert.alert('Permiso requerido', 'Debes permitir acceso a la galería.');
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsEditing: true,
    });

    if (!resultado.canceled) {
      setImagen(resultado.assets[0].uri);
    }
  };

  const subirFormula = () => {
    if (!descripcion || !condicion || !imagen) {
      Alert.alert('Campos incompletos', 'Completa todos los campos.');
      return;
    }

    const nueva: FormulaItem = {
      id: Date.now(),
      fecha,
      descripcion,
      condicion,
      imagen,
      estado: 'Pendiente',
      costo: 0,
    };

    setFormulas([nueva, ...formulas]);

    setDescripcion('');
    setCondicion('');
    setImagen(null);

    Alert.alert('Éxito', 'Fórmula enviada correctamente.');
  };

  const eliminarFormula = (id: number) => {
    setFormulas(formulas.filter(f => f.id !== id));
  };

  const estadoColor = (estado: string) => {
    switch (estado) {
      case 'Aprobado':
        return '#155724';
      case 'Rechazado':
        return '#721C24';
      default:
        return '#856404';
    }
  };

  const estadoFondo = (estado: string) => {
    switch (estado) {
      case 'Aprobado':
        return '#D4EDDA';
      case 'Rechazado':
        return '#F8D7DA';
      default:
        return '#FFF3CD';
    }
  };

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          <Text style={styles.title}>Gestión de Fórmula</Text>

          <Text style={styles.subtitle}>
            Sube tu fórmula óptica fácilmente
          </Text>

          <View style={styles.card}>

            <Text style={styles.label}>Fecha de creación</Text>

            <View style={styles.fakeInput}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.gray}/>
              <Text style={styles.fakeText}>{fecha}</Text>
            </View>

            <Text style={styles.label}>Descripción</Text>

            <TouchableOpacity
              style={styles.fakeInput}
              onPress={() => {
                Alert.prompt?.(
                  'Descripción',
                  '',
                  text => text && setDescripcion(text),
                  'plain-text',
                  descripcion
                );
              }}
            >
              <Ionicons name="document-text-outline" size={18} color={COLORS.gray}/>
              <Text style={styles.fakeText}>
                {descripcion || 'Ej: Fórmula reciente'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.label}>¿Cuál es tu condición?</Text>

            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownHeader}
                onPress={() => setDropdown(!dropdown)}
              >
                <Text style={styles.dropdownText}>
                  {condicion || 'Seleccionar condición'}
                </Text>

                <Ionicons
                  name={dropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color="#333"
                />
              </TouchableOpacity>

              {dropdown &&
                condiciones.map(item => (
                  <TouchableOpacity
                    key={item}
                    style={styles.option}
                    onPress={() => {
                      setCondicion(item);
                      setDropdown(false);
                    }}
                  >
                    <Text>{item}</Text>
                  </TouchableOpacity>
                ))}
            </View>

            <Text style={styles.label}>Imagen de la fórmula</Text>

            <TouchableOpacity
              style={styles.imageButton}
              onPress={seleccionarImagen}
            >
              <Ionicons name="cloud-upload-outline" size={28} color={COLORS.primary}/>
              <Text style={styles.imageButtonText}>Seleccionar imagen</Text>
            </TouchableOpacity>

            {imagen && (
              <Image source={{ uri: imagen }} style={styles.preview}/>
            )}

            <RoundedButton
              text="SUBIR FÓRMULA"
              onPress={subirFormula}
            />
          </View>

          <Text style={styles.sectionTitle}>Mis Fórmulas</Text>

          {formulas.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="document-outline" size={70} color="#CCC"/>
              <Text style={styles.emptyText}>Aún no has subido fórmulas.</Text>
            </View>
          ) : (
            formulas.map(item => (
              <View key={item.id} style={styles.formulaCard}>

                <Image
                  source={{ uri: item.imagen }}
                  style={styles.cardImage}
                />

                <View style={styles.cardBody}>

                  <View style={styles.row}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.primary}/>
                    <Text style={styles.small}>{item.fecha}</Text>
                  </View>

                  <Text style={styles.cardTitle}>
                    {item.descripcion}
                  </Text>

                  <View style={styles.row}>
                    <Ionicons name="eye-outline" size={16} color={COLORS.primary}/>
                    <Text style={styles.small}>{item.condicion}</Text>
                  </View>

                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: estadoFondo(item.estado) },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: estadoColor(item.estado) },
                      ]}
                    >
                      {item.estado}
                    </Text>
                  </View>

                  <Text style={styles.price}>
                    {item.estado === 'Aprobado'
                      ? `$${item.costo}`
                      : 'En revisión'}
                  </Text>

                  <TouchableOpacity
                    style={styles.delete}
                    onPress={() => eliminarFormula(item.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#666"/>
                    <Text style={{ color: '#666' }}>Eliminar</Text>
                  </TouchableOpacity>

                </View>
              </View>
            ))
          )}
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:'#FFF'
  },

  content:{
    padding:20
  },

  title:{
    fontSize:32,
    fontWeight:'bold',
    textAlign:'center',
    marginTop:15
  },

  subtitle:{
    textAlign:'center',
    color:'#666',
    marginTop:8,
    marginBottom:20,
    fontSize:16
  },

  card:{
    backgroundColor:'#FFF',
    borderRadius:16,
    padding:22,
    shadowColor:'#000',
    shadowOpacity:.1,
    shadowRadius:8,
    elevation:5
  },

  label:{
    marginTop:15,
    marginBottom:8,
    fontWeight:'600'
  },

  fakeInput:{
    borderWidth:1,
    borderColor:'#CBD5E1',
    borderRadius:10,
    padding:14,
    flexDirection:'row',
    alignItems:'center',
    gap:10
  },

  fakeText:{
    color:'#444'
  },

  dropdown:{
    borderWidth:1,
    borderColor:'#CBD5E1',
    borderRadius:10,
    overflow:'hidden'
  },

  dropdownHeader:{
    padding:14,
    flexDirection:'row',
    justifyContent:'space-between',
    alignItems:'center'
  },

  dropdownText:{
    color:'#333'
  },

  option:{
    padding:14,
    borderTopWidth:1,
    borderTopColor:'#EEE'
  },

  imageButton:{
    borderWidth:1,
    borderStyle:'dashed',
    borderColor:'#CBD5E1',
    borderRadius:10,
    padding:25,
    alignItems:'center'
  },

  imageButtonText:{
    marginTop:8,
    color:'#666'
  },

  preview:{
    width:'100%',
    height:200,
    borderRadius:10,
    marginVertical:15
  },

  sectionTitle:{
    fontSize:24,
    fontWeight:'bold',
    textAlign:'center',
    marginVertical:25
  },

  empty:{
    alignItems:'center',
    paddingVertical:40
  },

  emptyText:{
    marginTop:12,
    color:'#999'
  },

  formulaCard:{
    backgroundColor:'#FFF',
    borderRadius:16,
    marginBottom:20,
    overflow:'hidden',
    elevation:4,
    shadowColor:'#000',
    shadowOpacity:.1,
    shadowRadius:8
  },

  cardImage:{
    width:'100%',
    height:180
  },

  cardBody:{
    padding:16
  },

  row:{
    flexDirection:'row',
    alignItems:'center',
    gap:8,
    marginBottom:8
  },

  small:{
    color:'#666'
  },

  cardTitle:{
    fontSize:18,
    fontWeight:'bold',
    marginBottom:10
  },

  badge:{
    alignSelf:'flex-start',
    paddingHorizontal:12,
    paddingVertical:6,
    borderRadius:20,
    marginVertical:8
  },

  badgeText:{
    fontWeight:'600'
  },

  price:{
    color:'#B90F0F',
    fontWeight:'bold',
    fontSize:18,
    marginTop:8
  },

  delete:{
    marginTop:15,
    flexDirection:'row',
    alignItems:'center',
    justifyContent:'center',
    gap:6,
    padding:12,
    backgroundColor:'#F2F2F2',
    borderRadius:10
  }

});