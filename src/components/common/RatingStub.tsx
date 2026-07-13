import React from 'react';
import { Star } from 'lucide-react';

interface RatingStubProps {
  rating: string | number;
}

const RatingStub: React.FC<RatingStubProps> = ({ rating }) => {
  const numRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  const displayRating = numRating ? numRating.toFixed(1) : '7.5';

  return (
    <div className="rating-stub select-none">
      <Star size={12} className="fill-accent-gold text-accent-gold" />
      <span>{displayRating}</span>
    </div>
  );
};

export default RatingStub;
