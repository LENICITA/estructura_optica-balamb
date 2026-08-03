// src/presentation/views/principal-cliente/PrincipalCliente.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../contexts/AuthContext'; // ← contexts (plural)
import { apiClient } from '../../../services/apiClient'; // ← usar apiClient
import { COLORS } from '../../../constants/colors'; // ← usar COLORS de constants

interface Props {
  navigation: any;
}

export const PrincipalCliente = ({ navigation }: Props) => { // ← export const + props
  const { user } = useAuth();

  // Estados
  const [nombreUsuario, setNombreUsuario] = useState('Cliente');
  const [productosDestacados, setProductosDestacados] = useState<any[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [panelMensajesAbierto, setPanelMensajesAbierto] = useState(false);
  const [chatbotAbierto, setChatbotAbierto] = useState(false);
  const [mensajesChat, setMensajesChat] = useState([
    { tipo: 'bot', texto: '¡Hola! Soy OptiBot, tu asistente virtual. \n¿En qué puedo ayudarte hoy?', hora: 'Ahora' }
  ]);
  const [inputChat, setInputChat] = useState('');
  const [notificaciones, setNotificaciones] = useState([
    { titulo: "¡Bienvenido!", mensaje: "Gracias por ser parte de Óptica Balamb", tiempo: "Ahora" },
    { titulo: "Oferta especial", mensaje: "15% OFF en monturas seleccionadas", tiempo: "Hoy" }
  ]);

  const cargadoInicial = useRef(false);

  // Cargar datos al montar
  useEffect(() => {
    if (cargadoInicial.current) return;
    cargadoInicial.current = true;
    cargarDatosCliente();
    actualizarContadorCarrito();
  }, []);

  // Cargar datos del cliente y productos
  const cargarDatosCliente = async () => {
    try {
      setLoading(true);
      setError(null);

      if (user?.nombre_completo) {
        setNombreUsuario(user.nombre_completo);
      }

      try {
        const productosResponse = await apiClient.get('/inventario/productos/destacados');
        let productosData = productosResponse.data;
        if (productosResponse.data?.data) productosData = productosResponse.data.data;
        if (productosResponse.data?.productos) productosData = productosResponse.data.productos;

        if (Array.isArray(productosData) && productosData.length > 0) {
          const productosMapeados = productosData.map((p: any) => ({
            id: p.id_producto || p.id,
            nombre: p.nombre || 'Producto',
            precio: p.precio || 0,
            imagen: p.imagen || p.imagen_url || 'https://via.placeholder.com/150',
            vendidos: p.vendidos || 0,
            ...p
          }));
          setProductosDestacados(productosMapeados);
        } else {
          usarProductosEjemplo();
        }
      } catch (err) {
        console.warn('No se pudieron cargar productos destacados:', err);
        usarProductosEjemplo();
      }

    } catch (err: any) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar el dashboard. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  const usarProductosEjemplo = () => {
    setProductosDestacados([
      { id: 1, nombre: "Ángel Gold", precio: 250000, imagen: "https://via.placeholder.com/150", vendidos: 150 },
      { id: 2, nombre: "Sky Blue", precio: 180000, imagen: "https://via.placeholder.com/150", vendidos: 89 },
      { id: 3, nombre: "Titanium Pro", precio: 350000, imagen: "https://via.placeholder.com/150", vendidos: 45 },
      { id: 4, nombre: "Gafas Ámbar", precio: 250000, imagen: "https://via.placeholder.com/150", vendidos: 200 }
    ]);
  };

  const actualizarContadorCarrito = async () => {
    try {
      setTotalItems(0);
    } catch (error) {
      console.error('Error al actualizar carrito:', error);
    }
  };

  const enviarMensajeChat = () => {
    if (!inputChat.trim()) return;
    setMensajesChat(prev => [...prev, {
      tipo: 'usuario',
      texto: inputChat,
      hora: new Date().toLocaleTimeString()
    }]);
    setInputChat('');
    setTimeout(() => {
      setMensajesChat(prev => [...prev, {
        tipo: 'bot',
        texto: 'Gracias por tu mensaje. Un asesor te contactará pronto.',
        hora: new Date().toLocaleTimeString()
      }]);
    }, 500);
  };

  const respuestaRapida = (respuesta: string) => {
    let mensaje = '';
    switch(respuesta) {
      case 'precios': mensaje = 'Nuestros precios van desde $50.000 hasta $350.000'; break;
      case 'envio': mensaje = 'El envío es gratis en compras mayores a $200.000'; break;
      case 'garantia': mensaje = 'Todos nuestros productos tienen 30 días de garantía'; break;
      case 'contacto': mensaje = 'Puedes contactarnos al +57 300 237 4767'; break;
      default: mensaje = '¿En qué más puedo ayudarte?';
    }
    setMensajesChat(prev => [...prev, {
      tipo: 'bot',
      texto: mensaje,
      hora: new Date().toLocaleTimeString()
    }]);
  };

  const irProducto = (id: number) => {
    if (!id) return;
    navigation.navigate('DetalleProducto', { id });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando tu tienda...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>

        {/* BANNER DE BIENVENIDA */}
        <View style={styles.banner}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bienvenidaTitle}>¡Bienvenido, {nombreUsuario}!</Text>
            <Text style={styles.bienvenidaSub}>Encuentra las mejores monturas y cuida tu estilo visual</Text>
          </View>
          <View style={styles.bannerButtons}>
            <TouchableOpacity
              style={styles.btnCatalogo}
              onPress={() => navigation.navigate('Catalogo')}
            >
              <Ionicons name="glasses-outline" size={20} color={COLORS.primary} />
              <Text style={styles.btnCatalogoText}>Ver Catálogo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.btnFormula}
              onPress={() => navigation.navigate('Formula')}
            >
              <Ionicons name="eye-outline" size={20} color="#fff" />
              <Text style={styles.btnFormulaText}>Subir Fórmula</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* CATEGORÍAS DESTACADAS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Categorías destacadas</Text>
          <View style={styles.categoriasGrid}>
            {[
              { icon: 'glasses-outline', title: 'Monturas', action: 'Catalogo' },
              { icon: 'sunny-outline', title: 'Gafas de Sol', action: 'Catalogo' },
              { icon: 'document-text-outline', title: 'Fórmula Médica', action: 'Formula' },
              { icon: 'trending-up-outline', title: 'Más Vendidos', action: 'Catalogo' }
            ].map((cat, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.categoriaCard}
                onPress={() => navigation.navigate(cat.action)}
              >
                <Ionicons name={cat.icon as any} size={36} color={COLORS.primary} />
                <Text style={styles.categoriaTitle}>{cat.title}</Text>
                <Text style={styles.categoriaSub}>Ver todas</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* PRODUCTOS DESTACADOS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Productos destacados</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Catalogo')}>
              <Text style={styles.verTodosText}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.productosScroll}>
            {productosDestacados.length > 0 ? (
              productosDestacados.map((producto: any) => (
                <TouchableOpacity
                  key={producto.id}
                  style={styles.productoCard}
                  onPress={() => irProducto(producto.id)}
                >
                  <Image
                    source={{ uri: producto.imagen }}
                    style={styles.productoImagen}
                    resizeMode="contain"
                  />
                  <Text style={styles.productoNombre} numberOfLines={1}>{producto.nombre}</Text>
                  <Text style={styles.productoPrecio}>${producto.precio.toLocaleString('es-CO')}</Text>
                  <TouchableOpacity style={styles.btnDetalles} onPress={() => irProducto(producto.id)}>
                    <Text style={styles.btnDetallesText}>Ver detalles</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.sinProductos}>
                <Text style={styles.sinProductosText}>No hay productos disponibles</Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* BENEFICIOS */}
        <View style={styles.beneficiosContainer}>
          {[
            { icon: 'truck-outline', title: 'Envío gratis', desc: 'En compras > $200.000' },
            { icon: 'shield-checkmark-outline', title: 'Garantía', desc: '30 días de garantía' },
            { icon: 'refresh-outline', title: 'Devoluciones', desc: 'Hasta 15 días' },
            { icon: 'headset-outline', title: 'Soporte 24/7', desc: 'Atención al cliente' }
          ].map((item: any, idx: number) => (
            <View key={String(idx)} style={styles.beneficioCard}>
              <Ionicons name={item.icon} size={32} color={COLORS.primary} />
              <Text style={styles.beneficioTitle}>{item.title}</Text>
              <Text style={styles.beneficioDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* PANEL DE NOTIFICACIONES */}
      <Modal
        visible={panelMensajesAbierto}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPanelMensajesAbierto(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPanelMensajesAbierto(false)}
        />
        <View style={styles.notificacionesPanel}>
          <View style={styles.notificacionesHeader}>
            <Ionicons name="notifications" size={20} color="#fff" />
            <Text style={styles.notificacionesTitle}>Notificaciones</Text>
            <TouchableOpacity onPress={() => setPanelMensajesAbierto(false)}>
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.notificacionesList}>
            {notificaciones.map((noti, idx) => (
              <View key={idx} style={styles.notificacionItem}>
                <Ionicons name="notifications" size={20} color={COLORS.primary} />
                <View style={styles.notificacionContent}>
                  <Text style={styles.notificacionTitulo}>{noti.titulo}</Text>
                  <Text style={styles.notificacionMensaje}>{noti.mensaje}</Text>
                  <Text style={styles.notificacionTiempo}>{noti.tiempo}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* CHATBOT FLOTANTE */}
      <View style={styles.chatbotFloating}>
        <TouchableOpacity
          style={styles.chatbotToggle}
          onPress={() => setChatbotAbierto(!chatbotAbierto)}
        >
          <Ionicons name="chatbubble-ellipses" size={28} color="#fff" />
        </TouchableOpacity>

        {chatbotAbierto && (
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.chatbotContainer}
          >
            <View style={styles.chatbotHeader}>
              <View style={styles.chatbotHeaderLeft}>
                <Ionicons name="bug" size={20} color="#fff" />
                <Text style={styles.chatbotTitle}>OptiBot</Text>
              </View>
              <TouchableOpacity onPress={() => setChatbotAbierto(false)}>
                <Ionicons name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chatbotMessages}>
              {mensajesChat.map((msg, idx) => (
                <View key={idx} style={[styles.chatMessage, msg.tipo === 'bot' ? styles.chatBot : styles.chatUser]}>
                  <Text style={msg.tipo === 'bot' ? styles.chatBotText : styles.chatUserText}>
                    {msg.texto}
                  </Text>
                  <Text style={styles.chatTime}>{msg.hora}</Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.chatbotInputContainer}>
              <TextInput
                style={styles.chatbotInput}
                placeholder="Escribe tu mensaje..."
                value={inputChat}
                onChangeText={setInputChat}
                onSubmitEditing={enviarMensajeChat}
              />
              <TouchableOpacity style={styles.chatbotSend} onPress={enviarMensajeChat}>
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.chatbotQuickActions}>
              {['Precios', 'Envíos', 'Garantía', 'Contacto'].map((label, idx) => {
                const acciones = ['precios', 'envio', 'garantia', 'contacto'];
                return (
                  <TouchableOpacity
                    key={idx}
                    style={styles.chatbotQuickBtn}
                    onPress={() => respuestaRapida(acciones[idx])}
                  >
                    <Text style={styles.chatbotQuickBtnText}>{label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </KeyboardAvoidingView>
        )}
      </View>
    </SafeAreaView>
  );
};

// ================= ESTILOS =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  banner: {
    backgroundColor: COLORS.primary,
    padding: 24,
    margin: 16,
    borderRadius: 16,
    gap: 16,
  },
  bannerTextContainer: {
    gap: 4,
  },
  bienvenidaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  bienvenidaSub: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
  },
  bannerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  btnCatalogo: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnCatalogoText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  btnFormula: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnFormulaText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  verTodosText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  categoriasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  categoriaCard: {
    flex: 1,
    minWidth: 70,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  categoriaTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  categoriaSub: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
  },
  productosScroll: {
    paddingVertical: 8,
  },
  productoCard: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    width: 160,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  productoImagen: {
    width: 100,
    height: 100,
    marginBottom: 8,
    borderRadius: 8,
  },
  productoNombre: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  productoPrecio: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  btnDetalles: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  btnDetallesText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  sinProductos: {
    width: 160,
    height: 160,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sinProductosText: {
    color: '#999',
    fontSize: 14,
  },
  beneficiosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 24,
  },
  beneficioCard: {
    flex: 1,
    minWidth: 70,
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  beneficioTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  beneficioDesc: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  notificacionesPanel: {
    position: 'absolute',
    top: 60,
    right: 16,
    width: '90%',
    maxWidth: 350,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  notificacionesHeader: {
    backgroundColor: COLORS.primary,
    padding: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificacionesTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
  },
  notificacionesList: {
    maxHeight: 400,
    padding: 16,
  },
  notificacionItem: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificacionContent: {
    flex: 1,
  },
  notificacionTitulo: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  notificacionMensaje: {
    fontSize: 13,
    color: '#666',
    marginTop: 2,
  },
  notificacionTiempo: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  chatbotFloating: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    zIndex: 999,
    alignItems: 'flex-end',
  },
  chatbotToggle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  chatbotContainer: {
    position: 'absolute',
    bottom: 80,
    right: 0,
    width: 320,
    maxHeight: 480,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  chatbotHeader: {
    backgroundColor: COLORS.primary,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatbotHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatbotTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  chatbotMessages: {
    maxHeight: 280,
    padding: 16,
  },
  chatMessage: {
    marginBottom: 12,
    maxWidth: '85%',
    padding: 12,
    borderRadius: 12,
  },
  chatBot: {
    backgroundColor: '#f0f0f0',
    alignSelf: 'flex-start',
  },
  chatUser: {
    backgroundColor: COLORS.primary,
    alignSelf: 'flex-end',
  },
  chatBotText: {
    color: '#000',
    fontSize: 14,
  },
  chatUserText: {
    color: '#fff',
    fontSize: 14,
  },
  chatTime: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
  chatbotInputContainer: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  chatbotInput: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    fontSize: 14,
  },
  chatbotSend: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatbotQuickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  chatbotQuickBtn: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  chatbotQuickBtnText: {
    fontSize: 12,
    color: '#666',
  },
});