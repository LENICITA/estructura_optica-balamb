-- ------------------------------------------------------------------------------------- --
-- Muestra todos los datos de las tablas:  ------------------------------------------------------------- --
-- ------------------------------------------------------------------------------------- --
SELECT * FROM ROLES;
SELECT * FROM USUARIOS;
SELECT * FROM ROL_USUARIO;
SELECT * FROM CATEGORIAS;
SELECT * FROM PRODUCTOS;
SELECT * FROM FORMULAS;
SELECT * FROM PEDIDOS;
SELECT * FROM PEDIDOS_PRODUCTOS;
SELECT * FROM VEHICULOS;
SELECT * FROM PAGOS;

-- ------------------------------------------------------------------------------------- --
-- SELECT _ FROM _ ---------------------------------------------------------------------------------
-- Muestra el nombre completo, la ciudad y la direccion de los usuarios.  ---------------------
-- ------------------------------------------------------------------------------------- --
SELECT nombre_completo, ciudad, direccion
FROM USUARIOS;
-- ------------------------------------------------------------------------------------- --
-- Muestra el nombre, la marca y el precio de los productos.  ---------------------
-- ------------------------------------------------------------------------------------- --
SELECT nombre, marca, precio
FROM PRODUCTOS;
-- ------------------------------------------------------------------------------------- --
-- Muestra la fecha del pedido, fecha de entrega y el estado.  ---------------------
-- ------------------------------------------------------------------------------------- --
SELECT fecha_pedido, fecha_entrega, estado
FROM PEDIDOS;
-- ------------------------------------------------------------------------------------- --
-- Muestra el tipo de categoría y su descripción.  ---------------------
-- ------------------------------------------------------------------------------------- --
SELECT tipo_categoria, descripcion
FROM CATEGORIAS;
-- ------------------------------------------------------------------------------------- --
-- Muestra el tipo, modelo y placa de los vehículos.  ---------------------
-- ------------------------------------------------------------------------------------- --
SELECT tipo, modelo, placa
FROM VEHICULOS;


-- ------------------------------------------------------------------------------------- --
-- SELECT _ FROM _ WHERE _ ; ----------------------------------------------------------------------------------
-- Muestra los usuarios que viven en Bogotá.  -------------------------------------
-- ------------------------------------------------------------------------------------- --
SELECT nombre_completo FROM USUARIOS WHERE ciudad = "Bogotá";
-- ------------------------------------------------------------------------------------- --
-- Muestra los productos que cuestan 10000. -------------------------------------
-- ------------------------------------------------------------------------------------- --
SELECT nombre FROM PRODUCTOS WHERE precio = 10000;
-- ------------------------------------------------------------------------------------- --
-- Muestra los pedidos que estén en estado "PENDIENTE". -------------------------------------
-- ------------------------------------------------------------------------------------- --
SELECT id_pedido, estado FROM PEDIDOS WHERE estado = "PENDIENTE";
-- ------------------------------------------------------------------------------------- --
-- Muestra los pagos cuyo estado sea "APROBADO". -------------------------------------
-- ------------------------------------------------------------------------------------- --
SELECT id_pago, estado, monto FROM PAGOS WHERE estado = "APROBADO";
-- ------------------------------------------------------------------------------------- --
-- Muestra los productos cuya marca sea "Rayban". -------------------------------------
-- ------------------------------------------------------------------------------------- --
SELECT nombre, precio FROM PRODUCTOS WHERE marca = "Rayban";


