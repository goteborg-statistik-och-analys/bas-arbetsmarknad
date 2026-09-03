# Kodprinciper för R – Göteborgs Stad

Detta dokument samlar principer och best practices för R-programmering som prioriterar enkelhet, läsbarhet och underhållbarhet.

---

## Hur detta dokument används

Detta dokument definierar Göteborgs Stads standarder för R-programmering och används som referens när vi utvecklar analyser och visualiseringar med hjälp av AI-assistenter.

**För AI-tjänster:** Följ dessa principer automatiskt när du genererar R-kod. Använd standardprojektstrukturen, följ namngivningskonventioner och prioritera tidyverse-approach.

**För användare:** Referera till specifika principer, t.ex. "använd projektstruktur enligt dokumentet" eller "följ namngivningsprincip för funktioner (verb_substantiv)".

---

## Innehåll

1. [Grundfilosofi](#grundfilosofi)
2. [Regler och riktlinjer](#regler-och-riktlinjer)
3. [Projektstruktur](#projektstruktur)
4. [Kodningsprinciper](#kodningsprinciper)
5. [Tidyverse-first approach](#tidyverse-first-approach)
6. [Funktioner](#funktioner)
7. [Reproducerbarhet](#reproducerbarhet)
8. [Debugging och felsökning](#debugging-och-felsökning)
9. [Vanliga misstag att undvika](#vanliga-misstag-att-undvika)
10. [Integration med andra standarder](#integration-med-andra-standarder)

---

## Grundfilosofi

### Våra kärnvärden

**Enkelhet framför komplexitet**
- Skriv kod som är lätt att förstå, inte kod som imponerar
- Om du kan göra något på ett enklare sätt – gör det
- Enkla lösningar är lättare att underhålla och utveckla

**Läsbarhet**
- Kod läses oftare än den skrivs
- Skriv för människor först, datorn sedan
- Din framtida jag ska kunna förstå koden om sex månader

**Underhållbarhet**
- Kod ska vara lätt att uppdatera när data ändras
- Kod ska vara lätt att felsöka när något går fel
- Kod ska vara lätt att återanvända i nya projekt

**Reproducerbarhet**
- Någon annan ska kunna köra din kod och få samma resultat
- Dokumentera vad koden gör och varför
- Använd relativa sökvägar, aldrig absoluta

---

## Regler och riktlinjer

### Absoluta regler (måste följas)

Dessa är icke-förhandlingsbara krav för all R-kod i Göteborgs Stad:

1. **Använd RStudio-projekt** - Aldrig `setwd()` i kod
2. **Relativa sökvägar** - Använd `here::here()`, aldrig absoluta sökvägar som `C:/Users/namn/...`
3. **data/raw/ är helig** - Ändra aldrig originaldata, all bearbetning sker i skript
4. **Använd `<-` för tilldelning** - Inte `=`
5. **2 mellanslag indentering** - Aldrig tab eller 4 mellanslag
6. **Ladda paket i början** - Alla `library()` i början av skript, aldrig mitt i kod

### Starka rekommendationer (följ om möjligt)

- **Tidyverse-first approach** - Använd tidyverse-paket som standard
- **Native pipe `|>`** för nya projekt - Fungerar i R 4.1+
- **Funktioner vid upprepning** - Skapa funktion när kod upprepas 3+ gånger
- **Kommentera VARFÖR, inte VAD** - Koden visar vad, kommentarer förklarar varför
- **Max 80 tecken radlängd** - Underlättar läsning och kodgranskning
- **Beskrivande namn** - `population_total` är bättre än `pop` eller `x`

---

## Projektstruktur

### Standardmapp-layout

Använd alltid denna struktur för nya R-projekt:

```
projekt-namn/
├── projekt-namn.Rproj     # RStudio-projektfil
├── README.md              # Vad projektet handlar om
├── .gitignore            # Vad Git ska ignorera
│
├── R/                    # Alla R-skript och funktioner
│   ├── 01_load_data.R    # Steg 1: Ladda data
│   ├── 02_clean_data.R   # Steg 2: Städa och förbered
│   ├── 03_analysis.R     # Steg 3: Analys
│   ├── 04_visualize.R    # Steg 4: Visualisering
│   │
│   ├── functions/        # Återanvändbara funktioner
│   │   ├── data_utils.R
│   │   ├── plot_utils.R
│   │   └── gis_utils.R
│   │
│   └── config/           # Konfiguration
│       ├── colors.R      # Färgpaletter
│       └── settings.R    # Inställningar
│
├── data/                 # Data (läggs INTE i Git om känslig)
│   ├── raw/             # Original (ändras ALDRIG)
│   └── processed/       # Bearbetad (.rds-filer)
│
├── output/              # Outputs (genereras av kod)
│   ├── figures/         # Grafer och kartor
│   ├── tables/          # Tabeller
│   └── reports/         # HTML/PDF-rapporter
│
└── docs/                # Dokumentation
    └── notes.md         # Anteckningar och logg
```

### Varför denna struktur?

**Numrerade skript (01_, 02_, etc.)**
- Tydlig ordning – man ser i vilken sekvens koden ska köras
- Lätt hitta rätt fil
- Underlättar onboarding av nya teammedlemmar

**Separera funktioner från skript**
- Skript = vad du gör i detta specifika projektet
- Funktioner = återanvändbara byggstenar
- Gör det lätt att hitta och testa funktioner separat

**data/raw/ ändras ALDRIG**
- Originaldata är helig – spara den orörd
- All bearbetning sker i skript och sparas i data/processed/
- Kan alltid återskapa processed från raw

---

## Kodningsprinciper

### Namngivning

**Funktioner: verb_substantiv**
```r
# ✅ Bra
load_scb_data()
calculate_density()
create_map()

# ❌ Dåligt
data()
density()
map()
```

**Variabler: substantiv_beskrivning**
```r
# ✅ Bra
population_total
area_sqkm
goteborg_map
schools_primary

# ❌ Dåligt
pop
a
data
df
x
```

**Konstanter: VERSALER med understreck**
```r
# ✅ Bra
GOTEBORG_BLUE <- "#0076bc"
DEFAULT_CRS <- 3006
MAX_ITERATIONS <- 100

# ❌ Dåligt
blue <- "#0076bc"
crs <- 3006
```

### Formatering och stil

**Indentering: 2 mellanslag**
```r
# ✅ Bra
if (x > 10) {
  print("Stort värde")
  y <- x * 2
}

# ❌ Dåligt (4 mellanslag eller tab)
if (x > 10) {
    print("Stort värde")
    y <- x * 2
}
```

**Radlängd: max 80 tecken**
```r
# ✅ Bra
very_long_variable_name <- some_function(
  argument1 = value1,
  argument2 = value2,
  argument3 = value3
)

# ❌ Dåligt
very_long_variable_name <- some_function(argument1 = value1, argument2 = value2, argument3 = value3)
```

**Mellanslag runt operatorer**
```r
# ✅ Bra
x <- 5 + 3
y <- x * 2

# ❌ Dåligt
x<-5+3
y<-x*2
```

**Använd `<-` för tilldelning, inte `=`**
```r
# ✅ Bra
x <- 10

# ❌ Dåligt
x = 10
```

### Kommentering

**Kommentera VARFÖR, inte VAD**

```r
# ❌ Dålig kommentar (säger vad koden gör)
# Lägger till 1 till x
x <- x + 1

# ✅ Bra kommentar (säger varför)
# Indexera från 1 istället för 0 för användarens skull
x <- x + 1
```

**Strukturera med sektioner**

```r
# 1. DATA PREPARATION ----
# Ladda och förbered data

# 2. ANALYSIS ----
# Kör huvudanalysen

# 3. VISUALIZATION ----
# Skapa grafer och kartor

# 4. EXPORT ----
# Spara resultat
```

**Använd roxygen för funktioner**

```r
#' Beräkna befolkningstäthet
#'
#' @param sf_object Ett sf-objekt med befolkningsdata
#' @param pop_column Namn på kolumnen med befolkning
#' @return sf-objekt med ny kolumn 'density'
#' @examples
#' calculate_density(goteborg_map, "population")
calculate_density <- function(sf_object, pop_column) {
  # Implementation...
}
```

---

## Tidyverse-first approach

### Varför Tidyverse?

**Mer läsbart**
```r
# ❌ Base R (svårläst)
round(mean(subset(na.omit(data), 
  species == "Adelie")$bill_length), 2)

# ✅ Tidyverse (lättläst)
data |>
  filter(!is.na(bill_length), species == "Adelie") |>
  summarise(mean_bill = mean(bill_length)) |>
  pull(mean_bill) |>
  round(2)
```

**Konsekvent syntax**
- Första argumentet är alltid data
- Funktioner gör EN sak väl
- Fungerar väl med pipe-operatorn

### Viktiga Tidyverse-paket

**{dplyr} – datamanipulation**
```r
library(dplyr)

data |>
  filter(year == 2024) |>           # Filtrera rader
  select(name, population) |>       # Välj kolumner
  mutate(pop_thousands = population / 1000) |>  # Skapa ny kolumn
  arrange(desc(population))         # Sortera
```

**{tidyr} – omstrukturera data**
```r
library(tidyr)

# Wide → Long
data_long <- data |>
  pivot_longer(
    cols = starts_with("year_"),
    names_to = "year",
    values_to = "value"
  )

# Long → Wide
data_wide <- data_long |>
  pivot_wider(
    names_from = year,
    values_from = value
  )
```

**{ggplot2} – visualisering**
```r
library(ggplot2)

ggplot(data, aes(x = year, y = population)) +
  geom_line() +
  labs(
    title = "Befolkningsutveckling",
    x = "År",
    y = "Befolkning"
  ) +
  theme_minimal()
```

**{readr} – läsa data**
```r
library(readr)

# CSV med rätt kodning för svenska tecken
data <- read_csv2("data/raw/befolkning.csv")

# Spara bearbetad data
write_rds(data_clean, "data/processed/befolkning_clean.rds")
```

**{stringr} – texthantering**
```r
library(stringr)

# Allt i versaler
str_to_upper("göteborg")  # "GÖTEBORG"

# Byt ut text
str_replace(text, "ä", "a")

# Extrahera med regex
str_extract(text, "\\d{4}")  # Hitta 4 siffror
```

**{lubridate} – datum**
```r
library(lubridate)

# Skapa datum
date <- ymd("2024-01-15")

# Extrahera delar
year(date)   # 2024
month(date)  # 1
wday(date, label = TRUE)  # "mån"
```

### Pipe-operator: |> (eller %>%)

**Välj native pipe `|>` för nya projekt**

```r
# Modern R (4.1+) – använd detta
data |>
  filter(year == 2024) |>
  summarise(mean_pop = mean(population))

# Äldre tidyverse – fungerar också
data %>%
  filter(year == 2024) %>%
  summarise(mean_pop = mean(population))
```

**När använda pipe?**

```r
# ✅ Bra – flera steg, lättläst
result <- data |>
  filter(city == "Göteborg") |>
  group_by(district) |>
  summarise(total_pop = sum(population)) |>
  arrange(desc(total_pop))

# ❌ Dåligt – för enkelt för pipe
result <- data |> filter(city == "Göteborg")  

# Bättre
result <- filter(data, city == "Göteborg")
```

---

## Funktioner

### När ska du skapa en funktion?

**Tumregeln: Om du kopierar kod 3 gånger → skapa funktion**

```r
# ❌ Upprepad kod
mean_adelie <- mean(filter(data, species == "Adelie")$bill_length)
mean_chinstrap <- mean(filter(data, species == "Chinstrap")$bill_length)
mean_gentoo <- mean(filter(data, species == "Gentoo")$bill_length)

# ✅ Funktion
calculate_mean_bill <- function(data, species_name) {
  data |>
    filter(species == species_name) |>
    summarise(mean_bill = mean(bill_length, na.rm = TRUE)) |>
    pull(mean_bill)
}

mean_adelie <- calculate_mean_bill(data, "Adelie")
mean_chinstrap <- calculate_mean_bill(data, "Chinstrap")
mean_gentoo <- calculate_mean_bill(data, "Gentoo")
```

### Anatomi av en bra funktion

```r
#' Kortfattad beskrivning av vad funktionen gör
#'
#' Längre beskrivning om nödvändigt.
#'
#' @param data En data frame med penguin-data
#' @param species_name Namnet på pingvinarten (string)
#' @param na_remove Ska NA-värden tas bort? (logical)
#' @return Ett numeriskt värde med medelvärdet
#' @examples
#' calculate_mean_bill(penguins, "Adelie")
#' calculate_mean_bill(penguins, "Gentoo", na_remove = FALSE)
calculate_mean_bill <- function(data, species_name, na_remove = TRUE) {
  
  # 1. Validera input
  if (!is.data.frame(data)) {
    stop("'data' måste vara en data frame")
  }
  
  if (!"species" %in% names(data)) {
    stop("Kolumnen 'species' saknas i data")
  }
  
  # 2. Gör beräkningen
  result <- data |>
    filter(species == species_name) |>
    summarise(mean_bill = mean(bill_length, na.rm = na_remove)) |>
    pull(mean_bill)
  
  # 3. Returnera
  return(result)
}
```

### Funktionsprinciper

**1. En funktion = en uppgift**
```r
# ✅ Bra – gör EN sak
calculate_mean()
create_plot()
save_results()

# ❌ Dåligt – gör för mycket
calculate_mean_and_create_plot_and_save()
```

**2. Tydliga namn**
```r
# ✅ Bra – verb + substantiv
calculate_density()
load_scb_data()
format_percentage()

# ❌ Dåligt
calc()
do_stuff()
helper()
```

**3. Smarta defaults**
```r
# ✅ Bra – vanligaste användningen är enkel
create_map(data, "population")  # Använder defaults

# Men flexibel vid behov
create_map(
  data, 
  "population",
  palette = "sequential",
  n_classes = 7,
  method = "quantile"
)
```

**4. Validera input**
```r
calculate_density <- function(sf_object, pop_column) {
  # Kolla typ
  if (!inherits(sf_object, "sf")) {
    stop("Input måste vara ett sf-objekt")
  }
  
  # Kolla att kolumn finns
  if (!pop_column %in% names(sf_object)) {
    stop(glue::glue("Kolumnen '{pop_column}' finns inte i data"))
  }
  
  # Fortsätt med beräkning...
}
```

---

## Reproducerbarhet

### Principer för reproducerbar kod

**1. Använd aldrig `setwd()`**

```r
# ❌ Fungerar bara på din dator
setwd("C:/Users/anna/Documents/projekt")

# ✅ Använd RStudio-projekt (.Rproj)
# Working directory sätts automatiskt till projektets rot
```

**2. Använd relativa sökvägar**

```r
# ❌ Absolut sökväg
data <- read_csv("C:/Users/anna/Documents/projekt/data/raw/befolkning.csv")

# ✅ Relativ sökväg från projektets rot
data <- read_csv("data/raw/befolkning.csv")

# ✅ Ännu bättre – använd here-paketet
library(here)
data <- read_csv(here("data", "raw", "befolkning.csv"))
```

**3. Dokumentera paketversioner**

```r
# I början av ditt main-skript
# Skriv ut sessionInfo för reproducerbarhet
sessionInfo()

# Eller använd renv för pakethantering
renv::init()      # Vid projektstart
renv::snapshot()  # Spara paketversioner
renv::restore()   # Återställ paketversioner
```

**4. Ladda alla paket i början**

```r
# ✅ Bra – alla bibliotek i början
library(tidyverse)
library(sf)
library(here)

# Resten av koden...

# ❌ Dåligt – paket laddas mitt i koden
data <- read_csv("data.csv")
library(dplyr)  # För sent!
```

**5. Skriv inte ut till console – spara till filer**

```r
# ❌ Dåligt
print(summary_table)  # Går inte att återskapa

# ✅ Bra
write_csv(summary_table, "output/tables/summary.csv")
ggsave("output/figures/befolkning.png", plot)
```

### Quarto för reproducerbara rapporter

**Varför Quarto?**
- Kombinerar kod, resultat och text i ett dokument
- Uppdaterar automatiskt när data ändras
- Exporterar till HTML, PDF, Word, PowerPoint

**Grundstruktur i .qmd-fil:**

````markdown
---
title: "Befolkningsanalys Göteborg"
author: "Ditt namn"
date: today
format: 
  html:
    toc: true
    code-fold: true
    theme: cosmo
execute:
  echo: false
  warning: false
---

## Inledning

Detta dokument analyserar befolkningsutvecklingen i Göteborg.

```{r}
#| label: setup
library(tidyverse)
library(here)

data <- read_csv(here("data", "processed", "befolkning.csv"))
```

## Resultat

Befolkningen i Göteborg var `{r} nrow(data)` invånare år 2024.

```{r}
#| label: fig-trend
#| fig-cap: "Befolkningsutveckling över tid"

ggplot(data, aes(x = year, y = population)) +
  geom_line() +
  theme_minimal()
```
````

---

## Debugging och felsökning

### Verktyg för felsökning

**1. print() och cat()**

```r
# Snabb check av värden
my_function <- function(x) {
  print(paste("Input:", x))  # Vad kommer in?
  result <- x * 2
  print(paste("Output:", result))  # Vad kommer ut?
  return(result)
}
```

**2. browser() – stoppa och inspektera**

```r
my_function <- function(x, y) {
  browser()  # Kod stannar här – du kan inspektera variabler
  result <- x + y
  return(result)
}
```

**3. debug() – stega igenom funktion**

```r
# Sätt debug-läge på en funktion
debug(my_function)

# Kör funktionen – den stannar vid första raden
my_function(10, 5)

# Stega med 'n', fortsätt med 'c', avsluta med 'Q'
# Stäng av debug-läge
undebug(my_function)
```

**4. traceback() – var gick det fel?**

```r
# Efter ett error, kör:
traceback()
# Visar anropskedjan – var började felet?
```

### Strategier för felsökning

**Start enkelt, bygg komplexitet**

```r
# ❌ Komplex pipe – var är felet?
result <- data |>
  filter(!is.na(value)) |>
  group_by(category) |>
  summarise(mean_val = mean(value)) |>
  mutate(scaled = scale(mean_val)) |>
  arrange(desc(scaled))

# ✅ Testa steg för steg
step1 <- data |> filter(!is.na(value))
step2 <- step1 |> group_by(category)
step3 <- step2 |> summarise(mean_val = mean(value))
# Nu ser du var det går snett!
```

**Isolera problemet**

```r
# Skapa minimal reproducerbar exempel
library(tidyverse)

# Minimal data som orsakar problemet
test_data <- tibble(
  x = c(1, 2, NA, 4),
  y = c("A", "B", "A", "C")
)

# Testa bara den problematiska operationen
test_data |> 
  group_by(y) |> 
  summarise(mean_x = mean(x))  # Vad händer med NA?
```

---

## Vanliga misstag att undvika

### 1. Hårdkodade värden

```r
# ❌ Dåligt – värden i koden
data |> filter(year == 2024)
ggplot(data, aes(x, y)) + geom_point(color = "#0076bc")

# ✅ Bra – värden i config
source("R/config/settings.R")  # ANALYSIS_YEAR <- 2024
source("R/config/colors.R")    # GOTEBORG_BLUE <- "#0076bc"

data |> filter(year == ANALYSIS_YEAR)
ggplot(data, aes(x, y)) + geom_point(color = GOTEBORG_BLUE)
```

### 2. Göra för mycket på en gång

```r
# ❌ Dåligt – svårt felsöka
result <- read_csv("data.csv") |>
  filter(!is.na(value) & value > 0 & year >= 2020) |>
  group_by(category, year) |>
  summarise(
    mean = mean(value),
    sd = sd(value),
    n = n()
  ) |>
  mutate(
    cv = sd / mean,
    weight = n / sum(n)
  ) |>
  filter(cv < 0.5) |>
  arrange(desc(mean))

# ✅ Bra – dela upp i logiska steg
raw_data <- read_csv("data.csv")

clean_data <- raw_data |>
  filter(!is.na(value), value > 0, year >= 2020)

summary_stats <- clean_data |>
  group_by(category, year) |>
  summarise(
    mean = mean(value),
    sd = sd(value),
    n = n(),
    .groups = "drop"
  )

final_result <- summary_stats |>
  mutate(
    cv = sd / mean,
    weight = n / sum(n)
  ) |>
  filter(cv < 0.5) |>
  arrange(desc(mean))
```

### 3. Inte testa funktioner

```r
# ❌ Dåligt – ingen testning
calculate_density <- function(sf_object, pop_column) {
  sf_object |>
    mutate(
      area_km2 = as.numeric(st_area(geometry) / 1e6),
      density = .data[[pop_column]] / area_km2
    )
}

# ✅ Bra – testa med enkla exempel
# Skapa test i functions/-mappen eller separat test/-mapp

# Test 1: Fungerar med korrekt input?
test_sf <- tibble(
  name = "Test",
  population = 1000,
  geometry = st_sfc(st_point(c(0, 0)))
) |> st_as_sf()

test_result <- calculate_density(test_sf, "population")
stopifnot("density" %in% names(test_result))

# Test 2: Ger error vid fel input?
testthat::expect_error(
  calculate_density(data.frame(x = 1), "population")
)
```

### 4. Glömma paketnamnrymder

```r
# ❌ Kan orsaka konflikter
library(dplyr)
library(MASS)  # Har också select()

data |> select(name, value)  # Vilken select() används?

# ✅ Var explicit
data |> dplyr::select(name, value)

# ✅ Eller ladda paket i rätt ordning
library(MASS)
library(dplyr)  # dplyr::select() används nu
```

### 5. Inte hantera NA-värden

```r
# ❌ Glömmer NA – får NA som resultat
mean(c(1, 2, NA, 4))  # NA

# ✅ Hantera explicit
mean(c(1, 2, NA, 4), na.rm = TRUE)  # 2.33
```

### 6. För många färger i en graf

```r
# ❌ 15 kategorier – oläsligt
ggplot(data, aes(x = year, y = value, color = category)) +
  geom_line()

# ✅ Gruppera mindre kategorier
data_grouped <- data |>
  mutate(
    category_grouped = if_else(
      value < threshold,
      "Övrigt",
      category
    )
  )

ggplot(data_grouped, aes(x = year, y = value, color = category_grouped)) +
  geom_line()
```

---

## Integration med andra standarder

Detta dokument samverkar med andra Göteborgs Stads standarder:

**Designprinciper för visualisering**
- Följ färgpaletter och visualiseringsprinciper när du skapar grafer med ggplot2
- Använd max 7 kategorier i diagram
- Följ tillgänglighetskrav (kontrast, alt-text)
- Se: `designprinciper_visualisering_Göteborg.md`

**GitHub-projektstruktur**
- Projektmapparna matchar GitHub-strukturen
- README.md, .gitignore och LICENSE ska finnas i alla projekt
- Se: `github_projektstruktur_R_Göteborg.md`

**gothenburg_colors**
- Använd detta R-paket för alla färger i visualiseringar
- `source("colors_gothenburg.R")` och `source("ggplot_scales_gothenburg.R")`
- Repository: https://github.com/globalfunlearning/gothenburg_colors

---

## Sammanfattning: Checklista för bra R-kod

**Innan du börjar koda:**
- [ ] Skapa RStudio-projekt (.Rproj)
- [ ] Skapa mappstruktur (R/, data/, output/)
- [ ] Skriv README.md med projektbeskrivning

**När du kodar:**
- [ ] Använd Tidyverse för datamanipulation
- [ ] Använd `|>` (pipe) för flerstegsoperationer
- [ ] Kommentera VARFÖR, inte VAD
- [ ] Skapa funktion om du upprepar kod 3+ gånger
- [ ] Ge variabler och funktioner beskrivande namn
- [ ] Ladda alla paket i början av skriptet

**Innan du delar kod:**
- [ ] Kör hela skriptet från början i nytt R-session
- [ ] Kontrollera att relativa sökvägar används
- [ ] Testa att funktioner fungerar med olika input
- [ ] Skriv kommentarer för framtida dig
- [ ] Exportera resultat till filer (inte bara print)

**För reproducerbarhet:**
- [ ] Använd Quarto för rapporter
- [ ] Dokumentera paketversioner (sessionInfo eller renv)
- [ ] Använd `here::here()` för filsökvägar
- [ ] Skriv tydlig dokumentation av analys-stegen

---

## Resurser och vidareutbildning

**Böcker och guider:**
- [R for Data Science (2e)](https://r4ds.hadley.nz/) – den kompletta guiden
- [Productive R Workflow](https://www.productive-r-workflow.com/) – arbetssätt och best practices
- [Advanced R](https://adv-r.hadley.nz/) – djupdykning i R-programmering
- [Tidyverse Style Guide](https://style.tidyverse.org/) – kodstil och konventioner

**Paket-dokumentation:**
- [Tidyverse](https://www.tidyverse.org/)
- [sf (geografisk data)](https://r-spatial.github.io/sf/)
- [Quarto](https://quarto.org/)

**Verktyg:**
- [RStudio IDE](https://posit.co/products/open-source/rstudio/)
- [GitHub Desktop](https://desktop.github.com/)
- [lintr](https://lintr.r-lib.org/) – kodkvalitetskontroll

---

*Senast uppdaterad: 2025-11-22*

*Detta dokument utvecklas kontinuerligt baserat på praktiska erfarenheter från Göteborgs Stads dataprojekt.*