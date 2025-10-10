import { type ChangeEvent, type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Loader2, MessageCircle, Send, UserCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { supabase, type Database } from '../lib/supabase';

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
    return new Intl.DateTimeFormat('vi-VN', {
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

  const loadComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .order('created_at', { ascending: true });

    if (error) {
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
          toast.error('Không thể tải bình luận. Vui lòng thử lại sau.');
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

    if (!formState.name.trim() || !formState.email.trim() || !formState.content.trim()) {
      toast.warn('Vui lòng nhập đầy đủ thông tin trước khi gửi bình luận.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('comments').insert({
        post_id: postId,
        name: formState.name.trim(),
        email: formState.email.trim(),
        content: formState.content.trim(),
      });

      if (error) {
        throw error;
      }

      const updatedComments = await loadComments();
      setComments(updatedComments);
      setFormState({ name: '', email: '', content: '' });
      toast.success('Cảm ơn bạn! Bình luận đã được gửi thành công.');
    } catch (error) {
      console.error('Error submitting comment:', error);
      const message = error instanceof Error ? error.message : 'Không thể gửi bình luận. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const commentCountLabel = useMemo(() => {
    if (isLoading) {
      return 'Đang tải bình luận...';
    }

    if (!comments.length) {
      return 'Chưa có bình luận nào';
    }

    return `${comments.length} bình luận`;
  }, [comments.length, isLoading]);

  return (
    <section className="mt-16">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-brand-100 rounded-full text-brand-600">
          <MessageCircle className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-display text-2xl text-neutral-900">Bình luận</h2>
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
                Hãy là người đầu tiên để lại bình luận về bài viết này.
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
          <h3 className="font-semibold text-lg text-neutral-900 mb-4">Để lại bình luận của bạn</h3>
          <p className="text-sm text-neutral-500 mb-6">
            Email của bạn sẽ không được công bố. Các trường bắt buộc được đánh dấu *
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-2">
                Tên của bạn *
              </label>
              <input
                id="name"
                name="name"
                value={formState.name}
                onChange={handleChange}
                type="text"
                required
                placeholder="Nguyễn Văn A"
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
                placeholder="tenban@example.com"
                className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-neutral-700 mb-2">
                Nội dung bình luận *
              </label>
              <textarea
                id="content"
                name="content"
                value={formState.content}
                onChange={handleChange}
                required
                rows={5}
                placeholder="Chia sẻ suy nghĩ của bạn về bài viết..."
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
                  Đang gửi bình luận...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Gửi bình luận
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
