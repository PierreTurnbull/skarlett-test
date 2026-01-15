import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material"
import type { TWarrantyCategory } from "../../types/warranty.types"

type TCategoryAccordionProps = {
    category?: TWarrantyCategory,
}

export const CategoryAccordion = ({
    category,
}: TCategoryAccordionProps) => {
    return (
        <Accordion style={{ width: 300, margin: "initial" }}>
            <AccordionSummary
                expandIcon={"v"}
                aria-controls="panel1-content"
                id="panel1-header"
            >
                <p>{category ? category.name : "Aucun équivalent"}</p>
            </AccordionSummary>
            <AccordionDetails>
                {
                category
                    ? category.warranties.map(warranty => {
                    return (
                        <div
                            style={{ border: "1px solid white", borderRadius: 8, padding: 8, }}
                            key={warranty.name}
                        >
                            <p style={{ fontSize: 20 }}>{warranty.name}</p>
                            <p style={{ fontSize: 16 }}>{warranty.summary}</p>
                            <p style={{ fontSize: 12 }}>{warranty.specialRules}</p>
                        </div>
                    )
                    })
                    : null
                }
            </AccordionDetails>
        </Accordion>
    )
}