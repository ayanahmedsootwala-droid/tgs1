import React, { useState, useMemo } from 'react';
import { useSalon } from '@/contexts/SalonContext';
import {
  GraduationCap,
  Shield,
  Search,
  Sparkles,
  Users,
  Scissors,
  Building2,
  Package,
  Megaphone,
  Zap,
  Calculator,
  CheckCircle2,
  AlertTriangle,
  FileText,
  DollarSign,
  TrendingUp,
  Award,
  ChevronRight,
  ExternalLink,
  Flame,
  Clock,
  Droplets,
  Calendar,
  Store,
  Lightbulb,
  HeartHandshake,
  Smartphone,
  Star,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface KnowledgeArticle {
  id: string;
  category: 'clients' | 'staff' | 'place' | 'product' | 'marketing' | 'services';
  title: string;
  subtitle: string;
  readTime: string;
  badge: string;
  keyTakeaways: string[];
  content: string[];
  actionSteps: string[];
  pakistanContext: string;
}

const KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
  // 1. CLIENTS & VIP RETENTION
  {
    id: 'art-wedding-season',
    category: 'clients',
    title: 'Pakistani Wedding Season (Shadi) Grooming Playbook',
    subtitle: 'Structuring Mehndi, Barat & Walima Groom Timelines for Maximum Retention',
    readTime: '6 min read',
    badge: 'High Revenue',
    keyTakeaways: [
      'Perform facial treatments 72 hours before the main event to avoid camera redness.',
      'Schedule the final beard lineup and hair styling on the morning of Barat.',
      'Require a 50% non-refundable advance token on groom packages to guarantee chair reservation.',
    ],
    content: [
      'In Pakistan, the peak wedding season runs from October to March, with grooms and their groomsmen generating up to 40% of winter salon revenues. Traditional salon owners make the mistake of doing facials on the same day as the Barat, resulting in flushed, inflamed skin under high-definition wedding photography.',
      'The winning protocol is a 3-Visit Groom Schedule: Visit 1 (4-5 days prior): Clarifying HydraFacial or Herbal Whitening Polish + hair cut and scalp scrub. Visit 2 (2 days prior to Barat/Mehndi): Hair color camo touchup and deep conditioning mask. Visit 3 (Event Morning): Precision razor beard taper, blow-dry styling, matte clay hold, and gentle under-eye cooling patches.',
      'Bundle groomsmen: Offer a "Dulha & Brothers" package (groom gets royal styling, brother/father get express haircut and beard trim at a 15% combo bundle). This increases average invoice ticket from Rs. 4,000 to Rs. 14,000+ per booking.',
    ],
    actionSteps: [
      'Create 3 groom package tiers in POS: Silver (Rs. 5,500), Gold (Rs. 9,500), and Royal Platinum (Rs. 16,500).',
      'Train front-desk staff to ask every client during October: "Koi shadi aa rahi hai ghar mein?" to pitch pre-wedding appointments early.',
      'Keep a clean white ring-light station in the salon for groom portrait snaps to send to clients via WhatsApp for their social status.',
    ],
    pakistanContext: 'Pakistani grooms value privacy and dignity. If feasible, reserve a dedicated corner or VIP booth away from the main walk-in chairs during wedding sessions.',
  },
  {
    id: 'art-eid-rush',
    category: 'clients',
    title: 'Eid-ul-Fitr & Eid-ul-Adha 72-Hour Survival Blueprint',
    subtitle: 'Managing 300+ Clients in 3 Days without Staff Burnout or Chaos',
    readTime: '5 min read',
    badge: 'Operational Critical',
    keyTakeaways: [
      'Shift to an "Express Service Menu" during the final 48 hours of Chand Raat.',
      'Adopt a strict Physical Token Queue System with expected return SMS times.',
      'Implement an Iftar-to-Sehri midnight shift with catered hot tea and snacks for staff.',
    ],
    content: [
      'Chand Raat in Pakistan is the single highest-grossing 48-hour window of the entire calendar year. However, unstructured walk-in crowds lead to 2-hour waiting times, frustrated clients leaving for competitors, and exhausted barbers making sloppy haircuts.',
      'Phase 1: 10 Days Before Eid: Issue WhatsApp broadcast to regular VIPs advising them to book haircuts early (20th to 27th Ramadan) with a complimentary beard balm perk to disperse the traffic.',
      'Phase 2: The Final 48 Hours: Temporarily disable multi-hour services (e.g. Keratin smoothing or 60-minute luxury facials) unless booked 2 weeks in advance. Focus on 20-minute haircuts, 15-minute beard shape-ups, and 15-minute express charcoal peel facials.',
      'Cash flow safety: Store cash receipts in a secure safe box every 4 hours rather than keeping large cash volumes in the front counter drawer.',
    ],
    actionSteps: [
      'Print 200 serialized card tokens (Token 1 to 200). Give customer their number and an estimated seat time.',
      'Stock 3 extra sets of clippers and sanitizing spray per barber to rotate hot clipper blades quickly.',
      'Arrange special food, energy drinks, and tea for staff during midnight shifts to keep energy levels peak.',
    ],
    pakistanContext: 'Clients on Chand Raat are emotional and sleep-deprived. Offering complimentary cardamom chai or chilled mint lemonade calms tension in the waiting lounge.',
  },
  {
    id: 'art-client-psychology',
    category: 'clients',
    title: 'Pakistani Male Consumer Psychology & Tipping Culture',
    subtitle: 'How to Balance Premium Service Expectations with Local Price Sensitivity',
    readTime: '4 min read',
    badge: 'Client LTV',
    keyTakeaways: [
      'Pakistani men do not buy haircuts; they buy status, confidence, and respect (Izzat).',
      'Consistent hot towel and neck massage creates 10x higher loyalty than fancy furniture.',
      'Encourage digital tipping prompts at POS to supplement staff earnings transparently.',
    ],
    content: [
      'Unlike Western markets where speed is prioritized, Pakistani gentlemen associate care and hospitality with service duration. If a haircut finishes in 8 minutes, the client often feels cheated even if the cut is decent. Taking 25 minutes with dedicated hot towel therapy, ear flame/hair trimming, and shoulder vibration massage makes a Rs. 1,000 price feel like a bargain.',
      'Respectful address: Staff must address clients as "Sir" or "Bhai" respectfully, avoiding casual slang. In high-end areas (DHA, Bahria, Gulberg), clients expect silence or courteous conversation, not loud gossip between barbers.',
      'The 5-Visit Punch Card: A client who visits 5 times becomes practically permanent. The 5th visit reward (e.g. Free Facial worth Rs. 2,500) costs the salon only ~Rs. 300 in cream and toner, but locks in Rs. 12,000+ in annual repeat spend.',
    ],
    actionSteps: [
      'Standardize the 5-point post-cut checklist: Clean neck shave, hot towel press, aftershave splash, quick shoulder massage, and hair tonic.',
      'Never allow barbers to demand tips (Bakshish) aggressively; instead, keep a transparent tip prompt on POS receipts.',
    ],
    pakistanContext: 'In Pakistan, tipping junior shampoo boys (Rs. 100-200) and master barbers (Rs. 200-500) is customary. Cultivate a culture where tips are recognized and pooled fairly.',
  },

  // 2. STAFF & KARIGAR MASTERY
  {
    id: 'art-ustad-shagird',
    category: 'staff',
    title: 'The Ustad-Shagird Dynamic & Anti-Poaching Protocols',
    subtitle: 'Protecting Salon Client Database while Retaining Master Barbers',
    readTime: '7 min read',
    badge: 'Database Shield',
    keyTakeaways: [
      'Never let individual barbers exchange personal WhatsApp or mobile numbers with clients.',
      'Use CRM phone masking (middle digits hidden) so staff cannot copy client contact lists.',
      'Pair experienced Ustads with young Shagirds to train replacements continuously.',
    ],
    content: [
      'The traditional salon industry in Pakistan operates under the "Ustad-Shagird" apprenticeship model. Master barbers often build personal rapport with affluent clients, and when they quit to open their own shop across the street, they attempt to pull 30-50 loyal clients with them.',
      'How to eliminate client poaching: (1) Always book appointments through the central salon front-desk WhatsApp business line, never staff personal phones. (2) Mask client mobile numbers on staff-facing tablets and POS slips. (3) Ensure clients associate their loyalty perks, points, and wallet balance with "The Grooming Studio TGS", not a single individual barber.',
      'Contractual security: Maintain signed employment agreements with verified CNIC copies, emergency contacts, and a 6-month non-solicitation clause within a 2-kilometer radius.',
    ],
    actionSteps: [
      'Verify that Non-Owner Anti-Theft controls are active: managers and barbers cannot view unmasked phone numbers or send direct WhatsApps.',
      'Implement an apprentice rotation: Assign junior stylists to perform washes, facials, and hair treatments so clients trust multiple faces at TGS.',
    ],
    pakistanContext: 'In Pakistan, respect and honor (Lihaaz) go a long way. Treat master barbers like dignified partners, celebrate their birthdays, and pay commissions promptly on the 1st of every month.',
  },
  {
    id: 'art-pay-structures',
    category: 'staff',
    title: 'Pakistani Salon Pay Models: Commission vs Base Salary',
    subtitle: 'Choosing the Optimal Compensation Model to Maximize Revenue and Attendance',
    readTime: '6 min read',
    badge: 'Profit Engine',
    keyTakeaways: [
      'Pure Commission (30-40%): Best for busy walk-in stations; eliminates owner payroll risk.',
      'Base Salary + Commission (Rs. 25k base + 15-20% commission): Best for steady master stylists.',
      'Chair Rental (Partnership 70/30 or fixed Rs. 35k/mo): Best for celebrity barbers with own following.',
    ],
    content: [
      'The biggest cash leakage in Pakistani salons happens when owners pay high fixed salaries to unmotivated barbers who sit idle during slow afternoons, yet ask for loans (Udhari) before every family wedding.',
      'The Hybrid Formula (Recommended): Give a respectable base wage (e.g. Rs. 28,000 to cover daily family groceries) paired with a 15% commission on all completed services once they cross Rs. 60,000 in monthly sales. This creates an automatic hunger to upsell beard oils, hair treatments, and facials.',
      'Continuous Calendar Auto-Payroll: In Pakistan, salons operate 7 days a week. Divide the monthly base salary by the exact number of days in that calendar month (28, 29, 30, or 31). When barbers arrive late past the grace period, deduct automated late penalties unless waived by the Owner.',
    ],
    actionSteps: [
      'Audit your staff list in TGS: Transition non-performing fixed salary staff to hybrid salary + commission.',
      'Set clear late arrival rules in TGS Attendance Settings: 15-minute grace period with Rs. 20/min late deduction.',
      'Provide monthly transparent WhatsApp pay slips showing present days, late penalties, and commission bonuses.',
    ],
    pakistanContext: 'Avoid unbounded cash advances (Kameti / Udhari). Cap advance salary to a maximum of 40% of their expected monthly payout, deductible across 2 pay cycles.',
  },

  // 3. PLACE, INFRASTRUCTURE & LOAD SHEDDING
  {
    id: 'art-load-shedding',
    category: 'place',
    title: 'Load Shedding Defense: Solar Hybrid vs Silent Diesel Generator',
    subtitle: 'Power Backup Sizing for ACs, Hair Dryers & UV Sterilizers in Karachi, Lahore & Islamabad',
    readTime: '8 min read',
    badge: 'CapEx Blueprint',
    keyTakeaways: [
      'Never run high-wattage hair dryers (2000W) on a basic UPS; it burns the inverter instantly.',
      'A 6kW to 10kW Hybrid Solar System with Lithium (LiFePO4) batteries pays for itself in 14 months.',
      'Maintain an automatic ATS (Automatic Transfer Switch) for seamless changeover during haircut fades.',
    ],
    content: [
      'Unannounced power cuts (load shedding) in Pakistani cities can destroy a salon reputation instantly. If electricity cuts out mid-fade with a clipper stuck in a client hair, or if the salon AC stops in 42°C June heat, clients will walk out immediately.',
      'Load Calculation for a 4-Chair Salon:\n- Two 1.5-Ton Inverter ACs: ~2,400 Watts running load\n- Two Professional Hair Dryers (Parlux / Babyliss): ~3,800 Watts peak\n- 4 Professional Clippers + Trimmers: ~80 Watts\n- Salon Track Lighting & Ring Lights: ~250 Watts\n- Total Peak Demand: ~6.5 kW to 8 kW.',
      'The Solution: (1) A 6kW to 8kW Hybrid Solar Inverter with net-metering on the roof, backed by a 48V 200Ah Lithium-ion battery bank. Lithium charges from 0 to 100% in 2.5 hours and handles high surge current without voltage drops. (2) A 10-15 kVA Soundproof Diesel Generator as backup during prolonged grid failure or cloudy rainy days.',
    ],
    actionSteps: [
      'Use the interactive Load Shedding ROI Calculator below to compare your monthly generator fuel vs solar savings.',
      'Install surge protectors on all clipper charging docks to prevent damage from sudden WAPDA/K-Electric voltage spikes.',
      'Keep heavy-duty battery clippers (e.g. Wahl Cordless Magic Clip or Babyliss GoldFX) fully charged at all stations.',
    ],
    pakistanContext: 'Diesel generator maintenance in Pakistan requires changing engine oil every 150 running hours. Always keep 20 liters of fresh diesel in reserve canisters during summer peak.',
  },
  {
    id: 'art-water-hardness',
    category: 'place',
    title: 'Hard Water Filtration: The Secret to Silky Hair & Repeat Clients',
    subtitle: 'Eliminating Heavy Mineral TDS from Karachi, Lahore & Rawalpindi Bore Water',
    readTime: '5 min read',
    badge: 'Quality Secret',
    keyTakeaways: [
      'High TDS (>600 ppm) bore water leaves a chalky mineral film, causing dry, brittle hair.',
      'Install an Ion-Exchange Water Softener resin cylinder with salt brine regeneration at the wash basins.',
      'Soft water cuts shampoo and conditioner usage by 40% and makes client hair feel instantly smoother.',
    ],
    content: [
      'Most salon owners spend hundreds of thousands on Italian interior design, yet wash client hair with corrosive, salty bore water with TDS levels exceeding 800 to 1,200 ppm (common in Karachi DHA/Clifton and Lahore).',
      'The consequence: Shampoos do not lather properly, hair treatments (Keratin and Protein) wash out in 2 weeks instead of 3 months, and clients notice their hair feels sticky and rough after leaving your salon.',
      'The Solution: Install a commercial dual-tank water softener with cation exchange resin at the washing station inlet. Regenerate the resin with industrial rock salt (Rs. 400 per 50kg bag) once every 10 days. Water TDS drops below 120 ppm, creating rich, luxurious lather and silky hair texture that clients notice immediately.',
    ],
    actionSteps: [
      'Buy a cheap digital TDS meter (Rs. 800 on Daraz) and test your wash basin water today. If TDS is above 350 ppm, filtration is urgent.',
      'Advertise "Soft Water Spa Wash" as a distinctive marketing differentiator in your marketing blasts.',
    ],
    pakistanContext: 'Clean filtered water also prevents scale buildup inside your instant electric geyser heating elements, doubling their lifespan.',
  },

  // 4. PRODUCT SOURCING & WHOLESALE HUBS
  {
    id: 'art-wholesale-markets',
    category: 'product',
    title: 'Pakistan Wholesale Markets Sourcing Directory',
    subtitle: 'Where Top Salons Buy Supplies at 40-70% Below Retail in Lahore, Karachi & Rawalpindi',
    readTime: '7 min read',
    badge: 'Cost Slasher',
    keyTakeaways: [
      'Lahore: Shah Alam Market (Rang Mahal) is Pakistan cosmetics wholesale capital.',
      'Karachi: Bolton Market & Empress Market Saddar for direct Dubai container imports.',
      'Rawalpindi: Raja Bazar (Bara Market) for northern Punjab & KPK supply lines.',
    ],
    content: [
      'Buying salon products from local neighborhood retailers cuts your margins in half. Commercial salons purchase directly in bulk from master importers and stockists in historic wholesale trading hubs.',
      '1. Lahore - Shah Alam Market (Rang Mahal & Sooha Bazar):\n- Top hub for authentic Keune, L\'Oreal, Framesi, and Dermacos distributors.\n- Best place to purchase bulk salon shampoo gallons (10-liter containers), disposable neck strips, wax tubs, and salon chair parts.\n- Tip: Build a relationship with 2 dedicated stockists; they provide 30-day payment credit terms once trust is established.',
      '2. Karachi - Bolton Market & Saddar:\n- Direct sea container imports from Dubai, China, and Thailand.\n- Best pricing for professional clippers (Wahl, Kemei, VGR), UV sterilizer cabinets, barber chairs, and imported Turkish colognes (Elegance, Marmara, Bandido).',
      '3. Rawalpindi - Raja Bazar:\n- Central wholesale distributor for Rawalpindi, Islamabad, and Northern areas. Excellent for herbal wax, bleaches, and facial cosmetics.',
    ],
    actionSteps: [
      'Never buy salon consumables in small 200ml retail bottles. Purchase 5-liter or 10-liter professional backbar refills.',
      'Audit product usage: Measure shampoo pumps (2 pumps = 6ml). Barbers wasting half a bottle on one wash costs you Rs. 15,000/month.',
    ],
    pakistanContext: 'When visiting Shah Alam or Bolton Market, always ask for "Salon Master Packing" rates, not walk-in customer pricing.',
  },
  {
    id: 'art-fake-products',
    category: 'product',
    title: 'Spotting Counterfeit Cosmetics & Clippers in Pakistan',
    subtitle: 'How to Identify Fake Keune, L\'Oreal, Wahl & Dermacos Products',
    readTime: '6 min read',
    badge: 'Anti-Fraud',
    keyTakeaways: [
      'Fake hair color tubes use cheap ammonia that causes scalp chemical burns and hair fallout.',
      'Counterfeit Wahl clippers vibrate violently, overheat in 10 minutes, and have blurred stamped serials.',
      'Always demand authorized distributor tax invoices with verifiable batch codes.',
    ],
    content: [
      'Counterfeit cosmetics flood the local market. Using a fake bleach or fake Keratin treatment on an affluent client can result in scalp blisters, severe hair breakage, and devastating social media backlash.',
      'Counterfeit Keune / L\'Oreal Verification:\n1. The Packaging: Authentic boxes have crisp, embossed silver lettering. Fakes have slightly blurred text and flimsy cardboard.\n2. The Tube Seal: Authentic tubes have an intact aluminum puncture seal with crisp batch code crimped into the bottom edge.\n3. The Smell: Counterfeits smell overpoweringly of industrial ammonia rather than cosmetic perfumed fragrance.',
      'Counterfeit Wahl Clippers:\n1. Weight & Balance: Original USA Wahl clippers weigh ~450g with a heavy electromagnetic V9000 motor. Fakes weigh under 300g with hollow plastic feel.\n2. The Cord: Authentic cords are thick, rubberized, and labeled with safety ratings; fakes have stiff plastic wires that crack easily.\n3. Blade Screws: Original blades use torx or precision flat screws, stamped "WAHL USA".',
    ],
    actionSteps: [
      'Maintain an approved distributor contact directory in your TGS Owner Notes.',
      'Immediately confiscate and destroy any dubious creams or serums brought in by freelance barbers.',
    ],
    pakistanContext: 'Always purchase from primary franchise distributors (e.g., Scandex for Keune Pakistan, L\'Oreal Professional Pakistan official trade accounts). The 10% price difference is worth your brand reputation.',
  },

  // 5. SERVICES, DEALS & DYNAMIC PRICING
  {
    id: 'art-high-margin-menu',
    category: 'services',
    title: 'High-Margin Menu Engineering: 80%+ Profit Services',
    subtitle: 'How to Shift Salon Revenue from Commodity Haircuts to Luxury Treatments',
    readTime: '6 min read',
    badge: 'Revenue Multiplier',
    keyTakeaways: [
      'A simple haircut has high labor cost and low markup; treatments have 80-87% gross margin.',
      'Pitch add-on treatments at the wash basin when client is relaxed and receptive.',
      'Package slow-moving services into irresistible 3-in-1 combo deals.',
    ],
    content: [
      'Most barbershops struggle because they depend solely on Rs. 800 haircuts. If a barber cuts 10 heads a day, they are exhausted, and revenue hits an unbreakable ceiling.',
      'The Top 4 High-Margin Treatments:\n1. Charcoal Peel + Steam: Product cost: Rs. 140. Sale price: Rs. 1,200. Margin: 88%.\n2. Herbal Whitening Glow Facial: Product cost: Rs. 380. Sale price: Rs. 2,500. Margin: 85%.\n3. Keratin Smoothing Treatment: Product cost: Rs. 1,100. Sale price: Rs. 7,000. Margin: 84%.\n4. Royal Hot Towel Beard Spa: Product cost: Rs. 90. Sale price: Rs. 800. Margin: 89%.',
      'The Wash Basin Pitch Strategy: When the client is leaning back at the wash basin with warm water running, their resistance is lowest. Train the barber to say: "Sir, your scalp has light dandruff from the weather change; should I apply our 10-minute tea-tree cooling treatment while washing?" 4 out of 10 clients agree, adding Rs. 800 to the bill effortlessly.',
    ],
    actionSteps: [
      'Pin high-margin combos to the top of your TGS POS Billing Catalog for rapid cashier selection.',
      'Set up a staff commission incentive: Give barbers an extra 5% bonus specifically on facial and hair treatment services.',
    ],
    pakistanContext: 'In Pakistan, men are increasingly conscious of pollution, dust, and tanning. Position facials as "Skin Cleansing & Tanning Removal" rather than vanity.',
  },
  {
    id: 'art-jummah-ramadan-deals',
    category: 'services',
    title: 'Jummah & Ramadan Dynamic Pricing Strategies',
    subtitle: 'Monetizing Friday Rush Hours and Filling Empty Chairs During Ramadan Days',
    readTime: '5 min read',
    badge: 'Seasonal Strategy',
    keyTakeaways: [
      'Jummah (Friday) 11:00 AM to 1:15 PM is prime grooming rush; avoid discounts, run express combos.',
      'Ramadan 12:00 PM to 5:00 PM chairs are deserted; run 30% "Early Bird Fasting Specials".',
      'Host corporate and student deals on Tuesdays & Wednesdays to smooth out weekly dips.',
    ],
    content: [
      'Salons face huge demand variance: Friday morning and Sunday evening are packed with lines, while Tuesday afternoon chairs stand empty with barbers scrolling TikTok.',
      'Jummah Express Protocol: Between 11:00 AM and 1:15 PM before Friday prayers, clients want quick beard trims, hair washes, and attar/cologne touchups. Introduce a "Jummah Mubarak Grooming Combo" (Haircut + Beard + Attar mist for Rs. 1,200) that finishes strictly in 25 minutes.',
      'Ramadan Survival: From 1st to 20th Ramadan, revenue drops by 60% during daytime because clients are fasting. Offer an "Afternoon Relaxation Deal" (Head massage + Hair treatment + Facial for Rs. 2,000 instead of Rs. 3,500) to pull in clients who work flexible remote hours.',
    ],
    actionSteps: [
      'Schedule automated WhatsApp broadcasts on Thursday evening reminding clients to book Friday morning Jummah slots.',
      'Adjust staff shift rosters during Ramadan: Morning skeleton crew (2 barbers), night full crew (all barbers till 2:00 AM).',
    ],
    pakistanContext: 'Friday prayers (Jummah) are a sacred routine in Pakistan. Groomsmen and professionals love looking sharp for Friday congregational prayers.',
  },

  // 6. MARKETING & DIGITAL DOMINANCE
  {
    id: 'art-tiktok-reels',
    category: 'marketing',
    title: '15-Second TikTok & Instagram Reels Transformation Blueprint',
    subtitle: 'Generating 50,000+ Local Organic Views Without Paid Ad Spend',
    readTime: '6 min read',
    badge: 'Viral Playbook',
    keyTakeaways: [
      'Pakistani social audiences obsess over dramatic before-and-after grooming transformations.',
      'The 3-second hook: Show messy, unkempt overgrown beard first, then snap transition to sharp skin fade.',
      'Always geo-tag your exact salon location pin (e.g. DHA Phase 6 Karachi) on every post.',
    ],
    content: [
      'Traditional print flyers and billboards in Pakistan are dead money. A single viral 15-second TikTok or Instagram Reel filmed inside your salon can bring in 40 new clients in a single weekend.',
      'The Winning Reel Format:\n1. 0-2 seconds: Close-up of overgrown hair, patchy neck, and untrimmed beard. Barber places cape on client.\n2. 3-8 seconds: Fast-motion montage of scissor over comb, clipper taper fade, steam machine billowing, razor line on cheek.\n3. 9-12 seconds: Hot towel press and hair pomade application.\n4. 13-15 seconds: Crisp transformation reveal! Client smiles, looks in mirror, combs hair. Trending Urdu/Punjabi background beat.',
      'Influencer Barter Collaboration SOP: Invite local food vloggers, fitness trainers, or lifestyle influencers (10k-50k followers). Offer them a complimentary Royal Grooming session (cost to you: Rs. 600 in consumables). In exchange, they post 2 Instagram stories tagging your location pin and praising your salon hygiene.',
    ],
    actionSteps: [
      'Buy a mobile gimbal (Rs. 9,000) and an overhead ring light for station #1 (designated video chair).',
      'Ask your most photogenic clients for permission: "Bhai aapka hair transition bohot zabardast bana hai, kya hum reel bana lein?" 80% will happily agree.',
    ],
    pakistanContext: 'Pakistani youth are heavy users of TikTok and Instagram. Content showcasing clean fades, beard fades, and relaxing head massages performs exceptionally well organically.',
  },
  {
    id: 'art-google-local-seo',
    category: 'marketing',
    title: 'Ranking #1 on Google Maps for "Men Salon Near Me"',
    subtitle: 'Capturing High-Intent Walk-Ins and Expat Visitors in DHA, Bahria & Gulberg',
    readTime: '5 min read',
    badge: 'Local SEO',
    keyTakeaways: [
      'When expats, overseas Pakistanis, or corporate visitors arrive, they search Google Maps first.',
      'A 4.8+ rating with 150+ reviews with photos will dominate local search results.',
      'Send a WhatsApp review link automatically 2 hours after invoice checkout.',
    ],
    content: [
      'Walk-in traffic in upscale commercial areas (e.g. Bukhari Commercial DHA Karachi, MM Alam Road Lahore, Jinnah Super Islamabad) is heavily driven by Google Maps searches. Overseas Pakistanis visiting for winter weddings will exclusively choose the top-rated salon on Google Maps.',
      'The 3 Pillars of Salon Local SEO:\n1. Exact Category: Set primary category to "Barber shop" and secondary categories to "Hair salon", "Beauty salon", "Men\'s health clinic".\n2. High-Resolution Photos: Upload 20+ photos of clean workstations, sterilized tools, barber chairs, and exterior facade with visible signage.\n3. Automated Review Collection: Never ask for a review awkwardly at the counter. Instead, send a polite WhatsApp message 2 hours after their visit: "Assalam-o-Alaikum Sir, hope you enjoyed your haircut today! If you have 30 seconds, please drop us a quick 5-star review on Google."',
    ],
    actionSteps: [
      'Generate your Google Review short-link and save it into your WhatsApp automation templates.',
      'Incentivize staff: Give barbers a Rs. 100 cash bonus for every 5-star Google review that mentions their name.',
    ],
    pakistanContext: 'Overseas Pakistanis visiting during December-January spend 3x more than average local clients on groom and luxury packages. Having a verified Google profile captures this lucrative market.',
  },

  // 7. EXPANDED FINANCIAL PLANNING & HIGH-PROFIT BLUEPRINTS (VERSION 15)
  {
    id: 'art-full-salon-financial-model',
    category: 'services',
    title: '4-Chair Pakistani Salon P&L Blueprint: Exact Unit Economics',
    subtitle: 'Financial Model: Rs. 550,000 Revenue, Rs. 188,000 Net Profit Target Analysis',
    readTime: '10 min read',
    badge: 'Core Financials',
    keyTakeaways: [
      'Target 550 services/month across 4 chairs @ Rs. 1,000 average ticket = Rs. 550,000 gross turnover.',
      'Total fixed overheads capped at Rs. 164,000 (Rent Rs. 85k + Electricity/Gen Rs. 55k + Tea/Cleaning Rs. 18k + Software Rs. 6k).',
      'Variable labor and consumables capped at 36% (Rs. 198,000), leaving a net owner profit of Rs. 188,000 (34.2%).',
    ],
    content: [
      'Operating a profitable salon in Pakistani tier-1 cities (Karachi, Lahore, Islamabad, Faisalabad) requires razor-sharp discipline over fixed overheads. Traditional owners fail because they overestimate walk-in volume while underestimating generator fuel and utility bills.',
      'The 4-Chair Model (Monthly PKR Numbers):\n• Total Operating Days: 30 days\n• Total Workstations: 4 Barber Chairs + 1 Washing Station\n• Daily Target Services: 18 to 20 client tickets\n• Average Ticket Value (ATV): Rs. 1,000 (Haircut Rs. 700 + Beard Rs. 400 + Addon Treatment averaged)\n• Monthly Gross Service Turnover: Rs. 550,000.',
      'Itemized Monthly Expenditure Breakdown:\n1. Fixed Shop Rent (Commercial Area 600-800 sq ft): Rs. 85,000\n2. Power & Energy (K-Electric/LESCO + Diesel/Petrol Gen backup): Rs. 55,000\n3. Front-Desk Receptionist / Cleaning Boy Base Pay: Rs. 24,000\n4. Salon Tea, Mineral Water, Cardamom, Refreshments: Rs. 18,000\n5. Disposable Blades, Towel Laundry, Neck Strips, Disinfectants: Rs. 12,000\n6. High-Grade Backbar Consumables (Shampoo, Bleach, Wax, Facial Creams): Rs. 32,000 (5.8%)\n7. Karigar Labor Commissions & Stylist Wages: Rs. 130,000 (23.6%)\n8. Software, Marketing & High-Speed WiFi: Rs. 6,000\n• Total Monthly Operating Outflow: Rs. 362,000\n• Net Clean Cash Profit to Owner: Rs. 188,000 / month (Annualized ~Rs. 2.25 Million).',
    ],
    actionSteps: [
      'Lock your daily break-even target at Rs. 12,066/day in the TGS Owner Ledger.',
      'Review invoice average ticket value daily: If ticket drops below Rs. 850, train staff to pitch head massages or beard balms.',
      'Deposit daily cash collections into business bank accounts every 48 hours to prevent counter shrinkage.',
    ],
    pakistanContext: 'In Pakistan, always negotiate a 2-year lease agreement with maximum 10% annual escalation. Uncapped rent increases can destroy salon unit economics after building local clientele.',
  },
  {
    id: 'art-signature-wedding-packages',
    category: 'services',
    title: 'High-Profit Pakistani Groom & Barat Package Architecture',
    subtitle: '3-Tier Menu Blueprint: Royal Barat (Rs. 18,500), Executive (Rs. 11,500), Classic (Rs. 6,500)',
    readTime: '8 min read',
    badge: '80%+ Margin',
    keyTakeaways: [
      'Groom packages generate 80% to 85% gross margins with advance non-refundable tokens.',
      'Offer 3 distinct tiers to anchor clients toward the high-margin Executive and Royal tiers.',
      'Include a "Dulha + 3 Brothers" bundle at Rs. 26,000 to capture entire wedding parties.',
    ],
    content: [
      'Wedding grooming in Pakistan is a high-emotion, low-price-sensitivity purchase. Grooms and their families want guaranteed photographic perfection and will happily pay premium rates for structured VIP treatment.',
      'Package Architecture (Exact Specifications & Costs):\n\n1. TGS Royal Barat Maharaja (Rs. 18,500):\n• Protocol: Spread across 3 visits (4 days prior, 1 day prior, event day morning).\n• Inclusions: 24K Gold Hydra-Facial, Scalp Detox & Haircut, Keratin Beard Conditioning, Charcoal Blackhead Vacuum, Hand & Foot Paraffin Manicure, Under-eye De-puffing, Event Hair Styling & Matte Pomade Finish.\n• Direct Consumables Cost: Rs. 1,650\n• Barber Commission: Rs. 3,500\n• Net Salon Profit: Rs. 13,350 (72.1% Net Margin)\n\n2. TGS Executive Groom (Rs. 11,500):\n• Inclusions: Whitening Herbal Glow Facial, Haircut & Scalp Polish, Royal Hot Towel Beard Spa, Express Mani/Pedi, Event Styling.\n• Direct Consumables Cost: Rs. 950\n• Barber Commission: Rs. 2,200\n• Net Salon Profit: Rs. 8,350 (72.6% Net Margin)\n\n3. TGS Classic Dulha (Rs. 6,500):\n• Inclusions: Deep Cleansing Facial, Master Haircut, Precision Beard Lineup, Charcoal Nose Strip, Styling.\n• Direct Consumables Cost: Rs. 550\n• Barber Commission: Rs. 1,300\n• Net Salon Profit: Rs. 4,650 (71.5% Net Margin).',
    ],
    actionSteps: [
      'Add all 3 groom packages to your TGS Services catalog under the "Wedding Packages" category.',
      'Collect 50% advance booking deposit via JazzCash / Bank Transfer before confirming date slots.',
      'Provide a complimentary branded garment bag or gift box of beard oil with the Royal Maharaja package.',
    ],
    pakistanContext: 'Pakistani wedding clients love personalized hospitality. Greet wedding parties with fresh mint margaritas or hot Kashmiri chai to create an elite salon atmosphere.',
  },
  {
    id: 'art-karigar-compensation-numbers',
    category: 'staff',
    title: 'Master Barber & Karigar Compensation Matrix & Retention Formulas',
    subtitle: 'Standardizing Base Salaries, Commission Ladders & Safe Advance (Udhari) Rules',
    readTime: '9 min read',
    badge: 'HR Blueprint',
    keyTakeaways: [
      'Tier 1 Junior Barber: Rs. 25,000 base + 15% commission on revenue above Rs. 50,000.',
      'Tier 2 Senior Stylist: Rs. 30,000 base + 20% commission on revenue above Rs. 70,000.',
      'Tier 3 Master Barber (Star): 35% pure commission with a guaranteed safety floor of Rs. 45,000.',
    ],
    content: [
      'Employee turnover is the #1 killer of salon profitability in Pakistan. When a master barber leaves, clients often follow. To retain elite talent without going bankrupt, adopt a structured incentive ladder that rewards cross-selling high-margin services.',
      'Standardized Compensation Framework:\n• Base Salary Safety Net: Every karigar needs guaranteed income to cover family rent and flour/oil groceries (Atta/Ghee).\n• Tiered Commission Accelerator: Junior barbers earn 15% once covering 2x their salary in sales; Senior stylists earn 20% over Rs. 70,000; Master barbers get 35% on all service turnover with zero base or a minimum floor.\n• Chemical & Treatment Bonus: Give an additional flat Rs. 200 bonus per facial and Rs. 500 bonus per Keratin treatment sold. This aligns staff incentives with high-margin items.',
      'Rules for Salary Advances (Udhari & Kameti Management):\n1. Never issue advances exceeding 35% of the staff member\'s average monthly earnings over the last 90 days.\n2. Deduct all advances across 2 equal monthly pay cycles (50% on the 1st of each month).\n3. Require a signed advance voucher and retain a photocopy of verified CNIC.',
    ],
    actionSteps: [
      'Configure the 4-tier compensation settings in TGS Staff & Payroll page for each barber.',
      'Set automated late arrival penalties (Rs. 20/minute past the 15-minute grace period) to eliminate chronic morning tardiness.',
      'Review monthly performance slips with each barber in private on the 1st of every month.',
    ],
    pakistanContext: 'Pakistani karigars value respect (Izzat) as much as money. Award a monthly "Stylist of the Month" trophy with a Rs. 3,000 cash envelope during team meetings.',
  },
  {
    id: 'art-energy-solar-generator-sizing',
    category: 'place',
    title: 'Engineering Solar & Generator Backup for Zero-Flicker Salons',
    subtitle: 'Sizing 10kW Hybrid Inverters, 200Ah Lithium Batteries & 15kVA Gensets in PKR',
    readTime: '8 min read',
    badge: 'Energy Security',
    keyTakeaways: [
      '10kW Hybrid Solar System with 48V 200Ah LiFePO4 batteries costs ~Rs. 1,150,000 installed.',
      'Saves Rs. 50,000 to Rs. 75,000 monthly in grid electricity and generator fuel bills.',
      'Full capital expenditure payback achieved in 16 to 18 months.',
    ],
    content: [
      'Power outages during summer in Pakistan cause direct financial bleeding. Running an unthrottled diesel or petrol generator for 6 hours a day burns 2.5 to 4 liters/hour at Rs. 275/L = Rs. 2,500 to Rs. 4,400 daily (Rs. 75,000 to Rs. 130,000 monthly in fuel alone!).',
      'The Hybrid Solar Sizing Matrix for 4-Chair Salon:\n• Total Connected Load: 2 x 1.5-Ton DC Inverter ACs (1,600W combined running) + 4 Clippers (80W) + Lights/Fans (350W) + 2 Blow Dryers (3,600W intermittent peak) = Peak 5.6kW to 6.2kW.\n• Inverter Specification: 10kW On-Grid/Off-Grid Hybrid Inverter with Dual MPPT (e.g. Huawei, Inverex, Knox or Growatt).\n• Battery Specification: 48V 200Ah or 2x 100Ah Lithium Iron Phosphate (LiFePO4) Server Rack Battery (10-year lifespan, 6,000 cycles, 90% Depth of Discharge).\n• Solar Panel Array: 14 to 16 x 580W Tier-1 Bifacial N-Type Panels (~8.5 kWp DC capacity).',
      'Financial ROI Breakdown:\n• Total Capital Investment: Rs. 1,150,000\n• Monthly Grid Bill Reduction: Rs. 42,000\n• Monthly Generator Fuel Saved: Rs. 28,000\n• Combined Monthly Savings: Rs. 70,000\n• Net Payback Period: 16.4 months\n• Return on Investment (ROI): 73% per year.',
    ],
    actionSteps: [
      'Log solar equipment into TGS CapEx & Assets register to track depreciation across 3 years.',
      'Install an Automatic Transfer Switch (ATS) with 10ms transfer time to avoid clipper stutter during grid cuts.',
      'Keep a compact 8kVA silent petrol generator as emergency secondary backup for monsoon rainy weeks.',
    ],
    pakistanContext: 'In Karachi and Lahore, solar panel dust accumulation reduces output by up to 25%. Schedule junior staff to wash solar panels with soft water every Tuesday morning before opening.',
  },
  {
    id: 'art-wholesale-procurement-matrix',
    category: 'product',
    title: 'Wholesale Procurement Cost-per-Service Breakdown Matrix',
    subtitle: 'Exact Milliliter & Gram Costs for Keune, L\'Oreal, Shampoos & Disposables',
    readTime: '7 min read',
    badge: 'Supply Chain',
    keyTakeaways: [
      'Hair wash cost: Rs. 14 in bulk shampoo & conditioner (billed at Rs. 250 add-on).',
      'Herbal Facial cost: Rs. 320 in Dermacos/Golden Pearl products (billed at Rs. 2,500).',
      'Keune Tinta Color cost: Rs. 850 per half-tube + developer (billed at Rs. 3,500).',
    ],
    content: [
      'To build a highly profitable salon, you must know the exact consumable cost of every service down to the rupee. Buying small retail containers burns 40% of your gross margins needlessly.',
      'Itemized Unit Economics per Service (Raw Supply Cost vs Salon Sale Price):\n\n1. Basic Haircut & Shave:\n• Single-use razor blade (Lord/Treet Platinum): Rs. 4\n• Disposable neck paper strip: Rs. 3\n• Shaving foam/gel pump: Rs. 6\n• Aftershave cologne splash: Rs. 8\n• Total Cost: Rs. 21 | Customer Pays: Rs. 1,000 | Markup: 47.6x\n\n2. Hair Wash & Conditioning:\n• 10ml Professional Salon Bulk Gallon Shampoo: Rs. 8\n• 8ml Deep Moisturizing Conditioner: Rs. 6\n• Total Cost: Rs. 14 | Customer Pays: Rs. 250 | Markup: 17.8x\n\n3. 6-Step Whitening Herbal Facial:\n• Cleanser, Scrub, Massage Cream, Mud Mask, Skin Polish, Toner: Rs. 320\n• Cotton wipes, sponge, facial tissue: Rs. 25\n• Total Cost: Rs. 345 | Customer Pays: Rs. 2,500 | Markup: 7.2x\n\n4. Keratin Protein Smoothing:\n• 40ml Formaldehyde-Free Keratin Cream (Bulk 1000ml bottle): Rs. 780\n• Clarifying prep shampoo & seal serum: Rs. 180\n• Total Cost: Rs. 960 | Customer Pays: Rs. 7,000 | Markup: 7.3x.',
    ],
    actionSteps: [
      'Establish wholesale distributor trade accounts at Shah Alam Market (Lahore) or Bolton Market (Karachi).',
      'Install dispensing pump tops with measured 3ml stroke volumes on all backbar shampoo and tonic bottles.',
      'Record monthly wholesale purchase receipts in TGS Expense Tracker under "Consumables".',
    ],
    pakistanContext: 'Always purchase genuine sealed packaging from authorized brand distributors. Counterfeit hair colors and expired bleaching powders cause chemical burns that permanently damage salon goodwill.',
  },
  {
    id: 'art-annual-revenue-calendar',
    category: 'marketing',
    title: '12-Month Pakistan Salon Seasonal Demand & Cashflow Calendar',
    subtitle: 'Month-by-Month Strategy: Managing Summer Dips, Muharram Slump & Winter Shadi Surges',
    readTime: '8 min read',
    badge: 'Annual Roadmap',
    keyTakeaways: [
      'Peak Seasons (Oct-Feb & Eid Rush): Maximize prices, run zero discounts, upsell groom packages.',
      'Slump Seasons (Muharram/Safar & Post-Eid): Run student discounts, corporate packages, and deep facials.',
      'Maintain a 3-month operating cash buffer (Rs. 450,000) during wedding season to fund slow summer months.',
    ],
    content: [
      'Pakistan salon business experiences violent seasonal swings tied to the Islamic calendar and winter wedding months. Salons that do not prepare cash reserves during peak months often struggle to pay shop rent during summer slumps.',
      'The 12-Month Operational Roadmap:\n\n• October - November (Pre-Shadi Warmup):\nTurnover: 120% of baseline. Target corporate grooms and engagement parties. Launch wedding booking campaigns.\n\n• December - January (Super Peak Shadi Season):\nTurnover: 150% - 170% of baseline. All chairs operating at maximum capacity. Groomsmen packages and luxury facials dominate billing.\n\n• Ramadan (Variable Months):\nDaytime turnover drops by 60%; night-time turnover surges. Transition to post-Iftar to Sehri midnight operations.\n\n• Eid-ul-Fitr & Chand Raat (The Golden 72 Hours):\nTurnover: 250% - 300% of baseline. Non-stop express haircuts and beard fades.\n\n• Muharram & Safar (The Annual Slump):\nTurnover: 65% of baseline due to cultural mourning periods with zero weddings. Strategy: Promote self-care, hair fall treatments, anti-dandruff therapies, and student packages to maintain cashflow.',
    ],
    actionSteps: [
      'Review historical revenue trends in TGS Reports & Analytics page before each quarter.',
      'Bank 25% of wedding season net profits into a reserve account for summer rent stability.',
      'Launch customized WhatsApp campaign blasts timed 2 weeks before seasonal shifts.',
    ],
    pakistanContext: 'During Muharram and Safar in Pakistan, avoid aggressive celebratory marketing. Instead, position services around hygiene, scalp health, and professional business grooming.',
  },
];

