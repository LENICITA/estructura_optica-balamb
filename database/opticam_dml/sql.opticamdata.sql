INSERT INTO ROLES (nombre) VALUES
('ADMINISTRADOR'),
('CLIENTE'),
('REPARTIDOR');

INSERT INTO USUARIOS
(nombre_completo, telefono, fecha_nacimiento, documento, ciudad, direccion, fecha_registro, email, contrasena, estado)
VALUES
('Héctor Cabrejo', 3012092941, '1986-04-05', 1012363754, 'Bogotá', 'Calle 143A #128-51', '2025-01-10', 'opticavirtualbalmb@gmail.com', SHA2('hectorcloud.',256), 'ACTIVO'),

('Juan Pérez', 3001111112, '1998-04-12', 100000002, 'Medellín', 'Carrera 70 #45-10', '2025-01-11', 'juan@gmail.com', SHA2('juansasok12',256), 'ACTIVO'),

('Maria Gomez', 3001111113, '1995-07-08', 100000003, 'Cali', 'Avenida 6N #24-50', '2025-03-12', 'maria@gmail.com', SHA2('marinita1986',256), 'ACTIVO'),

('Carlos Lopez', 3001111114, '1990-09-20', 100000004, 'Barranquilla', 'Carrera 43 #72-15', '2025-06-13', 'carlos@gmail.com', SHA2('elnegro123.',256), 'ACTIVO'),

('Ana Torres', 3001111115, '1999-03-15', 100000005, 'Cartagena', 'Avenida Pedro de Heredia #30-120', '2025-01-14', 'ana@gmail.com', SHA2('12_06_2026A',256), 'ACTIVO'),

('Pedro Ruiz', 3001111116, '1993-06-22', 100000006, 'Bucaramanga', 'Carrera 27 #36-45', '2025-03-15', 'pedro@gmail.com', SHA2('pedroski_aguardiente1',256), 'ACTIVO'),

('Luisa Martínez', 3001111117, '1996-08-10', 100000007, 'Pereira', 'Carrera 8 #20-30', '2025-02-16', 'luisa@gmail.com', SHA2('gatitos.82.50',256), 'ACTIVO'),

('Andrés Rojas', 3001111118, '1992-11-02', 100000008, 'Bogotá', 'Calle 72 #7-64', '2025-01-11', 'andres@gmail.com', SHA2('andres.roj26',256), 'ACTIVO'),

('Sofia Castro', 3001111119, '1997-02-18', 100000009, 'Bogotá', 'Cra 15 #93-60', '2025-01-11', 'sofia@gmail.com', SHA2('sofia_cast123',256), 'ACTIVO'),

('Miguel Diaz', 3001111120, '1994-12-01', 100000010, 'Bogotá', 'Avenida Boyacá #63-45', '2025-01-19', 'miguel@gmail.com', SHA2('miguemigue.2743',256), 'ACTIVO'),

('Laura Sanchez',3001111121,'1995-05-10',100000011,'Bogotá','Calle 80 #20-30','2025-02-01','laura@gmail.com',SHA2('laura123',256),'ACTIVO'),

('Daniel Moreno',3001111122,'1993-09-14',100000012,'Medellín','Cra 50 #40-22','2025-04-02','daniel@gmail.com',SHA2('daniel321',256),'ACTIVO'),

('Paula Ramirez',3001111123,'1997-12-01',100000013,'Cali','Calle 10 #15-40','2025-07-03','paula@gmail.com',SHA2('paula456',256),'ACTIVO'),

('Jorge Vargas',3001111124,'1988-11-08',100000014,'Bogotá','Cra 30 #25-15','2025-02-04','jorge@gmail.com',SHA2('jorge789',256),'ACTIVO'),

('Camila Duarte',3001111125,'2000-01-20',100000015,'Cartagena','Av 20 #10-18','2025-02-15','camila@gmail.com',SHA2('camila111',256),'ACTIVO');