-- ------------------------------------------------------------------------------------- --
-- OR  ----------------------------------------------------------------------------------
-- Muestra los usuarios que vivan en Bogotá o Medellín. -----------------------------------
-- ------------------------------------------------------------------------------------- --
SELECT nombre_completo, ciudad FROM USUARIOS WHERE ciudad = "Bogotá" OR ciudad = "Medellín";
-- ------------------------------------------------------------------------------------- --
-- Muestra los productos cuya marca sea Rayban o Prada. -----------------------------------
-- ------------------------------------------------------------------------------------- --
SELECT nombre, marca FROM PRODUCTOS WHERE marca = "Rayban" OR marca = "Prada";
-- ------------------------------------------------------------------------------------- --
-- Muestra los pedidos que estén en estado "ENTREGADO" o "PENDIENTE". ---------------------
-- ------------------------------------------------------------------------------------- --
SELECT nombre, estado FROM PEDIDOS WHERE estado = "ENTREGADO" OR marca = "PENDIENTE";
-- ------------------------------------------------------------------------------------- --
-- Muestra los productos cuyo color sea Negro o Azul. ------------------------------------
-- ------------------------------------------------------------------------------------- --
SELECT nombre, color FROM PRODUCTOS WHERE color = "Negro" OR color = "Azul";
-- ------------------------------------------------------------------------------------- --
-- Muestra los pagos que estén en estado APROBADO o PENDIENTE. ----------------------------
-- ------------------------------------------------------------------------------------- --
SELECT id_pago, estado FROM PAGOS WHERE estado = "APROBADO" OR estado = "PENDIENTE";


-- ------------------------------------------------------------------------------------- --
-- AND ----------------------------------------------------------------------------------
-- Muestra los usuarios que vivan en Bogotá y estén en estado ACTIVO. ---------------------
-- ------------------------------------------------------------------------------------- --

SELECT nombre_completo, ciudad, estado FROM USUARIOS WHERE ciudad = "Bogotá" AND estado = "ACTIVO";
-- ------------------------------------------------------------------------------------- --
-- Muestra los productos que sean de marca Rayban y color Negro. --------------------------
-- ------------------------------------------------------------------------------------- --
SELECT nombre, marca, color FROM PRODUCTOS WHERE marca = "Rayban" AND color = "Negro";
-- ------------------------------------------------------------------------------------- --
-- Muestra los pedidos que estén en estado ENTREGADO y tengan costo de envío 8000. --------
-- ------------------------------------------------------------------------------------- --
SELECT id_pedido, estado, costo_envio FROM PEDIDOS WHERE estado = "ENTREGADO" AND costo_envio = 8000;
-- ------------------------------------------------------------------------------------- --
-- Muestra los pagos que estén APROBADOS y cuyo canal de pago sea BOLD. ---------------
-- ------------------------------------------------------------------------------------- --
SELECT id_pago, estado, canal_pago FROM PEDIDOS WHERE estado = "APROBADOS" AND canal_pago = "BOLD";
-- ------------------------------------------------------------------------------------- --
-- Muestra los productos que sean de marca Nike y color Negro. ---------------------------
-- ------------------------------------------------------------------------------------- --
SELECT nombre, marca, color FROM PRODUCTOS WHERE marca = "Nike" AND color = "Negro";


-- ------------------------------------------------------------------------------------- --
-- NOT IN----------------------------------------------------------------------------------
-- Muestra los usuarios que NO vivan en Bogotá. ---------------------------
-- ------------------------------------------------------------------------------------- --

SELECT nombre_completo, ciudad FROM USUARIOS WHERE ciudad NOT IN ("Bogotá");
-- ------------------------------------------------------------------------------------- --
-- Muestra los productos que NO sean de la marca Rayban. ---------------------------
-- ------------------------------------------------------------------------------------- --
SELECT nombre, marca FROM PRODUCTOS WHERE marca NOT IN ("Rayban");
-- ------------------------------------------------------------------------------------- --
-- Muestra los pedidos que NO estén en estado ENTREGADO. ---------------------------
-- ------------------------------------------------------------------------------------- --
SELECT id_pedido, estado WHERE estado NOT IN ("ENTREGADO");
-- ------------------------------------------------------------------------------------- --
-- Muestra los pagos que NO estén APROBADOS. ---------------------------
-- ------------------------------------------------------------------------------------- --
SELECT id_pagos, estado FROM PAGOS WHERE estado NOT IN ("APROBADOS");
-- ------------------------------------------------------------------------------------- --
-- Muestra los productos cuyo color NO sea Negro. ---------------------------
-- ------------------------------------------------------------------------------------- --
SELECT nombre, color FROM PRODUCTOS WHERE color NOT IN ("Negro");  

