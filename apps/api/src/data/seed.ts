import type { Product, ResearchReference } from "../domain/types";

const now = new Date().toISOString();

/**
 * Seed content grounded in the official Bonnesante Medicals product documentation.
 * In production this data lives in PostgreSQL (see prisma/schema.prisma); the
 * in-memory store is seeded from here so the API runs without a database during
 * development. Clinical claims map to the references below.
 */
export const seedReferences: ResearchReference[] = [
  {
    id: "ref-honey-immunomod",
    authors: "Majtán J.",
    title: "Honey: An immunomodulator in wound healing.",
    journal: "J Appl Biomed.",
    year: 2014,
    doi: "10.1016/j.jab.2014.01.001",
    source: "International Wound Journal",
    evidenceLevel: "Review",
    createdAt: now
  },
  {
    id: "ref-honey-meta",
    authors: "Sönmez MG, Canbilen A, Çetin K.",
    title:
      "Comparison of topical honey and povidone iodine-based dressings for wound healing: A systematic review and meta-analysis.",
    journal: "Int J Low Extrem Wounds.",
    year: 2022,
    doi: "10.1177/15347346211061438",
    source: "PubMed",
    evidenceLevel: "Systematic review / meta-analysis",
    createdAt: now
  },
  {
    id: "ref-honey-microbe",
    authors: "Olaitan PB, Adeleke OE, Ola IO.",
    title: "Honey: A reservoir for microorganisms and an inhibitory agent for microbes.",
    journal: "Afr Health Sci.",
    year: 2007,
    doi: "10.4314/ahs.v7i3.11736",
    source: "PubMed",
    evidenceLevel: "Laboratory / in-vitro",
    createdAt: now
  },
  {
    id: "ref-acetic-acid",
    authors: "Zhou X, Zhang X, Yang J, Liu H, Hu W, Wang C.",
    title:
      "Acetic acid treatment enhances wound healing in chronic wounds: Insights from clinical practices.",
    journal: "Ann Plast Surg.",
    year: 2021,
    doi: "10.1097/SAP.0000000000002583",
    source: "PubMed",
    evidenceLevel: "Clinical practice",
    createdAt: now
  },
  {
    id: "ref-beta-sitosterol",
    authors: "Lee H, Lee YH, Park SA, Ko JH.",
    title:
      "Beta-sitosterol promotes dermal fibroblast activity and enhances wound closure in vitro.",
    journal: "J Dermatol Sci.",
    year: 2020,
    doi: "10.1016/j.jdermsci.2020.01.001",
    source: "PubMed",
    evidenceLevel: "Laboratory / in-vitro",
    createdAt: now
  },
  {
    id: "ref-phellodendron",
    authors: "Park JH, Han M, Kang J.",
    title:
      "Phellodendron amurense bark extract inhibits inflammation in LPS-stimulated macrophages by suppressing NF-κB activation.",
    journal: "Biomed Res Int.",
    year: 2018,
    doi: "10.1155/2018/7156294",
    source: "PubMed",
    evidenceLevel: "Laboratory / in-vitro",
    createdAt: now
  },
  {
    id: "ref-scutellaria",
    authors: "Gao Z, Xu H, Huang K, Zhao Y.",
    title:
      "Antioxidant and anti-inflammatory activities of Scutellaria baicalensis Georgi: Therapeutic potential for wound healing.",
    journal: "J Ethnopharmacol.",
    year: 2021,
    doi: "10.1016/j.jep.2021.114003",
    source: "PubMed",
    evidenceLevel: "Laboratory / in-vitro",
    createdAt: now
  },
  {
    id: "ref-coptis",
    authors: "Li Y, Sun Y, Xie Q, et al.",
    title:
      "Antibacterial activity of Coptis chinensis Franch against Staphylococcus aureus including MRSA.",
    journal: "J Ethnopharmacol.",
    year: 2018,
    doi: "10.1016/j.jep.2017.11.002",
    source: "PubMed",
    evidenceLevel: "Laboratory / in-vitro",
    createdAt: now
  },
  {
    id: "ref-earthworm",
    authors: "Wang Z, Liu J, Yin H, Ma L.",
    title: "Earthworm extract enhances fibroblast migration and proliferation in wound healing.",
    journal: "Biol Pharm Bull.",
    year: 2020,
    doi: "10.1248/bpb.b19-00773",
    source: "PubMed",
    evidenceLevel: "Laboratory / in-vitro",
    createdAt: now
  },
  {
    id: "ref-beeswax",
    authors: "Khalil MI, Sulaiman SA.",
    title: "Beeswax: A natural barrier agent for wound healing and skin protection.",
    journal: "Am J Pharm Toxicol.",
    year: 2021,
    doi: "10.3923/ajpt.2021.192.198",
    source: "Review",
    evidenceLevel: "Review",
    createdAt: now
  },
  {
    id: "ref-povidone",
    authors: "Murata M, Shimizu Y, Ueda T.",
    title:
      "Povidone iodine in wound healing: A review of its antimicrobial and wound healing efficacy.",
    journal: "J Wound Care.",
    year: 2019,
    doi: "10.12968/jowc.2019.28.12.803",
    source: "Wounds International",
    evidenceLevel: "Review",
    createdAt: now
  },
  {
    id: "ref-sesame",
    authors: "Furuya K, Takahara T, Mori K, Kamei Y.",
    title: "Sesame oil as an adjuvant to enhance the permeability of wound healing agents.",
    journal: "Int J Dermatol.",
    year: 2020,
    doi: "10.1111/ijd.14957",
    source: "PubMed",
    evidenceLevel: "Laboratory / in-vitro",
    createdAt: now
  }
];

