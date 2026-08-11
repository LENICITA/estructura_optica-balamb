import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    TouchableWithoutFeedback,
    Keyboard,
    Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
    useNavigation,
    NavigationProp,
} from "@react-navigation/native";
import api from "../../../services/api";

// ======================================================
// NAVEGACIÓN
// ======================================================

type RootStackParamList = {
    DetalleFormula: {
        id: number;
        formula: Formula;
    };
};

// ======================================================
// TIPO DE FÓRMULA
// ======================================================

interface Formula {
    id_formula: number;
    id_usuario: number;
    condicion: string;
    observaciones: string | null;
    fecha_creacion: string;
    estado: "Pendiente" | "Aprobado" | "Rechazado";
    imagen_url: string;
    costo: number;
    nombre_completo: string;
    email: string;
    telefono: string;
}

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================

export default function GestionarFormulas() {

    const navigation =
        useNavigation<NavigationProp<RootStackParamList>>();

    const [formulas, setFormulas] = useState<Formula[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState("");
    const [buscar, setBuscar] = useState("");

    const [filtro, setFiltro] = useState<
        "TODOS" | "PENDIENTE" | "APROBADO" | "RECHAZADO"
    >("TODOS");

    useEffect(() => {
        cargarFormulas();
    }, []);

    // ==================================================
    // ESTADÍSTICAS
    // ==================================================

    const total = formulas.length;

    const pendientes = formulas.filter(
        (f) => f.estado === "Pendiente"
    ).length;

    const aprobadas = formulas.filter(
        (f) => f.estado === "Aprobado"
    ).length;

    const rechazadas = formulas.filter(
        (f) => f.estado === "Rechazado"
    ).length;

    // ==================================================
    // CARGAR FÓRMULAS
    // ==================================================

    const cargarFormulas = async () => {

        try {

            setCargando(true);
            setError("");

            const response = await api.get(
                "/formulas/admin/todas"
            );

            if (response.data.success) {

                setFormulas(response.data.data);

            } else {

                setError(
                    "No se pudieron cargar las fórmulas"
                );

            }

        } catch (error: any) {

            console.error(
                "Error al cargar fórmulas:",
                error.response?.data ||
                error.message
            );

            setError(
                error.response?.data?.message ||
                "Error al conectar con el servidor"
            );

        } finally {

            setCargando(false);

        }
    };

    // ==================================================
    // FILTRAR FÓRMULAS
    // ==================================================

    const formulasFiltradas = formulas.filter(
        (formula) => {

            const texto =
                buscar.toLowerCase().trim();

            const coincideBusqueda =
                formula.nombre_completo
                    ?.toLowerCase()
                    .includes(texto) ||

                formula.condicion
                    ?.toLowerCase()
                    .includes(texto) ||

                formula.observaciones
                    ?.toLowerCase()
                    .includes(texto) ||

                formula.email
                    ?.toLowerCase()
                    .includes(texto);

            let coincideFiltro = true;

            if (filtro !== "TODOS") {

                const estadoFiltro =
                    filtro === "PENDIENTE"
                        ? "Pendiente"
                        : filtro === "APROBADO"
                            ? "Aprobado"
                            : "Rechazado";

                coincideFiltro =
                    formula.estado === estadoFiltro;
            }

            return (
                coincideBusqueda &&
                coincideFiltro
            );
        }
    );

    // ==================================================
    // ABRIR DETALLE
    // ==================================================

    const abrirDetalle = (formula: Formula) => {

        navigation.navigate(
            "DetalleFormula",
            {
                id: formula.id_formula,
                formula: formula,
            }
        );

    };

    // ==================================================
    // PANTALLA
    // ==================================================

    return (

        <TouchableWithoutFeedback
            onPress={() => Keyboard.dismiss()}
        >

            <SafeAreaView
                style={styles.container}
            >

                {/* ======================================
                    ENCABEZADO
                ====================================== */}

                <View style={styles.header}>

                    <View>

                        <Text style={styles.titulo}>
                            Gestión de Fórmulas
                        </Text>

                        <Text style={styles.subtitulo}>
                            Administra las fórmulas recibidas
                        </Text>

                    </View>

                </View>


                {/* ======================================
                    ESTADÍSTICAS
                ====================================== */}

                <View style={styles.statsContainer}>

                    {/* TOTAL */}

                    <View style={styles.statCard}>

                        <View
                            style={[
                                styles.statIcon,
                                styles.redIcon,
                            ]}
                        >

                            <Ionicons
                                name="documents-outline"
                                size={20}
                                color="#B90F0F"
                            />

                        </View>

                        <Text style={styles.statNumber}>
                            {total}
                        </Text>

                        <Text style={styles.statLabel}>
                            Total
                        </Text>

                    </View>


                    {/* PENDIENTES */}

                    <View style={styles.statCard}>

                        <View
                            style={[
                                styles.statIcon,
                                styles.orangeIcon,
                            ]}
                        >

                            <Ionicons
                                name="time-outline"
                                size={20}
                                color="#D97706"
                            />

                        </View>

                        <Text style={styles.statNumber}>
                            {pendientes}
                        </Text>

                        <Text style={styles.statLabel}>
                            Pendientes
                        </Text>

                    </View>


                    {/* APROBADAS */}

                    <View style={styles.statCard}>

                        <View
                            style={[
                                styles.statIcon,
                                styles.greenIcon,
                            ]}
                        >

                            <Ionicons
                                name="checkmark-circle-outline"
                                size={20}
                                color="#16A34A"
                            />

                        </View>

                        <Text style={styles.statNumber}>
                            {aprobadas}
                        </Text>

                        <Text style={styles.statLabel}>
                            Aprobadas
                        </Text>

                    </View>

                </View>


                {/* ======================================
                    BUSCADOR
                ====================================== */}

                <View style={styles.searchContainer}>

                    <Ionicons
                        name="search-outline"
                        size={20}
                        color="#777"
                    />

                    <TextInput
                        style={styles.searchInput}
                        placeholder="Buscar fórmula..."
                        placeholderTextColor="#999"
                        value={buscar}
                        onChangeText={setBuscar}
                    />

                    {buscar.length > 0 && (

                        <TouchableOpacity
                            onPress={() =>
                                setBuscar("")
                            }
                        >

                            <Ionicons
                                name="close-circle"
                                size={20}
                                color="#999"
                            />

                        </TouchableOpacity>

                    )}

                </View>


                {/* ======================================
                    FILTROS
                ====================================== */}

                <View style={styles.filtrosContainer}>

                    <Filtro
                        texto={`Todas (${total})`}
                        seleccionado={
                            filtro === "TODOS"
                        }
                        onPress={() =>
                            setFiltro("TODOS")
                        }
                    />

                    <Filtro
                        texto={`Pendientes (${pendientes})`}
                        seleccionado={
                            filtro === "PENDIENTE"
                        }
                        onPress={() =>
                            setFiltro("PENDIENTE")
                        }
                    />

                    <Filtro
                        texto={`Aprobadas (${aprobadas})`}
                        seleccionado={
                            filtro === "APROBADO"
                        }
                        onPress={() =>
                            setFiltro("APROBADO")
                        }
                    />

                </View>


                {/* ======================================
                    CONTADOR
                ====================================== */}

                <View style={styles.resultadoHeader}>

                    <Text style={styles.resultadoTitulo}>
                        Fórmulas recibidas
                    </Text>

                    <Text style={styles.resultadoNumero}>
                        {formulasFiltradas.length}
                    </Text>

                </View>


                {/* ======================================
                    LISTA
                ====================================== */}

                <FlatList
                    data={formulasFiltradas}

                    keyExtractor={(item) =>
                        item.id_formula.toString()
                    }

                    showsVerticalScrollIndicator={false}

                    contentContainerStyle={
                        styles.lista
                    }

                    renderItem={({ item }) => (

                        <FormulaCard
                            formula={item}
                            onPress={() =>
                                abrirDetalle(item)
                            }
                        />

                    )}

                    ListEmptyComponent={

                        <View
                            style={
                                styles.emptyContainer
                            }
                        >

                            <View
                                style={styles.emptyIcon}
                            >

                                <Ionicons
                                    name="document-text-outline"
                                    size={40}
                                    color="#B90F0F"
                                />

                            </View>

                            <Text
                                style={
                                    styles.emptyTitle
                                }
                            >
                                No se encontraron fórmulas
                            </Text>

                            <Text
                                style={
                                    styles.emptyText
                                }
                            >
                                Intenta cambiar el filtro
                                o realizar otra búsqueda.
                            </Text>

                        </View>

                    }

                />

            </SafeAreaView>

        </TouchableWithoutFeedback>

    );
}

// ======================================================
// COMPONENTE FILTRO
// ======================================================

interface FiltroProps {
    texto: string;
    seleccionado: boolean;
    onPress: () => void;
}

const Filtro = ({
    texto,
    seleccionado,
    onPress,
}: FiltroProps) => {

    return (

        <TouchableOpacity
            style={[
                styles.filtro,
                seleccionado &&
                styles.filtroSeleccionado,
            ]}
            onPress={onPress}
        >

            <Text
                style={[
                    styles.filtroTexto,
                    seleccionado &&
                    styles.filtroTextoSeleccionado,
                ]}
            >
                {texto}
            </Text>

        </TouchableOpacity>

    );
};

// ======================================================
// CARD DE FÓRMULA
// ======================================================

interface FormulaCardProps {
    formula: Formula;
    onPress: () => void;
}

const FormulaCard = ({
    formula,
    onPress,
}: FormulaCardProps) => {

    return (

        <View style={styles.formulaCard}>

            {/* ======================================
                INFORMACIÓN
            ====================================== */}

            <View style={styles.formulaInfo}>

                {/* ==================================
                    INFORMACIÓN DE LA FÓRMULA
                ================================== */}

                <View style={styles.seccionTituloRow}>

                    <Ionicons
                        name="document-text-outline"
                        size={13}
                        color="#B90F0F"
                    />

                    <Text style={styles.seccionTitulo}>
                        FÓRMULA
                    </Text>

                </View>


                {/* CONDICIÓN */}

                <Text
                    style={styles.condicion}
                    numberOfLines={1}
                >
                    {formula.condicion}
                </Text>


                <View style={styles.separador} />


                {/* ==================================
                    INFORMACIÓN DEL CLIENTE
                ================================== */}

                <View style={styles.seccionTituloRow}>

                    <Ionicons
                        name="id-card-outline"
                        size={13}
                        color="#000000"
                    />

                    <Text style={styles.seccionTituloCliente}>
                        CLIENTE
                    </Text>

                </View>


                {/* NOMBRE */}

                <View style={styles.infoRow}>

                    <Ionicons
                        name="person-outline"
                        size={13}
                        color="#777"
                    />

                    <Text
                        style={styles.infoText}
                        numberOfLines={1}
                    >
                        {formula.nombre_completo}
                    </Text>

                </View>


                {/* TELÉFONO */}

                <View style={styles.infoRow}>

                    <Ionicons
                        name="call-outline"
                        size={13}
                        color="#777"
                    />

                    <Text
                        style={styles.infoText}
                        numberOfLines={1}
                    >
                        {formula.telefono}
                    </Text>

                </View>


                {/* EMAIL */}

                <View style={styles.infoRow}>

                    <Ionicons
                        name="mail-outline"
                        size={13}
                        color="#777"
                    />

                    <Text
                        style={styles.infoText}
                        numberOfLines={1}
                    >
                        {formula.email}
                    </Text>

                </View>


                {/* ==================================
                    DETALLES
                ================================== */}

                <View style={styles.detallesTituloRow}>

                    <Ionicons
                        name="information-circle-outline"
                        size={13}
                        color="#000000"
                    />

                    <Text style={styles.seccionTituloCliente}>
                        DETALLES
                    </Text>

                </View>


                {/* OBSERVACIÓN */}

                {formula.observaciones && (

                    <View style={styles.infoRow}>

                        <Ionicons
                            name="chatbubble-outline"
                            size={13}
                            color="#777"
                        />

                        <Text
                            style={styles.infoText}
                            numberOfLines={1}
                        >
                            {formula.observaciones}
                        </Text>

                    </View>

                )}


                {/* FECHA */}

                <View style={styles.infoRow}>

                    <Ionicons
                        name="calendar-outline"
                        size={13}
                        color="#777"
                    />

                    <Text style={styles.infoText}>

                        {new Date(
                            formula.fecha_creacion
                        ).toLocaleDateString("es-CO")}

                    </Text>

                </View>


                {/* PRECIO */}

                {formula.costo !== null &&
                    formula.costo !== undefined && (

                    <View style={styles.precioRow}>

                        <Ionicons
                            name="cash-outline"
                            size={13}
                            color="#16A34A"
                        />

                        <Text style={styles.precio}>
                            ${formula.costo.toLocaleString("es-CO")}
                        </Text>

                    </View>

                )}


                {/* BOTÓN */}

                <TouchableOpacity
                    style={styles.verButton}
                    onPress={onPress}
                >

                    <Text style={styles.verButtonText}>
                        Ver fórmula
                    </Text>

                    <Ionicons
                        name="arrow-forward"
                        size={15}
                        color="#FFF"
                    />

                </TouchableOpacity>

            </View>


            {/* ======================================
                IMAGEN 
            ====================================== */}

            <View style={styles.imagenSection}>

                {/* ESTADO ENCIMA DE LA IMAGEN */}

                <EstadoBadge
                    estado={formula.estado}
                />


                {/* IMAGEN */}

                <View style={styles.imagenContainer}>

                    <Image
                        source={{
                            uri: formula.imagen_url,
                        }}
                        style={styles.imagen}
                        resizeMode="cover"
                    />

                </View>

            </View>

        </View>

    );
};

// ======================================================
// ESTADO
// ======================================================

const EstadoBadge = ({
    estado,
}: {
    estado: string;
}) => {

    let background = "#FEF3C7";
    let color = "#D97706";

    let icon:
        | "time-outline"
        | "checkmark-circle-outline"
        | "close-circle-outline"
        = "time-outline";


    if (estado === "Aprobado") {

        background = "#DCFCE7";
        color = "#16A34A";

        icon =
            "checkmark-circle-outline";

    }


    if (estado === "Rechazado") {

        background = "#FEE2E2";
        color = "#DC2626";

        icon =
            "close-circle-outline";

    }


    return (

        <View
            style={[
                styles.estadoBadge,
                {
                    backgroundColor:
                        background,
                },
            ]}
        >

            <Ionicons
                name={icon}
                size={11}
                color={color}
            />

            <Text
                style={[
                    styles.estadoTexto,
                    {
                        color,
                    },
                ]}
            >
                {estado}
            </Text>

        </View>

    );
};

// ======================================================
// ESTILOS
// ======================================================

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F3F4F6",
        paddingHorizontal: 18,
    },

    // ================================================
    // HEADER
    // ================================================

    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 4,
        marginBottom: 17,
    },

    titulo: {
        fontSize: 26,
        fontWeight: "bold",
        color: "#111111",
    },

    subtitulo: {
        fontSize: 13,
        color: "#777777",
        marginTop: 3,
    },

    // ================================================
    // ESTADÍSTICAS
    // ================================================

    statsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 14,
    },

    statCard: {
        width: "31.5%",
        height: 104,
        backgroundColor: "#FFF",
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",

        elevation: 2,

        shadowColor: "#000",

        shadowOffset: {
            width: 0,
            height: 1,
        },

        shadowOpacity: 0.06,
        shadowRadius: 4,
    },

    statIcon: {
        width: 34,
        height: 34,
        borderRadius: 17,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
    },

    redIcon: {
        backgroundColor: "#FEE2E2",
    },

    orangeIcon: {
        backgroundColor: "#FEF3C7",
    },

    greenIcon: {
        backgroundColor: "#DCFCE7",
    },

    statNumber: {
        fontSize: 21,
        fontWeight: "bold",
        color: "#1A1A1A",
    },

    statLabel: {
        fontSize: 11,
        color: "#777",
        marginTop: 1,
    },

    // ================================================
    // BUSCADOR
    // ================================================

    searchContainer: {
        height: 46,
        backgroundColor: "#FFF",
        borderRadius: 11,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 13,
        marginBottom: 11,
    },

    searchInput: {
        flex: 1,
        fontSize: 14,
        color: "#222",
        marginLeft: 8,
    },

    // ================================================
    // FILTROS
    // ================================================

    filtrosContainer: {
        flexDirection: "row",
        marginBottom: 10,
    },

    filtro: {
        height: 39,
        paddingHorizontal: 12,
        backgroundColor: "#FFF",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#E5E5E5",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 7,
    },

    filtroSeleccionado: {
        backgroundColor: "#B90F0F",
        borderColor: "#B90F0F",
    },

    filtroTexto: {
        fontSize: 11,
        fontWeight: "600",
        color: "#B90F0F",
    },

    filtroTextoSeleccionado: {
        color: "#FFF",
    },

    // ================================================
    // RESULTADOS
    // ================================================

    resultadoHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },

    resultadoTitulo: {
        fontSize: 16,
        fontWeight: "700",
        color: "#222",
    },

    resultadoNumero: {
        fontSize: 12,
        color: "#888",
        marginLeft: 6,
    },

    // ================================================
    // LISTA
    // ================================================

    lista: {
        paddingTop: 2,
        paddingBottom: 30,
    },

    // ================================================
    // SECCIONES DE LA TARJETA
    // ================================================

    seccionTituloRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },

    seccionTitulo: {
        fontSize: 8,
        fontWeight: "800",
        color: "#B90F0F",
        marginLeft: 5,
        letterSpacing: 0.5,
    },

    seccionTituloCliente: {
        fontSize: 12,
        fontWeight: "800",
        color: "#2f2828",
        marginLeft: 5,
        letterSpacing: 0.5,
    },

    detallesTituloRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
        marginBottom: 4,
    },

    separador: {
        height: 1,
        backgroundColor: "#EEEEEE",
        marginVertical: 5,
    },

    // ================================================
    // CARD
    // ================================================

    formulaCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    marginVertical: 7,
    flexDirection: "row",

    elevation: 3,

    shadowColor: "#000",

    shadowOffset: {
        width: 0,
        height: 2,
    },

    shadowOpacity: 0.07,

    shadowRadius: 6,
},

    // ================================================
    // INFORMACIÓN
    // ================================================

    formulaInfo: {
        flex: 1,
        paddingRight: 10,
    },

    // ================================================
    // IMAGEN 
    // ================================================

   imagenSection: {
    width: 92,
    alignItems: "center",
    justifyContent: "flex-start",
},


