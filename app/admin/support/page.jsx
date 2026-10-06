import { redirect } from "next/navigation";
import { currentUser, isVerifiedAdmin } from "../../../lib/server-auth.js";
import SupportQueue from "./queue.jsx";
export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await currentUser();
  if (!user) redirect("/login?next=%2Fadmin%2Fsupport");
  if (!isVerifiedAdmin(user)) redirect("/");
  return <SupportQueue />;
}
