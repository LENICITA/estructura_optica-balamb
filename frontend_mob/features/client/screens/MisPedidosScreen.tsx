import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { PedidoController } from '../../core/controllers/PedidoController';
import { PedidoModel } from '../../core/models/PedidoModel';

const pedidoController = new PedidoController();

export default function MisPedidosScreen() {
  const [pedidos, setPedidos] = useState<PedidoModel[]>([]);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');

  const cargarPedidos = async () => {
    try {
      setError('');

      const resultado = await pedidoController.getMisPedidos();

      setPedidos(resultado);
    } catch (e) {
      console.error('Error al cargar pedidos:', e);
      setError('No se pudieron cargar tus pedidos.');
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarPedidos();
    }, [])
  );

  const actualizarLista = () => {
    setActualizando(true);
    cargarPedidos();
  };

  const renderPedido = ({ item }: { item: PedidoModel }) => {
    return (
      <View style={styles.card}>

        {/* ENCABEZADO DEL PEDIDO */}
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.pedidoNumero}>
              Pedido #{item.id_pedido}
            </Text>

            <Text style={styles.fecha}>
              {item.fechaFormateada}
            </Text>
          </View>

          {/* ESTADO */}
          <View
            style={[
              styles.estado,
              {
                backgroundColor: `${item.estadoColor}20`,
              },
            ]}
          >
            <View
              style={[
                styles.estadoPunto,
                {
                  backgroundColor: item.estadoColor,
                },
              ]}
            />

            <Text
              style={[
                styles.estadoTexto,
                {
                  color: item.estadoColor,
                },
              ]}
            >
              {item.estadoDisplay}
            </Text>
          </View>
        </View>

        {/* SEPARADOR */}
        <View style={styles.separador} />

        {/* INFORMACIÓN */}
        <View style={styles.informacion}>
          <View style={styles.fila}>
            <Text style={styles.label}>Productos</Text>

            <Text style={styles.valor}>
              {item.productos?.length || 0}
            </Text>
          </View>

          <View style={styles.fila}>
            <Text style={styles.label}>Ciudad</Text>

            <Text style={styles.valor}>
              {item.ciudad_envio || 'No especificada'}
            </Text>
          </View>

          <View style={styles.fila}>
            <Text style={styles.label}>Entrega estimada</Text>

            <Text style={styles.valor}>
              {item.fecha_estimada
                ? item.fechaEstimadaFormateada
                : 'Por definir'}
            </Text>
          </View>
        </View>

        {/* TOTAL */}
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>
            Total
          </Text>

          <Text style={styles.total}>
            {item.totalFormateado}
          </Text>
        </View>
      </View>
    );
  };

  /* =========================
     CARGANDO
  ========================= */

  if (cargando) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />

          <Text style={styles.loadingText}>
            Cargando tus pedidos...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  /* =========================
     PANTALLA
  ========================= */

  return (
    <SafeAreaView style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.titulo}>
          Mis pedidos
        </Text>

        <Text style={styles.subtitulo}>
          Historial de tus compras
        </Text>
      </View>

      {/* ERROR */}
      {error !== '' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTexto}>
            {error}
          </Text>

          <TouchableOpacity onPress={cargarPedidos}>
            <Text style={styles.reintentar}>
              Reintentar
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SIN PEDIDOS */}
      {!error && pedidos.length === 0 && (
        <View style={styles.vacio}>
          <Text style={styles.iconoVacio}>
            📦
          </Text>

          <Text style={styles.vacioTitulo}>
            No tienes pedidos
          </Text>

          <Text style={styles.vacioTexto}>
            Cuando realices una compra,
            aparecerá aquí tu historial de pedidos.
          </Text>
        </View>
      )}

      {/* LISTA DE PEDIDOS */}
      {pedidos.length > 0 && (
        <FlatList
          data={pedidos}
          keyExtractor={(item) =>
            item.id_pedido.toString()
          }
          renderItem={renderPedido}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={actualizando}
              onRefresh={actualizarLista}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

/* =========================
   ESTILOS
========================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  /* HEADER */

  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  titulo: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },

  subtitulo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  /* LISTA */

  lista: {
    padding: 16,
    paddingBottom: 30,
  },

  /* CARD */

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,

    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,

    elevation: 3,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  pedidoNumero: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  fecha: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 5,
  },

  /* ESTADO */

  estado: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    maxWidth: 160,
  },

  estadoPunto: {
    width: 8,
    height: 8,
    borderRadius: 8,
    marginRight: 6,
  },

  estadoTexto: {
    fontSize: 11,
    fontWeight: '700',
  },

  /* SEPARADOR */

  separador: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 14,
  },

  /* INFORMACIÓN */

  informacion: {
    gap: 9,
  },

  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  label: {
    fontSize: 13,
    color: '#6B7280',
  },

  valor: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    maxWidth: '55%',
    textAlign: 'right',
  },

  /* TOTAL */

  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    marginTop: 15,
    paddingTop: 13,

    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },

  totalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#374151',
  },

  total: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },

  /* LOADING */

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },

  /* ERROR */

  errorContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
  },

  errorTexto: {
    color: '#B91C1C',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },

  reintentar: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
  },

  /* SIN PEDIDOS */

  vacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  iconoVacio: {
    fontSize: 60,
    marginBottom: 15,
  },

  vacioTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },

  vacioTexto: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
  },
});
