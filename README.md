# BAS – månadsvis arbetsmarknadsstatistik

Webbapplikation för att följa Befolkningens arbetsmarknadsstatus (BAS) med data från SCB:s statistikdatabas.

## Avgränsning, version 1

- Geografi: Riket, samtliga län samt kommunerna Stockholm, Göteborg och Malmö
- Kön: Totalt, kvinnor och män
- Ålder: 20–64 år
- Födelseregion: Totalt, inrikes födda och utrikes födda
- Tid: 2020M01–senaste tillgängliga månad
- Mått: SCB:s redovisade antal och procent

Källa: [SCB, Arbetsmarknadsstatus efter region, kön, ålder och födelseregion](https://www.statistikdatabasen.scb.se/pxweb/sv/ssd/START__AM__AM0210__AM0210A/ArbStatusM/).

Statistiken är preliminär. Tabellen använder Cell Key Method (CKM) som röjandekontroll. Värden får därför inte summeras eller räknas om till egna totaler utan ska presenteras som SCB redovisar dem.

## Projektstruktur

```text
R/                  R-skript för hämtning och bearbetning
data/raw/           Rådata från SCB, ej versionerad som standard
data/processed/     JSON-filer som webbappen läser
web/                Statisk webbapp
docs/               Datadictionary och metodnoteringar
.github/workflows/  Automatisk månadsvis uppdatering
```

## Lokal körning

Installera R-paketen `pxweb`, `tidyverse`, `jsonlite`, `fs` och `lubridate`. Kör därefter:

```r
source("R/hamta_scb_data.R")
source("R/bearbeta_data.R")
```

För att testa webbappen lokalt behöver den öppnas via en lokal webbserver, inte genom att dubbelklicka på `web/index.html`. Kör `start_web.ps1` från projektmappen och öppna sedan `http://127.0.0.1:8765/web/`.

API-uttaget använder SCB:s PxWebApi v1 tills vi har verifierat motsvarande uttag i v2. SCB anger att v1 fungerar till årsskiftet 2026/2027.
