import { auth } from "@/auth";
import DashboardContent from "@/components/DashboardContent";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  return <DashboardContent session={session} />;
}
