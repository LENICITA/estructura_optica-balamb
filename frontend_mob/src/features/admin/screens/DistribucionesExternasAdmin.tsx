import React, { useCallback, useState } from 'react';
import {
	ActivityIndicator,
	FlatList,
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { COLORS } from '../../../shared/constants/colors';
import { DistribucionController } from '../../../core/controllers/DistribucionController';

interface Props {
	navigation: any;
}

const DistribucionesExternasAdmin = ({ navigation }: Props) => {
	const controller = new DistribucionController();
	const [distribuciones, setDistribuciones] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const cargarDistribuciones = useCallback(async () => {
		try {
			setError('');
			setLoading(true);
			const response = await controller.getDistribucionesExternas();
			setDistribuciones(response?.data || []);
		} catch (err: any) {
			console.error('Error cargando distribuciones externas:', err);
			setError('No fue posible cargar las distribuciones externas.');
		} finally {
			setLoading(false);
		}
	}, []);

	useFocusEffect(
		useCallback(() => {
			cargarDistribuciones();
		}, [cargarDistribuciones])
	);

	if (loading) {
		return (
			<SafeAreaView style={styles.center}>
				<ActivityIndicator size="large" color={COLORS.primary} />
				<Text style={styles.muted}>Cargando distribuciones externas...</Text>
			</SafeAreaView>
		);
	}

	if (error) {
		return (
			<SafeAreaView style={styles.center}>
				<Ionicons name="alert-circle-outline" size={48} color="#D33" />
				<Text style={styles.error}>{error}</Text>
				<TouchableOpacity style={styles.primaryButton} onPress={cargarDistribuciones}>
					<Text style={styles.primaryButtonText}>Reintentar</Text>
				</TouchableOpacity>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity onPress={() => navigation.goBack()}>
					<Ionicons name="chevron-back" size={27} color={COLORS.text} />
				</TouchableOpacity>
				<Text style={styles.title}>Distribuciones externas</Text>
				<View style={styles.headerSpacer} />
			</View>

			<FlatList
				data={distribuciones}
				keyExtractor={item => String(item.id_distribucion)}
				contentContainerStyle={styles.list}
				ListEmptyComponent={<Text style={styles.empty}>No hay distribuciones externas.</Text>}
				renderItem={({ item }) => (
					<View style={styles.card}>
						<View style={styles.cardHeader}>
							<Text style={styles.cardTitle}>Distribución #{item.id_distribucion}</Text>
							<Text style={styles.status}>{item.estado || 'PENDIENTE'}</Text>
						</View>
						<Text style={styles.label}>Cliente</Text>
						<Text style={styles.value}>{item.cliente?.nombre_completo || 'Sin cliente'}</Text>
						<Text style={styles.label}>Ciudad</Text>
						<Text style={styles.value}>{item.cliente?.ciudad || 'Sin ciudad'}</Text>
						<Text style={styles.label}>Dirección</Text>
						<Text style={styles.value}>{item.pedido?.direccion_entrega || 'Sin dirección'}</Text>
						<TouchableOpacity
							style={styles.detailButton}
							onPress={() => navigation.navigate('DetalleEntrega', {
								id_distribucion: item.id_distribucion,
							})}
						>
							<Ionicons name="eye-outline" size={18} color={COLORS.primary} />
							<Text style={styles.detailButtonText}>Ver detalle</Text>
						</TouchableOpacity>
					</View>
				)}
			/>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#F6F6F6' },
	center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
	muted: { marginTop: 10, color: '#777' },
	error: { marginTop: 12, color: '#B00020', textAlign: 'center' },
	header: {
		height: 58,
		paddingHorizontal: 14,
		backgroundColor: '#FFF',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		borderBottomWidth: 1,
		borderBottomColor: '#E5E5E5',
	},
	title: { fontSize: 18, fontWeight: '700', color: COLORS.text },
	headerSpacer: { width: 27 },
	list: { padding: 16, paddingBottom: 30 },
	card: {
		backgroundColor: '#FFF',
		borderRadius: 12,
		padding: 16,
		marginBottom: 12,
		elevation: 2,
	},
	cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
	cardTitle: { fontSize: 16, fontWeight: '700', color: COLORS.text },
	status: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
	label: { marginTop: 7, fontSize: 11, color: '#777' },
	value: { marginTop: 2, fontSize: 14, color: COLORS.text, fontWeight: '600' },
	empty: { textAlign: 'center', marginTop: 40, color: '#777' },
	primaryButton: { marginTop: 18, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 8, backgroundColor: COLORS.primary },
	primaryButtonText: { color: '#FFF', fontWeight: '700' },
	detailButton: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8, paddingVertical: 10, marginTop: 14 },
	detailButtonText: { color: COLORS.primary, fontWeight: '700' },
});

export default DistribucionesExternasAdmin;
