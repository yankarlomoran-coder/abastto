// ─── Centralized Label Mappings ─────────────────────────────────────────
// Single source of truth for all display labels used across the platform.
// Import from '@/lib/constants' instead of duplicating in each file.

export const INDUSTRY_LABELS: Record<string, string> = {
    AGRICULTURA: 'Agricultura',
    CONSTRUCCION: 'Construcción',
    ESTADO_GOBIERNO: 'Estado / Gobierno',
    MANUFACTURA: 'Manufactura',
    MEDICAL_SALUD: 'Salud',
    RETAIL_COMERCIO: 'Retail / Comercio',
    SERVICIOS_PROFESIONALES: 'Servicios Profesionales',
    TECNOLOGIA: 'Tecnología',
    TRANSPORTE_LOGISTICA: 'Transporte / Logística',
    OTRO: 'Otro',
}

export const LOCATION_LABELS: Record<string, string> = {
    ALTA_VERAPAZ: 'Alta Verapaz',
    BAJA_VERAPAZ: 'Baja Verapaz',
    CHIMALTENANGO: 'Chimaltenango',
    CHIQUIMULA: 'Chiquimula',
    EL_PROGRESO: 'El Progreso',
    ESCUINTLA: 'Escuintla',
    GUATEMALA: 'Guatemala',
    HUEHUETENANGO: 'Huehuetenango',
    IZABAL: 'Izabal',
    JALAPA: 'Jalapa',
    JUTIAPA: 'Jutiapa',
    PETEN: 'Petén',
    QUETZALTENANGO: 'Quetzaltenango',
    QUICHE: 'Quiché',
    RETALHULEU: 'Retalhuleu',
    SACATEPEQUEZ: 'Sacatepéquez',
    SAN_MARCOS: 'San Marcos',
    SANTA_ROSA: 'Santa Rosa',
    SOLOLA: 'Sololá',
    SUCHITEPEQUEZ: 'Suchitepéquez',
    TOTONICAPAN: 'Totonicapán',
    ZACAPA: 'Zacapa',
}

export const STATUS_LABELS: Record<string, { label: string; class: string }> = {
    DRAFT_PENDING_APPROVAL: {
        label: 'Borrador',
        class: 'bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-900/50',
    },
    OPEN: {
        label: 'Abierta',
        class: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/50',
    },
    EVALUATING: {
        label: 'En Evaluación',
        class: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50',
    },
    AWARDED: {
        label: 'Adjudicada',
        class: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50',
    },
    PENDING_DELIVERY: {
        label: 'Entrega Pendiente',
        class: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-900/50',
    },
    DELIVERED: {
        label: 'Entregada',
        class: 'bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/50',
    },
    CLOSED: {
        label: 'Cerrada',
        class: 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-transparent',
    },
}

export const CATEGORY_LABELS: Record<string, string> = {
    TECH: 'Tecnología y Equipo',
    OFFICE: 'Suministros de Oficina',
    CONSTRUCTION: 'Construcción y Materiales',
    SERVICES: 'Servicios Profesionales',
    OTHER: 'Otro',
}

export const ROLE_LABELS: Record<string, string> = {
    BUYER: 'Comprador',
    SUPPLIER: 'Proveedor',
    ADMIN: 'Administrador',
}

export const COMPANY_ROLE_LABELS: Record<string, string> = {
    OWNER: 'Propietario',
    ADMIN: 'Administrador',
    MEMBER: 'Miembro',
    VIEWER: 'Observador',
}