export const seedProducts: Product[] = [
  {
    id: "prod-hera-wound-gel",
    slug: "hera-wound-gel",
    name: "Hera Wound Gel",
    tagline: "Advanced moist-healing wound gel",
    category: "Topical Gel",
    summary:
      "A multi-ingredient topical wound gel that maintains a moist healing environment, supports antimicrobial control and promotes granulation across the wound-healing phases.",
    status: "PUBLISHED",
    image: "/products/hera-wound-gel.jpg",
    ingredients: [
      { name: "Honey", role: "Osmotic antimicrobial & immunomodulator" },
      { name: "Beta-sitosterol", role: "Promotes fibroblast activity / wound closure" },
      { name: "Phellodendron amurense bark extract", role: "Anti-inflammatory" },
      { name: "Scutellaria baicalensis", role: "Antioxidant & anti-inflammatory" },
      { name: "Coptis chinensis", role: "Antibacterial (incl. MRSA)" },
      { name: "Earthworm extract", role: "Fibroblast migration & proliferation" },
      { name: "Beeswax", role: "Barrier & moisture retention" },
      { name: "Sesame oil", role: "Permeability adjuvant / carrier" }
    ],
    sections: [
      {
        type: "DESCRIPTION",
        title: "Description",
        items: [
          "Hera Wound Gel is an advanced topical preparation that keeps the wound bed moist while delivering antimicrobial and anti-inflammatory botanicals.",
          "Formulated to support all phases of wound healing — haemostasis, inflammation, proliferation and remodelling."
        ]
      },
      {
        type: "MECHANISM",
        title: "Mechanism of action",
        items: [
          "Honey provides an osmotic, low-pH antimicrobial environment and immunomodulatory support.",
          "Coptis chinensis and honey contribute antibacterial action including against Staphylococcus aureus / MRSA.",
          "Scutellaria baicalensis and Phellodendron amurense reduce oxidative stress and inflammation.",
          "Beta-sitosterol and earthworm extract stimulate fibroblast activity, migration and wound closure.",
          "Beeswax and sesame oil maintain a protective, moist barrier and aid delivery of active ingredients."
        ]
      },
      {
        type: "INDICATIONS",
        title: "Indications",
        items: [
          "Acute and chronic wounds requiring a moist healing environment.",
          "Diabetic foot ulcers, pressure injuries and venous leg ulcers (as part of a full care plan).",
          "Surgical wounds, burns and abrasions.",
          "Sloughy or contaminated wounds needing antimicrobial support."
        ]
      },
      {
        type: "APPLICATION",
        title: "How to use",
        items: [
          "Clean the wound (e.g. with Wound-Clex solution) and gently pat the surrounding skin dry.",
          "Apply a layer of Hera Wound Gel evenly over the wound bed.",
          "Cover with an appropriate secondary dressing (e.g. ASTROBSM Honey Gauze / sterile dressing pack).",
          "Change according to wound condition and exudate level, or as directed by the clinician."
        ]
      },
      {
        type: "PRECAUTIONS",
        title: "Precautions",
        items: [
          "For external use only.",
          "Discontinue if signs of hypersensitivity occur.",
          "Spreading infection or systemic signs require clinical assessment and possible systemic therapy."
        ]
      }
    ],
    faqs: [
      {
        question: "Can Hera Wound Gel be used on infected wounds?",
        answer:
          "It provides antimicrobial support to reduce bioburden, but spreading or systemic infection still requires clinical assessment and may need systemic antibiotics."
      },
      {
        question: "How often should the gel be changed?",
        answer:
          "Frequency depends on exudate and wound condition; follow the clinician's wound-care plan."
      }
    ],
    references: [
      "ref-honey-immunomod",
      "ref-honey-meta",
      "ref-honey-microbe",
      "ref-beta-sitosterol",
      "ref-phellodendron",
      "ref-scutellaria",
      "ref-coptis",
      "ref-earthworm",
      "ref-beeswax",
      "ref-povidone"
    ],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prod-wound-clex",
    slug: "wound-clex",
    name: "Wound-Clex Solution",
    tagline: "Gentle antimicrobial wound cleansing solution",
    category: "Cleansing",
    summary:
      "A wound irrigation and cleansing solution used to reduce surface contamination and prepare the wound bed before dressing.",
    status: "PUBLISHED",
    image: "/products/wound-clex.jpg",
    ingredients: [
      { name: "Antimicrobial cleansing agents", role: "Reduce surface bioburden" }
    ],
    sections: [
      {
        type: "DESCRIPTION",
        title: "Description",
        items: [
          "Wound-Clex is a cleansing/irrigation solution designed to remove debris and reduce surface microbial load, preparing the wound bed for dressing."
        ]
      },
      {
        type: "INDICATIONS",
        title: "Indications",
        items: [
          "Routine cleansing of acute and chronic wounds.",
          "Wound-bed preparation prior to application of Hera Wound Gel and dressings.",
          "Irrigation of contaminated or sloughy wounds."
        ]
      },
      {
        type: "APPLICATION",
        title: "How to use",
        items: [
          "Irrigate or gently cleanse the wound and surrounding skin.",
          "Remove loose debris and slough as appropriate.",
          "Proceed with topical gel and secondary dressing."
        ]
      }
    ],
    faqs: [
      {
        question: "Does Wound-Clex replace the dressing?",
        answer:
          "No. It cleanses and prepares the wound bed; a topical agent and dressing are then applied."
      }
    ],
    references: ["ref-acetic-acid", "ref-povidone"],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prod-honey-gauze",
    slug: "honey-gauze",
    name: "Wound-Care Honey Gauze",
    tagline: "Honey-impregnated contact dressing",
    category: "Dressing",
    summary:
      "A honey-impregnated gauze contact layer that maintains a moist, antimicrobial wound interface while allowing exudate management.",
    status: "PUBLISHED",
    image: "/products/honey-gauze.jpg",
    ingredients: [
      { name: "Medical honey", role: "Osmotic antimicrobial wound interface" },
      { name: "Gauze carrier", role: "Conformable contact layer" }
    ],
    sections: [
      {
        type: "DESCRIPTION",
        title: "Description",
        items: [
          "A honey-impregnated gauze used as a wound contact layer to keep the interface moist and antimicrobial."
        ]
      },
      {
        type: "INDICATIONS",
        title: "Indications",
        items: [
          "Sloughy, contaminated or malodorous wounds.",
          "Wounds benefiting from a moist, antimicrobial contact layer.",
          "Use with Hera Wound Gel and a secondary dressing."
        ]
      },
      {
        type: "APPLICATION",
        title: "How to use",
        items: [
          "Cleanse the wound with Wound-Clex.",
          "Apply the honey gauze directly to the wound bed.",
          "Cover with a secondary absorbent dressing and secure.",
          "Change according to exudate level and wound condition."
        ]
      }
    ],
    faqs: [
      {
        question: "Why honey in a dressing?",
        answer:
          "Honey creates an osmotic, low-pH antimicrobial environment and supports autolytic debridement of slough."
      }
    ],
    references: ["ref-honey-immunomod", "ref-honey-meta", "ref-honey-microbe", "ref-beeswax"],
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prod-sterile-dressing-pack",
    slug: "sterile-dressing-pack",
    name: "Sterile Dressing Pack",
    tagline: "Ready-to-use sterile dressing set",
    category: "Dressing",
    summary:
      "A convenient sterile pack containing the essentials for an aseptic dressing procedure in clinic or field settings.",
    status: "PUBLISHED",
    image: "/products/sterile-dressing-pack.jpg",
    ingredients: [],
    sections: [
      {
        type: "DESCRIPTION",
        title: "Description",
        items: [
          "Sterile, single-use dressing pack supporting aseptic technique for wound dressing changes."
        ]
      },
      {
        type: "INDICATIONS",
        title: "Indications",
        items: [
          "Aseptic dressing changes for acute and chronic wounds.",
          "Field and clinic procedures where a ready sterile set is needed."
        ]
      }
    ],
    faqs: [],
    references: [],
    createdAt: now,
    updatedAt: now
  }
];
