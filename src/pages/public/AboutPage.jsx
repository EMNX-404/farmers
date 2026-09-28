import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ShieldCheck,
  Heart,
  Store,
  Users,
  MapPin,
  ArrowRight,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  Coins,
} from 'lucide-react';
import { ASSETS } from '../../utils/assets';
import {
  FadeIn,
  SlideUp,
  ScaleOnHover,
  CountUp,
  AccordionGallery,
  BounceCards,
  Stepper,
  Step,
  FlipCard,
} from '../../Animation';

export default function AboutPage() {
  const [activeStep, setActiveStep] = useState(1);

  const accordionGalleryItems = [
    {
      image: ASSETS.stalls[0],
      label: 'Downtown Central Market',
      description: 'Saturday dawn harvest crates packed by local growers for early weekend pickup.',
    },
    {
      image: ASSETS.stalls[1],
      label: 'Westside Organic Green',
      description: 'Midweek market buzzing with community members picking up reserved heirloom crops.',
    },
    {
      image: ASSETS.stalls[2],
      label: 'Sunrise Orchards Stall',
      description: 'Generational family orchard featuring dewy Honeycrisp apples and crisp pears.',
    },
    {
      image: ASSETS.stalls[3],
      label: 'Green Valley Organics',
      description: 'Vine-ripened tomatoes, crisp kale, and hand-cut aromatic cooking herbs.',
    },
  ];

  const bounceProduceImages = [
    ASSETS.produce[0],
    ASSETS.produce[1],
    ASSETS.produce[2],
    ASSETS.produce[3],
    ASSETS.produce[4],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '5rem' }}>
      {/* 1. HERO SECTION WITH PARALLAX GLOW */}
      <section
        style={{
          background: 'linear-gradient(180deg, rgba(236,243,158,0.25) 0%, rgba(250,249,246,1) 100%)',
          padding: '4.5rem 1.5rem 3.5rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div className="container-narrow">
          <FadeIn delay={0.1}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.4rem 1rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--color-leaf)',
                color: 'var(--color-forest)',
                fontSize: '0.85rem',
                fontWeight: '700',
                marginBottom: '1.25rem',
                border: '1px solid rgba(144,169,85,0.3)',
              }}
            >
              <Sparkles size={16} />
              <span>Our Story & Agricultural Mission</span>
            </div>
          </FadeIn>

          <SlideUp delay={0.2}>
            <h1
              className="display-title"
              style={{
                fontSize: 'clamp(2.4rem, 4.5vw, 3.6rem)',
                color: 'var(--color-forest)',
                marginBottom: '1.25rem',
                lineHeight: 1.15,
              }}
            >
              Connecting Small Family Farms with <span style={{ color: 'var(--color-grass)' }}>Community Tables</span>
            </h1>
          </SlideUp>

          <FadeIn delay={0.3}>
            <p
              style={{
                fontSize: '1.2rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                maxWidth: '720px',
                margin: '0 auto 2.5rem',
              }}
            >
              MarketLink was created to solve a real dilemma: popular farm produce sells out in minutes, yet small growers struggle with high middleman fees and delivery waste. We empower direct pre-orders for in-person market pickup with zero online card surcharges.
            </p>
          </FadeIn>

          {/* Key Community Metric Counters */}
          <SlideUp delay={0.4}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1.5rem',
                maxWidth: '850px',
                margin: '0 auto',
                padding: '1.75rem',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--color-border)',
              }}
            >
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-grass)' }}>
                  <CountUp target={100} suffix="%" />
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  Direct to Growers
                </div>
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-forest)' }}>
                  <CountUp target={28} suffix="+" />
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  Verified Family Farms
                </div>
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-moss)' }}>
                  <CountUp target={4200} prefix="" suffix="+" />
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  Harvest Pre-Orders
                </div>
              </div>
              <div>
                <div style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--color-forest)' }}>
                  <CountUp target={0} prefix="$" />
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: '600' }}>
                  Online Card Fees
                </div>
              </div>
            </div>
          </SlideUp>
        </div>
      </section>

      {/* 2. ACCORDION GALLERY: VIBRANT MARKET LOCATIONS */}
      <section className="container-wide">
        <div style={{ marginBottom: '1.75rem', textAlign: 'center' }}>
          <span className="badge badge-moss" style={{ marginBottom: '0.5rem' }}>
            Visual Showcase
          </span>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--color-forest)' }}>
            The Sights & Colors of MarketLink
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0.5rem auto 0' }}>
            Hover or tap on any market stall to explore weekend harvest atmospheres.
          </p>
        </div>
        <AccordionGallery items={accordionGalleryItems} height={460} defaultIndex={0} />
      </section>

      {/* 3. STEPPER: HOW MARKETLINK WORKS */}
      <section
        style={{
          backgroundColor: '#ffffff',
          padding: '4rem 1.5rem',
          borderTop: '1px solid var(--color-border)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div className="container-narrow">
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span className="badge badge-grass" style={{ marginBottom: '0.5rem' }}>
              Step-by-Step Experience
            </span>
            <h2 style={{ fontSize: '2.2rem', color: 'var(--color-forest)', margin: 0 }}>
              How Pre-Ordering Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '1.05rem' }}>
              Simple, transparent, and built entirely around community connection.
            </p>
          </div>

          <Stepper
            initialStep={1}
            onStepChange={(step) => setActiveStep(step)}
            backButtonText="Previous Phase"
            nextButtonText="Next Phase"
          >
            <Step>
              <div
                className="card"
                style={{
                  padding: '2.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '2rem',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-leaf-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-grass)', marginBottom: '1rem' }}>
                    <Calendar size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
                    1. Growers Post Harvest Stock
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Every Thursday, local farmers update their real-time weekly inventory with exact quantities freshly picked from the field or orchard. You know exactly what is ripe and available before visiting.
                  </p>
                </div>
                <div style={{ borderRadius: '14px', overflow: 'hidden', height: '200px' }}>
                  <img src={ASSETS.produce[0]} alt="Harvest stock" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            </Step>

            <Step>
              <div
                className="card"
                style={{
                  padding: '2.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '2rem',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-moss-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-forest)', marginBottom: '1rem' }}>
                    <Clock size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
                    2. Select Market & Pickup Slot
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Add heirloom tomatoes, artisan sourdough, and honey to your pre-order basket. Pick your favored market stall location and convenient morning pickup window.
                  </p>
                </div>
                <div style={{ borderRadius: '14px', overflow: 'hidden', height: '200px' }}>
                  <img src={ASSETS.produce[1]} alt="Market slot" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            </Step>

            <Step>
              <div
                className="card"
                style={{
                  padding: '2.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '2rem',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-leaf-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-grass)', marginBottom: '1rem' }}>
                    <Sprout size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
                    3. Farmer Packs Your Box
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Your items are set aside in custom produce bags or crates labeled with your order number. No worries about the stall selling out before you arrive!
                  </p>
                </div>
                <div style={{ borderRadius: '14px', overflow: 'hidden', height: '200px' }}>
                  <img src={ASSETS.stalls[2]} alt="Farmer packs order" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            </Step>

            <Step>
              <div
                className="card"
                style={{
                  padding: '2.5rem',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                  gap: '2rem',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-moss-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-forest)', marginBottom: '1rem' }}>
                    <Coins size={24} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
                    4. In-Person Stall Pickup & Payment
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    Head to the stall during your window, greet the farmer, check your ripe produce, and pay on the spot (cash, card, or market tokens). Zero third-party fees, 100% human connection!
                  </p>
                </div>
                <div style={{ borderRadius: '14px', overflow: 'hidden', height: '200px' }}>
                  <img src={ASSETS.stalls[1]} alt="In person pickup" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              </div>
            </Step>
          </Stepper>
        </div>
      </section>

      {/* 4. 3D FLIP CARDS: PLATFORM PHILOSOPHIES */}
      <section className="container-wide">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge badge-moss" style={{ marginBottom: '0.5rem' }}>
            Interactive Guarantees
          </span>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--color-forest)' }}>
            Why MarketLink is Different
          </h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '540px', margin: '0.5rem auto 0' }}>
            Click or tap each card to flip and uncover our operational standards.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Card 1 */}
          <FlipCard
            height={320}
            front={
              <div style={{ height: '100%', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-leaf-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-grass)', marginBottom: '1.25rem' }}>
                    <Coins size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
                    No Online Payment Processing Fees
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    Unlike delivery apps that charge 20-30% commissions, MarketLink is 100% free of checkout gateway fees.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-grass)', fontWeight: '700', fontSize: '0.9rem' }}>
                  <span>Click to flip card</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            }
            back={
              <div style={{ height: '100%', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--color-forest)', color: '#fff' }}>
                <h4 style={{ fontSize: '1.3rem', color: 'var(--color-leaf)', marginBottom: '0.75rem' }}>
                  Paid Directly At Pickup
                </h4>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.9 }}>
                  You pay your farmer directly at their stall via cash, mobile pay, or debit card. Every dollar goes directly toward supporting local Oregon agriculture and family soil stewards.
                </p>
              </div>
            }
          />

          {/* Card 2 */}
          <FlipCard
            height={320}
            front={
              <div style={{ height: '100%', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-moss-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-forest)', marginBottom: '1.25rem' }}>
                    <ShieldCheck size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
                    100% Verified Local Growers
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    Every farm profile is reviewed by market coordinators to ensure genuine local production.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-grass)', fontWeight: '700', fontSize: '0.9rem' }}>
                  <span>Click to flip card</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            }
            back={
              <div style={{ height: '100%', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--color-forest-surface)', color: '#fff' }}>
                <h4 style={{ fontSize: '1.3rem', color: 'var(--color-leaf)', marginBottom: '0.75rem' }}>
                  No Resellers Allowed
                </h4>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.9 }}>
                  We forbid third-party wholesalers and commercial resellers. You are meeting and supporting the actual people who sowed, tended, and harvested your food.
                </p>
              </div>
            }
          />

          {/* Card 3 */}
          <FlipCard
            height={320}
            front={
              <div style={{ height: '100%', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-leaf-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-grass)', marginBottom: '1.25rem' }}>
                    <Sprout size={26} />
                  </div>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
                    Peak Season Freshness
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.5 }}>
                    Produce that travels fewer than 50 miles tastes noticeably sweeter, crisper, and more nutrient-dense.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-grass)', fontWeight: '700', fontSize: '0.9rem' }}>
                  <span>Click to flip card</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            }
            back={
              <div style={{ height: '100%', padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--color-forest)', color: '#fff' }}>
                <h4 style={{ fontSize: '1.3rem', color: 'var(--color-leaf)', marginBottom: '0.75rem' }}>
                  Harvested Within 24-48 Hours
                </h4>
                <p style={{ fontSize: '0.95rem', lineHeight: 1.6, opacity: 0.9 }}>
                  Supermarket greens sit in cold storage and distribution warehouses for weeks. MarketLink pre-ordered greens are harvested specifically for your pickup window.
                </p>
              </div>
            }
          />
        </div>
      </section>

      {/* 5. BOUNCE CARDS HARVEST BANNER */}
      <section className="container-wide">
        <div
          className="card"
          style={{
            padding: '3rem 2rem',
            background: 'linear-gradient(135deg, rgba(236,243,158,0.3) 0%, rgba(250,249,246,1) 100%)',
            textAlign: 'center',
            overflow: 'hidden',
          }}
        >
          <span className="badge badge-grass" style={{ marginBottom: '1rem' }}>
            Fresh From the Field
          </span>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--color-forest)', marginBottom: '1.5rem' }}>
            Seasonal Variety at its Best
          </h2>
          <div style={{ margin: '2rem 0 2.5rem' }}>
            <BounceCards images={bounceProduceImages} containerWidth={560} containerHeight={260} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link to="/products" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Explore Produce Catalog <ArrowRight size={16} />
            </Link>
            <Link to="/markets" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              Find Local Markets
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
