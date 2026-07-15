export default function TechBadge({ tech }: { tech: string }) {
  return (
    <span className="rounded-full border border-[#378ADD]/40 bg-[#378ADD]/10 px-3 py-1 font-mono text-xs text-[#378ADD]">
      {tech}
    </span>
  );
}
