
export type EstadoFormula =
    | "Pendiente"
    | "Aprobado"
    | "Rechazado";

export interface Formula {
    id_formula: number;
    id_usuario: number;
    condicion: string;
    observaciones: string | null;
    fecha_creacion: string;
    estado: EstadoFormula;
    imagen_url: string;
    costo: number;
    nombre_completo: string;
    email: string;
    telefono: string;
}

export type FiltroFormula =
    | "TODOS"
    | "PENDIENTE"
    | "APROBADO"
    | "RECHAZADO";