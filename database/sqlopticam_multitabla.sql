-- CONSULTAS SHARIHT MOSQUERA, VALENTINA RAMIREZ

/* 2. CONSULTAS DE SELECCIÓN                                                             */
/* 2.1. Unión Externa : .............. UNION, UNION ALL                                  */
/* 2.1.1. UNION : .................... SELECT _ FROM _ UNION SELECT _ FROM _             */

-- Genera una lista única con los nombres de los usuarios y las marcas de los productos
SELECT nombre_completo AS dato
FROM usuarios
UNION
SELECT marca
FROM productos;

-- Generar una lista única de formas de identificación de usuarios y vehículos (documentos y placas)
SELECT id_usuario, documento AS identificacion
FROM USUARIOS
UNION
SELECT id_usuario, placa
FROM VEHICULOS;

-- Muestra en una sola lista: de todos los usuarios que residen en Bogota
SELECT * 
FROM USUARIOS 
UNION 
SELECT * 
FROM USUARIOS_BOGOTA;

/* 2.1.2. UNION ALL : ................ SELECT _ FROM _ UNION ALL SELECT _ FROM _         */
-- Muestra todas las direcciones de usuarios y direcciones de entrega de pedidos (con repetidos)
SELECT direccion AS direcciones
FROM usuarios
UNION ALL
SELECT direccion_entrega
FROM pedidos;

-- Generar un listado completo de todos los nombres registrados en el sistema, incluyendo clientes y productos.
SELECT id_usuario, nombre_completo
FROM USUARIOS
UNION ALL
SELECT id_producto, nombre
FROM PRODUCTOS;

-- Muestra en una sola consulta: las ciudades de los usuarios y los colores de los productos;
SELECT ciudad 
FROM USUARIOS 
UNION ALL 
SELECT color 
FROM PRODUCTOS;

/* 2.2. Unión Interna : .............. INNER JOIN, LEFT JOIN, RIGHT JOIN                 */
/* 2.2.1. INNER JOIN : ............... SELECT _ FROM _ INNER JOIN _ ON _._ = _._         */
/* 2.2.1.1. Con Repeticiones : ....... INNER JOIN */
-- Muestra el nombre del usuario y la fecha de entrega de sus pedidos
SELECT nombre_completo, fecha_entrega
FROM usuarios
INNER JOIN pedidos
ON usuarios.id_usuario = pedidos.id_usuario;

-- Mostrar cada pedido junto con la información del cliente que lo realizó.
SELECT U.nombre_completo, P.id_pedido, P.fecha_pedido, P.estado, P.direccion_entrega, P.total
FROM PEDIDOS P
INNER JOIN USUARIOS U
ON P.id_usuario = U.id_usuario;

-- Mostrar las fórmulas médicas junto con el cliente correspondiente.
 SELECT F.id_formula, U.nombre_completo, F.condicion, F.costo
FROM FORMULAS F
INNER JOIN USUARIOS U
ON F.id_usuario = U.id_usuario;

-- Muestra los datos de clientes junto a sus pedidos.
SELECT * 
FROM USUARIOS 
INNER JOIN PEDIDOS 
ON usuarios.id_usuario = pedidos.id_usuario;
                                   
/* 2.2.1.2. Sin Repeticiones : ....... DISTINCT */
-- Obtén las ciudades de usuarios que han hecho pedidos sin repetir
SELECT DISTINCT ciudad, nombre_completo
FROM usuarios
INNER JOIN pedidos
ON usuarios.id_usuario = pedidos.id_usuario;

-- Obtener las categorías que tienen productos disponibles para venta.
 SELECT DISTINCT C.tipo_categoria
FROM CATEGORIAS C
INNER JOIN PRODUCTOS P
ON C.id_categoria = P.id_categoria;
                             
-- Muestra las marcas de productos vendidos sin repetir marcas
SELECT DISTINCT marca 
FROM PRODUCTOS 
INNER JOIN PEDIDOS_PRODUCTOS 
ON productos.id_producto = pedidos_productos.id_producto;

/* 2.2.1.3. Condicionada : ........... WHERE, OPERADORES, ORDER BY  */
-- Muestra productos (nombre y precio) que pertenezcan a la categoría "MONTURAS"
SELECT nombre, precio
FROM productos 
INNER JOIN categorias
ON productos.id_categoria = categorias.id_categoria
WHERE tipo_categoria = "MONTURAS";

-- Mostrar los pagos pendientes junto con el pedido correspondiente.
SELECT PA.id_pago, PE.id_pedido, PA.monto, PA.eleccion_pago
FROM PAGOS PA
INNER JOIN PEDIDOS PE
ON PA.id_pedido = PE.id_pedido
WHERE PA.estado = 'PENDIENTE';

-- 4.Mostrar las fórmulas de pacientes con miopía junto con sus datos. 
 SELECT U.nombre_completo, F.condicion
FROM FORMULAS F
INNER JOIN USUARIOS U
ON F.id_usuario = U.id_usuario
WHERE F.condicion = 'MIOPIA';

-- Muestra los pedidos cuyo total sea mayor a 300000 incluyendo nombre del usuario, total Y estado del pedido
SELECT nombre_completo, total, pedidos.estado 
FROM USUARIOS 
INNER JOIN PEDIDOS 
ON usuarios.id_usuario = pedidos.id_usuario 
WHERE total > 300000;    
	
/* 2.2.2. LEFT JOIN : ................ SELECT _ FROM _ LEFT JOIN _ ON _._ = _._          */
-- Muestra todos los usuarios junto con sus pedidos, incluso si no tienen
SELECT nombre_completo
FROM usuarios
LEFT JOIN pedidos
ON usuarios.id_usuario = pedidos.id_usuario;

