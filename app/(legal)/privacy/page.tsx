import { LegalContact } from "@/features/legal/contact";

export const metadata = { title: "Privacy policy" };

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy policy</h1>
      <p className="updated">Last updated 26 September 2026</p>

      <h2>Who we are</h2>
      <p>
        Dar helps families in Dubai run their homes: documents and renewals, maintenance,
        repairs and the vendors who carry them out. This policy explains what personal data we
        hold, why, and the choices you have. We handle personal data in line with the UAE
        Personal Data Protection Law (Federal Decree-Law No. 45 of 2021).
      </p>

      <h2>What we collect</h2>
      <ul>
        <li>Account details: your name, email address, phone number and password (never stored in readable form).</li>
        <li>Your home: its name, community, address, number of bedrooms, access notes, key holders and emergency contacts you give us.</li>
        <li>Documents you or the team upload, such as title deeds, Ejari, DEWA bills, insurance and service contracts, with their expiry dates.</li>
        <li>The things in your home that you record, such as AC units and water heaters, with service and warranty dates.</li>
        <li>Your requests and the notes, updates and decisions in each one.</li>
        <li>Enquiries you send through our website: your name, phone or email, community and message.</li>
        <li>Basic technical data needed to keep you signed in and the service secure. For website enquiries we keep only a scrambled (hashed) form of your connection address, to stop abuse.</li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To provide the service you signed up for: keeping your home file, tracking renewals and handling your requests.</li>
        <li>To remind you when something is due. You can turn reminder emails off in Account.</li>
        <li>To arrange work at your home with vendors.</li>
        <li>To keep the service secure and to meet our legal obligations.</li>
      </ul>
      <p>We do not sell your data and we do not use it for advertising.</p>

      <h2>Who we share it with</h2>
      <ul>
        <li>The Dar team, who need it to look after your home.</li>
        <li>Vendors we arrange for you, who receive only what they need for the job, such as the address, access details and the problem to fix.</li>
        <li>Service providers who host our systems, store files and send emails for us, under contracts that protect your data.</li>
        <li>Authorities, only where the law requires it.</li>
      </ul>

      <h2>Where it is stored</h2>
      <p>
        Your data is held on secure cloud infrastructure. Some of our service providers may
        process data outside the UAE; where they do, we rely on the safeguards the law requires.
        Documents are stored privately and open only through links that expire after a minute.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep your data while your account is open. When you close it, we delete it, except
        where the law requires us to keep a record for longer, and then only for that period.
      </p>

      <h2>Your rights</h2>
      <ul>
        <li>See the personal data we hold about you and receive a copy.</li>
        <li>Correct anything that is wrong.</li>
        <li>Ask us to delete your data, using Delete my account in Account or by messaging us.</li>
        <li>Object to or limit how we use it, and withdraw consent you have given.</li>
        <li>Complain to the UAE Data Office if you are unhappy with how we have handled your data.</li>
      </ul>

      <h2>Security</h2>
      <p>
        Access to your home file is limited to you and the Dar team, enforced in our database
        for every request. Passwords are never stored in readable form.
      </p>

      <h2>Children</h2>
      <p>Dar accounts are for adults. We do not knowingly collect data from anyone under 18.</p>

      <h2>Changes to this policy</h2>
      <p>If we make a material change, we will tell you in the app or by email before it takes effect.</p>

      <h2>Contact</h2>
      <LegalContact />
    </>
  );
}
