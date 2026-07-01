import sequelize from "../config/database.js";
import bcrypt from "bcryptjs";
import { subirImagenLocal } from "../utils/uploadLocal.js";
import Role from "../models/Role.js";
import { Usuario, RolUsuario } from "../models/relaciones.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONFIGURACIÓN DEL ADMIN
const adminData = {
  nombre_completo: process.env.ADMIN_NOMBRE || "Administrador Sistema",
  telefono: process.env.ADMIN_TELEFONO || "3113578562",
  fecha_nacimiento: process.env.ADMIN_FECHA_NACIMIENTO || "1990-01-01",
  documento: process.env.ADMIN_DOCUMENTO || 123456789,
  ciudad: process.env.ADMIN_CIUDAD || "Bogotá",
  direccion: process.env.ADMIN_DIRECCION || "Calle Principal #123",
  email: process.env.ADMIN_EMAIL || "admin@opticam.com",
  contrasena: process.env.ADMIN_CONTRASENA || "Admin123!",
  estado: "ACTIVO"
};

// 1. USUARIOS
const usuariosData = [
  {
    nombre_completo: "María González",
    telefono: "3002345678",
    fecha_nacimiento: "1985-06-20",
    documento: 2345678901,
    ciudad: "Bogotá",
    direccion: "Calle 123 #45-67",
    email: "maria@email.com",
    contrasena: "Maria123*",
    estado: "ACTIVO"
  },
  {
    nombre_completo: "Carlos Rodríguez",
    telefono: "3003456789",
    fecha_nacimiento: "1992-12-10",
    documento: 3456789012,
    ciudad: "Medellín",
    direccion: "Avenida 5 #12-34",
    email: "carlos@email.com",
    contrasena: "Carlos456*",
    estado: "ACTIVO"
  },
  {
    nombre_completo: "Laura Sánchez",
    telefono: "3006789012",
    fecha_nacimiento: "1991-07-14",
    documento: 6789012345,
    ciudad: "Cali",
    direccion: "Avenida 3 #78-90",
    email: "laura@email.com",
    contrasena: "Laura202*",
    estado: "ACTIVO"
  },
  {
    nombre_completo: "Juan Rojas",
    telefono: "3007890123",
    fecha_nacimiento: "1987-09-30",
    documento: 7890123456,
    ciudad: "Bogotá",
    direccion: "Calle 100 #20-30",
    email: "juan@email.com",
    contrasena: "Juan303*",
    estado: "ACTIVO"
  },
  {
    nombre_completo: "Patricia Castillo",
    telefono: "3008901234",
    fecha_nacimiento: "1993-11-12",
    documento: 8901234567,
    ciudad: "Medellín",
    direccion: "Carrera 50 #10-20",
    email: "patricia@email.com",
    contrasena: "Patricia404*",
    estado: "ACTIVO"
  },
  {
    nombre_completo: "Carmen Torres",
    telefono: "3010123456",
    fecha_nacimiento: "1994-02-28",
    documento: 1234567891,
    ciudad: "Bogotá",
    direccion: "Calle 45 #30-40",
    email: "carmen@email.com",
    contrasena: "Carmen606*",
    estado: "ACTIVO"
  },
  {
    nombre_completo: "Ana Martínez",
    telefono: "3004567890",
    fecha_nacimiento: "1988-08-05",
    documento: 4567890123,
    ciudad: "Bogotá",
    direccion: "Calle 80 #15-20",
    email: "ana@email.com",
    contrasena: "Ana789*",
    estado: "ACTIVO"
  },
  {
    nombre_completo: "Luis Pérez",
    telefono: "3005678901",
    fecha_nacimiento: "1995-03-25",
    documento: 5678901234,
    ciudad: "Medellín",
    direccion: "Carrera 32 #45-67",
    email: "luis@email.com",
    contrasena: "Luis101*",
    estado: "ACTIVO"
  },
  {
    nombre_completo: "Diego Fernández",
    telefono: "3009012345",
    fecha_nacimiento: "1986-04-18",
    documento: 9012345678,
    ciudad: "Cali",
    direccion: "Avenida 7 #56-78",
    email: "diego@email.com",
    contrasena: "Diego505*",
    estado: "ACTIVO"
  },
  {
    nombre_completo: "Roberto Méndez",
    telefono: "3011234567",
    fecha_nacimiento: "1989-07-22",
    documento: 2345678902,
    ciudad: "Bogotá",
    direccion: "Calle 70 #15-30",
    email: "roberto@email.com",
    contrasena: "Roberto707*",
    estado: "ACTIVO"
  },
  {
    nombre_completo: "Sofía Ramírez",
    telefono: "3012345678",
    fecha_nacimiento: "1990-11-15",
    documento: 3456789023,
    ciudad: "Bogotá",
    direccion: "Calle 85 #10-20",
    email: "sofia@email.com",
    contrasena: "Sofia808*",
    estado: "ACTIVO"
  }
];

// 2. CATEGORÍAS
const categoriasData = [
  { tipo_categoria: "MONTURAS", descripcion: "Monturas para lentes graduados" },
  { tipo_categoria: "ACCESORIOS", descripcion: "Accesorios para lentes y cuidado visual" },
  { tipo_categoria: "GAFAS DE SOL", descripcion: "Gafas con protección UV" }
];

