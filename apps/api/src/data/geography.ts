import type { GeoState, GeoZone } from "../domain/types";

/**
 * Nigeria's six geopolitical zones and their 36 states + FCT.
 *
 * This is public, verifiable reference geography (zone groupings, state names
 * and capitals). It contains NO hospital/facility records — those are only ever
 * added through the provenance-enforced import pipeline so that no contact data
 * is fabricated (see docs/06-security.md).
 */
export const geoZones: GeoZone[] = [
  { id: "zone-nc", name: "North Central", code: "NC" },
  { id: "zone-ne", name: "North East", code: "NE" },
  { id: "zone-nw", name: "North West", code: "NW" },
  { id: "zone-se", name: "South East", code: "SE" },
  { id: "zone-ss", name: "South South", code: "SS" },
  { id: "zone-sw", name: "South West", code: "SW" }
];

export const geoStates: GeoState[] = [
  // North Central
  { id: "state-benue", zoneId: "zone-nc", name: "Benue", capital: "Makurdi" },
  { id: "state-kogi", zoneId: "zone-nc", name: "Kogi", capital: "Lokoja" },
  { id: "state-kwara", zoneId: "zone-nc", name: "Kwara", capital: "Ilorin" },
  { id: "state-nasarawa", zoneId: "zone-nc", name: "Nasarawa", capital: "Lafia" },
  { id: "state-niger", zoneId: "zone-nc", name: "Niger", capital: "Minna" },
  { id: "state-plateau", zoneId: "zone-nc", name: "Plateau", capital: "Jos" },
  { id: "state-fct", zoneId: "zone-nc", name: "Federal Capital Territory", capital: "Abuja" },
  // North East
  { id: "state-adamawa", zoneId: "zone-ne", name: "Adamawa", capital: "Yola" },
  { id: "state-bauchi", zoneId: "zone-ne", name: "Bauchi", capital: "Bauchi" },
  { id: "state-borno", zoneId: "zone-ne", name: "Borno", capital: "Maiduguri" },
  { id: "state-gombe", zoneId: "zone-ne", name: "Gombe", capital: "Gombe" },
  { id: "state-taraba", zoneId: "zone-ne", name: "Taraba", capital: "Jalingo" },
  { id: "state-yobe", zoneId: "zone-ne", name: "Yobe", capital: "Damaturu" },
  // North West
  { id: "state-jigawa", zoneId: "zone-nw", name: "Jigawa", capital: "Dutse" },
  { id: "state-kaduna", zoneId: "zone-nw", name: "Kaduna", capital: "Kaduna" },
  { id: "state-kano", zoneId: "zone-nw", name: "Kano", capital: "Kano" },
  { id: "state-katsina", zoneId: "zone-nw", name: "Katsina", capital: "Katsina" },
  { id: "state-kebbi", zoneId: "zone-nw", name: "Kebbi", capital: "Birnin Kebbi" },
  { id: "state-sokoto", zoneId: "zone-nw", name: "Sokoto", capital: "Sokoto" },
  { id: "state-zamfara", zoneId: "zone-nw", name: "Zamfara", capital: "Gusau" },
  // South East
  { id: "state-abia", zoneId: "zone-se", name: "Abia", capital: "Umuahia" },
  { id: "state-anambra", zoneId: "zone-se", name: "Anambra", capital: "Awka" },
  { id: "state-ebonyi", zoneId: "zone-se", name: "Ebonyi", capital: "Abakaliki" },
  { id: "state-enugu", zoneId: "zone-se", name: "Enugu", capital: "Enugu" },
  { id: "state-imo", zoneId: "zone-se", name: "Imo", capital: "Owerri" },
  // South South
  { id: "state-akwa-ibom", zoneId: "zone-ss", name: "Akwa Ibom", capital: "Uyo" },
  { id: "state-bayelsa", zoneId: "zone-ss", name: "Bayelsa", capital: "Yenagoa" },
  { id: "state-cross-river", zoneId: "zone-ss", name: "Cross River", capital: "Calabar" },
  { id: "state-delta", zoneId: "zone-ss", name: "Delta", capital: "Asaba" },
  { id: "state-edo", zoneId: "zone-ss", name: "Edo", capital: "Benin City" },
  { id: "state-rivers", zoneId: "zone-ss", name: "Rivers", capital: "Port Harcourt" },
  // South West
  { id: "state-ekiti", zoneId: "zone-sw", name: "Ekiti", capital: "Ado-Ekiti" },
  { id: "state-lagos", zoneId: "zone-sw", name: "Lagos", capital: "Ikeja" },
  { id: "state-ogun", zoneId: "zone-sw", name: "Ogun", capital: "Abeokuta" },
  { id: "state-ondo", zoneId: "zone-sw", name: "Ondo", capital: "Akure" },
  { id: "state-osun", zoneId: "zone-sw", name: "Osun", capital: "Osogbo" },
  { id: "state-oyo", zoneId: "zone-sw", name: "Oyo", capital: "Ibadan" }
];
