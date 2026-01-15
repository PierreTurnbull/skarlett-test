export type TWarranty = {
    name: string
    summary: string
    specialRules: string
}

export type TWarrantyCategory = {
    name: string
    warranties: TWarranty[]
}

export type TWarrantyTableSummary = {
    name: string
    categories: TWarrantyCategory[]
}

export type TWarrantyTablesComparison = [TWarrantyTableSummary, TWarrantyTableSummary]

export type TWarrantiesByCategory = [
    TWarrantyCategory | undefined,
    TWarrantyCategory | undefined,
][]