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

## Branschdata

Filen `branscher.json` innehåller månadsvis antal sysselsatta 15–74 år efter arbetsställets belägenhet. Uttaget avser totalt kön och totalt födelseregion.

| Fält | Beskrivning |
|---|---|
| `region` | Riket, län eller kommun |
| `branschkod` | Kod för näringsgren enligt SNI 2007 |
| `bransch` | Näringsgren enligt SNI 2007, inklusive total och uppgift saknas |
| `månad` | Referensmånad, format `YYYYMmm` |
| `antal` | Antal sysselsatta enligt SCB:s publicerade värde |
