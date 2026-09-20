export function Card({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "div" | "li" | "section" | "article";
}) {
  return (
    <Tag
      className={`bg-[var(--surface)] rounded-[var(--r-md)] border border-[var(--line)] shadow-[0_1px_2px_rgba(11,20,17,0.04)] ${className}`}
    >
      {children}
    </Tag>
  );
}
