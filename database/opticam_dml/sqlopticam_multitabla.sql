-- CONSULTAS SHARIHT MOSQUERA, VALENTINA RAMIREZ, SAIDA ROZO ,JUAN FORERO

/* 1. CONSULTAS DE ACCIÓN [Inicio]                                                       */
/* 1.1. Crear una Tabla con Otra : ... CREATE TABLE _ SELECT _ FROM _ WHERE _ = _        */

-- -----------------------------------------------------
--  ¿Qué usuarios viven en Bogotá?
-- -----------------------------------------------------
CREATE TABLE USUARIOS_BOGOTA
SELECT *
FROM USUARIOS
WHERE ciudad = 'Bogotá';


/* 1.2. Insertar Datos Anexados : .... INSERT INTO _ SELECT _ FROM _                     */

-- -----------------------------------------------------
--  ¿Qué usuarios son clientes y quiero agregarlos a otra tabla?
-- -----------------------------------------------------
INSERT INTO USUARIOS_BOGOTA
SELECT U.*
FROM USUARIOS U
INNER JOIN ROL_USUARIO RU ON U.id_usuario = RU.id_usuario
WHERE RU.id_rol = 2;


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

-- Genera una lista única de categorías de productos y tipos de tratamientos de lentes (catálogo general)
SELECT tipo_categoria AS lista_general
FROM CATEGORIAS
UNION
SELECT tipo_atributo
FROM ATRIBUTOS_LENTE;

-- Generar una lista única de identificadores de productos y atributos de lentes registrados
SELECT id_producto AS codigo
FROM PRODUCTOS
UNION
SELECT id_atributoslente
FROM ATRIBUTOS_LENTE;

-- -----------------------------------------------------
--  ¿Qué nombres existen entre usuarios y productos sin repetir?
-- -----------------------------------------------------
SELECT nombre_completo AS nombre
FROM USUARIOS
UNION
SELECT nombre
FROM PRODUCTOS;


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

-- Muestra todas las direcciones de residencia de usuarios y las de entrega en pedidos (incluyendo repetidos)
SELECT direccion AS ubicaciones
FROM USUARIOS
UNION ALL
SELECT direccion_entrega
FROM PEDIDOS;

-- Muestra un listado consolidado de todos los nombres: tanto de usuarios como de monturas
SELECT nombre_completo AS nombre
FROM USUARIOS
UNION ALL
SELECT nombre
FROM PRODUCTOS;

-- -----------------------------------------------------
--  ¿Qué nombres existen entre usuarios y productos incluyendo repetidos?
-- -----------------------------------------------------
SELECT nombre_completo AS nombre
FROM USUARIOS
UNION ALL
SELECT nombre
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

-- Mostrar qué cliente compró qué montura y qué tipo de cristal seleccionó en el formulario
SELECT U.nombre_completo, P.nombre AS montura, A.nombre_opcion AS cristal
FROM USUARIOS U
INNER JOIN PEDIDOS PE ON U.id_usuario = PE.id_usuario
INNER JOIN PEDIDOS_PRODUCTOS PP ON PE.id_pedido = PP.id_pedido
INNER JOIN ATRIBUTOS_LENTE A ON PP.id_atributolente = A.id_atributoslente;

-- Mostrar el detalle de los pagos realizados junto con el estado del pedido correspondiente
SELECT PA.id_pago, PA.monto, PE.id_pedido, PE.estado
FROM PAGOS PA
INNER JOIN PEDIDOS PE ON PA.id_pedido = PE.id_pedido;

-- -----------------------------------------------------
--  ¿Qué rol tiene cada usuario?
-- -----------------------------------------------------
SELECT U.nombre_completo, R.nombre
FROM USUARIOS U
INNER JOIN ROL_USUARIO RU ON U.id_usuario = RU.id_usuario
INNER JOIN ROLES R ON RU.id_rol = R.id_rol;


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

-- Obtener las marcas de monturas que han tenido al menos una venta registrada
SELECT DISTINCT PR.marca
FROM PRODUCTOS PR
INNER JOIN PEDIDOS_PRODUCTOS PP ON PR.id_producto = PP.id_producto;

