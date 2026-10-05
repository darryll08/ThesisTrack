import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import { requireAuthenticatedUser } from "@/lib/auth";
import { roleHome } from "@/lib/auth-routes";
import { AuthFrame } from "@/components/layout/auth-frame";

export default async function ChangePasswordPage() {
  const user = await requireAuthenticatedUser();
  if (!user.mustChangePassword) redirect(roleHome[user.role]);

  return (
    <AuthFrame>
        <p className="eyebrow">KEAMANAN AKUN</p>
        <h1 className="text-2xl font-bold">Buat password baru</h1>
        <p className="mb-6 mt-2 text-slate-600">
          {user.nama}, perbarui password sementara sebelum menggunakan ThesisTrack.
        </p>
        <ChangePasswordForm />
    </AuthFrame>
  );
}
