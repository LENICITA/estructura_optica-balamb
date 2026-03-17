-- -----------------------------------------------------
-- Schema Opticamdb
-- -----------------------------------------------------
DROP DATABASE opticamdb;
CREATE DATABASE Opticamdb DEFAULT CHARACTER SET utf8 ;
USE Opticamdb ;

-- -----------------------------------------------------
-- Tabla ROLES
-- -----------------------------------------------------
CREATE TABLE ROLES (
  id_rol INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(45) NOT NULL,
  PRIMARY KEY (id_rol))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tabla USUARIOS
-- -----------------------------------------------------
CREATE TABLE USUARIOS (
  id_usuario INT NOT NULL AUTO_INCREMENT,
  nombre_completo VARCHAR(100) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  fecha_nacimiento DATE NOT NULL,
  documento BIGINT NOT NULL,
  ciudad VARCHAR(20) NOT NULL,
  direccion VARCHAR(45) NOT NULL,
  fecha_registro DATE NOT NULL,
  email VARCHAR(100) NOT NULL,
  contrasena VARCHAR(200) NOT NULL,
  estado VARCHAR(45) NOT NULL,
  PRIMARY KEY (id_usuario))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tabla ROL_USUARIO
-- -----------------------------------------------------
CREATE TABLE ROL_USUARIO (
  id_rol INT NOT NULL,
  id_usuario INT NOT NULL,
  INDEX ind_rol_usuario_roles (id_rol ASC) ,
  INDEX ind_rol_usuario_usuarios (id_usuario ASC) ,
  PRIMARY KEY (id_rol, id_usuario),
  CONSTRAINT fk_rol_usuario_roles
    FOREIGN KEY (id_rol)
    REFERENCES ROLES (id_rol)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_rol_usuario_usuarios
    FOREIGN KEY (id_usuario)
    REFERENCES USUARIOS (id_usuario)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tabla CATEGORIAS
-- -----------------------------------------------------
CREATE TABLE CATEGORIAS (
  id_categoria INT NOT NULL AUTO_INCREMENT,
  tipo_categoria ENUM('MONTURAS','ACCESORIOS','GAFAS DE SOL') NOT NULL,
  descripcion VARCHAR(200) NOT NULL,
  PRIMARY KEY (id_categoria))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tabla PRODUCTOS
-- -----------------------------------------------------
CREATE TABLE PRODUCTOS (
  id_producto INT NOT NULL AUTO_INCREMENT,
  id_categoria INT NOT NULL,
  nombre VARCHAR(45) NOT NULL,
  descripcion VARCHAR(45) NOT NULL,
  marca VARCHAR(45) NOT NULL,
  precio FLOAT NOT NULL,
  imagen VARCHAR(200) NOT NULL,
  material VARCHAR(45) NOT NULL,
  color VARCHAR(45) NOT NULL,
  PRIMARY KEY (id_producto),
  INDEX ind_productos_categorias (id_categoria ASC) ,
  CONSTRAINT fk_productos_categorias
    FOREIGN KEY (id_categoria)
    REFERENCES CATEGORIAS (id_categoria)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla FORMULAS
-- -----------------------------------------------------
CREATE TABLE FORMULAS (
  id_formula INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  condicion ENUM('DALTONISMO','ASTIGMATISMO','MIOPIA','BAJA VISION') NOT NULL,
  imagen_formula VARCHAR(200) NOT NULL,
  observaciones VARCHAR(200) NULL,
  fecha_creacion DATE NOT NULL,
  costo FLOAT NOT NULL,
  PRIMARY KEY (id_formula),
  INDEX ind_formulas_usuarios (id_usuario ASC) ,
  CONSTRAINT fk_formulas_usuario
    FOREIGN KEY (id_usuario)
    REFERENCES USUARIOS (id_usuario)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla PEDIDOS
-- -----------------------------------------------------
CREATE TABLE PEDIDOS (
  id_pedido INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  id_formula INT NULL,
  fecha_pedido DATE NOT NULL,
  fecha_entrega DATE NOT NULL,
  direccion_entrega VARCHAR(45) NOT NULL,
  estado VARCHAR(45) NOT NULL,
  costo_envio FLOAT NOT NULL,
  total FLOAT NOT NULL,
  PRIMARY KEY (id_pedido),
  INDEX ind_pedidos_usuarios (id_usuario ASC) ,
  INDEX ind_pedidos_formulas (id_formula ASC) ,
  CONSTRAINT fk_pedidos_usuarios
    FOREIGN KEY (id_usuario)
    REFERENCES USUARIOS (id_usuario)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_pedidos_formulas
    FOREIGN KEY (id_formula)
    REFERENCES FORMULAS (id_formula)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla PEDIDOS_PRODUCTOS
-- -----------------------------------------------------
CREATE TABLE PEDIDOS_PRODUCTOS (
  id_pedido INT NOT NULL,
  id_producto INT NOT NULL,
  cant_productos INT NOT NULL,
  PRIMARY KEY (id_pedido, id_producto),
  INDEX ind_pedidos_productos_productos (id_producto ASC) ,
  INDEX ind_pedidos_productos_pedidos (id_pedido ASC) ,
  CONSTRAINT fk_pedidos_productos_pedidos
    FOREIGN KEY (id_pedido)
    REFERENCES PEDIDOS (id_pedido)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_pedidos_productos_productos
    FOREIGN KEY (id_producto)
    REFERENCES PRODUCTOS (id_producto)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Tabla VEHICULOS
-- -----------------------------------------------------
CREATE TABLE VEHICULOS (
  id_vehiculo INT NOT NULL AUTO_INCREMENT,
  id_usuario INT NOT NULL,
  tipo VARCHAR(45) NOT NULL,
  modelo VARCHAR(45) NOT NULL,
  placa VARCHAR(10) NOT NULL,
  color VARCHAR(45) NOT NULL,
  PRIMARY KEY (id_vehiculo),
  INDEX ind_vehiculos_usuarios (id_usuario ASC) ,
  CONSTRAINT fk_vehiculos_usuarios
    FOREIGN KEY (id_usuario)
    REFERENCES USUARIOS (id_usuario)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Tabla PAGOS
-- -----------------------------------------------------
CREATE TABLE PAGOS (
  id_pago INT NOT NULL AUTO_INCREMENT,
  id_pedido INT NOT NULL,
  fecha_pago DATE NOT NULL,
  eleccion_pago VARCHAR(45) NOT NULL,
  canal_pago VARCHAR(45) NOT NULL,
  monto FLOAT NOT NULL,
  estado VARCHAR(45) NOT NULL,
  PRIMARY KEY (id_pago),
  INDEX ind_pagos_pedidos (id_pedido ASC) ,
  CONSTRAINT fk_pagos_pedidos
    FOREIGN KEY (id_pedido)
    REFERENCES PEDIDOS (id_pedido)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB;
