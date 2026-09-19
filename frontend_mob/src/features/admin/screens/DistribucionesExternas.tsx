import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Keyboard,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";

import { DistribucionController } from "../../../core/controllers/DistribucionController";
import { DistribucionModel } from "../../../core/models/DistribucionModel";

type RootStackParamList = {
  DetalleEntrega: { id_distribucion: number };
  HistorialEntregasExternas: undefined;
};

const ESTADO_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  PENDIENTE: {
    label: "Pendiente",
    color: "#B45309",
    bg: "#FEF3C7",
    icon: "time-outline",
  },
  EN_ENTREGA: {
    label: "En entrega",
    color: "#1D4ED8",
    bg: "#DBEAFE",
    icon: "bicycle-outline",
  },
  ENTREGADO: {
    label: "Entregado",
    color: "#15803D",
    bg: "#DCFCE7",
    icon: "checkmark-circle-outline",
  },
  CANCELADO: {
    label: "Cancelado",
    color: "#B91C1C",
    bg: "#FEE2E2",
    icon: "close-circle-outline",
  },
};

const getEstadoConfig = (estado: string) =>
  ESTADO_CONFIG[estado] ?? {
    label: estado,
    color: "#6B7280",
    bg: "#F3F4F6",
    icon: "information-circle-outline" as const,
  };

const ESTADOS_FILTRO = [
  { key: "TODOS", label: "Todos" },
  { key: "PENDIENTE", label: "Pendiente" },
  { key: "EN_ENTREGA", label: "En entrega" },
  { key: "ENTREGADO", label: "Entregado" },
];