// 3. PRODUCTOS - Definidos con nombre_categoria en lugar de id_categoria
const productosData = [
  // MONTURAS - 10 productos
  {
    nombre_categoria: "MONTURAS",
    nombre: "Montura Elegance",
    descripcion: "Montura ligera de titanio",
    marca: "Rayban",
    precio: 250000,
    imagen: path.join(__dirname, '../public/img/m.negro1.jpg'),
    material: "Titanio",
    color: "Negro"
  },
  {
    nombre_categoria: "MONTURAS",
    nombre: "Montura Vintage",
    descripcion: "Estilo clásico con acabado mate",
    marca: "Oakley",
    precio: 180000,
    imagen: path.join(__dirname, '../public/img/m.marron1.jpg'),
    material: "Acetato",
    color: "Marrón"
  },
  {
    nombre_categoria: "MONTURAS",
    nombre: "Montura Sport",
    descripcion: "Diseño deportivo y resistente",
    marca: "Nike",
    precio: 210000,
    imagen: path.join(__dirname, '../public/img/m.azul1.jpg'),
    material: "Plástico TR90",
    color: "Azul"
  },
  {
    nombre_categoria: "MONTURAS",
    nombre: "Montura Classic",
    descripcion: "Diseño atemporal y elegante",
    marca: "Rayban",
    precio: 195000,
    imagen: path.join(__dirname, '../public/img/m.negro2.jpg'),
    material: "Acetato",
    color: "Negro"
  },
  {
    nombre_categoria: "MONTURAS",
    nombre: "Montura Minimal",
    descripcion: "Diseño minimalista y ligero",
    marca: "Oakley",
    precio: 220000,
    imagen: path.join(__dirname, '../public/img/m.plateado1.jpg'),
    material: "Titanio",
    color: "Plateado"
  },
  {
    nombre_categoria: "MONTURAS",
    nombre: "Montura Infinity",
    descripcion: "Diseño moderno sin marco superior",
    marca: "Rayban",
    precio: 270000,
    imagen: path.join(__dirname, '../public/img/m.dorado1.jpg'),
    material: "Titanio",
    color: "Dorado"
  },
  {
    nombre_categoria: "MONTURAS",
    nombre: "Montura Retro",
    descripcion: "Estilo años 50 con acabado brillante",
    marca: "Oakley",
    precio: 160000,
    imagen: path.join(__dirname, '../public/img/m.rosado1.jpg'),
    material: "Acetato",
    color: "Rosa"
  },
  {
    nombre_categoria: "MONTURAS",
    nombre: "Montura Aviator",
    descripcion: "Estilo piloto con doble puente",
    marca: "Rayban",
    precio: 290000,
    imagen: path.join(__dirname, '../public/img/m.dorado2.jpg'),
    material: "Metal",
    color: "Dorado"
  },
  {
    nombre_categoria: "MONTURAS",
    nombre: "Montura Urban",
    descripcion: "Diseño urbano y moderno",
    marca: "Nike",
    precio: 200000,
    imagen: path.join(__dirname, '../public/img/m.blanco2.jpg'),
    material: "Plástico TR90",
    color: "Blanco"
  },
  {
    nombre_categoria: "MONTURAS",
    nombre: "Montura Executive",
    descripcion: "Diseño ejecutivo para oficina",
    marca: "Oakley",
    precio: 240000,
    imagen: path.join(__dirname, '../public/img/m.amarillo1.jpg'),
    material: "Titanio",
    color: "Amarillo"
  },
  // GAFAS DE SOL - 10 productos
  {
    nombre_categoria: "GAFAS DE SOL",
    nombre: "Gafas Polarizadas",
    descripcion: "Protección UV400 con lentes polarizadas",
    marca: "Rayban",
    precio: 320000,
    imagen: path.join(__dirname, '../public/img/g.negro1.jpg'),
    material: "Policarbonato",
    color: "Negro"
  },
  {
    nombre_categoria: "GAFAS DE SOL",
    nombre: "Gafas Deportivas",
    descripcion: "Diseño aerodinámico para deportes",
    marca: "Oakley",
    precio: 280000,
    imagen: path.join(__dirname, '../public/img/g.rojo1.jpg'),
    material: "Plástico TR90",
    color: "Rojo"
  },
  {
    nombre_categoria: "GAFAS DE SOL",
    nombre: "Gafas Clásicas",
    descripcion: "Estilo clásico con protección UV",
    marca: "Rayban",
    precio: 350000,
    imagen: path.join(__dirname, '../public/img/g.marron1.jpg'),
    material: "Acetato",
    color: "Marrón"
  },
  {
    nombre_categoria: "GAFAS DE SOL",
    nombre: "Gafas Espejo",
    descripcion: "Lentes espejo con protección total",
    marca: "Nike",
    precio: 290000,
    imagen: path.join(__dirname, '../public/img/g.plateado1.jpg'),
    material: "Policarbonato",
    color: "Plateado"
  },
  {
    nombre_categoria: "GAFAS DE SOL",
    nombre: "Gafas Infantiles",
    descripcion: "Gafas de sol para niños",
    marca: "Generic",
    precio: 120000,
    imagen: path.join(__dirname, '../public/img/g.azul1.jpg'),
    material: "Plástico",
    color: "Azul"
  },
  {
    nombre_categoria: "GAFAS DE SOL",
    nombre: "Gafas Wayfarer",
    descripcion: "Estilo Wayfarer con protección UV",
    marca: "Rayban",
    precio: 310000,
    imagen: path.join(__dirname, '../public/img/g.negro2.jpg'),
    material: "Acetato",
    color: "Negro"
  },
  {
    nombre_categoria: "GAFAS DE SOL",
    nombre: "Gafas Cat Eye",
    descripcion: "Diseño cat eye para mujer",
    marca: "Oakley",
    precio: 260000,
    imagen: path.join(__dirname, '../public/img/g.rosa1.jpg'),
    material: "Acetato",
    color: "Rosa"
  },
  {
    nombre_categoria: "GAFAS DE SOL",
    nombre: "Gafas Round",
    descripcion: "Diseño redondo estilo vintage",
    marca: "Rayban",
    precio: 270000,
    imagen: path.join(__dirname, '../public/img/g.dorado1.jpg'),
    material: "Metal",
    color: "Dorado"
  },
  {
    nombre_categoria: "GAFAS DE SOL",
    nombre: "Gafas Futurist",
    descripcion: "Diseño futurista con lentes oscuras",
    marca: "Nike",
    precio: 300000,
    imagen: path.join(__dirname, '../public/img/g.plateado2.jpg'),
    material: "Plástico TR90",
    color: "Plateado"
  },
  {
    nombre_categoria: "GAFAS DE SOL",
    nombre: "Gafas Eco",
    descripcion: "Gafas ecológicas con materiales reciclados",
    marca: "Generic",
    precio: 150000,
    imagen: path.join(__dirname, '../public/img/g.verde1.jpg'),
    material: "Plástico reciclado",
    color: "Verde"
  },
  // ACCESORIOS - 10 productos
  {
    nombre_categoria: "ACCESORIOS",
    nombre: "Estuche para Lentes",
    descripcion: "Estuche rígido con interior de terciopelo",
    marca: "Generic",
    precio: 45000,
    imagen: path.join(__dirname, '../public/img/a.negro1.jpg'),
    material: "Cuero sintético",
    color: "Negro"
  },
  {
    nombre_categoria: "ACCESORIOS",
    nombre: "Kit de Limpieza",
    descripcion: "Kit completo con líquido y microfibra",
    marca: "Generic",
    precio: 25000,
    imagen: path.join(__dirname, '../public/img/a.blanco1.jpg'),
    material: "Líquido + Microfibra",
    color: "Blanco"
  },
  {
    nombre_categoria: "ACCESORIOS",
    nombre: "Cadena para Lentes",
    descripcion: "Cadena decorativa para lentes",
    marca: "Generic",
    precio: 18000,
    imagen: path.join(__dirname, '../public/img/a.dorado1.jpg'),
    material: "Metal",
    color: "Dorado"
  },
  {
    nombre_categoria: "ACCESORIOS",
    nombre: "Fundas de Microfibra",
    descripcion: "Set de 3 fundas de microfibra para lentes",
    marca: "Generic",
    precio: 15000,
    imagen: path.join(__dirname, '../public/img/a.multicolor1.jpg'),
    material: "Microfibra",
    color: "Multicolor"
  },
  {
    nombre_categoria: "ACCESORIOS",
    nombre: "Soporte para Lentes",
    descripcion: "Soporte de escritorio para lentes",
    marca: "Generic",
    precio: 20000,
    imagen: path.join(__dirname, '../public/img/a.transparente1.jpg'),
    material: "Madera",
    color: "Transparente"
  },
  {
    nombre_categoria: "ACCESORIOS",
    nombre: "Aromatizante para Lentes",
    descripcion: "Aromatizante con aceites esenciales",
    marca: "Generic",
    precio: 12000,
    imagen: path.join(__dirname, '../public/img/a.transparente2.jpg'),
    material: "Líquido",
    color: "Transparente"
  },
  {
    nombre_categoria: "ACCESORIOS",
    nombre: "Estuche para Lentes",
    descripcion: "Estuche rígido con interior de terciopelo",
    marca: "Generic",
    precio: 45000,
    imagen: path.join(__dirname, '../public/img/a.rosa1.jpg'),
    material: "Cuero sintético",
    color: "Rosa"
  },
  {
    nombre_categoria: "ACCESORIOS",
    nombre: "Clip Solar para Lentes",
    descripcion: "Clip con filtro solar para lentes",
    marca: "Generic",
    precio: 40000,
    imagen: path.join(__dirname, '../public/img/a.negro2.jpg'),
    material: "Plástico",
    color: "Negro"
  },
  {
    nombre_categoria: "ACCESORIOS",
    nombre: "Correa Deportiva",
    descripcion: "Correa elástica para sujetar lentes",
    marca: "Generic",
    precio: 22000,
    imagen: path.join(__dirname, '../public/img/a.negro3.jpg'),
    material: "Elástico",
    color: "Negro"
  },
  {
    nombre_categoria: "ACCESORIOS",
    nombre: "Caja Organizadora",
    descripcion: "Caja para guardar lentes y accesorios",
    marca: "Generic",
    precio: 32000,
    imagen: path.join(__dirname, '../public/img/a.gris1.jpg'),
    material: "Plástico",
    color: "Gris"
  }
];

