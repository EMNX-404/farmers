import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, HelpCircle, ChevronDown, Sparkles } from 'lucide-react';
import {
  FadeIn,
  SlideUp,
  ScaleOnHover,
  CountUp,
  FlowingMenu,
} from '../../Animation';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [openFaq, setOpenFaq] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const faqs = [
    {
      q: 'How does payment work if there is no credit card checkout on the website?',
      a: 'MarketLink is designed specifically for direct-to-farm community commerce. You reserve your produce online so your farmer packs and holds it for you. You pay in person directly at the stall upon pickup using cash, card, Venmo/Apple Pay, or market tokens. This eliminates 15-30% middleman fees!',
    },
    {
      q: 'What time can I pick up my pre-ordered harvest items?',
      a: 'When checking out, you choose a designated morning pickup window (e.g. 9:00 AM - 10:30 AM). Your farmer sets aside labeled crates or bags ready for quick collection.',
    },
    {
      q: 'I am a local farmer or artisan. How can I list my stall on MarketLink?',
      a: 'We welcome local growers! Register an account and choose "Farmer / Stall Owner". Provide your stall name, operating markets, and weekly schedule. Our market coordinators will review and approve your account within 24-48 hours.',
    },
    {
      q: 'Can I cancel or modify my pre-order if my weekend plans change?',
      a: 'Yes, orders can be modified or cancelled through your Customer Portal prior to the farmer\'s preparation cutoff (typically 24 hours before market opening).',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '5rem' }}>
      {/* 1. Hero Header */}
      <section
        style={{
          background: 'linear-gradient(180deg, rgba(236,243,158,0.25) 0%, rgba(250,249,246,1) 100%)',
          padding: '4.5rem 1.5rem 3.5rem',
          textAlign: 'center',
          position: 'relative',
        }}
      >
        <div className="container-narrow">
          <FadeIn delay={0.1}>
            <span className="badge badge-moss" style={{ marginBottom: '1rem', display: 'inline-block' }}>
              <Sparkles size={14} style={{ display: 'inline', marginRight: '6px' }} />
              Direct Support & Help
            </span>
            <h1 style={{ fontSize: 'clamp(2.4rem, 4vw, 3.5rem)', color: 'var(--color-forest)', marginBottom: '1rem', lineHeight: 1.15 }}>
              We're Here For Our Community
            </h1>
            <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 2rem' }}>
              Whether you are a customer with questions, a grower interested in joining, or a market manager, our local team is ready to assist.
            </p>
          </FadeIn>

          {/* Quick Metrics Bar */}
          <SlideUp delay={0.2}>
            <div
              style={{
                display: 'inline-flex',
                gap: '2.5rem',
                padding: '1.25rem 2rem',
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-md)',
                border: '1px solid var(--color-border)',
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-grass)' }}>
                  &lt; <CountUp target={2} suffix=" hrs" />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Avg. Response Time</div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-forest)' }}>
                  <CountUp target={100} suffix="%" />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>Community Driven</div>
              </div>
              <div>
                <div style={{ fontSize: '1.8rem', fontWeight: '800', color: 'var(--color-moss)' }}>
                  <CountUp target={24} suffix="/7" />
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: '600' }}>AI Assistant Available</div>
              </div>
            </div>
          </SlideUp>
        </div>
      </section>

      {/* 2. Contact Details & Form */}
      <section className="container-wide">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {/* Contact Details Card */}
          <SlideUp delay={0.1}>
            <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
                  Contact Information
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                  Our local coordinators are on-site Wednesday through Sunday during active market setup.
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <ScaleOnHover scale={1.02}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem', borderRadius: '12px', background: 'var(--color-leaf-soft)' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-grass)' }}>
                      <Mail size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Email Us</div>
                      <div style={{ fontWeight: '700', color: 'var(--color-forest)' }}>support@marketlink.local</div>
                    </div>
                  </div>
                </ScaleOnHover>

                <ScaleOnHover scale={1.02}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem', borderRadius: '12px', background: 'var(--color-moss-soft)' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-forest)' }}>
                      <Phone size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Market Day Dispatch</div>
                      <div style={{ fontWeight: '700', color: 'var(--color-forest)' }}>+1 (555) 019-FARM</div>
                    </div>
                  </div>
                </ScaleOnHover>

                <ScaleOnHover scale={1.02}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '0.75rem', borderRadius: '12px', background: 'var(--color-leaf-soft)' }}>
                    <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-grass)' }}>
                      <MapPin size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Regional Office</div>
                      <div style={{ fontWeight: '700', color: 'var(--color-forest)' }}>100 Market Center Way, Suite 400</div>
                    </div>
                  </div>
                </ScaleOnHover>
              </div>

              <div style={{ background: 'var(--color-grass-soft)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(64,105,28,0.15)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <MessageSquare size={18} color="var(--color-grass)" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ fontSize: '0.88rem', color: 'var(--color-forest)' }}>
                    <strong>Instant Help Available:</strong> Tap the floating sparkle button on the bottom-right to converse with our <strong>MarketLink AI Assistant</strong> for live vendor questions, stall coordinates, and harvest queries!
                  </div>
                </div>
              </div>
            </div>
          </SlideUp>

          {/* Form Card */}
          <SlideUp delay={0.2}>
            <div className="card" style={{ padding: '2.5rem' }}>
              {submitted ? (
                <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                  <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--color-leaf)', color: 'var(--color-forest)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', boxShadow: '0 8px 24px rgba(64,105,28,0.2)' }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <h3 style={{ fontSize: '1.6rem', color: 'var(--color-forest)', marginBottom: '0.75rem' }}>Message Dispatched!</h3>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
                    Thank you for reaching out. A local market coordinator will follow up with you directly at <strong>{formData.email}</strong>.
                  </p>
                  <button onClick={() => setSubmitted(false)} className="btn btn-outline">
                    Send Another Note
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <h3 style={{ fontSize: '1.4rem', color: 'var(--color-forest)', marginBottom: '0.5rem' }}>
                    Send Us a Message
                  </h3>

                  <div>
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Elena Rostova"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="elena@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Inquiry Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Farmer Stall Application, Market Question..."
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="form-input"
                    />
                  </div>

                  <div>
                    <label className="form-label">Message Details</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="How can our community team help you?"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="form-input"
                      style={{ resize: 'vertical' }}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      marginTop: '0.5rem',
                      padding: '0.85rem',
                    }}
                  >
                    <Send size={16} /> Send Community Inquiry
                  </button>
                </form>
              )}
            </div>
          </SlideUp>
        </div>
      </section>

      {/* 3. Interactive Accordion FAQ Section */}
      <section className="container-narrow">
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <span className="badge badge-grass" style={{ marginBottom: '0.5rem' }}>
            Frequently Asked Questions
          </span>
          <h2 style={{ fontSize: '2.2rem', color: 'var(--color-forest)' }}>
            Got Questions? We Have Answers.
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="card"
                style={{
                  padding: '1.5rem',
                  cursor: 'pointer',
                  border: isOpen ? '1px solid var(--color-grass)' : '1px solid var(--color-border)',
                  transition: 'all 0.25s ease',
                }}
                onClick={() => setOpenFaq(isOpen ? null : idx)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '1.08rem', color: isOpen ? 'var(--color-grass)' : 'var(--color-forest)' }}>
                    {faq.q}
                  </h4>
                  <ChevronDown
                    size={20}
                    color="var(--color-forest)"
                    style={{
                      transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      flexShrink: 0,
                    }}
                  />
                </div>
                {isOpen && (
                  <p style={{ margin: '1rem 0 0 0', color: 'var(--text-secondary)', lineHeight: 1.6, animation: 'fadeIn 0.3s ease' }}>
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
