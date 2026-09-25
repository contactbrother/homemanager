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
      className={`bg-[var(--surface)] rounded-[var(--r-lg)] border border-[var(--line)] ${className}`}
    >
      {children}
    </Tag>
  );
}
