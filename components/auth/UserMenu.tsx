import Link from "next/link";
import { signOut } from "@/auth";
import type { Session } from "next-auth";

export default function UserMenu({ user }: { user: Session["user"] }) {
  return (
    <div className="flex items-center gap-3">
      {user.image && (
        // eslint-disable-next-line @next/next/no-img-element -- avatar vem de host externo (Google/GitHub); usar <img> evita ter que configurar remotePatterns só pra isso
        <img
          src={user.image}
          alt={user.name ?? "Usuário"}
          className="h-8 w-8 rounded-full border border-[#2A2D3A]"
        />
      )}
      <span className="hidden text-sm text-[#C4C7D0] sm:inline">{user.name ?? user.email}</span>
      <Link href="/perfil" className="font-mono text-xs text-[#7C8494] hover:text-[#378ADD]">
        Perfil
      </Link>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button type="submit" className="font-mono text-xs text-[#7C8494] hover:text-[#E5534B]">
          Sair
        </button>
      </form>
    </div>
  );
}
