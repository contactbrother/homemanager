/**
 * Community pages. Facts checked on 26 September 2026 against developer and community
 * management sources and established property guides. Figures that sources disagree on
 * (district counts, total villa numbers) are left out rather than guessed.
 */
export interface Community {
  slug: string;
  name: string;
  title: string;
  description: string;
  intro: string;
  facts: Array<[string, string]>;
  needs: Array<[string, string]>;
  faq: Array<[string, string]>;
  guides: string[];
}

export const COMMUNITY_PAGES: Community[] = [
  {
    slug: "jumeirah-park",
    name: "Jumeirah Park",
    title: "Villa management in Jumeirah Park",
    description:
      "Household management for Jumeirah Park villas: pools, gardens, AC units, documents and renewals, handled by one team. Legacy, Regional, Heritage and Legacy Nova villas.",
    intro:
      "Jumeirah Park is a villa-only community by Nakheel, set behind Jumeirah Lake Towers between Jumeirah Islands and The Meadows. Its detached villas come with private gardens and, in many cases, private pools, which means more systems to keep running than most homes in Dubai.",
    facts: [
      ["Master developer", "Nakheel"],
      ["Homes", "Detached villas only, three to five bedrooms"],
      ["Villa styles", "Legacy, Regional, Heritage and Legacy Nova"],
      ["Neighbours", "Jumeirah Lake Towers, Jumeirah Islands and The Meadows"],
    ],
    needs: [
      ["Pool and garden, all year", "Private pools and gardens mean pumps, filtration, irrigation lines and timers, each needing regular care, especially through the summer."],
      ["Several AC units per villa", "Split units across two floors, each on its own service schedule. Serviced before the summer rather than when one fails in July."],
      ["Roofs and terraces", "Regional villas have flat terraces and Legacy Nova villas have roof terraces. Drains are worth checking before the winter rain."],
      ["A detached home, fully yours", "No shared building team: water heaters, pumps and outdoor lighting are the household's responsibility."],
      ["Summers away", "An empty villa with a pool and garden needs checking while you travel. See our summer home watch."],
    ],
    faq: [
      ["Do you cover every district of Jumeirah Park?", "Yes. Message us with your district and villa type and we will talk through what your home needs."],
      ["Can you help with work that needs community approval?", "We can coordinate it. Modification work in a master community usually needs approval first, so we check the requirements with you before any work is booked."],
    ],
    guides: ["villa-maintenance-calendar-dubai", "summer-travel-checklist-dubai-villa", "ac-and-water-heater-care-dubai"],
  },
  {
    slug: "the-springs",
    name: "The Springs",
    title: "Home management in The Springs",
    description:
      "Household management for The Springs townhouses and villas in Emirates Living: maintenance, vendors, Ejari, DEWA and renewals, handled by one team.",
    intro:
      "The Springs is the largest community in Emirates Living, developed by Emaar, with more than 4,800 homes in numbered sub-communities arranged around parks and lakes. Most homes are townhouses, alongside a smaller number of detached villas.",
    facts: [
      ["Developer", "Emaar, part of Emirates Living"],
      ["Homes", "Townhouses with two to four bedrooms, and some five-bedroom detached villas"],
      ["Layout", "Numbered sub-communities around shared pools, parks and lakes"],
      ["Neighbours", "The Meadows, The Lakes and Emirates Hills"],
    ],
    needs: [
      ["Townhouse upkeep", "Shared walls and compact layouts mean a leak or damp patch is best found early, before it reaches a neighbour or a finished room."],
      ["AC, the biggest bill", "Filters cleaned regularly through the summer and each unit serviced before the heat keeps running costs and breakdowns down."],
      ["Water heater and pipework", "Established homes benefit from regular checks on the heater, its safety valve and visible pipework."],
      ["Many rented homes", "Ejari, DEWA and tenancy renewals come round every year. We track the dates and remind you in good time."],
      ["Small gardens, still gardens", "Irrigation timers set for the early morning or evening, as DEWA advises, and checked for leaks."],
    ],
    faq: [
      ["Do you look after townhouses as well as villas?", "Yes. Townhouses in The Springs have the same list of things to keep on top of, in a smaller space."],
      ["I rent my Springs home. Can you still help?", "Yes. We track your Ejari and DEWA dates, coordinate repairs with your approval, and keep a record you can share with your landlord."],
    ],
    guides: ["ejari-renewal-guide-dubai", "dewa-move-in-move-out-guide", "ac-and-water-heater-care-dubai"],
  },
  {
    slug: "the-meadows",
    name: "The Meadows",
    title: "Villa management in The Meadows",
    description:
      "Household management for The Meadows villas in Emirates Living: maintenance of established homes, pools and gardens, vendors, documents and renewals.",
    intro:
      "The Meadows is one of Dubai's earlier freehold villa communities, developed by Emaar within Emirates Living. Its nine sub-communities are made up of two-storey detached villas with three to seven bedrooms, large gardens and porches, set around lakes and parks.",
    facts: [
      ["Developer", "Emaar, part of Emirates Living"],
      ["Homes", "Two-storey detached villas, three to seven bedrooms"],
      ["Layout", "Nine sub-communities, numbered Meadows 1 to 9"],
      ["Neighbours", "The Springs, The Lakes, Emirates Hills and Jumeirah Islands"],
    ],
    needs: [
      ["Established homes, ageing systems", "DEWA puts the optimal life of an AC at about ten years. In a mature community, planning replacements is as important as servicing."],
      ["Large gardens", "Irrigation lines, valves and timers across big plots, where a slow leak can run for weeks unnoticed."],
      ["Pools where fitted", "Pumps and filtration serviced on schedule, and a cover in summer to cut evaporation."],
      ["Bigger homes, more units", "More bedrooms means more AC units, bathrooms and fittings to keep track of. A register of each one keeps it manageable."],
      ["Modification work", "Extensions and upgrades in Emaar communities usually need approval from the community management first."],
    ],
    faq: [
      ["Can you help plan replacements, not just repairs?", "Yes. Your home register records each unit's age, service history and warranty, so replacements can be planned rather than forced by a breakdown."],
      ["Do you cover every Meadows sub-community?", "Yes, Meadows 1 to 9. Message us with yours and we will talk through your villa."],
    ],
    guides: ["villa-maintenance-calendar-dubai", "ac-and-water-heater-care-dubai", "summer-travel-checklist-dubai-villa"],
  },
  {
    slug: "arabian-ranches",
    name: "Arabian Ranches",
    title: "Villa management in Arabian Ranches",
    description:
      "Household management for Arabian Ranches villas and townhouses: maintenance, vendors, approvals, documents and renewals, handled by one team.",
    intro:
      "Arabian Ranches is a gated villa community by Emaar, launched in 2004 along Sheikh Mohammed Bin Zayed Road. More than 4,000 villas and townhouses sit across sub-communities such as Alvorada, Saheel, Savannah, Mirador, Al Reem, Palmera and Terra Nova, around the Arabian Ranches Golf Club and the Dubai Polo and Equestrian Club.",
    facts: [
      ["Developer", "Emaar"],
      ["Homes", "Villas and townhouses, from two-bedroom townhouses to seven-bedroom villas"],
      ["Sub-communities", "Including Alvorada, Saheel, Savannah, Mirador, Al Reem, Palmera and Terra Nova"],
      ["Landmarks", "Arabian Ranches Golf Club and the Dubai Polo and Equestrian Club"],
    ],
    needs: [
      ["Further from the city", "Vendors travel further, so a visit is worth planning well: the right specialist, the right parts, and access arranged."],
      ["Gardens in the desert", "Irrigation on timers, watered early or late as DEWA advises, and checked for leaks that show up only on the bill."],
      ["Approvals first", "Renovation and modification work in Arabian Ranches needs a No Objection Certificate from Emaar Community Management before a contractor starts."],
      ["Villas with pools", "Larger villas often have private pools, with pumps and filtration to keep on schedule."],
      ["AC through the summer", "Each unit serviced before the heat, and filters cleaned at least monthly while the summer lasts."],
    ],
    faq: [
      ["Do you cover Arabian Ranches 2 and 3?", "Message us with your address. We will tell you whether we can look after your home."],
      ["Can you handle the NOC process for works?", "We can coordinate it with you and your contractor, and make sure nothing starts before approval is in place."],
    ],
    guides: ["villa-maintenance-calendar-dubai", "summer-travel-checklist-dubai-villa", "ac-and-water-heater-care-dubai"],
  },
];
