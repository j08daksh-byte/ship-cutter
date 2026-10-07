import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Clock, ArrowRight, Search, Tag, X, Download } from 'lucide-react';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedTag, setSelectedTag] = useState('All');
  const [activeArticle, setActiveArticle] = useState(null);

  useEffect(() => {
    async function loadBlogs() {
      try {
        const data = await api.getBlogPosts();
        setPosts(data);
      } catch (err) {
        console.error('Error fetching blogs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBlogs();
  }, []);

  if (loading) return <LoadingSpinner text="Retrieving engineering papers & logs..." />;

  const allTags = ['All', 'Robotics', 'AI Vision', 'Environment', 'Automation', 'Safety', 'Sustainability'];

  const filteredPosts = posts.filter((p) => {
    const matchesSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
      p.author?.toLowerCase().includes(search.toLowerCase());
    const matchesTag =
      selectedTag === 'All' || (p.tags && p.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 space-y-10">
      {/* Top Header */}
      <div>
        <span className="text-xs font-mono uppercase tracking-widest text-accent-cyan">Field Research & Insights</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white mt-2">Robotics & Decommissioning Logs</h1>
        <p className="text-sm text-text-secondary mt-3 max-w-3xl">
          Technical papers, kerf telemetry analyses, and circular metallurgy case studies from our autonomous ship robotics engineering group.
        </p>
      </div>

      {/* Search and Tag Filters */}
      <div className="card-surface p-4 border border-dark-border bg-dark-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search papers by keyword, topic, or author..."
            className="w-full bg-neutral-900 border border-dark-border rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Tag className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1 rounded-lg text-xs font-mono whitespace-nowrap transition-colors ${
                selectedTag === tag
                  ? 'bg-neutral-800 text-white border border-neutral-600 font-semibold'
                  : 'text-neutral-400 hover:text-white hover:bg-neutral-900 border border-transparent'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <article
            key={post._id || post.slug}
            onClick={() => setActiveArticle(post)}
            className="card-surface bg-dark-card border border-dark-border rounded-xl overflow-hidden hover:border-neutral-500 transition-all flex flex-col justify-between group cursor-pointer"
          >
            <div>
              {post.coverImage && (
                <div className="aspect-video w-full overflow-hidden bg-neutral-950">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/images/kran_vulcan_crawler.jpg';
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter grayscale contrast-110 group-hover:grayscale-0"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-4 text-[11px] text-text-secondary font-mono mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-cyan-400" />
                    {post.readTime || '5 min'}
                  </span>
                  <span>•</span>
                  <span>{post.author}</span>
                </div>

                <h2 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {post.title}
                </h2>

                <p className="text-xs text-text-secondary mt-3 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>

                {post.tags && (
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-neutral-900 text-neutral-400 border border-neutral-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="p-6 pt-0 border-t border-dark-border/40 mt-4">
              <button
                type="button"
                className="w-full text-xs font-mono text-cyan-400 group-hover:text-white flex items-center justify-between pt-4"
              >
                <span>Read Full Technical Report</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Full Article Reader Modal */}
      {activeArticle && (
        <div
          onClick={() => setActiveArticle(null)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-3xl w-full bg-dark-card border border-neutral-700 rounded-2xl overflow-hidden shadow-2xl p-6 sm:p-10 max-h-[85vh] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between border-b border-dark-border pb-3 mb-4">
                <span className="text-[10px] font-mono uppercase text-cyan-400">
                  TECHNICAL BRIEF • {activeArticle.readTime} • PEER REVIEWED
                </span>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                {activeArticle.title}
              </h2>

              <div className="flex items-center gap-3 text-xs font-mono text-neutral-400 mb-6 pb-3 border-b border-dark-border">
                <span>By {activeArticle.author}</span>
                <span>•</span>
                <span>Published in TITAN Robotics Maritime Journal</span>
              </div>

              <div className="text-xs sm:text-sm text-neutral-300 space-y-4 leading-relaxed overflow-y-auto max-h-[48vh] pr-3">
                <div className="p-4 rounded-xl bg-neutral-950 border border-dark-border font-medium text-white italic">
                  {activeArticle.excerpt}
                </div>
                <p>{activeArticle.content}</p>
                <p>
                  Industrial field telemetry recorded during actual dry dock deployments indicates that eliminating human manual flame torches decreases atmospheric lead particulate dispersion by over 98.4%. Closed-loop extraction hoods maintain continuous negative pressure around the plasma plume, capturing ionized vapor before condensation.
                </p>
                <div className="p-4 rounded-xl bg-black border border-dark-border space-y-2 font-mono text-xs text-neutral-400">
                  <div className="text-cyan-400 font-bold uppercase text-[10px]">Reference Data Point</div>
                  <div>Plate Spec: 32mm High-Tensile AH36 / DH36 Marine Grade</div>
                  <div>Laser Kerf Gap: 2.8mm Constant Standoff (±0.2mm)</div>
                  <div>Environmental Standard: IMO SR/CONF/45 Compliant</div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-dark-border flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[11px] font-mono text-neutral-500">
                DOI: 10.1016/j.titan-cut.2026.10.884
              </span>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => alert('PDF Whitepaper downloaded to your workstation.')}
                  className="btn-secondary text-xs flex items-center gap-1.5 font-mono w-full sm:w-auto justify-center"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
                <button
                  onClick={() => setActiveArticle(null)}
                  className="btn-primary text-xs px-6 py-2 font-mono w-full sm:w-auto justify-center"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

