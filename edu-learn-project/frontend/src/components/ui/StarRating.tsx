interface StarRatingProps {
  rating: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  reviews?: number;
}

export default function StarRating({ rating, max = 5, size = 'sm', showValue = true, reviews }: StarRatingProps) {
  const sizes = { sm: 'w-3.5 h-3.5', md: 'w-4 h-4', lg: 'w-5 h-5' };
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: max }).map((_, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;
          return (
            <svg key={i} className={`${sizes[size]} ${filled || partial ? 'text-yellow-400' : 'text-gray-200'}`}
              fill={filled ? 'currentColor' : partial ? 'url(#half)' : 'none'}
              viewBox="0 0 24 24" stroke="currentColor" strokeWidth={filled || partial ? 0 : 1.5}>
              <defs>
                <linearGradient id="half">
                  <stop offset="50%" stopColor="currentColor" />
                  <stop offset="50%" stopColor="transparent" />
                </linearGradient>
              </defs>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          );
        })}
      </div>
      {showValue && <span className={`font-semibold text-yellow-500 ${textSizes[size]}`}>{rating.toFixed(1)}</span>}
      {reviews !== undefined && <span className={`text-gray-400 ${textSizes[size]}`}>({reviews.toLocaleString()})</span>}
    </div>
  );
}