export const SalonKnowledgeVaultPage: React.FC = () => {
  const { role, currencyFormat } = useSalon();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeArticle, setActiveArticle] = useState<KnowledgeArticle | null>(KNOWLEDGE_ARTICLES[0]);

  // Interactive Calculator State (Load Shedding: Generator vs Solar)
  const [genKva, setGenKva] = useState<number>(15);
  const [fuelPricePerLiter, setFuelPricePerLiter] = useState<number>(275);
  const [loadSheddingHoursDaily, setLoadSheddingHoursDaily] = useState<number>(4);
  const [solarInvestment, setSolarInvestment] = useState<number>(950000);

  // Interactive Wedding Groom Deal Estimator
  const [groomPackagePrice, setGroomPackagePrice] = useState<number>(9500);
  const [materialCost, setMaterialCost] = useState<number>(1200);
  const [staffCommissionPercent, setStaffCommissionPercent] = useState<number>(20);
  const [estimatedGroomsPerMonth, setEstimatedGroomsPerMonth] = useState<number>(15);

  // Filtered Articles
  const filteredArticles = useMemo(() => {
    return KNOWLEDGE_ARTICLES.filter((art) => {
      const matchesCategory = selectedCategory === 'all' || art.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        art.title.toLowerCase().includes(q) ||
        art.subtitle.toLowerCase().includes(q) ||
        art.keyTakeaways.some((t) => t.toLowerCase().includes(q)) ||
        art.pakistanContext.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Strict Owner Access Guard
  if (role !== 'owner') {
    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto my-12 bg-card border border-destructive/30 rounded-3xl shadow-sm">
        <div className="w-14 h-14 mx-auto rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center font-bold">
          <Shield className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-destructive">Owner Access Required</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          The Pakistan Salon Pro Playbook &amp; Knowledge Vault contains private operational blueprints, supplier intelligence, and strategic calculators restricted exclusively to the Salon Owner.
        </p>
        <Button onClick={() => (window.location.href = '/')} variant="outline" className="rounded-xl text-xs font-bold">
          Return to Billing POS
        </Button>
      </div>
    );
  }

  // Calculator Computations: Generator vs Solar
  const generatorHourlyLiters = Math.max(1.8, genKva * 0.18); // ~2.7L/hr for 15kVA
  const dailyFuelCost = generatorHourlyLiters * fuelPricePerLiter * loadSheddingHoursDaily;
  const monthlyFuelCost = dailyFuelCost * 30;
  const annualFuelCost = monthlyFuelCost * 12;
  const solarPaybackMonths = Math.max(1, Math.round(solarInvestment / (monthlyFuelCost * 0.85)));

  // Calculator Computations: Groom Deal Margin
  const commissionAmount = (groomPackagePrice * staffCommissionPercent) / 100;
  const netProfitPerGroom = groomPackagePrice - materialCost - commissionAmount;
  const groomProfitMargin = Math.round((netProfitPerGroom / groomPackagePrice) * 100);
  const monthlyGroomNetProfit = netProfitPerGroom * estimatedGroomsPerMonth;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Executive Header */}
      <div className="bg-gradient-to-r from-card via-card to-primary/5 border border-border/80 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                Pakistan Salon Pro Playbook
                <Badge variant="outline" className="border-amber-500/50 text-amber-600 bg-amber-50/50 dark:bg-amber-950/30 text-[10px] font-bold">
                  👑 Owner Vault Exclusive
                </Badge>
              </h1>
            </div>
            <p className="text-xs text-muted-foreground max-w-3xl leading-relaxed">
              Vast master operational blueprints, local wholesale sourcing maps, load shedding defense, staff anti-poaching protocols, and high-margin pricing engineered specifically for operating a market-leading men&apos;s salon in Pakistan.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Badge className="bg-emerald-600 text-white font-mono text-xs px-3 py-1 font-bold shadow-sm">
              🇵🇰 Pakistan Edition v15
            </Badge>
          </div>
        </div>

        {/* Global Search & Category Tabs */}
        <div className="mt-5 pt-4 border-t border-border/60 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search guides (e.g. generator, wedding, commission, keune, eid)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 text-xs rounded-xl bg-background border-border/80"
            />
          </div>

          {/* Quick Categories Filter */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Playbooks', icon: Store },
              { id: 'clients', label: 'Clients & Shadi', icon: Users },
              { id: 'staff', label: 'Staff & Karigars', icon: Scissors },
              { id: 'place', label: 'Place & Power', icon: Building2 },
              { id: 'product', label: 'Wholesale Hubs', icon: Package },
              { id: 'services', label: 'Pricing & Deals', icon: DollarSign },
              { id: 'marketing', label: 'Viral Marketing', icon: Megaphone },
            ].map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Master Reader + Article Navigator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Article List Navigator (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Playbooks &amp; Blueprints ({filteredArticles.length})
            </span>
            <span className="text-[11px] text-muted-foreground">Select to study blueprint</span>
          </div>

          <div className="space-y-2.5 max-h-[720px] overflow-y-auto pr-1">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((art) => {
                const isActive = activeArticle?.id === art.id;
                return (
                  <div
                    key={art.id}
                    onClick={() => setActiveArticle(art)}
                    className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                      isActive
                        ? 'bg-card border-primary ring-2 ring-primary/20 shadow-md'
                        : 'bg-card/70 border-border/80 hover:bg-muted/40 hover:border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider border-primary/30 text-primary">
                        {art.category}
                      </Badge>
                      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{art.readTime}</span>
                        <Badge className="bg-secondary text-secondary-foreground text-[9px] px-1.5 py-0 font-medium">
                          {art.badge}
                        </Badge>
                      </div>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-foreground line-clamp-1">{art.title}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                      {art.subtitle}
                    </p>

                    <div className="mt-2.5 pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                      <span className="text-primary font-semibold flex items-center gap-1">
                        Read Blueprint <ChevronRight className="w-3 h-3" />
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {art.keyTakeaways.length} Key Rules
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-8 text-center bg-card rounded-2xl border border-dashed border-border/80 space-y-2">
                <p className="text-xs text-muted-foreground">No blueprints match your search criteria.</p>
                <Button size="sm" variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} className="rounded-xl text-xs">
                  Reset Search
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Full Interactive Blueprint Reader (7 cols) */}
        <div className="lg:col-span-7">
          {activeArticle ? (
            <Card className="rounded-3xl border-border/80 shadow-sm bg-card overflow-hidden">
              <CardHeader className="p-5 sm:p-6 pb-4 border-b border-border/60 bg-muted/20">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-xs font-bold uppercase tracking-wider text-primary border-primary/40">
                    {activeArticle.category.toUpperCase()} MASTER PLAYBOOK
                  </Badge>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> {activeArticle.readTime}
                    </span>
                    <Badge className="bg-emerald-600 text-white text-[10px]">
                      {activeArticle.badge}
                    </Badge>
                  </div>
                </div>

                <CardTitle className="text-lg sm:text-xl font-black text-foreground tracking-tight">
                  {activeArticle.title}
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground mt-1">
                  {activeArticle.subtitle}
                </CardDescription>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 space-y-6 text-xs sm:text-sm leading-relaxed">
                {/* Executive Key Rules Banner */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-2.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-primary">
                    <Sparkles className="w-4 h-4" />
                    <span>Non-Negotiable Executive Takeaways:</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-foreground/90 font-medium pl-1">
                    {activeArticle.keyTakeaways.map((takeaway, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Deep Operational Blueprint Breakdown */}
                <div className="space-y-3.5">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    In-Depth Operational Blueprint &amp; Strategy:
                  </h4>
                  {activeArticle.content.map((paragraph, idx) => (
                    <p key={idx} className="text-foreground/90 leading-relaxed text-xs sm:text-sm">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {/* Local Pakistan Realities & Market Context */}
                <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Pakistan Ground Reality &amp; Local Context:</span>
                  </div>
                  <p className="text-amber-900/90 dark:text-amber-200/90 text-xs leading-relaxed">
                    {activeArticle.pakistanContext}
                  </p>
                </div>

                {/* Actionable Implementation Steps */}
                <div className="space-y-2.5 pt-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                    Immediate Actionable Steps for Owner:
                  </h4>
                  <div className="space-y-2">
                    {activeArticle.actionSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/50 text-xs">
                        <span className="w-5 h-5 rounded-lg bg-primary text-primary-foreground font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span className="text-foreground font-medium">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="h-full flex items-center justify-center p-12 text-center bg-card rounded-3xl border border-dashed border-border/80">
              <p className="text-muted-foreground text-xs">Select an article from the left to inspect detailed blueprint.</p>
            </div>
          )}
        </div>
      </div>

      {/* Strategic Owner Financial Calculators Section */}
      <div className="pt-4 border-t border-border/80 space-y-4">
        <div className="flex items-center gap-2 px-1">
          <Calculator className="w-5 h-5 text-primary" />
          <h2 className="text-base sm:text-lg font-black text-foreground">
            Strategic Financial Engines &amp; ROI Simulators (PKR)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Simulator 1: Load Shedding Generator vs Solar ROI */}
          <Card className="rounded-3xl border-border/80 shadow-sm bg-card flex flex-col justify-between">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <Zap className="w-4 h-4 text-amber-500" />
                  Load Shedding: Generator vs Solar Payback Engine
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono border-amber-500/40 text-amber-600">
                  Energy CapEx
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Calculate your monthly diesel fuel expenditure vs a 6-10kW Hybrid Solar Inverter setup in Pakistan.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Generator Rating (kVA)</label>
                  <Input
                    type="number"
                    value={genKva}
                    onChange={(e) => setGenKva(Number(e.target.value) || 1)}
                    className="h-8 text-xs font-mono font-bold rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Diesel Price (Rs./Liter)</label>
                  <Input
                    type="number"
                    value={fuelPricePerLiter}
                    onChange={(e) => setFuelPricePerLiter(Number(e.target.value) || 1)}
                    className="h-8 text-xs font-mono font-bold rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Daily Load Shedding (Hours)</label>
                  <Input
                    type="number"
                    value={loadSheddingHoursDaily}
                    onChange={(e) => setLoadSheddingHoursDaily(Number(e.target.value) || 1)}
                    className="h-8 text-xs font-mono font-bold rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Estimated Solar Cost (Rs.)</label>
                  <Input
                    type="number"
                    value={solarInvestment}
                    onChange={(e) => setSolarInvestment(Number(e.target.value) || 1)}
                    className="h-8 text-xs font-mono font-bold rounded-xl"
                  />
                </div>
              </div>

              {/* Result Summary Box */}
              <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Monthly Generator Fuel Cost:</span>
                  <span className="font-mono font-black text-destructive text-sm">
                    {currencyFormat(monthlyFuelCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Annual Generator Bleed:</span>
                  <span className="font-mono font-bold text-destructive text-xs">
                    {currencyFormat(annualFuelCost)}
                  </span>
                </div>
                <div className="pt-2 border-t border-amber-300/60 dark:border-amber-800/60 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Solar Investment Payback Period:</span>
                    <span className="text-[10px] text-muted-foreground">Zero generator noise + 100% clean power</span>
                  </div>
                  <Badge className="bg-emerald-600 text-white font-mono text-sm px-2.5 py-1 font-black">
                    ~{solarPaybackMonths} Months
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Simulator 2: Wedding Groom Royal Package Profit Margin Estimator */}
          <Card className="rounded-3xl border-border/80 shadow-sm bg-card flex flex-col justify-between">
            <CardHeader className="p-5 pb-3 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                  <Award className="w-4 h-4 text-primary" />
                  Wedding Groom Deal Net Margin Estimator
                </CardTitle>
                <Badge variant="outline" className="text-[10px] font-mono border-primary/40 text-primary">
                  Shadi Package ROI
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Simulate gross revenue, staff commission payout, cosmetic material burn, and net profit per groom package.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-5 space-y-4 text-xs flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Groom Package Price (Rs.)</label>
                  <Input
                    type="number"
                    value={groomPackagePrice}
                    onChange={(e) => setGroomPackagePrice(Number(e.target.value) || 1)}
                    className="h-8 text-xs font-mono font-bold rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Cosmetics Cost (Facial/Keratin) (Rs.)</label>
                  <Input
                    type="number"
                    value={materialCost}
                    onChange={(e) => setMaterialCost(Number(e.target.value) || 0)}
                    className="h-8 text-xs font-mono font-bold rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Barber Commission (%)</label>
                  <Input
                    type="number"
                    value={staffCommissionPercent}
                    onChange={(e) => setStaffCommissionPercent(Number(e.target.value) || 0)}
                    className="h-8 text-xs font-mono font-bold rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-muted-foreground">Expected Grooms / Month</label>
                  <Input
                    type="number"
                    value={estimatedGroomsPerMonth}
                    onChange={(e) => setEstimatedGroomsPerMonth(Number(e.target.value) || 1)}
                    className="h-8 text-xs font-mono font-bold rounded-xl"
                  />
                </div>
              </div>

              {/* Result Summary Box */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Staff Commission Payout:</span>
                  <span className="font-mono text-muted-foreground text-xs">
                    {currencyFormat(commissionAmount)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-muted-foreground">Net Owner Profit per Groom:</span>
                  <span className="font-mono font-black text-emerald-600 text-sm">
                    {currencyFormat(netProfitPerGroom)} ({groomProfitMargin}% Net Margin)
                  </span>
                </div>
                <div className="pt-2 border-t border-primary/20 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-foreground block">Monthly Wedding Season Cash Addition:</span>
                    <span className="text-[10px] text-muted-foreground">Based on {estimatedGroomsPerMonth} groom bookings</span>
                  </div>
                  <Badge className="bg-primary text-primary-foreground font-mono text-sm px-2.5 py-1 font-black">
                    +{currencyFormat(monthlyGroomNetProfit)}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