// 4. FÓRMULAS
const formulasData = [
  {
    email_usuario: "maria@email.com",
    condicion: "MIOPIA",
    imagen: path.join(__dirname, '../public/img/miopia1.jpg'),
    observaciones: "Paciente con miopía severa -5.00 en ambos ojos",
    estado: "Aprobado",
    costo: 150000
  },
  {
    email_usuario: "carlos@email.com",
    condicion: "ASTIGMATISMO",
    imagen: path.join(__dirname, '../public/img/astigmatismo1.jpg'),
    observaciones: "Astigmatismo mixto con leve hipermetropía",
    estado: "Aprobado",
    costo: 120000
  },
  {
    email_usuario: "laura@email.com",
    condicion: "DALTONISMO",
    imagen: path.join(__dirname, '../public/img/daltonismo1.jpg'),
    observaciones: "Daltonismo rojo-verde, necesita filtros especiales",
    estado: "Pendiente",
    costo: 0
  },
  {
    email_usuario: "juan@email.com",
    condicion: "BAJA VISION",
    imagen: path.join(__dirname, '../public/img/bajavision1.jpg'),
    observaciones: "Paciente con baja visión severa, requiere aumentos especiales",
    estado: "Pendiente",
    costo: 0
  },
  {
    email_usuario: "patricia@email.com",
    condicion: "MIOPIA",
    imagen: path.join(__dirname, '../public/img/miopia2.jpg'),
    observaciones: "Miopía moderada -3.00, con ligero astigmatismo",
    estado: "Aprobado",
    costo: 130000
  },
  {
    email_usuario: "diego@email.com",
    condicion: "ASTIGMATISMO",
    imagen: path.join(__dirname, '../public/img/astigmatismo2.jpg'),
    observaciones: "Astigmatismo simple, corrección con lentes tóricos",
    estado: "Rechazado",
    costo: 0
  },
  {
    email_usuario: "carmen@email.com",
    condicion: "DALTONISMO",
    imagen: path.join(__dirname, '../public/img/daltonismo2.jpg'),
    observaciones: "Daltonismo completo, necesita adaptación especial",
    estado: "Aprobado",
    costo: 140000
  }
];

