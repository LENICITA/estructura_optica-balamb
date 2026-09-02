// src/features/client/screens/CrearPedidoCliente.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../../shared/constants/colors';
import { useAuth } from '../../auth/context/AuthContext';
import { PedidoController } from '../../../core/controllers/PedidoController';
import { FormulaController } from '../../../core/controllers/FormulaController';
import { FormulaModel } from '../../../core/models/FormulaModel';

interface CarritoItem {
  id: number;
  id_producto: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
  color?: string;
  material?: string;
  seleccionado: boolean;
}

interface Props {
  navigation: any;
  route: any;
}

export const CrearPedidoCliente = ({ navigation, route }: Props) => {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');

  const [productos, setProductos] = useState<CarritoItem[]>([]);
  const [formulas, setFormulas] = useState<FormulaModel[]>([]);
  const [formulaSeleccionada, setFormulaSeleccionada] = useState<number | null>(null);
  const [mostrarSelectorFormula, setMostrarSelectorFormula] = useState(false);

  const [subtotal, setSubtotal] = useState(0);
  const [costoEnvio, setCostoEnvio] = useState(0);
  const [costoFormula, setCostoFormula] = useState(0);
  const [total, setTotal] = useState(0);
  const [fechaEstimada, setFechaEstimada] = useState('');

  const pedidoController = new PedidoController();
  const formulaController = new FormulaController();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Obtener productos seleccionados
      const carritoGuardado = await AsyncStorage.getItem('carrito_seleccionado');
      const productosData = carritoGuardado ? JSON.parse(carritoGuardado) : [];

      if (productosData.length === 0) {
        Alert.alert('Error', 'No hay productos seleccionados');
        navigation.goBack();
        return;
      }

      setProductos(productosData);
      calcularSubtotal(productosData);

      // Obtener fórmulas aprobadas del usuario
      if (user?.id_usuario) {
        console.log(' ID del usuario:', user.id_usuario);
        const formulasData = await formulaController.getFormulasByUsuario(user.id_usuario);
        console.log(' Fórmulas recibidas:', formulasData.length);
        const formulasAprobadas = formulasData.filter(f => f.estado === 'Aprobado');
        console.log(' Fórmulas aprobadas:', formulasAprobadas.length);
        setFormulas(formulasAprobadas);
      }

      // Calcular fecha estimada (8-10 días hábiles)
      const fecha = new Date();
      const dias = 8 + Math.floor(Math.random() * 3);
      fecha.setDate(fecha.getDate() + dias);
      setFechaEstimada(fecha.toLocaleDateString('es-CO', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }));

    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const calcularSubtotal = (items: CarritoItem[]) => {
    const total = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    setSubtotal(total);
    calcularTotal(total);
  };

  const calcularTotal = (subtotalActual?: number) => {
    const sub = subtotalActual !== undefined ? subtotalActual : subtotal;
    const envio = calcularCostoEnvio(ciudad);
    const formulaCost = formulaSeleccionada
      ? formulas.find(f => f.id_formula === formulaSeleccionada)?.costo || 0
      : 0;

    setCostoEnvio(envio);
    setCostoFormula(formulaCost);
    setTotal(sub + envio + formulaCost);
  };

  const calcularCostoEnvio = (ciudad: string) => {
    const ciudadLower = ciudad.toLowerCase().trim();
    if (ciudadLower === 'bogotá' || ciudadLower === 'bogota') {
      return 0;
    }
    return 10000;
  };

  const handleCiudadChange = (text: string) => {
    setCiudad(text);
    const envio = calcularCostoEnvio(text);
    setCostoEnvio(envio);
    setTotal(subtotal + envio + costoFormula);
  };

  const seleccionarFormula = (id: number | null) => {
    setFormulaSeleccionada(id);
    setMostrarSelectorFormula(false);
    const formulaCost = id ? formulas.find(f => f.id_formula === id)?.costo || 0 : 0;
    setCostoFormula(formulaCost);
    setTotal(subtotal + costoEnvio + formulaCost);
  };

  const confirmarPedido = async () => {
    if (!direccion.trim()) {
      Alert.alert('Error', 'Ingresa la dirección de entrega');
      return;
    }

    if (!ciudad.trim()) {
      Alert.alert('Error', 'Ingresa la ciudad de envío');
      return;
    }

    setEnviando(true);

    try {
      const data = {
        direccion_entrega: direccion.trim(),
        ciudad_envio: ciudad.trim(),
        id_formula: formulaSeleccionada || undefined,
        productos: productos.map(item => ({
          id_producto: item.id_producto,
          cantidad: item.cantidad,
        })),
      };

      const result = await pedidoController.crearPedido(data);

      if (result.success) {
        // Limpiar carrito
        await AsyncStorage.removeItem('@carrito');
        await AsyncStorage.removeItem('carrito_seleccionado');

        Alert.alert(
          ' Pedido creado',
          'Tu pedido ha sido creado exitosamente. Puedes pagarlo ahora o después.',
          [
            {
              text: 'Ver mis pedidos',
              onPress: () => navigation.navigate('MisPedidosCliente' as never),
            },
            {
              text: 'Ir a pagar',
              onPress: () => navigation.navigate('PagosCliente' as never, { id_pedido: result.data?.id_pedido }),
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message || 'Error al crear el pedido');
      }
    } catch (error: any) {
      console.error('Error creando pedido:', error);
      Alert.alert('Error', error.message || 'Error al crear el pedido');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-outline" size={22} color={COLORS.primary} />
        <Text style={styles.backText}>Volver al carrito</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Crear pedido</Text>

      {/* DATOS DEL USUARIO */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Datos del cliente</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Nombre:</Text>
          <Text style={styles.infoValue}>{user?.nombre_completo || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user?.email || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Teléfono:</Text>
          <Text style={styles.infoValue}>{user?.telefono || 'N/A'}</Text>
        </View>
        <Text style={styles.notaEditable}>
          * Estos datos no son editables
        </Text>
      </View>

      {/* DIRECCIÓN Y CIUDAD */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Dirección de entrega</Text>

        <Text style={styles.label}>Dirección *</Text>
        <TextInput
          style={styles.input}
          placeholder="Calle, número, barrio..."
          placeholderTextColor="#999"
          value={direccion}
          onChangeText={setDireccion}
        />

        <Text style={styles.label}>Ciudad de envío *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Bogotá, Medellín..."
          placeholderTextColor="#999"
          value={ciudad}
          onChangeText={handleCiudadChange}
        />
      </View>

      {/* FÓRMULA */}
      {formulas.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Fórmula óptica</Text>

          {formulaSeleccionada ? (
            <View style={styles.formulaSelected}>
              <Text style={styles.formulaSelectedText}>
                {formulas.find(f => f.id_formula === formulaSeleccionada)?.condicion || 'Fórmula'}
              </Text>
              <TouchableOpacity onPress={() => setMostrarSelectorFormula(true)}>
                <Text style={styles.cambiarFormulaText}>Cambiar</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.selectFormulaButton}
              onPress={() => setMostrarSelectorFormula(true)}
            >
              <Text style={styles.selectFormulaText}>Seleccionar fórmula</Text>
              <Ionicons name="chevron-down" size={20} color={COLORS.primary} />
            </TouchableOpacity>
          )}

          {mostrarSelectorFormula && (
            <View style={styles.formulaList}>
              <TouchableOpacity
                style={[styles.formulaItem, !formulaSeleccionada && styles.formulaItemActive]}
                onPress={() => seleccionarFormula(null)}
              >
                <Text style={[styles.formulaItemText, !formulaSeleccionada && styles.formulaItemTextActive]}>
                  Ninguna
                </Text>
                {!formulaSeleccionada && <Ionicons name="checkmark" size={18} color={COLORS.primary} />}
              </TouchableOpacity>

              {formulas.map((f) => (
                <TouchableOpacity
                  key={f.id_formula}
                  style={[
                    styles.formulaItem,
                    formulaSeleccionada === f.id_formula && styles.formulaItemActive,
                  ]}
                  onPress={() => seleccionarFormula(f.id_formula)}
                >
                  <View>
                    <Text style={[
                      styles.formulaItemText,
                      formulaSeleccionada === f.id_formula && styles.formulaItemTextActive,
                    ]}>
                      {f.condicion}
                    </Text>
                    <Text style={styles.formulaItemSub}>
                      {f.costo > 0 ? `+ $${f.costo.toLocaleString()}` : 'Sin costo'}
                    </Text>
                  </View>
                  {formulaSeleccionada === f.id_formula && (
                    <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* RESUMEN DEL PEDIDO */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumen del pedido</Text>

        {productos.map((item) => (
          <View key={item.id} style={styles.productResumen}>
            <Text style={styles.productResumenName}>
              {item.nombre} x{item.cantidad}
            </Text>
            <Text style={styles.productResumenPrice}>
              ${(item.precio * item.cantidad).toLocaleString()}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.resumenRow}>
          <Text style={styles.resumenLabel}>Subtotal</Text>
          <Text style={styles.resumenValue}>${subtotal.toLocaleString()}</Text>
        </View>

        {costoFormula > 0 && (
          <View style={styles.resumenRow}>
            <Text style={styles.resumenLabel}>+ Fórmula</Text>
            <Text style={styles.resumenValue}>${costoFormula.toLocaleString()}</Text>
          </View>
        )}

        <View style={styles.resumenRow}>
          <Text style={styles.resumenLabel}>+ Envío</Text>
          <Text style={styles.resumenValue}>
            {costoEnvio === 0 ? 'Gratis' : `$${costoEnvio.toLocaleString()}`}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={[styles.resumenRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${total.toLocaleString()}</Text>
        </View>

        <View style={styles.fechaEstimadaContainer}>
          <Ionicons name="calendar-outline" size={16} color="#666" />
          <Text style={styles.fechaEstimadaText}>
            Fecha estimada de entrega: {fechaEstimada}
          </Text>
        </View>
      </View>

      {/* BOTÓN CONFIRMAR */}
      <TouchableOpacity
        style={[styles.confirmButton, enviando && styles.confirmButtonDisabled]}
        onPress={confirmarPedido}
        disabled={enviando}
      >
        {enviando ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.confirmButtonText}>Confirmar pedido</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 16,
    marginLeft: 6,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 4,
  },
  infoLabel: {
    width: 80,
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    color: '#000',
    fontWeight: '500',
  },
  notaEditable: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
    marginTop: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  selectFormulaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  selectFormulaText: {
    fontSize: 14,
    color: '#666',
  },
  formulaSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
  },
  formulaSelectedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  cambiarFormulaText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  formulaList: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  formulaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  formulaItemActive: {
    backgroundColor: '#F0F8FF',
  },
  formulaItemText: {
    fontSize: 14,
    color: '#333',
  },
  formulaItemTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  formulaItemSub: {
    fontSize: 12,
    color: '#999',
  },
  productResumen: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  productResumenName: {
    fontSize: 14,
    color: '#333',
  },
  productResumenPrice: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 8,
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  resumenLabel: {
    fontSize: 14,
    color: '#666',
  },
  resumenValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  totalRow: {
    paddingVertical: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  fechaEstimadaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  fechaEstimadaText: {
    fontSize: 12,
    color: '#666',
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmButtonDisabled: {
    opacity: 0.6,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});