export default function DistribucionesExternas() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [distribuciones, setDistribuciones] = useState<DistribucionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [buscar, setBuscar] = useState("");
  const [ciudadFiltro, setCiudadFiltro] = useState<string>("todas");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("TODOS");

  const distribucionController = useMemo(() => new DistribucionController(), []);

  const cargarDistribuciones = useCallback(
    async (isRefresh = false) => {
      try {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);

        const data = await distribucionController.getDistribucionesExternas();
        const BOGOTA = ["bogotá", "bogota", "bogotá d.c.", "bogota d.c."];
        const externas = data.filter((d) => {
          const ciudad = (
            d.pedido?.ciudad_envio ||
            d.pedido?.cliente?.ciudad ||
            ""
          )
            .toLowerCase()
            .trim();
          return ciudad !== "" && !BOGOTA.includes(ciudad);
        });

        setDistribuciones(externas);
      } catch (error: any) {
        console.error("Error al cargar distribuciones externas:", error);
        Alert.alert(
          "Error",
          error?.message || "No se pudieron cargar las distribuciones externas."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [distribucionController]
  );

  useFocusEffect(
    useCallback(() => {
      cargarDistribuciones();
    }, [cargarDistribuciones])
  );

  const distribucionesActivas = useMemo(
    () => distribuciones.filter((d) => d.estado !== "CANCELADO"),
    [distribuciones]
  );

  const ciudades = useMemo(() => {
    const set = new Set<string>();
    distribucionesActivas.forEach((d) => {
      const c = d.pedido?.ciudad_envio?.trim();
      if (c) set.add(c);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [distribucionesActivas]);

  const conteoEstados = useMemo(() => {
    const base: Record<string, number> = {
      TODOS: distribucionesActivas.length,
      PENDIENTE: 0,
      EN_ENTREGA: 0,
      ENTREGADO: 0,
    };
    distribucionesActivas.forEach((d) => {
      if (base[d.estado] !== undefined) base[d.estado] += 1;
    });
    return base;
  }, [distribucionesActivas]);

  const filtradas = useMemo(() => {
    return distribucionesActivas.filter((d) => {
      const ciudad = d.pedido?.ciudad_envio ?? "";
      const cliente = d.pedido?.cliente?.nombre ?? "";
      const direccion = d.pedido?.direccion_entrega ?? "";

      const cumpleCiudad = ciudadFiltro === "todas" || ciudad === ciudadFiltro;

      const cumpleEstado =
        estadoFiltro === "TODOS" || d.estado === estadoFiltro;

      const q = buscar.trim().toLowerCase();
      const cumpleBusqueda =
        q === "" ||
        cliente.toLowerCase().includes(q) ||
        ciudad.toLowerCase().includes(q) ||
        direccion.toLowerCase().includes(q);

      return cumpleCiudad && cumpleEstado && cumpleBusqueda;
    });
  }, [distribucionesActivas, ciudadFiltro, estadoFiltro, buscar]);

  const totalExternas = distribucionesActivas.length;
  const enEntrega = conteoEstados.EN_ENTREGA;
  const entregadas = conteoEstados.ENTREGADO;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        onScrollBeginDrag={Keyboard.dismiss}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => cargarDistribuciones(true)}
            tintColor="#B90F0F"
            colors={["#B90F0F"]}
          />
        }
      >
        <LinearGradient
          colors={["#B90F0F", "#7F0A0A"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.header, { paddingTop: insets.top + 16 }]}
        >
          <View style={styles.headerTop}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="arrow-back" size={22} color="#FFF" />
            </TouchableOpacity>

            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>Envíos externos</Text>
              <Text style={styles.headerSubtitle}>
                Distribuciones fuera de Bogotá
              </Text>
            </View>

            <TouchableOpacity
              style={styles.headerIconWrapper}
              onPress={() => navigation.navigate("HistorialEntregas")}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="time-outline" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalExternas}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statWithDot}>
                <View style={[styles.dot, { backgroundColor: "#60A5FA" }]} />
                <Text style={styles.statValue}>{enEntrega}</Text>
              </View>
              <Text style={styles.statLabel}>En entrega</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.statWithDot}>
                <View style={[styles.dot, { backgroundColor: "#4ADE80" }]} />
                <Text style={styles.statValue}>{entregadas}</Text>
              </View>
              <Text style={styles.statLabel}>Entregadas</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color="#9CA3AF" />
          <TextInput
            placeholder="Buscar cliente, ciudad o dirección..."
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

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}
        >
          {ESTADOS_FILTRO.map((e) => {
            const activo = estadoFiltro === e.key;
            const count = conteoEstados[e.key] ?? 0;
            return (
              <TouchableOpacity
                key={e.key}
                style={[styles.chip, activo && styles.chipActivo]}
                onPress={() => setEstadoFiltro(e.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, activo && styles.chipTextActivo]}>
                  {e.label}
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
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {!loading && ciudades.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.ciudadesScroll}
          >
            <TouchableOpacity
              style={[
                styles.ciudadChip,
                ciudadFiltro === "todas" && styles.ciudadChipActivo,
              ]}
              onPress={() => setCiudadFiltro("todas")}
              activeOpacity={0.8}
            >
              <Ionicons
                name="globe-outline"
                size={13}
                color={ciudadFiltro === "todas" ? "#B90F0F" : "#6B7280"}
              />
              <Text
                style={[
                  styles.ciudadChipText,
                  ciudadFiltro === "todas" && styles.ciudadChipTextActivo,
                ]}
              >
                Todas las ciudades
              </Text>
            </TouchableOpacity>

            {ciudades.map((ciudad) => {
              const activo = ciudadFiltro === ciudad;
              return (
                <TouchableOpacity
                  key={ciudad}
                  style={[styles.ciudadChip, activo && styles.ciudadChipActivo]}
                  onPress={() => setCiudadFiltro(ciudad)}
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="location-outline"
                    size={13}
                    color={activo ? "#B90F0F" : "#6B7280"}
                  />
                  <Text
                    style={[
                      styles.ciudadChipText,
                      activo && styles.ciudadChipTextActivo,
                    ]}
                  >
                    {ciudad}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}

        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#B90F0F" />
            <Text style={styles.loadingText}>Cargando envíos externos...</Text>
          </View>
        )}

        {!loading && filtradas.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="airplane-outline" size={48} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>Sin distribuciones</Text>
            <Text style={styles.emptyText}>
              {distribucionesActivas.length === 0
                ? "Aún no hay envíos fuera de Bogotá"
                : "No se encontraron envíos con esos filtros"}
            </Text>
          </View>
        )}

        {!loading && filtradas.length > 0 && (
          <View style={styles.counterContainer}>
            <Text style={styles.counterText}>
              {filtradas.length}{" "}
              {filtradas.length === 1 ? "resultado" : "resultados"}
            </Text>
          </View>
        )}

        {!loading &&
          filtradas.map((d) => {
            const est = getEstadoConfig(d.estado);
            const cliente = d.pedido?.cliente?.nombre || "Cliente";
            const ciudad = d.pedido?.ciudad_envio || "Sin ciudad";
            const direccion = d.pedido?.direccion_entrega || "Sin dirección";
            const adminNombre = d.repartidor?.nombre || "Sin asignar";
            const vehiculo = d.vehiculoRepartidor;
            const fecha = d.fechaAsignacionFormateada;

            return (
              <View key={d.id_distribucion} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {cliente.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.cardHeaderInfo}>
                    <Text style={styles.clienteNombre} numberOfLines={1}>
                      {cliente}
                    </Text>
                    <View style={styles.ciudadRow}>
                      <Ionicons name="location" size={12} color="#B90F0F" />
                      <Text style={styles.ciudadText}>{ciudad}</Text>
                    </View>
                  </View>
                  <View
                    style={[styles.estadoBadge, { backgroundColor: est.bg }]}
                  >
                    <Ionicons name={est.icon} size={12} color={est.color} />
                    <Text style={[styles.estadoTexto, { color: est.color }]}>
                      {est.label}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoBlock}>
                  <View style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                      <Ionicons
                        name="navigate-outline"
                        size={14}
                        color="#6B7280"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoLabel}>Dirección de entrega</Text>
                      <Text style={styles.infoValue} numberOfLines={2}>
                        {direccion}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                      <Ionicons
                        name="person-outline"
                        size={14}
                        color="#6B7280"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoLabel}>Asignado a</Text>
                      <Text style={styles.infoValue}>{adminNombre}</Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                      <Ionicons name="car-outline" size={14} color="#6B7280" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoLabel}>Vehículo</Text>
                      <Text
                        style={[
                          styles.infoValue,
                          vehiculo === "N/A" && styles.infoValueMuted,
                        ]}
                      >
                        {vehiculo}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <View style={styles.infoIcon}>
                      <Ionicons
                        name="calendar-outline"
                        size={14}
                        color="#6B7280"
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.infoLabel}>Fecha de asignación</Text>
                      <Text style={styles.infoValue}>{fecha}</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.detalles}
                  activeOpacity={0.7}
                  onPress={() =>
                    navigation.navigate("DetalleEntrega", {
                      id_distribucion: d.id_distribucion,
                    })
                  }
                >
                  <Text style={styles.detallesText}>Ver detalles</Text>
                  <Ionicons name="arrow-forward" size={14} color="#B90F0F" />
                </TouchableOpacity>
              </View>
            );
          })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  scrollContent: { paddingBottom: 20 },

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
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#FFF" },
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
  statItem: { flex: 1, alignItems: "center" },
  statWithDot: { flexDirection: "row", alignItems: "center", gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statValue: { fontSize: 20, fontWeight: "700", color: "#FFF" },
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
  searchInput: { flex: 1, fontSize: 14, color: "#111827", paddingVertical: 0 },

  chipsScroll: { paddingHorizontal: 16, paddingTop: 12, gap: 8 },
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
    marginRight: 8,
  },
  chipActivo: { backgroundColor: "#B90F0F", borderColor: "#B90F0F" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  chipTextActivo: { color: "#FFF" },
  chipBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  chipBadgeActivo: { backgroundColor: "rgba(255,255,255,0.25)" },
  chipBadgeText: { fontSize: 11, fontWeight: "700", color: "#6B7280" },
  chipBadgeTextActivo: { color: "#FFF" },

  ciudadesScroll: { paddingHorizontal: 16, paddingTop: 10, gap: 8 },
  ciudadChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 5,
    marginRight: 8,
  },
  ciudadChipActivo: { backgroundColor: "#FEF2F2", borderColor: "#FECACA" },
  ciudadChipText: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  ciudadChipTextActivo: { color: "#B90F0F" },

  counterContainer: { paddingHorizontal: 16, paddingTop: 14 },
  counterText: { fontSize: 12, color: "#6B7280", fontWeight: "500" },

  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
    fontSize: 14,
  },

  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 0,
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
    marginBottom: 14,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarText: { color: "#B90F0F", fontSize: 16, fontWeight: "700" },
  cardHeaderInfo: { flex: 1 },
  clienteNombre: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 3,
  },
  ciudadRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  ciudadText: { fontSize: 12, color: "#B90F0F", fontWeight: "600" },
  estadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  estadoTexto: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },

  infoBlock: { gap: 12 },
  infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  infoIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  infoLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  infoValue: { fontSize: 13, color: "#111827", fontWeight: "500" },
  infoValueMuted: { color: "#9CA3AF", fontStyle: "italic" },

  detalles: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#FFF5F5",
    gap: 6,
  },
  detallesText: { fontSize: 13, fontWeight: "700", color: "#B90F0F" },

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
});