// 5. VEHÍCULOS
const vehiculosData = [
  { email_usuario: "ana@email.com", tipo: "Moto", modelo: "Yamaha NMAX 2023", placa: "ABC123", color: "Negro" },
  { email_usuario: "luis@email.com", tipo: "Moto", modelo: "Honda Navi 2024", placa: "DEF456", color: "Rojo" }
];

// 6. PEDIDOS
const pedidosData = [
  {
    email_usuario: "maria@email.com",
    email_formula: "maria@email.com",
    direccion_entrega: "Calle 123 #45-67, Bogotá",
    estado: "Pagado",
    costo_envio: 0,
    total: 720000,
    fecha_estimada: "2025-01-15"
  },
  {
    email_usuario: "carlos@email.com",
    email_formula: "carlos@email.com",
    direccion_entrega: "Carrera 45 #23-12, Medellín",
    estado: "Abonado",
    costo_envio: 10000,
    total: 310000,
    fecha_estimada: "2025-01-20"
  },
  {
    email_usuario: "laura@email.com",
    email_formula: null,
    direccion_entrega: "Avenida 3 #78-90, Cali",
    estado: "Pagado",
    costo_envio: 10000,
    total: 230000,
    fecha_estimada: "2025-01-25"
  },
  {
    email_usuario: "patricia@email.com",
    email_formula: "patricia@email.com",
    direccion_entrega: "Carrera 50 #10-20, Medellín",
    estado: "Listo",
    costo_envio: 10000,
    total: 420000,
    fecha_estimada: "2025-01-28"
  },
  {
    email_usuario: "juan@email.com",
    email_formula: null,
    direccion_entrega: "Calle 100 #20-30, Bogotá",
    estado: "En Proceso",
    costo_envio: 0,
    total: 210000,
    fecha_estimada: "2025-02-01"
  },
  {
    email_usuario: "carmen@email.com",
    email_formula: null,
    direccion_entrega: "Calle 45 #30-40, Bogotá",
    estado: "Pendiente",
    costo_envio: 0,
    total: 45000,
    fecha_estimada: "2025-02-05"
  },
  {
    email_usuario: "maria@email.com",
    email_formula: null,
    direccion_entrega: "Calle 123 #45-67, Bogotá",
    estado: "Entregado",
    costo_envio: 0,
    total: 250000,
    fecha_estimada: "2025-01-10"
  },
  {
    email_usuario: "patricia@email.com",
    email_formula: "patricia@email.com",
    direccion_entrega: "Carrera 50 #10-20, Medellín",
    estado: "Pagado",
    costo_envio: 10000,
    total: 420000,
    fecha_estimada: "2025-02-10"
  },
  {
    email_usuario: "carlos@email.com",
    email_formula: "carlos@email.com",
    direccion_entrega: "Carrera 45 #23-12, Medellín",
    estado: "Pagado",
    costo_envio: 10000,
    total: 660000,
    fecha_estimada: "2025-02-15"
  },
  {
    email_usuario: "laura@email.com",
    email_formula: null,
    direccion_entrega: "Avenida 3 #78-90, Cali",
    estado: "Pagado",
    costo_envio: 10000,
    total: 648000,
    fecha_estimada: "2025-02-20"
  },
  {
    email_usuario: "juan@email.com",
    email_formula: null,
    direccion_entrega: "Calle 100 #20-30, Bogotá",
    estado: "Pagado",
    costo_envio: 0,
    total: 595000,
    fecha_estimada: "2025-02-25"
  },
  {
    email_usuario: "patricia@email.com",
    email_formula: "patricia@email.com",
    direccion_entrega: "Carrera 50 #10-20, Medellín",
    estado: "Pendiente",
    costo_envio: 10000,
    total: 463000,
    fecha_estimada: "2025-03-01"
  }
];

// 7. PEDIDOS_PRODUCTO - Usar índice del producto en lugar de ID fijo
const pedidosProductosData = [
  { num_pedido: 1, indice_producto: 0, cant_productos: 1 },  // Montura Elegance
  { num_pedido: 1, indice_producto: 10, cant_productos: 1 }, // Gafas Polarizadas
  { num_pedido: 2, indice_producto: 1, cant_productos: 1 },  // Montura Vintage
  { num_pedido: 3, indice_producto: 4, cant_productos: 1 },  // Montura Minimal
  { num_pedido: 4, indice_producto: 11, cant_productos: 1 }, // Gafas Deportivas
  { num_pedido: 5, indice_producto: 2, cant_productos: 1 },  // Montura Sport
  { num_pedido: 6, indice_producto: 20, cant_productos: 1 }, // Estuche para Lentes
  { num_pedido: 7, indice_producto: 0, cant_productos: 1 },  // Montura Elegance
  { num_pedido: 8, indice_producto: 11, cant_productos: 1 }, // Gafas Deportivas
  { num_pedido: 9, indice_producto: 1, cant_productos: 1 },  // Montura Vintage
  { num_pedido: 9, indice_producto: 11, cant_productos: 1 }, // Gafas Deportivas
  { num_pedido: 9, indice_producto: 20, cant_productos: 1 }, // Estuche para Lentes
  { num_pedido: 9, indice_producto: 21, cant_productos: 1 }, // Kit de Limpieza
  { num_pedido: 10, indice_producto: 5, cant_productos: 1 }, // Montura Infinity
  { num_pedido: 10, indice_producto: 12, cant_productos: 1 },// Gafas Clásicas
  { num_pedido: 10, indice_producto: 22, cant_productos: 1 },// Cadena para Lentes
  { num_pedido: 11, indice_producto: 9, cant_productos: 1 }, // Montura Executive
  { num_pedido: 11, indice_producto: 15, cant_productos: 1 },// Gafas Wayfarer
  { num_pedido: 11, indice_producto: 21, cant_productos: 1 },// Kit de Limpieza
  { num_pedido: 11, indice_producto: 24, cant_productos: 1 },// Soporte para Lentes
  { num_pedido: 12, indice_producto: 16, cant_productos: 1 },// Gafas Cat Eye
  { num_pedido: 12, indice_producto: 20, cant_productos: 1 },// Estuche para Lentes
  { num_pedido: 12, indice_producto: 22, cant_productos: 1 } // Cadena para Lentes
];

