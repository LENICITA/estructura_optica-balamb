// src/shared/types/ProductModel.js

export class ProductModel {
  constructor(data) {
    this.id_producto = data.id_producto;
    this.id_categoria = data.id_categoria;
    this.nombre = data.nombre;
    this.descripcion = data.descripcion;
    this.marca = data.marca;
    this.precio = data.precio;
    this.imagen = data.imagen;
    this.material = data.material;
    this.color = data.color;
    this.tipo_categoria = data.tipo_categoria;
    this.categoria_descripcion = data.categoria_descripcion;
    this.imagen_url = data.imagen_url;
    this.imagen_thumbnail = data.imagen_thumbnail;
  }

  get precioFormateado() {
    return `$${this.precio.toLocaleString('es-CO')}`;
  }

  get nombreCompleto() {
    return `${this.nombre} - ${this.marca}`;
  }

  static fromJSON(data) {
    return new ProductModel({
      id_producto: data.id_producto || data.id || 0,
      id_categoria: data.id_categoria || 0,
      nombre: data.nombre || '',
      descripcion: data.descripcion || '',
      marca: data.marca || '',
      precio: data.precio || 0,
      imagen: data.imagen || '',
      material: data.material || '',
      color: data.color || '',
      tipo_categoria: data.tipo_categoria,
      categoria_descripcion: data.categoria_descripcion,
      imagen_url: data.imagen_url,
      imagen_thumbnail: data.imagen_thumbnail,
    });
  }

  static fromJSONArray(data) {
    return data.map(item => ProductModel.fromJSON(item));
  }
}