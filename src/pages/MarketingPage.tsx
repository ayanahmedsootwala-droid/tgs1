import React, { useState, useMemo } from 'react';
import { useSalon } from '@/contexts/SalonContext';
import type { MarketingCampaign, InfluencerCollab, SocialCalendarPost, ReviewBounty } from '@/types/salon';
import { maskClientPhone } from '@/utils/phoneMask';
import {
  Megaphone,
  Plus,
  Send,
  MessageSquare,
  Users,
  Copy,
  Check,
  Calendar,
  Sparkles,
  TrendingUp,
  Percent,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Video,
  QrCode,
  Instagram,
  Star,
  Printer,
  Share2,
  Award,
  Clock,
  Film,
  Camera,
  Gift,
  PhoneCall,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import QRCodeDataUrl from '@/components/ui/qrcodedataurl';
import { toast } from 'sonner';

// Ready Pakistani Salon Reels Concepts
interface ReelConcept {
  id: string;
  title: string;
  category: string;
  hook: string;
  visualCue: string;
  caption: string;
  hashtags: string[];
}

const REELS_TEMPLATES: ReelConcept[] = [
  {
    id: 'reel-1',
    title: 'Executive Beard Sculpt & Hot Towel ASMR',
    category: 'ASMR & Beard',
    hook: 'When was the last time someone styled your beard with precision? 🧔🏻‍♂️🔥',
    visualCue: 'Close-up slow-motion hot towel steaming, straight razor glide with lather crackle sound, finished with matte beard balm sheen.',
    caption: `Sharp lines speak louder than words. 💈 Upgrade your grooming standard with our Master Beard Sculpting & Hot Towel Therapy at TGS. Walk in tired, walk out looking like a million bucks.\n\n📍 Plot 14-C, Phase 6, DHA, Karachi.\n📲 Book appointment via link in bio or WhatsApp +92 300 1234567.`,
    hashtags: ['#TGSSalon', '#KarachiBarber', '#BeardSculpting', '#PakistaniMen', '#DHAStyle', '#HotTowelShave', '#MenGroomingPakistan'],
  },
  {
    id: 'reel-2',
    title: 'From Shaggy to Sharp: Before & After Transformation',
    category: 'Haircut & Styling',
    hook: 'Watch this 3-month overdue hair transform in 45 minutes! ✂️⚡️',
    visualCue: 'Fast snap transition: Start with client looking at camera messy, hand covers lens, snap to crisp mid-drop skin fade with textured scissor crop.',
    caption: `Never underestimate the power of an expert fade. ⚡️ From unmanaged locks to sharp executive confidence in under an hour. Which look do you prefer — 1 or 2? Drop your thoughts below! 👇\n\n💈 Master Barber Station reserved.\n💬 DM or WhatsApp to claim your preferred chair this week.`,
    hashtags: ['#FadeTransformation', '#KarachiHaircut', '#BeforeAndAfter', '#BarberShopKarachi', '#TGSGrooming', '#SkinFadePakistan', '#MensHairTrends'],
  },
  {
    id: 'reel-3',
    title: 'Friday Sunnah Grooming Clean Fades',
    category: 'Jumma Special',
    hook: 'Jumma Mubarak! Ready for Friday prayers in style? 🕌✂️',
    visualCue: 'Early morning salon prep, fresh clean towels, crisp white shalwar kameez grooming styling, attar fragrance application, clean beard line.',
    caption: `Jumma Mubarak from the team at The Grooming Studio! 🕌 Start your blessed day with our Friday Sunnah Grooming ritual: Precision Haircut, Beard Lineup & Organic Charcoal Detan Mask.\n\n✨ Bring a wingman or brother today and both get 20% OFF paired styling!\n📲 Instant WhatsApp booking link in bio.`,
    hashtags: ['#JummaMubarak', '#FridayGrooming', '#SunnahGrooming', '#TGSSalon', '#KarachiGentlemen', '#DHAHaircut', '#PakistaniGrooming'],
  },
  {
    id: 'reel-4',
    title: 'The Pakistani Royal Dulha (Groom) Package',
    category: 'Wedding Special',
    hook: 'Your wedding day happens once. Don’t gamble on your styling. 👑🤵🏻',
    visualCue: 'Groom walk-in, comprehensive facial glow treatment, keratin steam therapy, royal mani-pedi, haircut with textured styling, suit jacket on.',
    caption: `The groom deserves the limelight just as much as the bride! 👑 Our Royal Dulha Package includes: Gold Facial Glow, Keratin Shine, Signature Scissor Cut, Beard Geometry & Hand/Foot Spa. Look and feel regal on your big stage.\n\n💍 Wedding package slots filling fast for this season. Advance booking mandatory.`,
    hashtags: ['#PakistaniGroom', '#DulhaPackage', '#KarachiWeddings', '#PakistaniBrideGroom', '#WeddingGrooming', '#TGSRoyalGroom', '#DHAWeddings'],
  },
  {
    id: 'reel-5',
    title: 'Keratin & Protein Therapy Recovery',
    category: 'Hair Treatments',
    hook: 'Rough, frizzy, heat-damaged hair? Watch this keratin shine! 💧✨',
    visualCue: 'Macro zoom of dry frizzy hair tips, application of organic keratin formula, steam infusion machine running, blow-dry revealing mirror-gloss hair.',
    caption: `Karachi heat and humidity destroying your hair texture? ☀️ Repair dry, brittle hair with our Brazilian Keratin & Protein Infusion. Silky, manageable and 100% frizz-free for up to 3 months.\n\n✨ Special weekday promo available. DM us for consultation.`,
    hashtags: ['#KeratinTreatmentKarachi', '#HairRepair', '#FrizzFreeHair', '#TGSSalon', '#MenHairTherapy', '#KarachiSalons', '#ProteinTreatment'],
  },
];

export const MarketingPage: React.FC = () => {
  const {
    marketingCampaigns,
    addCampaign,
    updateCampaign,
    deleteCampaign,
    trackCampaignSend,
    clients,
    settings,
    services,
    staff,
    currencyFormat,
    role,
  } = useSalon();

  const [activeTab, setActiveTab] = useState<'campaigns' | 'reels_studio' | 'whatsapp_gen' | 'influencers' | 'content_calendar' | 'review_bounty'>('campaigns');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAudienceFilter, setSelectedAudienceFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State for Broadcast Campaign
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [discountCode, setDiscountCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<string>('20');
  const [targetAudience, setTargetAudience] = useState<MarketingCampaign['target_audience']>('all');
  const [messageTemplate, setMessageTemplate] = useState('');

  // WhatsApp Generator State
  const [waClientName, setWaClientName] = useState('');
  const [waSelectedService, setWaSelectedService] = useState('Executive Haircut & Beard Sculpting');
  const [waSelectedStaff, setWaSelectedStaff] = useState('Any Master Barber');
  const [waCustomNote, setWaCustomNote] = useState('I want to book an appointment for today/tomorrow');

  // Influencer Collaborations State (in-memory demo with persistence)
  const [influencers, setInfluencers] = useState<InfluencerCollab[]>([
    {
      id: 'inf-1',
      influencer_name: 'Shahzaib Khan',
      social_handle: '@shahzaibk_fitness',
      platform: 'instagram',
      followers_count: 85000,
      deal_type: 'barter',
      barter_services: 'Full Grooming + Charcoal Detan Facial',
      status: 'content_published',
      deliverables_agreed: '1 Reel + 3 IG Stories with @tgs.pk tag',
      promo_code_given: 'SHAHZAIB15',
      scheduled_date: '2026-10-10',
    },
    {
      id: 'inf-2',
      influencer_name: 'Bilal Farooqi',
      social_handle: '@bilal_lifestyle',
      platform: 'tiktok',
      followers_count: 140000,
      deal_type: 'barter',
      barter_services: 'Skin Fade + Beard Shave + Hair Keratin',
      status: 'visited',
      deliverables_agreed: '1 TikTok Video + Link in Bio',
      promo_code_given: 'BILAL_TGS',
      scheduled_date: '2026-10-14',
    },
    {
      id: 'inf-3',
      influencer_name: 'Usman Qureshi',
      social_handle: '@usmanq_vlogs',
      platform: 'instagram',
      followers_count: 52000,
      deal_type: 'barter',
      barter_services: 'Wedding Groom Package Experience',
      status: 'scheduled',
      deliverables_agreed: '1 Reel + Feed Post',
      promo_code_given: 'ROYAL_USMAN',
      scheduled_date: '2026-10-20',
    },
  ]);
  const [isInfluencerModalOpen, setIsInfluencerModalOpen] = useState(false);
  const [newInfName, setNewInfName] = useState('');
  const [newInfHandle, setNewInfHandle] = useState('');
  const [newInfPlatform, setNewInfPlatform] = useState<'instagram' | 'tiktok'>('instagram');
  const [newInfFollowers, setNewInfFollowers] = useState<number>(50000);
  const [newInfBarterServices, setNewInfBarterServices] = useState('Haircut + Beard Styling + Facial');
  const [newInfDeliverables, setNewInfDeliverables] = useState('1 Reel + 3 Stories');
  const [newInfPromoCode, setNewInfPromoCode] = useState('TGSGUEST');

  // Weekly Social Calendar State
  const [weeklyCalendar, setWeeklyCalendar] = useState<SocialCalendarPost[]>([
    {
      id: 'cal-1',
      day_of_week: 'Monday',
      theme: 'Motivation & Sharp Transformations',
      post_type: 'reel',
      caption_outline: 'Start the work week fresh: 45-second Skin Fade Before & After',
      hashtags: '#MondayMotivation #KarachiFades #TGSBarber',
      is_published: true,
    },
    {
      id: 'cal-2',
      day_of_week: 'Tuesday',
      theme: 'Behind the Scenes & Master Tools',
      post_type: 'story',
      caption_outline: 'Sanitizing Japanese shears and straight razor detailing ASMR',
      hashtags: '#BarberTools #CleanSalon #TGSBarbering',
      is_published: true,
    },
    {
      id: 'cal-3',
      day_of_week: 'Wednesday',
      theme: 'Mid-Week Off-Peak Detan Promo',
      post_type: 'carousel',
      caption_outline: 'Tue-Wed Happy Hours (2-5 PM): Free Charcoal Detan Mask with Haircut',
      hashtags: '#HappyHours #SkinGlow #KarachiSalons',
      is_published: false,
    },
    {
      id: 'cal-4',
      day_of_week: 'Thursday',
      theme: 'Weekend Prep & Chair Reservations',
      post_type: 'story',
      caption_outline: 'Weekend appointments are 70% booked! Tap link to reserve your barber',
      hashtags: '#WeekendGrooming #DHAStyle',
      is_published: false,
    },
    {
      id: 'cal-5',
      day_of_week: 'Friday',
      theme: 'Jumma Sunnah Grooming & Wingman Promo',
      post_type: 'reel',
      caption_outline: 'Jumma Mubarak clean fades + Bring a friend for 20% off paired styling',
      hashtags: '#JummaMubarak #FridayGrooming #WingmanDiscount',
      is_published: false,
    },
    {
      id: 'cal-6',
      day_of_week: 'Saturday',
      theme: 'Peak Day Energy & Client Spotlights',
      post_type: 'reel',
      caption_outline: 'Fast-paced Saturday cuts, coffee bar, and vibrant lounge vibes',
      hashtags: '#SaturdayNightFades #KarachiNightLife #TGSSalon',
      is_published: false,
    },
    {
      id: 'cal-7',
      day_of_week: 'Sunday',
      theme: 'Wedding Groom Special (Dulha Look)',
      post_type: 'carousel',
      caption_outline: 'Showcasing this weekend’s royal groom styling with signature beard geometry',
      hashtags: '#PakistaniGroom #WeddingStyling #RoyalDulha',
      is_published: false,
    },
  ]);

  // UGC Review Bounty State
  const [reviewBounties, setReviewBounties] = useState<ReviewBounty[]>([
    {
      id: 'bounty-1',
      client_name: 'Zuhair Siddiqui',
      client_phone: '+92 300 1122334',
      platform: 'google_review',
      review_rating: 5,
      proof_url: 'https://maps.google.com/review/1234',
      reward_status: 'rewarded',
      reward_amount: 500,
      created_at: '2026-10-02',
    },
    {
      id: 'bounty-2',
      client_name: 'Ahmed Raza',
      client_phone: '+92 321 4455667',
      platform: 'instagram_story',
      proof_url: 'instagram.com/stories/ahmedraza',
      reward_status: 'pending_verification',
      reward_amount: 500,
      created_at: '2026-10-04',
    },
  ]);
  const [newBountyClientName, setNewBountyClientName] = useState('');
  const [newBountyPhone, setNewBountyPhone] = useState('');
  const [newBountyPlatform, setNewBountyPlatform] = useState<'google_review' | 'instagram_story'>('google_review');
  const [isBountyModalOpen, setIsBountyModalOpen] = useState(false);

  // Target audience breakdown calculations
  const audienceSegments = useMemo(() => {
    const now = new Date();
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const d60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const inactive30d = clients.filter((c) => !c.last_visit_date || c.last_visit_date < d30);
    const inactive60d = clients.filter((c) => !c.last_visit_date || c.last_visit_date < d60);
    const topSpenders = clients.filter((c) => (c.total_spent || 0) >= 10000);
    const frequentClients = clients.filter((c) => (c.total_visits || 0) >= 5);

    return {
      all: clients.length,
      inactive_30d: inactive30d.length,
      inactive_60d: inactive60d.length,
      frequent_clients: frequentClients.length,
      top_spenders: topSpenders.length,
    };
  }, [clients]);

  // Clients matching the selected audience segment
  const targetedSegmentClients = useMemo(() => {
    const now = new Date();
    const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const d60 = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let list = clients;
    if (selectedAudienceFilter === 'inactive_30d') {
      list = clients.filter((c) => !c.last_visit_date || c.last_visit_date < d30);
    } else if (selectedAudienceFilter === 'inactive_60d') {
      list = clients.filter((c) => !c.last_visit_date || c.last_visit_date < d60);
    } else if (selectedAudienceFilter === 'frequent_clients') {
      list = clients.filter((c) => (c.total_visits || 0) >= 5);
    } else if (selectedAudienceFilter === 'top_spenders') {
      list = clients.filter((c) => (c.total_spent || 0) >= 10000);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q) || c.phone.includes(q));
    }
    return list;
  }, [clients, selectedAudienceFilter, searchQuery]);

  const [selectedTemplateForBroadcast, setSelectedTemplateForBroadcast] = useState<string>('winback');

  // Build dynamic WhatsApp link
  const generatedWhatsAppLink = useMemo(() => {
    const salonPhoneClean = (settings.phone || '+92 300 1234567').replace(/[^0-9]/g, '');
    const clientGreeting = waClientName.trim() ? `Salam! My name is ${waClientName.trim()}. ` : 'Salam! ';
    const message = encodeURIComponent(
      `${clientGreeting}I would like to book an appointment at ${settings.salon_name || 'The Grooming Studio'}.\n` +
      `✂️ Desired Service: ${waSelectedService}\n` +
      `💈 Preferred Barber: ${waSelectedStaff}\n` +
      `📝 Note: ${waCustomNote}\n` +
      `Please let me know available slots. Thank you!`
    );
    return `https://wa.me/${salonPhoneClean}?text=${message}`;
  }, [settings.phone, settings.salon_name, waClientName, waSelectedService, waSelectedStaff, waCustomNote]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !messageTemplate.trim()) {
      toast.error('Campaign Title and Message Template are required');
      return;
    }

    await addCampaign({
      title: title.trim(),
      description: description.trim() || undefined,
      discount_code: discountCode.trim() || undefined,
      discount_type: discountType,
      discount_value: parseFloat(discountValue) || 0,
      target_audience: targetAudience,
      message_template: messageTemplate.trim(),
      is_active: true,
    });

    setIsModalOpen(false);
    setTitle('');
    setDescription('');
    setDiscountCode('');
    setMessageTemplate('');
  };

  const handleAddInfluencer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInfName.trim() || !newInfHandle.trim()) {
      toast.error('Influencer Name and Handle are required');
      return;
    }
    const newCollab: InfluencerCollab = {
      id: `inf-${Date.now()}`,
      influencer_name: newInfName.trim(),
      social_handle: newInfHandle.trim(),
      platform: newInfPlatform,
      followers_count: Number(newInfFollowers) || 10000,
      deal_type: 'barter',
      barter_services: newInfBarterServices.trim(),
      status: 'scheduled',
      deliverables_agreed: newInfDeliverables.trim(),
      promo_code_given: newInfPromoCode.trim(),
      scheduled_date: new Date().toISOString().split('T')[0],
    };
    setInfluencers([newCollab, ...influencers]);
    toast.success(`Influencer collaboration with ${newInfName} recorded!`);
    setIsInfluencerModalOpen(false);
    setNewInfName('');
    setNewInfHandle('');
  };

  const togglePostPublished = (id: string) => {
    setWeeklyCalendar((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_published: !item.is_published } : item))
    );
    toast.success('Post publication status updated!');
  };

  const handleAddBounty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBountyClientName.trim()) {
      toast.error('Client name is required');
      return;
    }
    const newB: ReviewBounty = {
      id: `bounty-${Date.now()}`,
      client_name: newBountyClientName.trim(),
      client_phone: newBountyPhone.trim() || '+92 300 0000000',
      platform: newBountyPlatform,
      proof_url: 'Verified in salon',
      reward_status: 'pending_verification',
      reward_amount: 500,
      created_at: new Date().toISOString().split('T')[0],
    };
    setReviewBounties([newB, ...reviewBounties]);
    toast.success('Review submission logged for verification!');
    setIsBountyModalOpen(false);
    setNewBountyClientName('');
    setNewBountyPhone('');
  };

  const handleApproveBounty = (id: string) => {
    setReviewBounties((prev) =>
      prev.map((b) => (b.id === id ? { ...b, reward_status: 'rewarded' } : b))
    );
    toast.success('🎉 500 PKR Salon Credit voucher awarded to client!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">Social Media & Marketing Growth Studio</h1>
            <Badge variant="outline" className="border-primary/40 text-primary gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              TGS Viral OS
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            Automate Reels copy, WhatsApp direct bookings, Barter collaborations, weekly content grids, and Google Review contests.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'campaigns' && (
            <Button onClick={() => setIsModalOpen(true)} className="text-xs h-9 gap-1.5 font-bold">
              <Plus className="w-4 h-4" />
              New Broadcast Campaign
            </Button>
          )}
          {activeTab === 'influencers' && (
            <Button onClick={() => setIsInfluencerModalOpen(true)} className="text-xs h-9 gap-1.5 font-bold">
              <Plus className="w-4 h-4" />
              Add Influencer Collab
            </Button>
          )}
          {activeTab === 'review_bounty' && (
            <Button onClick={() => setIsBountyModalOpen(true)} className="text-xs h-9 gap-1.5 font-bold">
              <Plus className="w-4 h-4" />
              Log Review Entry
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
        <TabsList className="bg-muted/40 border p-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 h-auto gap-1">
          <TabsTrigger value="campaigns" className="text-xs font-semibold gap-1.5 py-2">
            <Megaphone className="w-3.5 h-3.5" />
            SMS & WhatsApp
          </TabsTrigger>
          <TabsTrigger value="reels_studio" className="text-xs font-semibold gap-1.5 py-2">
            <Film className="w-3.5 h-3.5 text-pink-500" />
            Reels & TikTok Studio
          </TabsTrigger>
          <TabsTrigger value="whatsapp_gen" className="text-xs font-semibold gap-1.5 py-2">
            <QrCode className="w-3.5 h-3.5 text-emerald-600" />
            WhatsApp Link & QR
          </TabsTrigger>
          <TabsTrigger value="influencers" className="text-xs font-semibold gap-1.5 py-2">
            <Camera className="w-3.5 h-3.5 text-purple-600" />
            Influencer Barters
          </TabsTrigger>
          <TabsTrigger value="content_calendar" className="text-xs font-semibold gap-1.5 py-2">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            Weekly Calendar
          </TabsTrigger>
          <TabsTrigger value="review_bounty" className="text-xs font-semibold gap-1.5 py-2">
            <Star className="w-3.5 h-3.5 text-amber-500" />
            UGC Review Bounty
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: SMS & WHATSAPP BROADCAST CAMPAIGNS */}
        <TabsContent value="campaigns" className="space-y-4 mt-4">
          {/* Quick Audience Segments */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            <Card
              onClick={() => setSelectedAudienceFilter('all')}
              className={`p-3 border shadow-none cursor-pointer transition-colors ${
                selectedAudienceFilter === 'all' ? 'border-primary bg-primary/5' : 'hover:bg-muted/30'
              }`}
            >
              <div className="text-[11px] font-medium text-muted-foreground">Total Client Base</div>
              <div className="text-xl font-bold font-mono text-foreground mt-0.5">{audienceSegments.all}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">All registered clients</p>
            </Card>

            <Card
              onClick={() => setSelectedAudienceFilter('inactive_30d')}
              className={`p-3 border shadow-none cursor-pointer transition-colors ${
                selectedAudienceFilter === 'inactive_30d' ? 'border-amber-500 bg-amber-500/5' : 'hover:bg-muted/30'
              }`}
            >
              <div className="text-[11px] font-medium text-muted-foreground">Inactive &gt; 30 Days</div>
              <div className="text-xl font-bold font-mono text-amber-600 mt-0.5">{audienceSegments.inactive_30d}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Due for haircut/groom</p>
            </Card>

            <Card
              onClick={() => setSelectedAudienceFilter('inactive_60d')}
              className={`p-3 border shadow-none cursor-pointer transition-colors ${
                selectedAudienceFilter === 'inactive_60d' ? 'border-rose-500 bg-rose-500/5' : 'hover:bg-muted/30'
              }`}
            >
              <div className="text-[11px] font-medium text-muted-foreground">Inactive &gt; 60 Days</div>
              <div className="text-xl font-bold font-mono text-rose-600 mt-0.5">{audienceSegments.inactive_60d}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Churn recovery targets</p>
            </Card>

            <Card
              onClick={() => setSelectedAudienceFilter('frequent_clients')}
              className={`p-3 border shadow-none cursor-pointer transition-colors ${
                selectedAudienceFilter === 'frequent_clients' ? 'border-emerald-500 bg-emerald-500/5' : 'hover:bg-muted/30'
              }`}
            >
              <div className="text-[11px] font-medium text-muted-foreground">Frequent Patrons</div>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">{audienceSegments.frequent_clients}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">&gt; 5 salon visits</p>
            </Card>

            <Card
              onClick={() => setSelectedAudienceFilter('top_spenders')}
              className={`p-3 border shadow-none cursor-pointer transition-colors ${
                selectedAudienceFilter === 'top_spenders' ? 'border-purple-500 bg-purple-500/5' : 'hover:bg-muted/30'
              }`}
            >
              <div className="text-[11px] font-medium text-muted-foreground">High Value (&gt; 10k)</div>
              <div className="text-xl font-bold font-mono text-purple-600 mt-0.5">{audienceSegments.top_spenders}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5">Premium package buyers</p>
            </Card>
          </div>

          {/* Campaigns Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketingCampaigns.map((camp) => (
              <Card key={camp.id} className="border shadow-none flex flex-col">
                <CardHeader className="p-4 pb-2 border-b flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold">{camp.title}</CardTitle>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {camp.target_audience.replace('_', ' ')}
                      </Badge>
                      {camp.discount_code && (
                        <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] font-mono">
                          {camp.discount_code}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteCampaign(camp.id)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </CardHeader>

                <CardContent className="p-4 space-y-3 text-xs flex-1">
                  <div className="p-2.5 rounded bg-muted/40 border border-border font-mono text-[11px] leading-relaxed whitespace-pre-wrap">
                    {camp.message_template}
                  </div>

                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Sent / Tracked:</span>
                    <span className="font-bold text-foreground">{camp.sent_count || 0} clients</span>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-2 border-t mt-auto flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(camp.message_template, camp.id)}
                    className="text-xs h-8 flex-1 gap-1"
                  >
                    {copiedId === camp.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    Copy Text
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      trackCampaignSend(camp.id);
                      const encoded = encodeURIComponent(camp.message_template);
                      window.open(`https://wa.me/?text=${encoded}`, '_blank');
                    }}
                    className="text-xs h-8 flex-1 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    <Send className="w-3 h-3" />
                    Open WhatsApp
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {/* TARGETED SEGMENT WHATSAPP BROADCAST DISPATCH DESK */}
          <Card className="border border-border/80 shadow-sm rounded-2xl overflow-hidden mt-6">
            <CardHeader className="p-4 pb-3 border-b bg-muted/20">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-foreground">
                    <Send className="w-4 h-4 text-emerald-600" />
                    Targeted Client Outreach Desk ({targetedSegmentClients.length} Recipients)
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Current Filter:{' '}
                    <span className="font-semibold text-primary capitalize">
                      {selectedAudienceFilter.replace('_', ' ')}
                    </span>
                    . Dispatch personalized one-click WhatsApp greetings directly to targeted patrons.
                  </CardDescription>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-48">
                    <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Filter recipients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 pl-7 text-xs rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 space-y-4">
              {/* Template Selection & Customization */}
              <div className="p-3 rounded-xl border border-border/60 bg-muted/30 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    Select Campaign Template
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        const allPhones = targetedSegmentClients.map((c) => c.phone).join(', ');
                        navigator.clipboard.writeText(allPhones);
                        toast.success(`Copied ${targetedSegmentClients.length} contact numbers to clipboard!`);
                      }}
                      className="h-7 text-[11px] rounded-lg"
                    >
                      <Copy className="w-3 h-3 mr-1" />
                      Copy All Numbers
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <Button
                    type="button"
                    variant={selectedTemplateForBroadcast === 'winback' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTemplateForBroadcast('winback')}
                    className="h-8 text-xs font-semibold rounded-xl"
                  >
                    🔄 30-Day Win-Back
                  </Button>
                  <Button
                    type="button"
                    variant={selectedTemplateForBroadcast === 'jumma' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTemplateForBroadcast('jumma')}
                    className="h-8 text-xs font-semibold rounded-xl"
                  >
                    🕌 Jumma Special
                  </Button>
                  <Button
                    type="button"
                    variant={selectedTemplateForBroadcast === 'milestone' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTemplateForBroadcast('milestone')}
                    className="h-8 text-xs font-semibold rounded-xl"
                  >
                    🎁 Free Facial Ready
                  </Button>
                  <Button
                    type="button"
                    variant={selectedTemplateForBroadcast === 'top_spender' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTemplateForBroadcast('top_spender')}
                    className="h-8 text-xs font-semibold rounded-xl"
                  >
                    👑 VIP Grooming Package
                  </Button>
                </div>
              </div>

              {/* Recipient Table */}
              <div className="w-full max-w-full overflow-x-auto bg-card rounded-xl border border-border/60">
                <table className="w-full text-xs text-left [&>div]:max-w-full">
                  <thead className="bg-muted/50 border-b text-muted-foreground font-semibold">
                    <tr>
                      <th className="py-2.5 px-3 whitespace-nowrap">Customer Name</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Phone Number</th>
                      <th className="py-2.5 px-3 whitespace-nowrap font-mono">Visits</th>
                      <th className="py-2.5 px-3 whitespace-nowrap font-mono">Total Spent</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">Last Visit</th>
                      <th className="py-2.5 px-3 whitespace-nowrap text-right">Instant Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {targetedSegmentClients.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-muted-foreground">
                          No clients found matching the selected filter.
                        </td>
                      </tr>
                    ) : (
                      targetedSegmentClients.slice(0, 20).map((c) => {
                        let dynamicMsg = `Salam ${c.name}! We noticed it's been a while since your last visit to ${settings.salon_name || 'The Grooming Studio'}. Treat yourself to a master haircut and beard trim this week with a complimentary hot towel therapy. Reply here to reserve your chair!`;
                        if (selectedTemplateForBroadcast === 'jumma') {
                          dynamicMsg = `Jumma Mubarak ${c.name}! Step into ${settings.salon_name || 'The Grooming Studio'} today for fresh Sunnah grooming, sharp beard sculpting, and premium hair wash. Book your priority chair via WhatsApp!`;
                        } else if (selectedTemplateForBroadcast === 'milestone') {
                          dynamicMsg = `Dear ${c.name}, thank you for your regular patronage at ${settings.salon_name || 'The Grooming Studio'}. Check your punch card balance—your complimentary facial reward is ready on your next grooming visit!`;
                        } else if (selectedTemplateForBroadcast === 'top_spender') {
                          dynamicMsg = `Salam ${c.name}, as one of our top patrons at ${settings.salon_name || 'The Grooming Studio'}, enjoy an exclusive Executive Grooming Hour with our senior stylist this weekend. Reply to lock in your slot!`;
                        }

                        const cleanPhone = c.phone.replace(/[^0-9]/g, '');
                        const waUrl = `https://wa.me/${cleanPhone.startsWith('92') ? cleanPhone : '92' + cleanPhone.replace(/^0/, '')}?text=${encodeURIComponent(dynamicMsg)}`;

                        return (
                          <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                            <td className="py-2.5 px-3 whitespace-nowrap font-bold text-foreground">
                              {c.name}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap font-mono text-muted-foreground">
                              {role === 'owner' ? c.phone : maskClientPhone(c.phone, role)}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap font-mono">
                              {c.total_visits}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-primary">
                              {currencyFormat(c.total_spent || 0)}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap text-muted-foreground">
                              {c.last_visit_date || 'No recent visit'}
                            </td>
                            <td className="py-2.5 px-3 whitespace-nowrap text-right">
                              <Button
                                size="sm"
                                onClick={() => window.open(waUrl, '_blank')}
                                className="h-7 px-2.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white gap-1"
                              >
                                <Send className="w-3 h-3" />
                                Send WhatsApp
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2: INSTAGRAM & TIKTOK REELS STUDIO */}
        <TabsContent value="reels_studio" className="space-y-4 mt-4">
          <div className="p-4 rounded border bg-gradient-to-r from-pink-500/10 via-purple-500/5 to-card flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Instagram className="w-5 h-5 text-pink-600" />
                <h3 className="text-sm font-bold text-foreground">Instagram & TikTok Viral Reels Copy Studio</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Pre-written, tested video concepts with high-converting hooks, visual shooting directions, and ready-to-copy Pakistani Urdu/English captions.
              </p>
            </div>
            <Badge className="bg-pink-600 text-white shrink-0 font-bold">
              5 Ready Pakistani Formats
            </Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {REELS_TEMPLATES.map((reel) => (
              <Card key={reel.id} className="border shadow-none flex flex-col">
                <CardHeader className="p-4 pb-2 border-b flex flex-row items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-base font-bold">{reel.title}</CardTitle>
                      <Badge variant="secondary" className="text-[10px]">{reel.category}</Badge>
                    </div>
                  </div>
                  <Film className="w-4 h-4 text-pink-500 shrink-0" />
                </CardHeader>

                <CardContent className="p-4 space-y-3 text-xs flex-1">
                  {/* Hook */}
                  <div className="p-2.5 rounded bg-pink-500/10 border border-pink-500/20">
                    <span className="font-bold text-pink-700 dark:text-pink-300 block mb-0.5">🔥 Video Hook (First 3 Seconds):</span>
                    <p className="font-medium text-foreground">{reel.hook}</p>
                  </div>

                  {/* Visual Direction */}
                  <div className="p-2 rounded bg-muted/40 border border-border">
                    <span className="font-semibold text-muted-foreground block mb-0.5">🎬 Visual Shooting Guide:</span>
                    <p className="text-muted-foreground leading-relaxed">{reel.visualCue}</p>
                  </div>

                  {/* Caption */}
                  <div>
                    <span className="font-semibold text-foreground block mb-1">📝 Ready Caption:</span>
                    <div className="p-2.5 rounded bg-card border border-border text-[11px] leading-relaxed whitespace-pre-wrap font-sans">
                      {reel.caption}
                    </div>
                  </div>

                  {/* Hashtags */}
                  <div>
                    <span className="font-semibold text-muted-foreground block mb-1">🏷️ Curated Hashtags:</span>
                    <div className="flex flex-wrap gap-1">
                      {reel.hashtags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-primary font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="p-4 pt-2 border-t mt-auto flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(reel.caption + '\n\n' + reel.hashtags.join(' '), reel.id + '-all')}
                    className="text-xs h-8 flex-1 gap-1"
                  >
                    {copiedId === reel.id + '-all' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    Copy Caption + Tags
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => copyToClipboard(reel.hashtags.join(' '), reel.id + '-tags')}
                    className="text-xs h-8 gap-1"
                  >
                    {copiedId === reel.id + '-tags' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    Copy Tags Only
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 3: WHATSAPP DIRECT BOOKING LINK & QR GENERATOR */}
        <TabsContent value="whatsapp_gen" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Generator Form */}
            <Card className="border shadow-none">
              <CardHeader className="p-4 border-b">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  WhatsApp Direct Booking Link Creator
                </CardTitle>
                <CardDescription className="text-xs">
                  Create customized direct booking links for social bios, Instagram stories, SMS broadcasts, or print QR codes for mirrors and counter stands.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4 space-y-3.5 text-xs">
                <div className="space-y-1">
                  <Label className="text-xs">Client Name (Optional)</Label>
                  <Input
                    value={waClientName}
                    onChange={(e) => setWaClientName(e.target.value)}
                    placeholder="Leave empty for generic link, or type name"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Pre-Selected Service Inquiry</Label>
                  <Select value={waSelectedService} onValueChange={setWaSelectedService}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Executive Haircut & Beard Sculpting">Executive Haircut & Beard Sculpting</SelectItem>
                      <SelectItem value="Brazilian Keratin Hair Therapy">Brazilian Keratin Hair Therapy</SelectItem>
                      <SelectItem value="Royal Dulha Wedding Groom Package">Royal Dulha Wedding Groom Package</SelectItem>
                      <SelectItem value="Charcoal Detan Facial Treatment">Charcoal Detan Facial Treatment</SelectItem>
                      <SelectItem value="General Salon Services Consultation">General Salon Services Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Requested Master Barber</Label>
                  <Select value={waSelectedStaff} onValueChange={setWaSelectedStaff}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Any Master Barber">Any Master Barber Available</SelectItem>
                      {staff.map((s) => (
                        <SelectItem key={s.id} value={s.name}>{s.name} ({s.specialization})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Custom Booking Note</Label>
                  <Input
                    value={waCustomNote}
                    onChange={(e) => setWaCustomNote(e.target.value)}
                    placeholder="e.g. Inquiring for Friday afternoon"
                    className="h-8 text-xs"
                  />
                </div>

                {/* Generated URL Box */}
                <div className="p-3 rounded bg-muted/40 border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-muted-foreground">Generated wa.me URL:</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(generatedWhatsAppLink, 'wa-link')}
                      className="h-6 px-2 text-[11px] gap-1"
                    >
                      {copiedId === 'wa-link' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      Copy Link
                    </Button>
                  </div>
                  <p className="text-[11px] font-mono break-all text-primary bg-card p-2 rounded border border-border">
                    {generatedWhatsAppLink}
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => window.open(generatedWhatsAppLink, '_blank')}
                    className="flex-1 h-9 text-xs font-bold gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Test on WhatsApp Web / Mobile
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Right: Printable QR Code Stand */}
            <Card className="border shadow-none flex flex-col items-center justify-center p-6 text-center bg-card">
              <div className="w-full max-w-xs p-5 rounded-xl border-2 border-dashed border-primary/40 bg-muted/20 flex flex-col items-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm tracking-wider">
                  TGS
                </div>

                <div>
                  <h4 className="font-bold text-sm text-foreground">{settings.salon_name || 'The Grooming Studio'}</h4>
                  <p className="text-[11px] text-muted-foreground">Scan to Instant Book via WhatsApp</p>
                </div>

                <div className="bg-white p-3 rounded-lg shadow-xs border border-border">
                  <QRCodeDataUrl text={generatedWhatsAppLink} width={180} />
                </div>

                <div className="space-y-0.5 text-[11px]">
                  <p className="font-bold text-foreground">VIP Priority Chair Booking</p>
                  <p className="text-muted-foreground font-mono">{settings.phone || '+92 300 1234567'}</p>
                </div>

                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
                  Ready for Barber Station Mirrors
                </Badge>
              </div>

              <div className="mt-4 flex gap-2 w-full max-w-xs">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="flex-1 h-8 text-xs gap-1.5 font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print QR Flyer
                </Button>
                <Button
                  size="sm"
                  onClick={() => copyToClipboard(generatedWhatsAppLink, 'qr-url')}
                  className="flex-1 h-8 text-xs gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Share Link
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 4: INFLUENCER & AMBASSADOR BARTERS */}
        <TabsContent value="influencers" className="space-y-4 mt-4">
          <div className="p-4 rounded border bg-purple-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-foreground">Barter Influencer Collaboration Manager</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Invite local Karachi/Lahore influencers for complimentary styling in exchange for 1 Reel + 3 Instagram Stories tagging @tgs.pk.
              </p>
            </div>
            <Badge className="bg-purple-600 text-white shrink-0 font-bold">
              Zero Cash Ad Spend
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {influencers.map((inf) => (
              <Card key={inf.id} className="border shadow-none flex flex-col">
                <CardHeader className="p-3.5 pb-2 border-b flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold">{inf.influencer_name}</CardTitle>
                    <CardDescription className="text-xs font-mono text-primary flex items-center gap-1 mt-0.5">
                      {inf.platform === 'instagram' ? <Instagram className="w-3 h-3 text-pink-500" /> : <Video className="w-3 h-3" />}
                      {inf.social_handle}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {(Number(inf.followers_count || 0) / 1000).toFixed(0)}k Followers
                  </Badge>
                </CardHeader>

                <CardContent className="p-3.5 space-y-2 text-xs flex-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Barter Services Provided:</span>
                    <span className="font-semibold text-foreground text-right">{inf.barter_services}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Agreed Deliverables:</span>
                    <span className="font-medium text-purple-700 dark:text-purple-300 text-right">{inf.deliverables_agreed}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tracking Promo Code:</span>
                    <Badge variant="secondary" className="font-mono text-[10px]">{inf.promo_code_given}</Badge>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t">
                    <span className="text-muted-foreground">Campaign Status:</span>
                    <Badge
                      className={
                        inf.status === 'content_published'
                          ? 'bg-emerald-600 text-white text-[10px]'
                          : inf.status === 'visited'
                          ? 'bg-amber-500 text-white text-[10px]'
                          : 'bg-muted text-muted-foreground text-[10px]'
                      }
                    >
                      {inf.status === 'content_published' ? 'Reel Live 🎉' : inf.status === 'visited' ? 'Salon Visited' : 'Scheduled'}
                    </Badge>
                  </div>
                </CardContent>

                <CardFooter className="p-3 pt-2 border-t mt-auto flex items-center justify-between gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const text = encodeURIComponent(
                        `Salam ${inf.influencer_name}! Looking forward to hosting you at TGS. Your complimentary grooming session is confirmed for ${inf.scheduled_date}. Let us know your preferred time!`
                      );
                      window.open(`https://wa.me/?text=${text}`, '_blank');
                    }}
                    className="text-xs h-8 flex-1 gap-1"
                  >
                    <MessageSquare className="w-3 h-3 text-emerald-600" />
                    WhatsApp
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => {
                      setInfluencers((prev) =>
                        prev.map((item) =>
                          item.id === inf.id
                            ? {
                                ...item,
                                status: item.status === 'scheduled' ? 'visited' : 'content_published',
                              }
                            : item
                        )
                      );
                      toast.success(`Updated status for ${inf.influencer_name}`);
                    }}
                    className="text-xs h-8 flex-1 gap-1"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Next Stage
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 5: WEEKLY SOCIAL CALENDAR */}
        <TabsContent value="content_calendar" className="space-y-4 mt-4">
          <div className="p-3 rounded border bg-card flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">Weekly Salon Content Calendar</h3>
              <p className="text-xs text-muted-foreground">
                Never run out of social media posts. Follow this structured Monday to Sunday content flow.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              7-Day Content Cycle
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-2.5">
            {weeklyCalendar.map((item) => (
              <Card key={item.id} className="border shadow-none flex flex-col p-3">
                <div className="flex items-center justify-between pb-1.5 border-b mb-2">
                  <span className="font-bold text-xs text-foreground">{item.day_of_week}</span>
                  <Badge variant={item.post_type === 'reel' ? 'default' : 'secondary'} className="text-[9px] uppercase">
                    {item.post_type}
                  </Badge>
                </div>

                <div className="text-[11px] font-semibold text-primary mb-1">
                  {item.theme}
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed flex-1">
                  {item.caption_outline}
                </p>

                <p className="text-[10px] text-muted-foreground/70 font-mono mt-2 truncate">
                  {item.hashtags}
                </p>

                <div className="pt-2 border-t mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-muted-foreground">
                    {item.is_published ? 'Published' : 'Draft'}
                  </span>
                  <Switch
                    checked={item.is_published}
                    onCheckedChange={() => togglePostPublished(item.id)}
                  />
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB 6: UGC REVIEW BOUNTY CONTEST */}
        <TabsContent value="review_bounty" className="space-y-4 mt-4">
          <div className="p-4 rounded border bg-amber-500/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="text-sm font-bold text-foreground">UGC Review Bounty & Story Tag Contest</h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Reward clients who leave a 5-Star Google Review or post an Instagram Story tagging @tgs.pk with Rs. 500 salon credit voucher.
              </p>
            </div>
            <Badge className="bg-amber-600 text-white shrink-0 font-bold">
              Rs. 500 Reward Voucher
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {reviewBounties.map((bounty) => (
              <Card key={bounty.id} className="border shadow-none flex flex-col">
                <CardHeader className="p-3.5 pb-2 border-b flex flex-row items-start justify-between">
                  <div>
                    <CardTitle className="text-sm font-bold">{bounty.client_name}</CardTitle>
                    <CardDescription className="text-xs font-mono">{bounty.client_phone}</CardDescription>
                  </div>
                  <Badge
                    variant={bounty.reward_status === 'rewarded' ? 'default' : 'secondary'}
                    className="text-[10px]"
                  >
                    {bounty.reward_status === 'rewarded' ? 'Voucher Sent' : 'Needs Verification'}
                  </Badge>
                </CardHeader>

                <CardContent className="p-3.5 space-y-2 text-xs flex-1">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Proof Platform:</span>
                    <span className="font-semibold text-foreground flex items-center gap-1">
                      {bounty.platform === 'google_review' ? 'Google 5-Star Review' : 'Instagram Story Tag'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Reward Credit:</span>
                    <span className="font-mono font-bold text-emerald-600">
                      {currencyFormat(bounty.reward_amount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-muted-foreground">
                    <span>Submission Date:</span>
                    <span className="font-mono">{bounty.created_at}</span>
                  </div>
                </CardContent>

                <CardFooter className="p-3 pt-2 border-t mt-auto flex items-center justify-between gap-2">
                  {bounty.reward_status === 'pending_verification' ? (
                    <Button
                      size="sm"
                      onClick={() => handleApproveBounty(bounty.id)}
                      className="text-xs h-8 w-full gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    >
                      <Gift className="w-3.5 h-3.5" />
                      Approve & Credit Rs. 500
                    </Button>
                  ) : (
                    <div className="text-xs h-8 w-full border rounded flex items-center justify-center gap-1 text-emerald-600 font-semibold bg-emerald-50/50 dark:bg-emerald-950/20">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Credited to Client
                    </div>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Broadcast Campaign Creation Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create SMS / WhatsApp Campaign</DialogTitle>
            <DialogDescription className="text-xs">
              Configure targeted promotion, promo code, and auto-populated message text.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateCampaign} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Campaign Title *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Weekend Beard Grooming Revival"
                required
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Target Audience</Label>
                <Select value={targetAudience} onValueChange={(v) => setTargetAudience(v as any)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Clients ({audienceSegments.all})</SelectItem>
                    <SelectItem value="inactive_30d">Inactive &gt; 30 Days ({audienceSegments.inactive_30d})</SelectItem>
                    <SelectItem value="inactive_60d">Inactive &gt; 60 Days ({audienceSegments.inactive_60d})</SelectItem>
                    <SelectItem value="frequent_clients">Frequent Patrons ({audienceSegments.frequent_clients})</SelectItem>
                    <SelectItem value="top_spenders">Top Spenders ({audienceSegments.top_spenders})</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Promo Code</Label>
                <Input
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  placeholder="e.g. WEEKEND20"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">WhatsApp / SMS Message Template *</Label>
              <Textarea
                value={messageTemplate}
                onChange={(e) => setMessageTemplate(e.target.value)}
                placeholder="Salam [Name]! We haven't seen you at TGS recently..."
                rows={4}
                required
                className="text-xs font-mono"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsModalOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs font-bold">
                Save Campaign
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Influencer Collab Modal */}
      <Dialog open={isInfluencerModalOpen} onOpenChange={setIsInfluencerModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Influencer Barter Collaboration</DialogTitle>
            <DialogDescription className="text-xs">
              Track creator deliverables, barter service value, and tracking promo code.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddInfluencer} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Influencer Full Name *</Label>
              <Input
                value={newInfName}
                onChange={(e) => setNewInfName(e.target.value)}
                placeholder="e.g. Shahzaib Khan"
                required
                className="h-8 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Social Handle *</Label>
                <Input
                  value={newInfHandle}
                  onChange={(e) => setNewInfHandle(e.target.value)}
                  placeholder="@handle"
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Platform</Label>
                <Select value={newInfPlatform} onValueChange={(v) => setNewInfPlatform(v as any)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs font-semibold">Followers Count</Label>
                <Input
                  type="number"
                  value={newInfFollowers}
                  onChange={(e) => setNewInfFollowers(Number(e.target.value) || 0)}
                  placeholder="50000"
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-semibold">Promo Code</Label>
                <Input
                  value={newInfPromoCode}
                  onChange={(e) => setNewInfPromoCode(e.target.value)}
                  placeholder="e.g. SHAHZAIB15"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Services Given in Barter</Label>
              <Input
                value={newInfBarterServices}
                onChange={(e) => setNewInfBarterServices(e.target.value)}
                placeholder="Full Grooming + Charcoal Detan Facial"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Deliverables Expected</Label>
              <Input
                value={newInfDeliverables}
                onChange={(e) => setNewInfDeliverables(e.target.value)}
                placeholder="1 Reel + 3 Stories with @tgs.pk tag"
                className="h-8 text-xs"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsInfluencerModalOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs font-bold">
                Save Collaboration
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Log Review Entry Modal */}
      <Dialog open={isBountyModalOpen} onOpenChange={setIsBountyModalOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] md:max-w-md">
          <DialogHeader>
            <DialogTitle>Log UGC Review Entry</DialogTitle>
            <DialogDescription className="text-xs">
              Record a client's 5-Star review or story tag to grant them a Rs. 500 salon credit.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddBounty} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Client Name *</Label>
              <Input
                value={newBountyClientName}
                onChange={(e) => setNewBountyClientName(e.target.value)}
                placeholder="Client Name"
                required
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Phone Number</Label>
              <Input
                value={newBountyPhone}
                onChange={(e) => setNewBountyPhone(e.target.value)}
                placeholder="+92 300 1234567"
                className="h-8 text-xs"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-semibold">Review Platform</Label>
              <Select value={newBountyPlatform} onValueChange={(v) => setNewBountyPlatform(v as any)}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="google_review">Google Maps 5-Star Review</SelectItem>
                  <SelectItem value="instagram_story">Instagram Story Tag (@tgs.pk)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsBountyModalOpen(false)} className="h-8 text-xs">
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-xs font-bold">
                Submit Entry
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
