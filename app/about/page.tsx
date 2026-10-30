import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Our story",
  description: "The Dwears Collections approach to thoughtful secondhand style.",
};

export default function AboutPage() {
  return <main className="catalog-page about-page"><div className="page-intro"><div className="eyebrow">The Dwears difference</div><h1>Good clothes.<br />Good stories.</h1><p>We believe the best style doesn’t have to be brand new.</p></div><section className="about-copy"><p>Every Dwears piece is selected for its quality, character, and potential for a second life. We share clear details so you can choose a piece that feels like it belongs in your wardrobe.</p><p>Thrifting makes personal style more fun and helps keep wearable clothes in circulation. We’re glad you’re here for the next chapter.</p><Link className="button" href="/collections">Find your kind of find <span>→</span></Link></section></main>;
}
