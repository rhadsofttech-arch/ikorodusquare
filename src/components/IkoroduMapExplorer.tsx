import React, { useState } from 'react';
import {
  MapPin,
  Store,
  Star,
  CheckCircle2,
  MessageSquare,
  ZoomIn,
  ZoomOut,
  Navigation,
  X,
  Filter,
  ShoppingBag,
} from 'lucide-react';
import { Vendor, Product, IkoroduArea } from '../types';

interface IkoroduMapExplorerProps {
  selectedArea: IkoroduArea | 'All';
  setSelectedArea: (area: IkoroduArea | 'All') => void;
  approvedVendors: Vendor[];
  featuredProducts: Product[];
  handleVendorClick: (id: string) => void;
  handleProductClick: (id: string) => void;
  trackVendorWhatsAppClick: (id: string) => void;
}

interface DistrictPin {
  id: string;
  name: string;
  areaCode: IkoroduArea;
  tag: string;
  description: string;
  landmarks: string[];
  xPercent: number; // percentage coordinates on map canvas
  yPercent: number;
}

const IKORODU_DISTRICTS: DistrictPin[] = [
  {
    id: 'sabo',
    name: 'Sabo Commercial Axis & Market Square',
    areaCode: 'Sabo',
    tag: 'Fashion, Lace & Grocery Hub',
    description: 'The commercial pulse of Ikorodu. Known for Swiss lace, foodstuffs, baking supplies, and computer village.',
    landmarks: ['Sabo Market Square', 'Ikorodu Town Hall', 'Ayangburen Palace'],
    xPercent: 48,
    yPercent: 44,
  },
  {
    id: 'agric',
    name: 'Agric & BRT Bus Depot Terminal',
    areaCode: 'Agric',
    tag: 'Tech, Solar Inverters & Gadgets',
    description: 'Major transit and gadgets hub. High concentration of solar power technicians, phone accessories, and courier services.',
    landmarks: ['Agric BRT Terminal', 'Owutu Road Junction', 'Ikorodu Expressway'],
    xPercent: 32,
    yPercent: 58,
  },
  {
    id: 'garage',
    name: 'Garage Roundabout & Sagamu Road',
    areaCode: 'Garage',
    tag: 'Auto Spare Parts & Hardware',
    description: 'Key industrial junction for auto mechanics, building hardware, royal furniture workshops, and heavy machinery.',
    landmarks: ['Garage Roundabout', 'Sagamu Road', 'Ota-Ona Junction'],
    xPercent: 58,
    yPercent: 36,
  },
  {
    id: 'ebute',
    name: 'Ebute Waterfront & Ferry Jetty',
    areaCode: 'Ebute',
    tag: 'Seafood, Boat Logistics & Marine',
    description: 'Scenic coastal district famous for fresh fish markets, ferry transport terminals to Lekki/VI, and waterfront restaurants.',
    landmarks: ['Ebute Ferry Terminal', 'Ikorodu Water Front', 'Soliu Road'],
    xPercent: 40,
    yPercent: 78,
  },
  {
    id: 'ayetoro',
    name: 'Ayetoro & Ita-Elewa Civic Axis',
    areaCode: 'Ayetoro',
    tag: 'Tailoring, Legal & Printing Presses',
    description: 'Civic center featuring legal chambers, printing hubs, bespoke fashion designers, and event centers.',
    landmarks: ['Ita-Elewa Roundabout', 'Ayetoro Street', 'Ikorodu General Hospital'],
    xPercent: 44,
    yPercent: 30,
  },
  {
    id: 'igbogbo',
    name: 'Igbogbo & Bayeku Kingdom',
    areaCode: 'Igbogbo',
    tag: 'Real Estate & Craftsmanship',
    description: 'Rapidly expanding residential belt for block factories, poultry farms, home interior design, and real estate.',
    landmarks: ['Adeboruwa Palace', 'Bayeku Jetty', 'Igbogbo Stadium'],
    xPercent: 72,
    yPercent: 68,
  },
  {
    id: 'imota',
    name: 'Imota Agricultural Belt & Rice Mill',
    areaCode: 'Imota',
    tag: 'Agro-Processing & Grain Wholesale',
    description: 'Home of the Lagos Rice Mill complex. Major producer of cassava flour, palm oil, fresh farm produce, and wholesale grain.',
    landmarks: ['Imota Rice Mill Complex', 'Imota Central Market', 'Itokin Road Axis'],
    xPercent: 88,
    yPercent: 24,
  },
  {
    id: 'odogunyan',
    name: 'Odogunyan Industrial Layout',
    areaCode: 'Odogunyan',
    tag: 'Industrial & Student Hub',
    description: 'Major manufacturing zone near LASUSTECH with student shopping plazas, electronics, and food hubs.',
    landmarks: ['LASUSTECH Campus', 'First Gate Junction', 'Industrial Estate'],
    xPercent: 65,
    yPercent: 20,
  },
  {
    id: 'ipakodo',
    name: 'Ipakodo Ferry & Lighter Terminal',
    areaCode: 'Ipakodo',
    tag: 'Port Logistics & Warehouse',
    description: 'Logistics and freight handling area along the lagoon shore.',
    landmarks: ['Ipakodo Jetty', 'NIPA Terminal'],
    xPercent: 28,
    yPercent: 70,
  },
  {
    id: 'ijede',
    name: 'Ijede & Egbin Power Hub',
    areaCode: 'Ijede',
    tag: 'Thermal Energy & Fishing',
    description: 'Home to Nigeria’s largest thermal power generation plant and serene waterfront communities.',
    landmarks: ['Egbin Power Station', 'Ijede Central Market'],
    xPercent: 82,
    yPercent: 80,
  },
  {
    id: 'itamaga',
    name: 'Itamaga Junction & Food Hub',
    areaCode: 'Itamaga',
    tag: 'Foodstuffs & Retail Plazas',
    description: 'Bustling commercial junction linking Garage and Maya with vibrant foodstuffs trade and retail stores.',
    landmarks: ['Itamaga Junction', 'Ikorodu-Itoikin Road'],
    xPercent: 52,
    yPercent: 30,
  },
  {
    id: 'parafa',
    name: 'Parafa & Itoikin Highway Hub',
    areaCode: 'Parafa',
    tag: 'Building Materials & Estate',
    description: 'Fast-growing residential and building supplies hub along the Itoikin highway corridor.',
    landmarks: ['Parafa Bus Stop', 'Itoikin Road Axis'],
    xPercent: 78,
    yPercent: 28,
  },
  {
    id: 'grammarschool',
    name: 'Grammar School Axis',
    areaCode: 'Grammar School',
    tag: 'Educational & Retail Axis',
    description: 'Major educational landmark hub surrounded by bookshops, tailoring, tech gadgets, and eateries.',
    landmarks: ['Ikorodu Grammar School', 'Ayetoro Road'],
    xPercent: 50,
    yPercent: 38,
  },
  {
    id: 'gbaga',
    name: 'Gbaga Commercial Axis',
    areaCode: 'Gbaga',
    tag: 'Crafts, Groceries & Services',
    description: 'Residential and artisan commercial pocket serving Offin, Igbogbo, and central Ikorodu neighborhoods.',
    landmarks: ['Gbaga Junction', 'Offin Road'],
    xPercent: 62,
    yPercent: 48,
  },
  {
    id: 'mowokekere',
    name: 'Mowokekere Estate & Trade',
    areaCode: 'Mowokekere',
    tag: 'Residential & Local Plazas',
    description: 'Rapidly growing estate community with neighborhood stores, salons, and fresh produce plazas.',
    landmarks: ['Mowokekere Junction', 'Ikorodu East Axis'],
    xPercent: 75,
    yPercent: 40,
  },
  {
    id: 'radio',
    name: 'Radio Ikorodu & Broadcasting Axis',
    areaCode: 'Radio',
    tag: 'Tech Services & Plazas',
    description: 'Popular area named after the media broadcasting tower, hosting tech services, solar installers, and markets.',
    landmarks: ['Radio Lagos Tower', 'Adamo Road Axis'],
    xPercent: 38,
    yPercent: 42,
  },
  {
    id: 'araromi',
    name: 'Araromi District',
    areaCode: 'Araromi',
    tag: 'Artisans & Local Stores',
    description: 'Established residential community with skilled artisans, neighborhood bakeries, and provision stores.',
    landmarks: ['Araromi Central', 'Sabo Axis'],
    xPercent: 55,
    yPercent: 52,
  },
  {
    id: 'eyita',
    name: 'Eyita & Ojokoro Axis',
    areaCode: 'Eyita',
    tag: 'Wholesale & Residential',
    description: 'Vibrant residential area with local wholesale grain merchants, laundries, and fashion houses.',
    landmarks: ['Eyita School Junction', 'Ita-Elewa Link'],
    xPercent: 46,
    yPercent: 34,
  },
];

