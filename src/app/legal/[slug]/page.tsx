import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LegalPage } from "@/components/legal/legal-page";
import {
  LEGAL_META,
  LEGAL_SLUGS,
  LEGAL_UPDATED,
  isLegalSlug,
  type LegalSlug,
} from "@/lib/legal-content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return LEGAL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!isLegalSlug(slug)) return { title: "Legal" };
  const page = LEGAL_META[slug];
  return {
    title: page.title,
    description: page.description,
  };
}

export default async function LegalSlugPage({ params }: Props) {
  const { slug } = await params;
  if (!isLegalSlug(slug)) notFound();
  const page = LEGAL_META[slug as LegalSlug];
  return (
    <LegalPage
      title={page.title}
      updated={LEGAL_UPDATED}
      sections={page.sections}
    />
  );
}
