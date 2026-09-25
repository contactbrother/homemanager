/** What each service includes, in Dar's own words. Scope as defined by Dar. */
export interface ServiceDetail {
  lead: string;
  included: Array<[string, string]>;
  forWho: string[];
  steps: Array<[string, string]>;
  faq: Array<[string, string]>;
}

export const SERVICE_DETAILS: Record<string, ServiceDetail> = {
  "house-management": {
    lead: "One team that plans your villa's maintenance, finds and briefs the right vendor, checks the quote with you and follows the job through until it is done properly.",
    included: [
      ["A maintenance calendar for your villa", "AC units, water heater, pumps, pool, pest control and the rest, each serviced before it is due rather than when it breaks."],
      ["Vendor coordination", "We find the right vendor, book the visit, brief them on the problem and access, and follow up until the job is finished."],
      ["Quotes checked with you", "We look at every quote before it reaches you, so you approve with the facts. Nothing that costs money is booked without your say."],
      ["Your home's register", "Every AC unit, heater and pump recorded with its service and warranty dates, so nothing is forgotten when a unit is replaced."],
      ["Requests any time", "Send a request from your phone, say how urgent it is, and see every update from the team in one thread."],
      ["A record of everything", "Each job and decision is kept in your home file, useful when you renew, sell or hand over the villa."],
    ],
    forWho: [
      "Families who want one number to call for anything about the house.",
      "Owners and tenants who are short on time to chase vendors.",
      "Anyone who has found out about a service only when something stopped working.",
    ],
    steps: [
      ["You send a request", "Or we raise one ourselves when a service is due."],
      ["We find the right vendor", "And brief them on the problem, your villa and access."],
      ["You approve the quote", "We check it first and tell you what we think."],
      ["We follow it through", "Until the work is done, and record it in your home file."],
    ],
    faq: [
      ["Do you send your own technicians?", "No. We coordinate trusted vendors and manage the job, so you get the right specialist for each task and one team accountable for the result."],
      ["What if it is urgent?", "Send the request as Emergency, then message us on WhatsApp so we see it straight away."],
    ],
  },
  "documents-and-renewals": {
    lead: "Your home's and your family's documents in one private place, with every expiry date tracked and a reminder before anything lapses.",
    included: [
      ["Your home's documents", "Title deed, Ejari, DEWA bills, insurance and service contracts, stored privately in your home file."],
      ["Your family's deadlines", "Visas, Emirates IDs, passports, car registration and school deadlines, tracked alongside the house."],
      ["Reminders before anything lapses", "An email 30, 14 and 3 days before each expiry, and on the day. Your home screen always shows what is due in the next 30 days."],
      ["Ask Dar to handle it", "One tap on any renewal sends it to the team, and we take it from there with you."],
      ["Open anything in seconds", "View, download or share any document from your phone when a form or an agent asks for it."],
      ["Private by design", "Only you and the Dar team can see your documents. Files open through links that expire after a minute."],
    ],
    forWho: [
      "Families juggling several visas, IDs and cars on different renewal cycles.",
      "Anyone who has searched three inboxes for a tenancy contract.",
      "Households where one person carries all the dates in their head.",
    ],
    steps: [
      ["Share what you have", "Upload documents yourself or send them to us to add."],
      ["We record the dates", "Every expiry and renewal goes into your home file."],
      ["You are reminded in time", "By email and on your home screen, well before the deadline."],
      ["Ask us to handle it", "And follow it in the same place as everything else."],
    ],
    faq: [
      ["Can I turn the reminder emails off?", "Yes, in Account at any time. Your home screen still shows what is due."],
      ["Who can see my documents?", "Only you and the Dar team. We never share them with vendors unless a job needs a specific document and you agree."],
      ["What if I do not have a document to hand?", "Tell us the expiry date and we will track it anyway. You can add the file later."],
    ],
  },
  "home-watch": {
    lead: "Going away for the summer? Dar inspects your empty villa from June to August, sends you a photo report after every visit, and arranges any fix that is needed.",
    included: [
      ["Summer inspections", "Visits to your empty villa through June, July and August, on a schedule agreed with you before you travel."],
      ["A photo report after every visit", "So you can see the house is fine without having to ask anyone."],
      ["The things that fail quietly", "AC, water leaks, the pool, garden and irrigation, doors, windows and anything else you ask us to check."],
      ["Fixes arranged, with your approval", "If something needs attention, we tell you, check the quote with you, and arrange the vendor."],
      ["Keys and access handled", "Access details are recorded privately in your home file, so every visit goes smoothly."],
      ["One thread for the summer", "Every report, question and fix in your home file, not scattered across messages."],
    ],
    forWho: [
      "Families who leave Dubai for the summer.",
      "Owners whose villa sits empty between tenants or during long trips.",
      "Anyone who has come home to a failed AC or a leak that ran for weeks.",
    ],
    steps: [
      ["Tell us your dates", "And anything particular about the house."],
      ["Agree the visit plan", "What we check and how often, before you travel."],
      ["Get your reports", "With photos after every visit."],
      ["Come home to no surprises", "Anything that needed fixing is already handled."],
    ],
    faq: [
      ["How often do you visit?", "We agree the schedule with you before you travel, based on your home and how long you will be away."],
      ["Do I need to be in Dubai to approve a repair?", "No. You approve quotes from your phone wherever you are."],
      ["Should I also register with Dubai Police?", "Yes. Dubai Police offers a free home security service for villa residents who are travelling, and it works well alongside home watch."],
    ],
  },
};
