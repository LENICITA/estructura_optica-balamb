import { COLORS } from '@/shared';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState, useRef } from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Text,
    View,
    Image,
    TextInput,
    Modal,
    Dimensions,
    PanResponder,
    Animated,
    Alert,
} from 'react-native'
import { Ionicons} from '@expo/vector-icons';

import { FormulaController } from '@/core/controllers/FormulaController';
import { FormulaModel } from '@/core/models/FormulaModel';

const { width, height } = Dimensions.get('window');

export const DetalleFormula = () => {

    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const { id_formula } = route.params ?? {};

    const [formula, setFormula] = useState<FormulaModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [costo, setCosto] = useState('');
    const [editandoCosto, setEditandoCosto] = useState(false);

    const [imagenModalVisible, setImagenModalVisible] = useState(false);
    const scale = useRef(new Animated.Value(1)).current;
    const lastScale = useRef(1);

    const formulaController = new FormulaController();

    useEffect(() => {
        cargarFormula();
    }, [id_formula]);

    const cargarFormula = async () => {
        try {
            setLoading(true);

            if (!id_formula) {
                console.error('No se recibió el ID de la fórmula');
                return;
            }

            const resultado = await formulaController.getFormulaById(Number(id_formula));

            if (resultado) {
                setFormula(resultado);
                if (resultado.costo) {
                    setCosto(resultado.costo.toString());
                }
            } else {
                console.error('No se encontró la fórmula');
            }

        } catch (error) {
            console.error('Error cargando fórmula:', error);
        } finally {
            setLoading(false);
        }
    };

const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const { dy } = gestureState;
      const newScale = lastScale.current + (dy * 0.01);
      if (newScale >= 0.5 && newScale <= 3) {
        scale.setValue(newScale);
      }
    },
    onPanResponderRelease: () => {
      lastScale.current = scale._value;
    },
  });

  const abrirImagen = () => {
    setImagenModalVisible(true);
    scale.setValue(1);
    lastScale.current = 1;
  };

  const cerrarImagen = () => {
    setImagenModalVisible(false);
    scale.setValue(1);
    lastScale.current = 1;
  };


    const cambiarCosto = async () => {
        try {
            if (formula?.estado === 'Rechazado') {
               console.error('No se puede asignar precio a una fórmula rechazada');
               alert('No se puede asignar precio a una fórmula rechazada');
            return;
            }
            setLoading(true);

            if (!id_formula) {
                console.error('No se encontro id de formula');
                return;
            }

            if (!costo.trim()) {
                console.error('No se ingreso el costo de la formula');
                return;
            }

            const resultadoCosto = await formulaController.actualizarCostoFormula(
                Number(id_formula),
                Number(costo),
            );

            if (resultadoCosto.success) {
                if (formula?.estado === 'Pendiente') {
                const resultadoEstado = await formulaController.actualizarEstadoFormula(
                    Number(id_formula),
                    'Aprobado'
                );

                if (resultadoEstado.success) {
                    setCosto('');
                    await cargarFormula();
                    setEditandoCosto(false);
                    console.log('Fórmula aprobada exitosamente');
                } else {
                    console.error('Error al aprobar la fórmula:', resultadoEstado.message);
                }
                } else {
                    await cargarFormula();
                    setEditandoCosto(false);
                    console.log('Costo actualizado exitosamente');
                }
            } else {
                console.error(resultadoCosto.message);
            }
        } catch (error) {
            console.error('Error al cargar valor de formula', error);
        } finally {
            setLoading(false)
        }
    };

    const handleEditarCosto = () => {
        if (formula?.estado === 'Aprobado') {
            Alert.alert(
                'Modificar Precio',
                '¿Está seguro que desea modificar el precio de esta fórmula?',
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel',
                    },
                    {
                        text: 'Modificar',
                        onPress: () => setEditandoCosto(true),
                        style: 'default',
                    },
                ],
                { cancelable: false }
            );
        } else {
            setEditandoCosto(true);
        }
    };

    const cancelarEdicion = () => {
        setEditandoCosto(false);
        if (formula?.costo) {
            setCosto(formula.costo.toString());
        } else {
            setCosto('');
        }
    };

    const renderCostoSection = () => {

        if (formula?.estado === 'Rechazado') {
                return (
                    <View style={styles.rechazadoContainer}>
                        <Ionicons name="close-circle-outline" size={24} color="#DC2626" />
                        <Text style={styles.rechazadoTexto}>Fórmula Rechazada - No se puede asignar precio</Text>
                    </View>
                );
            }

        if (formula?.estado === 'Aprobado' && !editandoCosto) {
                    return (
                        <View style={styles.costoContainer}>
                            <View style={styles.costoDisplay}>
                                <Text style={styles.costoTexto}>${formula.costo}</Text>
                                <Text style={styles.costoEstado}>Aprobado</Text>
                            </View>
                            <TouchableOpacity
                                style={styles.botonEditarCosto}
                                onPress={handleEditarCosto}
                            >
                                <Ionicons name="pencil-outline" size={20} color="#2563EB" />
                                <Text style={styles.textoEditarCosto}>Modificar</Text>
                            </TouchableOpacity>
                        </View>
                    );
                }

        return (
                    <>
                        <Text style={styles.sinCosto}>
                            {formula?.estado === 'Pendiente' ? 'Pendiente de asignar costo' : 'Sin costo asignado'}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Ingrese el costo"
                            keyboardType="numeric"
                            value={costo}
                            onChangeText={setCosto}
                        />
                        <View style={styles.botonesContainer}>
                            <TouchableOpacity style={styles.botonEdit} onPress={cambiarCosto}>
                                <Ionicons name="create-outline" size={20} color="#FFF" />
                                <Text style={styles.textoEdit}>
                                    {formula?.estado === 'Aprobado' ? 'Actualizar Precio' : 'Asignar y Aprobar'}
                                </Text>
                            </TouchableOpacity>
                            {editandoCosto && (
                                <TouchableOpacity style={styles.botonCancelar} onPress={cancelarEdicion}>
                                    <Ionicons name="close-outline" size={20} color="#FFF" />
                                    <Text style={styles.textoCancelar}>Cancelar</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </>
                );
            };

    return (
        <>
        <ScrollView 
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            <TouchableOpacity
                style={styles.botonVolver}
                onPress={() => navigation.goBack()}
            >
                <Ionicons name="arrow-back-outline" size={20} color={COLORS.primary} />
                <Text style={styles.textBoton}>Volver</Text>
            </TouchableOpacity>

            <View style={styles.card}>
                <View style={styles.headerCard}>
                    <Ionicons name="document-outline" size={28} color={COLORS.primary} style={styles.iconCard}/>
                    <Text>Datos de la formula #{id_formula}</Text>

                </View>
                <View>
                    <TouchableOpacity
                        style={styles.imagenContainer}
                        onPress={abrirImagen}
                        activeOpacity={0.9}
                    >
                        <Image
                            source={{uri: formula?.imagen_formula}}
                            style={styles.imagen}
                            resizeMode="contain"
                        />
                        <View style={styles.zoomHint}>
                            <Ionicons name="expand-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.zoomHintText}>Toca para ampliar</Text>
                        </View>
                    </TouchableOpacity>
                    <View style={styles.datoFormula}>
                        <Text style={styles.titulo}>Condición:</Text>
                        <Text style={styles.texto}>{formula?.condicion}</Text>
                    </View>

                    <View style={styles.datoFormula}>
                        <Text style={styles.titulo}>Observación:</Text>
                        <Text style={styles.texto}>{formula?.observaciones}</Text>
                    </View>

                    <View style={styles.datoFormula}>
                        <Text style={styles.titulo}>Fecha:</Text>
                        <Text style={styles.texto}>{formula?.fecha_creacion}</Text>
                    </View>

                    <View style={styles.datoFormula}>
                        <Text style={styles.titulo}>Costo:</Text>
                        {renderCostoSection()}
                    </View>
                </View>
            </View>
        </ScrollView>

        <Modal
                visible={imagenModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={cerrarImagen}
              >
                <View style={styles.modalContainer}>
                  <TouchableOpacity style={styles.modalCloseButton} onPress={cerrarImagen}>
                    <Ionicons name="close-circle" size={40} color="#FFFFFF" />
                  </TouchableOpacity>

                  <Animated.View
                    style={[styles.modalImageContainer, { transform: [{ scale }] }]}
                    {...panResponder.panHandlers}
                  >
                    <Image
                      source={{ uri: formula?.imagen_formula }}
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                  </Animated.View>

                  <View style={styles.modalHint}>
                    <Ionicons name="hand-left-outline" size={20} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.modalHintText}>Desliza para acercar/alejar</Text>
                  </View>
                </View>
              </Modal>
               </>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F3F4F6",
        padding: 16,
    },
    contentContainer: {
        paddingBottom: 40,
    },
    botonVolver: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 12,
        paddingVertical: 8,
        paddingHorizontal: 4,
    },
    textBoton: {
        color: COLORS.primary,
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
        shadowColor: COLORS.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
    },
    iconCard: {
        padding: 5,
    },
    headerCard: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    datoFormula: {
        marginBottom: 18,
    },
    cardInfo: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    info: {
        alignItems: 'center',
        padding: 15,
    },
    textInfo: {
        color: COLORS.gray,
    },
    textInfo2: {
        color: COLORS.black,
        fontWeight: 'bold',
    },
    imagenContainer: {
        width: "100%",
        height: 450,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 15,
    },
    imagen: {
        width: "100%",
        height: "100%",
        resizeMode: "contain",
    },
    titulo: {
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 5,
    },
    texto: {
        marginBottom: 5,
    },
    costoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E8F5E9',
        padding: 12,
        borderRadius: 8,
        marginTop: 4,
        justifyContent: 'space-between',
    },
    costoTexto: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2E7D32',
        marginLeft: 8,
    },
    sinCosto: {
        color: '#F44336',
        fontStyle: 'italic',
        marginBottom: 8,
        fontSize: 14,
    },
    input: {
        marginTop: 5,
        marginBottom: 6,
        width: "98%",
        height: 50,
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        paddingHorizontal: 15,
        alignSelf: "center",
    },
    botonEdit: {
        backgroundColor: "#B90F0F",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4,
        marginBottom: 5,
        flexDirection: "row",
        gap: 10,
        elevation: 3,
        shadowColor: "#B90F0F",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        flex: 1,
    },
    textoEdit: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
  rechazadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
    gap: 8,
  },
  rechazadoTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
  },
  zoomHint: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  zoomHintText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  modalImageContainer: {
    width: width * 0.9,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalHint: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalHintText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
costoDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    costoEstado: {
        fontSize: 12,
        color: '#2E7D32',
        backgroundColor: '#C8E6C9',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
    },
    botonEditarCosto: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        gap: 4,
    },
    textoEditarCosto: {
        color: '#2563EB',
        fontSize: 12,
        fontWeight: '600',
    },
    botonesContainer: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 4,
    },
    botonCancelar: {
        backgroundColor: "#6B7280",
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4,
        marginBottom: 5,
        flexDirection: "row",
        gap: 10,
        elevation: 3,
        shadowColor: "#6B7280",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        flex: 1,
    },
    textoCancelar: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
})