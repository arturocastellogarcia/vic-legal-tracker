import {
  pgTable,
  uuid,
  text,
  boolean,
  timestamp,
  integer,
  numeric,
  jsonb,
  pgEnum,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ─── ENUMS ───

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "juridico",
  "tecnico",
  "direccion",
  "intervencion",
  "solo_lectura",
]);

export const expedienteTipoEnum = pgEnum("expediente_tipo", [
  "contrato_menor",
  "licitacion",
  "convenio",
  "softlanding",
  "cesion_espacios",
  "gastos",
]);

export const expedienteSubtipoEnum = pgEnum("expediente_subtipo", [
  "servicios",
  "suministros",
  "obras",
  "idi",
]);

export const estadoGlobalEnum = pgEnum("estado_global", [
  "borrador",
  "en_curso",
  "pausado",
  "formalizado",
  "archivado",
  "cancelado",
]);

export const prioridadEnum = pgEnum("prioridad", [
  "alta",
  "media",
  "normal",
]);

export const estadoPasoEnum = pgEnum("estado_paso", [
  "pendiente",
  "en_curso",
  "completado",
  "bloqueado",
  "omitido",
]);

export const rolResponsableEnum = pgEnum("rol_responsable", [
  "tecnico",
  "juridico",
  "direccion",
  "intervencion",
]);

export const estadoVersionFlujoEnum = pgEnum("estado_version_flujo", [
  "borrador",
  "publicado",
  "deprecado",
]);

export const rolProveedorEnum = pgEnum("rol_proveedor", [
  "adjudicatario",
  "invitado",
  "ofertante",
  "contraparte",
]);

export const tipoNotificacionEnum = pgEnum("tipo_notificacion", [
  "asignacion",
  "validacion_pendiente",
  "validacion_completada",
  "comentario",
  "bloqueo_alerta",
  "paso_completado",
  "expediente_formalizado",
]);

// ─── TABLES ───

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  fullName: text("full_name").notNull(),
  role: userRoleEnum("role").notNull().default("tecnico"),
  department: text("department"),
  avatarUrl: text("avatar_url"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});

export const proveedores = pgTable("proveedores", {
  id: uuid("id").primaryKey().defaultRandom(),
  nif: text("nif").notNull().unique(),
  razonSocial: text("razon_social").notNull(),
  nombreComercial: text("nombre_comercial"),
  email: text("email"),
  telefono: text("telefono"),
  direccion: text("direccion"),
  odooPartnerId: integer("odoo_partner_id"),
  activo: boolean("activo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const expedientes = pgTable("expedientes", {
  id: uuid("id").primaryKey().defaultRandom(),
  ref: text("ref").notNull().unique(),
  titulo: text("titulo").notNull(),
  descripcion: text("descripcion"),
  tipo: expedienteTipoEnum("tipo").notNull(),
  subtipo: expedienteSubtipoEnum("subtipo"),
  importeEstimado: numeric("importe_estimado", { precision: 14, scale: 2 }),
  prioridad: prioridadEnum("prioridad").notNull().default("normal"),
  estadoGlobal: estadoGlobalEnum("estado_global").notNull().default("borrador"),
  pasoActualId: uuid("paso_actual_id"),
  creadoPor: uuid("creado_por").notNull().references(() => users.id),
  responsableTecnico: uuid("responsable_tecnico").notNull().references(() => users.id),
  responsableJuridico: uuid("responsable_juridico").references(() => users.id),
  docUrl: text("doc_url"),
  notasInternas: text("notas_internas"),
  fechaCreacion: timestamp("fecha_creacion", { withTimezone: true }).notNull().defaultNow(),
  fechaActualizacion: timestamp("fecha_actualizacion", { withTimezone: true }).notNull().defaultNow(),
  fechaFormalizacion: timestamp("fecha_formalizacion", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}),
});

