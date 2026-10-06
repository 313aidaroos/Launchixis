import LaunchixisFeed from "./LaunchixisFeed";
import "./feed.css";
export const metadata = { title: "Community — Launchixis", description: "Posts from every Apixis company, in one feed." };
export default function FeedPage() {return <main className="shell"><header className="top"><div><p className="eyebrow">The Apixis community</p><h1>Every company. <em>One feed.</em></h1><p className="lede">Share what you’re building. Discover ideas, follow people, and connect across the Apixis family.</p></div></header><LaunchixisFeed/></main>;}
