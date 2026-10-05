import { redirect } from "next/navigation";
import { roleHome } from "@/lib/auth-routes";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.mustChangePassword) redirect("/change-password");
  redirect(roleHome[user.role]);
}