-- Mostrar los tipos de atributos (filtros, materiales) que han sido seleccionados en pedidos
SELECT DISTINCT A.tipo_atributo
FROM ATRIBUTOS_LENTE A
INNER JOIN PEDIDOS_PRODUCTOS PP ON A.id_atributoslente = PP.id_atributolente;

-- -----------------------------------------------------
--  ¿En qué ciudades viven los usuarios sin repetir?
-- -----------------------------------------------------
SELECT DISTINCT ciudad
FROM USUARIOS;


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

-- Mostrar pedidos con un total superior a 500,000 que se encuentren en estado 'ENTREGADO'
SELECT PE.id_pedido, U.nombre_completo, PE.total
FROM PEDIDOS PE
INNER JOIN USUARIOS U ON PE.id_usuario = U.id_usuario
WHERE PE.total > 500000 AND PE.estado = 'ENTREGADO';

-- Mostrar fórmulas médicas de pacientes con 'ASTIGMATISMO' junto a sus datos de contacto
SELECT U.nombre_completo, F.condicion, U.telefono
FROM FORMULAS F
INNER JOIN USUARIOS U ON F.id_usuario = U.id_usuario
WHERE F.condicion = 'ASTIGMATISMO';

-- -----------------------------------------------------
--  ¿Qué usuarios tienen pedidos entregados?
-- -----------------------------------------------------
SELECT U.nombre_completo, P.fecha_pedido, P.estado
FROM USUARIOS U
INNER JOIN PEDIDOS P ON U.id_usuario = P.id_usuario
WHERE P.estado = 'ENTREGADO'
ORDER BY P.fecha_pedido DESC;


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

-- -----------------------------------------------------
--  ¿Qué usuarios existen aunque no hayan hecho pedidos?
-- -----------------------------------------------------
SELECT U.nombre_completo, P.id_pedido
FROM USUARIOS U
LEFT JOIN PEDIDOS P ON U.id_usuario = P.id_usuario;


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

-- -----------------------------------------------------
--  ¿Qué pedidos existen aunque no tengan usuario asociado?
-- -----------------------------------------------------
SELECT U.nombre_completo, P.id_pedido
FROM USUARIOS U
RIGHT JOIN PEDIDOS P ON U.id_usuario = P.id_usuario;


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

-- Identificar los pedidos realizados por clientes de una ciudad determinada.
SELECT id_pedido
FROM PEDIDOS
WHERE id_usuario IN (
  SELECT id_usuario FROM USUARIOS
  WHERE ciudad = 'Bogotá'
);

-- Identificar los pagos correspondientes a pedidos entregados.
SELECT id_pago, eleccion_pago
FROM PAGOS
WHERE id_pedido IN (
  SELECT id_pedido FROM PEDIDOS
  WHERE estado = 'ENTREGADO'
);


/* 2.3.2. Lista : .................... SELECT _ FROM _ WHERE _ IN (SELECT _ FROM _ )     */

-- -----------------------------------------------------
--  ¿Qué usuarios han realizado pedidos?
-- -----------------------------------------------------
SELECT nombre_completo
FROM USUARIOS
WHERE id_usuario IN (
    SELECT id_usuario
    FROM PEDIDOS
);

-- -----------------------------------------------------
--  ¿Qué productos han sido comprados en pedidos?
-- -----------------------------------------------------
SELECT nombre
FROM PRODUCTOS
WHERE id_producto IN (
    SELECT id_producto
    FROM PEDIDOS_PRODUCTOS
);


/* 2.3.2. Correlacionada : ........... SELECT _ FROM _ WHERE _ IN (SELECT _ FROM _ )     */

-- -----------------------------------------------------
--  ¿Qué usuarios han hecho más de un pedido?
-- -----------------------------------------------------
SELECT U.nombre_completo
FROM USUARIOS U
WHERE (
    SELECT COUNT(*)
    FROM PEDIDOS P
    WHERE P.id_usuario = U.id_usuario
) > 1;

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

-- Mostrar usuarios que NO tienen ninguna fórmula médica registrada en el sistema
SELECT nombre_completo, documento
FROM USUARIOS
WHERE id_usuario NOT IN (
  SELECT id_usuario FROM FORMULAS
);