export const IkoroduMapExplorer: React.FC<IkoroduMapExplorerProps> = ({
  selectedArea,
  setSelectedArea,
  approvedVendors,
  featuredProducts,
  handleVendorClick,
  handleProductClick,
  trackVendorWhatsAppClick,
}) => {
  const [mapType, setMapType] = useState<'map' | 'satellite' | 'terrain'>('map');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [feedFilter, setFeedFilter] = useState<'all' | 'stores' | 'products'>('all');
  const [activePin, setActivePin] = useState<DistrictPin | null>(
    IKORODU_DISTRICTS.find((d) => d.areaCode === selectedArea) || IKORODU_DISTRICTS[0]
  );

  const handlePinSelect = (district: DistrictPin) => {
    setActivePin(district);
    setSelectedArea(district.areaCode);
  };

  // Filter vendors & products for selected district (Returns empty array when 'All' so sidebar remains blank until a pin is clicked)
  const districtVendors =
    selectedArea === 'All'
      ? []
      : approvedVendors.filter((v) => v.area.toLowerCase() === selectedArea.toLowerCase());

  const districtProducts =
    selectedArea === 'All'
      ? []
      : featuredProducts.filter((p) => p.vendorArea.toLowerCase() === selectedArea.toLowerCase());

  return (
    <div className="space-y-6">
      {/* Map Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5 fill-red-500 text-white" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
                Interactive Area Map Explorer
              </h2>
              <p className="text-xs text-slate-500">
                Google Maps GIS layout • Click any location pin to filter local businesses & goods in the sidebar
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600">Active Location:</span>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-950 text-xs font-bold rounded-full border border-emerald-300 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-700" />
            {selectedArea === 'All' ? 'Select Pin on Map' : selectedArea}
          </span>
          {selectedArea !== 'All' && (
            <button
              onClick={() => {
                setSelectedArea('All');
                setActivePin(null);
              }}
              className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-full text-xs font-bold flex items-center gap-1"
              title="Clear Filter"
            >
              <X className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
      </div>

      {/* 2-COLUMN SIDE-BY-SIDE LAYOUT: MAP ON LEFT, LOCATION FEED SIDEBAR ON RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: GOOGLE MAP CANVAS (7 COLUMNS ON DESKTOP) */}
        <div className="lg:col-span-7 relative rounded-3xl overflow-hidden border border-slate-300 shadow-md bg-[#e5e3df]">
          {/* Top Bar Controls */}
          <div className="absolute top-3 left-3 right-3 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
            {/* Top Left Status Pill */}
            <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl px-3 py-1.5 shadow-md border border-slate-200/80 flex items-center gap-2 text-xs font-bold text-slate-800">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Ikorodu GIS Live Map</span>
            </div>

            {/* Top Right Map Style Toggle (Map | Satellite | Terrain) */}
            <div className="pointer-events-auto bg-white/95 backdrop-blur-md rounded-2xl p-1 shadow-md border border-slate-200/80 flex items-center gap-1">
              {(['map', 'satellite', 'terrain'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setMapType(mode)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-bold capitalize transition-colors ${
                    mapType === mode
                      ? 'bg-emerald-950 text-amber-300'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* MAP CANVAS VISUALS */}
          <div
            className={`relative w-full h-[460px] sm:h-[520px] overflow-hidden transition-colors ${
              mapType === 'satellite'
                ? 'bg-[#1b2a1a]'
                : mapType === 'terrain'
                ? 'bg-[#d8d3c5]'
                : 'bg-[#e5e3df]'
            }`}
          >
            {/* SVG Map Lines (Lagoon Waterbody, Expressway, Local Arterials) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-85" xmlns="http://www.w3.org/2000/svg">
              {/* Lagos Lagoon Water Body */}
              <path
                d="M 0,360 Q 200,340 400,370 T 800,350 T 1200,380 L 1200,520 L 0,520 Z"
                fill={mapType === 'satellite' ? '#0f2b38' : '#aadaff'}
              />
              <text x="350" y="440" fill={mapType === 'satellite' ? '#4a819c' : '#2b6f9e'} fontSize="12" fontWeight="bold" letterSpacing="2">
                LAGOS LAGOON / IKORODU WATERFRONT
              </text>

              {/* Ikorodu-Ikeja Expressway */}
              <path
                d="M 0,280 C 150,270 280,260 380,230 C 480,210 550,190 700,170 C 850,150 1000,120 1200,100"
                fill="none"
                stroke="#ffc61e"
                strokeWidth="7"
              />
              <path
                d="M 0,280 C 150,270 280,260 380,230 C 480,210 550,190 700,170 C 850,150 1000,120 1200,100"
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                strokeDasharray="8,8"
              />

              {/* Sagamu Road Axis */}
              <path d="M 480,210 L 620,50" fill="none" stroke="#ffffff" strokeWidth="5" />

              {/* Owutu / Agric Road */}
              <path d="M 280,260 L 220,130" fill="none" stroke="#ffffff" strokeWidth="4" />

              {/* Ebute Waterfront Road */}
              <path d="M 380,230 L 360,360" fill="none" stroke="#ffffff" strokeWidth="4" />

              {/* Igbogbo-Bayeku Road */}
              <path d="M 480,210 L 720,310" fill="none" stroke="#ffffff" strokeWidth="4" />

              {/* Imota Itokin Highway */}
              <path d="M 700,170 L 1100,70" fill="none" stroke="#ffc61e" strokeWidth="5" />
            </svg>

            {/* MAP PINS & MARKERS */}
            {IKORODU_DISTRICTS.map((district) => {
              const isSelected = selectedArea === district.areaCode;
              const districtVendorsCount = approvedVendors.filter(
                (v) => v.area.toLowerCase() === district.areaCode.toLowerCase()
              ).length;

              return (
                <div
                  key={district.id}
                  style={{
                    left: `${district.xPercent}%`,
                    top: `${district.yPercent}%`,
                  }}
                  className="absolute -translate-x-1/2 -translate-y-full z-10 cursor-pointer"
                  onClick={() => handlePinSelect(district)}
                >
                  <div className="relative group/pin flex flex-col items-center">
                    {/* Map Pin Tag */}
                    <div
                      className={`px-2 py-0.5 rounded-xl text-[10px] font-black shadow-md border whitespace-nowrap flex items-center gap-1 mb-1 transition-colors ${
                        isSelected
                          ? 'bg-amber-400 text-emerald-950 border-emerald-950 ring-2 ring-amber-400/50'
                          : 'bg-white/95 text-slate-900 border-slate-300'
                      }`}
                    >
                      <MapPin className="w-3 h-3 text-red-600 shrink-0" />
                      <span>{district.areaCode}</span>
                      <span className="text-[9px] font-mono font-bold px-1 rounded-full bg-slate-100 text-slate-700">
                        {districtVendorsCount}
                      </span>
                    </div>

                    {/* Red Marker Pin */}
                    <div
                      className={`relative w-7 h-7 rounded-full flex items-center justify-center shadow-lg transition-colors ${
                        isSelected
                          ? 'bg-red-600 text-white scale-110 ring-4 ring-red-400/40 z-30'
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      <MapPin className="w-4 h-4 fill-white text-red-600" />
                    </div>
                  </div>
                </div>
              );
            })}

            {/* ACTIVE PIN INFO WINDOW POPUP */}
            {activePin && (
              <div
                style={{
                  left: `${Math.min(Math.max(activePin.xPercent, 25), 75)}%`,
                  top: `${Math.max(activePin.yPercent - 22, 12)}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-full z-30 max-w-xs w-64 bg-white text-slate-900 rounded-2xl p-3.5 shadow-xl border border-slate-300 space-y-2"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-[9px] font-black uppercase text-amber-600 tracking-wider bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    {activePin.tag}
                  </span>
                  <button
                    onClick={() => setActivePin(null)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-xs font-black text-slate-900 font-display leading-tight">
                  {activePin.name}
                </h4>

                <p className="text-[10px] text-slate-600 leading-snug line-clamp-2">
                  {activePin.description}
                </p>

                <div className="pt-1.5 flex items-center justify-between border-t border-slate-100 text-[11px] font-bold">
                  <span className="text-emerald-800">
                    {approvedVendors.filter((v) => v.area.toLowerCase() === activePin.areaCode.toLowerCase()).length} Stores Listed
                  </span>
                  <button
                    onClick={() => setSelectedArea(activePin.areaCode)}
                    className="px-2.5 py-1 bg-emerald-950 text-amber-300 rounded-lg text-[10px] font-bold"
                  >
                    Filter Feed →
                  </button>
                </div>
              </div>
            )}

            {/* FLOATING MAP CONTROLS */}
            <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-md border border-slate-200">
              <button
                onClick={() => setZoomLevel((z) => Math.min(z + 0.2, 2))}
                className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-xl"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(z - 0.2, 0.8))}
                className="p-1.5 text-slate-700 hover:bg-slate-100 rounded-xl"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setSelectedArea('All');
                  setActivePin(null);
                }}
                className="p-1.5 text-emerald-800 hover:bg-emerald-50 rounded-xl"
                title="Reset View"
              >
                <Navigation className="w-4 h-4" />
              </button>
            </div>

            {/* SCALE FOOTER */}
            <div className="absolute bottom-3 left-3 z-20 bg-black/60 backdrop-blur-md text-white px-2.5 py-1 rounded-xl text-[10px] font-mono">
              Scale: 1 km • IkoroduGIS © 2026
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: LOCATION FEED SIDEBAR (5 COLUMNS ON DESKTOP) */}
        <div className="lg:col-span-5 bg-slate-50 rounded-3xl p-5 border border-slate-200 flex flex-col h-[520px] overflow-hidden">
          {/* Sidebar Header & Filter Tabs */}
          <div className="space-y-3 pb-3 border-b border-slate-200 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Store className="w-5 h-5 text-emerald-800 shrink-0" />
                <div>
                  <h3 className="text-sm font-black text-slate-900 font-display">
                    {selectedArea === 'All' ? 'All Ikorodu Location Feed' : `${selectedArea} Area Feed`}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    {districtVendors.length} Stores • {districtProducts.length} Products
                  </p>
                </div>
              </div>

              {selectedArea !== 'All' && (
                <button
                  onClick={() => {
                    setSelectedArea('All');
                    setActivePin(null);
                  }}
                  className="text-[10px] font-bold text-red-600 hover:underline"
                >
                  Clear Area Filter
                </button>
              )}
            </div>

            {/* Store / Product Filter Switch */}
            <div className="flex items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl">
              {(['all', 'stores', 'products'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setFeedFilter(filter)}
                  className={`flex-1 py-1 rounded-lg text-[11px] font-bold capitalize transition-colors ${
                    feedFilter === filter
                      ? 'bg-emerald-950 text-amber-300 shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter === 'all' ? 'All Items' : filter === 'stores' ? 'Stores' : 'Products'}
                </button>
              ))}
            </div>
          </div>

          {/* Scrollable Feed List */}
          <div className="flex-1 overflow-y-auto pt-3 space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-300">
            {districtVendors.length === 0 && districtProducts.length === 0 ? (
              <div className="py-12 text-center space-y-2 bg-white rounded-2xl border border-slate-200 p-4">
                <MapPin className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-800">No stores or items registered yet in {selectedArea}</h4>
                <p className="text-[10px] text-slate-500">
                  Select another pin on the map or view All Districts.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* STORES SECTION */}
                {(feedFilter === 'all' || feedFilter === 'stores') && districtVendors.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                      Verified Storefronts ({districtVendors.length})
                    </span>
                    <div className="space-y-2.5">
                      {districtVendors.map((vendor) => (
                        <div
                          key={vendor.id}
                          className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <img
                              src={vendor.logoUrl}
                              alt={vendor.businessName}
                              className="w-10 h-10 rounded-xl object-cover border border-slate-200 bg-slate-50 shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1">
                                <h4
                                  onClick={() => handleVendorClick(vendor.id)}
                                  className="text-xs font-bold text-slate-900 truncate hover:text-emerald-700 cursor-pointer"
                                >
                                  {vendor.businessName}
                                </h4>
                                {vendor.isVerified && (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                )}
                              </div>
                              <p className="text-[10px] text-slate-500 truncate">
                                {vendor.category} • <span className="font-semibold text-emerald-800">{vendor.area}</span>
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => handleVendorClick(vendor.id)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-900 text-[10px] font-bold rounded-lg"
                            >
                              View
                            </button>
                            <a
                              href={`https://wa.me/${vendor.whatsapp}?text=Hi%20${encodeURIComponent(
                                vendor.businessName
                              )},%20I%20found%20you%20on%20IkoroduSquare%20Map.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => trackVendorWhatsAppClick(vendor.id)}
                              className="p-1.5 bg-emerald-800 hover:bg-emerald-900 text-amber-300 rounded-lg"
                              title="Chat on WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* PRODUCTS SECTION */}
                {(feedFilter === 'all' || feedFilter === 'products') && districtProducts.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                      Local Products ({districtProducts.length})
                    </span>
                    <div className="grid grid-cols-2 gap-2.5">
                      {districtProducts.map((product) => (
                        <div
                          key={product.id}
                          className="bg-white rounded-2xl p-2.5 border border-slate-200 shadow-2xs flex flex-col justify-between space-y-1.5"
                        >
                          <div>
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-24 object-cover rounded-xl border border-slate-100 cursor-pointer"
                              onClick={() => handleProductClick(product.id)}
                            />
                            <div className="pt-1.5">
                              <span className="text-[8px] font-extrabold uppercase text-emerald-700 block truncate">
                                📍 {product.vendorArea}
                              </span>
                              <h5
                                onClick={() => handleProductClick(product.id)}
                                className="text-[11px] font-bold text-slate-900 line-clamp-1 hover:text-emerald-700 cursor-pointer"
                              >
                                {product.name}
                              </h5>
                              <span className="text-xs font-black text-emerald-950 font-mono block mt-0.5">
                                ₦{product.price.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleProductClick(product.id)}
                            className="w-full py-1 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-[10px] font-bold"
                          >
                            Details
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