-- -----------------------------------------------------
-- Diferente <>
--  ¿Qué usuarios no viven en Bogotá?
-- -----------------------------------------------------
SELECT nombre_completo, ciudad
FROM USUARIOS
WHERE ciudad <> 'Bogotá';
-- -----------------------------------------------------
-- ¿Qué productos no son de la marca Rayban?
-- -----------------------------------------------------
SELECT nombre, marca
FROM PRODUCTOS
WHERE marca <> 'Rayban';
-- -----------------------------------------------------
-- ¿Qué pedidos no están en estado ENTREGADO?
-- -----------------------------------------------------
SELECT id_pedido, estado
FROM PEDIDOS
WHERE estado <> 'ENTREGADO';
-- -----------------------------------------------------
-- Menor que <
-- ¿Qué productos tienen un precio menor a 200000?
-- -----------------------------------------------------
SELECT nombre, precio
FROM PRODUCTOS
WHERE precio < 200000;
-- -----------------------------------------------------
-- ¿Qué pagos tienen un monto menor a 100000?
-- -----------------------------------------------------
SELECT id_pago, monto
FROM PAGOS
WHERE monto < 100000;
-- -----------------------------------------------------
-- ¿Qué fórmulas tienen un costo menor a 60000?
-- -----------------------------------------------------
SELECT id_formula, condicion, costo
FROM FORMULAS
WHERE costo < 60000;
-- -----------------------------------------------------
-- Mayor que >
-- ¿Qué productos tienen un precio mayor a 300000?
-- -----------------------------------------------------
SELECT nombre, precio
FROM PRODUCTOS
WHERE precio > 300000;
-- -----------------------------------------------------
-- ¿Qué pedidos tienen un total mayor a 500000?
-- -----------------------------------------------------
SELECT id_pedido, total
FROM PEDIDOS
WHERE total > 500000;
-- -----------------------------------------------------
-- ¿Qué pagos tienen un monto mayor a 300000?
-- -----------------------------------------------------
SELECT id_pago, monto
FROM PAGOS
WHERE monto > 300000;
-- -----------------------------------------------------
-- menor o igual <=
-- ¿Qué productos tienen un precio menor o igual a 250000?
-- -----------------------------------------------------
SELECT nombre, precio
FROM PRODUCTOS
WHERE precio <= 250000;
-- -----------------------------------------------------
-- ¿Qué fórmulas tienen un costo menor o igual a 60000?
-- -----------------------------------------------------
SELECT id_formula, condicion, costo
FROM FORMULAS
WHERE costo <= 60000;
-- -----------------------------------------------------
-- ¿Qué pagos tienen un monto menor o igual a 300000?
-- -----------------------------------------------------
SELECT id_pago, monto
FROM PAGOS
WHERE monto <= 300000;
-- -----------------------------------------------------
-- Mayor igual >=
-- ¿Qué productos tienen un precio mayor o igual a 400000?
-- -----------------------------------------------------
SELECT nombre, precio
FROM PRODUCTOS
WHERE precio >= 400000;
-- -----------------------------------------------------
-- ¿Qué pedidos tienen un total mayor o igual a 300000?
-- -----------------------------------------------------
SELECT id_pedido, total
FROM PEDIDOS
WHERE total >= 300000;
-- -----------------------------------------------------
-- ¿Qué fórmulas tienen un costo mayor o igual a 60000?
-- -----------------------------------------------------
SELECT id_formula, condicion, costo
FROM FORMULAS
WHERE costo >= 60000;

-- 2.6.1. Comodín [LIKE]:
-- Encuentra los usuarios cuyo telefono empiece con el prefijo '301'.
SELECT nombre_completo, telefono FROM USUARIOS WHERE telefono LIKE '301%';
-- Busca los productos cuyo material sea de titanio.
SELECT * FROM PRODUCTOS WHERE material LIKE 'Titanio%';

