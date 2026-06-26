export type Locale = "en" | "fr";

export interface ProductSection {
  type:
    | "DESCRIPTION"
    | "MECHANISM"
    | "ADVANTAGES"
    | "INDICATIONS"
    | "APPLICATION"
    | "PRECAUTIONS"
    | "STORAGE";
  title: string;
  items: string[];
}

export interface Ingredient {
  name: string;
  percent?: string;
  role: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface Product {
  slug: string;
  name: string;
  tagline: string;
  category: "Dressing" | "Cleansing" | "Topical Gel";
  /** Short marketing summary */
  summary: string;
  /** Placeholder accent for the product card until official images are dropped in /public/products */
  accent: string;
  image?: string;
  ingredients: Ingredient[];
  sections: ProductSection[];
  faqs: FAQ[];
  /** indices into the references array */
  references: number[];
}

export interface ResearchReference {
  authors: string;
  title: string;
  journal: string;
  year: number;
  doi?: string;
  evidenceLevel:
    | "Systematic review / meta-analysis"
    | "Review"
    | "Laboratory / in-vitro"
    | "Clinical practice";
}
