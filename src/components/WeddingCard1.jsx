import React, { useEffect, useRef, useState } from 'react'
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/all';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

ScrollTrigger.config({ ignoreMobileResize: true });


const isDesktop = () => window.innerWidth >= 900;
const invScale = () =>
  Math.min(
    1,
    (window.innerHeight - 40) / 500,
    isDesktop() ? (window.innerWidth - 48) / 832 : (window.innerWidth - 32) / 400
  );


const getScale = () =>
  typeof window === 'undefined'
    ? 1
    : Math.min(1, window.innerWidth / 440, window.innerHeight / 780);

const WeddingCard1 = () => {
  const leftFlower = useRef(null);
  const rightFlower = useRef(null);

  
  const container = useRef(null);
  const envelope = useRef(null);
  const flap = useRef(null);
  const card = useRef(null);
  const openedRef = useRef(false); 
  const [openEnvelope, setEnvelope] = useState(false);
  const [scale, setScale] = useState(getScale);

  useEffect(() => {
    const onResize = () => setScale(getScale());
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  
  const cardSection = useRef(null);
  const cardWrap = useRef(null);
  const leftDoor = useRef(null);
  const rightDoor = useRef(null);
  const leftInv = useRef(null);
  const rightInv = useRef(null);

  const handleOpen = () => {
    openedRef.current = true;
    setEnvelope(true);
  };

  useGSAP(() => {
    
    gsap.fromTo(leftFlower.current, { rotate: 0 }, { rotate: 20, duration: 2, yoyo: true, repeat: -1, ease: 'none' });
    gsap.fromTo(rightFlower.current, { rotate: 0 }, { rotate: -20, duration: 2, yoyo: true, repeat: -1, ease: 'none' });

    // ---------- SECTION 2: envelope rises -> (click) -> card slides out ----------
    let gate = 1; 
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: container.current,
        start: 'top top',
        end: '+=3000',
        pin: true,
        scrub: 2,
        onUpdate: (self) => {
          // Envelope not clicked yet? Don't let the user scroll past the gate.
          if (!openedRef.current && self.progress > gate) {
            self.scroll(self.start + gate * (self.end - self.start));
          }
        }
      }
    });

    // stage 1: envelope comes up from the bottom
    tl.to(envelope.current, {
      keyframes: [
        { y: '100%', opacity: 0 },
        { y: 0, opacity: 1 },
      ],
      duration: 1,
      ease: 'none'
    });
    tl.addLabel('gate');

    // stage 2: card slides up out of the envelope pocket
    tl.to(card.current, { y: -210, duration: 1, ease: 'none' }, 'gate');
    // half way up, bring card in front of the flap
    tl.set(card.current, { zIndex: 35 }, 'gate+=0.4');

    // stage 3: card comes toward the viewer
    tl.to(card.current, { y: -260, scale: 1.2, duration: 1, ease: 'none' });

    // stage 4: whole envelope scene fades (handoff to section 3)
    tl.to(envelope.current, { opacity: 0, duration: 0.6, ease: 'none' });

    gate = tl.labels.gate / tl.duration();

    // ---------- SECTION 3: card doors open, invitation comes out ----------
    gsap.set([leftDoor.current, rightDoor.current], { transformPerspective: 1400 });

    const tl2 = gsap.timeline({
      scrollTrigger: {
        trigger: cardSection.current,
        start: 'top top',
        end: '+=2800',
        pin: true,
        scrub: 1.5,
        invalidateOnRefresh: true // re-calculate function values on resize / rotate
      }
    });

    // card appears (same look as the one that came out of the envelope)
    tl2.fromTo(cardWrap.current,
      { opacity: 0, scale: 0.85 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'none' });

    // doors swing open from the centre seam
    tl2.addLabel('open');
    tl2.to(leftDoor.current, { rotateY: 100, duration: 1, ease: 'power1.inOut' }, 'open');
    tl2.to(rightDoor.current, { rotateY: -100, duration: 1, ease: 'power1.inOut' }, 'open');

    tl2.addLabel('out', '>-0.4');

    // --- invitation cards (real size 400 x 500) ---
    // they start small INSIDE the card (side by side), then grow out to full size
    const startScale = () => (cardWrap.current.offsetWidth * 0.46) / 400;
    const startX = () => cardWrap.current.offsetWidth * 0.23;
    const endX = () => (isDesktop() ? 200 * invScale() + 12 : 0);

    tl2.set(leftInv.current, { zIndex: 32 }, 'out');
    tl2.set(rightInv.current, { zIndex: 31 }, 'out');

    // stage A: cards come out and grow to full size
    tl2.fromTo(leftInv.current,
      { x: () => -startX(), y: 0, scale: startScale },
      { x: () => -endX(), y: 0, scale: invScale, duration: 1.4, ease: 'power1.out' }, 'out');
    tl2.fromTo(rightInv.current,
      { x: startX, y: 0, scale: startScale },
      { x: endX, y: 0, scale: invScale, duration: 1.4, ease: 'power1.out' }, 'out');

    // stage B: on mobile the left card moves away so the right card is visible
    // (on desktop both cards are already visible, so nothing moves)
    tl2.to(leftInv.current, {
      y: () => (isDesktop() ? 0 : -window.innerHeight),
      duration: 0.8,
      ease: 'power1.inOut'
    });
  }, []);

  // one half of the card cover = the same card.png, cropped with background-size 200%
  const doorStyle = (side) => ({
    backgroundImage: 'url(/images/card.png)',
    backgroundSize: '200% 100%',
    backgroundPosition: side === 'left' ? '0% 0%' : '100% 0%',
    transformOrigin: side === 'left' ? 'left center' : 'right center'
  });

  return (
    <div className='min-h-screen overflow-hidden'>
      {/* ================= SECTION 1 ================= */}
      <section className='relative h-screen z-10 flex justify-center items-center px-4'>
        <div className='absolute left-2 sm:left-[20px] md:left-[30px] lg:left-[50px] w-[90px] sm:w-[150px] md:w-[200px] lg:w-[300px] top-2 sm:top-4 h-[90px] sm:h-[150px] md:h-[200px] lg:h-[300px] rotate-[25deg]'>
          <img src="/images/gg.png" className='w-full h-full object-contain' alt="" />
        </div>
        <div className='absolute right-2 sm:right-[20px] md:right-[30px] lg:right-[50px] w-[90px] sm:w-[150px] md:w-[200px] lg:w-[300px] top-2 sm:top-4 h-[90px] sm:h-[150px] md:h-[200px] lg:h-[300px] rotate-[25deg]'>
          <img src="/images/gg.png" className='w-full h-full object-contain' alt="" />
        </div>
        <div ref={leftFlower} className='absolute left-2 sm:left-[30px] h-[200px] w-[110px] sm:h-[350px] sm:w-[200px] lg:h-[500px] bottom-0 pointer-events-none opacity-80 sm:opacity-100'>
          <img src="/images/flowers.png" className='w-full h-full object-contain' alt="" />
        </div>
        <div ref={rightFlower} className='absolute right-2 sm:right-[30px] h-[200px] w-[110px] sm:h-[350px] sm:w-[200px] lg:h-[500px] bottom-0 pointer-events-none opacity-80 sm:opacity-100'>
          <img src="/images/flowers.png" className='w-full h-full object-contain' alt="" />
        </div>
        <div className='w-full max-w-xl px-4 z-20 text-center'>
          <p className="font-serif italic text-amber-800 text-xs sm:text-sm tracking-widest">
            We Request The Honor Of Your Presence
          </p>
          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-rose-950 my-2">
            Ayesha Manzoor & Adnan Ramzan
          </h1>
          <div className="mt-8 sm:mt-12 flex flex-col items-center animate-bounce">
            <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-slate-600 font-sans">
              Scroll Down To Unfold
            </span>
            <span className="text-lg sm:text-xl text-rose-900 mt-1">↓</span>
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: ENVELOPE ================= */}
      <section ref={container} className='relative h-screen z-10 perspective-[1000px]'>
        {/* outer wrapper = static CSS scale (responsive), inner = GSAP animated */}
        <div
          className='absolute left-1/2 bottom-0 w-[400px] h-[750px]'
          style={{ transform: `translateX(-50%) scale(${scale})`, transformOrigin: 'bottom center' }}
        >
        <div ref={envelope} className='absolute inset-0 translate-y-[100%] opacity-0 flex flex-col [perspective:1000px]'>

          {openEnvelope ? (
            <div className="absolute left-[50%] translate-x-[-50%] top-[80%] translate-y-[-80%] flex flex-col items-center animate-bounce z-40 pointer-events-none">
              <span className="text-[10px] sm:text-xs uppercase tracking-[0.3em] text-[#CFCECA] font-sans">
                Scroll Down To Unfold
              </span>
              <span className="text-lg sm:text-xl text-[#CFCECA] mt-1">↓</span>
            </div>
          ) : (
            <h1 className='absolute left-[50%] translate-x-[-50%] top-[42%] translate-y-[-50%] z-40 text-white pointer-events-none font-serif text-sm tracking-wider'>
              Click To See Details
            </h1>
          )}

          <div className='relative w-full h-full'>
            <button
              ref={flap}
              onClick={handleOpen}
              style={{
                transformOrigin: 'top center',
                transform: openEnvelope ? 'rotateX(-180deg)' : 'rotateX(0deg)'
              }}
              className="absolute top-[250px] left-0 w-full h-[250px] z-30 transition-transform duration-[1200ms] ease-in-out [transform-style:preserve-3d] focus:outline-none"
            >
              <img
                src={openEnvelope ? "/images/flap3.png" : "/images/flap1.png"}
                className='w-[101%] h-full object-fill -ml-[0.5%]'
                alt="Envelope Flap"
              />
            </button>

            {/* CARD: sits inside the envelope, between the back (z-10) and the front pocket (z-20) */}
            <div
              ref={card}
              className='absolute left-[30px] top-[330px] w-[340px] z-10 pointer-events-none'
            >
              <img
                src='/images/card.png'
                className='w-full h-auto rounded-md shadow-2xl'
                alt="Wedding Card"
              />
            </div>

            <div className='absolute bottom-0 w-full h-[500px] flex justify-center items-center z-20 pointer-events-none'>
              <img src='/images/envelope3.png' className='w-full h-full object-fill' alt="Envelope Base" />
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* ================= SECTION 3 (NEW): CARD OPENS ================= */}
      <section
        ref={cardSection}
        className='relative h-screen z-10 flex justify-center items-center bg-gradient-to-b from-rose-950 via-[#3a0a12] to-black'
      >
        <div
          ref={cardWrap}
          className='relative w-[min(86vw,400px,62vh)] aspect-[5/6] opacity-0'
        >
          {/* inside lining (visible once the doors open) */}
          <div className='absolute inset-0 rounded-md bg-gradient-to-br from-[#5a0f1c] to-[#2b0509] border border-amber-500/40 shadow-2xl' />

          {/* ============ LEFT INVITATION CARD ============ */}
          <div
            ref={leftInv}
            className='absolute left-1/2 top-1/2 -ml-[200px] -mt-[250px] w-[400px] h-[600px] z-10 rounded-xl overflow-hidden bg-[#fbf4e6] border-2 border-amber-600/60 shadow-xl'
          >
            {/* TODO: LEFT CARD IMAGE (400 x 500px) -> apni image yahan lagao (public/images/invite-left.png) */}
            <img
              src='/images/invetation.jpeg'
              className='w-full h-full  object-top'
              alt='Left invitation'
            />
            {/* Agar image ke upar text chahiye to yahan absolute div bana lo */}
          </div>

          {/* ============ RIGHT INVITATION CARD ============ */}
          <div
            ref={rightInv}
            className='absolute left-1/2 top-1/2 -ml-[200px] -mt-[250px] w-[400px] h-[600px] z-10 rounded-xl overflow-hidden bg-[#fbf4e6] border-2 border-amber-600/60 shadow-xl'
          >
            {/* TODO: RIGHT CARD IMAGE (400 x 500px) -> apni image yahan lagao (public/images/invite-right.png) */}
            <img
              src='/images/invetation.jpeg'
              className='w-full h-full object-cover'
              alt='Right invitation'
            />
            {/* Agar image ke upar text chahiye to yahan absolute div bana lo */}
          </div>

          {/* left + right doors (same image, cropped in half) */}
          <div
            ref={leftDoor}
            style={doorStyle('left')}
            className='absolute top-0 left-0 w-1/2 h-full z-20 rounded-l-md'
          />
          
          <div
            ref={rightDoor}
            style={doorStyle('right')}
            className='absolute top-0 right-0 w-1/2 h-full z-20 rounded-r-md'
          />
        </div>
      </section>
    </div>
  )
}

export default WeddingCard1