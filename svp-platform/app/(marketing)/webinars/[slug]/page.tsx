import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";
import type { WebinarDoc } from "@/lib/types/webinar";
import { WebinarLandingTemplate } from "@/components/webinar/WebinarLandingTemplate";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getWebinar(slug: string): Promise<WebinarDoc | null> {
  if (!db) return null;

  try {
    const webinarsRef = collection(db, COLLECTIONS.WEBINARS);
    const q = query(
      webinarsRef,
      where("slug", "==", slug),
      where("status", "==", "published")
    );
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as WebinarDoc;
  } catch (error) {
    console.error("Error fetching webinar:", error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const webinar = await getWebinar(slug);

  if (!webinar) {
    return {
      title: "Webinar Not Found",
    };
  }

  return {
    title: webinar.seo?.landingPage?.metaTitle || webinar.title,
    description: webinar.seo?.landingPage?.metaDescription || webinar.shortDescription,
    keywords: webinar.seo?.landingPage?.keywords,
    openGraph: webinar.seo?.landingPage?.ogImage
      ? {
          images: [webinar.seo.landingPage.ogImage],
        }
      : undefined,
  };
}

export default async function WebinarLandingPage({ params }: PageProps) {
  const { slug } = await params;
  const webinar = await getWebinar(slug);

  if (!webinar) {
    notFound();
  }

  return <WebinarLandingTemplate webinar={webinar} />;
}
