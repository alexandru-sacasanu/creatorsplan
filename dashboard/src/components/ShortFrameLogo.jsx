// "The Short Frame" — creatorsplan mark. A 9:16 rounded rectangle (the shape
// of a short) with a lightning bolt inside. See
// design_handoff_creatorsplan_rebrand/README.md > Logo.
//
// `variant` picks the fill/stroke per the background it sits on:
//   - "default" (on paper/canvas, the common case): volt fill, ink stroke.
//   - "on-ink": volt fill, no stroke (an ink stroke on an ink background
//     would be invisible anyway).
//   - "on-volt": no fill, ink stroke only (inverted).
export default function ShortFrameLogo({ variant = 'default', className = '', width = 15, height = 25 }) {
  const strokeWidth = variant === 'on-volt' ? 2.4 : 2;
  const fill = variant === 'on-volt' ? 'none' : '#FFCF1A';
  const stroke = variant === 'on-ink' ? 'none' : '#14120F';

  return (
    <svg
      viewBox="0 0 28 46"
      width={width}
      height={height}
      className={className}
      aria-hidden="true"
    >
      <rect x="1" y="1" width="26" height="44" rx="7" fill={fill} stroke={stroke} strokeWidth={strokeWidth} />
      <path d="M16.5 8 L7.5 24.5 H13.5 L11.5 38 L20.5 21 H14.5 Z" fill="#14120F" />
    </svg>
  );
}
