// src/features/delivery/screens/HistorialEntregas.tsx

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { DistribucionController } from '../../../core/controllers/DistribucionController';
import { DistribucionModel } from '../../../core/models/DistribucionModel';
import { COLORS } from '../../../shared/constants/colors';
import { useAuth } from '../../auth/context/AuthContext';

const distribucionController = new DistribucionController();

export default function HistorialEntregas() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();

  const [historial, setHistorial] = useState<DistribucionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarHistorial = useCallback(async () => {
    try {
      setLoading(true);

      const data = await distribucionController.getHistorial();

      // ✅ Solo ENTREGADO
      const filtrado = data.filter(item => item.estado === 'ENTREGADO');

      // 🔒 Filtro extra de seguridad por repartidor
      const esMio = (item: DistribucionModel) =>
        !user ||
        item.id_usuario === (user as any).id_usuario ||
        item.id_usuario === (user as any).id;

      setHistorial(filtrado.filter(esMio));
    } catch (error) {
      console.error('Error cargando historial:', error);
      setHistorial([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      cargarHistorial();
    }, [cargarHistorial])
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarHistorial();
  };

  // ============================================
  // LOADING
  // ============================================
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando historial...</Text>
      </View>
    );
  }

  // ============================================
  // ITEM
  // ============================================
  const renderItem = ({ item }: { item: DistribucionModel }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.statusBadge}>
          <Ionicons name="checkmark-circle" size={16} color="#22C55E" />
          <Text style={styles.statusText}>{item.estadoDisplay}</Text>
        </View>

        <Text style={styles.fechaEntrega}>
          {item.fechaEntregaFormateada}
        </Text>
      </View>

      <Text style={styles.pedidoText}>Pedido #{item.id_pedido}</Text>

      <View style={styles.infoRow}>
        <Ionicons
          name="location-outline"
          size={17}
          color={COLORS.primary}
        />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Dirección</Text>
          <Text style={styles.infoValue}>
            {item.pedido?.direccion_entrega || 'No especificada'}
          </Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons
          name="business-outline"
          size={17}
          color={COLORS.primary}
        />
        <View style={styles.infoContent}>
          <Text style={styles.infoLabel}>Ciudad</Text>
          <Text style={styles.infoValue}>
            {item.pedido?.ciudad_envio || 'No especificada'}
          </Text>
        </View>
      </View>

      {item.tieneObservacion && (
        <View style={styles.observationBox}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={15}
            color={COLORS.gray}
          />
          <View style={styles.observationContent}>
            <Text style={styles.observationLabel}>Observación</Text>
            <Text style={styles.observationText}>{item.observaciones}</Text>
          </View>
        </View>
      )}

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total del pedido</Text>
        <Text style={styles.totalValue}>{item.totalFormateado}</Text>
      </View>
    </View>
  );

  // ============================================
  // EMPTY
  // ============================================
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={60} color={COLORS.gray} />
      <Text style={styles.emptyTitle}>Sin entregas completadas</Text>
      <Text style={styles.emptyText}>
        Cuando completes tus entregas aparecerán aquí.
      </Text>
    </View>
  );

  // ============================================
  // RENDER
  // ============================================
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={23} color={COLORS.text} />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Historial de entregas</Text>
          <Text style={styles.headerSubtitle}>
            {historial.length}{' '}
            {historial.length === 1 ? 'entrega' : 'entregas'}
          </Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={historial}
        keyExtractor={item => `historial-${item.id_distribucion}`}
        renderItem={renderItem}
        contentContainerStyle={
          historial.length === 0 ? styles.listEmpty : styles.listContent
        }
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 60,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E7E7',
  },

  backButton: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerInfo: {
    flex: 1,
    marginLeft: 3,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },

  headerSubtitle: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 1,
  },

  headerRight: {
    width: 38,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.text,
  },

  listContent: {
    padding: 12,
  },

  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },

  statusText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
    marginLeft: 4,
  },

  fechaEntrega: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },

  pedidoText: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 10,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F3F3F3',
  },

  infoContent: {
    flex: 1,
    marginLeft: 9,
  },

  infoLabel: {
    fontSize: 10,
    color: COLORS.gray,
    marginBottom: 1,
  },

  infoValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },

  observationBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 9,
    marginTop: 8,
  },

  observationContent: {
    flex: 1,
    marginLeft: 7,
  },

  observationLabel: {
    fontSize: 10,
    color: COLORS.gray,
    marginBottom: 2,
  },

  observationText: {
    fontSize: 12,
    lineHeight: 16,
    color: COLORS.text,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },

  totalLabel: {
    fontSize: 13,
    color: COLORS.gray,
  },

  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.primary,
  },

  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 14,
  },

  emptyText: {
    fontSize: 13,
    color: COLORS.gray,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
  },
});