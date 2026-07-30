/**
 * SVG leaf logo — lightweight, crisp at any size, and color-adaptable
 * (works on both cream and dark green backgrounds).
 */
const SIZES = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-20 h-20',
} as const;

export default function LeafLogo({
  size = 'md',
  className = '',
}: {
  size?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      role="img"
      aria-label="GreenLeaf"
      className={`${SIZES[size]} ${className} shrink-0 drop-shadow-sm`}
    >
      <defs>
        <linearGradient id="gl-leaf-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8FCB77" />
          <stop offset="100%" stopColor="#3A7D44" />
        </linearGradient>
      </defs>
      {/* leaf blade: pointed at tip, round at base */}
      <path
        d="M12 1.5c-4.6 5.2-7.2 9.4-7.2 13.1A7.2 7.2 0 0 0 12 22.5a7.2 7.2 0 0 0 7.2-7.9c0-3.7-2.6-7.9-7.2-13.1Z"
        fill="url(#gl-leaf-grad)"
      />
      {/* main vein + side veins */}
      <path
        d="M12 5.5v15M12 11.5 8.4 9M12 11.5 15.6 9M12 16 8.9 13.6M12 16l3.1-2.4"
        stroke="#ffffff"
        strokeOpacity="0.5"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