-- 2.6.2. Entre [BETWEEN]:
-- Encuentra los pedidos que su total a pagar este entre 500,000 y 1,000,000.
SELECT id_pedido, total FROM PEDIDOS WHERE total BETWEEN 500000 AND 1000000;
-- Encuentra los usuarios que nacieron entre el '1990-01-01' y el '1995-12-31'.
SELECT nombre_completo, fecha_nacimiento FROM USUARIOS WHERE fecha_nacimiento BETWEEN '1990-01-01' AND '1995-12-31';

-- 2.6.3. Lista [IN]:
-- Marketing necesita datos de usuarios que vivan en Medellin o Cartagena.
SELECT * FROM USUARIOS WHERE ciudad IN('Medellín', 'Cartagena');
-- Busca los pagos cuyos estado sea aprobado o pendiente.
SELECT * FROM pagos WHERE estado IN('APROBADO', 'PENDIENTE');

-- 2.7.1. Ascendente [ASC]:
-- Selecciona el nombre y precio de los productos que sean de la marca 'Rayban' y ordenalos de menor a mayor.
SELECT nombre, precio FROM PRODUCTOS WHERE marca = 'Rayban' ORDER BY precio ASC;

-- 2.7.2. Descendente [DESC]:
-- Selecciona el usuario que sea miope y ordena el valor de la formula del mas alto al mas bajo.
SELECT id_usuario, costo FROM FORMULAS WHERE condicion = 'MIOPIA' ORDER BY costo DESC;

-- 2.7.3. Combinadas:
-- Mostrar el nombre, categoría y precio de los productos de las categorías 2 y 3, ordenados primero por categoría de menor a mayor (ASC) y dentro de cada categoría por precio de mayor a menor (DESC).
SELECT nombre, id_categoria, precio
FROM PRODUCTOS
WHERE id_categoria = 2 OR id_categoria = 3
ORDER BY id_categoria ASC, precio DESC;

-- ------------------------------------------------------------------------------------- --
-- 2.8. Calculadas con Funciones. ------------------------------------------------------ --
-- GROUP BY : --------------------------------------------------------------------- --
-- ------------------------------------------------------------------------------------- --

-- ------------------------------------------------------------------------------------- --
-- 2.8.1. Suma [SUM()] . --------------------------------------------------------------- --
-- ------------------------------------------------------------------------------------- --

-- ¿Cuál es el total de compras registradas en la tabla PEDIDOS?
SELECT SUM(total)
FROM PEDIDOS;

-- ¿Cuál es la suma total de los pedidos realizados por el usuario 2?
SELECT SUM(total)
FROM PEDIDOS
WHERE id_usuario = 2;

-- ¿Cuál es el total de dinero en pedidos realizado por cada usuario?
SELECT id_usuario, SUM(total)
FROM PEDIDOS
GROUP BY id_usuario;


-- ------------------------------------------------------------------------------------- --
-- 2.8.2. Promedio [AVG()] . ----------------------------------------------------------- --
-- ------------------------------------------------------------------------------------- --

-- ¿Cuál es el promedio del costo de envío del pedido con id 4?
SELECT AVG(costo_envio)
FROM PEDIDOS
WHERE id_pedido = 4;

-- ¿Cuál es el promedio del costo de envío de los pedidos por cada usuario?
SELECT id_usuario, AVG(costo_envio)
FROM PEDIDOS
GROUP BY id_usuario;


-- ------------------------------------------------------------------------------------- --
-- 2.8.3. Máximo [MAX()] . ------------------------------------------------------------- --
-- ------------------------------------------------------------------------------------- --

-- ¿Cuál es el valor máximo del total de los pedidos del usuario con id 3?
SELECT MAX(total)
FROM PEDIDOS
WHERE id_usuario = 3;

-- ¿Cuál es el producto más costoso de cada marca?

SELECT nombre, marca, MAX(precio) AS precio_maximo
FROM PRODUCTOS
GROUP BY marca;


