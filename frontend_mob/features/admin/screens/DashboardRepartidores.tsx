import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  useNavigation,
  NavigationProp,
  useFocusEffect,
} from "@react-navigation/native";

import { UserController } from "../../../core/controllers/UserController";

// ============================================
// TIPOS DE NAVEGACIÓN
// ============================================

type RootStackParamList = {
  DetalleRepartidor: {
    id: number;
  };

  EditarRepartidor: {
    repartidorId: number;
    repartidorData: Repartidor;
  };

  RegistrarRepartidor: undefined;
};

// ============================================
// MODELO DEL REPARTIDOR
// ============================================

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

// ============================================
// SCREEN
// ============================================

export default function DashboardRepartidores() {
  const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState("");
  const [seleccionado, setSeleccionado] =
    useState<Repartidor | null>(null);
  const [filtro, setFiltro] = useState("todos");

  const navigation =
    useNavigation<NavigationProp<RootStackParamList>>();

  // ============================================
  // CONTROLLER
  // ============================================

  const userController = new UserController();

  // ============================================
  // CARGAR REPARTIDORES
  // ============================================

  useFocusEffect(
    useCallback(() => {
      const cargarRepartidores = async () => {
        try {
          setLoading(true);

          const data = await userController.getRepartidores();

          console.log(
            "REPARTIDORES RECIBIDOS:",
            JSON.stringify(data, null, 2)
          );

          const repartidoresMapeados: Repartidor[] = data.map(
            (r: any) => ({
              id: r.id_usuario || r.id || 0,

              nombre:
                r.nombre_completo ||
                r.nombre ||
                "Sin nombre",

              estado:
                r.estado ||
                "INACTIVO",

              correo:
                r.email ||
                r.correo ||
                "",

              telefono:
                r.telefono ||
                "",

              ciudad:
                r.ciudad ||
                "",

              pedidos:
                r.pedidos ||
                0,

              fecha_registro:
                r.fecha_registro ||
                new Date().toISOString(),
            })
          );

          setRepartidores(repartidoresMapeados);
        } catch (error) {
          console.error(
            "Error al cargar repartidores:",
            error
          );

          Alert.alert(
            "Error",
            "No se pudieron cargar los repartidores."
          );
        } finally {
          setLoading(false);
        }
      };

      cargarRepartidores();
    }, [])
  );

  // ============================================
  // ELIMINAR REPARTIDOR
  // ============================================

  const eliminarRepartidor = (item: Repartidor) => {
    Alert.alert(
      "Eliminar Repartidor",
      `¿Estás seguro de eliminar a "${item.nombre}"?\n\nEsta acción no se puede deshacer.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Eliminar",
          style: "destructive",

          onPress: async () => {
            try {
              const response =
                await userController.eliminarRepartidor(
                  item.id
                );

              if (!response.success) {
                Alert.alert(
                  "Error",
                  response.message ||
                    "No se pudo eliminar el repartidor."
                );

                return;
              }

              setRepartidores((prev) =>
                prev.filter(
                  (r) => r.id !== item.id
                )
              );

              Alert.alert(
                "Eliminado",
                `El repartidor "${item.nombre}" fue eliminado correctamente.`
              );
            } catch (error) {
              console.error(
                "Error al eliminar repartidor:",
                error
              );

              Alert.alert(
                "Error",
                "No se pudo eliminar el repartidor."
              );
            }
          },
        },
      ],
      {
        cancelable: false,
      }
    );
  };

  // ============================================
  // FILTRAR REPARTIDORES
  // ============================================

  const filtrarRepartidores =
    repartidores.filter((repartidor) => {
      const cumpleFiltro =
        filtro === "todos" ||
        repartidor.estado === filtro;

      const cumpleBusqueda =
        repartidor.nombre
          .toLowerCase()
          .includes(buscar.toLowerCase());

      return (
        cumpleFiltro &&
        cumpleBusqueda
      );
    });

  // ============================================
  // CANTIDADES
  // ============================================

  const cantidadActivos =
    repartidores.filter(
      (r) => r.estado === "ACTIVO"
    ).length;

  const cantidadInactivos =
    repartidores.filter(
      (r) => r.estado === "INACTIVO"
    ).length;

  // ============================================
  // RETURN
  // ============================================

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        Keyboard.dismiss();
        setSeleccionado(null);
      }}
    >
      <SafeAreaView style={styles.container}>

        {/* ====================================== */}
        {/* TÍTULO */}
        {/* ====================================== */}

        <Text style={styles.titulo}>
          Gestión de Repartidores
        </Text>

        <Text style={styles.subtitulo}>
          Administra el equipo de entregas
        </Text>

        {/* ====================================== */}
        {/* CARDS DE ESTADÍSTICAS */}
        {/* ====================================== */}

        <View style={styles.cardContainer}>

          <View
            style={[
              styles.cardInfo,
              styles.cardTotal,
            ]}
          >
            <View style={styles.iconWrapper}>
              <Ionicons
                name="people-outline"
                size={24}
                color="#B90F0F"
              />
            </View>

            <Text style={styles.cardNumero}>
              {repartidores.length}
            </Text>

            <Text style={styles.cardLabel}>
              Repartidores
            </Text>
          </View>

          <View
            style={[
              styles.cardInfo,
              styles.cardActivos,
            ]}
          >
            <View style={styles.checkCircle}>
              <Ionicons
                name="checkmark"
                size={16}
                color="white"
              />
            </View>

            <Text style={styles.cardNumero}>
              {cantidadActivos}
            </Text>

            <Text style={styles.cardLabel}>
              Activos
            </Text>
          </View>

          <View
            style={[
              styles.cardInfo,
              styles.cardInactivos,
            ]}
          >
            <View style={styles.circleIcon}>
              <View
                style={styles.verticalLine}
              />

              <View
                style={styles.verticalLine}
              />
            </View>

            <Text style={styles.cardNumero}>
              {cantidadInactivos}
            </Text>

            <Text style={styles.cardLabel}>
              Inactivos
            </Text>
          </View>

        </View>

        {/* ====================================== */}
        {/* BUSCADOR */}
        {/* ====================================== */}

        <View style={styles.searchContainer}>

          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={{ marginRight: 10 }}
          />

          <TextInput
            placeholder="Buscar repartidor"
            placeholderTextColor="#999"
            value={buscar}
            onChangeText={setBuscar}
            style={styles.searchInput}
          />

          {buscar !== "" && (
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

        {/* ====================================== */}
        {/* FILTROS */}
        {/* ====================================== */}

        <View style={styles.filtroContainer}>

          <TouchableOpacity
            style={[
              styles.cardFiltro,
              filtro === "todos" &&
                styles.botonSeleccionado,
            ]}
            onPress={() =>
              setFiltro("todos")
            }
          >
            <Text
              style={[
                styles.textoFiltro,
                filtro === "todos" &&
                  styles.textoSeleccionado,
              ]}
            >
              Todos ({repartidores.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cardFiltro,
              filtro === "ACTIVO" &&
                styles.botonSeleccionado,
            ]}
            onPress={() =>
              setFiltro("ACTIVO")
            }
          >
            <Text
              style={[
                styles.textoFiltro,
                filtro === "ACTIVO" &&
                  styles.textoSeleccionado,
              ]}
            >
              Activos ({cantidadActivos})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.cardFiltro,
              filtro === "INACTIVO" &&
                styles.botonSeleccionado,
            ]}
            onPress={() =>
              setFiltro("INACTIVO")
            }
          >
            <Text
              style={[
                styles.textoFiltro,
                filtro === "INACTIVO" &&
                  styles.textoSeleccionado,
              ]}
            >
              Inactivos ({cantidadInactivos})
            </Text>
          </TouchableOpacity>

        </View>

        {/* ====================================== */}
        {/* LISTA */}
        {/* ====================================== */}

        <FlatList
          data={filtrarRepartidores}
          keyExtractor={(item) =>
            item.id.toString()
          }
          style={{
            marginBottom: 5,
          }}
          showsVerticalScrollIndicator={true}
          refreshing={loading}
          renderItem={({ item }) => (

            <TouchableWithoutFeedback>

              <View style={styles.card}>

                {/* ================================= */}
                {/* ENCABEZADO */}
                {/* ================================= */}

                <View
                  style={styles.headerCard}
                >

                  {/* AVATAR */}

                  <View style={styles.avatar}>

                    <Ionicons
                      name="person"
                      size={22}
                      color="#B90F0F"
                    />

                  </View>

                  {/* INFORMACIÓN */}

                  <View
                    style={
                      styles.infoPrincipal
                    }
                  >

                    {/* NOMBRE + ESTADO */}

                    <View
                      style={styles.nombreRow}
                    >

                      <Text
                        style={styles.nombre}
                      >
                        {item.nombre}
                      </Text>

                      <View
                        style={[
                          styles.estadoBadge,

                          item.estado ===
                            "ACTIVO"
                            ? styles.estadoActivo
                            : styles.estadoInactivo,
                        ]}
                      >

                        <View
                          style={[
                            styles.estadoDot,

                            item.estado ===
                              "ACTIVO"
                              ? styles.dotVerde
                              : styles.dotRojo,
                          ]}
                        />

                        <Text
                          style={[
                            styles.estadoTexto,

                            item.estado ===
                              "ACTIVO"
                              ? styles.estadoTextoActivo
                              : styles.estadoTextoInactivo,
                          ]}
                        >
                          {item.estado}
                        </Text>

                      </View>

                    </View>

                    {/* TELÉFONO */}

                    <View
                      style={styles.infoRow}
                    >

                      <Ionicons
                        name="call-outline"
                        size={13}
                        color="#888"
                      />

                      <Text
                        style={styles.infoText}
                      >
                        {item.telefono ||
                          "No disponible"}
                      </Text>

                    </View>

                    {/* CORREO */}

                    <View
                      style={styles.infoRow}
                    >

                      <Ionicons
                        name="mail-outline"
                        size={13}
                        color="#888"
                      />

                      <Text
                        style={styles.infoText}
                      >
                        {item.correo ||
                          "No disponible"}
                      </Text>

                    </View>

                    {/* CIUDAD */}

                    <View
                      style={styles.infoRow}
                    >

                      <Ionicons
                        name="location-outline"
                        size={14}
                        color="#888"
                      />

                      <Text
                        style={styles.infoText}
                      >
                        {item.ciudad ||
                          "No especificada"}
                      </Text>

                    </View>

                  </View>

                  {/* ================================= */}
                  {/* MENÚ DE TRES PUNTOS */}
                  {/* ================================= */}

                  <TouchableOpacity
                    style={styles.menuButton}
                    onPress={() => {

                      Alert.alert(
                        "Eliminar repartidor",
                        `¿Deseas eliminar a ${item.nombre}?`,
                        [
                          {
                            text: "Cancelar",
                            style: "cancel",
                          },
                          {
                            text: "Eliminar",
                            style: "destructive",
                            onPress: () =>
                              eliminarRepartidor(
                                item
                              ),
                          },
                        ]
                      );

                    }}
                  >

                    <Ionicons
                      name="ellipsis-vertical"
                      size={20}
                      color="#888"
                    />

                  </TouchableOpacity>

                </View>

                {/* ================================= */}
                {/* RESUMEN */}
                {/* ================================= */}

                <View
                  style={styles.resumen}
                >

                  <View
                    style={styles.resumenItem}
                  >

                    <Ionicons
                      name="cube-outline"
                      size={17}
                      color="#B90F0F"
                    />

                    <Text
                      style={
                        styles.resumenText
                      }
                    >
                      {item.pedidos || 0}{" "}
                      pedidos asignados
                    </Text>

                  </View>

                  <View
                    style={styles.divisor}
                  />

                  <View
                    style={styles.resumenItem}
                  >

                    <Ionicons
                      name="calendar-outline"
                      size={17}
                      color="#B90F0F"
                    />

                    <Text
                      style={
                        styles.resumenText
                      }
                    >
                      Último pedido
                    </Text>

                  </View>

                </View>

                {/* ================================= */}
                {/* DETALLES */}
                {/* ================================= */}

                <TouchableOpacity
                  style={styles.detalles}
                  onPress={() => {

                    navigation.navigate(
                      "DetalleRepartidor",
                      {
                        id: item.id,
                      }
                    );

                  }}
                >

                  <Text
                    style={
                      styles.detallesText
                    }
                  >
                    Ver detalles →
                  </Text>

                </TouchableOpacity>

              </View>

            </TouchableWithoutFeedback>
          )}
        />

        {/* ====================================== */}
        {/* BOTÓN FLOTANTE */}
        {/* ====================================== */}

        <View
          style={
            styles.containerFlotante
          }
        >

          <TouchableOpacity
            style={styles.botonFlotante}
            onPress={() => {

              navigation.navigate(
                "RegistrarRepartidor"
              );

            }}
          >

            <Text style={styles.plus}>
              +
            </Text>

          </TouchableOpacity>

          <Text
            style={styles.textoFlotante}
          >
            Agregar Repartidor
          </Text>

        </View>

      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

// ============================================
// ESTILOS
// ============================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 20,
  },

  titulo: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },

  subtitulo: {
    color: "#666",
    marginBottom: 15,
  },

  cardContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 2,
    marginBottom: 8,
  },

  cardInfo: {
    width: "31%",
    height: 100,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  cardTotal: {
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },

  cardActivos: {
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },

  cardInactivos: {
    borderWidth: 1,
    borderColor: "#FEE2E2",
  },

  iconWrapper: {
    marginBottom: 2,
  },

  cardNumero: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginTop: 2,
  },

  cardLabel: {
    fontSize: 11,
    color: "#888",
    marginTop: 1,
    fontWeight: "500",
  },

  checkCircle: {
    width: 32,
    height: 32,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    marginBottom: 2,
  },

  circleIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#666",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 5,
    marginBottom: 2,
  },

  verticalLine: {
    width: 1.5,
    height: 12,
    backgroundColor: "#666",
  },

  searchContainer: {
    height: 45,
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    backgroundColor: "#FFF",
    marginBottom: 10,
    marginTop: 10,
  },

  searchInput: {
    flex: 1,
    fontSize: 15,
    color: "#1A1A1A",
  },

  filtroContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  cardFiltro: {
    width: "31%",
    height: 48,
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 10,
    elevation: 2,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },

  botonSeleccionado: {
    backgroundColor: "#B90F0F",
    elevation: 4,

    shadowColor: "#B90F0F",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },

  textoFiltro: {
    color: "#B90F0F",
    fontWeight: "600",
    fontSize: 12,
  },

  textoSeleccionado: {
    color: "#FFF",
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 0,
    marginVertical: 8,
    elevation: 3,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  headerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
  },

  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },

  infoPrincipal: {
    flex: 1,
  },

  nombreRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    flexWrap: "wrap",
  },

  nombre: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginRight: 6,
  },

  estadoBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
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
    width: 5,
    height: 5,
    borderRadius: 2.5,
    marginRight: 5,
  },

  dotVerde: {
    backgroundColor: "#22C55E",
  },

  dotRojo: {
    backgroundColor: "#EF4444",
  },

  estadoTexto: {
    fontSize: 9,
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
    marginTop: 3,
  },

  infoText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 7,
  },

  menuButton: {
    padding: 4,
  },

  resumen: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    marginTop: 12,
    paddingVertical: 9,
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
    marginLeft: 5,
    fontWeight: "500",
  },

  divisor: {
    width: 1,
    height: 25,
    backgroundColor: "#E5CCCC",
  },

  detalles: {
    alignItems: "center",
    marginTop: 8,
    paddingVertical: 4,
  },

  detallesText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#B90F0F",
    letterSpacing: 0.3,
  },

  containerFlotante: {
    position: "absolute",
    right: 20,
    bottom: 25,
    alignItems: "center",
  },

  botonFlotante: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#B90F0F",
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,

    shadowColor: "#B90F0F",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  plus: {
    color: "#fff",
    fontSize: 30,
    fontWeight: "300",
    lineHeight: 34,
  },

  textoFlotante: {
    color: "#B90F0F",
    marginTop: 5,
    fontSize: 12,
    fontWeight: "600",
  },

});