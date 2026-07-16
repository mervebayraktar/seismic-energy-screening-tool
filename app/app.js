(function () {
  const STORAGE_KEY = "bs-ees-portfolio-records-v1";

  const BS_FIELDS = [
    {
      key: "building_label",
      label: "Building Name",
      type: "text",
      required: true,
      stage: "meta",
      guide: {
        definition: "Name used to identify the building record in this tool.",
        method: "Enter the building's common/working name (e.g. school or facility name).",
      },
    },
    {
      key: "soil_class",
      label: "Soil class",
      required: true,
      options: ["ZA", "ZB", "ZC", "ZD", "ZE"],
      scoreMap: { ZA: -1.5, ZB: -4.5, ZC: -7.5, ZD: -10.5, ZE: -10.5 },
      guide: {
        definition: "Vs30 value is used to assign the local soil class (ZA–ZE) according to TBDY 2018.",
        method:
          "For public buildings, soil and geotechnical data is obtained from the relevant municipality or another authorized public institution. If unavailable, determine it from a Vs30 map and TBDY 2018 Table 16.1.",
        links: [
          { label: "AFAD Vs30 / soil class map", url: "https://deprem.afad.gov.tr/content/168" },
          { label: "Mapelse Vs30 map (Turkey, alternate source)", url: "https://mapelse.github.io/global_vs30/" },
        ],
      },
    },
    {
      key: "sds_band",
      label: "Earthquake Risk (SDS band)",
      required: true,
      options: ["SDS ≥ 0,75g", "0,50g ≤ SDS < 0,75g", "0,25g ≤ SDS < 0,50g", "SDS < 0,25g"],
      scoreMap: {
        "SDS ≥ 0,75g": -45,
        "0,50g ≤ SDS < 0,75g": -22.5,
        "0,25g ≤ SDS < 0,50g": 0,
        "SDS < 0,25g": 15,
      },
      guide: {
        definition:
          "SDS is the ordinate of the design response spectrum in the short-period range — the seismic demand affecting structures, reflecting both mapped hazard and site amplification from the soil class.",
        method:
          "Obtained by entering the building's geographic coordinates (latitude–longitude) into the official Türkiye Earthquake Hazard Map Interactive Web Application and reading the SDS value from the generated report.",
        links: [
          { label: "Türkiye Earthquake Hazard Map Interactive Web Application (AFAD / TDTH)", url: "https://tdth.afad.gov.tr/TDTH/main.xhtml" },
        ],
      },
    },
    {
      key: "structural_system",
      label: "Structural system",
      required: true,
      options: ["Reinforced Concrete Frame + Shear Wall", "Reinforced Concrete Frame"],
      scoreMap: {
        "Reinforced Concrete Frame + Shear Wall": 75,
        "Reinforced Concrete Frame": 55,
      },
      guide: {
        definition:
          "Primary seismic force-resisting system, classified as either Reinforced Concrete Frame or Reinforced Concrete Frame + Shear Wall.",
        method:
          "Obtained from approved structural project documentation (static project drawings) and verified during site visits through visual inspection of columns, beams, and shear walls.",
      },
    },
    {
      key: "project_year_band",
      label: "Year of the building project",
      required: true,
      options: ["after 2018", "2007 - 2018", "2000 - 2007", "before 2000 "],
      scoreMap: {
        "after 2018": 45,
        "2007 - 2018": 22.5,
        "2000 - 2007": 0,
        "before 2000 ": -22.5,
      },
      guide: {
        definition:
          "Official construction year band, indicating the regulatory framework, design standards, and material-quality requirements applicable at the time of construction.",
        method:
          "Obtained from the building permit, occupancy certificate, institutional records, or official municipal archives; verified during the preliminary document review phase.",
      },
    },
    {
      key: "storeys",
      label: "Number of storeys of the building?",
      required: true,
      type: "number",
      options: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
      scoreMap: { 1: -7.5, 2: -9, 3: -10.5, 4: -12, 5: -15, 6: -18, 7: -21, 8: -25.5, 9: -28.5, 10: -30 },
      guide: {
        definition:
          "Total number of above-ground storeys — a quick indicator of the structure's overall load level, vertical load-bearing requirements, and potential structural behaviour.",
        method:
          "Obtained from application documents and confirmed by the project; verified through field visits and observations.",
      },
    },
    {
      key: "vertical_irregularity",
      label: "Vertical irregularity?",
      required: true,
      options: ["Yes", "No"],
      scoreMap: { Yes: -22.5, No: 0 },
      guide: {
        definition:
          "Sudden change in stiffness, mass, strength, continuity of load-bearing elements, or geometry over the building's height (e.g. soft storey, mass or strength irregularity).",
        method:
          "A fundamental \"red flag\" indicator for early detection of structural risk; assessed from structural drawings and site photographs, and may require detailed verification if present.",
      },
    },
    {
      key: "plan_irregularity",
      label: "Plan irregularity?",
      required: true,
      options: ["Yes", "No"],
      scoreMap: { Yes: -49.5, No: 0 },
      guide: {
        definition:
          "Irregular distribution or geometry of the structural system in plan — torsional irregularity, floor/diaphragm discontinuity, or unfavorable plan geometry — that raises the risk of load-transfer failure and concentrated damage.",
        method:
          "Assessed from architectural/structural drawings or site photographs; used as a critical early-screening risk signal, with strong irregularities requiring more detailed verification.",
      },
    },
    {
      key: "heavy_overhang",
      label: "Heavy overhang?",
      required: true,
      options: ["Yes", "No"],
      scoreMap: { Yes: -22.5, No: 0 },
      guide: {
        definition:
          "High-mass projecting elements — balconies, cantilevered slabs, or other protruding masses — that create additional instability under seismic effects.",
        method:
          "Consistent with TBDY 2018 irregularity indicators; assessed from drawings or site photographs. Heavy overhangs can increase torsional effects and local member demand.",
      },
    },
    {
      key: "layout_type",
      label: "What is the building layout type ?",
      required: true,
      options: ["Detached", "Adjacent"],
      scoreMap: { Detached: 21, Adjacent: 0 },
      guide: {
        definition:
          "Whether the building is detached or attached/adjacent to neighbouring structures.",
        method:
          "Affects the risk of pounding with neighbouring buildings during an earthquake and the need for expansion joints; can be determined from satellite/aerial imagery (e.g. Google Earth).",
      },
    },
    {
      key: "site_slope",
      label: "Site slope?",
      required: true,
      options: ["Flat", "Inclined"],
      scoreMap: { Flat: 0, Inclined: -30 },
      guide: {
        definition:
          "Slope of the land the building sits on, and the building's position on that sloping topography.",
        method:
          "Assessed from site plans, topographic data, or imagery; sloping sites can affect foundation risk, retaining structures, drainage, and elevation differences.",
      },
    },
    {
      key: "floor_diaphragm",
      label: "Floor diaphragm effect?",
      required: true,
      options: ["Similar", "Different"],
      scoreMap: { Similar: 0, Different: -42 },
      guide: {
        definition:
          "The floor diaphragm's ability to collect horizontal seismic loads on floor slabs and transfer them to the vertical load-bearing system.",
        method:
          "Assessed from the continuity and rigidity of the flooring system; large shafts/voids, irregular openings, weak connections, or mixed flooring systems are classified as \"different\".",
      },
    },
    {
      key: "short_columns",
      label: "Short columns?",
      required: true,
      options: ["Yes", "No"],
      scoreMap: { Yes: -58.5, No: 0 },
      guide: {
        definition:
          "A column whose free height is shortened by obstacles such as parapets, infill walls, partial window openings, or ramps, making it more susceptible to brittle shear failure.",
        method:
          "The single highest-priority field-visit signal in the guideline; identified by checking for partial infill walls and parapets next to columns, window bands, and level differences (ramps).",
      },
    },
    {
      key: "weak_storey",
      label: "Weak Storey?",
      required: true,
      options: ["Yes", "No"],
      scoreMap: { Yes: -15, No: 0 },
      guide: {
        definition:
          "The risk of damage concentrating on a storey whose horizontal load-bearing capacity is significantly lower than the storeys above and below it.",
        method:
          "Usually caused by wide ground-floor openings, few partitions/columns, infill walls removed for commercial use, or discontinuous load-bearing elements; assessed from floor-usage differences and large openings.",
      },
    },
  ];

  const EES_FIELDS = [
    {
      key: "roof_type",
      label: "Roof suitable for solar panels",
      required: true,
      options: ["Flat", "Pitched", "Truss"],
      scoreMap: { Flat: 1, Pitched: 0, Truss: -1 },
      guide: {
        definition: "Roof structural typology, assessed for its solar-panel (PV) installation potential.",
        method:
          "Determined from physical inspection and structural drawings. Flat roofs allow flexible, unrestricted panel mounting; truss roofs require a structural assessment before any additional loading is applied.",
      },
    },
    {
      key: "roof_shading",
      label: "For roof shading condition",
      required: true,
      options: ["No shading", "Partial", "Heavy"],
      scoreMap: { "No shading": 1, Partial: 0, Heavy: -1 },
      guide: {
        definition: "Degree of shading affecting the roof's usable solar exposure for PV generation.",
        method:
          "Assessed via a shadow survey identifying obstructions during peak solar hours (09:00-15:00); heavy shading is the least favourable case for PV yield.",
      },
    },
    {
      key: "roof_insulation",
      label: "Roof insulation TS 825",
      required: true,
      options: ["Yes", "No"],
      scoreMap: { Yes: 0, No: -1 },
      guide: {
        definition: "Whether the roof insulation meets the TS 825 thermal performance standard.",
        method:
          "Assessed at roof edge details, penetration upstands, or exposed cross-sections; the applicable U-value depends on the climate zone. Where documentation is unavailable, the roof is classified as non-compliant.",
      },
    },
    {
      key: "ceiling_bracing",
      label: "Suspended ceiling bracing system",
      required: true,
      options: ["Yes", "No"],
      scoreMap: { Yes: 0, No: -1 },
      guide: {
        definition:
          "Presence of seismic restraint (diagonal wire braces or rigid struts) in the suspended ceiling system, preventing lateral panel displacement during an earthquake.",
        method:
          "Checked via plenum access at representative locations; restraints must appear at intervals of 3.6 m or less in both horizontal directions to count as compliant. Vertical hangers alone do not satisfy the requirement.",
      },
    },
    {
      key: "ceiling_mep",
      label: "MEP system in suspended ceiling",
      required: true,
      options: ["Yes", "No"],
      scoreMap: { Yes: 1, No: -1 },
      guide: {
        definition:
          "Whether mechanical/electrical/plumbing (MEP) services — ductwork, sprinkler pipework, electrical conduit — are integrated within the suspended ceiling void.",
        method:
          "Assessed by recording the type, routing, and fixing details of all services in the ceiling void during the site visit. Integrated MEP is credited for energy-distribution efficiency but should have independent seismic restraint.",
      },
    },
    {
      key: "ventilation_type",
      label: "What is the type of boiler used for the ventilation system?",
      required: true,
      options: ["No cooling", "Split", "Chiller"],
      scoreMap: { "No cooling": -1, Split: 1, Chiller: 1 },
      guide: {
        definition:
          "Type of active cooling system in use (this field keeps the original workbook's header text and category values — \"No cooling\", \"Split\", \"Chiller\" — for reproducibility with the source data).",
        method:
          "System typology (split/multi-split, VRF/VRV, or centralised chilled-water plant) is identified through physical observation and facility-manager declarations; buildings relying only on natural ventilation are classified as no active cooling.",
      },
    },
    {
      key: "ventilation_age",
      label: "Age/efficiency of ventilation",
      required: true,
      options: ["New", "Old"],
      scoreMap: { New: 1, Old: -1 },
      guide: {
        definition: "Age/efficiency tier of the cooling equipment identified in the previous field.",
        method:
          "Determined from the equipment nameplate/manufacturing date; systems older than 15 years, or with an EER below 2.5, are classified as old/low-efficiency.",
      },
    },
    {
      key: "facade_cladding",
      label: "Facade cladding dead load & collapse risk",
      required: true,
      options: ["Heavy mechanical", "Plaster-Paint", "lightweight composite"],
      scoreMap: { "Heavy mechanical": 0, "Plaster-Paint": -1, "lightweight composite": 1 },
      guide: {
        definition:
          "Facade cladding material class, reflecting both the additional seismic mass it adds and its thermal performance.",
        method:
          "Classified during a perimeter walk: stone, thick-format ceramic and precast panels as heavy; cement render/paint as plaster; factory-assembled composite/sandwich panels as lightweight.",
      },
    },
    {
      key: "facade_insulation",
      label: "Facade insulation TS 825",
      required: true,
      options: ["Yes", "No"],
      scoreMap: { Yes: 1, No: -1 },
      guide: {
        definition: "Whether the facade insulation meets the TS 825 thermal standard.",
        method:
          "Assessed by identifying ETICS, a ventilated facade layer, or cavity insulation, and estimating insulation thickness at window reveals or exposed cross-sections.",
      },
    },
    {
      key: "facade_cracks",
      label: "Cracks on the facade",
      required: true,
      options: ["Yes", "No"],
      scoreMap: { Yes: -1, No: 1 },
      guide: {
        definition:
          "Visible cracking on the facade — the only EES parameter that flags both a seismic distress signal and an energy risk (thermal bridge/air infiltration).",
        method:
          "Assessed via a crack survey under favourable lighting: hairline (<0.2 mm), moderate (0.2-1.0 mm), or wide (>1.0 mm). Diagonal cracks near openings indicate structural distress; horizontal cracks suggest settlement.",
      },
    },
    {
      key: "heating_fuel",
      label: "Primary heating fuel",
      required: true,
      options: ["Natural gas", "solid fuel/coal", "fuel oil", "electric"],
      scoreMap: { "Natural gas": 1, "solid fuel/coal": -1, "fuel oil": -1, electric: -1 },
      guide: {
        definition: "Primary fuel used for space heating.",
        method:
          "Confirmed from supply infrastructure: metered gas connection, solid-fuel storage/ash handling, an oil storage tank and burner, or direct electric heating elements.",
      },
    },
    {
      key: "heating_typology",
      label: "Heating system typology",
      required: true,
      options: ["boiler", "combi", "electric/stove"],
      scoreMap: { boiler: 1, combi: 1, "electric/stove": -1 },
      guide: {
        definition:
          "Arrangement of the heating system — a central boiler room, individual combi boilers, or stand-alone electric heaters.",
        method:
          "A central boiler room concentrates heavy equipment and piping in one location (a seismic-restraint concern); individual combis and stand-alone heaters present minimal concentrated load.",
      },
    },
    {
      key: "boiler_age",
      label: "Age/efficiency of boiler",
      required: true,
      options: ["New", "Old"],
      scoreMap: { New: 1, Old: -1 },
      guide: {
        definition: "Age/efficiency tier of the heating equipment.",
        method:
          "Determined from boiler nameplate data: condensing boilers are classified as high-efficiency; non-condensing units, or those older than 15 years without certification, as low-efficiency.",
      },
    },
    {
      key: "partition_insulation",
      label: "Do partition walls require insulation",
      required: true,
      options: ["Yes", "No"],
      scoreMap: { Yes: -1, No: 1 },
      guide: {
        definition: "Whether the partition walls have an energy-relevant insulation gap.",
        method:
          "Assessed by cross-referencing documentation with on-site probing at skirting boards, electrical recesses, and door frame jambs; absence of visible insulation at exposed edges is recorded as non-compliant.",
      },
    },
  ];

  // Single source of truth for CSV/XLSX import & export column headers, so the
  // "Expected Headers" list, the file parser, and the downloaded file always agree.
  // All headers use one consistent noun-phrase / Title Case format (no question marks,
  // no mixed sentence styles). "Building Name" is handled separately below because the
  // importer also accepts a couple of legacy aliases for it (Building ID, etc.).
  const HEADERS = {
    soil_class: "Soil Class",
    sds_band: "Earthquake Risk",
    structural_system: "Structural System",
    project_year_band: "Project Year",
    storeys: "Number of Storeys",
    vertical_irregularity: "Vertical Irregularity",
    plan_irregularity: "Plan Irregularity",
    heavy_overhang: "Heavy Overhang",
    layout_type: "Building Layout Type",
    site_slope: "Site Slope",
    floor_diaphragm: "Floor Diaphragm Effect",
    short_columns: "Short Columns",
    weak_storey: "Weak Storey",
    roof_type: "Roof Type (Solar Suitability)",
    roof_shading: "Roof Shading Condition",
    roof_insulation: "Roof Insulation (TS 825)",
    ceiling_bracing: "Suspended Ceiling Bracing System",
    ceiling_mep: "MEP System in Suspended Ceiling",
    ventilation_type: "Ventilation/Cooling System Type",
    ventilation_age: "Ventilation System Age/Efficiency",
    facade_cladding: "Facade Cladding Type",
    facade_insulation: "Facade Insulation (TS 825)",
    facade_cracks: "Facade Cracks",
    heating_fuel: "Primary Heating Fuel",
    heating_typology: "Heating System Typology",
    boiler_age: "Boiler Age/Efficiency",
    partition_insulation: "Partition Wall Insulation",
  };

  // Older header text (question-style / inconsistent casing) that earlier exports and the
  // original public template used. Kept only so files created before this cleanup, or the
  // original public template, still import correctly; not shown anywhere in the UI.
  const LEGACY_HEADERS = {
    soil_class: "Soil class",
    structural_system: "What is the structural system?",
    project_year_band: "What is the year of the building project?",
    storeys: "Number of storeys of the building?",
    vertical_irregularity: "Vertical irregularity?",
    plan_irregularity: "Plan irregularity?",
    heavy_overhang: "Heavy overhang?",
    layout_type: "What is the building layout type ?",
    site_slope: "Site slope?",
    floor_diaphragm: "Floor diaphragm effect?",
    short_columns: "Short columns?",
    weak_storey: "Weak Storey?",
    roof_type: "Roof suitable for solar panels",
    roof_shading: "For roof shading condition",
    roof_insulation: "Roof insulation TS 825",
    ceiling_bracing: "Suspended ceiling bracing system",
    ceiling_mep: "MEP system in suspended ceiling",
    ventilation_type: "What is the type of boiler used for the ventilation system?",
    ventilation_age: "Age/efficiency of ventilation",
    facade_cladding: "Facade cladding dead load & collapse risk",
    facade_insulation: "Facade insulation TS 825",
    facade_cracks: "Cracks on the facade",
    heating_typology: "Heating system typology",
    boiler_age: "Age/efficiency of boiler",
    partition_insulation: "Do partition walls require insulation",
  };

  function getRawValue(raw, key) {
    const primary = HEADERS[key];
    const legacy = LEGACY_HEADERS[key];
    if (primary && raw[primary] !== undefined && raw[primary] !== "") return raw[primary];
    if (legacy && raw[legacy] !== undefined) return raw[legacy];
    return primary ? raw[primary] : undefined;
  }

  const tabButtons = [...document.querySelectorAll(".tab")];
  const views = {
    single: document.getElementById("view-single"),
    batch: document.getElementById("view-batch"),
    dashboard: document.getElementById("view-dashboard"),
  };

  const els = {
    stats: document.getElementById("stats"),
    singleStats: document.getElementById("singleStats"),
    clearPortfolioBtnSingle: document.getElementById("clearPortfolioBtnSingle"),
    bsFields: document.getElementById("bsFields"),
    eesFields: document.getElementById("eesFields"),
    guideSelect: document.getElementById("guideSelect"),
    guideCards: document.getElementById("guideCards"),
    bsResults: document.getElementById("bsResults"),
    eesResults: document.getElementById("eesResults"),
    eesSection: document.getElementById("eesSection"),
    computeBsBtn: document.getElementById("computeBsBtn"),
    continueToEesBtn: document.getElementById("continueToEesBtn"),
    computeFullRecordBtn: document.getElementById("computeFullRecordBtn"),
    saveRecordBtn: document.getElementById("saveRecordBtn"),
    resetSingleBtn: document.getElementById("resetSingleBtn"),
    csvFileInput: document.getElementById("csvFileInput"),
    csvPreview: document.getElementById("csvPreview"),
    importCsvBtn: document.getElementById("importCsvBtn"),
    importPastedCsvBtn: document.getElementById("importPastedCsvBtn"),
    loadDemoBtn: document.getElementById("loadDemoBtn"),
    clearPortfolioBtn: document.getElementById("clearPortfolioBtn"),
    batchStatus: document.getElementById("batchStatus"),
    expectedHeaders: document.getElementById("expectedHeaders"),
    summaryCharts: document.getElementById("summaryCharts"),
    distributionCharts: document.getElementById("distributionCharts"),
    bsParamCharts: document.getElementById("bsParamCharts"),
    eesParamCharts: document.getElementById("eesParamCharts"),
    recomputePortfolioBtn: document.getElementById("recomputePortfolioBtn"),
    downloadPortfolioBtn: document.getElementById("downloadPortfolioBtn"),
    downloadPortfolioXlsxBtn: document.getElementById("downloadPortfolioXlsxBtn"),
    searchInput: document.getElementById("searchInput"),
    filterRisk: document.getElementById("filterRisk"),
    filterStatus: document.getElementById("filterStatus"),
    filterSds: document.getElementById("filterSds"),
    portfolioBody: document.getElementById("portfolioBody"),
    tableMeta: document.getElementById("tableMeta"),
  };

  let portfolio = loadPortfolio();
  let currentBsResult = null;
  let currentFullRecord = null;

  function loadPortfolio() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (_error) {
      return [];
    }
  }

  function savePortfolio() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
  }

  function slug(text) {
    return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-");
  }

  function renderFields(container, fields, prefix) {
    container.innerHTML = fields
      .map((field) => {
        const inputId = `${prefix}-${field.key}`;
        if (field.type === "text") {
          return `<div class="field"><label for="${inputId}">${field.label}</label><input id="${inputId}" data-key="${field.key}" type="text" /></div>`;
        }
        return `
          <div class="field">
            <label for="${inputId}">${field.label}</label>
            <select id="${inputId}" data-key="${field.key}">
              <option value="">Select</option>
              ${field.options.map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`).join("")}
            </select>
          </div>
        `;
      })
      .join("");
  }

  function buildGuideOptions() {
    const fields = [...BS_FIELDS.filter((field) => field.guide), ...EES_FIELDS.filter((field) => field.guide)];
    els.guideSelect.innerHTML = fields
      .map((field) => `<option value="${field.key}">${escapeHtml(field.label)}</option>`)
      .join("");
    renderGuide(fields[0].key);
  }

  function renderGuide(fieldKey) {
    const field = [...BS_FIELDS, ...EES_FIELDS].find((item) => item.key === fieldKey);
    if (!field) return;
    const links = field.guide.links || [];
    const linksCard = links.length
      ? `
      <div class="info-card">
        <h4>Where to find this</h4>
        <div class="small">
          ${links
            .map((link) => `<a href="${link.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`)
            .join("<br />")}
        </div>
      </div>
      `
      : "";
    els.guideCards.innerHTML = `
      <div class="info-card">
        <h4>${escapeHtml(field.label)}</h4>
        <div class="small"><strong>Definition:</strong> ${escapeHtml(field.guide.definition)}</div>
      </div>
      <div class="info-card">
        <h4>How to assess</h4>
        <div class="small">${escapeHtml(field.guide.method)}</div>
      </div>
      ${linksCard}
      <div class="info-card">
        <h4>Scoring options</h4>
        <div class="small">${renderScoreMap(field)}</div>
      </div>
    `;
  }

  function renderScoreMap(field) {
    if (!field.scoreMap) return "No direct score mapping in this stage.";
    return Object.entries(field.scoreMap)
      .map(([key, value]) => `${key}: ${value}`)
      .join(" | ");
  }

  function getFieldValue(field, prefix) {
    const element = document.getElementById(`${prefix}-${field.key}`);
    return element ? element.value : "";
  }

  function collectValues(fields, prefix) {
    const record = {};
    for (const field of fields) {
      record[field.key] = getFieldValue(field, prefix);
    }
    return record;
  }

  function validateFields(fields, values) {
    const missing = fields.filter((field) => field.required && !values[field.key]);
    return missing.map((field) => field.label);
  }

  // `unscored` lists any field whose value didn't match one of the field's known
  // options, so it contributed nothing to the total. This can't happen from the manual
  // entry form (its inputs are dropdowns), but a bulk-upload file has free-text cells,
  // so a typo (e.g. "yes" instead of "Yes") would otherwise silently score as 0 with no
  // indication anything was wrong.
  function scoreRecord(values, fields) {
    let total = 0;
    const breakdown = [];
    const unscored = [];
    for (const field of fields) {
      if (!field.scoreMap) continue;
      const rawValue = values[field.key];
      const normalizedKey = field.type === "number" ? Number(rawValue) : rawValue;
      const score = field.scoreMap[normalizedKey];
      breakdown.push({ label: field.label, value: rawValue, score });
      if (score === undefined) {
        unscored.push(field.label);
      } else {
        total += Number(score);
      }
    }
    return { total, breakdown, unscored };
  }

  function bsColor(score) {
    if (score < -70) return "red";
    if (score < -20) return "orange";
    return "yellow";
  }

  // Plain risk-range description, no "eligible/ineligible" or "cross check" wording —
  // the three bands (yellow / orange / red) are the only categories that exist.
  function actionFromColor(color) {
    if (color === "orange") return "Orange range — field visit recommended";
    if (color === "yellow") return "Yellow range";
    return "Red range — excluded";
  }

  // Short on-screen status: everything that is not red counts as "Included" (investment candidate);
  // red buildings are "Excluded". This mirrors the risk band directly (yellow/orange -> Included,
  // red -> Excluded) and is also used in place of any "eligible/ineligible" wording in exports.
  function statusFromColor(color) {
    return color === "red" ? "Excluded" : "Included";
  }

  function computeSingleBs() {
    const values = collectValues(BS_FIELDS, "bs");
    const missing = validateFields(BS_FIELDS, values);
    if (missing.length) {
      els.bsResults.innerHTML = `<div class="result-item"><div class="small">Missing fields: ${escapeHtml(missing.join(", "))}</div></div>`;
      return;
    }
    const scored = scoreRecord(values, BS_FIELDS);
    const color = bsColor(scored.total);
    const action = actionFromColor(color);

    currentBsResult = { ...values, score: scored.total, risk_level: color, action, bs_breakdown: scored.breakdown };

    els.bsResults.innerHTML = `
      <div class="result-item"><div class="small">Building Score</div><strong>${formatNumber(scored.total)}</strong></div>
      <div class="result-item"><div class="small">Risk Level</div><strong>${riskBadge(color)}</strong></div>
      <div class="result-item"><div class="small">Status</div><strong>${statusBadge(color)}</strong></div>
      <div class="result-item"><div class="small">Note</div><strong>${escapeHtml(action)}</strong></div>
    `;

    const eligible = color !== "red";
    els.continueToEesBtn.disabled = !eligible;
    els.eesSection.style.display = eligible ? "block" : "none";
    currentFullRecord = null;
    // Red-range buildings have no EES stage to complete, so they can be saved
    // to the portfolio right away. Yellow/orange buildings must complete Stage 2 first.
    els.saveRecordBtn.disabled = eligible;
  }

  function computeSingleFullRecord() {
    if (!currentBsResult) {
      computeSingleBs();
      if (!currentBsResult) return;
    }

    const eesValues = collectValues(EES_FIELDS, "ees");
    const missing = validateFields(EES_FIELDS, eesValues);
    if (missing.length) {
      els.eesResults.innerHTML = `<div class="result-item"><div class="small">Missing fields: ${escapeHtml(missing.join(", "))}</div></div>`;
      return;
    }

    const eesScored = scoreRecord(eesValues, EES_FIELDS);
    currentFullRecord = {
      building_label: currentBsResult.building_label,
      ...currentBsResult,
      ...eesValues,
      ees_score: eesScored.total,
      ees_breakdown: eesScored.breakdown,
    };

    els.eesResults.innerHTML = `
      <div class="result-item"><div class="small">EES</div><strong>${formatNumber(eesScored.total)}</strong></div>
      <div class="result-item"><div class="small">Status</div><strong>Ready to save</strong></div>
    `;

    els.saveRecordBtn.disabled = false;
  }

  function addCurrentRecordToPortfolio() {
    if (!currentFullRecord && currentBsResult && currentBsResult.risk_level === "red") {
      currentFullRecord = {
        building_label: currentBsResult.building_label,
        ...currentBsResult,
        ees_score: null,
      };
    }
    if (!currentFullRecord) return;
    portfolio.push(normalizeRecord(currentFullRecord));
    recomputePortfolio();
    savePortfolio();
    els.saveRecordBtn.disabled = true;
  }

  function normalizeRecord(record) {
    return {
      building_label: record.building_label || `Building ${portfolio.length + 1}`,
      soil_class: record.soil_class,
      sds_band: record.sds_band,
      structural_system: record.structural_system,
      project_year_band: record.project_year_band,
      storeys: record.storeys,
      vertical_irregularity: record.vertical_irregularity,
      plan_irregularity: record.plan_irregularity,
      heavy_overhang: record.heavy_overhang,
      layout_type: record.layout_type,
      site_slope: record.site_slope,
      floor_diaphragm: record.floor_diaphragm,
      short_columns: record.short_columns,
      weak_storey: record.weak_storey,
      score: Number(record.score),
      risk_level: record.risk_level,
      action: record.action,
      roof_type: record.roof_type || "",
      roof_shading: record.roof_shading || "",
      roof_insulation: record.roof_insulation || "",
      ceiling_bracing: record.ceiling_bracing || "",
      ceiling_mep: record.ceiling_mep || "",
      ventilation_type: record.ventilation_type || "",
      ventilation_age: record.ventilation_age || "",
      facade_cladding: record.facade_cladding || "",
      facade_insulation: record.facade_insulation || "",
      facade_cracks: record.facade_cracks || "",
      heating_fuel: record.heating_fuel || "",
      heating_typology: record.heating_typology || "",
      boiler_age: record.boiler_age || "",
      partition_insulation: record.partition_insulation || "",
      ees_score: record.ees_score == null ? null : Number(record.ees_score),
      prioritization: null,
    };
  }

  function recomputePortfolio() {
    const active = portfolio.filter((row) => row.risk_level === "yellow" || row.risk_level === "orange");
    active.sort((a, b) => {
      const colorRank = { yellow: 0, orange: 1 };
      if (colorRank[a.risk_level] !== colorRank[b.risk_level]) {
        return colorRank[a.risk_level] - colorRank[b.risk_level];
      }
      const eesA = a.ees_score == null ? Number.POSITIVE_INFINITY : a.ees_score;
      const eesB = b.ees_score == null ? Number.POSITIVE_INFINITY : b.ees_score;
      if (eesA !== eesB) return eesA - eesB;
      return b.score - a.score;
    });

    portfolio.forEach((row) => {
      row.prioritization = null;
    });
    active.forEach((row, index) => {
      row.prioritization = index + 1;
    });

    savePortfolio();
    renderStats();
    renderDashboard();
  }

  function renderStats() {
    const excluded = portfolio.filter((row) => row.risk_level === "red").length;
    const included = portfolio.length - excluded;
    const ranked = portfolio.filter((row) => row.prioritization != null).length;

    const html = `
      <div class="stat"><div class="eyebrow">Loaded</div><div class="number">${portfolio.length}</div><div class="small">total buildings</div></div>
      <div class="stat"><div class="eyebrow">Excluded</div><div class="number">${excluded}</div><div class="small">red range</div></div>
      <div class="stat"><div class="eyebrow">Included</div><div class="number">${included}</div><div class="small">yellow or orange range</div></div>
      <div class="stat"><div class="eyebrow">Ranked</div><div class="number">${ranked}</div><div class="small">prioritization assigned</div></div>
    `;

    // Rendered in two places: the Portfolio Dashboard tab (#stats) and a live
    // snapshot at the bottom of the Manual Building Entry tab (#singleStats),
    // so the count is visible immediately after each save without switching tabs.
    if (els.stats) els.stats.innerHTML = html;
    if (els.singleStats) els.singleStats.innerHTML = html;
  }

  function countBy(rows, key) {
    const counts = new Map();
    for (const row of rows) {
      const value = row[key] == null || row[key] === "" ? "blank" : String(row[key]);
      counts.set(value, (counts.get(value) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }

  // Generic neutral-gray distribution chart, used where the categories being
  // counted have no seismic-risk or good/bad meaning of their own.
  function renderBars(title, rows) {
    const max = rows.length ? Math.max(...rows.map((row) => row[1])) : 1;
    return `
      <div class="info-card">
        <h4>${escapeHtml(title)}</h4>
        <div class="chart-list">
          ${rows
            .map(
              ([label, value]) => `
                <div class="chart-row">
                  <div class="small">${escapeHtml(label)}</div>
                  <div class="bar" style="width:${(value / max) * 100}%"></div>
                  <div class="small">${value}</div>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  // BS Risk Level distribution: the one chart in the tool that is intentionally
  // colored yellow/orange/red, matching the BS classification itself.
  function renderRiskBars(title, rows) {
    const max = rows.length ? Math.max(...rows.map((row) => row[1])) : 1;
    const colorClass = { yellow: "risk-bar-yellow", orange: "risk-bar-orange", red: "risk-bar-red" };
    return `
      <div class="info-card">
        <h4>${escapeHtml(title)}</h4>
        <div class="chart-list">
          ${rows
            .map(
              ([label, value]) => `
                <div class="chart-row">
                  <div class="small">${escapeHtml(label)}</div>
                  <div class="bar ${colorClass[label] || ""}" style="width:${(value / max) * 100}%"></div>
                  <div class="small">${value}</div>
                </div>
              `
            )
            .join("")}
        </div>
      </div>
    `;
  }

  // Per-parameter statistics chart: each answer's bar is colored by whether that
  // specific answer contributes a positive, negative, or neutral score for the
  // field (green = favorable, red = unfavorable, gray = neutral/zero or unscored).
  function renderParamBars(field, rows) {
    const max = rows.length ? Math.max(...rows.map((row) => row[1])) : 1;
    return `
      <div class="info-card">
        <h4>${escapeHtml(field.label)}</h4>
        <div class="chart-list">
          ${rows
            .map(([label, value]) => {
              const scoreVal = field.scoreMap ? field.scoreMap[label] : undefined;
              let cls = "param-neutral";
              if (typeof scoreVal === "number") {
                if (scoreVal > 0) cls = "param-good";
                else if (scoreVal < 0) cls = "param-bad";
              }
              return `
                <div class="chart-row">
                  <div class="small">${escapeHtml(label)}</div>
                  <div class="bar ${cls}" style="width:${(value / max) * 100}%"></div>
                  <div class="small">${value}</div>
                </div>
              `;
            })
            .join("")}
        </div>
      </div>
    `;
  }

  function renderDashboard() {
    const riskCounts = countBy(portfolio, "risk_level");
    const sdsCounts = countBy(portfolio, "sds_band");
    const eesCounts = countBy(portfolio.filter((row) => row.ees_score != null), "ees_score");

    els.summaryCharts.innerHTML = renderRiskBars("BS Risk Level", riskCounts);
    els.distributionCharts.innerHTML = renderBars("EES Distribution", eesCounts);

    populateFilterOptions(els.filterRisk, ["All BS colors", ...riskCounts.map((item) => item[0])]);
    populateFilterOptions(els.filterStatus, ["All status", "Included", "Excluded"]);
    populateFilterOptions(els.filterSds, ["All SDS bands", ...sdsCounts.map((item) => item[0])]);

    renderParameterStats();
    renderPortfolioTable();
  }

  // Per-parameter statistics: one distribution chart for every BS and EES input field,
  // across all buildings currently loaded (not just eligible ones). Bars are colored
  // by whether that specific answer is favorable, unfavorable, or neutral.
  function renderParameterStats() {
    const bsFieldsForStats = BS_FIELDS.filter((field) => field.key !== "building_label");
    els.bsParamCharts.innerHTML = bsFieldsForStats
      .map((field) => renderParamBars(field, countBy(portfolio, field.key)))
      .join("");
    els.eesParamCharts.innerHTML = EES_FIELDS
      .map((field) => renderParamBars(field, countBy(portfolio, field.key)))
      .join("");
  }

  function populateFilterOptions(select, values) {
    const current = select.value;
    select.innerHTML = values
      .map((value, index) => `<option value="${index === 0 ? "" : escapeHtml(value)}">${escapeHtml(value)}</option>`)
      .join("");
    select.value = current;
  }

  function renderPortfolioTable() {
    const query = els.searchInput.value.trim().toLowerCase();
    const risk = els.filterRisk.value;
    const status = els.filterStatus.value;
    const sds = els.filterSds.value;

    const filtered = portfolio
      .filter((row) => {
        const label = String(row.building_label || "").toLowerCase();
        const rowStatus = statusFromColor(row.risk_level);
        if (query && !label.includes(query)) return false;
        if (risk && row.risk_level !== risk) return false;
        if (status && rowStatus !== status) return false;
        if (sds && row.sds_band !== sds) return false;
        return true;
      })
      .sort((a, b) => {
        const prioA = a.prioritization == null ? Number.POSITIVE_INFINITY : a.prioritization;
        const prioB = b.prioritization == null ? Number.POSITIVE_INFINITY : b.prioritization;
        return prioA - prioB;
      });

    els.tableMeta.textContent = `${filtered.length} rows shown`;
    els.portfolioBody.innerHTML = filtered
      .map(
        (row) => `
          <tr>
            <td>${escapeHtml(row.building_label)}</td>
            <td>${formatNumber(row.score)}</td>
            <td>${row.ees_score == null ? "" : formatNumber(row.ees_score)}</td>
            <td>${row.prioritization == null ? "" : row.prioritization}</td>
          </tr>
        `
      )
      .join("");
  }

  function riskBadge(color) {
    if (color === "yellow") return `<span class="badge risk-yellow">yellow</span>`;
    if (color === "orange") return `<span class="badge risk-orange">orange</span>`;
    if (color === "red") return `<span class="badge risk-red">red</span>`;
    if (color === "green") return `<span class="badge risk-green">green</span>`;
    return escapeHtml(color || "");
  }

  function statusBadge(color) {
    const status = statusFromColor(color);
    const cls = status === "Excluded" ? "status-excluded" : "status-included";
    return `<span class="badge ${cls}">${status}</span>`;
  }

  function formatNumber(value) {
    if (value == null || value === "") return "";
    return Number(value).toString();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function resetSingle() {
    [...BS_FIELDS, ...EES_FIELDS].forEach((field) => {
      const bsEl = document.getElementById(`bs-${field.key}`);
      const eesEl = document.getElementById(`ees-${field.key}`);
      if (bsEl) bsEl.value = "";
      if (eesEl) eesEl.value = "";
    });
    currentBsResult = null;
    currentFullRecord = null;
    els.bsResults.innerHTML = "";
    els.eesResults.innerHTML = "";
    els.eesSection.style.display = "none";
    els.continueToEesBtn.disabled = true;
    els.saveRecordBtn.disabled = true;
  }

  function switchTab(name) {
    tabButtons.forEach((button) => button.classList.toggle("active", button.dataset.tab === name));
    Object.entries(views).forEach(([key, element]) => element.classList.toggle("active", key === name));
  }

  function parseCsv(text) {
    const rows = [];
    let row = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];
      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === "," && !inQuotes) {
        row.push(current);
        current = "";
      } else if ((char === "\n" || char === "\r") && !inQuotes) {
        if (char === "\r" && next === "\n") i += 1;
        row.push(current);
        if (row.some((value) => value !== "")) rows.push(row);
        row = [];
        current = "";
      } else {
        current += char;
      }
    }
    if (current !== "" || row.length) {
      row.push(current);
      if (row.some((value) => value !== "")) rows.push(row);
    }
    return rows;
  }

  // Shared entry point for both CSV and XLSX import: takes an array of plain
  // { header: value } row objects, scores each one, and merges it into the portfolio.
  function importRawObjects(rawObjects) {
    const normalized = [];
    const skipReasons = [];
    const eesIssues = [];
    for (const raw of rawObjects) {
      const result = mapImportedRow(raw);
      if (!result.record) {
        skipReasons.push(result.reason);
        continue;
      }
      if (result.eesIssue) eesIssues.push(result.eesIssue);
      normalized.push(result.record);
    }
    portfolio = portfolio.concat(normalized);
    recomputePortfolio();
    savePortfolio();
    if (skipReasons.length) console.warn("Rows skipped during import:", skipReasons);
    if (eesIssues.length) console.warn("Rows imported without an EES score:", eesIssues);
    return { imported: normalized.length, skipped: skipReasons.length, partialEes: eesIssues.length };
  }

  // Turns an importRawObjects() result into one status-line message. Full skip/EES
  // reasons are logged to the browser console (see importRawObjects) rather than shown
  // here, since a bulk file can have many rows — the count is enough to flag that
  // something needs a closer look, and "Valid values" in Expected Headers explains what
  // the importer accepts.
  function describeImportResult(result, sourceLabel) {
    const parts = [`Imported ${result.imported} record(s) ${sourceLabel}.`];
    if (result.skipped) {
      parts.push(`${result.skipped} row(s) skipped (missing or unrecognized values — see Expected Headers, or check the browser console for details).`);
    }
    if (result.partialEes) {
      parts.push(`${result.partialEes} row(s) imported without an EES score (missing or unrecognized values) — complete Stage 2 for these manually.`);
    }
    return parts.join(" ");
  }

  function importRowsFromCsvRows(csvRows) {
    if (!csvRows.length) return { imported: 0, skipped: 0, partialEes: 0 };
    const headers = csvRows[0].map((item) => item.trim());
    const rawObjects = [];

    for (let i = 1; i < csvRows.length; i += 1) {
      const line = csvRows[i];
      const raw = {};
      headers.forEach((header, index) => {
        raw[header] = line[index] == null ? "" : line[index].trim();
      });
      rawObjects.push(raw);
    }

    return importRawObjects(rawObjects);
  }

  // XLSX import via SheetJS: reads the first sheet of the workbook and maps it to
  // the same { header: value } row-object shape that the CSV path produces.
  function importXlsxArrayBuffer(arrayBuffer) {
    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });
    const rawObjects = rows.map((row) => {
      const raw = {};
      Object.entries(row).forEach(([header, value]) => {
        raw[String(header).trim()] = value == null ? "" : String(value).trim();
      });
      return raw;
    });
    return importRawObjects(rawObjects);
  }

  function isXlsxFile(file) {
    return /\.xlsx$/i.test(file.name) || file.type.indexOf("spreadsheetml") !== -1;
  }

  function mapImportedRow(raw) {
    const mappedBs = {
      building_label:
        raw["Building Name"] || raw["Building ID"] || raw["Public Building"] || raw["Building"] || `Building ${portfolio.length + 1}`,
      soil_class: getRawValue(raw, "soil_class"),
      sds_band: getRawValue(raw, "sds_band"),
      structural_system: getRawValue(raw, "structural_system"),
      project_year_band: getRawValue(raw, "project_year_band"),
      storeys: getRawValue(raw, "storeys"),
      vertical_irregularity: getRawValue(raw, "vertical_irregularity"),
      plan_irregularity: getRawValue(raw, "plan_irregularity"),
      heavy_overhang: getRawValue(raw, "heavy_overhang"),
      layout_type: getRawValue(raw, "layout_type"),
      site_slope: getRawValue(raw, "site_slope"),
      floor_diaphragm: getRawValue(raw, "floor_diaphragm"),
      short_columns: getRawValue(raw, "short_columns"),
      weak_storey: getRawValue(raw, "weak_storey"),
    };

    const bsMissing = validateFields(BS_FIELDS.filter((field) => field.key !== "building_label"), mappedBs);
    if (bsMissing.length) {
      return { record: null, reason: `"${mappedBs.building_label}" skipped — missing value(s) for: ${bsMissing.join(", ")}` };
    }

    const bsScored = scoreRecord(mappedBs, BS_FIELDS.filter((field) => field.key !== "building_label"));
    if (bsScored.unscored.length) {
      return {
        record: null,
        reason: `"${mappedBs.building_label}" skipped — unrecognized value(s) for: ${bsScored.unscored.join(", ")} (see Expected Headers for valid values)`,
      };
    }
    const risk_level = bsColor(bsScored.total);
    const action = actionFromColor(risk_level);

    const eesValues = {
      roof_type: getRawValue(raw, "roof_type"),
      roof_shading: getRawValue(raw, "roof_shading"),
      roof_insulation: getRawValue(raw, "roof_insulation"),
      ceiling_bracing: getRawValue(raw, "ceiling_bracing"),
      ceiling_mep: getRawValue(raw, "ceiling_mep"),
      ventilation_type: getRawValue(raw, "ventilation_type"),
      ventilation_age: getRawValue(raw, "ventilation_age"),
      facade_cladding: getRawValue(raw, "facade_cladding"),
      facade_insulation: getRawValue(raw, "facade_insulation"),
      facade_cracks: getRawValue(raw, "facade_cracks"),
      heating_fuel: getRawValue(raw, "heating_fuel"),
      heating_typology: getRawValue(raw, "heating_typology"),
      boiler_age: getRawValue(raw, "boiler_age"),
      partition_insulation: getRawValue(raw, "partition_insulation"),
    };

    // Unlike BS, an incomplete or unrecognized EES value doesn't disqualify the row —
    // the building can still be imported with ees_score left blank and finished later
    // in Manual Building Entry. But a partial/wrong-looking EES total is worse than no
    // total, so any unscored value blanks the whole EES score rather than silently
    // treating it as 0.
    let eesScore = null;
    let eesIssue = null;
    if (risk_level !== "red") {
      const eesMissing = validateFields(EES_FIELDS, eesValues);
      if (eesMissing.length) {
        eesIssue = `"${mappedBs.building_label}" imported without an EES score — missing value(s) for: ${eesMissing.join(", ")}`;
      } else {
        const eesScored = scoreRecord(eesValues, EES_FIELDS);
        if (eesScored.unscored.length) {
          eesIssue = `"${mappedBs.building_label}" imported without an EES score — unrecognized value(s) for: ${eesScored.unscored.join(", ")} (see Expected Headers for valid values)`;
        } else {
          eesScore = eesScored.total;
        }
      }
    }

    return {
      record: normalizeRecord({
        ...mappedBs,
        ...eesValues,
        score: bsScored.total,
        risk_level,
        action,
        ees_score: eesScore,
      }),
      eesIssue,
    };
  }

  function loadDemoData() {
    // Reads from window.SAMPLE_BUILDINGS if present, falling back to the older
    // window.KABEV_BUILDINGS name for compatibility with an existing data file.
    // Routed through importRawObjects (like the CSV/XLSX paths) so scoring, skip
    // handling, and status reporting all go through the same single code path.
    const source = window.SAMPLE_BUILDINGS || window.KABEV_BUILDINGS || [];
    const rawObjects = source.map((row, index) => ({
      "Building Name": `Sample Building ${String(index + 1).padStart(3, "0")}`,
      "Soil class": row["Soil class"],
      "Earthquake Risk": row["Earthquake Risk"],
      "What is the structural system?": row["What is the structural system?"],
      "What is the year of the building project?": row["What is the year of the building project?"],
      "Number of storeys of the building?": String(row["Number of storeys of the building?"] || ""),
      "Vertical irregularity?": row["Vertical irregularity?"],
      "Plan irregularity?": row["Plan irregularity?"],
      "Heavy overhang?": row["Heavy overhang?"],
      "What is the building layout type ?": row["What is the building layout type ?"],
      "Site slope?": row["Site slope?"],
      "Floor diaphragm effect?": row["Floor diaphragm effect?"],
      "Short columns?": row["Short columns?"],
      "Weak Storey?": row["Weak Storey?"],
      "Roof suitable for solar panels": row["Roof suitable for solar panels"],
      "For roof shading condition": row["For roof shading condition"],
      "Roof insulation TS 825": row["Roof insulation TS 825"],
      "Suspended ceiling bracing system": row["Suspended ceiling bracing system"],
      "MEP system in suspended ceiling": row["MEP system in suspended ceiling"],
      "What is the type of boiler used for the ventilation system?": row["What is the type of boiler used for the ventilation system?"],
      "Age/efficiency of ventilation": row["Age/efficiency of ventilation"],
      "Facade cladding dead load & collapse risk": row["Facade cladding dead load & collapse risk"],
      "Facade insulation TS 825": row["Facade insulation TS 825"],
      "Cracks on the facade": row["Cracks on the facade"],
      "Primary heating fuel": row["Primary heating fuel"],
      "Heating system typology": row["Heating system typology"],
      "Age/efficiency of boiler": row["Age/efficiency of boiler"],
      "Do partition walls require insulation": row["Do partition walls require insulation"],
    }));

    // "Load Sample Data" replaces the current portfolio rather than merging into it.
    portfolio = [];
    const result = importRawObjects(rawObjects);
    els.batchStatus.textContent = describeImportResult(result, "from the sample dataset");
  }

  // Builds the flat array of row objects (one per building) shared by the CSV and
  // XLSX export paths. Header text comes from the same HEADERS map used everywhere
  // else, so the exported file, the "Expected Headers" list, and the importer can
  // never drift out of sync with one another again.
  function buildExportRows() {
    return portfolio.map((row) => {
      const out = { "Building Name": row.building_label };
      BS_FIELDS.filter((field) => field.key !== "building_label").forEach((field) => {
        out[HEADERS[field.key]] = row[field.key];
      });
      out.Score = row.score;
      out["Risk Level"] = row.risk_level;
      out["What Should Do ?"] = row.action;
      out["Included or Excluded"] = statusFromColor(row.risk_level);
      EES_FIELDS.forEach((field) => {
        out[HEADERS[field.key]] = row[field.key];
      });
      out["Energy Efficiency Score (EES)"] = row.ees_score;
      out.Prioritization = row.prioritization;
      return out;
    });
  }

  function downloadPortfolioXlsx() {
    const rows = buildExportRows();
    if (!rows.length) {
      els.batchStatus.textContent = "No records to export yet.";
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Portfolio");
    XLSX.writeFile(workbook, "bs_ees_portfolio_computed.xlsx");
  }

  // Shares buildExportRows() with the XLSX export path, so the CSV and XLSX downloads
  // always have identical headers, order, and values.
  function downloadPortfolioCsv() {
    const rows = buildExportRows();
    if (!rows.length) {
      els.batchStatus.textContent = "No records to export yet.";
      return;
    }
    const headers = Object.keys(rows[0]);
    const lines = [headers].concat(rows.map((row) => headers.map((header) => row[header])));

    const csv = lines
      .map((line) => line.map((value) => `"${String(value == null ? "" : value).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bs_ees_portfolio_computed.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  function bindEvents() {
    tabButtons.forEach((button) => button.addEventListener("click", () => switchTab(button.dataset.tab)));
    els.guideSelect.addEventListener("change", () => renderGuide(els.guideSelect.value));
    els.computeBsBtn.addEventListener("click", computeSingleBs);
    els.continueToEesBtn.addEventListener("click", () => {
      els.eesSection.style.display = "block";
    });
    els.computeFullRecordBtn.addEventListener("click", computeSingleFullRecord);
    els.saveRecordBtn.addEventListener("click", addCurrentRecordToPortfolio);
    els.resetSingleBtn.addEventListener("click", resetSingle);

    els.importCsvBtn.addEventListener("click", async () => {
      const file = els.csvFileInput.files[0];
      if (!file) return;
      try {
        let result;
        if (isXlsxFile(file)) {
          const buffer = await file.arrayBuffer();
          result = importXlsxArrayBuffer(buffer);
        } else {
          const text = await file.text();
          result = importRowsFromCsvRows(parseCsv(text));
        }
        els.batchStatus.textContent = describeImportResult(result, `from ${file.name}`);
      } catch (err) {
        els.batchStatus.textContent = `Could not read ${file.name}: ${err.message}`;
      }
    });

    els.importPastedCsvBtn.addEventListener("click", () => {
      const text = els.csvPreview.value.trim();
      if (!text) return;
      const result = importRowsFromCsvRows(parseCsv(text));
      els.batchStatus.textContent = describeImportResult(result, "from pasted CSV text");
    });

    els.loadDemoBtn.addEventListener("click", loadDemoData);

    function clearPortfolio() {
      if (!portfolio.length) return;
      const confirmed = window.confirm(`Clear all ${portfolio.length} saved building(s) from this browser's portfolio? This cannot be undone.`);
      if (!confirmed) return;
      portfolio = [];
      savePortfolio();
      renderStats();
      renderDashboard();
      els.batchStatus.textContent = "Browser portfolio cleared.";
    }

    els.clearPortfolioBtn.addEventListener("click", clearPortfolio);
    if (els.clearPortfolioBtnSingle) {
      els.clearPortfolioBtnSingle.addEventListener("click", clearPortfolio);
    }

    els.recomputePortfolioBtn.addEventListener("click", recomputePortfolio);
    els.downloadPortfolioBtn.addEventListener("click", downloadPortfolioCsv);
    els.downloadPortfolioXlsxBtn.addEventListener("click", downloadPortfolioXlsx);
    [els.searchInput, els.filterRisk, els.filterStatus, els.filterSds].forEach((element) => {
      element.addEventListener("input", renderPortfolioTable);
      element.addEventListener("change", renderPortfolioTable);
    });
  }

  // Derived from HEADERS (and BS_FIELDS/EES_FIELDS order) rather than a separate
  // hardcoded list, so the displayed "Expected Headers", the CSV/XLSX parser, and the
  // downloaded file headers can never drift out of sync with one another again. Each
  // entry also carries the field definition so its valid values can be shown — in the
  // manual-entry form these are enforced by a dropdown, but a bulk-upload file has no
  // such constraint, so the exact accepted text needs to be spelled out here for scoring
  // to work correctly.
  function expectedHeaderList() {
    return [
      { header: "Building Name", field: BS_FIELDS.find((field) => field.key === "building_label") },
      ...BS_FIELDS.filter((field) => field.key !== "building_label").map((field) => ({ header: HEADERS[field.key], field })),
      ...EES_FIELDS.map((field) => ({ header: HEADERS[field.key], field })),
    ];
  }

  function renderExpectedHeaders() {
    const items = expectedHeaderList();
    els.expectedHeaders.innerHTML = `
      <div class="header-list">
        ${items
          .map(({ header, field }) => {
            const valuesText = field && field.options ? field.options.join(" | ") : "free text (any building name)";
            return `
              <div class="header-row">
                <div class="header-name">${escapeHtml(header)}</div>
                <div class="small header-values">Valid values: ${escapeHtml(valuesText)}</div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  renderFields(els.bsFields, BS_FIELDS, "bs");
  renderFields(els.eesFields, EES_FIELDS, "ees");
  buildGuideOptions();
  renderExpectedHeaders();
  bindEvents();
  recomputePortfolio();
})();
