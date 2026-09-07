# Förbereder SCB-data för webbappen och skriver JSON.

required_packages <- c("tidyverse", "jsonlite", "fs")
missing_packages <- required_packages[!vapply(required_packages, requireNamespace, logical(1), quietly = TRUE)]
if (length(missing_packages) > 0) {
  stop("Installera först följande R-paket: ", paste(missing_packages, collapse = ", "))
}

library(tidyverse)
library(jsonlite)
library(fs)

input_path <- "data/raw/arbetsmarknad_status.csv"
output_path <- "data/processed/arbetsmarknad.json"
web_output_path <- "web/data/arbetsmarknad.json"
branch_input_path <- "data/raw/sysselsatta_bransch.csv"
branch_output_path <- "data/processed/branscher.json"
branch_web_output_path <- "web/data/branscher.json"

if (!file_exists(input_path)) {
  stop("Hittar inte ", input_path, ". Kör R/hamta_scb_data.R först.")
}
if (!file_exists(branch_input_path)) {
  stop("Hittar inte ", branch_input_path, ". Kör R/hamta_scb_data.R först.")
}

raw <- read_csv(input_path, show_col_types = FALSE)
branch_raw <- read_csv(branch_input_path, show_col_types = FALSE)


# Bevara SCB:s publicerade värden och dimensioner utan summering eller omräkning.
processed <- raw |>
  rename_with(~ str_to_lower(.x))

dir_create(path_dir(output_path))
write_json(processed, output_path, pretty = TRUE, auto_unbox = TRUE, na = "null")
dir_create(path_dir(web_output_path))
write_json(processed, web_output_path, pretty = TRUE, auto_unbox = TRUE, na = "null")

processed_branches <- branch_raw |>
  rename_with(~ str_to_lower(.x)) |>
  rename(
    bransch = `näringsgren sni 2007`,
    antal = `sysselsatta efter arbetsställets belägenhet`
  ) |>
  select(region, branschkod, bransch, månad, antal)

write_json(processed_branches, branch_output_path, pretty = TRUE, auto_unbox = TRUE, na = "null")
write_json(processed_branches, branch_web_output_path, pretty = TRUE, auto_unbox = TRUE, na = "null")

# Metadata används av webbappens sidhuvud och uppdateras tillsammans med datan.
today <- Sys.Date()
current_month <- as.Date(format(today, "%Y-%m-01"))
scheduled_this_month <- current_month + 4
next_update <- if (scheduled_this_month > today) {
  scheduled_this_month
} else {
  seq(current_month, by = "month", length.out = 2)[2] + 4
}
metadata <- list(
  last_updated = format(today, "%Y%m%d"),
  next_update = format(next_update, "%Y%m%d")
)
write_json(metadata, "web/data/metadata.json", pretty = TRUE, auto_unbox = TRUE)

cat("Skrev:", output_path, "\n")
cat("Skrev:", web_output_path, "\n")
cat("Skrev:", branch_output_path, "\n")
cat("Skrev:", branch_web_output_path, "\n")
cat("Senast uppdaterad:", metadata$last_updated, "\n")
cat("Nästa uppdatering:", metadata$next_update, "\n")
cat("Antal rader:", nrow(processed), "\n")
