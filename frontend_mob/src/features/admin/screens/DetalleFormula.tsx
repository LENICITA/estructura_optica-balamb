import { COLORS } from '@/shared';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    Text,
    View,
    Image,
    TextInput
} from 'react-native'
import { Ionicons} from '@expo/vector-icons';

import { FormulaController } from '@/core/controllers/FormulaController';
import { FormulaModel } from '@/core/models/FormulaModel';

export const DetalleFormula = () => {

    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const { id_formula } = route.params ?? {};

    const [formula, setFormula] = useState<FormulaModel | null>(null);
    const [loading, setLoading] = useState(true);
    const [costo, setCosto] = useState('');

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
            } else {
                console.error('No se encontró la fórmula');
            }

        } catch (error) {
            console.error('Error cargando fórmula:', error);
        } finally {
            setLoading(false);
        }
    };

    const cambiarCosto = async () => {
        try {
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
                const resultadoEstado = await formulaController.actualizarEstadoFormula(
                    Number(id_formula),
                    'Aprobado'
                );

                if (resultadoEstado.success) {
                    setCosto('');
                    await cargarFormula();
                    console.log('Fórmula aprobada exitosamente');
                } else {
                    console.error('Error al aprobar la fórmula:', resultadoEstado.message);
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

    const renderCostoSection = () => {
        const tieneCosto = formula?.costo !== undefined && 
                           formula?.costo !== null && 
                           formula?.costo > 0;

        if (tieneCosto) {
            return (
                <View style={styles.costoContainer}>
                    <Text style={styles.costoTexto}>${formula.costo}</Text>
                </View>
            );
        }

        return (
            <>
                <Text style={styles.sinCosto}>Sin costo asignado</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Ingrese el costo"
                    keyboardType="numeric"
                    value={costo}
                    onChangeText={setCosto}
                />
                <TouchableOpacity style={styles.botonEdit} onPress={cambiarCosto}>
                    <Ionicons name="create-outline" size={20} color="#FFF" />
                    <Text style={styles.textoEdit}>Asignar Valor</Text>
                </TouchableOpacity>
            </>
        );
    };

    return (
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
                    <View style={styles.imagenContainer}>
                        <Image
                            source={{uri: formula?.imagen_formula}}
                            style={styles.imagen}
                        />
                    </View>
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
    },
    textoEdit: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "700",
    },
})