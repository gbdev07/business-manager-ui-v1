import { SiteShell } from "@/components/brand/SiteShell";
import { ApplicationsSection } from "@/components/sections/ApplicationsSection";
import { ComponentsSection } from "@/components/sections/ComponentsSection";
import { ConceptSection } from "@/components/sections/ConceptSection";
import { GraphicsSection } from "@/components/sections/GraphicsSection";
import { HeroSection } from "@/components/sections/HeroSection";
import { LogosSection } from "@/components/sections/LogosSection";
import { PaletteSection } from "@/components/sections/PaletteSection";
import { TypographySection } from "@/components/sections/TypographySection";

export default function Home() {
  return (
    <SiteShell>
      <main>
        <HeroSection />
        <ConceptSection />
        <LogosSection />
        <PaletteSection />
        <TypographySection />
        <GraphicsSection />
        <ApplicationsSection />
        <ComponentsSection />
      </main>
    </SiteShell>
  );
}