-- ------------------------------------------------------------------------------------- --
-- 2.8.4. Mínimo [MIN()] . ------------------------------------------------------------- --
-- ------------------------------------------------------------------------------------- --

-- ¿Cuál es el valor mínimo del total de los pedidos del usuario con id 4?
SELECT MIN(total)
FROM PEDIDOS
WHERE id_usuario = 4;

-- ¿Cuál es el producto más barato de cada marca?
SELECT nombre, marca, MIN(precio) AS precio_minimo
FROM PRODUCTOS
GROUP BY marca;


-- ------------------------------------------------------------------------------------- --
-- 2.8.5. Conteo [COUNT()] . ----------------------------------------------------------- --
-- ------------------------------------------------------------------------------------- --

-- ¿Cuántos pedidos ha realizado el usuario con id 2?
SELECT COUNT(*)
FROM PEDIDOS
WHERE id_usuario = 2;

-- ¿Cuántos pedidos ha realizado cada usuario?
SELECT id_usuario, COUNT(*)
FROM PEDIDOS
GROUP BY id_usuario;

/* 2.9. Calculadas con Alias : ....... SELECT __ , FUN( __ ) AS __ FROM __               */
-- ¿Cuántos productos existen por cada categoría?
select id_categoria, COUNT(*) AS total_productos
from PRODUCTOS
group by id_categoria
order by total_productos DESC;

-- ¿Cuántos usuarios hay registrados en cada ciudad?
select ciudad, count(*) as total_usuarios
from USUARIOS
group by ciudad
order by total_usuarios ASC;

/* 2.10. Calculadas Condicionantes : . GROUP BY __ HAVING __ = __ OR __ = __             */
-- Mostrar las ciudades que tengan más de 2 usuarios registrados.
select ciudad, count(*) AS total_usuarios
from USUARIOS
group by ciudad HAVING count(*) >2;

-- Mostrar las categorías que tengan más de 5 productos.
select id_categoria, count(*) AS total_productos
from PRODUCTOS
group by id_categoria having count(*) >5;

/* 2.11. Calculadas con Operadores : . SELECT __ , __ , ROUND( __*0.19,2) AS __ FROM __  */
-- Mostrar el total del pedido y el valor del impuesto calculado.
select id_pedido, total, round(total * 0.19) AS iva_total
from PEDIDOS;

-- Mostrar el nombre del producto, su precio y el valor del IVA (19%).
select  nombre, precio, round(precio * 0.19) as iva 
from PRODUCTOS;
/* 2.12. Calculadas con Fechas : ..... NOW(), DATE_FORMAT(), TIMESTAMPDIFF()             */
/* 2.12.1. Fecha Actual : ............ NOW()     
--Mostrar la fecha y hora actual del sistema.
select NOW() AS fecha_actual;

--Mostrar la fecha actual junto con el nombre de los usuarios.
select nombre_completo, now() as fecha_actual
from USUARIOS;
									
/* 2.12.2. Formato Fecha : ........... DATE_FORMAT(NOW(), '%Y-%m-%d')                    */
-- Mostrar la fecha actual en formato día/mes/año.
select DATE_FORMAT(NOW(),'%d-%m-%Y') AS fecha_formateada;

-- Mostrar la fecha de registro de los usuarios formateada.
select nombre_completo, DATE_FORMAT(fecha_registro,'%d-%m-%Y') AS registro_formateado
from USUARIOS;

/* 2.12.3. Direfencia Fechas : ....... TIMESTAMPDIFF(DAY, __ , NOW())                    */
-- ¿Cuántos años han pasado desde que se creó cada fórmula?
select id_usuario, TIMESTAMPDIFF(MONTH, fecha_creacion, NOW()) AS meses_formula
from FORMULAS;

-- ¿Cuántos días han pasado desde que cada usuario se registró? 
select nombre_completo, TIMESTAMPDIFF(DAY, fecha_registro, NOW()) AS dias_registro
from USUARIOS;