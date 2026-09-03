# Hämtar månadsvis BAS-statistik från SCB:s PxWebApi.
# Tabellen: ArbStatusM, preliminär statistik.

required_packages <- c("pxweb", "tidyverse", "fs")
missing_packages <- required_packages[!vapply(required_packages, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing_packages) > 0) {
  stop("Installera först följande R-paket: ", paste(missing_packages, collapse = ", "))
}

library(pxweb)
library(tidyverse)
library(fs)

# --- Parametrar ---
table_url <- paste0(
  "https://api.scb.se/OV0104/v1/doris/sv/ssd/START/AM/AM0210/",
  "AM0210A/ArbStatusM"
)

# Visningsnamn som löses mot SCB:s koder via metadata längre ned.
region_labels <- c("Riket", "Stockholms län", "Uppsala län", "Södermanlands län",
                   "Östergötlands län", "Jönköpings län", "Kronobergs län",
                   "Kalmar län", "Gotlands län", "Blekinge län", "Skåne län",
                   "Hallands län", "Västra Götalands län", "Värmlands län",
                   "Örebro län", "Västmanlands län", "Dalarnas län", "Gävleborgs län",
                   "Västernorrlands län", "Jämtlands län", "Västerbottens län",
                   "Norrbottens län", "Stockholm", "Göteborg", "Malmö")

contents <- c(
  "antal sysselsatta",
  "antal arbetslösa",
  "antal sysselsatta och arbetslösa (arbetskraften)",
  "antal studerande",
  "antal pensionärer",
  "antal sjuka",
  "antal övriga",
  "antal totalt",
  "arbetslöshet",
  "arbetskraftsdeltagande",
  "sysselsättningsgrad"
)

# --- Metadata och kodöversättning ---
metadata <- pxweb_get(table_url)

normalise <- function(x) {
  x |>
    stringr::str_replace_all("–", "-") |>
    stringr::str_squish() |>
    stringr::str_to_lower()
}

get_codes <- function(meta, variable_code, labels) {
  variable <- meta$variables[[which(vapply(meta$variables, function(x) x$code, character(1)) == variable_code)]]
  wanted <- normalise(labels)
  available <- normalise(variable$valueTexts)
  match_index <- match(wanted, available)
  if (anyNA(match_index)) {
    stop("Kunde inte hitta följande värden i SCB-metadata för ", variable_code, ": ",
         paste(labels[is.na(match_index)], collapse = ", "))
  }
  variable$values[match_index]
}

region_codes <- get_codes(metadata, "Region", region_labels)
sex_variable <- metadata$variables[[which(vapply(metadata$variables, function(x) x$code, character(1)) == "Kon")]]
sex_codes <- sex_variable$values
age_code <- get_codes(metadata, "Alder", "20-64 år")
birth_region_codes <- get_codes(metadata, "Fodelseregion", c("Totalt", "Inrikes född", "Utrikes född"))
content_codes <- get_codes(metadata, "ContentsCode", contents)

# Använd alla tillgängliga månader från och med januari 2020. Då behöver
# skriptet inte ändras när SCB publicerar en ny månad.
time_variable <- metadata$variables[[which(vapply(
  metadata$variables,
  function(x) x$code,
  character(1)
) == "Tid")]]
months <- time_variable$values[time_variable$values >= "2020M01"]
if (length(months) == 0) {
  stop("SCB-metadata innehåller inga månader från och med 2020M01.")
}
dir_create("data/raw")
writeLines(capture.output(metadata), "data/raw/scb_metadata.txt")

# --- Hämta data ---
px_data <- pxweb_get(
  url = table_url,
  query = list(
    Region = region_codes,
    Kon = sex_codes,
    Alder = age_code,
    Fodelseregion = birth_region_codes,
    ContentsCode = content_codes,
    Tid = months
  )
)

raw_df <- as.data.frame(
  px_data,
  column.name.type = "text",
  variable.value.type = "text"
) |>
  as_tibble()

write_csv(raw_df, "data/raw/arbetsmarknad_status.csv")

cat("Antal rader:", nrow(raw_df), "\n")
cat("Månader: ", paste(range(months), collapse = " – "), "\n")
cat("Geografier:", length(region_codes), "\n")
cat("Kön:", paste(sex_variable$valueTexts, collapse = ", "), "\n")
