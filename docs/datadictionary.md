# Datadictionary

## Dimensioner

| Fält | Beskrivning |
|---|---|
| `month` | Referensmånad, format `YYYYMmm` |
| `region` | Riket, län eller kommun |
| `sex` | Kön; totalt, kvinnor och män hämtas från SCB |
| `age` | Åldersgrupp; rapporten använder `20–64 år` |
| `birth_region` | Totalt, inrikes födda eller utrikes födda |

## Mått

Måtten hämtas direkt från SCB och ska inte räknas om i applikationen:

- antal sysselsatta
- antal arbetslösa
- antal sysselsatta och arbetslösa (arbetskraften)
- antal studerande
- antal pensionärer
- antal sjuka
- antal övriga
- antal totalt
- arbetslöshet
- arbetskraftsdeltagande
- sysselsättningsgrad

## Metodnotis

Statistiken är preliminär och kan revideras. SCB använder CKM (Cell Key Method) som röjandekontroll. Det innebär att en liten, kontrollerad slumpmässig osäkerhet tillförs statistikvärdena. Redovisade totaler kan därför avvika från summan av redovisade delgrupper.
