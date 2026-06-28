import type { Product } from "./types";

/**
 * Product education content for the ASTROBSM line.
 *
 * Grounded in the official Bonnesante Medicals product documentation (ingredient
 * lists and reference set). Clinical statements map to the cited references in
 * `references.ts`. Official product photographs should be placed in
 * `apps/web/public/products/<slug>.jpg` and referenced via the `image` field;
 * until then a branded placeholder card is shown.
 */
export const products: Product[] = [
  {
    slug: "hera-wound-gel",
    name: "Hera Wound Gel",
    tagline: "Advanced moist-healing wound gel",
    category: "Topical Gel",
    summary:
      "A multi-ingredient topical wound gel that maintains a moist healing environment, supports antimicrobial control and promotes granulation across the wound-healing phases.",
    accent: "from-brand-honey/20 to-brand-gold/10",
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
        type: "ADVANTAGES",
        title: "Advantages",
        items: [
          "Maintains an optimal moist wound-healing environment.",
          "Broad antimicrobial support helps reduce bioburden.",
          "Multi-target action across inflammation, granulation and epithelialisation.",
          "Plant- and honey-based actives with documented wound-healing roles."
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
          "Spreading infection or systemic signs require clinical assessment and possible systemic therapy.",
          "Not a substitute for professional clinical judgement."
        ]
      },
      {
        type: "STORAGE",
        title: "Storage",
        items: [
          "Store in a cool, dry place away from direct sunlight.",
          "Keep out of reach of children. Do not use after the expiry date."
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
          "Frequency depends on exudate and wound condition; follow the clinician's wound-care plan. Heavily exuding wounds are reviewed more often."
      },
      {
        question: "Is it suitable for diabetic foot ulcers?",
        answer:
          "Yes, as part of a complete diabetic-foot care plan including offloading, glycaemic control and regular review."
      }
    ],
    references: [0, 1, 2, 4, 5, 6, 7, 8, 9, 11]
  },
  {
    slug: "wound-clex",
    name: "Wound-Clex Solution",
    tagline: "Gentle antimicrobial wound cleansing solution",
    category: "Cleansing",
    summary:
      "A wound irrigation and cleansing solution used to reduce surface contamination and prepare the wound bed before dressing.",
    accent: "from-brand-sky/20 to-brand-blue/10",
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
      },
      {
        type: "PRECAUTIONS",
        title: "Precautions",
        items: [
          "For external use only.",
          "Avoid contact with the eyes.",
          "Discontinue if irritation or hypersensitivity occurs."
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
    references: [3, 10]
  },
  {
    slug: "honey-gauze",
    name: "Wound-Care Honey Gauze",
    tagline: "Honey-impregnated contact dressing",
    category: "Dressing",
    summary:
      "A honey-impregnated gauze contact layer that maintains a moist, antimicrobial wound interface while allowing exudate management.",
    accent: "from-brand-honey/25 to-brand-gold/10",
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
    references: [0, 1, 2, 9]
  },
  {
    slug: "sterile-dressing-pack",
    name: "Sterile Dressing Pack",
    tagline: "Ready-to-use sterile dressing set",
    category: "Dressing",
    summary:
      "A convenient sterile pack containing the essentials for an aseptic dressing procedure in clinic or field settings.",
    accent: "from-slate-200 to-slate-100",
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
      },
      {
        type: "APPLICATION",
        title: "How to use",
        items: [
          "Open using aseptic technique on a clean surface.",
          "Use the contents to cleanse, apply topical agents and secure the dressing.",
          "Dispose of single-use items safely after the procedure."
        ]
      }
    ],
    faqs: [],
    references: []
  }
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}
