/**
 * Legal glossary — contextual tooltips for legal terms.
 * Used across the app to help non-legal users understand terminology.
 */

export const GLOSSARY: Record<string, string> = {
  LCSP: "Ley 9/2017 de Contratos del Sector Público. Marco legal principal para la contratación pública en España.",
  PCAP: "Pliego de Cláusulas Administrativas Particulares. Documento que establece las condiciones jurídicas del contrato.",
  PPT: "Pliego de Prescripciones Técnicas. Describe el objeto del contrato desde el punto de vista técnico.",
  SARA: "Sujeto a Regulación Armonizada. Contratos que superan umbrales de la UE y requieren publicación en DOUE.",
  DOUE: "Diario Oficial de la Unión Europea. Publicación obligatoria para contratos SARA.",
  PLACSP: "Plataforma de Contratación del Sector Público. Portal oficial de licitaciones públicas en España.",
  RLS: "Row Level Security. Mecanismo de seguridad a nivel de fila en PostgreSQL.",
  DACI: "Declaración responsable de Ausencia de Conflicto de Intereses. Documento obligatorio para participantes en expedientes de contratación.",
  BOP: "Boletín Oficial de la Provincia. Publicación oficial de ámbito provincial.",
  DOGV: "Diari Oficial de la Generalitat Valenciana. Publicación oficial de la Comunitat Valenciana.",
  BOE: "Boletín Oficial del Estado. Publicación oficial de ámbito estatal.",
  RPT: "Relación de Puestos de Trabajo. Documento que define la estructura de personal de una entidad pública.",
  NIF: "Número de Identificación Fiscal. Identificador tributario de personas físicas y jurídicas en España.",
  IVA: "Impuesto sobre el Valor Añadido. Impuesto indirecto aplicable a bienes y servicios.",
  "contrato menor": "Contrato de cuantía inferior a 15.000 € (servicios), 40.000 € (obras) o 50.000 € (I+D+i), con procedimiento simplificado (Art. 118 LCSP).",
  "procedimiento abierto": "Procedimiento de contratación en el que cualquier empresa puede presentar una oferta (Arts. 156-158 LCSP).",
  "valor estimado": "Cuantía total del contrato, incluidas prórrogas y modificaciones previstas, excluido el IVA.",
  fraccionamiento: "División artificiosa de un contrato en varios menores para eludir los umbrales de licitación. Prohibido por Art. 99.2 LCSP.",
  "mesa de contratación": "Órgano colegiado que asiste al órgano de contratación en la valoración de ofertas (Arts. 326-327 LCSP).",
  "fiscalización previa": "Control de legalidad ejercido por la Intervención antes de la aprobación del gasto.",
  "perfil del contratante": "Sección del portal institucional donde se publica información sobre contrataciones.",
  convenio: "Acuerdo entre entidades públicas o entre entidades públicas y privadas para un fin de interés común (Arts. 47-53 Ley 40/2015).",
};

export function getGlossaryTerm(term: string): string | undefined {
  const lower = term.toLowerCase();
  return GLOSSARY[term] ?? GLOSSARY[lower];
}
