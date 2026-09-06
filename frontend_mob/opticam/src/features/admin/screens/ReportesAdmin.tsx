// src/features/admin/screens/ReportesAdmin.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { COLORS } from '../../../shared/constants/colors';
import { ReporteController } from '../../../core/controllers/ReporteController';

export const ReportesAdmin = () => {
  const [tipo, setTipo] = useState<string>('ventas');
  const [periodo, setPeriodo] = useState<'diario' | 'semanal' | 'mensual' | 'anual' | 'personalizado'>('diario');
  const [fechaInicio, setFechaInicio] = useState(new Date());
  const [fechaFin, setFechaFin] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [mostrarFechaInicio, setMostrarFechaInicio] = useState(false);
  const [mostrarFechaFin, setMostrarFechaFin] = useState(false);

  const reporteController = new ReporteController();

  const tiposList = [
    { label: 'Ventas', value: 'ventas' },
    { label: 'Inventario', value: 'inventario' },
    { label: 'Repartidores', value: 'repartidores' },
    { label: 'Clientes', value: 'clientes' },
    { label: 'Productos Mas Vendidos', value: 'productos-mas-vendidos' },
    { label: 'Estado de Pedidos', value: 'estado-pedidos' },
    { label: 'Ventas por Categoria', value: 'ventas-categoria' },
  ];

  const periodosList = [
    { label: 'Diario', value: 'diario' },
    { label: 'Semanal', value: 'semanal' },
    { label: 'Mensual', value: 'mensual' },
    { label: 'Anual', value: 'anual' },
    { label: 'Personalizado', value: 'personalizado' },
  ];

  const mostrarFechas = periodo === 'personalizado';

  const formatearFecha = (fecha: Date): string => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const convertirBlobABase64 = async (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const guardarYCompartirPDF = async (blob: Blob, nombre: string) => {
    try {
      const base64 = await convertirBlobABase64(blob);
      const fileUri = `${FileSystem.documentDirectory}${nombre}`;
      
      await FileSystem.writeAsStringAsync(fileUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Preguntar si quiere abrir el PDF
      Alert.alert(
        'Exito',
        'Reporte generado correctamente',
        [
          {
            text: 'Abrir PDF',
            onPress: async () => {
              try {
                if (await Sharing.isAvailableAsync()) {
                  await Sharing.shareAsync(fileUri);
                } else {
                  Alert.alert('Error', 'No se puede compartir archivos en este dispositivo');
                }
              } catch (error) {
                console.error('Error al compartir:', error);
                Alert.alert('Error', 'No se pudo abrir el PDF');
              }
            },
          },
          { text: 'OK', style: 'cancel' },
        ]
      );
    } catch (error) {
      console.error('Error al guardar PDF:', error);
      Alert.alert('Error', 'No se pudo guardar el PDF');
    }
  };

  const generarReporte = async () => {
    try {
      setLoading(true);
      setError(null);

      if (periodo === 'personalizado') {
        if (!fechaInicio || !fechaFin) {
          setError('Selecciona ambas fechas para el periodo personalizado');
          setLoading(false);
          return;
        }
      }

      const datosReporte = {
        tipo: tipo,
        periodo: periodo,
        fecha_inicio: periodo === 'personalizado' ? formatearFecha(fechaInicio) : undefined,
        fecha_fin: periodo === 'personalizado' ? formatearFecha(fechaFin) : undefined,
      };

      console.log('Enviando datos:', datosReporte);

      const result = await reporteController.generarPDF(datosReporte);

      console.log('Resultado:', result);

      if (result && result.success && result.blob) {
        const nombrePDF = `Reporte_${tipo}_${new Date().toISOString().slice(0,10)}.pdf`;
        await guardarYCompartirPDF(result.blob, nombrePDF);
      } else {
        setError(result?.message || 'Error al generar el reporte');
      }
    } catch (err: any) {
      console.error('Error al generar reporte:', err);
      setError(err.message || 'Error al generar el reporte');
    } finally {
      setLoading(false);
    }
  };

  const onChangeFechaInicio = (event: any, selectedDate?: Date) => {
    setMostrarFechaInicio(false);
    if (selectedDate) {
      setFechaInicio(selectedDate);
    }
  };

  const onChangeFechaFin = (event: any, selectedDate?: Date) => {
    setMostrarFechaFin(false);
    if (selectedDate) {
      setFechaFin(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Generador de Reportes</Text>
        <View style={styles.headerBadge}>
          <Ionicons name="document-text-outline" size={16} color="#666" />
          <Text style={styles.headerBadgeText}>Los reportes se generan en PDF</Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Error</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Generar Nuevo Reporte</Text>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Tipo de Reporte</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tipo}
              onValueChange={(itemValue) => setTipo(itemValue)}
              enabled={!loading}
            >
              {tiposList.map((item) => (
                <Picker.Item key={item.value} label={item.label} value={item.value} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Periodo</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={periodo}
              onValueChange={(itemValue) => setPeriodo(itemValue)}
              enabled={!loading}
            >
              {periodosList.map((item) => (
                <Picker.Item key={item.value} label={item.label} value={item.value} />
              ))}
            </Picker>
          </View>
        </View>

        {mostrarFechas && (
          <View style={styles.fechasContainer}>
            <View style={styles.fechaField}>
              <Text style={styles.label}>Fecha Inicio</Text>
              <TouchableOpacity
                style={styles.fechaButton}
                onPress={() => setMostrarFechaInicio(true)}
                disabled={loading}
              >
                <Text style={styles.fechaText}>{formatearFecha(fechaInicio)}</Text>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              {mostrarFechaInicio && (
                <DateTimePicker
                  value={fechaInicio}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeFechaInicio}
                />
              )}
            </View>

            <View style={styles.fechaField}>
              <Text style={styles.label}>Fecha Fin</Text>
              <TouchableOpacity
                style={styles.fechaButton}
                onPress={() => setMostrarFechaFin(true)}
                disabled={loading}
              >
                <Text style={styles.fechaText}>{formatearFecha(fechaFin)}</Text>
                <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              {mostrarFechaFin && (
                <DateTimePicker
                  value={fechaFin}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onChangeFechaFin}
                />
              )}
            </View>
          </View>
        )}

        <TouchableOpacity
          style={[styles.generarButton, loading && styles.generarButtonDisabled]}
          onPress={generarReporte}
          disabled={loading}
        >
          {loading ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={styles.generarButtonText}>Generando reporte...</Text>
            </>
          ) : (
            <>
              <Ionicons name="document-text-outline" size={20} color="#fff" />
              <Text style={styles.generarButtonText}>Generar Reporte PDF</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.notaContainer}>
          <Ionicons name="information-circle-outline" size={16} color="#999" />
          <Text style={styles.notaText}>
            El reporte se abrira para que puedas descargarlo o imprimirlo
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  headerBadgeText: {
    fontSize: 12,
    color: '#666',
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorTitle: {
    fontWeight: '700',
    color: '#DC2626',
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    color: '#000',
    marginBottom: 16,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
    fontSize: 14,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  fechasContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  fechaField: {
    flex: 1,
  },
  fechaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
  },
  fechaText: {
    fontSize: 14,
    color: '#333',
  },
  generarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 8,
    gap: 10,
    marginTop: 8,
  },
  generarButtonDisabled: {
    opacity: 0.6,
  },
  generarButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  notaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    gap: 8,
  },
  notaText: {
    fontSize: 12,
    color: '#999',
    flex: 1,
  },
});