INSERT INTO ROL_USUARIO VALUES
(1,1),
(2,2),
(2,3),
(2,4),
(2,5),
(2,6),
(2,7),
(3,8),
(3,9),
(2,10),
(2,11),
(2,12),
(2,13),
(2,14),
(2,15);

INSERT INTO CATEGORIAS (tipo_categoria, descripcion) VALUES
('MONTURAS','Monturas para lentes formulados, Monturas titanio, Monturas acetato,  Monturas poliarbonato, Monturas microfibra'),
('ACCESORIOS','Paño,Cordon,Liquido antiempañante,Estuche protector para gafas,Etc'),
('GAFAS DE SOL','Gafas de sol polarizadas, Gafas de sol deportivas, Gafas de sol clasicas ');

INSERT INTO PRODUCTOS
(id_categoria,nombre,descripcion,marca,precio,imagen,material,color)
VALUES
(1,'Montura Elegance','Montura moderna','Rayban',250000,'https://opticam.com/img/montura1.jpg','Policarbonato','Negro'),
(2,'Paño Microfibra','Paño limpiador','Opticam',10000,'https://opticam.com/img/pano.jpg','Satin','Azul'),
(2,'Cordon Ajustable','Cordon para gafas','Nike',15000,'https://opticam.com/img/cordon.jpg','Algodon','Negro'),
(2,'Antiempañante','Spray antiempañante','Rayban',20000,'https://opticam.com/img/antifog.jpg','Liquido','Transparente'),
(2,'Estuche Rigido','Estuche protector','Opticam',30000,'https://opticam.com/img/estuche.jpg','Metal','Negro'),
(3,'Solar Sport','Gafas deportivas','Oakley',300000,'https://opticam.com/img/solar1.jpg','Policarbonato','Rojo'),
(3,'Solar Classic','Gafas clasicas','Rayban',350000,'https://opticam.com/img/solar2.jpg','Microfibra','Dorado'),
(1,'Montura Flex','Montura flexible','Vogue',200000,'https://opticam.com/img/montura2.jpg','Policarbonato','Azul'),
(1,'Montura Light','Montura ligera','Prada',400000,'https://opticam.com/img/montura3.jpg','Titanio','Gris'),
(3,'Solar Black','Gafas oscuras','Gucci',500000,'https://opticam.com/img/solar3.jpg','Acetato','Negro'),
(1,'Montura Classic','Montura elegante','Rayban',280000,'https://opticam.com/img/montura4.jpg','Titanio','Negro'),
(1,'Montura Urban','Montura moderna','Prada',420000,'https://opticam.com/img/montura5.jpg','Acetato','Gris'),
(2,'Kit Limpieza','Kit completo limpieza','Opticam',25000,'https://opticam.com/img/kit.jpg','Algodon, liquido','Azul'),
(2,'Cordón Deportivo','Cordón resistente','Nike',18000,'https://opticam.com/img/cordon2.jpg','Poliéster','Rojo'),
(3,'Solar Premium','Gafas de sol premium','Oakley',520000,'https://opticam.com/img/solar4.jpg','Policarbonato','Negro');

INSERT INTO FORMULAS
(id_usuario,condicion,imagen_formula,observaciones,fecha_creacion,costo)
VALUES
(2,'MIOPIA','https://opticam.com/formulas/f1.jpg','Uso permanente, blue block','2025-07-10',50000),
(5,'ASTIGMATISMO','https://opticam.com/formulas/f2.jpg','Fotocromatico','2026-01-11',60000),
(10,'DALTONISMO','https://opticam.com/formulas/f3.jpg','Uso diario, filtro optico','2026-01-12',40000),
(11,'MIOPIA','https://opticam.com/formulas/f9.jpg','Filtro luz azul','2025-10-01',55000),
(12,'ASTIGMATISMO','https://opticam.com/formulas/f10.jpg','Uso permanente','2025-12-24',60000),
(15,'BAJA VISION','https://opticam.com/formulas/f11.jpg','Lentes progresivos','2026-01-03',70000);