export const expedienteProveedores = pgTable("expediente_proveedores", {
  id: uuid("id").primaryKey().defaultRandom(),
  expedienteId: uuid("expediente_id").notNull().references(() => expedientes.id),
  proveedorId: uuid("proveedor_id").notNull().references(() => proveedores.id),
  rol: rolProveedorEnum("rol").notNull(),
  importeOfertado: numeric("importe_ofertado", { precision: 14, scale: 2 }),
  importeAdjudicado: numeric("importe_adjudicado", { precision: 14, scale: 2 }),
  seleccionado: boolean("seleccionado").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const flujos = pgTable("flujos", {
  id: uuid("id").primaryKey().defaultRandom(),
  tipo: expedienteTipoEnum("tipo").notNull(),
  version: integer("version").notNull().default(1),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  activo: boolean("activo").notNull().default(true),
  estadoVersion: estadoVersionFlujoEnum("estado_version").notNull().default("borrador"),
  creadoPor: uuid("creado_por").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
}, (table) => [
  uniqueIndex("flujos_tipo_version_idx").on(table.tipo, table.version),
]);

export const pasosFlujo = pgTable("pasos_flujo", {
  id: uuid("id").primaryKey().defaultRandom(),
  flujoId: uuid("flujo_id").notNull().references(() => flujos.id, { onDelete: "cascade" }),
  orden: integer("orden").notNull(),
  titulo: text("titulo").notNull(),
  instrucciones: text("instrucciones").notNull(),
  justificacionLegal: text("justificacion_legal"),
  documentoRequerido: text("documento_requerido"),
  plantillaId: uuid("plantilla_id"),
  responsableRol: rolResponsableEnum("responsable_rol").notNull(),
  validadorRol: rolResponsableEnum("validador_rol"),
  plazoOrientativoDias: integer("plazo_orientativo_dias"),
  requiereValidacion: boolean("requiere_validacion").notNull().default(false),
  requiereDocumento: boolean("requiere_documento").notNull().default(false),
  bloqueante: boolean("bloqueante").notNull().default(false),
  condicionOmision: jsonb("condicion_omision").$type<Record<string, unknown>>(),
});

export const pasosExpediente = pgTable("pasos_expediente", {
  id: uuid("id").primaryKey().defaultRandom(),
  expedienteId: uuid("expediente_id").notNull().references(() => expedientes.id, { onDelete: "cascade" }),
  pasoFlujoId: uuid("paso_flujo_id").notNull().references(() => pasosFlujo.id),
  orden: integer("orden").notNull(),
  estado: estadoPasoEnum("estado").notNull().default("pendiente"),
  iniciadoEn: timestamp("iniciado_en", { withTimezone: true }),
  completadoEn: timestamp("completado_en", { withTimezone: true }),
  completadoPor: uuid("completado_por").references(() => users.id),
  validadoPor: uuid("validado_por").references(() => users.id),
  validadoEn: timestamp("validado_en", { withTimezone: true }),
  comentario: text("comentario"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const documentos = pgTable("documentos", {
  id: uuid("id").primaryKey().defaultRandom(),
  expedienteId: uuid("expediente_id").notNull().references(() => expedientes.id, { onDelete: "cascade" }),
  pasoExpedienteId: uuid("paso_expediente_id").references(() => pasosExpediente.id),
  nombre: text("nombre").notNull(),
  nombreArchivo: text("nombre_archivo").notNull(),
  tipoMime: text("tipo_mime").notNull(),
  tamanoBytes: integer("tamano_bytes").notNull(),
  storagePath: text("storage_path").notNull(),
  version: integer("version").notNull().default(1),
  subidoPor: uuid("subido_por").notNull().references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const plantillas = pgTable("plantillas", {
  id: uuid("id").primaryKey().defaultRandom(),
  nombre: text("nombre").notNull(),
  descripcion: text("descripcion"),
  tipoExpediente: expedienteTipoEnum("tipo_expediente"),
  storagePath: text("storage_path").notNull(),
  formato: text("formato").notNull(),
  version: integer("version").notNull().default(1),
  activa: boolean("activa").notNull().default(true),
  creadoPor: uuid("creado_por").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const actividad = pgTable("actividad", {
  id: uuid("id").primaryKey().defaultRandom(),
  expedienteId: uuid("expediente_id").notNull().references(() => expedientes.id, { onDelete: "cascade" }),
  usuarioId: uuid("usuario_id").notNull().references(() => users.id),
  accion: text("accion").notNull(),
  descripcion: text("descripcion").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const comentarios = pgTable("comentarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  expedienteId: uuid("expediente_id").notNull().references(() => expedientes.id, { onDelete: "cascade" }),
  pasoExpedienteId: uuid("paso_expediente_id").references(() => pasosExpediente.id),
  usuarioId: uuid("usuario_id").notNull().references(() => users.id),
  contenido: text("contenido").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});

export const notificaciones = pgTable("notificaciones", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id").notNull().references(() => users.id),
  expedienteId: uuid("expediente_id").references(() => expedientes.id),
  tipo: tipoNotificacionEnum("tipo").notNull(),
  mensaje: text("mensaje").notNull(),
  url: text("url").notNull(),
  leida: boolean("leida").notNull().default(false),
  enviadaEmail: boolean("enviada_email").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
