import React, {
  useCallback,
  useMemo,
  useState,
} from 'react';

import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';

import { FormulaController } from '../../../core/controllers/FormulaController';

import {
  FormulaModel,
  EstadoFormula,
} from '../../../core/models/FormulaModel';

const formulaController = new FormulaController();

type FiltroEstado = 'TODAS' | EstadoFormula;

export default function GestionarFormulas() {
  const navigation = useNavigation<any>();

  const [formulas, setFormulas] = useState<FormulaModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] =
    useState<FiltroEstado>('TODAS');


  const cargarFormulas = useCallback(async () => {
    try {
      setError(null);

      const data = await formulaController.getTodasLasFormulas();

      if (!Array.isArray(data)) {
        setFormulas([]);
        return;
      }

      setFormulas(data);
    } catch (err: any) {
      console.error('Error cargando fórmulas:', err);

      setError(
        err?.message ||
        'No fue posible cargar las fórmulas'
      );

      setFormulas([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      cargarFormulas();
    }, [cargarFormulas])
  );


  const onRefresh = () => {
    setRefreshing(true);
    cargarFormulas();
  };


  const formulasFiltradas = useMemo(() => {
    let resultado = [...formulas];

    if (filtroEstado !== 'TODAS') {
      resultado = resultado.filter(
        formula =>
          formula.estado === filtroEstado
      );
    }

    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase().trim();

      resultado = resultado.filter(
        formula => {
          return (
            String(formula.id_formula).includes(texto) ||
            String(formula.id_usuario).includes(texto) ||
            formula.condicion?.toLowerCase().includes(texto) ||
            formula.nombre_completo?.toLowerCase().includes(texto) ||
            formula.email?.toLowerCase().includes(texto) ||
            formula.telefono?.toLowerCase().includes(texto)
          );
        }
      );
    }

    return resultado;
  }, [formulas, busqueda, filtroEstado]);


  const totalFormulas = formulas.length;

  const pendientes = formulas.filter(
    formula =>
      formula.estado === 'Pendiente'
  ).length;

  const aprobadas = formulas.filter(
    formula =>
      formula.estado === 'Aprobado'
  ).length;

  const rechazadas = formulas.filter(
    formula =>
      formula.estado === 'Rechazado'
  ).length;

  const abrirFormula = (formula: FormulaModel) => {
    navigation.navigate(
      'DetalleFormula',
      {
        id_formula: formula.id_formula,
      }
    );
  };


  const getEstadoColor = (estado: EstadoFormula) => {
    switch (estado) {
      case 'Aprobado':
        return '#16A34A';
      case 'Rechazado':
        return '#DC2626';
      default:
        return '#D97706';
    }
  };


  const getEstadoBackground = (estado: EstadoFormula) => {
    switch (estado) {
      case 'Aprobado':
        return '#DCFCE7';
      case 'Rechazado':
        return '#FEE2E2';
      default:
        return '#FEF3C7';
    }
  };


  const getEstadoIcon = (estado: EstadoFormula):
    | 'time-outline'
    | 'checkmark-circle-outline'
    | 'close-circle-outline' => {
    switch (estado) {
      case 'Aprobado':
        return 'checkmark-circle-outline';
      case 'Rechazado':
        return 'close-circle-outline';
      default:
        return 'time-outline';
    }
  };


  const renderFormula = ({ item }: { item: FormulaModel }) => {
    const estado = item.estado || 'Pendiente';
    const estadoColor = getEstadoColor(estado);
    const estadoBackground = getEstadoBackground(estado);
    const estadoIcon = getEstadoIcon(estado);

    // Función para rechazar fórmula
    const rechazarFormula = async () => {
      try {
        const resultado = await formulaController.actualizarEstadoFormula(
          item.id_formula,
          'Rechazado'
        );

        if (resultado.success) {
          console.log('Fórmula rechazada correctamente');
          cargarFormulas();
        } else {
          console.error('Error al rechazar:', resultado.message);
          Alert.alert('Error', resultado.message || 'No se pudo rechazar la fórmula');
        }
      } catch (error) {
        console.error('Error al rechazar fórmula:', error);
        Alert.alert('Error', 'Ocurrió un error al rechazar la fórmula');
      }
    };

    const mostrarMenuOpciones = () => {
      if (estado === 'Rechazado' || estado === 'Aprobado') {
        Alert.alert('Información', 'Esta fórmula ya ha sido procesada');
        return;
      }

      Alert.alert(
        'Opciones de Fórmula',
        `¿Qué deseas hacer con la fórmula #${item.id_formula}?`,
        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },
          {
            text: 'Rechazar Fórmula',
            style: 'destructive',
            onPress: () => {
              Alert.alert(
                'Confirmar Rechazo',
                `¿Estás seguro de que deseas rechazar la fórmula #${item.id_formula}?`,
                [
                  {
                    text: 'Cancelar',
                    style: 'cancel',
                  },
                  {
                    text: 'Sí, Rechazar',
                    style: 'destructive',
                    onPress: rechazarFormula,
                  },
                ]
              );
            },
          },
        ]
      );
    };

    return (
      <TouchableOpacity
        style={styles.formulaCard}
        activeOpacity={0.85}
        onPress={() => abrirFormula(item)}
      >
        {/* CABECERA DE LA TARJETA */}
        <View style={styles.cardHeader}>
          <View style={styles.formulaTitleContainer}>
            <View style={styles.formulaIcon}>
              <Ionicons
                name="document-text-outline"
                size={18}
                color="#B90F0F"
              />
            </View>

            <View style={styles.formulaTitle}>
              <Text style={styles.formulaId}>
                Fórmula #{item.id_formula}
              </Text>

              <Text
                style={styles.formulaCondition}
                numberOfLines={1}
              >
                {item.condicion || 'Sin condición'}
              </Text>
            </View>
          </View>

          {/* ESTADO DE LA FÓRMULA */}
          <View
            style={[
              styles.estadoBadge,
              { backgroundColor: estadoBackground },
            ]}
          >
            <Ionicons
              name={estadoIcon}
              size={15}
              color={estadoColor}
            />

            <Text
              style={[
                styles.estadoText,
                { color: estadoColor },
              ]}
            >
              {estado}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={mostrarMenuOpciones}
          >
            <Ionicons
              name="ellipsis-vertical"
              size={18}
              color={estado === 'Pendiente' ? '#555' : '#CCCCCC'}
            />
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* CLIENTE */}
        <View style={styles.clienteSection}>
          <View style={styles.clienteHeader}>
            <Ionicons
              name="person-circle-outline"
              size={18}
              color="#B90F0F"
            />

            <Text style={styles.clienteTitle}>
              Cliente
            </Text>
          </View>

          <View style={styles.clienteInfo}>
            {/* NOMBRE */}
            <View style={styles.infoRow}>
              <Ionicons
                name="person-outline"
                size={14}
                color="#777"
              />

              <Text
                style={styles.infoText}
                numberOfLines={1}
              >
                {item.nombre_completo || 'Sin nombre'}
              </Text>
            </View>

            {/* EMAIL */}
            <View style={styles.infoRow}>
              <Ionicons
                name="mail-outline"
                size={14}
                color="#777"
              />

              <Text
                style={styles.infoText}
                numberOfLines={1}
              >
                {item.email || 'Sin email'}
              </Text>
            </View>

            {/* TELÉFONO */}
            <View style={styles.infoRow}>
              <Ionicons
                name="call-outline"
                size={14}
                color="#777"
              />

              <Text
                style={styles.infoText}
                numberOfLines={1}
              >
                {item.telefono || 'Sin teléfono'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        {/* INFORMACIÓN INFERIOR */}
        <View style={styles.bottomInfo}>
          <View style={styles.bottomItem}>
            <Ionicons
              name="calendar-outline"
              size={14}
              color="#777"
            />

            <Text style={styles.bottomText}>
              {item.fecha_creacion
                ? new Date(item.fecha_creacion).toLocaleDateString('es-CO')
                : 'Sin fecha'}
            </Text>
          </View>

          <View style={styles.bottomItem}>
            <Ionicons
              name="cash-outline"
              size={14}
              color="#B90F0F"
            />

            <Text style={styles.costo}>
              {item.costoFormateado}
            </Text>
          </View>

          <View style={styles.detalleContainer}>
            <Text style={styles.detalleText}>
              Ver
            </Text>

            <Ionicons
              name="chevron-forward"
              size={16}
              color="#B90F0F"
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };


  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator
            size="large"
            color="#B90F0F"
          />

          <Text style={styles.loadingText}>
            Cargando fórmulas...
          </Text>
        </View>
      </SafeAreaView>
    );
  }


  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={55}
            color="#EF4444"
          />

          <Text style={styles.errorTitle}>
            Ocurrió un error
          </Text>

          <Text style={styles.errorText}>
            {error}
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              cargarFormulas();
            }}
          >
            <Ionicons
              name="refresh-outline"
              size={19}
              color="#FFFFFF"
            />

            <Text style={styles.retryText}>
              Intentar nuevamente
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }


  return (
    <SafeAreaView style={styles.container}>

      {/* ESTADÍSTICAS */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Ionicons
            name="document-text-outline"
            size={19}
            color="#B90F0F"
          />

          <Text style={styles.statNumber}>
            {totalFormulas}
          </Text>

          <Text style={styles.statLabel}>
            Total
          </Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons
            name="time-outline"
            size={19}
            color="#F59E0B"
          />

          <Text style={styles.statNumber}>
            {pendientes}
          </Text>

          <Text style={styles.statLabel}>
            Pendientes
          </Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons
            name="checkmark-circle-outline"
            size={19}
            color="#22C55E"
          />

          <Text style={styles.statNumber}>
            {aprobadas}
          </Text>

          <Text style={styles.statLabel}>
            Aprobadas
          </Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons
            name="close-circle-outline"
            size={19}
            color="#EF4444"
          />

          <Text style={styles.statNumber}>
            {rechazadas}
          </Text>

          <Text style={styles.statLabel}>
            Rechazadas
          </Text>
        </View>
      </View>

      {/* BUSCADOR */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={19}
          color="#777"
        />

        <TextInput
          style={styles.searchInput}
          placeholder="Buscar fórmula o cliente..."
          placeholderTextColor="#999"
          value={busqueda}
          onChangeText={setBusqueda}
        />

        {busqueda.length > 0 && (
          <TouchableOpacity
            onPress={() => setBusqueda('')}
          >
            <Ionicons
              name="close-circle"
              size={18}
              color="#999"
            />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTROS */}
      <View style={styles.filtersContainer}>
        {(
          [
            ['TODAS', 'Todas'],
            ['Pendiente', 'Pendientes'],
            ['Aprobado', 'Aprobadas'],
            ['Rechazado', 'Rechazadas'],
          ] as [FiltroEstado, string][]
        ).map(([valor, texto]) => (
          <TouchableOpacity
            key={valor}
            style={[
              styles.filterButton,
              filtroEstado === valor && styles.filterButtonActive,
            ]}
            onPress={() => setFiltroEstado(valor)}
          >
            <Text
              style={[
                styles.filterText,
                filtroEstado === valor && styles.filterTextActive,
              ]}
            >
              {texto}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* CONTADOR */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {formulasFiltradas.length}{' '}
          {formulasFiltradas.length === 1
            ? 'fórmula encontrada'
            : 'fórmulas encontradas'}
        </Text>
      </View>

      {/* LISTA */}
      <FlatList
        data={formulasFiltradas}
        keyExtractor={item => String(item.id_formula)}
        renderItem={renderFormula}
        contentContainerStyle={
          formulasFiltradas.length === 0
            ? styles.emptyList
            : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#B90F0F']}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="document-text-outline"
              size={60}
              color="#CCCCCC"
            />

            <Text style={styles.emptyTitle}>
              No hay fórmulas
            </Text>

            <Text style={styles.emptyText}>
              No se encontraron fórmulas
              con los filtros seleccionados.
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },

  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 5,
    gap: 6,
  },

  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 8,
    elevation: 1,
  },

  statNumber: {
    fontSize: 17,
    fontWeight: '700',
    color: '#333',
    marginTop: 2,
  },

  statLabel: {
    fontSize: 9,
    color: '#777',
    marginTop: 1,
  },

  searchContainer: {
    marginHorizontal: 14,
    marginTop: 7,
    height: 43,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 1,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },

  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingTop: 9,
    gap: 5,
  },

  filterButton: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: '#E8E8E8',
    alignItems: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#B90F0F',
  },

  filterText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '600',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  resultsText: {
    color: '#777',
    fontSize: 12,
  },

  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 25,
  },

  emptyList: {
    flexGrow: 1,
  },

  formulaCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 9,
    overflow: 'hidden',
    elevation: 2,
  },

  cardHeader: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  formulaTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  formulaIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#FDECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  formulaTitle: {
    flex: 1,
  },

  formulaId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },

  formulaCondition: {
    fontSize: 11,
    color: '#777',
    marginTop: 2,
  },

  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 5,
  },

  estadoText: {
    fontSize: 10,
    fontWeight: '700',
  },

  menuButton: {
    padding: 4,
    marginLeft: 4,
    borderRadius: 15,
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },

  clienteSection: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  clienteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },

  clienteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444',
  },

  clienteInfo: {
    gap: 4,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  infoText: {
    flex: 1,
    fontSize: 11,
    color: '#666',
  },

  bottomInfo: {
    minHeight: 36,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  bottomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  bottomText: {
    fontSize: 10,
    color: '#777',
  },

  costo: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B90F0F',
  },

  detalleContainer: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },

  detalleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#B90F0F',
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
    backgroundColor: '#B90F0F',
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