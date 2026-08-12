# Seismic-Energy Screening Tool

This repository shares two complementary components of an open building-screening framework:

1. an anonymized public example dataset
2. a browser-based tool that applies the BS-EES workflow

The repository is intended as an open and reproducible example of a decision-support workflow. The dataset and the tool are related, but they serve different purposes. The dataset provides an anonymized example application of the framework. The tool provides an operational implementation of the workflow.

## Repository Structure

- `app/`: browser-based screening and prioritization tool
- `data/`: anonymized public example dataset
- `PARAMETER_GUIDE.md`: detailed explanation of BS and EES input parameters

## Framework Logic

The workflow follows a two-stage structure:

1. `BS` (Building Score)
2. `EES` (Energy Efficiency Score)

## Prioritization Logic

Buildings classified as `red` are considered to have high seismic risk and are not assigned an `EES`-based prioritization order.

Among the remaining buildings, `yellow` buildings are prioritized before `orange` buildings.

Within each BS risk group, buildings are prioritized from the worst `EES` value to the best `EES` value.

If two buildings belong to the same BS risk group and have the same `EES` value, the building with the higher `BS` value is prioritized first.

## Public Dataset

**Dataset file:** [building_screening_inputs_public.xlsx](data/building_screening_inputs_public.xlsx)

The public dataset is an anonymized example application of the framework.

It is shared to:

- demonstrate how the workflow can be applied on real building records
- support transparency and reproducibility
- provide an example dataset for researchers or practitioners who may wish to adapt or extend the method

The public dataset does not provide record-level identifying information such as building names or coordinates.

## Tool

**Live tool:** [https://mervebayraktar.github.io/seismic-energy-screening-tool/](https://mervebayraktar.github.io/seismic-energy-screening-tool/)

The browser-based tool is provided as an operational implementation of the workflow.

It can be used to:

- enter building records manually
- import spreadsheet files
- calculate BS and EES
- generate prioritization outputs
- inspect portfolio-level summaries and parameter distributions

## Parameters Used in the Framework

Detailed parameter explanations are provided in [PARAMETER_GUIDE.md](PARAMETER_GUIDE.md).

### BS inputs

The BS stage uses the following input parameters:

- soil class
- SDS band
- structural system
- year of the building project
- number of storeys
- vertical irregularity
- plan irregularity
- heavy overhang
- building layout type
- site slope
- floor diaphragm effect
- short columns
- weak storey

### EES inputs

The EES stage uses the following input parameters:

- roof suitability for solar panels
- roof shading condition
- roof insulation
- suspended ceiling bracing system
- MEP system in suspended ceiling
- ventilation or cooling system type
- ventilation age or efficiency
- facade cladding dead load and collapse risk
- facade insulation
- facade cracks
- primary heating fuel
- heating system typology
- boiler age or efficiency
- partition wall insulation need

## Intended Use

This repository is shared to support:

- transparent presentation of the framework
- open demonstration of an anonymized application dataset
- reuse and adaptation of the workflow by other researchers and practitioners

## Citation and Reuse

If you use this repository, its dataset, or its workflow in research, reporting, or derivative applications, please cite the related study and acknowledge the repository as the source of the open implementation and example dataset.
