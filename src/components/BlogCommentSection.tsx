import { type ChangeEvent, type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, MessageCircle, Send, UserCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase, type Database } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface BlogCommentSectionProps {
  postId: string;
}

type BlogComment = Database['public']['Tables']['comments']['Row'];

interface CommentFormState {
  name: string;
  email: string;
  content: string;
}

const formatCommentDate = (isoString: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(isoString));
  } catch (error) {
    console.error('Unable to format comment date:', error);
    return isoString;
  }
};

export function BlogCommentSection({ postId }: BlogCommentSectionProps) {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formState, setFormState] = useState<CommentFormState>({
    name: '',
    email: '',
    content: '',
  });
  const { user } = useAuth();

  const isAuthenticated = Boolean(user);
  const authenticatedEmail = user?.email ?? '';
  const authenticatedName = useMemo(() => {
    if (!user) {
      return '';
    }

    const rawName = typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name : '';
    if (rawName && rawName.trim().length > 0) {
      return rawName.trim();
    }

    if (user.email) {
      const [localPart] = user.email.split('@');
      if (localPart) {
        return localPart;
      }
    }

    return 'FurniCraft Member';
  }, [user]);

  useEffect(() => {
    setFormState((prev) => {
      if (isAuthenticated) {
        const nextState = {
          ...prev,
          name: authenticatedName || prev.name,
          email: authenticatedEmail || prev.email,
        };

        if (nextState.name === prev.name && nextState.email === prev.email) {
          return prev;
        }

        return nextState;
      }

      if (prev.name === '' && prev.email === '') {
        return prev;
      }

      return {
        ...prev,
        name: '',
        email: '',
      };
    });
  }, [authenticatedEmail, authenticatedName, isAuthenticated]);

  const loadComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .order('created_at', { ascending: true });

    if (error) {
      if (error.message?.includes("Could not find the table 'public.comments'")) {
        return [];
      }

      throw error;
    }

    return data ?? [];
  }, [postId]);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    loadComments()
      .then((data) => {
        if (isMounted) {
          setComments(data);
        }
      })
      .catch((error: unknown) => {
        console.error('Error loading comments:', error);
        if (isMounted) {
          toast.error("We couldn't load the comments. Please try again later.");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [loadComments]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedContent = formState.content.trim();

    let nameToSubmit = formState.name.trim();
    let emailToSubmit = formState.email.trim();

    if (!trimmedContent) {
      toast.warn('Please enter a comment before submitting.');
      return;
    }

    if (isAuthenticated) {
      nameToSubmit = (authenticatedName || '').trim() || 'FurniCraft Member';
      emailToSubmit = authenticatedEmail.trim();
    }

    if (!nameToSubmit || !emailToSubmit) {
      toast.warn('Please fill out all required fields before submitting your comment.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        name: nameToSubmit,
        email: emailToSubmit,
        content: trimmedContent,
      });

      if (error) {
        if (error.message?.includes("Could not find the table 'public.comments'")) {
          throw new Error('The comment feature is still being configured. Please try again later.');
        }

        throw error;
      }

      const updatedComments = await loadComments();
      setComments(updatedComments);
      setFormState((prev) => ({
        name: isAuthenticated ? prev.name : '',
        email: isAuthenticated ? prev.email : '',
        content: '',
      }));
      toast.success('Thank you! Your comment has been submitted successfully.');
    } catch (error) {
      console.error('Error submitting comment:', error);
      const message = error instanceof Error ? error.message : 'Unable to submit your comment. Please try again.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const commentCountLabel = useMemo(() => {
    if (isLoading) {
      return 'Loading comments...';
    }

    if (!comments.length) {
      return 'No comments yet';
    }

    return `${comments.length} comment${comments.length === 1 ? '' : 's'}`;
  }, [comments.length, isLoading]);

  return (
    <section className="mt-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-brand-100 rounded-full text-brand-600">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-neutral-900">Comments</h2>
          <p className="text-neutral-600 text-sm">{commentCountLabel}</p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-6 order-2 lg:order-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12 bg-white border border-neutral-200 rounded-2xl">
              <Loader2 className="w-6 h-6 text-brand-600 animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="py-12 px-6 bg-neutral-50 border border-dashed border-neutral-200 rounded-2xl text-center">
              <p className="text-neutral-600 text-sm">
                Be the first to share your thoughts on this article.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <article key={comment.id} className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500">
                      <UserCircle className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-neutral-900">{comment.name}</h3>
                        <span className="text-xs text-neutral-400">{formatCommentDate(comment.created_at)}</span>
                      </div>
                      <p className="mt-3 text-neutral-600 leading-relaxed whitespace-pre-line">{comment.content}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm order-1 lg:order-2">
          <h3 className="font-semibold text-lg text-neutral-900 mb-4">Leave a Comment</h3>
          <p className="text-sm text-neutral-500 mb-6">
            Your email address will not be published. Required fields are marked *.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {isAuthenticated ? (
              <div className="p-4 bg-brand-50 border border-brand-100 rounded-xl text-sm text-brand-700">
                <p>
                  You are commenting as <strong>{authenticatedName}</strong>
                  {authenticatedEmail ? ` (${authenticatedEmail})` : ''}.
                </p>
              </div>
            ) : (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                    Your Name *
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={formState.name}
                    onChange={handleChange}
                    type="text"
                    required
                    placeholder="Jane Doe"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-2">
                    Email *
                  </label>
                  <input
                    id="email"
                    name="email"
                    value={formState.email}
                    onChange={handleChange}
                    type="email"
                    required
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
                  />
                </div>
              </>
            )}

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-neutral-700 mb-2">
                Comment *
              </label>
              <textarea
                id="content"
                name="content"
                value={formState.content}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Share your thoughts about this article..."
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center gap-2 w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-3 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting comment...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Post Comment
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
