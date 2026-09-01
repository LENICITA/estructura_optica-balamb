// src/core/models/ProductModel.ts

export interface Producto {
  id_producto: number;
  id_categoria: number;
  nombre: string;
  descripcion: string;
  marca: string;
  precio: number;
  imagen: string;
  material: string;
  color: string;
  tipo_categoria?: string;
  categoria_descripcion?: string;
  imagen_url?: string;
  imagen_thumbnail?: string;
}

export class ProductModel implements Producto {
  id_producto: number;
  id_categoria: number;
  nombre: string;
  descripcion: string;
  marca: string;
  precio: number;
  imagen: string;
  material: string;
  color: string;
  tipo_categoria?: string;
  categoria_descripcion?: string;
  imagen_url?: string;
  imagen_thumbnail?: string;

  constructor(data: Producto) {
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

  get precioFormateado(): string {
    return `$${this.precio.toLocaleString('es-CO')}`;
  }

  get nombreCompleto(): string {
    return `${this.nombre} - ${this.marca}`;
  }

  static fromJSON(data: any): ProductModel {
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

  static fromJSONArray(data: any[]): ProductModel[] {
    return data.map(item => ProductModel.fromJSON(item));
  }
}