imagenContainer: {
    width: 92,
    height: 116,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#F5F5F5",
    marginTop: 30
},


imagen: {
    width: "100%",
    height: "100%",
},

    // ================================================
    // CONDICIÓN
    // ================================================

    nombreRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 7,
    },

    condicion: {
        flex: 1,
        fontSize: 15,
        fontWeight: "700",
        color: "#171717",
        marginRight: 5,
    },

    // ================================================
    // INFO
    // ================================================

    infoRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 5,
        minWidth: 0,
    },

    infoText: {
        flex: 1,
        fontSize: 10.5,
        color: "#666",
        marginLeft: 6,
    },

    // ================================================
    // PRECIO
    // ================================================

    precioRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 1,
        marginBottom: 2,
    },

    precio: {
        fontSize: 11,
        color: "#16A34A",
        fontWeight: "700",
        marginLeft: 5,
    },

    // ================================================
    // ESTADO
    // ================================================

    estadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "stretch",
    justifyContent: "center",

    borderRadius: 8,

    paddingHorizontal: 5,
    paddingVertical: 4,

    marginBottom: 5,
},

estadoTexto: {
    fontSize: 7.5,
    fontWeight: "700",
    marginLeft: 3,
},

    // ================================================
    // BOTÓN
    // ================================================

    verButton: {
        height: 32,
        backgroundColor: "#B90F0F",
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 6,
    },

    verButtonText: {
        color: "#FFF",
        fontSize: 10.5,
        fontWeight: "700",
        marginRight: 5,
    },

    // ================================================
    // VACÍO
    // ================================================

    emptyContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 80,
        paddingHorizontal: 30,
    },

    emptyIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#FEE2E2",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 15,
    },

    emptyTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#222",
        textAlign: "center",
    },

    emptyText: {
        fontSize: 13,
        color: "#888",
        textAlign: "center",
        marginTop: 6,
        lineHeight: 19,
    },

});