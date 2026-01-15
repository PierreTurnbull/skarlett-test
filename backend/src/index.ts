import path from "path"
import express, { Request } from "express";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { TWarrantyTablesComparison } from "./types/warranty.types";
 
dotenv.config();
const app = express();
app.use(cors())
const upload = multer({ storage: multer.memoryStorage() });

const openAiClient = new OpenAI({
    apiKey: process.env.OPENAPI_KEY
});

app.post(
    "/pdfData", 
    upload.fields([
        { name: "file1", maxCount: 1 },
        { name: "file2", maxCount: 1 },
    ]),
    async (req, res) => {
        try {
            if (!req.files) {
                return res.status(400).json({ error: "Missing file(s)." });
            }

            const texts: string[] =  []
            for (const file of Object.values(req.files)) {
                const data = new PDFParse({ data: new Uint8Array(file[0].buffer), 
                    standardFontDataUrl: path.join(__dirname, "standard_fonts/")
                });
                const text = (await data.getText()).text;
                console.debug(`Got text from PDF: ${text}`)

                texts.push(text)
            }

            const prompt = `You must compare 2 warranty tables.
You are given 1 PDF text content for each.
You will output a JSON string and nothing else.

The JSON string, once parsed in TypeScript will match exactly type TWarrantyTablesComparison:

type TWarranty = {
    name: string
    summary: string
    specialRules: string
}

type TWarrantyCategory = {
    name: string
    warranties: TWarranty[]
}

type TWarrantyTableSummary = {
    name: string
    categories: TWarrantyCategory[]
}

type TWarrantyTablesComparison = [TWarrantyTableSummary, TWarrantyTableSummary]


In both PDFs, you will identify the main categories of warranties. Eg: dental, optic, common medicine, hospitalization, etc.
When a category in PDF 1 is similar to a category in PDF 2, you will merge categories them.
For example, a category containing warranties containing mostly optics material, and another category containing ophthalmologist consultations can be considered the same "optics" category.
When a category in one PDF cannot be mapped to a category in the other PDF, then you'll only register this category for the former.
Each category will include multiple specific warranties. For each, you will make a very short summary that represents their range.
For example, if optics reimbursement are 20€ on level 1, 30€ on level 2, 40€ on level 3, you might output something like "20-40€". If there are many informations, make a high level summary instead of listing all exhaustively.
For each category, you will make a high level, concise but exhaustive summary of special cases/rules. Eg: "Fidelity bonuses greatly increase reimbursements after a year. Most of the warranties require presenting invoices.".
Names must be short.
Names of 2 categories that match each other must have the exact same case and formatting, such as name1 === name2.

You will output data in the same language as the warranty tables.

PDF text 1:
${texts[0]}

PDF text 2:
${texts[1]}`

            const response = await openAiClient.responses.create({
                model: "gpt-5-nano",
                input: prompt
            });
            const warrantyTable = JSON.parse(response.output_text) as TWarrantyTablesComparison

            console.debug("Got answer:", response)

            res.json(warrantyTable);
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: "Failed to parse PDF" });
        }
    });

app.listen(4000, () => {
    console.log("Server running on http://localhost:4000");
});