INSERT INTO PEDIDOS
(id_usuario,id_formula,fecha_pedido,fecha_entrega,direccion_entrega,estado,costo_envio,total)
VALUES
(2,1,'2026-01-22','2026-02-03','Cra 12 #22-10','ENTREGADO',8000,308000),
(3,NULL,'2026-02-22','2026-03-04','Calle 45 #12-22','PENDIENTE',8000,608000),
(4,NULL,'2026-06-14','2026-06-25','Carrera 43 #72-15','EN CAMINO',8000,358000),
(5,2,'2026-09-17','2026-09-26','Calle 60 #18-20','EN CAMINO',8000,268000),
(6,NULL,'2026-02-08','2026-02-17','Cra 50 #30-15','PEDIDO LISTO',8000,28000),
(7,NULL,'2026-02-28','2026-03-08','Carrera 8 #20-30','PENDIENTE',8000,1008000),
(2,NULL,'2026-04-29','2026-05-09','Cra 12 #22-10','ENTREGADO',8000,38000),
(3,NULL,'2026-02-08','2026-02-19','Calle 45 #12-22','PEDIDO LISTO',8000,68000),
(4,NULL,'2026-02-09','2026-02-20','Carrera 43 #72-15','EN CAMINO',8000,38000),
(10,3,'2026-02-10','2026-02-18','Avenida Boyacá #63-45','PEDIDO LISTO',0,440000),
(11,4,'2026-03-10','2026-03-18','Calle 80 #20-30','ENTREGADO',0,385000),
(12,5,'2026-02-14','2026-02-24','Cra 50 #40-22','PENDIENTE',8000,488000),
(13,NULL,'2026-01-10','2026-01-20','Calle 10 #15-40','EN CAMINO',8000,308000),
(14,NULL,'2026-03-13','2026-03-21','Cra 30 #25-15','PEDIDO LISTO',0,54000),
(15,6,'2026-03-14','2026-03-23','Av 20 #10-18','ENTREGADO',8000,848000);

INSERT INTO PEDIDOS_PRODUCTOS VALUES
(1,1,1),
(2,6,2),
(3,7,1),
(4,8,1),
(5,2,2),
(6,10,2),
(7,3,2),
(8,4,3),
(9,5,1),
(10,9,1),
(11,11,1),
(11,13,2),
(12,12,1),
(13,6,1),
(14,14,3),
(15,1,1),
(15,15,1);

INSERT INTO VEHICULOS
(id_usuario,tipo,modelo,placa,color)
VALUES
(8,'Moto','Yamaha FZ','COZ-92E','Negro'),
(9,'Moto','AKT NKD','KRF-45D','Rojo'),
(8,'Carro','Chevrolet spark','KRF-075','Azul'),
(9,'Carro','Renault logan','JDN-183','Negro');

INSERT INTO PAGOS
(id_pedido,fecha_pago,eleccion_pago,canal_pago,monto,estado)
VALUES
(1,'2026-01-22','100%','BOLD',308000,'APROBADO'),
(2,'2026-02-22','50%','BOLD',304000,'PENDIENTE'),
(3,'2026-06-14','100%','BOLD',358000,'APROBADO'),
(4,'2026-09-17','50%','BOLD',134000,'PENDIENTE'),
(5,'2026-02-08','100%','BOLD',28000,'APROBADO'),
(6,'2026-02-28','100%','BOLD',1008000,'APROBADO'),
(7,'2026-04-29','100%','BOLD',38000,'APROBADO'),
(8,'2026-02-08','50%','BOLD',34000,'PENDIENTE'),
(9,'2026-02-09','100%','BOLD',38000,'APROBADO'),
(10,'2026-02-10','50%','BOLD',220000,'PENDIENTE'),
(11,'2026-03-10','100%','BOLD',385000,'APROBADO'),
(12,'2026-02-14','50%','BOLD',244000,'PENDIENTE'),
(13,'2026-01-10','100%','BOLD',308000,'APROBADO'),
(14,'2026-03-13','100%','BOLD',54000,'APROBADO'),
(15,'2026-03-14','100%','BOLD',848000,'APROBADO');