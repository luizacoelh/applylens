// Item de checklist somente leitura. Persistir o estado "concluído" por item
// exigiria mudar o schema (checklist deixaria de ser um array simples de
// strings) — deixado como próximo passo natural, fora do escopo atual do MVP.
export default function ChecklistItem({ text }: { text: string }) {
  return (
    <li className="flex gap-2 text-sm text-[#C4C7D0]">
      <span className="text-[#378ADD]">□</span>
      {text}
    </li>
  );
}
