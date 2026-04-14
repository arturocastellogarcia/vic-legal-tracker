/**
 * Seed data for the 6 legal procedures (flujos).
 * These are stored in the DB and editable by admin/juridico.
 * This file is only used for the initial seed script.
 */

export type SeedPaso = {
  orden: number;
  titulo: string;
  instrucciones: string;
  justificacionLegal?: string;
  documentoRequerido?: string;
  responsableRol: "tecnico" | "juridico" | "direccion" | "intervencion";
  validadorRol?: "tecnico" | "juridico" | "direccion" | "intervencion";
  plazoOrientativoDias?: number;
  requiereValidacion: boolean;
  requiereDocumento: boolean;
  bloqueante: boolean;
  condicionOmision?: Record<string, unknown>;
};

export type SeedFlujo = {
  tipo: string;
  nombre: string;
  descripcion: string;
  estadoVersion: "borrador" | "publicado" | "deprecado";
  pasos: SeedPaso[];
};

export const FLUJOS_SEED: SeedFlujo[] = [
  // ═══════════════════════════════════════════════════
  // 3.1 CONTRATO MENOR
  // ═══════════════════════════════════════════════════
  {
    tipo: "contrato_menor",
    nombre: "Contrato menor",
    descripcion:
      "Procedimiento simplificado para servicios/suministros <15.000 €, obras <40.000 € e I+D+i <50.000 €. Art. 118 LCSP.",
    estadoVersion: "publicado",
    pasos: [
      {
        orden: 1,
        titulo: "Justificación de la necesidad",
        instrucciones:
          "Redacta una memoria breve explicando **qué se necesita** y **por qué**. Debe incluir:\n- Objeto del contrato\n- Necesidad que cubre\n- Importe estimado (IVA excluido)\n- Plazo de ejecución previsto\n\nVerifica que el importe no supere los umbrales del contrato menor según el subtipo.",
        justificacionLegal:
          "Art. 118.1 LCSP: «Los contratos menores [...] deberán [...] justificar que no se está alterando el objeto del contrato para evitar la aplicación de las reglas generales de contratación.»",
        documentoRequerido: "Memoria justificativa de la necesidad",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 2,
        titulo: "Verificación de límites LCSP",
        instrucciones:
          "La aplicación verifica automáticamente que el importe estimado no excede los límites legales:\n- **Servicios/suministros:** <15.000 € (IVA excluido)\n- **Obras:** <40.000 € (IVA excluido)\n- **I+D+i:** <50.000 € (IVA excluido)\n\nSi el importe excede el umbral, se bloqueará el avance y se sugerirá reclasificar como procedimiento abierto.",
        justificacionLegal:
          "Art. 118.1 LCSP: umbrales de contrato menor. Art. 99.2 LCSP: prohibición de fraccionamiento.",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: true,
      },
      {
        orden: 3,
        titulo: "Petición de presupuestos",
        instrucciones:
          "Solicita al menos **3 ofertas comparables** de proveedores distintos. Aunque la LCSP no lo exige formalmente para contratos menores, es buena práctica y protege frente a observaciones de auditoría.\n\nSube los presupuestos recibidos y vincula los proveedores al expediente.",
        documentoRequerido: "Presupuestos de proveedores (mín. 1, recomendado 3)",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 4,
        titulo: "Comprobación de no fraccionamiento",
        instrucciones:
          "Confirma que este contrato **no es un fraccionamiento** de un contrato mayor con el mismo proveedor.\n\nRevisa el listado de contratos menores de los últimos 12 meses con los proveedores vinculados a este expediente. Si el acumulado supera los umbrales, debes justificar que son prestaciones independientes o reclasificar el procedimiento.",
        justificacionLegal:
          "Art. 99.2 LCSP: «No podrá fraccionarse un contrato con la finalidad de disminuir la cuantía del mismo y eludir así los requisitos de publicidad o los relativos al procedimiento de adjudicación que correspondan.»",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: true,
      },
      {
        orden: 5,
        titulo: "Selección de proveedor",
        instrucciones:
          "Selecciona el proveedor adjudicatario y justifica la elección. Si hay varias ofertas, indica los criterios de valoración utilizados (precio, calidad, plazo, etc.).\n\nMarca el proveedor seleccionado como adjudicatario en el expediente.",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
      {
        orden: 6,
        titulo: "Retención de crédito",
        instrucciones:
          "Verifica que existe **partida presupuestaria** con crédito suficiente para el importe del contrato.\n\nIndica el código de la partida presupuestaria en los datos del expediente y solicita la retención de crédito a Intervención.",
        justificacionLegal:
          "Art. 118.3 LCSP: «En el expediente se justificará [...] la existencia de crédito adecuado y suficiente.»",
        documentoRequerido: "Certificado de retención de crédito",
        responsableRol: "juridico",
        validadorRol: "intervencion",
        requiereValidacion: true,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 7,
        titulo: "Declaración responsable de conflicto de intereses (DACI)",
        instrucciones:
          "Todos los participantes en el expediente de contratación deben cumplimentar y firmar la **Declaración responsable de ausencia de conflicto de intereses (DACI)**.\n\nEsto incluye al técnico responsable y a cualquier persona que participe en la valoración o decisión.",
        justificacionLegal:
          "Art. 64 LCSP y Ley 40/2015 art. 23. Requisito reforzado tras incidencia D6 de auditoría.",
        documentoRequerido: "DACI firmada por todos los participantes",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 8,
        titulo: "Aprobación del gasto",
        instrucciones:
          "Solicita la **resolución de aprobación del gasto** a Dirección. El documento debe estar firmado por el órgano de contratación.",
        documentoRequerido: "Resolución de aprobación del gasto firmada",
        responsableRol: "direccion",
        validadorRol: "direccion",
        requiereValidacion: true,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 9,
        titulo: "Adjudicación y notificación",
        instrucciones:
          "Comunica la adjudicación al proveedor seleccionado. Incluye:\n- Objeto del contrato\n- Importe adjudicado\n- Plazo de ejecución\n- Condiciones particulares",
        responsableRol: "juridico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
      {
        orden: 10,
        titulo: "Recepción de factura y conformidad",
        instrucciones:
          "Una vez ejecutado el servicio/entrega:\n1. Recibe la factura del proveedor\n2. Verifica que cumple requisitos formales (NIF, fecha, concepto, IVA desglosado)\n3. Emite la **conformidad técnica**\n\nPlazo orientativo: 5 días hábiles desde la recepción de la factura.",
        justificacionLegal:
          "Objetivo alineado con acción correctiva 3.3 del plan de auditoría: plazo máximo de 5 días hábiles para conformidad de facturas.",
        documentoRequerido: "Factura con conformidad técnica",
        responsableRol: "tecnico",
        plazoOrientativoDias: 5,
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 11,
        titulo: "Pago y publicación",
        instrucciones:
          "Tramita el pago al proveedor y registra la publicación trimestral en el perfil del contratante.\n\nAsegura que el contrato queda registrado en el sistema contable para el control de acumulados.",
        responsableRol: "intervencion",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // 3.2 LICITACIÓN
  // ═══════════════════════════════════════════════════
  {
    tipo: "licitacion",
    nombre: "Licitación (procedimiento abierto)",
    descripcion:
      "Procedimiento abierto para importes que superan los umbrales del contrato menor. Arts. 156-158 LCSP.",
    estadoVersion: "publicado",
    pasos: [
      {
        orden: 1,
        titulo: "Memoria justificativa",
        instrucciones:
          "Redacta la memoria justificativa del contrato que incluya:\n- Necesidad e idoneidad del objeto\n- Presupuesto base de licitación (con IVA desglosado)\n- Valor estimado del contrato\n- Duración prevista y posibles prórrogas",
        documentoRequerido: "Memoria justificativa",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 2,
        titulo: "Pliego de prescripciones técnicas (PPT)",
        instrucciones:
          "Elabora el pliego técnico con la descripción detallada del objeto del contrato. Debe ser claro, no discriminatorio y permitir la libre competencia.\n\nNo puede contener referencias a marcas o modelos específicos salvo justificación expresa.",
        justificacionLegal: "Arts. 76-77 LCSP: prescripciones técnicas.",
        documentoRequerido: "Pliego de prescripciones técnicas",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 3,
        titulo: "Pliego de cláusulas administrativas particulares (PCAP)",
        instrucciones:
          "Redacta el PCAP con:\n- Criterios de adjudicación y su ponderación\n- Condiciones de ejecución\n- Garantías exigidas\n- Penalidades\n- Régimen de modificación del contrato",
        justificacionLegal: "Arts. 122-125 LCSP: pliegos de cláusulas administrativas.",
        documentoRequerido: "PCAP",
        responsableRol: "juridico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 4,
        titulo: "Verificación umbral SARA",
        instrucciones:
          "Verificación automática: si el valor estimado iguala o supera los umbrales SARA, se activan requisitos adicionales:\n- **Servicios/suministros:** ≥216.000 €\n- **Obras:** ≥5.404.000 €\n\nSi es SARA: publicación obligatoria en DOUE y plazos de presentación ampliados.",
        justificacionLegal: "Art. 22 LCSP: contratos sujetos a regulación armonizada.",
        responsableRol: "juridico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
      {
        orden: 5,
        titulo: "Certificado de existencia de crédito",
        instrucciones:
          "Solicita a Intervención la acreditación de que existe crédito presupuestario adecuado y suficiente para el importe del contrato.",
        documentoRequerido: "Certificado de existencia de crédito",
        responsableRol: "intervencion",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 6,
        titulo: "Declaración responsable de conflicto de intereses (DACI)",
        instrucciones:
          "Todos los miembros de la mesa de contratación y personal que participa en el expediente deben cumplimentar y firmar la DACI.",
        justificacionLegal: "Art. 64 LCSP. Resuelve incidencia D6 de auditoría.",
        documentoRequerido: "DACI firmada por todos los participantes",
        responsableRol: "juridico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 7,
        titulo: "Informe jurídico",
        instrucciones:
          "Emite informe jurídico sobre el PCAP y el procedimiento de contratación elegido. Verifica la conformidad con la LCSP.",
        documentoRequerido: "Informe jurídico",
        responsableRol: "juridico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 8,
        titulo: "Fiscalización previa",
        instrucciones:
          "Intervención fiscaliza el expediente completo antes de la aprobación. Verifica documentación, crédito y procedimiento.",
        documentoRequerido: "Informe de fiscalización previa",
        responsableRol: "intervencion",
        validadorRol: "intervencion",
        requiereValidacion: true,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 9,
        titulo: "Aprobación del expediente y autorización del gasto",
        instrucciones:
          "El órgano de contratación aprueba el expediente y autoriza el gasto. Firma la resolución correspondiente.",
        documentoRequerido: "Resolución de aprobación y autorización",
        responsableRol: "direccion",
        validadorRol: "direccion",
        requiereValidacion: true,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 10,
        titulo: "Publicación en PLACSP / perfil del contratante",
        instrucciones:
          "Publica el anuncio de licitación en la Plataforma de Contratación del Sector Público (PLACSP) y en el perfil del contratante.\n\nSi es SARA, publicar también en el DOUE.",
        responsableRol: "juridico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
      {
        orden: 11,
        titulo: "Plazo de presentación de ofertas",
        instrucciones:
          "Periodo de presentación de ofertas por parte de los licitadores.\n- **No SARA:** mínimo 15 días naturales\n- **SARA abierto:** mínimo 35 días naturales\n\nLa cuenta atrás se calcula automáticamente según la fecha de publicación.",
        justificacionLegal: "Arts. 156.3 y 156.4 LCSP: plazos de presentación de ofertas.",
        responsableRol: "juridico",
        plazoOrientativoDias: 15,
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
      {
        orden: 12,
        titulo: "Apertura de ofertas y mesa de contratación",
        instrucciones:
          "Constituye la mesa de contratación y procede a la apertura de las ofertas recibidas. Levanta **acta firmada** por todos los componentes de la mesa.\n\n**Importante:** El acta debe estar firmada por todos los miembros (resuelve incidencia D7).",
        justificacionLegal: "Arts. 326-327 LCSP: mesa de contratación.",
        documentoRequerido: "Acta de apertura firmada por la mesa",
        responsableRol: "juridico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 13,
        titulo: "Valoración técnica",
        instrucciones:
          "Elabora el informe de valoración técnica de las ofertas según los criterios establecidos en el PCAP. El informe debe estar **firmado** por el evaluador.\n\n**Importante:** Informe con firma obligatoria (resuelve incidencia D7).",
        documentoRequerido: "Informe de valoración técnica firmado",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 14,
        titulo: "Propuesta de adjudicación",
        instrucciones:
          "La mesa de contratación eleva la propuesta de adjudicación al órgano de contratación, indicando el licitador mejor valorado.",
        documentoRequerido: "Propuesta de adjudicación de la mesa",
        responsableRol: "juridico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: false,
      },
      {
        orden: 15,
        titulo: "Requerimiento documentación al adjudicatario",
        instrucciones:
          "Requiere al licitador propuesto como adjudicatario la documentación acreditativa. Plazo: **10 días hábiles**.\n\nVincula al proveedor adjudicatario en el expediente.",
        justificacionLegal: "Art. 150.2 LCSP: requerimiento de documentación.",
        responsableRol: "juridico",
        plazoOrientativoDias: 10,
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
      {
        orden: 16,
        titulo: "Adjudicación",
        instrucciones:
          "El órgano de contratación dicta la resolución de adjudicación. Notifica a todos los licitadores.",
        documentoRequerido: "Resolución de adjudicación",
        responsableRol: "direccion",
        validadorRol: "direccion",
        requiereValidacion: true,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 17,
        titulo: "Formalización del contrato",
        instrucciones:
          "Formaliza el contrato con el adjudicatario.\n- Plazo mínimo: **15 días hábiles** desde notificación (si procede recurso especial)\n- Plazo máximo: 5 días hábiles desde fin del plazo de recurso",
        justificacionLegal: "Art. 153 LCSP: formalización de contratos.",
        documentoRequerido: "Contrato formalizado",
        responsableRol: "juridico",
        plazoOrientativoDias: 15,
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: false,
      },
      {
        orden: 18,
        titulo: "Publicación de formalización",
        instrucciones:
          "Publica la formalización del contrato en el perfil del contratante y registros pertinentes.",
        responsableRol: "juridico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // 3.3 CONVENIO
  // ═══════════════════════════════════════════════════
  {
    tipo: "convenio",
    nombre: "Convenio de colaboración",
    descripcion:
      "Acuerdo de colaboración con otras entidades. Arts. 47-53 Ley 40/2015 de Régimen Jurídico del Sector Público.",
    estadoVersion: "publicado",
    pasos: [
      {
        orden: 1,
        titulo: "Memoria justificativa de la colaboración",
        instrucciones:
          "Redacta la memoria justificativa que acredite:\n- Interés público de la colaboración\n- Imposibilidad de articularlo como contrato\n- Encaje competencial de ambas partes\n- Objetivos y resultados esperados",
        justificacionLegal:
          "Art. 48.3 Ley 40/2015: contenido mínimo del convenio. Resuelve incidencia E3 de auditoría.",
        documentoRequerido: "Memoria justificativa",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 2,
        titulo: "Identificación de la contraparte",
        instrucciones:
          "Recopila los datos jurídicos completos de la entidad con la que se va a convenir:\n- Denominación y NIF\n- Representante legal\n- Capacidad para convenir\n\nCrea o vincula la contraparte como proveedor en el sistema.",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: true,
      },
      {
        orden: 3,
        titulo: "Borrador del convenio",
        instrucciones:
          "Redacta el articulado del convenio incluyendo:\n- Objeto y alcance\n- Obligaciones de cada parte\n- Financiación y aportaciones\n- Vigencia y posible prórroga\n- Comisión de seguimiento\n- Causas de resolución\n- Régimen de modificación",
        documentoRequerido: "Borrador del convenio",
        responsableRol: "juridico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 4,
        titulo: "Memoria económica",
        instrucciones:
          "Si el convenio implica aportación económica, elabora la memoria económica detallando importes, plazos de pago y justificación.",
        documentoRequerido: "Memoria económica",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: false,
        condicionOmision: { importe_min: 1 },
      },
      {
        orden: 5,
        titulo: "Informe del servicio jurídico",
        instrucciones:
          "El servicio jurídico emite informe preceptivo sobre el convenio, verificando su encaje legal y la corrección del articulado.",
        documentoRequerido: "Informe jurídico preceptivo",
        responsableRol: "juridico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 6,
        titulo: "Autorización del órgano competente",
        instrucciones:
          "Solicita la autorización del Patronato o, según importe y materia, del Consell o Conselleria correspondiente.",
        documentoRequerido: "Resolución de autorización",
        responsableRol: "direccion",
        validadorRol: "direccion",
        requiereValidacion: true,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 7,
        titulo: "Fiscalización previa",
        instrucciones:
          "Intervención fiscaliza el expediente si el convenio conlleva compromisos económicos.",
        documentoRequerido: "Informe de fiscalización",
        responsableRol: "intervencion",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: false,
        condicionOmision: { importe_min: 1 },
      },
      {
        orden: 8,
        titulo: "Firma del convenio",
        instrucciones:
          "Procede a la firma del convenio por las partes. Asegura que firman los representantes con capacidad suficiente.",
        documentoRequerido: "Convenio firmado",
        responsableRol: "direccion",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 9,
        titulo: "Inscripción en el Registro Electrónico",
        instrucciones:
          "Inscribe el convenio en el Registro Electrónico Estatal de Órganos e Instrumentos de Cooperación en un plazo máximo de **3 meses** desde la firma.",
        justificacionLegal: "Art. 48.8 Ley 40/2015: inscripción obligatoria.",
        responsableRol: "juridico",
        plazoOrientativoDias: 90,
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
      {
        orden: 10,
        titulo: "Publicación en BOE/DOGV",
        instrucciones:
          "Publica el convenio en el boletín oficial correspondiente según la naturaleza de las partes.",
        responsableRol: "juridico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
      {
        orden: 11,
        titulo: "Comunicación al Senado",
        instrucciones:
          "Si el convenio afecta a entes territoriales (CCAA, entidades locales), comunica al Senado.",
        responsableRol: "juridico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
        condicionOmision: { afecta_entes_territoriales: false },
      },
      {
        orden: 12,
        titulo: "Seguimiento y comisión mixta",
        instrucciones:
          "Convoca reuniones periódicas de la comisión de seguimiento. Levanta actas de cada reunión con los acuerdos adoptados.",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // 3.4 SOFTLANDING
  // ═══════════════════════════════════════════════════
  {
    tipo: "softlanding",
    nombre: "Softlanding de startups",
    descripcion:
      "Procedimiento interno VIC para la acogida de startups internacionales en el ecosistema de Valencia. No regulado por LCSP.",
    estadoVersion: "borrador",
    pasos: [
      {
        orden: 1,
        titulo: "Solicitud de la startup",
        instrucciones:
          "Registra la solicitud de la startup con su dossier:\n- Pitch deck\n- Equipo fundador\n- Métricas de tracción\n- Mercado objetivo en Valencia\n- Motivación para el softlanding",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: false,
        documentoRequerido: "Dossier de la startup",
      },
      {
        orden: 2,
        titulo: "Verificación de criterios de elegibilidad",
        instrucciones:
          "Evalúa si la startup cumple los criterios:\n- Sector innovador alineado con verticales VIC\n- Fase adecuada (early stage / growth)\n- Sin presencia previa significativa en España\n- Encaje con el ecosistema valenciano",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: true,
      },
      {
        orden: 3,
        titulo: "Evaluación técnica y comité de selección",
        instrucciones:
          "El comité interno evalúa el encaje estratégico de la startup. Documenta la decisión con acta del comité.",
        responsableRol: "direccion",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
        documentoRequerido: "Acta del comité de selección",
      },
      {
        orden: 4,
        titulo: "Comunicación de aceptación",
        instrucciones: "Envía carta de admisión al programa a la startup.",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
      {
        orden: 5,
        titulo: "Acuerdo de servicios de softlanding",
        instrucciones:
          "Formaliza qué servicios se prestan: espacio de trabajo, mentor, conexiones institucionales, soporte legal/fiscal. Define si es gratuito o con contraprestación.",
        documentoRequerido: "Acuerdo de servicios",
        responsableRol: "juridico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: false,
      },
      {
        orden: 6,
        titulo: "Onboarding",
        instrucciones:
          "Reunión de bienvenida con la startup:\n- Asignación de mentor\n- Presentación del ecosistema\n- Tour de las instalaciones\n- Configuración de accesos",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
      {
        orden: 7,
        titulo: "Plan de aterrizaje",
        instrucciones:
          "Co-diseña con la startup los objetivos a 3, 6 y 12 meses. Define KPIs de seguimiento.",
        documentoRequerido: "Plan de aterrizaje con KPIs",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: false,
      },
      {
        orden: 8,
        titulo: "Seguimiento mensual de KPIs",
        instrucciones:
          "Realiza seguimiento mensual del avance del plan y las métricas de la startup en Valencia.",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
      {
        orden: 9,
        titulo: "Informe de cierre del programa",
        instrucciones:
          "Elabora informe de valoración del impacto y decisión sobre continuidad o graduación de la startup.",
        documentoRequerido: "Informe de cierre",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: false,
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // 3.5 CESIÓN DE ESPACIOS
  // ═══════════════════════════════════════════════════
  {
    tipo: "cesion_espacios",
    nombre: "Cesión de espacios (Las Naves / La Harinera)",
    descripcion:
      "Procedimiento para la cesión temporal de espacios en las sedes de VIC. Reglamento interno + Ley 33/2003 del Patrimonio.",
    estadoVersion: "publicado",
    pasos: [
      {
        orden: 1,
        titulo: "Solicitud de uso",
        instrucciones:
          "Registra la solicitud con:\n- Tipo de evento/uso\n- Fechas y horarios\n- Aforo previsto\n- Espacio solicitado\n- Organizador y contacto\n\nCompleta los campos de metadata del expediente (espacio, fechas, aforo).",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
        documentoRequerido: "Formulario de solicitud",
      },
      {
        orden: 2,
        titulo: "Verificación de disponibilidad",
        instrucciones:
          "Comprueba el calendario de espacios. La app muestra automáticamente cesiones que se solapan con las fechas solicitadas.\n\nSi hay solapamiento total, no se puede avanzar.",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: true,
      },
      {
        orden: 3,
        titulo: "Validación de encaje con misión VIC",
        instrucciones:
          "Verifica que el uso solicitado se alinea con la misión de VIC: innovación, emprendimiento, tecnología, ecosistema.\n\nRechaza usos meramente comerciales sin valor para el ecosistema y documenta el criterio.",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
      {
        orden: 4,
        titulo: "Determinación del régimen",
        instrucciones:
          "Decide si la cesión es:\n- **Gratuita:** interés público concurrente\n- **Onerosa:** precio público aplicable\n\nDocumenta el criterio de decisión.",
        responsableRol: "juridico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
      {
        orden: 5,
        titulo: "Acuerdo de cesión",
        instrucciones:
          "Redacta el documento de cesión con:\n- Objeto, fechas y espacios\n- Contraprestación (si onerosa)\n- Obligaciones del cesionario\n- Cobertura de seguros\n- Condiciones de restitución",
        documentoRequerido: "Acuerdo de cesión",
        responsableRol: "juridico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 6,
        titulo: "Verificación de seguros y responsabilidad",
        instrucciones:
          "Comprueba que el organizador dispone de seguro de responsabilidad civil vigente y adecuado al tipo de evento.",
        documentoRequerido: "Póliza de RC del organizador",
        responsableRol: "juridico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 7,
        titulo: "Confirmación al solicitante y comunicación interna",
        instrucciones:
          "Confirma la cesión al solicitante y comunica al equipo de operaciones de la sede para la preparación logística.",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
      {
        orden: 8,
        titulo: "Realización del evento / uso",
        instrucciones:
          "Seguimiento del cumplimiento de las condiciones durante el uso del espacio.",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
      {
        orden: 9,
        titulo: "Acta de devolución del espacio",
        instrucciones:
          "Documenta el estado de los espacios tras el uso:\n- Incidencias o daños\n- Limpieza\n- Posibles reclamaciones",
        documentoRequerido: "Acta de devolución",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: false,
      },
      {
        orden: 10,
        titulo: "Cierre y archivo",
        instrucciones:
          "Si la cesión fue onerosa, valida que se ha realizado el cobro. Archiva el expediente.",
        responsableRol: "juridico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
    ],
  },

  // ═══════════════════════════════════════════════════
  // 3.6 GASTOS
  // ═══════════════════════════════════════════════════
  {
    tipo: "gastos",
    nombre: "Gastos (caja fija, anticipos, dietas)",
    descripcion:
      "Procedimiento para gastos menores: caja fija, anticipos, dietas y gastos de representación. Normativa interna de Tesorería.",
    estadoVersion: "publicado",
    pasos: [
      {
        orden: 1,
        titulo: "Justificación previa de la necesidad",
        instrucciones:
          "Describe el concepto del gasto y el proyecto al que se imputa. Campos a completar:\n- Concepto del gasto\n- Proyecto de imputación\n- Importe estimado",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: true,
      },
      {
        orden: 2,
        titulo: "Autorización previa",
        instrucciones:
          "Solicita autorización del gasto a Dirección o al responsable de área.\n\n**Nota:** Gastos por debajo de 150 € pueden ser autorizados directamente por el responsable de área sin pasar por Dirección.",
        documentoRequerido: "Autorización del gasto",
        responsableRol: "direccion",
        validadorRol: "direccion",
        requiereValidacion: true,
        requiereDocumento: true,
        bloqueante: true,
        condicionOmision: { importe_max: 150 },
      },
      {
        orden: 3,
        titulo: "Verificación de partida presupuestaria",
        instrucciones:
          "Intervención verifica la existencia de crédito suficiente en la partida presupuestaria correspondiente.",
        responsableRol: "intervencion",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: true,
      },
      {
        orden: 4,
        titulo: "Ejecución del gasto",
        instrucciones:
          "Realiza el gasto autorizado: viaje, compra, servicio, etc.",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
      {
        orden: 5,
        titulo: "Aportación de justificantes",
        instrucciones:
          "Sube los justificantes del gasto realizado:\n- Facturas con NIF, fecha, concepto e IVA desglosado\n- Tickets o recibos\n- Partes de viaje (si aplica)\n- Billetes y tarjetas de embarque (si viaje)",
        documentoRequerido: "Facturas y justificantes",
        responsableRol: "tecnico",
        requiereValidacion: false,
        requiereDocumento: true,
        bloqueante: true,
      },
      {
        orden: 6,
        titulo: "Conformidad técnica",
        instrucciones:
          "El responsable de área verifica que los justificantes son coherentes con la autorización previa y emite la conformidad técnica.\n\nPlazo orientativo: 5 días hábiles.",
        responsableRol: "tecnico",
        validadorRol: "tecnico",
        plazoOrientativoDias: 5,
        requiereValidacion: true,
        requiereDocumento: false,
        bloqueante: false,
      },
      {
        orden: 7,
        titulo: "Liquidación",
        instrucciones:
          "Intervención calcula el importe a abonar o reintegrar según los justificantes presentados.",
        responsableRol: "intervencion",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
      {
        orden: 8,
        titulo: "Pago y contabilización",
        instrucciones:
          "Registra contablemente el gasto y tramita el pago al beneficiario o el reintegro del anticipo.",
        responsableRol: "intervencion",
        requiereValidacion: false,
        requiereDocumento: false,
        bloqueante: false,
      },
    ],
  },
];
