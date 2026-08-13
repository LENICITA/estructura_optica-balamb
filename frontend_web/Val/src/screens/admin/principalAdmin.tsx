import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { 
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity
} from "react-native";

export default function PrincipalAdmin() {


    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.titulo}>Bienvenido, Nombre</Text>
            <Text style={styles.subtitulo}>Gestiona tu Óptica Balamb aquí</Text>

            {/* CARDS */}
            <View style={styles.cardContainer}>

                <View style={[styles.cardInfo, styles.cardTotal]}>
                    <View style={styles.headerCard}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="cube-outline" size={28} color="#B90F0F" />
                        </View>
                        <View style={styles.textContainer}>
                           <Text style={styles.titleCard}>Productos</Text>
                            <Text style={styles.numberCard}>0</Text> 
                        </View>
                        
                    </View>
                    <Text style={styles.descriptionCard}>productos registrados</Text>    
                </View>

                <View style={[styles.cardInfo, styles.cardTotal]}>
                    <View style={styles.headerCard}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="cart-outline" size={28} color="#B90F0F" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.titleCard}>Pedidos</Text>
                            <Text style={styles.numberCard}>0</Text>
                        </View>
                    </View>
                    
                    <Text style={styles.descriptionCard}>pedidos realizados</Text>
                </View>

            </View>   
            <View style={styles.cardContainer}>
                <View style={[styles.cardInfo, styles.cardTotal]}>
                    <View style={styles.headerCard}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="person-outline" size={28} color="#B90F0F" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.titleCard}>Usuarios</Text>
                            <Text style={styles.numberCard}>0</Text>
                        </View>
                    </View>
                    <Text style={styles.descriptionCard}>usuarios registrados</Text>
                </View>
                <View style={[styles.cardInfo, styles.cardTotal]}>
                    <View style={styles.headerCard}>
                        <View style={styles.iconContainer}>
                            <Ionicons name="cash-outline" size={28} color="#B90F0F" />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.titleCard}>Ventas</Text>
                            <Text style={styles.numberCard}>0</Text>
                        </View>
                    </View>
                    <Text style={styles.descriptionCard}>ventas realizadas</Text>
                </View>
            </View>

            <Text style={styles.segundoTitulo}>Acciones rápidas</Text>

            <TouchableOpacity style={styles.button}>
                <View style={styles.buttonContent}>

                    {/* Ícono izquierdo */}
                    <View style={styles.buttonLeft}>
                        <View style={styles.iconContainer2}>
                            <Ionicons name="bag-outline" size={28} color="#B90F0F" />
                        </View>
                    </View>

                    {/* Texto centrado */}
                    <View style={styles.buttonCenter}>
                        <Text style={styles.textButton}>Ver pedidos</Text>
                    </View>

                    {/* Flecha derecha */}
                    <View style={styles.buttonRight}>
                        <Ionicons
                            name="chevron-forward-outline"
                            size={20}
                            color="#B90F0F"
                        />
                    </View>

                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button}>
                <View style={styles.buttonContent}>

                    <View style={styles.buttonLeft}>
                        <View style={styles.iconContainer2}>
                            <Ionicons name="document-text-outline" size={28} color="#B90F0F" />
                        </View>
                    </View>

                    <View style={styles.buttonCenter}>
                        <Text style={styles.textButton}>Generar reporte</Text>
                    </View>

                    <View style={styles.buttonRight}>
                        <Ionicons
                            name="chevron-forward-outline"
                            size={20}
                            color="#B90F0F"
                        />
                    </View>

                </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button}>
                <View style={styles.buttonContent}>

                    <View style={styles.buttonLeft}>
                        <View style={styles.iconContainer2}>
                            <Ionicons name="calculator-outline" size={28} color="#B90F0F" />
                        </View>
                    </View>

                    <View style={styles.buttonCenter}>
                        <Text style={styles.textButton}>Gestionar formulas</Text>
                    </View>

                    <View style={styles.buttonRight}>
                        <Ionicons
                            name="chevron-forward-outline"
                            size={20}
                            color="#B90F0F"
                        />
                    </View>

                </View>
            </TouchableOpacity>

        </ScrollView>
    )
}

const styles = StyleSheet.create({

    container: {
        flex: 1,
        backgroundColor: "#F3F4F6",
        padding: 16,
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
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    headerCard: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
    },
    textContainer: {
        marginLeft: 10,
    },
    titleCard: {
        fontSize: 14,
        fontWeight: "400",
        color: "#000",
    },
    numberCard: {
        fontSize: 20,
        color: "#000",
        fontWeight: "600",
    },
    cardInfo: {
        width: "48%",
        height: 150,
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        padding: 12,
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
    iconContainer: {
        width: 44,
        height: 44,
        backgroundColor: "#ffe4e4",
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    iconContainer2: {
        width: 44,
        height: 44,
        backgroundColor: "#F3F4F6",
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
    },
    button: {
        backgroundColor: "#FFF",
        height: 50,
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 16,
        borderRadius: 12.5,
    },
    buttonContent: {
        flexDirection: "row",
        alignItems: "center",
        width: "100%",
    },
    buttonLeft: {
        width: 40,
        alignItems: "flex-start",
    },
    buttonCenter: {
        flex: 1,
        alignItems: "center",
    },
    buttonRight: {
        width: 40,
        alignItems: "flex-end",
    },
    textButton: {
        color: "#000",
        fontWeight: "400",
    },
    descriptionCard: {
        fontSize: 12,
        color: "#666",
        marginTop: 8,
    },
    segundoTitulo: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 10,
        marginTop: 20,
    },
})