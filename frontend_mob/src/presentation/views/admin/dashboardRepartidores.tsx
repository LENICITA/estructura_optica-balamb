import React, {useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from '@react-native-picker/picker';
import api from "../../../services/api";

interface Repartidor {
    id: number;
    nombre: string;
    estado: string;
    pedidos?: number;
    correo?: string;
    telefono?: string;
    ciudad?: string;
}

export default function dashboardRepartidores() {
    const [repartidores, setRepartidores] = useState<Repartidor[]>([]);
    const [loading, setLoading] = useState(true);
    const [buscar, setBuscar] = useState("");
    const [estado, setEstado] = useState("Activo");
    const [seleccionado, setSeleccionado] = useState<Repartidor | null>(null);

    useEffect(() => {
        const cargarRepartidores = async () => {
            try {
                const response = await api.get('/usuarios/repartidores');

                const repartidores = response.data.data.map((r: any) => ({
                    id: r.id_usuario,
                    nombre: r.nombre_completo,
                    estado: r.estado,
                    correo: r.email,
                    telefono: r.telefono,
                    ciudad: r.ciudad,
                    pedidos: r.pedidos_count // Asegúrate de que este campo exista en la respuesta de tu API
                }));

                setRepartidores(repartidores);
            } catch (error) {
                console.error("Error al cargar repartidores:", error);
            } finally {
                setLoading(false);
            }
        };
        cargarRepartidores();
    }, []);

    const filtrarRepartidores = repartidores.filter((repartidor) =>
        repartidor.nombre.toLowerCase().includes(buscar.toLowerCase())
    );


    return (
        <TouchableWithoutFeedback onPress={() => {
            Keyboard.dismiss();
            setSeleccionado(null);
        }}
        >
            <SafeAreaView style={styles.container}>
                <Text style={styles.titulo}>Gestion de Repartidores</Text>

                <TouchableOpacity style={styles.boton} onPress={() => {}}>
                    <Text style={styles.textoBoton}>Agregar Repartidor +</Text>
                </TouchableOpacity>

                <Text style={styles.subtitulo}>
                    Total: {filtrarRepartidores.length} repartidores
                </Text>

                <TextInput
                    placeholder="Buscar repartidor"
                    value={buscar}
                    onChangeText={setBuscar}
                    style={styles.input}
                />

                <FlatList
                    data={filtrarRepartidores}
                    keyExtractor={(item) => item.id.toString()}
                    style={{ maxHeight: 500 }}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.card,
                                seleccionado?.id === item.id && styles.cardSeleccionada,
                            ]}
                            onPress={() => {
                                setSeleccionado(item);
                                setEstado(item.estado);
                            }}
                        >
                            <Text style={styles.nombre}>{item.nombre}</Text>

                            <Text style={styles.estado}> Estado: {item.estado}</Text>

                            <Text style={styles.pedidos}> Pedidos: {item.pedidos}</Text>
                        </TouchableOpacity>
                    )}
                />

                {seleccionado && (
                    <View style={styles.detalle}>

                        <Text style={styles.detalleTitulo}>Detalles del Repartidor</Text>

                        <Text>Nombre: {seleccionado.nombre}</Text>
                    
                        <Text>Correo: {seleccionado.correo}</Text>
                    
                        <Text>Teléfono: {seleccionado.telefono}</Text>
                    
                        <Text>Ciudad: {seleccionado.ciudad}</Text>

                        <Text style={{ marginTop: 15 }}>
                            Estado
                        </Text>

                        <Picker
                            selectedValue={estado}
                            onValueChange={(value) => setEstado(value)}
                        >
                            <Picker.Item label="Activo" value="ACTIVO" />
                            <Picker.Item label="Inactivo" value="INACTIVO" />
                            <Picker.Item label="Suspendido" value="SUSPENDIDO" />
                        </Picker>

                        <TouchableOpacity style={styles.boton}>
                            <Text style={styles.textoBoton}>
                                Guardar cambios
                            </Text>
                        </TouchableOpacity>
                    </View>
            )}
        </SafeAreaView>
    </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F4F6",
        padding: 20,
    },
    titulo: {
        textAlign: "center",
        fontSize: 28,
        fontWeight: "bold",
        color: "#B90F0F",
        marginBottom: 5,
    },
    subtitulo: {
        color: "#666",
        marginBottom: 15,
    },
    input: {
        backgroundColor: "#FFF",
        borderRadius: 10,
        paddingHorizontal: 15,
        paddingVertical: 12,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#DDD",
    },
    card: {
        backgroundColor: "#FFF",
        padding: 18,
        borderRadius: 15,
        marginBottom: 12,
        elevation: 4,
    },
    cardSeleccionada: {
        borderWidth: 2,
        borderColor: "#B90F0F",
    },
    nombre: {
        fontSize: 18,
        fontWeight: "bold",
    },
    estado: {
        marginTop: 5,
        color: "#22C55E",
    },
    pedidos: {
        marginTop: 3,
        color: "#666",
    },
    detalle: {
        marginTop: 20,
        backgroundColor: "#FFF",
        padding: 20,
        borderRadius: 15,
        elevation: 5,
    },
    detalleTitulo: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 15,
    },
    boton: {
        backgroundColor: "#B90F0F",
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 20,
        marginBottom: 20,
    },
    textoBoton: {
        color: "#FFF",
        fontWeight: "bold",
        fontSize: 16,
    },
});