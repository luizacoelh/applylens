export default function DetailSection({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-[#2A2D3A] pt-4">
      <p className="font-mono text-xs text-[#7C8494] uppercase tracking-wide mb-2">{label}</p>
      {children}
    </div>
  );
}
