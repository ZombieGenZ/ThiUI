import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, PenSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, type Database } from '../lib/supabase';
import { Breadcrumb } from '../components/Breadcrumb';
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
    console.error('Unable to format date:', error);
    return isoString;
  }
};

export function BlogPage() {
  usePageMetadata({
    title: 'Blog & News',
    description:
      'Discover interior design trends, styling tips, and the latest updates from ZShop in our editorial hub.',
  });

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPosts = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false, nullsFirst: false })
        .order('created_at', { ascending: false, nullsFirst: false });

      if (!isMounted) return;

      if (error) {
        console.error('Error fetching blog posts:', error);

        if (error.message?.includes("Could not find the table 'public.blog_posts'")) {
          setErrorMessage(null);
          setPosts(
            [...blogPostsFallback].sort((a, b) =>
              new Date(b.published_at || b.created_at).getTime() -
              new Date(a.published_at || a.created_at).getTime(),
            ),
          );
        } else {
          setErrorMessage("We couldn't load the blog posts. Please try again later.");
          setPosts([]);
        }
      } else {
        setErrorMessage(null);
        setPosts(data ?? []);
      }

      setIsLoading(false);
    };

    fetchPosts();

    return () => {
      isMounted = false;
    };
  }, []);

  const [featuredPost, ...otherPosts] = posts;

  const heroDescription = useMemo(() => {
    if (featuredPost?.excerpt?.trim()) {
      return featuredPost.excerpt;
    }

    if (featuredPost?.content) {
      return `${featuredPost.content.slice(0, 160)}...`;
    }

    return 'Stay up to date with stories, trends, and inspiration to elevate your home.';
  }, [featuredPost?.content, featuredPost?.excerpt]);

  return (
    <div className="min-h-screen bg-white">
      <div className="relative h-[340px] bg-[url('https://images.pexels.com/photos/8136914/pexels-photo-8136914.jpeg?auto=compress&cs=tinysrgb&w=1600')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900/90 via-neutral-900/70 to-neutral-900/50" />
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Blog & News' }]} />
            <div className="mt-6 max-w-2xl">
              <span className="inline-flex items-center gap-2 text-sm font-medium text-amber-300 uppercase tracking-wide">
                <PenSquare className="w-4 h-4" />
                ZShop Insights
              </span>
              <h1 className="mt-4 font-display text-4xl sm:text-5xl text-white leading-tight">
                Interior inspiration & brand stories
              </h1>
              <p className="mt-4 text-lg text-white/80 leading-relaxed">{heroDescription}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isLoading ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" data-testid="blog-skeletons">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse bg-neutral-100 rounded-3xl h-[420px] border border-neutral-200"
              />
            ))}
          </div>
        ) : errorMessage ? (
          <div className="bg-red-50 border border-red-200 rounded-3xl p-10 text-center">
            <h2 className="font-semibold text-red-600 text-lg">Something went wrong</h2>
            <p className="mt-2 text-red-500 text-sm">{errorMessage}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-3xl p-12 text-center">
            <h2 className="font-display text-2xl text-neutral-900 mb-2">No posts yet</h2>
            <p className="text-neutral-600">
              We are curating standout stories for you. Please check back soon!
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {featuredPost && (
              <Link
                to={`/blog/${featuredPost.slug}`}
                className="grid lg:grid-cols-[1.2fr_1fr] gap-8 rounded-3xl overflow-hidden shadow-lg border border-neutral-200 group"
              >
                <div className="relative min-h-[320px]">
                  <img
                    src={
                      featuredPost.featured_image_url ||
                      'https://images.pexels.com/photos/8136913/pexels-photo-8136913.jpeg?auto=compress&cs=tinysrgb&w=1600'
                    }
                    alt={featuredPost.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/80 via-neutral-900/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                    <div className="flex items-center gap-3 text-sm text-white/80 mb-3">
                      <CalendarDays className="w-4 h-4" />
                      <span>{formatPublishedDate(featuredPost.published_at || featuredPost.created_at)}</span>
                    </div>
                    <h2 className="font-display text-3xl leading-tight mb-4">{featuredPost.title}</h2>
                    <p className="text-white/85 text-base line-clamp-3">
                      {featuredPost.excerpt || featuredPost.content.slice(0, 200)}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-amber-300">
                      Read article
                      <svg
                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
                <div className="p-8 lg:p-10 bg-white flex flex-col justify-between">
                  <div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-semibold uppercase tracking-wide">
                      Featured
                    </span>
                    <h3 className="mt-4 font-display text-3xl text-neutral-900 leading-tight">
                      {featuredPost.title}
                    </h3>
                    <p className="mt-4 text-neutral-600 leading-relaxed whitespace-pre-line">
                      {featuredPost.content.slice(0, 300)}...
                    </p>
                  </div>
                  <div className="mt-8 flex items-center gap-3 text-sm text-neutral-500">
                    <CalendarDays className="w-4 h-4" />
                    <span>{formatPublishedDate(featuredPost.published_at || featuredPost.created_at)}</span>
                  </div>
                </div>
              </Link>
            )}

            {otherPosts.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-display text-2xl text-neutral-900">Latest Posts</h2>
                  <span className="text-sm text-neutral-500">{otherPosts.length} posts</span>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {otherPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      className="group bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img
                          src={
                            post.featured_image_url ||
                            'https://images.pexels.com/photos/276554/pexels-photo-276554.jpeg?auto=compress&cs=tinysrgb&w=1600'
                          }
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 text-xs text-neutral-500 uppercase tracking-wide mb-3">
                          <CalendarDays className="w-3.5 h-3.5" />
                          <span>{formatPublishedDate(post.published_at || post.created_at)}</span>
                        </div>
                        <h3 className="font-semibold text-lg text-neutral-900 leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors">
                          {post.title}
                        </h3>
                        <p className="mt-3 text-sm text-neutral-600 leading-relaxed line-clamp-3">
                          {post.excerpt || post.content.slice(0, 150)}
                        </p>
                        <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand-600">
                          Continue reading
                          <svg
                            className="w-4 h-4 transition-transform group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
