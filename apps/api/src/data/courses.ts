import type { Course } from "../domain/types";

const now = new Date().toISOString();

/**
 * Seed courses for the ASTROBSM Academy LMS. Content is grounded in the official
 * Bonnesante Medicals product range (HERA Wound Gel, WoundClex, Honey Gauze,
 * Sterile Dressing Pack) and established wound-care practice. In production this
 * data lives in PostgreSQL; the in-memory store is seeded from here for dev.
 *
 * Quiz `correct` indices are never serialised to learners — routes strip them
 * before responding and grade attempts server-side.
 */
export const seedCourses: Course[] = [
  {
    id: "course-wound-foundations",
    slug: "wound-care-foundations",
    title: "Wound Care Foundations & the TIME Framework",
    description:
      "Build a clinical baseline for modern wound management: healing phases, wound bed preparation, and how the TIME framework guides dressing selection across the ASTROBSM range.",
    audience: "CLINICAL",
    level: "FOUNDATION",
    accent: "#2f6fed",
    durationMins: 45,
    published: true,
    modules: [
      {
        id: "mod-wf-1",
        title: "Principles of Wound Healing",
        summary: "The four phases of healing and what stalls them.",
        lessons: [
          {
            id: "les-wf-1-1",
            title: "The Four Phases of Healing",
            contentType: "TEXT",
            durationMins: 8,
            body:
              "Acute wounds progress through haemostasis, inflammation, proliferation and remodelling. " +
              "Chronic wounds stall — most often in a prolonged inflammatory phase driven by infection, " +
              "necrotic tissue, ischaemia or repetitive trauma. Recognising the stalled phase is the first " +
              "step in choosing an intervention that moves the wound forward."
          },
          {
            id: "les-wf-1-2",
            title: "Moist Wound Healing",
            contentType: "TEXT",
            durationMins: 7,
            body:
              "A balanced moist wound environment accelerates epithelialisation, supports autolytic " +
              "debridement and reduces pain at dressing change. The goal is moisture balance — neither " +
              "desiccation nor maceration. ASTROBSM hydro-active dressings are designed to hold this balance."
          }
        ]
      },
      {
        id: "mod-wf-2",
        title: "Wound Bed Preparation: TIME",
        summary: "Tissue, Infection/Inflammation, Moisture, Edge.",
        lessons: [
          {
            id: "les-wf-2-1",
            title: "Applying the TIME Framework",
            contentType: "TEXT",
            durationMins: 10,
            body:
              "TIME structures assessment: T — remove non-viable Tissue; I — control Infection and " +
              "inflammation; M — balance Moisture; E — advance the wound Edge. Each domain maps to a " +
              "product decision: debridement gels for T, antimicrobial dressings for I, absorbent or " +
              "hydrating dressings for M, and protectants for E."
          },
          {
            id: "les-wf-2-2",
            title: "Matching ASTROBSM Products to TIME",
            contentType: "TEXT",
            durationMins: 10,
            body:
              "HERA Wound Gel supports autolytic debridement and moisture balance (T, M). WoundClex aids " +
              "cleansing and bioburden control (I). Honey Gauze offers antimicrobial, moist-healing cover " +
              "(I, M). The Sterile Dressing Pack standardises aseptic technique at every change."
          }
        ]
      }
    ],
    quiz: {
      id: "quiz-wound-foundations",
      title: "Wound Care Foundations Assessment",
      passScore: 70,
      questions: [
        {
          id: "q-wf-1",
          prompt: "Which phase of healing do chronic wounds most often stall in?",
          type: "SINGLE",
          options: ["Haemostasis", "Inflammation", "Proliferation", "Remodelling"],
          correct: [1],
          explanation:
            "Chronic wounds typically remain in a prolonged inflammatory phase due to infection, necrosis or ischaemia."
        },
        {
          id: "q-wf-2",
          prompt: "What does the 'M' in the TIME framework represent?",
          type: "SINGLE",
          options: ["Mobility", "Moisture balance", "Maceration", "Microbiology"],
          correct: [1],
          explanation: "M stands for Moisture balance — avoiding both desiccation and maceration."
        },
        {
          id: "q-wf-3",
          prompt: "Select the products that primarily support infection/bioburden control (I).",
          type: "MULTI",
          options: ["HERA Wound Gel", "WoundClex", "Honey Gauze", "Sterile Dressing Pack"],
          correct: [1, 2],
          explanation: "WoundClex aids cleansing/bioburden control and Honey Gauze provides antimicrobial cover."
        },
        {
          id: "q-wf-4",
          prompt: "Moist wound healing increases the rate of epithelialisation.",
          type: "TRUE_FALSE",
          options: ["True", "False"],
          correct: [0],
          explanation: "A balanced moist environment accelerates epithelialisation and autolytic debridement."
        }
      ]
    },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "course-consultative-selling",
    slug: "consultative-selling",
    title: "Consultative Selling for Wound-Care Solutions",
    description:
      "Move from feature-pitching to clinical partnership. Learn a discovery-led sales method that ties ASTROBSM products to measurable patient and facility outcomes.",
    audience: "SALES",
    level: "FOUNDATION",
    accent: "#39a0e0",
    durationMins: 40,
    published: true,
    modules: [
      {
        id: "mod-cs-1",
        title: "Discovery & Needs Analysis",
        lessons: [
          {
            id: "les-cs-1-1",
            title: "Asking Clinically Credible Questions",
            contentType: "TEXT",
            durationMins: 9,
            body:
              "Credibility comes from speaking the buyer's language. Anchor discovery on wound types seen, " +
              "current protocols, dressing-change frequency, healing times and cost per healed wound. " +
              "Listen for the stalled TIME domain — it points directly to the right ASTROBSM solution."
          }
        ]
      },
      {
        id: "mod-cs-2",
        title: "Value Framing & Objection Handling",
        lessons: [
          {
            id: "les-cs-2-1",
            title: "Total Cost of Care, Not Unit Price",
            contentType: "TEXT",
            durationMins: 9,
            body:
              "Frame value on total cost of care: fewer dressing changes, reduced nursing time, shorter " +
              "healing trajectories and lower complication rates. A higher-performing dressing that halves " +
              "change frequency often lowers total cost despite a higher unit price."
          },
          {
            id: "les-cs-2-2",
            title: "Handling the Price Objection",
            contentType: "TEXT",
            durationMins: 8,
            body:
              "When you hear 'too expensive', reframe to outcomes and evidence. Never disparage competitors; " +
              "compare on documented performance and the facility's own healing-rate data where available."
          }
        ]
      }
    ],
    quiz: {
      id: "quiz-consultative-selling",
      title: "Consultative Selling Assessment",
      passScore: 70,
      questions: [
        {
          id: "q-cs-1",
          prompt: "Consultative selling is best anchored on which of the following?",
          type: "SINGLE",
          options: [
            "The lowest unit price",
            "Discovery of the buyer's clinical and cost context",
            "The longest feature list",
            "Competitor weaknesses"
          ],
          correct: [1],
          explanation: "Discovery-led selling ties products to the buyer's actual clinical and cost context."
        },
        {
          id: "q-cs-2",
          prompt: "Which value frame is most persuasive to a facility buyer?",
          type: "SINGLE",
          options: ["Unit price", "Total cost of care", "Packaging design", "Brand age"],
          correct: [1],
          explanation: "Total cost of care captures change frequency, nursing time and healing trajectory."
        },
        {
          id: "q-cs-3",
          prompt: "It is good practice to disparage competitor products to win a deal.",
          type: "TRUE_FALSE",
          options: ["True", "False"],
          correct: [1],
          explanation: "Compete on documented performance and evidence, never by disparaging competitors."
        }
      ]
    },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "course-customer-care",
    slug: "customer-care-excellence",
    title: "Customer Care Excellence for Clinical Buyers",
    description:
      "Deliver responsive, accurate and compliant support to hospitals, pharmacies and distributors across the ASTROBSM network.",
    audience: "CUSTOMER_CARE",
    level: "FOUNDATION",
    accent: "#e8a23d",
    durationMins: 30,
    published: true,
    modules: [
      {
        id: "mod-cc-1",
        title: "Service Standards",
        lessons: [
          {
            id: "les-cc-1-1",
            title: "Response Times & Escalation",
            contentType: "TEXT",
            durationMins: 7,
            body:
              "Acknowledge every enquiry within one business day. Triage clinical questions to a qualified " +
              "colleague; never improvise clinical advice. Log every interaction so the next contact has full context."
          },
          {
            id: "les-cc-1-2",
            title: "Handling Product Complaints",
            contentType: "TEXT",
            durationMins: 7,
            body:
              "Treat complaints as quality signals. Capture lot number, expiry, the issue and patient impact, " +
              "then route to quality assurance. Adverse events tied to a device must follow the formal " +
              "vigilance process — speed and accuracy protect patients and the brand."
          }
        ]
      }
    ],
    quiz: {
      id: "quiz-customer-care",
      title: "Customer Care Assessment",
      passScore: 70,
      questions: [
        {
          id: "q-cc-1",
          prompt: "What is the maximum target window to acknowledge an enquiry?",
          type: "SINGLE",
          options: ["One business day", "One week", "One hour guaranteed", "No target"],
          correct: [0],
          explanation: "Acknowledge every enquiry within one business day."
        },
        {
          id: "q-cc-2",
          prompt: "A customer care agent should give clinical treatment advice directly when asked.",
          type: "TRUE_FALSE",
          options: ["True", "False"],
          correct: [1],
          explanation: "Clinical questions must be triaged to a qualified colleague; never improvise clinical advice."
        },
        {
          id: "q-cc-3",
          prompt: "Which details should be captured for a product complaint?",
          type: "MULTI",
          options: ["Lot number", "Expiry date", "The reported issue", "The customer's favourite colour"],
          correct: [0, 1, 2],
          explanation: "Lot, expiry and the issue are essential for quality assurance and vigilance."
        }
      ]
    },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "course-evidence-marketing",
    slug: "evidence-based-marketing",
    title: "Evidence-Based Marketing & Compliance",
    description:
      "Create compelling, defensible marketing for medical devices. Learn what claims you can make, how to cite evidence, and how to stay within regulatory and ethical boundaries.",
    audience: "MARKETING",
    level: "INTERMEDIATE",
    accent: "#1e2a78",
    durationMins: 50,
    published: true,
    modules: [
      {
        id: "mod-em-1",
        title: "Claims & Evidence",
        lessons: [
          {
            id: "les-em-1-1",
            title: "Substantiating Every Claim",
            contentType: "TEXT",
            durationMins: 10,
            body:
              "Every performance claim must trace to evidence: a citation, internal validation or regulatory " +
              "clearance. Match the strength of the claim to the strength of the evidence — a meta-analysis " +
              "supports stronger language than a single in-vitro study. The ASTROBSM evidence library is the " +
              "single source of truth for citations."
          },
          {
            id: "les-em-1-2",
            title: "Provenance & Source Hierarchy",
            contentType: "TEXT",
            durationMins: 10,
            body:
              "Rank evidence: systematic reviews and meta-analyses outrank RCTs, which outrank reviews and " +
              "in-vitro work. Always provide a DOI or URL so claims are auditable. Never publish a claim that " +
              "lacks verifiable provenance."
          }
        ]
      }
    ],
    quiz: {
      id: "quiz-evidence-marketing",
      title: "Evidence-Based Marketing Assessment",
      passScore: 80,
      questions: [
        {
          id: "q-em-1",
          prompt: "Which evidence type best supports the strongest marketing claim?",
          type: "SINGLE",
          options: ["Single in-vitro study", "Expert opinion", "Systematic review / meta-analysis", "Anecdote"],
          correct: [2],
          explanation: "Systematic reviews and meta-analyses sit at the top of the evidence hierarchy."
        },
        {
          id: "q-em-2",
          prompt: "A claim may be published without a verifiable source if it sounds reasonable.",
          type: "TRUE_FALSE",
          options: ["True", "False"],
          correct: [1],
          explanation: "Every claim needs verifiable provenance — a DOI or URL — before publication."
        }
      ]
    },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "course-market-expansion",
    slug: "market-expansion-strategy",
    title: "Market Expansion Strategy: Sub-Saharan Africa",
    description:
      "An executive view of scaling ASTROBSM across Sub-Saharan markets: regulatory pathways, channel design, pricing for access, and building distributor trust.",
    audience: "EXECUTIVE",
    level: "ADVANCED",
    accent: "#c98a16",
    durationMins: 55,
    published: true,
    modules: [
      {
        id: "mod-me-1",
        title: "Market Entry & Regulation",
        lessons: [
          {
            id: "les-me-1-1",
            title: "Regulatory Pathways by Country",
            contentType: "TEXT",
            durationMins: 12,
            body:
              "Each market has its own device registration regime. Map the regulator, dossier requirements " +
              "and timelines before committing channel investment. Registration is the long pole — sequence " +
              "market entry around it, prioritising countries with clearer pathways and existing demand."
          }
        ]
      },
      {
        id: "mod-me-2",
        title: "Channel & Pricing",
        lessons: [
          {
            id: "les-me-2-1",
            title: "Pricing for Access",
            contentType: "TEXT",
            durationMins: 12,
            body:
              "Access pricing balances affordability with margin to sustain distribution. Tiered pricing, " +
              "pack-size engineering and locally held stock reduce the landed cost barrier while protecting " +
              "the brand's premium clinical positioning."
          }
        ]
      }
    ],
    quiz: {
      id: "quiz-market-expansion",
      title: "Market Expansion Assessment",
      passScore: 70,
      questions: [
        {
          id: "q-me-1",
          prompt: "Why is device registration described as 'the long pole' in market entry?",
          type: "SINGLE",
          options: [
            "It is the cheapest step",
            "Its timeline often gates everything else",
            "It is optional in most markets",
            "It only applies to exports"
          ],
          correct: [1],
          explanation: "Registration timelines typically gate channel investment and launch sequencing."
        },
        {
          id: "q-me-2",
          prompt: "Which levers help reduce the landed-cost barrier without abandoning premium positioning?",
          type: "MULTI",
          options: ["Tiered pricing", "Pack-size engineering", "Locally held stock", "Removing all evidence claims"],
          correct: [0, 1, 2],
          explanation: "Tiered pricing, pack-size engineering and local stock lower access cost while protecting positioning."
        }
      ]
    },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "course-distributor-onboarding",
    slug: "distributor-onboarding",
    title: "Distributor Onboarding & Product Handling",
    description:
      "Everything a new ASTROBSM distributor needs: product range, storage and handling, order flow, and the standards expected of a brand partner.",
    audience: "DISTRIBUTOR",
    level: "FOUNDATION",
    accent: "#2f6fed",
    durationMins: 35,
    published: true,
    modules: [
      {
        id: "mod-do-1",
        title: "Product Range & Handling",
        lessons: [
          {
            id: "les-do-1-1",
            title: "Storage, Shelf-Life & Stock Rotation",
            contentType: "TEXT",
            durationMins: 9,
            body:
              "Store products per the label: cool, dry and out of direct sunlight, with sterile packs kept " +
              "intact and dry. Rotate stock first-expiry-first-out (FEFO). Never dispatch product with a " +
              "compromised sterile barrier or past its expiry date."
          }
        ]
      }
    ],
    quiz: {
      id: "quiz-distributor-onboarding",
      title: "Distributor Onboarding Assessment",
      passScore: 70,
      questions: [
        {
          id: "q-do-1",
          prompt: "Which stock-rotation principle should distributors follow?",
          type: "SINGLE",
          options: ["Last in, first out", "First-expiry-first-out (FEFO)", "Random", "Largest pack first"],
          correct: [1],
          explanation: "FEFO ensures product nearest expiry ships first, reducing waste and risk."
        },
        {
          id: "q-do-2",
          prompt: "A sterile pack with a compromised barrier may still be dispatched if it looks clean.",
          type: "TRUE_FALSE",
          options: ["True", "False"],
          correct: [1],
          explanation: "Never dispatch product with a compromised sterile barrier — sterility cannot be assumed."
        }
      ]
    },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "course-tot-facilitation",
    slug: "training-of-trainers",
    title: "Training-of-Trainers: Facilitation Mastery",
    description:
      "Equip experienced staff to teach others. Design sessions, facilitate adult learners, and assess competency so ASTROBSM knowledge scales reliably across regions.",
    audience: "TOT",
    level: "ADVANCED",
    accent: "#39a0e0",
    durationMins: 60,
    published: true,
    modules: [
      {
        id: "mod-tot-1",
        title: "Adult Learning Principles",
        lessons: [
          {
            id: "les-tot-1-1",
            title: "How Adults Learn",
            contentType: "TEXT",
            durationMins: 12,
            body:
              "Adults learn best when content is relevant, problem-centred and draws on their experience. " +
              "Favour active practice over lecture, give immediate feedback, and connect every module to a " +
              "real task the learner faces — for ASTROBSM trainers, that means live wound-care and sales scenarios."
          }
        ]
      },
      {
        id: "mod-tot-2",
        title: "Assessing Competency",
        lessons: [
          {
            id: "les-tot-2-1",
            title: "From Knowledge to Demonstrated Skill",
            contentType: "TEXT",
            durationMins: 12,
            body:
              "Knowledge checks confirm understanding; competency requires observed performance against a " +
              "rubric. Certify a trainer only after they demonstrate both accurate content and effective " +
              "facilitation with a real audience."
          }
        ]
      },
      {
        id: "mod-tot-3",
        title: "Designing a Training Session",
        summary: "Turn objectives into a structured, time-boxed lesson plan.",
        lessons: [
          {
            id: "les-tot-3-1",
            title: "Writing Measurable Learning Objectives",
            contentType: "TEXT",
            durationMins: 10,
            body:
              "Start every session with objectives the learner can demonstrate. Use action verbs (identify, " +
              "select, demonstrate, justify) and avoid vague verbs like 'understand' or 'know'. A strong " +
              "objective names the behaviour, the condition and the standard — e.g. 'Given a chronic wound " +
              "scenario, select the correct ASTROBSM product for each TIME domain with 100% accuracy.' " +
              "Objectives drive content, activities and assessment alike."
          },
          {
            id: "les-tot-3-2",
            title: "The ADDIE Design Loop",
            contentType: "TEXT",
            durationMins: 10,
            body:
              "ADDIE structures design: Analyse the audience and gap, Design objectives and assessment, " +
              "Develop materials, Implement the session, and Evaluate impact. For ASTROBSM trainers, analysis " +
              "means knowing whether the room is sales, clinical or distributor staff — the same product is " +
              "framed differently for each. Build once, then adapt the framing per audience."
          },
          {
            id: "les-tot-3-3",
            title: "Building a Time-Boxed Lesson Plan",
            contentType: "TEXT",
            durationMins: 9,
            body:
              "A reliable session rhythm is 10/70/20: 10% hook and objectives, 70% guided practice, 20% " +
              "summary and assessment. Plan transitions, allocate minutes to each activity, and always leave " +
              "a buffer. Over-planned content is the most common cause of rushed, low-retention sessions."
          }
        ]
      },
      {
        id: "mod-tot-4",
        title: "Facilitation Techniques & Engagement",
        summary: "Run the room: questioning, demonstration, and difficult participants.",
        lessons: [
          {
            id: "les-tot-4-1",
            title: "Questioning & Active Participation",
            contentType: "TEXT",
            durationMins: 9,
            body:
              "Use open questions to surface thinking and check questions to confirm transfer. Apply " +
              "think-pair-share for safe participation, and 'pose-pause-pounce-bounce' to spread questions " +
              "across the room rather than rewarding the fastest hand. Silence after a question is a tool — " +
              "give learners time to think before you fill the gap."
          },
          {
            id: "les-tot-4-2",
            title: "Demonstration & Skills Practice",
            contentType: "TEXT",
            durationMins: 10,
            body:
              "For procedural skills — aseptic dressing change, product application — use 'I do, we do, you " +
              "do': demonstrate at full speed, then slowly with narration, then coach the learner through it. " +
              "Never certify a skill from a slide; competency is observed at the bench, against a checklist."
          },
          {
            id: "les-tot-4-3",
            title: "Managing Difficult Participants",
            contentType: "TEXT",
            durationMins: 9,
            body:
              "Redirect the dominator with 'let's hear from someone we haven't heard from'. Draw in the quiet " +
              "learner with low-stakes pair work. With the sceptic, ask for the evidence threshold they would " +
              "accept, then meet it from the ASTROBSM evidence library. Protect psychological safety — correct " +
              "the idea, never belittle the person."
          }
        ]
      },
      {
        id: "mod-tot-5",
        title: "Coaching, Feedback & Evaluation",
        summary: "Feedback models and measuring real training impact.",
        lessons: [
          {
            id: "les-tot-5-1",
            title: "Giving Feedback that Changes Behaviour",
            contentType: "TEXT",
            durationMins: 9,
            body:
              "Use a situation-behaviour-impact model: describe the specific situation, the observable " +
              "behaviour, and its impact — then agree one concrete next step. Feedback is most effective when " +
              "it is timely, specific and balanced, and when the learner does most of the reflecting."
          },
          {
            id: "les-tot-5-2",
            title: "Evaluating Training with Kirkpatrick",
            contentType: "TEXT",
            durationMins: 10,
            body:
              "Measure four levels: Reaction (did they value it?), Learning (did scores improve?), Behaviour " +
              "(did practice change on the job?), and Results (did healing rates, sales or service metrics " +
              "move?). A trainer's real success shows at Levels 3 and 4 — track them, don't stop at a smile sheet."
          }
        ]
      }
    ],
    quiz: {
      id: "quiz-tot-facilitation",
      title: "Training-of-Trainers Assessment",
      passScore: 80,
      questions: [
        {
          id: "q-tot-1",
          prompt: "Which approach aligns best with adult learning principles?",
          type: "SINGLE",
          options: [
            "Long uninterrupted lectures",
            "Problem-centred active practice with feedback",
            "Memorisation without context",
            "Withholding feedback until the end of the programme"
          ],
          correct: [1],
          explanation: "Adults learn best through relevant, problem-centred practice with timely feedback."
        },
        {
          id: "q-tot-2",
          prompt: "A knowledge quiz alone is sufficient to certify a trainer as competent.",
          type: "TRUE_FALSE",
          options: ["True", "False"],
          correct: [1],
          explanation: "Competency requires observed performance against a rubric, not just a knowledge check."
        },
        {
          id: "q-tot-3",
          prompt: "Which is a well-formed, measurable learning objective?",
          type: "SINGLE",
          options: [
            "Understand wound care",
            "Know the product range",
            "Given a chronic wound scenario, select the correct product for each TIME domain with 100% accuracy",
            "Appreciate the importance of training"
          ],
          correct: [2],
          explanation:
            "A measurable objective names the behaviour, the condition and the standard, using an action verb."
        },
        {
          id: "q-tot-4",
          prompt: "What does the ADDIE model stand for?",
          type: "SINGLE",
          options: [
            "Assess, Deliver, Demonstrate, Inspect, Evaluate",
            "Analyse, Design, Develop, Implement, Evaluate",
            "Adapt, Decide, Develop, Instruct, Examine",
            "Align, Draft, Deploy, Improve, Extend"
          ],
          correct: [1],
          explanation: "ADDIE = Analyse, Design, Develop, Implement, Evaluate."
        },
        {
          id: "q-tot-5",
          prompt: "Which method is correct for teaching a procedural skill like a dressing change?",
          type: "SINGLE",
          options: [
            "Show one slide and move on",
            "'I do, we do, you do' with observed practice against a checklist",
            "Read the instructions aloud only",
            "Assume prior competence"
          ],
          correct: [1],
          explanation: "Procedural skills are built through demonstration then coached, observed practice."
        },
        {
          id: "q-tot-6",
          prompt: "At which Kirkpatrick levels does a trainer's real impact show?",
          type: "MULTI",
          options: [
            "Level 1 – Reaction",
            "Level 2 – Learning",
            "Level 3 – Behaviour",
            "Level 4 – Results"
          ],
          correct: [2, 3],
          explanation: "On-the-job behaviour change (L3) and business results (L4) demonstrate real impact."
        }
      ]
    },
    createdAt: now,
    updatedAt: now
  }
];