// 8. PAGOS
const pagosData = [
  { num_pedido: 1, eleccion_pago: "100%", monto: 720000, estado: "Confirmado", fecha_pago: "2025-01-05 10:00:00" },
  { num_pedido: 2, eleccion_pago: "50%", monto: 155000, estado: "Confirmado", fecha_pago: "2025-01-08 14:30:00" },
  { num_pedido: 3, eleccion_pago: "100%", monto: 230000, estado: "Confirmado", fecha_pago: "2025-01-10 09:15:00" },
  { num_pedido: 4, eleccion_pago: "50%", monto: 210000, estado: "Confirmado", fecha_pago: "2025-01-12 11:45:00" },
  { num_pedido: 5, eleccion_pago: "50%", monto: 105000, estado: "Confirmado", fecha_pago: "2025-01-15 16:20:00" },
  { num_pedido: 7, eleccion_pago: "100%", monto: 250000, estado: "Confirmado", fecha_pago: "2025-01-02 13:00:00" },
  { num_pedido: 8, eleccion_pago: "50%", monto: 210000, estado: "Confirmado", fecha_pago: "2025-02-01 10:00:00" },
  { num_pedido: 8, eleccion_pago: "50%", monto: 210000, estado: "Confirmado", fecha_pago: "2025-02-08 14:30:00" },
  { num_pedido: 9, eleccion_pago: "100%", monto: 660000, estado: "Confirmado", fecha_pago: "2025-02-12 09:00:00" },
  { num_pedido: 10, eleccion_pago: "100%", monto: 648000, estado: "Confirmado", fecha_pago: "2025-02-18 11:00:00" },
  { num_pedido: 11, eleccion_pago: "100%", monto: 595000, estado: "Confirmado", fecha_pago: "2025-02-22 10:30:00" }
];

// 9. DISTRIBUCIONES
const distribucionesData = [
  { num_pedido: 1, email_usuario: "ana@email.com", fecha_entrega: "2025-01-16 10:00:00", estado: "EN_ENTREGA", observaciones: "Entrega en zona norte de Bogotá" },
  { num_pedido: 3, email_usuario: "luis@email.com", fecha_entrega: "2025-01-26 14:30:00", estado: "ENTREGADO", observaciones: "Entregado en portería" },
  { num_pedido: 7, email_usuario: "ana@email.com", fecha_entrega: "2025-01-11 09:15:00", estado: "ENTREGADO", observaciones: "Entregado en mano" },
  { num_pedido: 8, email_usuario: "luis@email.com", fecha_entrega: "2025-02-11 11:00:00", estado: "EN_ENTREGA", observaciones: "Llamar antes de llegar" },
  { num_pedido: 9, email_usuario: "ana@email.com", fecha_entrega: "2025-02-16 09:00:00", estado: "PENDIENTE", observaciones: "Esperando confirmación" },
  { num_pedido: 10, email_usuario: "luis@email.com", fecha_entrega: "2025-02-21 10:00:00", estado: "PENDIENTE", observaciones: "Coordinar entrega" },
  { num_pedido: 11, email_usuario: "ana@email.com", fecha_entrega: "2025-02-26 15:00:00", estado: "PENDIENTE", observaciones: "Dejar en conserjería" }
];

// FUNCIÓN: CREAR ROLES
const crearRoles = async (transaction) => {
  console.log(" Creando roles...");
  const rolesData = [
    { nombre: "ADMIN" },
    { nombre: "CLIENTE" },
    { nombre: "REPARTIDOR" }
  ];

  const rolesCreados = {};
  for (const role of rolesData) {
    const [rol, created] = await Role.findOrCreate({
      where: { nombre: role.nombre },
      defaults: role,
      transaction
    });
    rolesCreados[rol.nombre] = rol;
    console.log(` Rol ${rol.nombre}: ${created ? "Creado" : "Ya existe"}`);
  }
  console.log("");
  return rolesCreados;
};

// FUNCIÓN: CREAR ADMIN
const crearAdmin = async (transaction) => {
  console.log(" Creando administrador...");

  const adminExistente = await Usuario.findOne({
    where: { email: adminData.email },
    transaction
  });

  if (adminExistente) {
    console.log("El administrador ya existe, actualizando...");
    await adminExistente.update({
      contrasena: adminData.contrasena,
      estado: "ACTIVO",
      nombre_completo: adminData.nombre_completo,
      telefono: adminData.telefono,
      fecha_nacimiento: adminData.fecha_nacimiento,
      documento: adminData.documento,
      ciudad: adminData.ciudad,
      direccion: adminData.direccion,
      reset_token: null,
      reset_token_expiry: null
    }, { transaction });
    console.log(` Admin actualizado: ${adminData.email}`);
    return adminExistente;
  }

  const admin = await Usuario.create({
    nombre_completo: adminData.nombre_completo,
    telefono: adminData.telefono,
    fecha_nacimiento: adminData.fecha_nacimiento,
    documento: adminData.documento,
    ciudad: adminData.ciudad,
    direccion: adminData.direccion,
    email: adminData.email,
    contrasena: adminData.contrasena,
    estado: adminData.estado,
    reset_token: null,
    reset_token_expiry: null
  }, { transaction });

  console.log(` Admin creado: ${adminData.email}`);
  return admin;
};

