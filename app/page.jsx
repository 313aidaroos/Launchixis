import Board from "./board.jsx";
import LaunchHero, { AskCixy } from "../components/LaunchHero";
import { currentUser, isVerifiedAdmin } from "../lib/server-auth.js";
export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await currentUser();
  if (user?.email_confirmed_at) return <Board admin={isVerifiedAdmin(user)} />;
  return <main className="home-page"><LaunchHero/>
    <section id="workspace" className="welcome-workspace pearl">
      <div className="section-heading"><div><p className="eyebrow">From possibility to progress</p><h2>A place for your next big idea.</h2></div><span className="privacy-label">♧ Your own private workspace</span></div>
      <div className="welcome-steps"><article><span className="stage-number">01</span><h3>Make it yours</h3><p>Sign in with Apixis and create a workspace for your company.</p></article><article><span className="stage-number">02</span><h3>Find your next step</h3><p>Unlock your 13-step checklist and practical launch guide for 1,000 Ixis, one time.</p></article><article><span className="stage-number">03</span><h3>Bring it to life</h3><p>Keep notes, record evidence, and see your progress take shape.</p></article></div>
      <div className="welcome-bottom" id="milestones"><div><h3>A clear plan. Room to make it yours.</h3><p>Your milestones, company details, and notes stay together. You and Launchixis administrators can access your workspace.</p><a className="btn" href="/pricing">See what’s included ↗</a></div><div className="focus-panel" id="notes"><span className="eyebrow">A little help from Cixy</span><h3>Start with a good question.</h3><p>Explore your audience, sharpen your idea, and plan your next move. Cixy launch advice is included with the checklist.</p><AskCixy/></div></div>
    </section>
    <section className="family-invite"><div><p className="eyebrow">One family. Many possibilities.</p><h2>Meet the Apixis Companies.</h2><p>Explore the people, products, and ideas in the shared Ixis ecosystem.</p></div><a className="btn ghost" href="/companies">Explore all 15 companies ↗</a></section>
  </main>;
}
