import React, { useState, useEffect, useRef } from 'react';

// ==========================================
// 1. FlexCarousel
// ==========================================
export function FlexCarousel({
  items = [],
  captions = true,
  cardHeight = 440,
  autoplay = false,
  interval = 4,
}) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!autoplay || items.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, interval * 1000);
    return () => clearInterval(timer);
  }, [autoplay, interval, items.length]);

  if (!items || items.length === 0) return null;

  return (
    <div style={{ width: '100%', height: `${cardHeight}px`, position: 'relative', overflow: 'hidden', borderRadius: '22px', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ display: 'flex', height: '100%', gap: '14px', padding: '8px' }}>
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={index}
              onClick={() => setActiveIndex(index)}
              style={{
                flex: isActive ? '3.8' : '1',
                height: '100%',
                borderRadius: '18px',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                transition: 'all 0.55s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isActive ? 'scale(1)' : 'scale(0.97)',
              }}
            >
              <img
                src={item.src || item.image}
                alt={item.alt || item.title || `slide-${index}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  filter: isActive ? 'none' : 'brightness(0.65) saturate(0.8)',
                  transition: 'all 0.5s ease',
                }}
              />
              {captions && (item.title || item.alt) && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: isActive ? '2rem 1.75rem' : '1rem 0.75rem',
                    background: 'linear-gradient(to top, rgba(27,46,22,0.92) 0%, rgba(27,46,22,0.6) 60%, transparent 100%)',
                    color: '#faf9f6',
                    opacity: isActive ? 1 : 0.85,
                    transition: 'all 0.3s ease',
                  }}
                >
                  <h4 style={{ fontSize: isActive ? '1.5rem' : '1rem', fontWeight: '800', margin: 0, color: '#faf9f6', letterSpacing: '-0.01em' }}>
                    {item.title || item.alt}
                  </h4>
                  {isActive && item.subtitle && (
                    <p style={{ margin: '6px 0 0 0', fontSize: '0.98rem', color: '#ecf39e', lineHeight: 1.4 }}>{item.subtitle}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 2. InfiniteSpiral / Marquee / Carousel
// ==========================================
export function InfiniteSpiral({ items = [], speed = 0.55 }) {
  if (!items || items.length === 0) return null;
  return (
    <div style={{ overflow: 'hidden', position: 'relative', width: '100%', padding: '18px 0' }}>
      <div
        style={{
          display: 'flex',
          gap: '20px',
          width: 'max-content',
          animation: `marquee ${Math.max(15, 30 / (speed || 0.5))}s linear infinite`,
        }}
      >
        {[...items, ...items].map((img, i) => (
          <div
            key={i}
            style={{
              width: '190px',
              height: '190px',
              borderRadius: '20px',
              overflow: 'hidden',
              flexShrink: 0,
              boxShadow: '0 8px 24px rgba(30, 38, 29, 0.12)',
              border: '2.5px solid rgba(236, 243, 158, 0.5)',
              transition: 'transform 0.3s ease',
            }}
          >
            <img
              src={img.src || img.image || img}
              alt={img.alt || `produce-${i}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 3. AccordionGallery
// ==========================================
export function AccordionGallery({ items = [], height = 480, defaultIndex = 0 }) {
  const [activeIndex, setActiveIndex] = useState(defaultIndex);

  if (!items || items.length === 0) return null;

  return (
    <div style={{ display: 'flex', gap: '14px', height: `${height}px`, width: '100%' }}>
      {items.map((item, index) => {
        const isSelected = activeIndex === index;
        return (
          <div
            key={index}
            onMouseEnter={() => setActiveIndex(index)}
            onClick={() => setActiveIndex(index)}
            style={{
              flex: isSelected ? 4.2 : 1,
              position: 'relative',
              borderRadius: '22px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'flex 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s ease',
              boxShadow: isSelected ? '0 12px 36px rgba(49, 87, 44, 0.22)' : '0 4px 14px rgba(30, 38, 29, 0.08)',
            }}
          >
            <img
              src={item.image || item.src}
              alt={item.label || item.title || `gallery-${index}`}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                filter: isSelected ? 'none' : 'brightness(0.65)',
                transition: 'filter 0.4s ease',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                padding: '2rem 1.75rem',
                background: 'linear-gradient(to top, rgba(27,46,22,0.92) 0%, rgba(27,46,22,0.4) 65%, transparent 100%)',
                color: '#faf9f6',
              }}
            >
              <h4 style={{ margin: 0, fontSize: isSelected ? '1.5rem' : '1.1rem', color: '#ecf39e', fontWeight: '800' }}>
                {item.label || item.title}
              </h4>
              {isSelected && item.description && (
                <p style={{ margin: '8px 0 0 0', fontSize: '1rem', color: '#faf9f6', lineHeight: 1.5 }}>{item.description}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// 4. Stack
// ==========================================
export function Stack({ cards = [], onCardClick }) {
  const [cardList, setCardList] = useState(cards);

  useEffect(() => {
    setCardList(cards);
  }, [cards]);

  const handleCycle = () => {
    if (cardList.length <= 1) return;
    setCardList((prev) => [...prev.slice(1), prev[0]]);
  };

  return (
    <div
      onClick={handleCycle}
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '380px',
        height: '380px',
        margin: '0 auto',
        cursor: 'pointer',
      }}
    >
      {cardList.slice(0, 4).map((card, idx) => {
        const rotation = (idx % 2 === 0 ? 1 : -1) * (idx * 3.5);
        const offsetY = idx * 10;
        const scale = 1 - idx * 0.04;
        const zIndex = 10 - idx;

        return (
          <div
            key={idx}
            style={{
              position: 'absolute',
              top: `${offsetY}px`,
              left: 0,
              right: 0,
              height: '330px',
              borderRadius: '22px',
              overflow: 'hidden',
              boxShadow: '0 12px 32px rgba(30, 38, 29, 0.18)',
              transform: `rotate(${rotation}deg) scale(${scale})`,
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              zIndex,
              border: '2.5px solid rgba(250, 249, 246, 0.95)',
            }}
          >
            {React.isValidElement(card) ? card : (
              <img
                src={card}
                alt={`stack-${idx}`}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// 5. Masonry
// ==========================================
export function Masonry({ items = [], renderItem }) {
  if (!items || items.length === 0) return null;
  return (
    <div
      style={{
        columnCount: 3,
        columnGap: '1.5rem',
      }}
    >
      {items.map((item, index) => (
        <div
          key={item.id || index}
          style={{
            breakInside: 'avoid',
            marginBottom: '1.5rem',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-sm)',
            transition: 'transform 0.3s ease',
          }}
        >
          {renderItem ? renderItem(item, index) : (
            <div>
              <img
                src={item.img || item.image || item.src}
                alt={item.title || `masonry-${index}`}
                style={{ width: '100%', height: 'auto', display: 'block' }}
              />
              {item.title && (
                <div style={{ padding: '0.75rem', background: '#ffffff' }}>
                  <p style={{ fontWeight: '600', margin: 0 }}>{item.title}</p>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ==========================================
// 6. Stepper & Step
// ==========================================
export function Stepper({
  initialStep = 1,
  children,
  onStepChange,
  onFinalStepCompleted,
  backButtonText = 'Back',
  nextButtonText = 'Continue',
}) {
  const [currentStep, setCurrentStep] = useState(initialStep);
  const steps = React.Children.toArray(children);

  const handleNext = () => {
    if (currentStep < steps.length) {
      const next = currentStep + 1;
      setCurrentStep(next);
      if (onStepChange) onStepChange(next);
    } else {
      if (onFinalStepCompleted) onFinalStepCompleted();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      if (onStepChange) onStepChange(prev);
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Step Indicators */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        {steps.map((_, i) => {
          const stepNum = i + 1;
          const isDone = stepNum < currentStep;
          const isCurrent = stepNum === currentStep;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  backgroundColor: isDone ? 'var(--color-grass)' : isCurrent ? 'var(--color-leaf)' : '#e8e6df',
                  color: isDone ? '#faf9f6' : isCurrent ? 'var(--color-forest)' : '#7d8c7b',
                  border: isCurrent ? '2px solid var(--color-grass)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {isDone ? '✓' : stepNum}
              </div>
              {i < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: '2px',
                    margin: '0 8px',
                    backgroundColor: isDone ? 'var(--color-grass)' : '#e8e6df',
                    transition: 'all 0.3s ease',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step Content */}
      <div style={{ minHeight: '160px', animation: 'fadeIn 0.3s ease' }}>
        {steps[currentStep - 1]}
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button
          type="button"
          onClick={handleBack}
          disabled={currentStep === 1}
          className="btn btn-outline"
          style={{ visibility: currentStep === 1 ? 'hidden' : 'visible' }}
        >
          {backButtonText}
        </button>
        <button type="button" onClick={handleNext} className="btn btn-primary">
          {currentStep === steps.length ? 'Complete' : nextButtonText}
        </button>
      </div>
    </div>
  );
}

export function Step({ children }) {
  return <div>{children}</div>;
}

// ==========================================
// 7. BounceCards
// ==========================================
export function BounceCards({ images = [], containerWidth = 560, containerHeight = 260 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const defaultTransforms = [
    'rotate(-10deg) translate(-160px)',
    'rotate(-4deg) translate(-80px)',
    'rotate(0deg) translate(0)',
    'rotate(5deg) translate(80px)',
    'rotate(10deg) translate(160px)',
  ];

  return (
    <div
      style={{
        position: 'relative',
        width: `${containerWidth}px`,
        maxWidth: '100%',
        height: `${containerHeight}px`,
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {images.map((src, i) => {
        const isHovered = hoveredIdx === i;
        const transform = isHovered ? 'translateY(-24px) scale(1.25) rotate(0deg)' : defaultTransforms[i % defaultTransforms.length];
        return (
          <div
            key={i}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              position: 'absolute',
              width: '155px',
              height: '155px',
              borderRadius: '20px',
              overflow: 'hidden',
              boxShadow: isHovered ? '0 18px 40px rgba(49, 87, 44, 0.28)' : '0 10px 28px rgba(49, 87, 44, 0.16)',
              transform,
              transition: 'transform 0.45s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.4s ease',
              zIndex: isHovered ? 25 : i + 1,
              cursor: 'pointer',
              border: '3px solid #ffffff',
            }}
          >
            <img src={src} alt={`bounce-${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// 8. CircularGallery
// ==========================================
export function CircularGallery({ items = [], height = 480 }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!items.length) return;
    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % items.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [items.length]);

  if (!items.length) return null;

  return (
    <div style={{ height: `${height}px`, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: '360px', height: '360px', borderRadius: '50%', border: '2.5px dashed var(--color-moss)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {items.map((item, idx) => {
          const angle = (idx / items.length) * 2 * Math.PI - Math.PI / 2;
          const radius = 180;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isActive = active === idx;

          return (
            <div
              key={idx}
              onClick={() => setActive(idx)}
              style={{
                position: 'absolute',
                transform: `translate(${x}px, ${y}px)`,
                width: isActive ? '84px' : '64px',
                height: isActive ? '84px' : '64px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: isActive ? '3.5px solid var(--color-grass)' : '2.5px solid #faf9f6',
                boxShadow: isActive ? '0 0 20px rgba(64,105,28,0.5)' : 'var(--shadow-md)',
                transition: 'all 0.4s ease',
                cursor: 'pointer',
              }}
            >
              <img src={item.src || item.image || item} alt="gallery" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          );
        })}
        {/* Center item preview */}
        <div style={{ width: '150px', height: '150px', borderRadius: '50%', overflow: 'hidden', boxShadow: '0 12px 32px rgba(49,87,44,0.25)', border: '4px solid #ffffff' }}>
          <img src={items[active]?.src || items[active]?.image || items[active]} alt="center" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 9. FlipCard
// ==========================================
export function FlipCard({
  front,
  back,
  width = '100%',
  height = 380,
  radius = 22,
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      onClick={() => setFlipped(!flipped)}
      style={{
        perspective: '1200px',
        width,
        height: `${height}px`,
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          borderRadius: `${radius}px`,
        }}
      >
        {/* Front Face */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            borderRadius: `${radius}px`,
            overflow: 'hidden',
            boxShadow: 'var(--shadow-md)',
            border: '1px solid var(--color-border)',
            background: '#ffffff',
          }}
        >
          {front}
        </div>

        {/* Back Face */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            borderRadius: `${radius}px`,
            overflow: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'var(--color-forest)',
            color: '#faf9f6',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          {back}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 10. FlowingMenu
// ==========================================
export function FlowingMenu({ items = [], onSelect }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!items || items.length === 0) return null;

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>
      {items.map((item, idx) => {
        const isHovered = hoveredIdx === idx;
        return (
          <div
            key={idx}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={() => onSelect && onSelect(item)}
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              backgroundColor: isHovered ? 'var(--color-leaf-soft)' : 'transparent',
              transition: 'background-color 0.25s ease',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--color-moss)' }}>0{idx + 1}</span>
              <span style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)', fontWeight: '600', color: isHovered ? 'var(--color-grass)' : 'var(--text-primary)' }}>
                {item.text || item.title || item.name}
              </span>
            </div>
            {item.badge && (
              <span className="badge badge-grass">{item.badge}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ==========================================
// 11. CardSwap
// ==========================================
export function CardSwap({ children, delay = 4000 }) {
  const [activeIdx, setActiveIdx] = useState(0);
  const cards = React.Children.toArray(children);

  useEffect(() => {
    if (cards.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % cards.length);
    }, delay);
    return () => clearInterval(interval);
  }, [cards.length, delay]);

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '260px' }}>
      {cards.map((card, i) => (
        <div
          key={i}
          style={{
            position: i === activeIdx ? 'relative' : 'absolute',
            top: 0,
            left: 0,
            right: 0,
            opacity: i === activeIdx ? 1 : 0,
            transform: i === activeIdx ? 'translateY(0) scale(1)' : 'translateY(16px) scale(0.97)',
            transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
            pointerEvents: i === activeIdx ? 'auto' : 'none',
          }}
        >
          {card}
        </div>
      ))}
    </div>
  );
}

export function Card({ children, style = {} }) {
  return (
    <div className="card" style={{ padding: '1.75rem', ...style }}>
      {children}
    </div>
  );
}

// ==========================================
// Utility Micro-Animations
// ==========================================

// FadeIn
export function FadeIn({ children, delay = 0, style = {} }) {
  return (
    <div
      style={{
        animation: `fadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// SlideUp
export function SlideUp({ children, delay = 0, style = {} }) {
  return (
    <div
      style={{
        animation: `slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ScaleOnHover
export function ScaleOnHover({ children, scale = 1.03, style = {} }) {
  return (
    <div
      style={{
        transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        display: 'inline-block',
        width: '100%',
        ...style,
      }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = `scale(${scale})`)}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      {children}
    </div>
  );
}

// CountUp
export function CountUp({ target = 0, duration = 1200, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = parseFloat(target) || 0;
    if (end === 0) {
      setCount(0);
      return;
    }
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (end - start) * easeProgress);
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [target, duration]);

  return (
    <span>
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}