// FUNCIÓN: ASIGNAR ROL A USUARIO
const asignarRol = async (usuarioId, rolId, transaction) => {
  const [rolUsuario, created] = await RolUsuario.findOrCreate({
    where: {
      id_usuario: usuarioId,
      id_rol: rolId
    },
    defaults: {
      id_usuario: usuarioId,
      id_rol: rolId
    },
    transaction
  });
  return created;
};

// FUNCIÓN PRINCIPAL
const seedAll = async () => {
  const transaction = await sequelize.transaction();

  try {
    console.log("\nIniciando inserción de datos...\n");

    await sequelize.authenticate();
    console.log("Conexión a la base de datos establecida\n");

    // 1. ROLES
    const roles = await crearRoles(transaction);

    // 2. ADMIN
    const admin = await crearAdmin(transaction);
    await asignarRol(admin.id_usuario, roles.ADMIN.id_rol, transaction);
    console.log(` Rol ADMIN asignado\n`);

    // 3. USUARIOS
    console.log(" Insertando usuarios...");
    const usuariosIds = {};

    usuariosIds[adminData.email] = admin.id_usuario;

    for (const usuario of usuariosData) {
      const hashedPassword = await bcrypt.hash(usuario.contrasena, 10);

      let [existing] = await sequelize.query(
        `SELECT id_usuario FROM USUARIOS WHERE email = :email`,
        {
          replacements: { email: usuario.email },
          type: sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      let idUsuario;
      if (existing) {
        idUsuario = existing.id_usuario;
        console.log(` Usuario ya existe: ${usuario.email} (ID: ${idUsuario})`);
      } else {
        const [result] = await sequelize.query(
          `INSERT INTO USUARIOS 
           (nombre_completo, telefono, fecha_nacimiento, documento, ciudad, direccion, email, contrasena, estado, reset_token, reset_token_expiry)
           VALUES (:nombre_completo, :telefono, :fecha_nacimiento, :documento, :ciudad, :direccion, :email, :contrasena, :estado, NULL, NULL)`,
          {
            replacements: {
              nombre_completo: usuario.nombre_completo,
              telefono: usuario.telefono,
              fecha_nacimiento: usuario.fecha_nacimiento,
              documento: usuario.documento,
              ciudad: usuario.ciudad,
              direccion: usuario.direccion,
              email: usuario.email,
              contrasena: hashedPassword,
              estado: usuario.estado
            },
            type: sequelize.QueryTypes.INSERT,
            transaction
          }
        );
        idUsuario = result;
        console.log(` Usuario creado: ${usuario.nombre_completo} (${usuario.email}) - ID: ${idUsuario}`);
      }

      usuariosIds[usuario.email] = idUsuario;
    }

    // 4. ASIGNAR ROLES A USUARIOS
    console.log("Asignando roles a usuarios...");

    const rolesPorUsuario = {
      "admin@opticam.com": ["ADMIN"],
      "maria@email.com": ["CLIENTE"],
      "carlos@email.com": ["CLIENTE"],
      "laura@email.com": ["CLIENTE"],
      "juan@email.com": ["CLIENTE"],
      "patricia@email.com": ["CLIENTE"],
      "carmen@email.com": ["CLIENTE"],
      "ana@email.com": ["CLIENTE", "REPARTIDOR"],
      "luis@email.com": ["REPARTIDOR"],
      "diego@email.com": ["CLIENTE"],
      "roberto@email.com": ["CLIENTE"],
      "sofia@email.com": ["CLIENTE"]
    };

    for (const [email, rolesList] of Object.entries(rolesPorUsuario)) {
      const id_usuario = usuariosIds[email];
      if (!id_usuario) continue;

      for (const rolNombre of rolesList) {
        if (roles[rolNombre]) {
          await sequelize.query(
            `INSERT IGNORE INTO ROL_USUARIO (id_rol, id_usuario) VALUES (:id_rol, :id_usuario)`,
            {
              replacements: {
                id_rol: roles[rolNombre].id_rol,
                id_usuario
              },
              type: sequelize.QueryTypes.INSERT,
              transaction
            }
          );
          console.log(` ${email} → ${rolNombre}`);
        }
      }
    }
    console.log("");

    // 5. CATEGORÍAS
    console.log("Insertando categorías...");
    const categoriasIds = {};

    for (const categoria of categoriasData) {
      let [existing] = await sequelize.query(
        `SELECT id_categoria FROM CATEGORIAS WHERE tipo_categoria = :tipo_categoria`,
        {
          replacements: { tipo_categoria: categoria.tipo_categoria },
          type: sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      let idCategoria;
      
      if (existing) {
        idCategoria = existing.id_categoria;
        console.log(`Categoría ya existe: ${categoria.tipo_categoria} (ID: ${idCategoria})`);
      } else {
        const [result] = await sequelize.query(
          `INSERT INTO CATEGORIAS (tipo_categoria, descripcion) 
           VALUES (:tipo_categoria, :descripcion)`,
          {
            replacements: {
              tipo_categoria: categoria.tipo_categoria,
              descripcion: categoria.descripcion
            },
            type: sequelize.QueryTypes.INSERT,
            transaction
          }
        );
        idCategoria = result;
        console.log(`Categoría creada: ${categoria.tipo_categoria} (ID: ${idCategoria})`);
      }
      
      categoriasIds[categoria.tipo_categoria] = idCategoria;
    }
    console.log("");

    // 6. PRODUCTOS
    console.log("Insertando productos...");
    const productosIds = [];

    for (const producto of productosData) {
      console.log(` Subiendo imagen local para: ${producto.nombre}`);

      const resultado = await subirImagenLocal(producto.imagen, "opticam/productos");

      if (!resultado.success) {
        console.log(` Error: ${resultado.error}`);
        continue;
      }

      const idCategoriaReal = categoriasIds[producto.nombre_categoria];
      
      if (!idCategoriaReal) {
        console.log(` Error: No se encontró categoría ${producto.nombre_categoria} para el producto ${producto.nombre}`);
        continue;
      }

      // Verificar si el producto ya existe
      let [existing] = await sequelize.query(
        `SELECT id_producto FROM PRODUCTOS WHERE nombre = :nombre AND marca = :marca`,
        {
          replacements: { 
            nombre: producto.nombre,
            marca: producto.marca
          },
          type: sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      let idProducto;
      if (existing) {
        idProducto = existing.id_producto;
        console.log(` Producto ya existe: ${producto.nombre} (ID: ${idProducto})`);
      } else {
        const [result] = await sequelize.query(
          `INSERT INTO PRODUCTOS 
           (id_categoria, nombre, descripcion, marca, precio, imagen, material, color) 
           VALUES (:id_categoria, :nombre, :descripcion, :marca, :precio, :imagen, :material, :color)`,
          {
            replacements: {
              id_categoria: idCategoriaReal,
              nombre: producto.nombre,
              descripcion: producto.descripcion,
              marca: producto.marca,
              precio: producto.precio,
              imagen: resultado.url,
              material: producto.material,
              color: producto.color
            },
            type: sequelize.QueryTypes.INSERT,
            transaction
          }
        );
        idProducto = result;
        console.log(`Producto creado: ${producto.nombre} (ID: ${idProducto})`);
      }
      
      productosIds.push(idProducto);
    }
    console.log("");

    // 7. FÓRMULAS
    console.log("Insertando fórmulas...");
    const formulasIds = {};

    for (const formula of formulasData) {
      const idUsuario = usuariosIds[formula.email_usuario];
      
      if (!idUsuario) {
        console.log(` Error: Usuario ${formula.email_usuario} no encontrado, saltando...`);
        continue;
      }

      console.log(`Subiendo imagen local para fórmula (Usuario: ${formula.email_usuario})`);

      const resultado = await subirImagenLocal(formula.imagen, "opticam/formulas");
      if (!resultado.success) {
        console.log(` Error en fórmula ${formula.email_usuario}: ${resultado.error}`);
        continue;
      }

      const [result] = await sequelize.query(
        `INSERT INTO FORMULAS 
         (id_usuario, condicion, imagen_formula, observaciones, estado, costo) 
         VALUES (:id_usuario, :condicion, :imagen_formula, :observaciones, :estado, :costo)`,
        {
          replacements: {
            id_usuario: idUsuario,
            condicion: formula.condicion,
            imagen_formula: resultado.url,
            observaciones: formula.observaciones,
            estado: formula.estado,
            costo: formula.costo
          },
          type: sequelize.QueryTypes.INSERT,
          transaction
        }
      );
      formulasIds[formula.email_usuario] = result;
      console.log(`Fórmula creada para usuario ${formula.email_usuario} (ID: ${result})`);
    }
    console.log("");

    // 8. VEHÍCULOS
    console.log(" Insertando vehículos...");
    for (const vehiculo of vehiculosData) {
      const idUsuario = usuariosIds[vehiculo.email_usuario];
      
      if (!idUsuario) {
        console.log(` Error: Usuario ${vehiculo.email_usuario} no encontrado, saltando...`);
        continue;
      }

      const [existing] = await sequelize.query(
        `SELECT id_vehiculo FROM VEHICULOS WHERE placa = :placa`,
        {
          replacements: { placa: vehiculo.placa },
          type: sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      if (existing) {
        console.log(`Vehículo con placa ${vehiculo.placa} ya existe, saltando...`);
        continue;
      }

      await sequelize.query(
        `INSERT INTO VEHICULOS (id_usuario, tipo, modelo, placa, color) 
        VALUES (:id_usuario, :tipo, :modelo, :placa, :color)`,
        {
          replacements: {
            id_usuario: idUsuario,
            tipo: vehiculo.tipo,
            modelo: vehiculo.modelo,
            placa: vehiculo.placa,
            color: vehiculo.color
          },
          type: sequelize.QueryTypes.INSERT,
          transaction
        }
      );
      console.log(`Vehículo: ${vehiculo.modelo} - ${vehiculo.placa}`);
    }
    console.log("");

    // 9. PEDIDOS
    console.log(" Insertando pedidos...");
    const pedidosIds = [];

    for (let i = 0; i < pedidosData.length; i++) {
      const pedido = pedidosData[i];
      const idUsuario = usuariosIds[pedido.email_usuario];
      
      if (!idUsuario) {
        console.log(` Error: Usuario ${pedido.email_usuario} no encontrado, saltando...`);
        continue;
      }

      let idFormula = null;
      if (pedido.email_formula) {
        idFormula = formulasIds[pedido.email_formula];
        if (!idFormula) {
          console.log(` Error: Fórmula para ${pedido.email_formula} no encontrada, saltando...`);
          continue;
        }
      }

      const [result] = await sequelize.query(
        `INSERT INTO PEDIDOS 
         (id_usuario, id_formula, direccion_entrega, estado, costo_envio, total, fecha_estimada) 
         VALUES (:id_usuario, :id_formula, :direccion_entrega, :estado, :costo_envio, :total, :fecha_estimada)`,
        {
          replacements: {
            id_usuario: idUsuario,
            id_formula: idFormula,
            direccion_entrega: pedido.direccion_entrega,
            estado: pedido.estado,
            costo_envio: pedido.costo_envio,
            total: pedido.total,
            fecha_estimada: pedido.fecha_estimada
          },
          type: sequelize.QueryTypes.INSERT,
          transaction
        }
      );
      pedidosIds.push(result);
      console.log(`Pedido ${i + 1} creado (ID: ${result})`);
    }
    console.log("");

    // 10. PEDIDOS_PRODUCTOS
    console.log("Insertando productos en pedidos...");
    for (const pp of pedidosProductosData) {
      const idPedido = pedidosIds[pp.num_pedido - 1];
      
      if (!idPedido) {
        console.log(` Error: Pedido ${pp.num_pedido} no encontrado, saltando...`);
        continue;
      }

      const idProductoReal = productosIds[pp.indice_producto];
      
      if (!idProductoReal) {
        console.log(` Error: Producto con índice ${pp.indice_producto} no encontrado, saltando...`);
        continue;
      }

      await sequelize.query(
        `INSERT INTO PEDIDOS_PRODUCTOS (id_pedido, id_producto, cant_productos) 
         VALUES (:id_pedido, :id_producto, :cant_productos)`,
        {
          replacements: {
            id_pedido: idPedido,
            id_producto: idProductoReal,
            cant_productos: pp.cant_productos
          },
          type: sequelize.QueryTypes.INSERT,
          transaction
        }
      );
    }
    console.log(` ${pedidosProductosData.length} relaciones agregadas\n`);

    // 11. PAGOS
    console.log("Insertando pagos...");
    for (const pago of pagosData) {
      const idPedido = pedidosIds[pago.num_pedido - 1];
      
      if (!idPedido) {
        console.log(` Error: Pedido ${pago.num_pedido} no encontrado, saltando...`);
        continue;
      }

      await sequelize.query(
        `INSERT INTO PAGOS 
         (id_pedido, eleccion_pago, monto, estado, fecha_pago) 
         VALUES (:id_pedido, :eleccion_pago, :monto, :estado, :fecha_pago)`,
        {
          replacements: {
            id_pedido: idPedido,
            eleccion_pago: pago.eleccion_pago,
            monto: pago.monto,
            estado: pago.estado,
            fecha_pago: pago.fecha_pago
          },
          type: sequelize.QueryTypes.INSERT,
          transaction
        }
      );
      console.log(`Pago - Pedido ${pago.num_pedido} - ${pago.eleccion_pago} - ${pago.estado}`);
    }
    console.log("");

    // 12. DISTRIBUCIONES
    console.log("Insertando distribuciones...");

    for (const distribucion of distribucionesData) {
      const idPedido = pedidosIds[distribucion.num_pedido - 1];
      
      if (!idPedido) {
        console.log(` Error: Pedido ${distribucion.num_pedido} no encontrado, saltando...`);
        continue;
      }

      const idUsuario = usuariosIds[distribucion.email_usuario];
      
      if (!idUsuario) {
        console.log(` Error: Usuario ${distribucion.email_usuario} no encontrado, saltando...`);
        continue;
      }

      await sequelize.query(
        `INSERT INTO DISTRIBUCIONES 
         (id_pedido, id_usuario, fecha_entrega, estado, observaciones) 
         VALUES (:id_pedido, :id_usuario, :fecha_entrega, :estado, :observaciones)`,
        {
          replacements: {
            id_pedido: idPedido,
            id_usuario: idUsuario,
            fecha_entrega: distribucion.fecha_entrega,
            estado: distribucion.estado,
            observaciones: distribucion.observaciones
          },
          type: sequelize.QueryTypes.INSERT,
          transaction
        }
      );
      console.log(`Distribución - Pedido ${distribucion.num_pedido} - ${distribucion.estado}`);
    }
    console.log("");

    // COMMIT
    await transaction.commit();

    console.log("\n¡TODOS LOS DATOS FUERON INSERTADOS EXITOSAMENTE!");
    console.log("\n Resumen:");
    console.log(` Usuarios: ${Object.keys(usuariosIds).length}`);
    console.log(` Categorías: ${categoriasData.length}`);
    console.log(` Productos: ${productosIds.length}`);
    console.log(` Fórmulas: ${Object.keys(formulasIds).length}`);
    console.log(` Vehículos: ${vehiculosData.length}`);
    console.log(` Pedidos: ${pedidosIds.length}`);
    console.log(` Pagos: ${pagosData.length}`);
    console.log(` Distribuciones: ${distribucionesData.length}`);

    console.log("\n CREDENCIALES DE ADMIN:");
    console.log(`  Email: ${adminData.email}`);
    console.log(`  Contraseña: ${adminData.contrasena}`);

    console.log("\n CREDENCIALES DE USUARIOS:");
    console.log(`  María: maria@email.com / Maria123*`);
    console.log(`  Carlos: carlos@email.com / Carlos456*`);
    console.log(`  Laura: laura@email.com / Laura202*`);
    console.log(`  Juan: juan@email.com / Juan303*`);
    console.log(`  Patricia: patricia@email.com / Patricia404*`);
    console.log(`  Carmen: carmen@email.com / Carmen606*`);
    console.log(`  Ana (Repartidor): ana@email.com / Ana789*`);
    console.log(`  Luis (Repartidor): luis@email.com / Luis101*`);

  } catch (error) {
    await transaction.rollback();
    console.error("\n Error al insertar datos:", error);
    console.error("Detalles:", error.message);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log("\n Conexión a la base de datos cerrada");
    process.exit(0);
  }
};

// EJECUTAR
seedAll();