"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteJobButton({ jobId }: { jobId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setIsDeleting(false);
        setConfirming(false);
      }
    } catch {
      setIsDeleting(false);
      setConfirming(false);
    }
  }

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="font-mono text-xs text-[#7C8494] hover:text-[#E5534B]"
      >
        Excluir vaga
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 font-mono text-xs">
      <span className="text-[#7C8494]">Confirmar exclusão?</span>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="text-[#E5534B] hover:underline disabled:opacity-50"
      >
        {isDeleting ? "Excluindo..." : "Sim, excluir"}
      </button>
      <button onClick={() => setConfirming(false)} className="text-[#7C8494] hover:underline">
        Cancelar
      </button>
    </div>
  );
}
