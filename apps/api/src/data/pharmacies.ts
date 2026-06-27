import type { SeedFacility } from "./facilities";

/**
 * Retail pharmacy branches for the National Hospital Database.
 *
 * Provenance: MedPlus Pharmacy official public store directory
 * (https://medplusnig.com/sellers). Every record's address and phone number is
 * published by the business itself on its own website — these are real, verified
 * contact details, NOT fabricated. Records are therefore marked verified (green).
 *
 * To add other chains/independents, append rows with a real `source` and only a
 * `phone`/`address` you can actually cite, or use the import pipeline.
 */

export const PHARMACY_SOURCE =
  "MedPlus Pharmacy — official store directory (medplusnig.com/sellers)";

/** Verified date for this pharmacy dataset (ISO-8601). */
export const PHARMACY_VERIFIED_AT = "2026-06-27T00:00:00.000Z";

const PH = "PHARMACY" as const;

export const seedPharmacies: SeedFacility[] = [
  // ---- Abia ----
  { name: "MedPlus Pharmacy — Abia Mall, Umuahia", type: PH, stateId: "state-abia", city: "Umuahia", address: "Abia Mall, Old Garki Road, Umuahia, Abia", phone: "09096449298", verified: true },
  { name: "MedPlus Pharmacy — Aria Aria, Aba", type: PH, stateId: "state-abia", city: "Aba", address: "Ahiaba Abayi, Osisioma, along Aba–Port Harcourt Expressway, Abia", phone: "07052093554", verified: true },

  // ---- Akwa Ibom ----
  { name: "MedPlus Pharmacy — Tropicana Mall, Uyo", type: PH, stateId: "state-akwa-ibom", city: "Uyo", address: "Tropicana Mall, Udo Udoma Avenue, Uyo, Akwa Ibom", phone: "08077791538", verified: true },
  { name: "MedPlus Pharmacy — Nuet Shop, Uyo", type: PH, stateId: "state-akwa-ibom", city: "Uyo", address: "139, Nwaniba Road, Akwa Ibom", phone: "08070718996", verified: true },

  // ---- Anambra ----
  { name: "MedPlus Pharmacy — Awka (City Plaza)", type: PH, stateId: "state-anambra", city: "Awka", address: "City Plaza, 6 Abakaliki Street, Awka, Anambra", phone: "07052290820", verified: true },
  { name: "MedPlus Pharmacy — Onitsha Mall", type: PH, stateId: "state-anambra", city: "Onitsha", address: "ABS, Awka Road by Park Road, Onitsha, Anambra", phone: "09084408810", verified: true },
  { name: "MedPlus Pharmacy — Ikenga Mall, Awka", type: PH, stateId: "state-anambra", city: "Awka", address: "Ikenga Mall, along Nnamdi Azikiwe Avenue Road, Awka, Anambra", phone: "08113494460", verified: true },

  // ---- Cross River ----
  { name: "MedPlus Pharmacy — Calabar (Crispy Chicken)", type: PH, stateId: "state-cross-river", city: "Calabar", address: "Crispy Chicken, 47 Calabar Road, Calabar, Cross River", phone: "08070718811", verified: true },

  // ---- Delta ----
  { name: "MedPlus Pharmacy — Asaba Mall", type: PH, stateId: "state-delta", city: "Asaba", address: "Shop 33A, Asaba Mall, Okpanam Road, Asaba, Delta", phone: "09096449307", verified: true },
  { name: "MedPlus Pharmacy — Delta Mall, Warri", type: PH, stateId: "state-delta", city: "Warri", address: "Shop 31A, Delta Mall (Shoprite), Warri, Delta", phone: "09092556067", verified: true },
  { name: "MedPlus Pharmacy — Summit Shop, Asaba", type: PH, stateId: "state-delta", city: "Asaba", address: "Everyday Supermarket, Summit Road, Central Area, Umuagu, Asaba, Delta", phone: "08054030565", verified: true },

  // ---- Edo ----
  { name: "MedPlus Pharmacy — Benin City Mall", type: PH, stateId: "state-edo", city: "Benin City", address: "Shop 38, Benin City Mall, Sapele Road, Edo", phone: "08159739693", verified: true },

  // ---- Enugu ----
  { name: "MedPlus Pharmacy — Enugu Mall", type: PH, stateId: "state-enugu", city: "Enugu", address: "Enugu Mall, Nkpokiti Road, off Presidential Road, opposite Okpara Square, Enugu", phone: "09091186816", verified: true },

  // ---- Imo ----
  { name: "MedPlus Pharmacy — Priceless Mall, Owerri", type: PH, stateId: "state-imo", city: "Owerri", address: "Plot C9, Okigwe Road by Orji Flyover, Owerri, Imo", phone: "09150493175", verified: true },
  { name: "MedPlus Pharmacy — Emporium 4, Owerri", type: PH, stateId: "state-imo", city: "Owerri", address: "Emporium 4, Ikenegbu Layout, off Cherubim Junction, Wetheral Road, Owerri, Imo", phone: "08059397587", verified: true },
  { name: "MedPlus Pharmacy — MCC Shop, Owerri", type: PH, stateId: "state-imo", city: "Owerri", address: "Everyday Supermarket, MCC Road, Owerri, Imo", phone: "08059397587", verified: true },
  { name: "MedPlus Pharmacy — Youth Centre, New Owerri", type: PH, stateId: "state-imo", city: "Owerri", address: "Priceless Mall, Plot 12B off Port Harcourt Road, Youth Centre Layout, Concord Boulevard, New Owerri, Imo", phone: "09154980451", verified: true },
  { name: "MedPlus Pharmacy — World Bank, Owerri", type: PH, stateId: "state-imo", city: "Owerri", address: "Everyday Supermarket, World Bank Road by Yar'Adua Drive, Owerri, Imo", phone: "08059397523", verified: true },

  // ---- Kaduna ----
  { name: "MedPlus Pharmacy — Galaxy Mall, Kaduna", type: PH, stateId: "state-kaduna", city: "Kaduna", address: "22 Waff Road, off Ahmadu Bello Way, City Centre, Kaduna", phone: "07052290815", verified: true },
  { name: "MedPlus Pharmacy — Uptown Mall, Kaduna", type: PH, stateId: "state-kaduna", city: "Kaduna", address: "Uptown Mall, Barnawa Road, Kaduna", phone: "08070718993", verified: true },

  // ---- Kano ----
  { name: "MedPlus Pharmacy — Ado Bayero Mall, Kano", type: PH, stateId: "state-kano", city: "Kano", address: "Ado Bayero Mall, Zoo Road, Kano", phone: "09084408843", verified: true },
  { name: "MedPlus Pharmacy — Grand Store, Kano", type: PH, stateId: "state-kano", city: "Kano", address: "Grand Square Kano, 5 Bompai Road, Fagge, Kano", phone: "07052093562", verified: true },

  // ---- Kwara ----
  { name: "MedPlus Pharmacy — Kwara Mall, Ilorin", type: PH, stateId: "state-kwara", city: "Ilorin", address: "Kwara Mall, beside Shoprite, Fate Road, Ilorin, Kwara", phone: "07015864896", verified: true },
  { name: "MedPlus Pharmacy — Emirate Mall, Ilorin", type: PH, stateId: "state-kwara", city: "Ilorin", address: "Airforce Base Junction Road, Ilorin, Kwara", phone: "08070719360", verified: true },

  // ---- Ogun ----
  { name: "MedPlus Pharmacy — Otta Mall, Sango Ota", type: PH, stateId: "state-ogun", city: "Sango Ota", address: "The Palms Ota (former Gateway Hotel), Sango Ota, Ogun", phone: "09096440462", verified: true },
  { name: "MedPlus Pharmacy — Abeokuta (Oke Ilewo)", type: PH, stateId: "state-ogun", city: "Abeokuta", address: "10, Labulu Street, Oke Ilewo, Abeokuta, Ogun", phone: "09154306652", verified: true },
  { name: "MedPlus Pharmacy — Ibara, Abeokuta", type: PH, stateId: "state-ogun", city: "Abeokuta", address: "1st Avenue, Ibara Housing Estate, adjacent Ogun State Housing, Abeokuta, Ogun", phone: "08113494455", verified: true },
  { name: "MedPlus Pharmacy — Leme, Abeokuta", type: PH, stateId: "state-ogun", city: "Abeokuta", address: "4 Leme Road, Abiola Way, Abeokuta, Ogun", phone: "08070718962", verified: true },

  // ---- Ondo ----
  { name: "MedPlus Pharmacy — Akure (Ibatoro Road)", type: PH, stateId: "state-ondo", city: "Akure", address: "Shop 65/66, Ibatoro Road, Akure, Ondo", phone: "09082069217", verified: true },
  { name: "MedPlus Pharmacy — Ojaja Park, Akure", type: PH, stateId: "state-ondo", city: "Akure", address: "Ojaja Park, Alagbaka, Akure, Ondo", phone: "07052093556", verified: true },

  // ---- Osun ----
  { name: "MedPlus Pharmacy — Osun Mall, Osogbo", type: PH, stateId: "state-osun", city: "Osogbo", address: "Osun Mall, Olaiya–Gbongan Road, Osogbo, Osun", phone: "09053790053", verified: true },

  // ---- Oyo ----
  { name: "MedPlus Pharmacy — FoodCo, Ring Road Ibadan", type: PH, stateId: "state-oyo", city: "Ibadan", address: "FoodCo, Ring Road, beside IBEDC, Ibadan, Oyo", phone: "09150691595", verified: true },
  { name: "MedPlus Pharmacy — Jericho, Ibadan", type: PH, stateId: "state-oyo", city: "Ibadan", address: "Jericho Nursing Home, All Saints Church Road, Jericho, Ibadan, Oyo", phone: "09152592977", verified: true },
  { name: "MedPlus Pharmacy — Richbam, Ibadan", type: PH, stateId: "state-oyo", city: "Ibadan", address: "Richbam Building, Soka Area, New Felele, Ibadan, Oyo", phone: "07052290817", verified: true },
  { name: "MedPlus Pharmacy — Ring Road (The Palms), Ibadan", type: PH, stateId: "state-oyo", city: "Ibadan", address: "The Palms, Ring Road, Ibadan, Oyo", phone: "07015827741", verified: true },
  { name: "MedPlus Pharmacy — Beyond Bodija, Ibadan", type: PH, stateId: "state-oyo", city: "Ibadan", address: "Batis Plaza, 40 Secretariat Road, Bodija, Ibadan, Oyo", phone: "08113590026", verified: true },

  // ---- Plateau ----
  { name: "MedPlus Pharmacy — Jos (Kingsbite)", type: PH, stateId: "state-plateau", city: "Jos", address: "Kingsbite, British American Junction, Jos, Plateau", phone: "08183004215", verified: true },

  // ---- Rivers ----
  { name: "MedPlus Pharmacy — Garden City Mall, Port Harcourt", type: PH, stateId: "state-rivers", city: "Port Harcourt", address: "4, Old Aba Road, Rumuomasi, Port Harcourt, Rivers", phone: "09053887569", verified: true },
  { name: "MedPlus Pharmacy — Genesis Centre, Port Harcourt", type: PH, stateId: "state-rivers", city: "Port Harcourt", address: "Phase 2, Genesis Centre, 39 Tombia Street, GRA, Port Harcourt, Rivers", phone: "08178739846", verified: true },
  { name: "MedPlus Pharmacy — Hypercity, Port Harcourt", type: PH, stateId: "state-rivers", city: "Port Harcourt", address: "27, Awoke Street, Nkpogu, Port Harcourt, Rivers", phone: "09053835687", verified: true },
  { name: "MedPlus Pharmacy — Port Harcourt Mall (Azikiwe)", type: PH, stateId: "state-rivers", city: "Port Harcourt", address: "No 1, Azikiwe Road, Port Harcourt, Rivers", phone: "09082899870", verified: true },
  { name: "MedPlus Pharmacy — Odili Road, Port Harcourt", type: PH, stateId: "state-rivers", city: "Port Harcourt", address: "Studio Flagship, Peter Odili Road, GRA, Port Harcourt, Rivers", phone: "08070719368", verified: true },
  { name: "MedPlus Pharmacy — SPAR, Port Harcourt", type: PH, stateId: "state-rivers", city: "Port Harcourt", address: "Spar Mall, 1 Azikiwe Road, Port Harcourt, Rivers", phone: "09082899870", verified: true },
  { name: "MedPlus Pharmacy — Joe Alogoa, Port Harcourt", type: PH, stateId: "state-rivers", city: "Port Harcourt", address: "27 Joe Alogoa Street, off Peter Odili Road, Port Harcourt, Rivers", phone: "09154980447", verified: true },
  { name: "MedPlus Pharmacy — Woji, Port Harcourt", type: PH, stateId: "state-rivers", city: "Port Harcourt", address: "118 Woji Road, GRA, Port Harcourt, Rivers", phone: "08113494411", verified: true },

  // ---- FCT (Abuja) ----
  { name: "MedPlus Pharmacy — Aminu Kano, Wuse II", type: PH, stateId: "state-fct", city: "Abuja", address: "78, Nana Plaza, Aminu Kano Crescent, Wuse II, Abuja", phone: "09150691593", verified: true },
  { name: "MedPlus Pharmacy — Apo Mall, Abuja", type: PH, stateId: "state-fct", city: "Abuja", address: "Plot 232, Cadastral Zone B4, Dutse, Abuja", phone: "08116330192", verified: true },
  { name: "MedPlus Pharmacy — Utako, Abuja", type: PH, stateId: "state-fct", city: "Abuja", address: "Plot 482, Cadastral Zone, Utako, Abuja", phone: "08155975033", verified: true },
  { name: "MedPlus Pharmacy — Central Office Park, Wuse", type: PH, stateId: "state-fct", city: "Abuja", address: "Novare Central Office Park, Dalaba Street, Wuse Zone 5, Abuja", phone: "08086534006", verified: true },
  { name: "MedPlus Pharmacy — Nnamdi Azikiwe Airport, Abuja", type: PH, stateId: "state-fct", city: "Abuja", address: "Nnamdi Azikiwe International Airport, Abuja", phone: "09152592972", verified: true },
  { name: "MedPlus Pharmacy — Gwarinpa, Abuja", type: PH, stateId: "state-fct", city: "Abuja", address: "Studio 24, 3rd Avenue, Gwarinpa, Abuja", phone: "09152592967", verified: true },
  { name: "MedPlus Pharmacy — Jabi Lake Mall, Abuja", type: PH, stateId: "state-fct", city: "Abuja", address: "Jabi Lake, 256A Boka Sokoro Way, Jabi District, Cadastral Zone 304, Abuja", phone: "09152592968", verified: true },
  { name: "MedPlus Pharmacy — Mall 55, Wuse 2", type: PH, stateId: "state-fct", city: "Abuja", address: "Mall 55, Kumasi Crescent, Wuse 2, Abuja", phone: "09152592957", verified: true },
  { name: "MedPlus Pharmacy — Lugbe, Abuja", type: PH, stateId: "state-fct", city: "Abuja", address: "Novare Gateway Mall, Lugbe, Abuja", phone: "08181869338", verified: true },
  { name: "MedPlus Pharmacy — Transcorp Hilton, Maitama", type: PH, stateId: "state-fct", city: "Abuja", address: "1, Aguiyi Ironsi Street, Maitama, Abuja", phone: "08070718919", verified: true },
  { name: "MedPlus Pharmacy — Access (Wuse) Shop, Abuja", type: PH, stateId: "state-fct", city: "Abuja", address: "1 Niafounke Street, Aminu Kano Crescent, Wuse, Abuja", phone: "08113590044", verified: true },

  // ---- Lagos ----
  { name: "MedPlus Pharmacy — Adeniran Ogunsanya, Surulere", type: PH, stateId: "state-lagos", city: "Surulere", address: "Adeniran Ogunsanya Mall, Surulere, Lagos", phone: "07013489463", verified: true },
  { name: "MedPlus Pharmacy — Adeniyi Jones, Ikeja", type: PH, stateId: "state-lagos", city: "Ikeja", address: "107 Adeniyi Jones, Ikeja, Lagos", phone: "08173136117", verified: true },
  { name: "MedPlus Pharmacy — Adeola Hopewell, VI", type: PH, stateId: "state-lagos", city: "Victoria Island", address: "26, Adeola Hopewell Street, Victoria Island, Lagos", phone: "09053927665", verified: true },
  { name: "MedPlus Pharmacy — Adeola Odeku, VI", type: PH, stateId: "state-lagos", city: "Victoria Island", address: "No 2 Adeola Odeku Street, opp Union Bank, Victoria Island, Lagos", phone: "07015827743", verified: true },
  { name: "MedPlus Pharmacy — Admiralty, Lekki Phase 1", type: PH, stateId: "state-lagos", city: "Lekki", address: "Block 10A, Admiralty Way, opp Evercare Hospital, Lekki Phase 1, Lagos", phone: "09152592952", verified: true },
  { name: "MedPlus Pharmacy — Agungi, Lekki", type: PH, stateId: "state-lagos", city: "Lekki", address: "11, Agungi Ajiran Road (Shepard Place), Agungi, Lagos", phone: "08183003665", verified: true },
  { name: "MedPlus Pharmacy — Allen Avenue, Ikeja", type: PH, stateId: "state-lagos", city: "Ikeja", address: "107, Allen Avenue, Ikeja, Lagos", phone: "09053927662", verified: true },
  { name: "MedPlus Pharmacy — Amuwo Odofin", type: PH, stateId: "state-lagos", city: "Amuwo Odofin", address: "319 Rabiu Babatunde Tinubu Road, Amuwo Odofin, Lagos", phone: "08070718952", verified: true },
  { name: "MedPlus Pharmacy — Apapa", type: PH, stateId: "state-lagos", city: "Apapa", address: "13 Park Lane, Apapa, Lagos", phone: "07015827742", verified: true },
  { name: "MedPlus Pharmacy — Atlantic Mall, Chevron", type: PH, stateId: "state-lagos", city: "Lekki", address: "No. 6, Chevron Drive, Lekki Peninsula, Lagos", phone: "09082043862", verified: true },
  { name: "MedPlus Pharmacy — 168 Ikoyi (Awolowo Annex)", type: PH, stateId: "state-lagos", city: "Ikoyi", address: "168 Awolowo Road, Ikoyi, Lagos", phone: "09152592953", verified: true },
  { name: "MedPlus Pharmacy — Awolowo Road, Ikoyi", type: PH, stateId: "state-lagos", city: "Ikoyi", address: "Sweet Sensation Building, 38 Awolowo Road, Ikoyi, Lagos", phone: "07013489468", verified: true },
  { name: "MedPlus Pharmacy — Bannex Mall, Oniru", type: PH, stateId: "state-lagos", city: "Lekki", address: "Bannex Mall, Plot 1&10, Akiogun Road, Oniru, Lekki, Lagos", phone: "09152592963", verified: true },
  { name: "MedPlus Pharmacy — Bera Estate, Lekki", type: PH, stateId: "state-lagos", city: "Lekki", address: "20A, U.B.A Road, Bera Estate, off Chevron Drive, Lekki, Lagos", phone: "09053790050", verified: true },
  { name: "MedPlus Pharmacy — Blackbell, Ikota", type: PH, stateId: "state-lagos", city: "Lekki", address: "Blackbell Mall, beside Mega Chicken, Ikota, Lagos", phone: "09053927663", verified: true },
  { name: "MedPlus Pharmacy — Blenco, Ajah", type: PH, stateId: "state-lagos", city: "Ajah", address: "53 Pump and Fell, Ado Road, Ajah, Lagos", phone: "08187316970", verified: true },
  { name: "MedPlus Pharmacy — Ibeju (Eputu)", type: PH, stateId: "state-lagos", city: "Ibeju-Lekki", address: "Blenco Supermarket, Lekki–Epe Expressway, Eputu Bus-stop, Lagos", phone: "08070718961", verified: true },
  { name: "MedPlus Pharmacy — Bukka Hut, Lekki Phase 1", type: PH, stateId: "state-lagos", city: "Lekki", address: "Plot 69B, Admiralty Way, Lekki Phase 1, Lagos", phone: "08171030932", verified: true },
  { name: "MedPlus Pharmacy — Capital Mall (Orchid)", type: PH, stateId: "state-lagos", city: "Lekki", address: "Shop B4&B5, Capital Garden Mall, Orchid Hotel Road, Eti-Osa, Lagos", phone: "09152592982", verified: true },
  { name: "MedPlus Pharmacy — Circle Mall, Jakande", type: PH, stateId: "state-lagos", city: "Lekki", address: "Shop 23, Circle Mall, Jakande Roundabout, Lekki–Epe Expressway, Lagos", phone: "08070718847", verified: true },
  { name: "MedPlus Pharmacy — CMD Road, Ikosi-Ketu", type: PH, stateId: "state-lagos", city: "Ketu", address: "Greenville Plaza, 19 CMD Road, Ikosi-Ketu, Lagos", phone: "08070718946", verified: true },
  { name: "MedPlus Pharmacy — Ebute Metta", type: PH, stateId: "state-lagos", city: "Ebute Metta", address: "Shop B, Ground Floor, Mobolaji Johnson Railway Station, Lagos", phone: "09152592989", verified: true },
  { name: "MedPlus Pharmacy — Egbeda", type: PH, stateId: "state-lagos", city: "Egbeda", address: "1, Muhammed Street, Santos Layout, Akowonjo Roundabout, Egbeda, Lagos", phone: "09053835688", verified: true },
  { name: "MedPlus Pharmacy — Entourage Mall, Lekki", type: PH, stateId: "state-lagos", city: "Lekki", address: "Entourage Mall, Adebayo Doherty Street, Lekki, Lagos", phone: "08155974865", verified: true },
  { name: "MedPlus Pharmacy — Festac (TFC)", type: PH, stateId: "state-lagos", city: "Festac", address: "TFC Building, 22 Road, Festac, Lagos", phone: "09082259427", verified: true },
  { name: "MedPlus Pharmacy — Fola Osibo, Lekki Phase 1", type: PH, stateId: "state-lagos", city: "Lekki", address: "12, Fola Osibo Road, Lekki Phase 1, Lagos", phone: "09152592984", verified: true },
  { name: "MedPlus Pharmacy — Gbagada", type: PH, stateId: "state-lagos", city: "Gbagada", address: "Plot 310, Gbagada–Oworonshoki Expressway, beside Chicken Republic, Gbagada, Lagos", phone: "09150493176", verified: true },
  { name: "MedPlus Pharmacy — Glover, Ikoyi", type: PH, stateId: "state-lagos", city: "Ikoyi", address: "37, Glover Road, Ikoyi, Lagos", phone: "09150691592", verified: true },
  { name: "MedPlus Pharmacy — Greenville, VI", type: PH, stateId: "state-lagos", city: "Victoria Island", address: "Greenville Plaza, 10, Adeola Odeku Street, Victoria Island, Lagos", phone: "08112491457", verified: true },
  { name: "MedPlus Pharmacy — Hakeem Dickson, Lekki", type: PH, stateId: "state-lagos", city: "Lekki", address: "Block 113, Plot 1C, Hakeem Dickson Street, Lekki Phase 1, Lagos", phone: "09152592979", verified: true },
  { name: "MedPlus Pharmacy — Elegushi (Ikate)", type: PH, stateId: "state-lagos", city: "Lekki", address: "The Block, 70 Kusenla Street, Ikate-Elegushi, off Lekki–Epe Expressway, Lagos", phone: "09055493665", verified: true },
  { name: "MedPlus Pharmacy — Ikeja City Mall", type: PH, stateId: "state-lagos", city: "Ikeja", address: "Ikeja City Mall, Alausa, Lagos", phone: "07013489462", verified: true },
  { name: "MedPlus Pharmacy — MMIA International Terminal", type: PH, stateId: "state-lagos", city: "Ikeja", address: "New International Terminal of MMIA, Ikeja, Lagos", phone: "09152592974", verified: true },
  { name: "MedPlus Pharmacy — Isaac John, Ikeja GRA", type: PH, stateId: "state-lagos", city: "Ikeja", address: "29, Isaac John Street, GRA, Ikeja, Lagos", phone: "09150493174", verified: true },
  { name: "MedPlus Pharmacy — Jakande, Lekki", type: PH, stateId: "state-lagos", city: "Lekki", address: "iFitness, Lekki Expressway, Jakande, Lagos", phone: "08179689402", verified: true },
  { name: "MedPlus Pharmacy — Simbiat Mall, Ikeja", type: PH, stateId: "state-lagos", city: "Ikeja", address: "22, Simbiat Abiola Way, Ikeja, Lagos", phone: "08112493160", verified: true },
  { name: "MedPlus Pharmacy — Keffi, Ikoyi", type: PH, stateId: "state-lagos", city: "Ikoyi", address: "9, Keffi Street, off Awolowo Road, Ikoyi, Lagos", phone: "07013489460", verified: true },
  { name: "MedPlus Pharmacy — Kingsway, Ikoyi", type: PH, stateId: "state-lagos", city: "Ikoyi", address: "8A, Kingsway Road, Ikoyi, Lagos", phone: "09154398837", verified: true },
  { name: "MedPlus Pharmacy — Lakowe Golf", type: PH, stateId: "state-lagos", city: "Ibeju-Lekki", address: "BNB Mall, Lakowe Golf, Ibeju-Lekki, Lagos", phone: "08072780173", verified: true },
  { name: "MedPlus Pharmacy — Landmark, VI", type: PH, stateId: "state-lagos", city: "Victoria Island", address: "Landmark Mall, Water Corporation Drive, Victoria Island, Lagos", phone: "08155975356", verified: true },
  { name: "MedPlus Pharmacy — Admiralty Way, Lekki", type: PH, stateId: "state-lagos", city: "Lekki", address: "7, Admiralty Way, Lekki Phase 1, Lagos", phone: "09055494173", verified: true },
  { name: "MedPlus Pharmacy — Hub Centre, Lekki", type: PH, stateId: "state-lagos", city: "Lekki", address: "2, Admiralty Road, Lekki Phase 1, Lagos", phone: "09152136274", verified: true },
  { name: "MedPlus Pharmacy — Lidone, Lekki Phase 1", type: PH, stateId: "state-lagos", city: "Lekki", address: "34A Fola Osibo Road, Lekki Phase 1, Lagos", phone: "08184754730", verified: true },
  { name: "MedPlus Pharmacy — Ligali Ayorinde, VI", type: PH, stateId: "state-lagos", city: "Victoria Island", address: "Abeni Plaza, 52 Ligali-Ayorinde Street, beside KFC, Victoria Island, Lagos", phone: "09053835710", verified: true },
  { name: "MedPlus Pharmacy — Magodo (CMD Road)", type: PH, stateId: "state-lagos", city: "Magodo", address: "52, Adekunle Banjo Street, off CMD Road, Magodo, Lagos", phone: "09083341953", verified: true },
  { name: "MedPlus Pharmacy — Magodo Annex (Emmanuel Keshi)", type: PH, stateId: "state-lagos", city: "Magodo", address: "32, Emmanuel Keshi Street, Magodo, Lagos", phone: "09055492610", verified: true },
  { name: "MedPlus Pharmacy — Mama Cass, VI", type: PH, stateId: "state-lagos", city: "Victoria Island", address: "271, Ajose Adeogun Street, Victoria Island, Lagos", phone: "07052290819", verified: true },
  { name: "MedPlus Pharmacy — Mega Plaza, VI", type: PH, stateId: "state-lagos", city: "Victoria Island", address: "12 Idowu Martins Street, Victoria Island, Lagos", phone: "07013489466", verified: true },
  { name: "MedPlus Pharmacy — Metro (Isaac John), Ikeja", type: PH, stateId: "state-lagos", city: "Ikeja", address: "31 Isaac John Street, GRA, Ikeja, Lagos", phone: "07013489469", verified: true },
  { name: "MedPlus Pharmacy — MMA2 Departure Hall", type: PH, stateId: "state-lagos", city: "Ikeja", address: "Departure Hall, MMA2, Ikeja, Lagos", phone: "07013489461", verified: true },
  { name: "MedPlus Pharmacy — MMA2 Annex", type: PH, stateId: "state-lagos", city: "Ikeja", address: "Ticketing Area, MMA2, Ikeja, Lagos", phone: "08188323769", verified: true },
  { name: "MedPlus Pharmacy — Muri Okunola, VI", type: PH, stateId: "state-lagos", city: "Victoria Island", address: "Castle Pride Arcade, 226 Muri Okunola Street, Victoria Island, Lagos", phone: "08154568022", verified: true },
  { name: "MedPlus Pharmacy — Akinjobi, Ikeja GRA", type: PH, stateId: "state-lagos", city: "Ikeja", address: "1, Rev. Ogunbiyi Street, off Oba Akinjobi Way, GRA, Ikeja, Lagos", phone: "09053927666", verified: true },
  { name: "MedPlus Pharmacy — Oduduwa, Ikeja GRA", type: PH, stateId: "state-lagos", city: "Ikeja", address: "15, Oduduwa Way, Ikeja GRA, Lagos", phone: "08113965417", verified: true },
  { name: "MedPlus Pharmacy — Ologolo, Lekki", type: PH, stateId: "state-lagos", city: "Lekki", address: "11, Shepherds Place, Lekki, Lagos", phone: "09053790049", verified: true },
  { name: "MedPlus Pharmacy — Oniru, Lekki", type: PH, stateId: "state-lagos", city: "Lekki", address: "Oniru Block XXI Plot 19, Chief Yesufu Abiodun Way, Lawani Odujaye Road, Oniru Estate, Lekki, Lagos", phone: "09084440599", verified: true },
  { name: "MedPlus Pharmacy — Opebi, Ikeja", type: PH, stateId: "state-lagos", city: "Ikeja", address: "52, Opebi Road, Ikeja, Lagos", phone: "09082042960", verified: true },
  { name: "MedPlus Pharmacy — Oriwu, Lekki", type: PH, stateId: "state-lagos", city: "Lekki", address: "No 5, Oriwu Road (by Petrocam Filling Station), Lekki, Lagos", phone: "08184121607", verified: true },
  { name: "MedPlus Pharmacy — Osolo Way, Ajao Estate", type: PH, stateId: "state-lagos", city: "Ajao Estate", address: "11, Osolo Way, beside Domino's Pizza, Ajao Estate, Lagos", phone: "09150493180", verified: true },
  { name: "MedPlus Pharmacy — City Mall, Ogudu", type: PH, stateId: "state-lagos", city: "Ogudu", address: "175 Ogudu Road, Ojota, Ogudu, Lagos", phone: "09152592980", verified: true },
  { name: "MedPlus Pharmacy — Ogudu (Ojota)", type: PH, stateId: "state-lagos", city: "Ojota", address: "45A, Ogudu Road, Ojota, Lagos", phone: "09083354474", verified: true },
  { name: "MedPlus Pharmacy — Ogunlana Drive, Surulere", type: PH, stateId: "state-lagos", city: "Surulere", address: "113, Ogunlana Drive, Surulere, Lagos", phone: "08183812589", verified: true },
  { name: "MedPlus Pharmacy — Pedro, Palmgroove", type: PH, stateId: "state-lagos", city: "Palmgroove", address: "38, Salami Suaibu Street, Pedro Road, Palmgroove, Lagos", phone: "08115154717", verified: true },
  { name: "MedPlus Pharmacy — Prime Mall, Chevron", type: PH, stateId: "state-lagos", city: "Lekki", address: "Orchid Road, after Chevron second toll gate, off Lekki–Epe Expressway, Lagos", phone: "09055494172", verified: true },
  { name: "MedPlus Pharmacy — QMB, Lekki Scheme 1", type: PH, stateId: "state-lagos", city: "Lekki", address: "Block 138, Plot 8, Lekki Scheme 1, Lagos", phone: "09152592983", verified: true },
  { name: "MedPlus Pharmacy — Ranbrook, Igbo-Efon", type: PH, stateId: "state-lagos", city: "Lekki", address: "Ranbrook Square, No 2 Baale Street, Igbo-Efon Bus-stop, Lekki, Lagos", phone: "09152592975", verified: true },
  { name: "MedPlus Pharmacy — Road 14, Lekki Phase 1", type: PH, stateId: "state-lagos", city: "Lekki", address: "2A, Adebayo Doherty Street, Road 14, Lekki Phase 1, Lagos", phone: "09053887572", verified: true },
  { name: "MedPlus Pharmacy — Saka Tinubu, VI", type: PH, stateId: "state-lagos", city: "Victoria Island", address: "45, Saka Tinubu Street, Victoria Island, Lagos", phone: "07013489458", verified: true },
  { name: "MedPlus Pharmacy — Sangotedo (Novare Mall)", type: PH, stateId: "state-lagos", city: "Sangotedo", address: "Novare Mall, off Lekki Expressway and Monastery Road, Sangotedo, Lekki, Lagos", phone: "08188687911", verified: true },
  { name: "MedPlus Pharmacy — Sanusi Fafunwa, VI", type: PH, stateId: "state-lagos", city: "Victoria Island", address: "Fourteen 36 Mall, Sanusi Fafunwa, Victoria Island, Lagos", phone: "07013489465", verified: true },
  { name: "MedPlus Pharmacy — Townsquare, Ikeja", type: PH, stateId: "state-lagos", city: "Ikeja", address: "131, Obafemi Awolowo Way, Ikeja, Lagos", phone: "09053878600", verified: true },
  { name: "MedPlus Pharmacy — Mayfair Gardens, Awoyaya", type: PH, stateId: "state-lagos", city: "Awoyaya", address: "Mayfair Gardens, Awoyaya, Lekki, Lagos", phone: "09091390586", verified: true },
  { name: "MedPlus Pharmacy — Tetrazzini (Akin Adesola), VI", type: PH, stateId: "state-lagos", city: "Victoria Island", address: "2 Akin Adesola Street, Victoria Island, Lagos", phone: "07013489467", verified: true },
  { name: "MedPlus Pharmacy — The Palms, Lekki", type: PH, stateId: "state-lagos", city: "Lekki", address: "The Palms, 1 Bisway Street, Makoro, Lekki, Lagos", phone: "07013489457", verified: true },
  { name: "MedPlus Pharmacy — Cubana (Vaniti), VI", type: PH, stateId: "state-lagos", city: "Victoria Island", address: "17, Adeola Odeku Street, Victoria Island, Lagos", phone: "09084440588", verified: true },
  { name: "MedPlus Pharmacy — 1004 Estate, VI", type: PH, stateId: "state-lagos", city: "Victoria Island", address: "1004 Housing Estate, Victoria Island, Lagos", phone: "08027272010", verified: true },
  { name: "MedPlus Pharmacy — Beyond MedPlus, Lekki", type: PH, stateId: "state-lagos", city: "Lekki", address: "69, Admiralty Way, beside Zenith Bank, Lekki Phase 1, Lagos", phone: "09152592985", verified: true },
  { name: "MedPlus Pharmacy — Beyond Atlantic, Lekki", type: PH, stateId: "state-lagos", city: "Lekki", address: "No 6, Chevron Drive, Lekki Peninsula, Lekki, Lagos", phone: "08159739667", verified: true },
  { name: "MedPlus Pharmacy — Abule Egba (Charity Road)", type: PH, stateId: "state-lagos", city: "Abule Egba", address: "10 Charity Road, Abule Egba, Lagos", phone: "08059397578", verified: true },
  { name: "MedPlus Pharmacy — Ogunnusi, Ojodu Berger", type: PH, stateId: "state-lagos", city: "Ojodu", address: "81 Ogunnusi Road, opposite Grammar School, Ojodu Berger, Lagos", phone: "2348070718822", verified: true },
  { name: "MedPlus Pharmacy — Freedom Way, Lekki", type: PH, stateId: "state-lagos", city: "Lekki", address: "41 Freedom Way, Lekki Phase 1, Lagos", phone: "08054029530", verified: true },
  { name: "MedPlus Pharmacy — Ilupeju", type: PH, stateId: "state-lagos", city: "Ilupeju", address: "No. 3 Ilupeju Bypass, Ilupeju, Lagos", phone: "08054029435", verified: true },
  { name: "MedPlus Pharmacy — Didi Mall, Sangotedo", type: PH, stateId: "state-lagos", city: "Sangotedo", address: "KM 45 Lekki–Epe Expressway, Sangotedo, Lagos", phone: "08070719365", verified: true },
  { name: "MedPlus Pharmacy — Ikota (Mega Chicken)", type: PH, stateId: "state-lagos", city: "Lekki", address: "Lekki–Epe Expressway, opposite Mega Chicken, Ikota, Lagos", phone: "09053887571", verified: true },
  { name: "MedPlus Pharmacy — Herbert Macaulay, Yaba", type: PH, stateId: "state-lagos", city: "Yaba", address: "261 Herbert Macaulay Way, Yaba, Lagos", phone: "08054019326", verified: true },
  { name: "MedPlus Pharmacy — Groove Mall, Festac", type: PH, stateId: "state-lagos", city: "Festac", address: "22 Road, Festac, Lagos", phone: "09053927664", verified: true },
  { name: "MedPlus Pharmacy — 82 Plaza, Ikoyi", type: PH, stateId: "state-lagos", city: "Ikoyi", address: "31, Awolowo Road, Ikoyi, Lagos", phone: "09152592992", verified: true },
  { name: "MedPlus Pharmacy — Maryland Mall", type: PH, stateId: "state-lagos", city: "Maryland", address: "Maryland Mall, 350/360 Ikorodu Road, Maryland, Ikeja, Lagos", phone: "08183003894", verified: true },
  { name: "MedPlus Pharmacy — Ikorodu (Dominos)", type: PH, stateId: "state-lagos", city: "Ikorodu", address: "60, Ayangburen Road, Ikorodu, Lagos", phone: "09154306653", verified: true },
  { name: "MedPlus Pharmacy — Nard (Alimosho), Egbeda", type: PH, stateId: "state-lagos", city: "Egbeda", address: "3, Egbeda-Idimu Road, Divine Court Plaza, Alimosho Bus Stop, Egbeda, Lagos", phone: "09154306656", verified: true },
  { name: "MedPlus Pharmacy — Mile 2", type: PH, stateId: "state-lagos", city: "Mile 2", address: "Mile 2 Railway Station, Mile 2, Lagos", phone: "08059502158", verified: true },
  { name: "MedPlus Pharmacy — Purple Way, Lekki", type: PH, stateId: "state-lagos", city: "Lekki", address: "2, Purple Way, off Freedom Way, Lekki, Lagos", phone: "08113965413", verified: true },
  { name: "MedPlus Pharmacy — Buy More, Abule Egba", type: PH, stateId: "state-lagos", city: "Abule Egba", address: "Buymore Supermarket, No. 52 Agbe Road, Abule Egba, Lagos", phone: "07052093558", verified: true },
  { name: "MedPlus Pharmacy — Cargo (Hajj), Ikeja", type: PH, stateId: "state-lagos", city: "Ikeja", address: "Hajj Cargo, Airport, Ikeja, Lagos", phone: "07052093561", verified: true },
  { name: "MedPlus Pharmacy — Tantalizers (Adetokunbo Ademola), VI", type: PH, stateId: "state-lagos", city: "Victoria Island", address: "Tantalizers Building, 58 Adetokunbo Ademola Street, Victoria Island, Lagos", phone: "07013489459", verified: true },
  { name: "MedPlus Pharmacy — Igbogbo, Ikorodu", type: PH, stateId: "state-lagos", city: "Ikorodu", address: "88 Oba Molaja Ogunlewe Road, Ikorodu, Lagos", phone: "07052093553", verified: true },
  { name: "MedPlus Pharmacy — Alaba Station", type: PH, stateId: "state-lagos", city: "Alaba", address: "LAMATA, Alaba Train Station, Lagos", phone: "07052093560", verified: true },
  { name: "MedPlus Pharmacy — Akin Adesola, VI", type: PH, stateId: "state-lagos", city: "Victoria Island", address: "2, Akin Adesola Street, Victoria Island, Lagos", phone: "07013489467", verified: true },
  { name: "MedPlus Pharmacy — Abule (Charity Bus Stop)", type: PH, stateId: "state-lagos", city: "Abule Egba", address: "Abule Egba Road, Charity Bus Stop, Lagos", phone: "08059397578", verified: true },
  { name: "MedPlus Pharmacy — Rejuve Clinic, Lekki", type: PH, stateId: "state-lagos", city: "Lekki", address: "32 Theophilus Oji Street, off Fola Osibo, Lekki Phase 1, Lagos", phone: "08070718891", verified: true },
  { name: "MedPlus Pharmacy — Alimosho, Egbeda", type: PH, stateId: "state-lagos", city: "Egbeda", address: "Egbeda-Idimu Road, Divine Court Plaza, Alimosho Bus Stop, Egbeda, Lagos", phone: "09154306656", verified: true },
  { name: "MedPlus Pharmacy — Bayo Kuku, Ikoyi", type: PH, stateId: "state-lagos", city: "Ikoyi", address: "No. 11 Bayo Kuku, Ikoyi, Lagos", phone: "08070718814", verified: true },
  { name: "MedPlus Pharmacy — Ikeja GRA (Sobo Arobiodu)", type: PH, stateId: "state-lagos", city: "Ikeja", address: "1 Sobo Arobiodu Street, Ikeja GRA, Lagos", phone: "09154980431", verified: true },
  { name: "MedPlus Pharmacy — Trade Shop, Lekki Free Zone", type: PH, stateId: "state-lagos", city: "Ibeju-Lekki", address: "Lagos Free Zone, Itoke Village, Ibeju, Lekki, Lagos", phone: "09154980436", verified: true },
  { name: "MedPlus Pharmacy — Beckley Estate, Abule Egba", type: PH, stateId: "state-lagos", city: "Abule Egba", address: "13B, Beckley Estate, Abule Egba, Lagos", phone: "09154980430", verified: true },
  { name: "MedPlus Pharmacy — Leisure (Adeniran Ogunsanya), Surulere", type: PH, stateId: "state-lagos", city: "Surulere", address: "Adeniran Ogunsanya Street, Surulere, Lagos", phone: "09154980448", verified: true },
  { name: "MedPlus Pharmacy — La Cuidad, VGC", type: PH, stateId: "state-lagos", city: "Lekki", address: "La Cuidad Mall, VGC, Lagos", phone: "07076328808", verified: true }
];
