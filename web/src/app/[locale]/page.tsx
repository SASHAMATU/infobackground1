import { setRequestLocale } from "next-intl/server";
import Hero from "@/components/Hero";
import Approach from "@/components/Approach";
import Services from "@/components/Services";
import Process from "@/components/Process";
import WhyUs from "@/components/WhyUs";
import Founder from "@/components/Founder";
import Testimonials from "@/components/Testimonials";
import Faq from "@/components/Faq";
import Contact from "@/components/Contact";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <Approach />
      <Services />
      <Process />
      <WhyUs />
      <Founder />
      <Testimonials />
      <Faq />
      <Contact />
    </>
  );
}
