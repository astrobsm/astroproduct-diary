import type { ResearchReference } from "./types";

/**
 * References transcribed from the official ASTROBSM "Wound Care Information"
 * product document (Hera Wound Gel reference list). These are the citations the
 * company already relies on. Additional peer-reviewed evidence will be imported
 * and evidence-graded through the Research Knowledge Engine (Phase 2) rather than
 * hand-entered here.
 */
export const references: ResearchReference[] = [
  {
    authors: "Majtán J.",
    title: "Honey: An immunomodulator in wound healing.",
    journal: "J Appl Biomed.",
    year: 2014,
    doi: "10.1016/j.jab.2014.01.001",
    evidenceLevel: "Review"
  },
  {
    authors: "Sönmez MG, Canbilen A, Çetin K.",
    title:
      "Comparison of topical honey and povidone iodine-based dressings for wound healing: A systematic review and meta-analysis.",
    journal: "Int J Low Extrem Wounds.",
    year: 2022,
    doi: "10.1177/15347346211061438",
    evidenceLevel: "Systematic review / meta-analysis"
  },
  {
    authors: "Olaitan PB, Adeleke OE, Ola IO.",
    title: "Honey: A reservoir for microorganisms and an inhibitory agent for microbes.",
    journal: "Afr Health Sci.",
    year: 2007,
    doi: "10.4314/ahs.v7i3.11736",
    evidenceLevel: "Laboratory / in-vitro"
  },
  {
    authors: "Zhou X, Zhang X, Yang J, Liu H, Hu W, Wang C.",
    title:
      "Acetic acid treatment enhances wound healing in chronic wounds: Insights from clinical practices.",
    journal: "Ann Plast Surg.",
    year: 2021,
    doi: "10.1097/SAP.0000000000002583",
    evidenceLevel: "Clinical practice"
  },
  {
    authors: "Lee H, Lee YH, Park SA, Ko JH.",
    title:
      "Beta-sitosterol promotes dermal fibroblast activity and enhances wound closure in vitro.",
    journal: "J Dermatol Sci.",
    year: 2020,
    doi: "10.1016/j.jdermsci.2020.01.001",
    evidenceLevel: "Laboratory / in-vitro"
  },
  {
    authors: "Park JH, Han M, Kang J.",
    title:
      "Phellodendron amurense bark extract inhibits inflammation in LPS-stimulated macrophages by suppressing NF-κB activation.",
    journal: "Biomed Res Int.",
    year: 2018,
    doi: "10.1155/2018/7156294",
    evidenceLevel: "Laboratory / in-vitro"
  },
  {
    authors: "Gao Z, Xu H, Huang K, Zhao Y.",
    title:
      "Antioxidant and anti-inflammatory activities of Scutellaria baicalensis Georgi: Therapeutic potential for wound healing.",
    journal: "J Ethnopharmacol.",
    year: 2021,
    doi: "10.1016/j.jep.2021.114003",
    evidenceLevel: "Laboratory / in-vitro"
  },
  {
    authors: "Li Y, Sun Y, Xie Q, et al.",
    title:
      "Antibacterial activity of Coptis chinensis Franch against Staphylococcus aureus including MRSA.",
    journal: "J Ethnopharmacol.",
    year: 2018,
    doi: "10.1016/j.jep.2017.11.002",
    evidenceLevel: "Laboratory / in-vitro"
  },
  {
    authors: "Wang Z, Liu J, Yin H, Ma L.",
    title:
      "Earthworm extract enhances fibroblast migration and proliferation in wound healing.",
    journal: "Biol Pharm Bull.",
    year: 2020,
    doi: "10.1248/bpb.b19-00773",
    evidenceLevel: "Laboratory / in-vitro"
  },
  {
    authors: "Khalil MI, Sulaiman SA.",
    title: "Beeswax: A natural barrier agent for wound healing and skin protection.",
    journal: "Am J Pharm Toxicol.",
    year: 2021,
    doi: "10.3923/ajpt.2021.192.198",
    evidenceLevel: "Review"
  },
  {
    authors: "Murata M, Shimizu Y, Ueda T.",
    title:
      "Povidone iodine in wound healing: A review of its antimicrobial and wound healing efficacy.",
    journal: "J Wound Care.",
    year: 2019,
    doi: "10.12968/jowc.2019.28.12.803",
    evidenceLevel: "Review"
  },
  {
    authors: "Furuya K, Takahara T, Mori K, Kamei Y.",
    title: "Sesame oil as an adjuvant to enhance the permeability of wound healing agents.",
    journal: "Int J Dermatol.",
    year: 2020,
    doi: "10.1111/ijd.14957",
    evidenceLevel: "Laboratory / in-vitro"
  }
];
