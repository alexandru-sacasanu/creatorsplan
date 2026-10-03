import { forwardRef } from 'react';

// The landing hero's background: the zeus video under three paper layers.
//   1. a 42% paper-white wash over the whole frame,
//   2. a lighter patch behind the headline so the type reads on any frame,
//   3. a fade to the page color at the bottom, so the hero melts into the page.
// The video never loops: after one play it holds its last frame. Playback is
// driven from Landing.jsx (start after the loader, pause off-screen).

const PAPER = '251, 250, 247'; // --cp-paper (#fbfaf7) as an rgb triple for the gradients

const HeroBackdrop = forwardRef(function HeroBackdrop(props, ref) {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <video
        ref={ref}
        className="absolute inset-0 h-full w-full object-cover"
        poster="/media/zeus-hero-poster.jpg"
        muted
        playsInline
        preload="auto"
        disablePictureInPicture
        tabIndex={-1}
        {...props}
      >
        <source src="/media/zeus-hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0" style={{ background: `rgba(${PAPER}, 0.42)` }} />
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse 50% 42% at 50% 50%, rgba(${PAPER}, 0.62), rgba(${PAPER}, 0.3) 55%, rgba(${PAPER}, 0) 80%)` }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-[38%]"
        style={{ background: `linear-gradient(to bottom, rgba(${PAPER}, 0), rgb(${PAPER}))` }}
      />
    </div>
  );
});

export default HeroBackdrop;
