import { CompositionGallery } from "./composition-gallery.js";
import { ElementGallery } from "./element-gallery.js";
import { ModuleAccents } from "./module-accents.js";
import { SurfaceSnapshots } from "./surface-snapshots.js";
import { Swatches } from "./swatches.js";
import { TypeSpecimen } from "./type-specimen.js";

export function DesignSystemShowcase() {
  return (
    <div
      className="mx-auto max-w-5xl space-y-16 px-6 py-10"
      data-testid="design-system-reference"
    >
      <header>
        <div className="mb-2 text-kicker font-medium text-muted-foreground uppercase">
          DESIGN SYSTEM
        </div>
        <h1 className="mb-2 text-display font-bold text-foreground">
          Visual Architecture
        </h1>
        <p className="max-w-prose text-body text-muted-foreground">
          Quiet Editorial. Visual contract for __APP_NAME__. Dev-only. Deep teal
          primary, vivid orange spotlight, warm-paper neutrals, editorial type.
        </p>
      </header>
      <Swatches />
      <TypeSpecimen />
      <ElementGallery />
      <CompositionGallery />
      <SurfaceSnapshots />
      <ModuleAccents />
    </div>
  );
}
