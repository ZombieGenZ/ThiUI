import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, Clock, Loader2, UserRound } from 'lucide-react';
import { supabase, type Database } from '../lib/supabase';
import { Breadcrumb } from '../components/Breadcrumb';
import { BlogCommentSection } from '../components/BlogCommentSection';
import { usePageMetadata } from '../hooks/usePageMetadata';
import { blogPostsFallback } from '../data/blogFallback';

type BlogPost = Database['public']['Tables']['blog_posts']['Row'];

const formatPublishedDate = (isoString: string) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(isoString));
  } catch (error) {
    console.error('Unable to format published date:', error);
    return isoString;
  }
};

const calculateReadingTime = (content?: string | null) => {
  if (!content) return null;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} minute${minutes === 1 ? '' : 's'} read`;
};

export function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  usePageMetadata({
    title: post?.title || 'Blog Post Details',
    description:
      post?.excerpt ||
      'Explore the latest interior trends, styling tips, and design stories curated by the ZShop team.',
  });

  useEffect(() => {
    let isMounted = true;

    const fetchPost = async () => {
      if (!slug) {
        setErrorMessage("We couldn't find the article you requested.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (!isMounted) return;

      if (error || !data) {
        console.error('Error fetching blog post:', error);

        if (error?.message?.includes("Could not find the table 'public.blog_posts'")) {
          const fallbackPost = blogPostsFallback.find((item) => item.slug === slug);

          if (fallbackPost) {
            setPost(fallbackPost);
            setErrorMessage(null);
          } else {
            setErrorMessage('The article may not exist or has been removed.');
            setPost(null);
          }
        } else {
          setErrorMessage('The article may not exist or has been removed.');
          setPost(null);
        }
      } else {
        setPost(data);
        setErrorMessage(null);
      }

      setIsLoading(false);
    };

    fetchPost();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const readingTime = useMemo(() => calculateReadingTime(post?.content), [post?.content]);

  const contentBlocks = useMemo(() => {
    if (!post?.content) return [];

    return post.content
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean);
  }, [post?.content]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
      </div>
    );
  }

  if (errorMessage || !post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-6">
        <div className="max-w-lg w-full bg-neutral-50 border border-neutral-200 rounded-3xl p-10 text-center">
          <h1 className="font-display text-3xl text-neutral-900 mb-4">Article Not Found</h1>
          <p className="text-neutral-600 mb-6">
            {errorMessage || 'The link may be incorrect or the article might have been deleted.'}
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[420px] bg-neutral-900">
        <img
          src={
            post.featured_image_url ||
            'https://images.pexels.com/photos/8136913/pexels-photo-8136913.jpeg?auto=compress&cs=tinysrgb&w=1600'
          }
          alt={post.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/70 to-neutral-900/30" />
        <div className="relative z-10 h-full flex items-end pb-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumb
              items={[
                { label: 'Home', href: '/' },
                { label: 'Blog & News', href: '/blog' },
                { label: post.title },
              ]}
            />

            <div className="mt-6">
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to all articles
              </Link>

              <h1 className="mt-6 font-display text-4xl sm:text-5xl text-white leading-tight">{post.title}</h1>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-white/80">
                <div className="inline-flex items-center gap-2">
                  <CalendarDays className="w-4 h-4" />
                  <span>{formatPublishedDate(post.published_at || post.created_at)}</span>
                </div>
                {readingTime && (
                  <div className="inline-flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{readingTime}</span>
                  </div>
                )}
                {post.author && (
                  <div className="inline-flex items-center gap-2">
                    <UserRound className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 pb-20">
        <article className="bg-white border border-neutral-200 rounded-3xl shadow-xl p-8 sm:p-12">
          <div className="space-y-6 text-lg text-neutral-700 leading-relaxed">
            {contentBlocks.map((block, index) => {
              if (block.startsWith('## ')) {
                return (
                  <h3 key={index} className="font-semibold text-2xl text-neutral-900">
                    {block.replace(/^##\s*/, '')}
                  </h3>
                );
              }

              if (block.startsWith('# ')) {
                return (
                  <h2 key={index} className="font-display text-3xl text-neutral-900">
                    {block.replace(/^#\s*/, '')}
                  </h2>
                );
              }

              if (block.split('\n').every((line) => line.trim().startsWith('- '))) {
                const items = block
                  .split('\n')
                  .map((line) => line.replace(/^[-\s]+/, '').trim())
                  .filter(Boolean);

                return (
                  <ul key={index} className="list-disc list-inside space-y-2 text-neutral-700">
                    {items.map((item, itemIndex) => (
                      <li key={itemIndex}>{item}</li>
                    ))}
                  </ul>
                );
              }

              return <p key={index}>{block}</p>;
            })}
          </div>
        </article>

        <BlogCommentSection postId={post.id} />
      </div>
    </div>
  );
}