-- Mostrar todos los usuarios, incluso si no tienen fórmulas médicas.
SELECT U.nombre_completo, F.id_formula
FROM USUARIOS U
LEFT JOIN FORMULAS F
ON U.id_usuario = F.id_usuario;

-- Mostrar todos los usuarios, incluso si no poseen vehículo.
SELECT U.nombre_completo, V.modelo
FROM USUARIOS U
LEFT JOIN VEHICULOS V
ON U.id_usuario = V.id_usuario;

-- Muestra todos los productos incluso si no han sido vendidos
SELECT productos.id_producto, productos.nombre, pedidos_productos.id_pedido 
FROM PRODUCTOS 
LEFT JOIN PEDIDOS_PRODUCTOS 
ON productos.id_producto = pedidos_productos.id_producto;

/* 2.2.2. RIGHT JOIN : ............... SELECT _ FROM _ RIGHT JOIN _ ON _._ = _._         */
-- Muestra todos los pagos junto con el total del pedido correspondiente
SELECT PEDIDOS.total, PAGOS.id_pago, PAGOS.monto, PAGOS.estado
FROM PEDIDOS
RIGHT JOIN PAGOS
ON PEDIDOS.id_pedido = PAGOS.id_pedido;

-- Mostrar todos los pedidos junto con el cliente correspondiente, asegurando incluir todos los pedidos.
SELECT U.nombre_completo, P.id_pedido
FROM USUARIOS U
RIGHT JOIN PEDIDOS P
ON U.id_usuario = P.id_usuario;

-- Mostrar todos los vehículos junto con los usuarios propietarios.
SELECT V.modelo, U.nombre_completo
FROM VEHICULOS V
RIGHT JOIN USUARIOS U
ON V.id_usuario = U.id_usuario;

-- Muestra todos los pedidos incluso si no tienen pagos registrados
SELECT pedidos.id_pedido, pedidos.total, id_pago, pagos.estado 
FROM PEDIDOS 
RIGHT JOIN PAGOS 
ON pedidos.id_pedido = pagos.id_pedido; 

/* 2.3. Subconsultas : ............... IN, NOT IN                                        */
/* 2.3.1. Escalonada : ............... SELECT _ FROM _ WHERE _ IN (SELECT _ FROM _ )     */

-- Obtén los nombres de usuarios que han hecho pedidos entregados
SELECT nombre_completo
FROM USUARIOS
WHERE id_usuario IN (
  SELECT id_usuario
  FROM PEDIDOS
  WHERE estado = 'ENTREGADO'
);

-- 3.Identificar los pedidos realizados por clientes de una ciudad determinada.
SELECT id_pedido
FROM PEDIDOS
WHERE id_usuario IN (
  SELECT id_usuario FROM USUARIOS
  WHERE ciudad = 'Bogotá'
);

-- 5.Identificar los pagos correspondientes a pedidos entregados.
SELECT id_pago, eleccion_pago
FROM PAGOS
WHERE id_pedido IN (
  SELECT id_pedido FROM PEDIDOS
  WHERE estado = 'ENTREGADO'
);

/* 2.3.2. Lista : .................... SELECT _ FROM _ WHERE _ IN (SELECT _ FROM _ )     */

-- Muestra los pedidos que tienen una fórmula asociada
SELECT id_pedido
FROM PEDIDOS
WHERE id_formula IN (
  SELECT id_formula
  FROM FORMULAS
);

-- 5.dentificar los pedidos que requieren fórmula médica.
SELECT id_pedido
FROM PEDIDOS
WHERE id_formula IN (
  SELECT id_formula FROM FORMULAS
);

/* 2.3.2. Correlacionada : ........... SELECT _ FROM _ WHERE _ IN (SELECT _ FROM _ )     */

-- Obtén los nombres de usuarios que tienen al menos un pedido
SELECT nombre_completo
FROM USUARIOS U
WHERE id_usuario IN (
  SELECT P.id_usuario
  FROM PEDIDOS P
  WHERE P.id_usuario = U.id_usuario
);

-- 3.Identificar los usuarios que poseen al menos una fórmula médica.
SELECT nombre_completo, email
FROM USUARIOS U
WHERE id_usuario IN (
  SELECT F.id_usuario
  FROM FORMULAS F
  WHERE F.id_usuario = U.id_usuario
);

-- 5.Identificar los usuarios que disponen de vehículos para reparto.
SELECT nombre_completo
FROM USUARIOS U
WHERE id_usuario IN (
  SELECT V.id_usuario
  FROM VEHICULOS V
  WHERE V.id_usuario = U.id_usuario
);

-- Muestra los usuarios que tienen pedidos usando subconsulta con IN
SELECT nombre_completo 
FROM USUARIOS 
WHERE id_usuario IN (
SELECT id_usuario 
FROM PEDIDOS);

-- Muestra los productos que han sido vendidos
SELECT nombre, marca 
FROM PRODUCTOS 
WHERE id_producto IN (
SELECT id_producto 
FROM PEDIDOS_PRODUCTOS);

-- Muestra los usuarios que NO han hecho pedidos
SELECT nombre_completo 
FROM USUARIOS 
WHERE id_usuario NOT IN (
SELECT id_usuario 
FROM PEDIDOS);

-- Muestra los productos que nunca se han vendido
SELECT nombre, marca 
FROM PRODUCTOS 
WHERE id_producto NOT IN (
SELECT id_producto 
FROM PEDIDOS_PRODUCTOS);

-- Muestra los productos que nunca han sido incluidos en pedidos

SELECT nombre, marca
FROM PRODUCTOS
WHERE id_producto NOT IN (
  SELECT id_producto
  FROM PEDIDOS_PRODUCTOS
);