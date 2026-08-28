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

export const DetalleFormulaCliente = () => {


    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    const { id_formula } = route.params ?? {};

    const [formula, setFormula] = useState<FormulaModel | null>(null);
    const [loading, setLoading] = useState(true);

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
                    <Text>Datos de la formula</Text>
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
                        <Text style={styles.texto}>{formula?.costo}</Text>
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