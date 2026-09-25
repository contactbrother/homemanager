/**
 * Guides. Each is checked against official sources (DEWA, Dubai Land Department, Dubai
 * Police) where one exists, and lists those sources on the page. Fees that sources
 * disagree on are not quoted; readers are pointed to the amount shown at payment.
 */
export type Block =
  | { p: string }
  | { list: string[] }
  | { steps: string[] }
  | { note: string };

export interface Guide {
  slug: string;
  title: string;
  description: string;
  checked: string; // ISO date the facts were last checked
  summary: string[];
  sections: Array<{ heading: string; blocks: Block[] }>;
  sources: Array<{ name: string; url: string }>;
  service: "house-management" | "documents-and-renewals" | "home-watch";
}

const DEWA_COOLING = { name: "DEWA, cooling tips", url: "https://www.dewa.gov.ae/en/consumer/sustainability/sustainability-and-conservation/cooling" };
const DEWA_APPLIANCES = { name: "DEWA, electrical appliances tips", url: "https://www.dewa.gov.ae/en/consumer/sustainability/sustainability-and-conservation/electrical-appliances" };

export const GUIDES: Guide[] = [
  {
    slug: "villa-maintenance-calendar-dubai",
    title: "A villa maintenance calendar for Dubai",
    description:
      "What to service, check and clean in a Dubai villa, season by season: AC before the summer, irrigation and pools in the heat, drains before the winter rain.",
    checked: "2026-09-26",
    summary: [
      "Service every AC unit before the heat arrives, then clean filters at least monthly through the summer.",
      "Water gardens before 8am or after 6pm, and cover the pool in summer to cut evaporation.",
      "Check roof drains and terraces before the winter rain.",
      "Keep a register of every unit in the house with its service and warranty dates.",
    ],
    sections: [
      {
        heading: "Spring: get ready for the heat (March to May)",
        blocks: [
          { list: [
            "Service every AC unit before temperatures climb. A breakdown in July means waiting in the busiest season.",
            "Check pool pumps and filtration, and book pool care for the summer if you will be away.",
            "Set irrigation timers for the summer schedule and walk the garden looking for wet patches or dry spots.",
            "Book pest control before the warmer months.",
          ] },
        ],
      },
      {
        heading: "Summer: keep things running (June to August)",
        blocks: [
          { list: [
            "Clean AC filters at least once a month. DEWA recommends this during summer, as clogged filters cut efficiency significantly.",
            "Keep thermostats at 24°C, as DEWA advises. Each degree higher can save up to 5% on AC consumption.",
            "Water plants before 8am or after 6pm, and cover the pool, both of which DEWA recommends to reduce evaporation.",
            "Watch the water bill. A sudden rise is often the first sign of a leak in irrigation or pipework.",
          ] },
          { note: "Travelling this summer? Our summer travel checklist covers what to do before you leave." },
        ],
      },
      {
        heading: "Autumn: recover from the summer (September to November)",
        blocks: [
          { list: [
            "Check each AC unit after its hardest months: drips, unusual noise or weak cooling are worth a visit now.",
            "Clear roof drains, terrace outlets and gutters before the winter rain.",
            "Look over exterior paint, sealant around windows and door seals, which take a beating in the heat.",
          ] },
        ],
      },
      {
        heading: "Winter: the easy months (December to February)",
        blocks: [
          { list: [
            "Open up and ventilate the house in cooler weather instead of running the AC, as DEWA suggests.",
            "Hot water use goes up. A good time to have the water heater checked.",
            "After heavy rain, check drains, the garden and any low points for standing water.",
            "Plan larger jobs such as painting or replacements for the cooler months.",
          ] },
        ],
      },
      {
        heading: "All year",
        blocks: [
          { list: [
            "Keep a register of every AC unit, water heater and pump with its installation date, last service and warranty.",
            "Plan AC replacements: DEWA puts the optimal life of an AC at about ten years.",
            "Have water tanks and pumps inspected and cleaned regularly. Ask your vendor how often for your home.",
          ] },
        ],
      },
    ],
    sources: [DEWA_COOLING, DEWA_APPLIANCES, { name: "DEWA, summer reminders", url: "https://www.dewa.gov.ae/en/about-us/media-publications/latest-news/2022/07/dewa-reminds" }],
    service: "house-management",
  },
  {
    slug: "summer-travel-checklist-dubai-villa",
    title: "Leaving your Dubai villa for the summer: a checklist",
    description:
      "What to do before you leave your villa empty for the summer: Dubai Police home security, AC, water, pool, garden, renewals and who holds the keys.",
    checked: "2026-09-26",
    summary: [
      "Register with the free Dubai Police home security service before you travel.",
      "Unplug appliances you do not need running, and switch off the water heater.",
      "Arrange care for the pool and garden, and someone to check the house.",
      "Check which renewals fall due while you are away.",
    ],
    sections: [
      {
        heading: "Security",
        blocks: [
          { list: [
            "Register with the Dubai Police home security service. It is free for villa residents: enter your address and travel dates in the Dubai Police app and patrols will keep an eye on the house.",
            "Lock and check every door and window, including the garage and side gates.",
            "Leave a spare key and your access details with one trusted person, not several.",
          ] },
        ],
      },
      {
        heading: "Power and water",
        blocks: [
          { list: [
            "Unplug appliances you do not need running. DEWA notes that devices on standby still use 5 to 10% of household electricity.",
            "Switch off the water heater if nothing needs hot water while you are away.",
            "Decide with whoever checks the house how the AC should be set. An empty villa in a Dubai summer gets very hot and humid.",
            "Empty the fridge of anything that will spoil if the power trips.",
          ] },
        ],
      },
      {
        heading: "Pool and garden",
        blocks: [
          { list: [
            "Book pool care for the summer, or cover the pool, which DEWA recommends to cut evaporation.",
            "Set irrigation to water before 8am or after 6pm, and ask someone to check for leaks and dead patches.",
          ] },
        ],
      },
      {
        heading: "Paperwork",
        blocks: [
          { list: [
            "Check whether Ejari, visas, Emirates IDs, car registration or insurance expire while you are away.",
            "Set bills to pay automatically so nothing is cut off.",
            "Leave emergency contacts, and the details of your AC, pool and plumbing vendors, with the person looking after the house.",
          ] },
          { note: "Dar's summer home watch inspects your empty villa from June to August, with a photo report after every visit." },
        ],
      },
    ],
    sources: [
      { name: "Gulf News, Dubai Police Smart Home Security service", url: "https://gulfnews.com/uae/going-on-holiday-from-dubai-secure-your-home-with-the-dubai-police-smart-app-1.65160259" },
      { name: "Gulf News, DEWA summer tips", url: "https://gulfnews.com/uae/environment/slash-your-utility-bills-this-summer-using-these-simple-tips-1.2239001" },
      { name: "DEWA, summer reminders", url: "https://www.dewa.gov.ae/en/about-us/media-publications/latest-news/2022/07/dewa-reminds" },
    ],
    service: "home-watch",
  },
  {
    slug: "ejari-renewal-guide-dubai",
    title: "How to renew Ejari in Dubai",
    description:
      "A plain guide to renewing your Ejari tenancy registration: when to do it, the channels, the steps Dubai Land Department sets out, and the documents you need.",
    checked: "2026-09-26",
    summary: [
      "Renew Ejari each time your tenancy contract renews.",
      "Use the Dubai REST app, the Ejari system, Dubai Now, or a Real Estate Services Trustee Centre.",
      "Online, the Dubai Land Department asks for a copy of the unified tenancy contract.",
      "Check that Emirates IDs and passports are in date before you start.",
    ],
    sections: [
      {
        heading: "What Ejari is, and why it matters",
        blocks: [
          { p: "Ejari is the registration of your tenancy contract with the Dubai Land Department. Other services depend on it: your DEWA account is created from your Ejari record when you move in, and a valid Ejari is widely asked for as proof of address." },
        ],
      },
      {
        heading: "When to renew",
        blocks: [
          { p: "Renew each time your tenancy contract is renewed, once the new contract with the new term and rent is signed. Start early: an expired ID or a detail that does not match can slow things down." },
        ],
      },
      {
        heading: "The steps, as the Dubai Land Department sets them out",
        blocks: [
          { steps: [
            "Log in to the Ejari system or the Dubai REST app and choose the service.",
            "Fill in the required information and upload the documents.",
            "Pay the service fees, if any.",
            "A Dubai Land Department employee reviews and approves the request.",
            "You receive the e-contract registration certificate by email.",
          ] },
        ],
      },
      {
        heading: "Documents",
        blocks: [
          { list: [
            "Online (Dubai REST app or Ejari system): a copy of the unified tenancy contract.",
            "At a Real Estate Services Trustee Centre: the original unified tenancy contract and the applicant's Emirates ID.",
            "If someone applies for you: an official power of attorney.",
          ] },
          { note: "Fees are shown at payment. Published figures differ between sources, so rely on the amount the app or centre shows you." },
        ],
      },
      {
        heading: "Common hold-ups",
        blocks: [
          { list: [
            "An Emirates ID or passport that has expired since the last registration.",
            "Names or unit details that do not match the title deed or the previous certificate.",
            "A contract that is not on the unified tenancy contract form.",
          ] },
        ],
      },
    ],
    sources: [
      { name: "Dubai Land Department, register or renew a tenancy contract", url: "https://dubailand.gov.ae/en/eservices/register-renew-ejari-contract/" },
      { name: "DEWA, activation of electricity and water (move-in)", url: "https://www.dewa.gov.ae/en/consumer/supply-management/activation-of-electricity-water-move-in" },
    ],
    service: "documents-and-renewals",
  },
  {
    slug: "dewa-move-in-move-out-guide",
    title: "DEWA when you move in, move out or move house",
    description:
      "How DEWA activation, transfer and deactivation work for a Dubai villa: the Ejari link, the AED 4,000 villa security deposit, the final bill and your refund.",
    checked: "2026-09-26",
    summary: [
      "For tenants, DEWA activation starts from your Ejari registration.",
      "Villas carry a refundable AED 4,000 security deposit (AED 2,000 for apartments), plus an activation fee.",
      "Moving within Dubai? Use Move-to and your deposit moves with you.",
      "Moving out, DEWA sets your deposit against the final bill and refunds any balance.",
    ],
    sections: [
      {
        heading: "Moving in",
        blocks: [
          { steps: [
            "Once your Ejari is issued, DEWA sends a welcome notification with your account number, the security deposit and a payment link.",
            "Pay the security deposit and the activation fee.",
            "Electricity and water are activated within 15 working hours of payment, according to DEWA.",
          ] },
          { p: "The refundable security deposit for a residential villa is AED 4,000, and AED 2,000 for an apartment. The activation fee is shown when you pay." },
        ],
      },
      {
        heading: "Moving house within Dubai (Move-to)",
        blocks: [
          { list: [
            "Apply for Move-to on the DEWA website or app, with the date you leave the old home and the Ejari number of the new one.",
            "Settle anything outstanding on the old account first.",
            "Your deposit transfers to the new home. Moving from an apartment to a villa, you pay the difference.",
            "The final bill for the old home still has to be paid.",
          ] },
        ],
      },
      {
        heading: "Moving out",
        blocks: [
          { steps: [
            "Log in to DEWA with your DEWA ID or UAE PASS and choose the account.",
            "Pay any outstanding amount.",
            "Choose the date and time you move out. Supply is switched off then and final readings are taken.",
            "Choose how to receive your deposit refund: IBAN, cheque, or transfer to another DEWA account. For IBAN, attach bank proof in the account holder's name.",
            "The final bill arrives by email within 24 working hours of the move-out date.",
          ] },
          { p: "DEWA sets your security deposit against the final bill. If the bill is higher you pay the difference; if it is lower, the balance is refunded." },
          { note: "When a landlord cancels the Ejari, DEWA contacts the tenant to arrange deactivation, and a clearance certificate follows once the final bill is settled." },
        ],
      },
    ],
    sources: [
      { name: "DEWA, activation of electricity and water (move-in)", url: "https://www.dewa.gov.ae/en/consumer/supply-management/activation-of-electricity-water-move-in" },
      { name: "DEWA, transfer of electricity and water (move-to)", url: "https://www.dewa.gov.ae/en/consumer/supply-management/transfer-of-electricity-water-move-to" },
      { name: "DEWA, deactivation of electricity and water (move-out)", url: "https://dewa.gov.ae/en/consumer/supply-management/deactivation-of-electricity-water-move-out" },
      { name: "Gulf News, deactivating DEWA when moving out", url: "https://gulfnews.com/living-in-uae/housing/how-to-deactivate-dewa-when-moving-out-of-a-dubai-home-1.500645814" },
    ],
    service: "documents-and-renewals",
  },
  {
    slug: "ac-and-water-heater-care-dubai",
    title: "Looking after your AC and water heater in Dubai",
    description:
      "Simple care for the two systems a Dubai villa relies on most: AC filters, settings, servicing and replacement, and the water heater checks people forget.",
    checked: "2026-09-26",
    summary: [
      "Clean AC filters at least monthly in summer and set thermostats to 24°C.",
      "Service each unit before the summer, and plan replacements at around ten years.",
      "Water heaters build up sediment quietly; have the heater and its safety valve checked.",
    ],
    sections: [
      {
        heading: "Air conditioning",
        blocks: [
          { list: [
            "Clean filters regularly, at least once a month during summer. DEWA notes that clogged filters block airflow and cut efficiency significantly.",
            "Set thermostats to 24°C and use auto mode. Each degree higher can save up to 5% on AC consumption.",
            "Keep doors and windows closed when the AC is on, and seal gaps around them.",
            "Have every unit professionally serviced before the summer, not during it.",
            "Plan replacements. DEWA puts the optimal life of an AC at about ten years, and newer efficient units can cut cooling consumption by up to 25%.",
          ] },
        ],
      },
      {
        heading: "Signs an AC needs a visit",
        blocks: [
          { list: [
            "Weak or warm air from one unit while others are fine.",
            "Water dripping indoors, or ice on the pipework.",
            "New rattles, clicks or a burning smell.",
            "A power bill that jumps without a change in use.",
          ] },
        ],
      },
      {
        heading: "The water heater",
        blocks: [
          { list: [
            "Sediment builds up inside over time, and the first sign is often weaker hot water.",
            "The pressure-relief valve protects the heater and is the part most often forgotten. Have it checked when the heater is serviced.",
            "Look for rust, damp or weeping around the heater and its connections.",
            "If you travel, switch it off while the house is empty.",
          ] },
          { note: "Anything electrical or pressurised is a job for a qualified technician. If a heater leaks or smells of burning, switch it off at the isolator and call for help." },
        ],
      },
    ],
    sources: [
      DEWA_COOLING,
      DEWA_APPLIANCES,
    ],
    service: "house-management",
  },
];

export function guideBySlug(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}
