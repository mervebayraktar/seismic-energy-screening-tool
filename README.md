# Seismic-Energy Retrofit Prioritization Toolkit

This repository provides an anonymized open dataset and a browser-based screening tool for prioritizing buildings at the intersection of seismic risk and energy retrofit potential. It is designed for practical portfolio-level decision support, allowing users to work with categorical screening inputs, reproduce the two-stage `BS` and `EES` workflow, and generate transparent prioritization outputs without exposing building identities, coordinates, or raw site-specific hazard values.

The repository supports a decision-support framing rather than a predictive machine-learning framing. Its purpose is to share the screening structure, the anonymized public application dataset, and the reproducible ranking workflow used to evaluate which buildings should be prioritized for follow-up action under combined seismic and energy-efficiency considerations.

## Scope

The repository is designed for open sharing of the screening workflow inputs and outputs without exposing building names, coordinates, or raw site-specific numeric hazard values.

The package includes:

- an anonymized public spreadsheet with categorical BS and EES inputs
- a browser-based tool for manual entry, spreadsheet import, scoring, and prioritization
- summary files that support portfolio-level reporting and visualizations
- a small utility script used to prepare the public repository assets

## Main Concepts

- `BS` = Building Score
- `EES` = Energy Efficiency Score
- prioritization rule = yellow first, then orange; within each group lower EES first; if tied, higher BS first

## Public Dataset

The public dataset currently includes 99 records.

Excluded identifying or sensitive fields:

- building name
- province and district at record level
- coordinates
- raw `SDS-DD1`
- raw `Vs30`
- other directly identifying fields

Included fields are limited to the categorical inputs required by the BS and EES workflows, together with computed `BS`, `BS Risk Level`, `EES`, and `Prioritization`.

## Repository Structure

```text
app/
  index.html
  app.js
  config.js

data/
  building_screening_inputs_public.xlsx
  public_summary.json
  bs_risk_distribution.csv
  eligibility_distribution.csv
  province_distribution.csv
  building_type_distribution.csv

scripts/
  build_public_repository_assets.py
```

## How To Use

### 1. Inspect the public data

Open `data/building_screening_inputs_public.xlsx` to review the anonymized building-level input categories and calculated outputs.

### 2. Run the browser tool

Open `app/index.html` in a browser.

The tool can:

- accept manual record entry
- import `.xlsx`, `.xls`, and `.csv` files
- compute BS first and EES second
- store records locally in the browser
- recompute prioritization automatically
- report portfolio statistics for all loaded parameters

### 3. Rebuild public assets

If the source workbook changes, update the preparation script and rerun `scripts/build_public_repository_assets.py` in a local Python environment.

## Notes For Publication

- keep the public workbook anonymized
- do not upload the private workbook
- do not add coordinates or school names back into the open dataset
- if needed, keep aggregate maps and typology charts in the paper or figures rather than record-level public data
