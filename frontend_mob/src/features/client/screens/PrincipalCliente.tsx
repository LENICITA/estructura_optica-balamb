// src/features/client/screens/PrincipalCliente.tsx
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../auth/context/AuthContext';
import { ProductController } from '../../../core/controllers/ProductController';
import { COLORS } from '../../../shared/constants/colors';

interface Props {
  navigation: any;
}

export const PrincipalCliente = ({ navigation }: Props) => {
  const { user } = useAuth();
  const productController = new ProductController();

  const [nombreUsuario, setNombreUsuario] = useState('Cliente');
  const [productosDestacados, setProductosDestacados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargadoInicial = useRef(false);

  useEffect(() => {
    if (cargadoInicial.current) return;
    cargadoInicial.current = true;
    cargarDatosCliente();
  }, []);

  const cargarDatosCliente = async () => {
    try {
      setLoading(true);
      setError(null);

      if (user?.nombre_completo) {
        setNombreUsuario(user.nombre_completo);
      }

      try {
        //  Usamos el controlador en lugar de apiClient
        const productos = await productController.getProductosDestacados();

        console.log('🔍 Productos que devuelve el controlador:', productos);

        // LÓGICA DE MAPEO (Funciona con la estructura de tu backend)
        let productosData = [];

        // Si la respuesta tiene 'productos', úsalo
        if (productos?.productos) {
          productosData = productos.productos;
        }
        // Si la respuesta tiene 'data' y es un array, úsalo
        else if (productos?.data && Array.isArray(productos.data)) {
          productosData = productos.data;
        }
        // Si la respuesta es directamente un array
        else if (Array.isArray(productos)) {
          productosData = productos;
        }

        //  AHORA USA productosData para el mapeo
        if (Array.isArray(productosData) && productosData.length > 0) {
          const productosMapeados = productosData.map((p: any) => ({
            id: p.id_producto || p.id,
            nombre: p.nombre || 'Producto',
            precio: p.precio || 0,
            imagen: p.imagen || p.imagen_url || 'https://via.placeholder.com/150',
            vendidos: p.vendidos || 0,
          }));
          setProductosDestacados(productosMapeados);
        } else {
          console.log('⚠ El backend no devolvió productos destacados');
          setProductosDestacados([]);
        }
      } catch (err) {
        console.warn('No se pudieron cargar productos destacados:', err);
        setProductosDestacados([]);
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

  // ========== UI (Sin cambios) ==========
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
              onPress={() => navigation.navigate('MisFormulasScreen')}
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
              { icon: 'document-text-outline', title: 'Fórmula Médica', action: 'MisFormulasScreen' },
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
              { icon: 'car-outline', title: 'Envío gratis', desc: 'En compras > $200.000' },
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
    </SafeAreaView>
  );
};

// ========== ESTILOS (Sin cambios) ==========
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
});