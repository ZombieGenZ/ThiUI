import { Armchair, ArrowUpRight, Maximize, Ruler, Sofa, UtensilsCrossed } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { usePageMetadata } from '../hooks/usePageMetadata';

const livingRoomSizes = [
  { label: 'Loveseat (2-seat sofa)', dimensions: 'Length 60" - 72"', notes: 'Ideal for apartments or secondary seating areas.' },
  { label: 'Standard 3-seat sofa', dimensions: 'Length 78" - 90"', notes: 'A dependable choice for most living rooms.' },
  { label: 'Sectional sofa', dimensions: 'Length 90" - 140"', notes: 'Leave at least 36" of walkway in front.' },
  { label: 'Coffee table', dimensions: '48" - 54" (for sofas 84" - 96")', notes: 'Maintain 16"-18" of clearance from the sofa.' },
  { label: 'Media console', dimensions: '6" wider than the TV on each side', notes: 'Aim for seated eye height around 42".' },
  { label: 'Living room rug', dimensions: '8 ft x 10 ft', notes: 'Anchor front legs of seating on the rug.' },
];

const bedroomSizes = [
  { label: 'Twin', dimensions: '39" x 75"', notes: 'Great for kids rooms or guest beds.' },
  { label: 'Full', dimensions: '54" x 75"', notes: 'Works well in single bedrooms or studios.' },
  { label: 'Queen', dimensions: '60" x 80"', notes: 'The most versatile size for couples.' },
  { label: 'King', dimensions: '76" x 80"', notes: 'Requires rooms at least 12 ft x 12 ft.' },
  { label: 'California King', dimensions: '72" x 84"', notes: 'Extra length for taller sleepers.' },
  { label: 'Nightstand', dimensions: 'Height 24" - 28"', notes: 'Keep level with your mattress top.' },
  { label: 'Six-drawer dresser', dimensions: '60" W x 18" D x 34" H', notes: 'Leave 36" clear to open drawers comfortably.' },
];

const diningSizes = [
  { label: 'Table for 4', dimensions: '36" x 48"', notes: 'Keep at least 36" between chairs and the wall.' },
  { label: 'Table for 6', dimensions: '36" x 72"', notes: 'Allow 24" of space for each seat.' },
  { label: 'Table for 8', dimensions: '40" x 96"', notes: 'Ideal for larger dining rooms and gatherings.' },
  { label: 'Dining chair', dimensions: 'Seat height 18" - 20"', notes: 'Maintain 10" - 12" between seat and tabletop.' },
  { label: 'Counter-height stool', dimensions: 'Seat height 24" - 26"', notes: 'Pair with counters that are 36" high.' },
  { label: 'Bar-height stool', dimensions: 'Seat height 30" - 32"', notes: 'Best for bar tops around 42" high.' },
];

const measurementTips = [
  'Measure the length, width, and height of the room and note doors, windows, and outlets.',
  'Leave 30"-36" of clearance around major furniture for easy movement.',
  'Reserve 24" behind chairs at dining tables or desks for pull-back space.',
  'Use painter’s tape on the floor to map furniture footprints before purchasing.',
  'Consider ceiling height and fixture placement when adding tall pieces or canopy beds.',
];

export function SizeGuidePage() {
  usePageMetadata({
    title: 'Furniture Size Guide',
    description:
      'Use detailed size charts for living room, bedroom, and dining furniture plus expert measurement tips to plan your space.',
  });

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-80 bg-[url('https://images.pexels.com/photos/6585612/pexels-photo-6585612.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/40" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Size Guide' }]} />
            <div className="mt-6 max-w-3xl">
              <h1 className="font-display text-4xl md:text-5xl text-white mb-4">Size Guide</h1>
              <p className="text-white/80 text-lg">
                Explore standard measurements and pro tips to ensure FurniCraft furniture fits perfectly in your space.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Sofa className="w-8 h-8 text-brand-600" />
            <h2 className="font-display text-3xl text-neutral-900">Living Room Dimensions</h2>
          </div>
          <p className="text-neutral-600 max-w-3xl">
            Keep sofas, coffee tables, and rugs in proportion to maintain an open, airy feel. Measure the distance between key points like the TV, seating, and walkways before you buy.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {livingRoomSizes.map((item) => (
              <div key={item.label} className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <h3 className="font-semibold text-lg text-neutral-900">{item.label}</h3>
                <p className="text-sm text-brand-600 font-medium mt-2">{item.dimensions}</p>
                <p className="text-sm text-neutral-600 mt-3">{item.notes}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <Armchair className="w-8 h-8 text-brand-600" />
            <h2 className="font-display text-3xl text-neutral-900">Bedroom Dimensions</h2>
          </div>
          <p className="text-neutral-600 max-w-3xl">
            Balance the bed, storage, and pathways so the room stays restful. Leave clearance for opening wardrobes and moving comfortably around the bed.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bedroomSizes.map((item) => (
              <div key={item.label} className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <h3 className="font-semibold text-lg text-neutral-900">{item.label}</h3>
                <p className="text-sm text-brand-600 font-medium mt-2">{item.dimensions}</p>
                <p className="text-sm text-neutral-600 mt-3">{item.notes}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <UtensilsCrossed className="w-8 h-8 text-brand-600" />
            <h2 className="font-display text-3xl text-neutral-900">Dining Room Dimensions</h2>
          </div>
          <p className="text-neutral-600 max-w-3xl">
            Make dining comfortable by giving each guest enough room and pairing chairs with the correct table height. Use these dimensions to plan seating for every gathering.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {diningSizes.map((item) => (
              <div key={item.label} className="p-6 rounded-2xl border border-neutral-200 bg-white shadow-sm">
                <h3 className="font-semibold text-lg text-neutral-900">{item.label}</h3>
                <p className="text-sm text-brand-600 font-medium mt-2">{item.dimensions}</p>
                <p className="text-sm text-neutral-600 mt-3">{item.notes}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <Ruler className="w-8 h-8 text-brand-600" />
              <h2 className="font-display text-3xl text-neutral-900">How to Measure Your Space</h2>
            </div>
            <p className="text-neutral-600">
              Sketch your room or use a planning app to log dimensions plus doorways, windows, outlets, and vents. Sharing these details helps our stylists recommend the perfect pieces.
            </p>
            <ul className="space-y-3 text-sm text-neutral-600">
              {measurementTips.map((tip) => (
                <li key={tip} className="flex items-start gap-3">
                  <span className="mt-1 inline-flex w-2.5 h-2.5 rounded-full bg-brand-600" aria-hidden="true" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
            <a
              href="https://planner.roomsketcher.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              <ArrowUpRight className="w-4 h-4" />
              Launch Room Planner
            </a>
          </div>
          <div className="relative">
            <img
              src="https://images.pexels.com/photos/209224/pexels-photo-209224.jpeg?auto=compress&cs=tinysrgb&w=1200"
              alt="Illustration of a floor plan sketch with measuring tools"
              className="w-full rounded-3xl shadow-2xl"
            />
            <div className="absolute -bottom-6 left-6 bg-white border border-neutral-200 rounded-2xl shadow-lg p-4 flex items-center gap-3">
              <Maximize className="w-8 h-8 text-brand-600" />
              <div>
                <p className="text-sm font-semibold text-neutral-900">Tip: Mark furniture footprints</p>
                <p className="text-xs text-neutral-500">Use painter’s tape to simulate actual furniture footprints on the floor.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SizeGuidePage;
