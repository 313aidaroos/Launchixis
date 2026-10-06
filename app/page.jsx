import Board from "./board.jsx";
import { currentUser, isVerifiedAdmin } from "../lib/server-auth.js";
import { SignInWithApixis } from "../components/SignInWithApixis";
export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await currentUser();
  if (user?.email_confirmed_at) return <Board admin={isVerifiedAdmin(user)} />;
  return <main className="shell">
    <header className="top"><div><div className="logo">LAUNCHIXIS</div><h1>Your company. <em>Your launch.</em></h1>
      <p className="lede">Build a clear launch plan in a private workspace. Work through 13 milestones, record evidence, and get launch advice from Cixy.</p>
      <SignInWithApixis next="/" />
    </div></header>
    <section className="panel"><h2>From idea to a launch you can verify</h2>
      <ol><li>Sign in with your Apixis ID and create your company workspace.</li><li>Unlock the Launch Checklist for 1,000 Ixis, one time.</li><li>Download your guide, edit your private checklist, and record progress.</li></ol>
      <p>Your workspace is visible to you and Launchixis administrators. The Apixis operations board is private to administrators.</p>
      <a className="btn" href="/pricing">See the checklist</a>
    </section>
    <nav className="row" aria-label="Explore"><a href="/companies">Apixis Companies</a><a href="/feed">Community feed</a><a href="/support">Support</a><a href="/login">Existing account sign in</a></nav>
    <footer className="foot">LAUNCHIXIS · A Apixis Company</footer>
  </main>;
}
