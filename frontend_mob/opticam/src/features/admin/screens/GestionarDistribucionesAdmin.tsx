// src/features/admin/screens/GestionarDistribucionesAdmin.tsx

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../../../shared/constants/colors';
import { DistribucionController } from '../../../core/controllers/DistribucionController';
import { DistribucionModel } from '../../../core/models/DistribucionModel';

interface Props {
  navigation: any;
}

export const GestionarDistribucionesAdmin = ({ navigation }: Props) => {
  const distribucionController = new DistribucionController();

  const [distribuciones, setDistribuciones] = useState<DistribucionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('TODOS');

  const ESTADOS_FILTRO = [
    { label: 'Todos', value: 'TODOS' },
    { label: 'Pendiente', value: 'PENDIENTE' },
    { label: 'En entrega', value: 'EN_ENTREGA' },
    { label: 'Entregado', value: 'ENTREGADO' },
  ];

  const cargarDistribuciones = useCallback(async () => {
    try {
      setError(null);
      const data = await distribucionController.getTodasDistribuciones();

      if (!data || !data.success) {
        setDistribuciones([]);
        return;
      }

      const distribucionesData = data.data || [];
      setDistribuciones(distribucionesData);
    } catch (err: any) {
      console.error('Error cargando distribuciones:', err);
      setError(err?.message || 'No fue posible cargar las distribuciones');
      setDistribuciones([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      cargarDistribuciones();
    }, [cargarDistribuciones])
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarDistribuciones();
  };

  const distribucionesFiltradas = distribuciones.filter((item) => {
    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase().trim();
      const cliente = item.pedido?.cliente?.nombre?.toLowerCase() || '';
      const ciudad = item.pedido?.ciudad_envio?.toLowerCase() || '';
      const repartidor = item.repartidor?.nombre?.toLowerCase() || '';
      const coincideBusqueda = cliente.includes(texto) || ciudad.includes(texto) || repartidor.includes(texto);
      if (!coincideBusqueda) return false;
    }

    if (filtroEstado !== 'TODOS') {
      return item.estado === filtroEstado;
    }

    return true;
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return '#D97706';
      case 'EN_ENTREGA': return '#2563EB';
      case 'ENTREGADO': return '#22C55E';
      case 'CANCELADO': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getEstadoBackground = (estado: string) => {
    const color = getEstadoColor(estado);
    return `${color}20`;
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'time-outline';
      case 'EN_ENTREGA': return 'bicycle-outline';
      case 'ENTREGADO': return 'checkmark-circle-outline';
      case 'CANCELADO': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'EN_ENTREGA': return 'En entrega';
      case 'ENTREGADO': return 'Entregado';
      case 'CANCELADO': return 'Cancelado';
      default: return estado;
    }
  };

  const formatearFecha = (fecha: string) => {
    if (!fecha) return 'Sin fecha';
    const date = new Date(fecha);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderDistribucion = ({ item }: { item: DistribucionModel }) => {
    const estado = item.estado || 'PENDIENTE';
    const estadoColor = getEstadoColor(estado);
    const estadoBackground = getEstadoBackground(estado);
    const estadoIcon = getEstadoIcon(estado);

    const clienteNombre = item.pedido?.cliente?.nombre || 'Sin cliente';
    const ciudad = item.pedido?.ciudad_envio || 'Sin ciudad';
    const repartidorNombre = item.repartidor?.nombre || 'No asignado';
    const vehiculo = item.repartidor?.vehiculo || 'N/A';

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <View style={styles.idContainer}>
            <View style={styles.iconoDistribucion}>
                    <Ionicons name="cube-outline" size={25} color={COLORS.primary} />
                  </View>
              <Text style={[styles.idLabel, { fontWeight: '700' }]}>Distribución</Text>
              <Text style={[styles.idValue, { fontWeight: '700' }]}>#{item.id_distribucion}</Text>
            </View>
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: estadoBackground }]}>
            <Ionicons name={estadoIcon} size={14} color={estadoColor} />
            <Text style={[styles.estadoText, { color: estadoColor }]}>
              {getEstadoTexto(estado)}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={18} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Cliente</Text>
            <Text style={styles.infoValue}>{clienteNombre}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Ciudad de envío</Text>
            <Text style={styles.infoValue}>{ciudad}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="bicycle-outline" size={18} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Repartidor</Text>
            <Text style={styles.infoValue}>{repartidorNombre}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="car-outline" size={18} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Vehículo</Text>
            <Text style={styles.infoValue}>{vehiculo}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color="#666" />
          <View style={styles.infoContent}>
            <Text style={styles.infoLabel}>Fecha asignación</Text>
            <Text style={styles.infoValue}>{formatearFecha(item.fecha_asignacion)}</Text>
          </View>
        </View>

        {item.observaciones && (
          <View style={styles.observacionesContainer}>
            <Text style={styles.observacionesLabel}>Observaciones</Text>
            <Text style={styles.observacionesText} numberOfLines={2}>
              {item.observaciones}
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando distribuciones...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={55} color="#EF4444" />
          <Text style={styles.errorTitle}>Ocurrió un error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={cargarDistribuciones}>
            <Ionicons name="refresh-outline" size={19} color="#FFFFFF" />
            <Text style={styles.retryText}>Intentar nuevamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>

      {/* BUSCADOR */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={19} color="#777" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por cliente, ciudad o repartidor..."
          placeholderTextColor="#999"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTROS POR ESTADO */}
      <View style={styles.filtrosContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.filtrosRow}>
            {ESTADOS_FILTRO.map((estado) => (
              <TouchableOpacity
                key={estado.value}
                style={[
                  styles.filtroButton,
                  filtroEstado === estado.value && styles.filtroButtonActive,
                ]}
                onPress={() => setFiltroEstado(estado.value)}
              >
                <Text
                  style={[
                    styles.filtroText,
                    filtroEstado === estado.value && styles.filtroTextActive,
                  ]}
                >
                  {estado.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

    {/* BOTÓN EXTERNAS  */}
        <View style={styles.botonExternasContainer}>
          <TouchableOpacity
            style={styles.externasButton}
            onPress={() => navigation.navigate('DistribucionesExternasAdmin')}
          >
            <Ionicons name="business-outline" size={18} color="#FFF" />
            <Text style={styles.externasButtonText}>Ver distribuciones externas</Text>
            <Ionicons name="chevron-forward" size={18} color="#FFF" />
          </TouchableOpacity>
        </View>

      {/* CONTADOR */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterText}>
          {distribucionesFiltradas.length}{' '}
          {distribucionesFiltradas.length === 1 ? 'distribución' : 'distribuciones'}
        </Text>
      </View>

      {/* LISTA */}
      <FlatList
        data={distribucionesFiltradas}
        keyExtractor={(item) => String(item.id_distribucion)}
        renderItem={renderDistribucion}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={60} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No hay distribuciones</Text>
            <Text style={styles.emptyText}>
              No se encontraron distribuciones registradas.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },

  searchContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    height: 44,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },

  filtrosContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 4,
  },

  filtrosRow: {
    flexDirection: 'row',
    gap: 8,
  },

  filtroButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    minWidth: 80,
    alignItems: 'center',
  },

  filtroButtonActive: {
    backgroundColor: COLORS.primary,
  },

  filtroText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },

  filtroTextActive: {
    color: '#FFFFFF',
  },

  botonExternasContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  externasButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    gap: 8,
  },

  externasButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },

  counterContainer: {
    paddingHorizontal: 16,
    paddingVertical: 6,
  },

  counterText: {
    color: '#777',
    fontSize: 12,
  },

  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

iconoDistribucion: {
  width: 35,
  height: 35,
  borderRadius: 17,
  backgroundColor: '#FDECEC',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 4,
},

  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  idLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  idValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },

  estadoText: {
    fontSize: 11,
    fontWeight: '600',
  },

  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 10,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 5,
    gap: 10,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 10,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginTop: 1,
  },

  observacionesContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },

  observacionesLabel: {
    fontSize: 10,
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },

  observacionesText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },

  loadingText: {
    color: '#777',
    fontSize: 14,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  errorTitle: {
    marginTop: 12,
    fontSize: 19,
    fontWeight: '700',
    color: '#333',
  },

  errorText: {
    marginTop: 7,
    textAlign: 'center',
    color: '#777',
    fontSize: 13,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 9,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 35,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '700',
    color: '#555',
  },

  emptyText: {
    marginTop: 5,
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    lineHeight: 17,
  },
});