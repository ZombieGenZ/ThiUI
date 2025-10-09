import { useState, useEffect } from 'react';
import { Star, ThumbsUp, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface Review {
  id: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  helpful_count: number;
  is_verified_purchase: boolean;
  user_id: string;
  profiles?: {
    full_name: string;
  };
}

interface ReviewSectionProps {
  productId: string;
  onReviewAdded?: () => void;
}

export function ReviewSection({ productId, onReviewAdded }: ReviewSectionProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 5,
    title: '',
    comment: '',
  });

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles (
            full_name
          )
        `)
        .eq('product_id', productId)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Please sign in to write a review');
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error('Please write a comment');
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        product_id: productId,
        user_id: user.id,
        rating: newReview.rating,
        title: newReview.title,
        comment: newReview.comment,
        status: 'pending',
      });

      if (error) throw error;

      toast.success('Review submitted! It will be visible after approval.');
      setNewReview({ rating: 5, title: '', comment: '' });
      setShowForm(false);
      if (onReviewAdded) onReviewAdded();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((r) => r.rating === rating).length,
    percentage: reviews.length > 0
      ? (reviews.filter((r) => r.rating === rating).length / reviews.length) * 100
      : 0,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="border-t border-neutral-200 pt-12">
        <h2 className="text-3xl font-display font-bold text-neutral-900 mb-8">Customer Reviews</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div className="text-center">
            <div className="text-5xl font-bold text-neutral-900 mb-2">
              {averageRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center space-x-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-6 h-6 ${
                    i < Math.floor(averageRating)
                      ? 'fill-accent-400 text-accent-400'
                      : 'text-neutral-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-sm text-neutral-600">{reviews.length} reviews</p>
          </div>

          <div className="lg:col-span-2 space-y-2">
            {ratingDistribution.map((dist) => (
              <div key={dist.rating} className="flex items-center space-x-3">
                <div className="flex items-center space-x-1 w-20">
                  <span className="text-sm font-medium text-neutral-700">{dist.rating}</span>
                  <Star className="w-4 h-4 fill-accent-400 text-accent-400" />
                </div>
                <div className="flex-1 bg-neutral-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-accent-400 h-full transition-all"
                    style={{ width: `${dist.percentage}%` }}
                  />
                </div>
                <span className="text-sm text-neutral-600 w-12 text-right">{dist.count}</span>
              </div>
            ))}
          </div>
        </div>

        {user && (
          <div className="mb-12">
            {showForm ? (
              <form onSubmit={handleSubmitReview} className="bg-neutral-50 rounded-xl p-6">
                <h3 className="font-semibold text-neutral-900 mb-4">Write a Review</h3>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Rating
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setNewReview({ ...newReview, rating })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            rating <= newReview.rating
                              ? 'fill-accent-400 text-accent-400'
                              : 'text-neutral-300 hover:text-accent-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={newReview.title}
                    onChange={(e) => setNewReview({ ...newReview, title: e.target.value })}
                    placeholder="Sum up your review"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                    placeholder="Share your thoughts about this product..."
                    rows={4}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-brand-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
                  >
                    {submitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-2 border border-neutral-300 text-neutral-700 rounded-lg font-semibold hover:bg-neutral-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center space-x-2 bg-brand-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-brand-700 transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Write a Review</span>
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-neutral-200 h-6 rounded w-1/4 mb-2" />
                <div className="bg-neutral-200 h-4 rounded w-full mb-2" />
                <div className="bg-neutral-200 h-4 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-900 mb-2">No reviews yet</h3>
            <p className="text-neutral-600">Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border-b border-neutral-200 pb-6 last:border-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="flex items-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-accent-400 text-accent-400'
                                : 'text-neutral-300'
                            }`}
                          />
                        ))}
                      </div>
                      {review.is_verified_purchase && (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    {review.title && (
                      <h4 className="font-semibold text-neutral-900 mb-1">{review.title}</h4>
                    )}
                    <p className="text-sm text-neutral-600">
                      By {review.profiles?.full_name || 'Anonymous'} on{' '}
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <p className="text-neutral-700 leading-relaxed mb-3">{review.comment}</p>
                <div className="flex items-center space-x-4 text-sm text-neutral-600">
                  <button className="flex items-center space-x-1 hover:text-brand-600 transition-colors">
                    <ThumbsUp className="w-4 h-4" />
                    <span>Helpful ({review.helpful_count})</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
