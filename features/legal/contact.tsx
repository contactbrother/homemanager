/** How to reach the team, for the legal pages. WhatsApp only until an email is set. */
export function LegalContact() {
  const number = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP?.replace(/[^\d]/g, "");
  const email = process.env.NEXT_PUBLIC_SUPPORT_EMAIL;
  return (
    <p>
      {number ? (
        <>
          Message us on <a href={`https://wa.me/${number}`}>WhatsApp</a>
        </>
      ) : (
        "Message the Dar team"
      )}
      {email ? (
        <>
          {" "}or email <a href={`mailto:${email}`}>{email}</a>
        </>
      ) : null}
      .
    </p>
  );
}
