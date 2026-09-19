import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Alert,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";

import { UserController } from "../../../core/controllers/UserController";

type RootStackParamList = {
  DetalleRepartidor: { id: number };
  EditarRepartidor: { repartidorId: number; repartidorData: Repartidor };
  RegistrarRepartidor: undefined;
};

interface Repartidor {
  id: number;
  nombre: string;
  estado: string;
  pedidos?: number;
  correo?: string;
  telefono?: string;
  ciudad?: string;
  fecha_registro: string;
}

export default function DashboardRepartidores() {
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState("");
  const [filtro, setFiltro] = useState("todos");

  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const userController = new UserController();
  const insets = useSafeAreaInsets();

  useFocusEffect(
    useCallback(() => {
      const cargarRepartidores = async () => {
        try {
          setLoading(true);
          const data = await userController.getRepartidores();

          const repartidoresMapeados: Repartidor[] = data.map((r: any) => ({
            id: r.id_usuario || r.id || 0,
            nombre: r.nombre_completo || r.nombre || "Sin nombre",
            estado: r.estado || "INACTIVO",
            correo: r.email || r.correo || "",
            telefono: r.telefono || "",
            ciudad: r.ciudad || "",
            pedidos: r.pedidos || 0,
            fecha_registro: r.fecha_registro || new Date().toISOString(),
          }));

          setRepartidores(repartidoresMapeados);
        } catch (error) {
          console.error("Error al cargar repartidores:", error);
          Alert.alert("Error", "No se pudieron cargar los repartidores.");
        } finally {
          setLoading(false);
        }
      };

      cargarRepartidores();
    }, [])
  );

  const eliminarRepartidor = (item: Repartidor) => {
    Alert.alert(
      "Eliminar Repartidor",
      `¿Estás seguro de eliminar a "${item.nombre}"?\n\nEsta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await userController.eliminarRepartidor(item.id);
              if (!response.success) {
                Alert.alert(
                  "Error",
                  response.message || "No se pudo eliminar el repartidor."
                );
                return;
              }
              setRepartidores((prev) => prev.filter((r) => r.id !== item.id));
              Alert.alert(
                "Eliminado",
                `El repartidor "${item.nombre}" fue eliminado correctamente.`
              );
            } catch (error) {
              console.error("Error al eliminar repartidor:", error);
              Alert.alert("Error", "No se pudo eliminar el repartidor.");
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const filtrarRepartidores = repartidores.filter((repartidor) => {
    const cumpleFiltro = filtro === "todos" || repartidor.estado === filtro;
    const cumpleBusqueda = repartidor.nombre
      .toLowerCase()
      .includes(buscar.toLowerCase());
    return cumpleFiltro && cumpleBusqueda;
  });

  const cantidadActivos = repartidores.filter(
    (r) => r.estado === "ACTIVO"
  ).length;
  const cantidadInactivos = repartidores.filter(
    (r) => r.estado === "INACTIVO"
  ).length;

  const filtros = [
    { key: "todos", label: "Todos", count: repartidores.length },
    { key: "ACTIVO", label: "Activos", count: cantidadActivos },
    { key: "INACTIVO", label: "Inactivos", count: cantidadInactivos },
  ];

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        scrollEventThrottle={16}
      >
        {/* HEADER */}
        <LinearGradient
          colors={["#B90F0F", "#7F0A0A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.headerTop}>
            <View style={styles.headerIconWrapper}>
              <Ionicons name="bicycle-outline" size={24} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Repartidores</Text>
              <Text style={styles.headerSubtitle}>
                Administra el equipo de entregas
              </Text>
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{repartidores.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statWithDot}>
                <View style={[styles.dot, { backgroundColor: "#4ADE80" }]} />
                <Text style={styles.statValue}>{cantidadActivos}</Text>
              </View>
              <Text style={styles.statLabel}>Activos</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statWithDot}>
                <View style={[styles.dot, { backgroundColor: "#F87171" }]} />
                <Text style={styles.statValue}>{cantidadInactivos}</Text>
              </View>
              <Text style={styles.statLabel}>Inactivos</Text>
            </View>
          </View>
        </LinearGradient>

        {/* BUSCADOR */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Buscar repartidor..."
            placeholderTextColor="#9CA3AF"
            value={buscar}
            onChangeText={setBuscar}
            style={styles.searchInput}
            returnKeyType="search"
          />
          {buscar !== "" && (
            <TouchableOpacity onPress={() => setBuscar("")}>
              <Ionicons name="close-circle" size={18} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* FILTROS CHIP */}
        <View style={styles.filtroContainer}>
          {filtros.map((f) => {
            const activo = filtro === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.chip, activo && styles.chipActivo]}
                onPress={() => setFiltro(f.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, activo && styles.chipTextActivo]}>
                  {f.label}
                </Text>
                <View
                  style={[styles.chipBadge, activo && styles.chipBadgeActivo]}
                >
                  <Text
                    style={[
                      styles.chipBadgeText,
                      activo && styles.chipBadgeTextActivo,
                    ]}
                  >
                    {f.count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* LISTA */}
        {filtrarRepartidores.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyText}>
              No se encontraron repartidores con esos criterios
            </Text>
          </View>
        ) : (
          filtrarRepartidores.map((item) => {
            const activo = item.estado === "ACTIVO";
            return (
              <View key={item.id.toString()} style={styles.card}>
                {/* HEADER CARD */}
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {item.nombre.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <View style={styles.infoPrincipal}>
                    <Text style={styles.nombre} numberOfLines={1}>
                      {item.nombre}
                    </Text>

                    <View
                      style={[
                        styles.estadoBadge,
                        activo ? styles.estadoActivo : styles.estadoInactivo,
                      ]}
                    >
                      <View
                        style={[
                          styles.estadoDot,
                          activo ? styles.dotVerde : styles.dotRojo,
                        ]}
                      />
                      <Text
                        style={[
                          styles.estadoTexto,
                          activo
                            ? styles.estadoTextoActivo
                            : styles.estadoTextoInactivo,
                        ]}
                      >
                        {item.estado}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() =>
                      Alert.alert(
                        "Eliminar repartidor",
                        `¿Deseas eliminar a ${item.nombre}?`,
                        [
                          { text: "Cancelar", style: "cancel" },
                          {
                            text: "Eliminar",
                            style: "destructive",
                            onPress: () => eliminarRepartidor(item),
                          },
                        ]
                      )
                    }
                  >
                    <Ionicons
                      name="ellipsis-vertical"
                      size={18}
                      color="#9CA3AF"
                    />
                  </TouchableOpacity>
                </View>

                {/* INFO ROWS */}
                <View style={styles.infoBlock}>
                  <View style={styles.infoRow}>
                    <Ionicons name="call-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.infoText} numberOfLines={1}>
                      {item.telefono || "No disponible"}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons name="mail-outline" size={14} color="#9CA3AF" />
                    <Text style={styles.infoText} numberOfLines={1}>
                      {item.correo || "No disponible"}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Ionicons
                      name="location-outline"
                      size={14}
                      color="#9CA3AF"
                    />
                    <Text style={styles.infoText} numberOfLines={1}>
                      {item.ciudad || "No especificada"}
                    </Text>
                  </View>
                </View>

                {/* RESUMEN */}
                <View style={styles.resumen}>
                  <View style={styles.resumenItem}>
                    <Ionicons name="cube-outline" size={16} color="#B90F0F" />
                    <Text style={styles.resumenText}>
                      {item.pedidos || 0}{" "}
                      {(item.pedidos || 0) === 1
                        ? "pedido entregado"
                        : "pedidos entregados"}
                    </Text>
                  </View>
                </View>

                {/* VER DETALLES */}
                <TouchableOpacity
                  style={styles.detalles}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate("DetalleRepartidor", { id: item.id })
                  }
                >
                  <Text style={styles.detallesText}>Ver detalles</Text>
                  <Ionicons name="arrow-forward" size={14} color="#B90F0F" />
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={() => navigation.navigate("RegistrarRepartidor")}
      >
        <Ionicons name="add" size={22} color="#FFF" />
        <Text style={styles.fabText}>Agregar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  scrollContent: {
    paddingBottom: 20,
  },

  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 22,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    paddingVertical: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statWithDot: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFF",
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(255,255,255,0.85)",
    marginTop: 2,
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: "rgba(255,255,255,0.25)",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    height: 46,
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginHorizontal: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
    paddingVertical: 0,
  },

  filtroContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 6,
  },
  chipActivo: {
    backgroundColor: "#B90F0F",
    borderColor: "#B90F0F",
  },
  chipText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6B7280",
  },
  chipTextActivo: {
    color: "#FFF",
  },
  chipBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  chipBadgeActivo: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  chipBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
  },
  chipBadgeTextActivo: {
    color: "#FFF",
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: {
    color: "#B90F0F",
    fontSize: 18,
    fontWeight: "700",
  },
  infoPrincipal: {
    flex: 1,
  },
  nombre: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  estadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    marginRight: 5,
  },
  dotVerde: {
    backgroundColor: "#22C55E",
  },
  dotRojo: {
    backgroundColor: "#EF4444",
  },
  estadoTexto: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  estadoTextoActivo: {
    color: "#15803D",
  },
  estadoTextoInactivo: {
    color: "#B91C1C",
  },
  menuButton: {
    padding: 6,
  },

  infoBlock: {
    marginTop: 14,
    gap: 6,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoText: {
    fontSize: 12,
    color: "#6B7280",
    flex: 1,
  },

  resumen: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  resumenItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  resumenText: {
    fontSize: 12,
    color: "#7F1D1D",
    fontWeight: "600",
  },

  detalles: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#FFF5F5",
    gap: 6,
  },
  detallesText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#B90F0F",
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#374151",
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 4,
    textAlign: "center",
  },

  fab: {
    position: "absolute",
    right: 20,
    bottom: 24,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#B90F0F",
    paddingHorizontal: 18,
    height: 52,
    borderRadius: 26,
    gap: 6,
    shadowColor: "#B90F0F",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "700",
  },
});