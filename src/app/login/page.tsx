import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/login-form";
import { getCurrentUser } from "@/lib/auth";
import { roleHome } from "@/lib/auth-routes";
import { AuthFrame } from "@/components/layout/auth-frame";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const user = await getCurrentUser();
  if (user?.mustChangePassword) redirect("/change-password");
  if (user) redirect(roleHome[user.role]);

  const params = await searchParams;

  return (
    <AuthFrame>
        <p className="eyebrow">AKSES SISTEM</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950">Masuk ke ThesisTrack</h1>
        <p className="mb-6 mt-2 text-slate-600">Gunakan akun FTMM yang telah terdaftar.</p>
        {params.passwordChanged === "1" ? (
          <p className="mb-5 rounded bg-green-50 p-3 text-sm text-green-800">
            Password berhasil diubah. Silakan masuk kembali.
          </p>
        ) : null}
        <LoginForm />
    </AuthFrame>
  );
}
