import {
    ScrollView,
    Text,
    View,
    StyleSheet,
    TouchableOpacity
} from 'react-native';
import React, { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

import { UserController } from '../../../core/controllers/UserController';
import { UserModel } from '../../../core/models/UserModel';

type RepartidorDetalleUser = UserModel & {
    pedidos_count?: number;
};

export const DetalleRepartidor = () => {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();
    const { id } = route.params ?? {};

    const [user, setUser] = useState<RepartidorDetalleUser | null>(null);
    const [loading, setLoading] = useState(true);

    const nombre = user?.nombre_completo ?? 'No disponible';
    const estado = user?.estado ?? 'INACTIVO';
    const telefono = user?.telefono ?? '';
    const correo = user?.email ?? '';
    const ciudad = user?.ciudad ?? 'No especificada';
    const pedidos = user?.pedidos_count ?? 0;
    const fechaRegistro = user?.fecha_registro ?? null;
    const vehiculo = user?.vehiculo ?? null;
    const LoadingVehiculo = false;

    const formatDate = (value?: string | Date | null) => {
        if (!value) return 'No disponible';

        // Convertimos a string y tomamos solo la parte de la fecha (YYYY-MM-DD)
        if (typeof value === 'string') {
            const fechaSolo = value.split('T')[0]; // Quita la hora
            const partes = fechaSolo.split('-'); // Divide en año, mes, día
            if (partes.length === 3) {
                return `${partes[2]}/${partes[1]}/${partes[0]}`; // Retorna DD/MM/YYYY
            }
        }

        // Si no se pudo formatear manualmente, usamos el Date() estándar
        const date = typeof value === 'string' ? new Date(value) : value;
        return Number.isNaN(date.getTime()) ? 'No disponible' : date.toLocaleDateString('es-ES');
    };

    useEffect(() => {
        if (id) {
            cargarDatosRepartidor();
        }
    }, [id]);

    const cargarDatosRepartidor = async () => {
        try {
            setLoading(true);

            const controller = new UserController();
            const response = await controller.getRepartidorById(id);

            if (response) {
                setUser(response as unknown as RepartidorDetalleUser);
            }
        } catch (error) {
            console.error('Error al cargar los datos del repartidor:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Botón Volver */}
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back-outline" size={20} color="#B90F0F" />
                <Text style={styles.textBoton}>Volver</Text>
            </TouchableOpacity>

            {/* Card Principal */}
            <View style={styles.card}>
                <View style={styles.headerCard}>
                    <View style={styles.avatar}>
                        <Ionicons name="person" size={28} color="#B90F0F" />
                    </View>

                    <View style={styles.infoPrincipal}>
                        <View style={styles.nombreRow}>
                            <Text style={styles.nombre}>{nombre}</Text>
                            <View style={[
                                styles.estadoBadge,
                                estado === "ACTIVO" ? styles.estadoActivo : styles.estadoInactivo
                            ]}>
                                <View style={[
                                    styles.estadoDot,
                                    estado === "ACTIVO" ? styles.dotVerde : styles.dotRojo
                                ]} />
                                <Text style={[
                                    styles.estadoTexto,
                                    estado === "ACTIVO" ? styles.estadoTextoActivo : styles.estadoTextoInactivo
                                ]}>
                                    {estado}
                                </Text>
                            </View>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="call-outline" size={14} color="#888" />
                            <Text style={styles.infoText}>{telefono || "No disponible"}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="mail-outline" size={14} color="#888" />
                            <Text style={styles.infoText}>{correo || "No disponible"}</Text>
                        </View>

                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={14} color="#888" />
                            <Text style={styles.infoText}>{ciudad || "No especificada"}</Text>
                        </View>
                    </View>
                </View>

                {/* Resumen */}
                <View style={styles.resumen}>
                    <View style={styles.resumenItem}>
                        <Ionicons name="cube-outline" size={18} color="#B90F0F" />
                        <Text style={styles.resumenText}>{pedidos || 0} pedidos asignados</Text>
                    </View>

                    <View style={styles.divisor} />

                    <View style={styles.resumenItem}>
                        <Ionicons name="calendar-outline" size={18} color="#B90F0F" />
                        <Text style={styles.resumenText}>Último pedido</Text>
                    </View>
                </View>
            </View>

            {/* Sección: Información Personal */}
            <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="person-outline" size={22} color="#B90F0F" />
                    <Text style={styles.sectionTitle}>Información Personal</Text>
                </View>

                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Nombre completo</Text>
                    <Text style={styles.infoValue}>{nombre}</Text>
                </View>

                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Correo electrónico</Text>
                    <Text style={styles.infoValue}>{correo || "No disponible"}</Text>
                </View>

                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Teléfono</Text>
                    <Text style={styles.infoValue}>{telefono || "No disponible"}</Text>
                </View>

                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Ciudad</Text>
                    <Text style={styles.infoValue}>{ciudad || "No especificada"}</Text>
                </View>

                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Estado</Text>
                    <View style={[
                        styles.estadoBadge,
                        estado === "ACTIVO" ? styles.estadoActivo : styles.estadoInactivo
                    ]}>
                        <View style={[
                            styles.estadoDot,
                            estado === "ACTIVO" ? styles.dotVerde : styles.dotRojo
                        ]} />
                        <Text style={[
                            styles.estadoTexto,
                            estado === "ACTIVO" ? styles.estadoTextoActivo : styles.estadoTextoInactivo
                        ]}>
                            {estado}
                        </Text>
                    </View>
                </View>

                <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Fecha de registro</Text>
                    <Text style={styles.infoValue}>{formatDate(fechaRegistro)}</Text>
                </View>
            </View>

            {/* Sección: Información del Vehículo */}
            <View style={styles.sectionCard}>
                <View style={styles.sectionHeader}>
                    <Ionicons name="car-outline" size={22} color="#B90F0F" />
                    <Text style={styles.sectionTitle}>Información del Vehículo</Text>
                </View>

                {LoadingVehiculo ? (
                    <View style={styles.loadingContainer}>
                        <Text style={styles.loadingText}>Cargando vehículo...</Text>
                    </View>
                ) : vehiculo ? (
                    <>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Tipo</Text>
                            <Text style={styles.infoValue}>{vehiculo.tipo || "No especificado"}</Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Placa</Text>
                            <Text style={styles.infoValue}>{vehiculo.placa || "No disponible"}</Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Modelo</Text>
                            <Text style={styles.infoValue}>{vehiculo.modelo || "No especificado"}</Text>
                        </View>

                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Color</Text>
                            <Text style={styles.infoValue}>{vehiculo.color || "No especificado"}</Text>
                        </View>

                    </>
                ) : (
                    <View style={styles.emptyContainer}>
                        <Ionicons name="car-outline" size={48} color="#CCC" />
                        <Text style={styles.emptyText}>Sin vehículo asignado</Text>
                        <Text style={styles.emptySubtext}>Este repartidor no tiene un vehículo registrado</Text>
                    </View>
                )}
            </View>

            {/* Botón Editar */}
            <TouchableOpacity style={styles.botonEdit}>
                <Ionicons name="create-outline" size={20} color="#FFF" />
                <Text style={styles.textoEdit}>Editar Repartidor</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F4F6",
        padding: 16,
    },
    backButton: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    textBoton: {
        color: "#B90F0F",
        fontSize: 16,
        marginLeft: 6,
        fontWeight: "600",
    },
    card: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    headerCard: {
        flexDirection: "row",
        alignItems: "flex-start",
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#FEE2E2",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 14,
    },
    infoPrincipal: {
        flex: 1,
    },
    nombreRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 6,
        flexWrap: "wrap",
    },
    nombre: {
        fontSize: 18,
        fontWeight: "700",
        color: "#1A1A1A",
        marginRight: 8,
    },
    estadoBadge: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    estadoActivo: {
        backgroundColor: "#DCFCE7",
    },
    estadoInactivo: {
        backgroundColor: "#FEE2E2",
    },
    estadoDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    dotVerde: {
        backgroundColor: "#22C55E",
    },
    dotRojo: {
        backgroundColor: "#EF4444",
    },
    estadoTexto: {
        fontSize: 10,
        fontWeight: "600",
        textTransform: "uppercase",
    },
    estadoTextoActivo: {
        color: "#16A34A",
    },
    estadoTextoInactivo: {
        color: "#DC2626",
    },
    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 4,
    },
    infoText: {
        fontSize: 13,
        color: "#666",
        marginLeft: 8,
    },
    resumen: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FEF2F2",
        borderRadius: 12,
        marginTop: 14,
        paddingVertical: 10,
    },
    resumenItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    resumenText: {
        fontSize: 11,
        color: "#444",
        marginLeft: 6,
        fontWeight: "500",
    },
    divisor: {
        width: 1,
        height: 28,
        backgroundColor: "#E5CCCC",
    },
    sectionCard: {
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
    },
    sectionHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 16,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#1A1A1A",
        marginLeft: 10,
    },
    infoItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#F5F5F5",
    },
    infoLabel: {
        fontSize: 13,
        color: "#888",
        fontWeight: "500",
    },
    infoValue: {
        fontSize: 14,
        color: "#1A1A1A",
        fontWeight: "600",
        maxWidth: "60%",
        textAlign: "right",
    },
    loadingContainer: {
        padding: 20,
        alignItems: "center",
    },
    loadingText: {
        color: "#888",
        fontSize: 14,
    },
    emptyContainer: {
        padding: 24,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#666",
        marginTop: 10,
    },
    emptySubtext: {
        fontSize: 12,
        color: "#999",
        marginTop: 4,
    },
    botonEdit: {
        backgroundColor: "#B90F0F",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4,
        marginBottom: 30,
        flexDirection: "row",
        gap: 10,
        elevation: 3,
        shadowColor: "#B90F0F",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    textoEdit: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
});
