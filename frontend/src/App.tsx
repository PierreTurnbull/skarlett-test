import { Button, Paper, ThemeProvider } from "@mui/material";
import { useMemo, useState } from "react";
import { CategoryAccordion } from "./components/CategoryAccordion/CategoryAccordion";
import { theme } from "./theme";
import type { TWarrantiesByCategory, TWarrantyTablesComparison } from "./types/warranty.types";

function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false)
  const [warrantyTablesComparison, setWarrantyTablesComparison] = useState<TWarrantyTablesComparison | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (selectedFiles.length !== 2) {
        alert("Vous devez sélectionner précisément 2 fichiers.");
        return;
      }
      setFiles(selectedFiles);
    }
  };

  const handleUpload = async () => {
    try {
      setIsLoading(true)

      if (files.length === 0) return;

      const formData = new FormData();
      formData.append("file1", files[0]);
      formData.append("file2", files[1]);

      const res = await fetch("http://localhost:4000/pdfData", {
        method: "POST",
        body: formData,
      });
      const warrantyTablesComparison = await res.json() as TWarrantyTablesComparison;
      setWarrantyTablesComparison(warrantyTablesComparison)
    } catch (err) {
      console.error(err);
    }

    setIsLoading(false)
  };

  const warrantiesByCategory = useMemo(() => {
    if (!warrantyTablesComparison) {
      return []
    }

    const categoryKeys = [
      ...warrantyTablesComparison[0].categories.map(category => category.name),
      ...warrantyTablesComparison[1].categories.map(category => category.name),
    ].flat()
    const uniqueCategoryKeys = [...new Set(categoryKeys)]

    const warrantiesByCategory: TWarrantiesByCategory = []
    for (const uniqueCategoryKey of uniqueCategoryKeys) {
      const leftCategory = warrantyTablesComparison[0].categories.find(category => category.name === uniqueCategoryKey)
      const rightCategory = warrantyTablesComparison[1].categories.find(category => category.name === uniqueCategoryKey)
      warrantiesByCategory.push([leftCategory, rightCategory])
    }

    return warrantiesByCategory
  }, [warrantyTablesComparison])

  return (
    <ThemeProvider theme={theme}>
      <div style={{ display: "flex", justifyContent: "center", }}>
        <Paper style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
          margin: 32,
          padding: 16,
          width: "max-content",
        }}>
          <input
            accept="application/pdf"
            id="multi-file-input"
            type="file"
            multiple
            style={{ display: "none" }}
            onChange={handleChange}
          />
          <label htmlFor="multi-file-input">
            <Button variant="contained" component="span">
              Upload Files
            </Button>
          </label>
          <p>{files.length} fichiers sélectionnés.</p>
          <Button
            onClick={handleUpload}
            disabled={files.length === 0 || isLoading}
          >
            Envoyer
          </Button>
          {
            isLoading ? <p>Chargement en cours...</p> : null
          }
          {
            warrantyTablesComparison
              ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <p style={{ fontSize: 20 }}>{warrantyTablesComparison[0].name}</p>
                    <p style={{ fontSize: 20 }}>{warrantyTablesComparison[1].name}</p>
                  </div>
                  {
                    warrantiesByCategory.map(warrantiesByCategoryItem => {
                      const [leftCategory, rightCategory]: TWarrantiesByCategory[number] = warrantiesByCategoryItem

                      return (
                        <div>
                          <div style={{ display: "flex", gap: 32 }}>
                            <CategoryAccordion category={leftCategory} />
                            <CategoryAccordion category={rightCategory} />
                          </div>
                        </div>
                      )
                    })
                  }
                </div>
              )
              : null
          }
        </Paper>
      </div>
    </ThemeProvider>
  )
}

export default App
