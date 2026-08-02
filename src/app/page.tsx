import { TopBar } from "@/components/layout/top-bar";
import { Navbar } from "@/components/layout/navbar";
import { SiteFooter } from "@/components/layout/site-footer";
import { HeroSection } from "@/components/sections/hero-section";
import { FeaturedBrandsSection } from "@/components/sections/featured-brands-section";
import { ShopByCategorySection } from "@/components/sections/shop-by-category-section";
import { FeaturedProductsSection } from "@/components/sections/featured-products-section";
import { FlashDealsSection } from "@/components/sections/flash-deals-section";
import { RefurbishedCollectionSection } from "@/components/sections/refurbished-collection-section";
import { WhyChooseUsSection } from "@/components/sections/why-choose-us-section";
import { CustomerReviewsSection } from "@/components/sections/customer-reviews-section";
import { FaqSection } from "@/components/sections/faq-section";
import { NewsletterSection } from "@/components/sections/newsletter-section";

/** Flutter LandingPage — section order is source of truth */
export default function HomePage() {
  return (
    <>
      <TopBar />
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <FeaturedBrandsSection />
        <ShopByCategorySection />
        <FeaturedProductsSection />
        <FlashDealsSection />
        <RefurbishedCollectionSection />
        <WhyChooseUsSection />
        <CustomerReviewsSection />
        <FaqSection />
        <NewsletterSection />
        <SiteFooter />
      </main>
    </>
  );
}
