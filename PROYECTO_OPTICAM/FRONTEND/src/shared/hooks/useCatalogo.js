// src/shared/hooks/useCatalogo.js
import { useEffect, useRef, useState } from 'react';
import { ProductController } from '../../core/controllers/ProductController';
import { alertError } from '../utils/alert';

export const useCatalogo = () => {
  const productController = new ProductController();

  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [buscando, setBuscando] = useState(false);

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);
  const [mostrarMarcas, setMostrarMarcas] = useState(false);
  const [mostrarOrden, setMostrarOrden] = useState(false);

  const [categorias, setCategorias] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [marcas, setMarcas] = useState([]);
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('Todas');
  const [ordenSeleccionado, setOrdenSeleccionado] = useState('Nuevo');
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);
  const productosPorPagina = 9;
  const gridRef = useRef(null);

  const ordenar = (lista, orden) => {
    const copy = [...lista];
    switch (orden) {
      case 'Nuevo': return copy.sort((a, b) => b.id_producto - a.id_producto);
      case 'Precio: menor a mayor': return copy.sort((a, b) => a.precio - b.precio);
      case 'Precio: mayor a menor': return copy.sort((a, b) => b.precio - a.precio);
      case 'Nombre A-Z': return copy.sort((a, b) => a.nombre.localeCompare(b.nombre));
      default: return copy;
    }
  };

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await productController.getProductos();
      setProductos(data);
      const ordenados = [...data].sort((a, b) => b.id_producto - a.id_producto);
      setProductosFiltrados(ordenados);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try { setCategorias(await productController.getCategorias()); } 
    catch (error) { console.error(error); }
  };

  const cargarMarcas = async () => {
    try { setMarcas(await productController.getMarcas()); } 
    catch (error) { console.error(error); }
  };

  useEffect(() => {
    void cargarProductos();
    void cargarCategorias();
    void cargarMarcas();
  }, []);

  useEffect(() => {
    const texto = busqueda.trim();

    if (texto === '') {
      let base = categoriaSeleccionada === 'Todos' ? [...productos] : productos.filter((p) => p.tipo_categoria === categoriaSeleccionada);
      setProductosFiltrados(ordenar(base, ordenSeleccionado));
      return;
    }

    const timeout = setTimeout(() => {
      void (async () => {
        try {
          setBuscando(true);
          const resultados = await productController.buscarProductos(texto);
          let base = categoriaSeleccionada === 'Todos' ? resultados : resultados.filter((p) => p.tipo_categoria === categoriaSeleccionada);
          setProductosFiltrados(ordenar(base, ordenSeleccionado));
        } catch (error) {
          console.error('Error buscando:', error);
          setProductosFiltrados([]);
        } finally {
          setBuscando(false);
        }
      })();
    }, 400);

    return () => clearTimeout(timeout);
  }, [busqueda, productos, categoriaSeleccionada, ordenSeleccionado]);

  useEffect(() => { setPaginaActual(1); }, [busqueda, categoriaSeleccionada, marcaSeleccionada, ordenSeleccionado, precioMin, precioMax]);

  useEffect(() => {
    if (paginaActual === 1) return;
    if (gridRef.current) {
      const y = gridRef.current.getBoundingClientRect().top + window.scrollY - 90;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [paginaActual]);

  const filtrarPorCategoria = (categoria) => {
    setCategoriaSeleccionada(categoria);
    setMostrarCategorias(false);
    let base = categoria === 'Todos' ? [...productos] : productos.filter((p) => p.tipo_categoria === categoria);
    setProductosFiltrados(ordenar(base, ordenSeleccionado));
  };

  const filtrarPorMarca = (marca) => {
    setMarcaSeleccionada(marca);
    setMostrarMarcas(false);
    if (marca === 'Todas') setProductosFiltrados(productos);
    else setProductosFiltrados(productos.filter((p) => p.marca === marca));
  };

  const ordenarProductos = (tipo) => {
    setOrdenSeleccionado(tipo);
    setMostrarOrden(false);
    let base = categoriaSeleccionada === 'Todos' ? [...productos] : productos.filter((p) => p.tipo_categoria === categoriaSeleccionada);
    setProductosFiltrados(ordenar(base, tipo));
  };

  const aplicarFiltrosAvanzados = async () => {
    try {
      setLoading(true);
      const filtros = {};
      if (precioMin && !Number.isNaN(Number(precioMin))) filtros.precio_min = Number(precioMin);
      if (precioMax && !Number.isNaN(Number(precioMax))) filtros.precio_max = Number(precioMax);
      setProductosFiltrados(await productController.filtrarProductos(filtros));
      setMostrarFiltros(false);
    } catch (error) {
      console.error(error);
      void alertError('Error al aplicar filtros');
    } finally {
      setLoading(false);
    }
  };

  const limpiarFiltros = () => {
    setPrecioMin('');
    setPrecioMax('');
    void cargarProductos();
    setMostrarFiltros(false);
  };

  const totalPaginas = Math.ceil(productosFiltrados.length / productosPorPagina);
  const indiceUltimo = paginaActual * productosPorPagina;
  const indicePrimero = indiceUltimo - productosPorPagina;
  const productosPaginados = productosFiltrados.slice(indicePrimero, indiceUltimo);

  const generarPaginas = () => {
    const paginas = [];
    const delta = 1;
    if (totalPaginas <= 7) {
      for (let i = 1; i <= totalPaginas; i++) paginas.push(i);
      return paginas;
    }
    paginas.push(1);
    if (paginaActual > delta + 2) paginas.push('...');
    const inicio = Math.max(2, paginaActual - delta);
    const fin = Math.min(totalPaginas - 1, paginaActual + delta);
    for (let i = inicio; i <= fin; i++) paginas.push(i);
    if (paginaActual < totalPaginas - delta - 1) paginas.push('...');
    paginas.push(totalPaginas);
    return paginas;
  };

  return {
    productos, productosFiltrados, busqueda, setBusqueda, loading, buscando,
    mostrarFiltros, setMostrarFiltros, mostrarCategorias, setMostrarCategorias,
    mostrarMarcas, setMostrarMarcas, mostrarOrden, setMostrarOrden,
    categorias, categoriaSeleccionada, marcas, marcaSeleccionada,
    ordenSeleccionado, precioMin, setPrecioMin, precioMax, setPrecioMax,
    paginaActual, setPaginaActual, totalPaginas, productosPaginados,
    gridRef, filtrarPorCategoria, filtrarPorMarca, ordenarProductos,
    aplicarFiltrosAvanzados, limpiarFiltros, generarPaginas
  };
};