# Parameter Guide

This guide documents the screening inputs used in the two-stage BS-EES workflow.

## BS Parameters

### Soil class
Definition: Local soil class used in seismic screening, generally expressed as ZA, ZB, ZC, ZD, or ZE.

How to determine it: Use official geotechnical or municipal records when available. If those are unavailable, determine the class from Vs30-based sources and the site-class limits in TBDY 2018 Table 16.1.

Suggested sources:
- AFAD / official earthquake resources
- municipality or other authorized public institutions
- Vs30 map sources used with engineering judgement

### SDS band
Definition: Short-period design spectral acceleration category used in the BS stage.

How to determine it: Obtain the SDS value from the official Turkiye Earthquake Hazard Maps Interactive Web Application and assign the building to the correct categorical SDS interval used in the framework.

Suggested source:
- https://tdth.afad.gov.tr/TDTH/main.xhtml

### Structural system
Definition: Primary seismic force-resisting system of the building.

How to determine it: Use structural drawings, project documentation, or verified inventory records.

Categories used in the framework:
- Reinforced Concrete Frame
- Reinforced Concrete Frame + Shear Wall

### Year of the building project
Definition: Construction-era band used to reflect the regulatory period.

How to determine it: Use project approval year, permit records, occupancy records, or archived institutional documentation.

Categories used in the framework:
- after 2018
- 2007 - 2018
- 2000 - 2007
- before 2000

### Number of storeys
Definition: Number of above-ground storeys used in the BS calculation.

How to determine it: Use project records and confirm through available inventory or site information.

### Vertical irregularity
Definition: Presence of vertical discontinuity, setback, stiffness change, or comparable vertical irregularity relevant to seismic behavior.

How to determine it: Review structural drawings, elevations, and screening observations.

### Plan irregularity
Definition: Presence of plan-level irregularity relevant to the framework.

How to determine it: Use plan drawings, existing screening records, or rapid structural review.

### Heavy overhang
Definition: Presence of overhang or projection effects that may negatively influence the seismic screening result.

How to determine it: Use facade review, project drawings, or screening observations.

### Building layout type
Definition: Whether the building is detached or adjacent.

How to determine it: Use site layout, parcel information, imagery, or recorded inventory.

Categories used in the framework:
- Detached
- Adjacent

### Site slope
Definition: General topographic setting of the building site.

How to determine it: Use site observations, photographs, topographic information, or prior screening notes.

Categories used in the framework:
- Flat
- Inclined

### Floor diaphragm effect
Definition: Whether floor diaphragm behavior is considered regular or problematic in the screening framework.

How to determine it: Use structural drawings or prior engineering review.

Categories used in the framework:
- Similar
- Different

### Short columns
Definition: Presence of short-column behavior risk.

How to determine it: Review facade configuration, infill arrangement, and structural or screening notes.

### Weak storey
Definition: Presence of weak-storey behavior within the building.

How to determine it: Use prior screening outputs, structural review, or site observations.

## EES Parameters

### Roof suitable for solar panels
Definition: Roof configuration in relation to photovoltaic suitability.

Typical categories:
- Flat
- Pitched
- Truss

### Roof shading condition
Definition: Degree of shading affecting roof solar use.

Typical categories:
- No shading
- Partial
- Heavy

### Roof insulation TS 825
Definition: Whether roof insulation consistent with TS 825 is present.

### Suspended ceiling bracing system
Definition: Whether a suspended ceiling bracing system is present where relevant.

### MEP system in suspended ceiling
Definition: Whether MEP systems are located in the suspended ceiling zone.

### Ventilation or cooling system type
Definition: Mechanical ventilation or cooling system category used in the EES stage.

Typical categories:
- No cooling
- Split
- Chiller

### Ventilation age or efficiency
Definition: Relative age or efficiency condition of the ventilation system.

Typical categories:
- New
- Old

### Facade cladding dead load and collapse risk
Definition: Facade cladding category reflecting dead-load and collapse implications.

### Facade insulation TS 825
Definition: Whether facade insulation consistent with TS 825 is present.

### Facade cracks
Definition: Whether cracks relevant to the screening are present on the facade.

### Primary heating fuel
Definition: Main fuel used by the heating system.

Typical categories:
- Natural gas
- solid fuel/coal
- fuel oil
- electric

### Heating system typology
Definition: General heating system category.

Typical categories:
- boiler
- combi
- electric/stove

### Boiler age or efficiency
Definition: Relative age and efficiency condition of the boiler.

Typical categories:
- New
- Old

### Partition wall insulation need
Definition: Whether partition-wall insulation is considered necessary under the framework.

## Note

The detailed category definitions and wording in the browser tool should stay consistent with the public dataset and the scoring workflow used in the study.
