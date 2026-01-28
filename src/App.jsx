import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, ExternalLink, Instagram, Mail, Star, BarChart3, Users, Target, CheckCircle, XCircle, TrendingUp, Globe, Zap, Edit2, X, ArrowRight } from 'lucide-react';

const NICHES = [
  'Natural Beauty', 'Clean Skincare', 'Wellness', 'Home Decor', 'Sustainable Fashion',
  'Organic Haircare', 'Aromatherapy', 'Candles', 'Jewelry', 'Activewear',
  'Plant-Based Beauty', 'Self-Care', 'Crystals', 'Handmade Soap', 'Essential Oils'
];

const INSTAGRAM_HASHTAGS = [
  '#naturalbeautybrand', '#cleanbeauty', '#organicskincare', '#ecofriendlybeauty',
  '#indiebeauty', '#smallbatchskincare', '#greenbeauty', '#sustainablebeauty',
  '#holisticbeauty', '#plantbasedskincare', '#veganbeauty', '#handmadebeauty',
  '#artisanbeauty', '#luxuryskincare', '#selfcarebrand', '#wellnessbrand',
  '#homedecorbrand', '#bohohome', '#minimalistdecor', '#handmadecandles',
  '#sustainablefashion', '#slowfashion', '#ethicalfashion', '#indiefashion'
];

const GOOGLE_SEARCHES = [
  '"powered by Shopify" natural beauty',
  '"powered by Shopify" clean skincare',
  '"powered by Shopify" wellness brand',
  '"powered by Shopify" home decor',
  '"powered by Shopify" candles handmade',
  '"powered by Shopify" organic haircare',
  '"powered by Shopify" sustainable fashion',
  'site:myshopify.com beauty products',
  'site:myshopify.com wellness brand'
];

const ICP_CRITERIA = {
  niche: ['beauty', 'wellness', 'home decor', 'fashion', 'skincare'],
  locations: ['US', 'UK', 'Canada', 'Australia'],
};

export default function LeadGenDashboard() {
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddLead, setShowAddLead] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLead, setEditingLead] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('leadGenLeads');
      if (saved) setLeads(JSON.parse(saved));
    } catch (e) {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('leadGenLeads', JSON.stringify(leads));
    } catch (e) {}
  }, [leads]);

  const calculateICPScore = (lead) => {
    let score = 0;
    if (lead.followers >= 1000 && lead.followers <= 50000) score += 20;
    else if (lead.followers > 50000 && lead.followers <= 100000) score += 10;
    if (lead.visualQuality === 'poor') score += 25;
    else if (lead.visualQuality === 'amateur') score += 20;
    else if (lead.visualQuality === 'inconsistent') score += 15;
    if (ICP_CRITERIA.niche.some(n => lead.niche?.toLowerCase().includes(n))) score += 15;
    if (ICP_CRITERIA.locations.includes(lead.location)) score += 15;
    if (lead.lastPosted && new Date() - new Date(lead.lastPosted) < 7 * 24 * 60 * 60 * 1000) score += 10;
    if (lead.hasShopify) score += 10;
    if (lead.email) score += 5;
    return score;
  };

  const addLead = (newLead) => {
    const lead = {
      ...newLead,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      status: 'new',
      icpScore: 0,
    };
    lead.icpScore = calculateICPScore(lead);
    setLeads([lead, ...leads]);
    setShowAddLead(false);
  };

  const updateLead = (id, updates) => {
    setLeads(leads.map(lead => {
      if (lead.id === id) {
        const updated = { ...lead, ...updates };
        updated.icpScore = calculateICPScore(updated);
        return updated;
      }
      return lead;
    }));
  };

  const deleteLead = (id) => setLeads(leads.filter(lead => lead.id !== id));

  const getStatusStyle = (status) => {
    const styles = {
      new: 'bg-stone-100 text-stone-600 border-stone-200',
      contacted: 'bg-amber-50 text-amber-700 border-amber-200',
      replied: 'bg-sky-50 text-sky-700 border-sky-200',
      interested: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      booked: 'bg-violet-50 text-violet-700 border-violet-200',
      closed: 'bg-stone-900 text-white border-stone-900',
      lost: 'bg-red-50 text-red-600 border-red-200'
    };
    return styles[status] || styles.new;
  };

  const getScoreDisplay = (score) => {
    if (score >= 70) return { color: 'text-stone-900' };
    if (score >= 50) return { color: 'text-stone-600' };
    return { color: 'text-stone-400' };
  };

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      lead.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.instagram?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.niche?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: leads.length,
    closed: leads.filter(l => l.status === 'closed').length,
    avgScore: leads.length > 0 ? Math.round(leads.reduce((a, b) => a + b.icpScore, 0) / leads.length) : 0,
    hotLeads: leads.filter(l => l.icpScore >= 70).length
  };

  const serifFont = { fontFamily: "'Playfair Display', Georgia, serif" };
  const sansFont = { fontFamily: "'DM Sans', system-ui, sans-serif" };

  return (
    <div className="min-h-screen bg-white text-stone-900" style={sansFont}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Header */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl tracking-wide font-medium">LEAD</span>
              <span className="text-stone-300">|</span>
              <span className="text-xl tracking-wide font-medium">FLOW.</span>
            </div>
            
            <nav className="flex items-center gap-8">
              {['dashboard', 'leads', 'search', 'icp'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-sm tracking-wide transition-colors ${
                    activeTab === tab ? 'text-stone-900' : 'text-stone-400 hover:text-stone-600'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>

            <button
              onClick={() => setShowAddLead(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-sm tracking-wide hover:bg-stone-800 transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              Add Lead
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-16">
            <div className="text-center">
              <h1 style={serifFont} className="text-4xl mb-3">Your Pipeline at a Glance</h1>
              <p className="text-stone-500">Track and manage your ideal clients</p>
            </div>

            <div className="grid grid-cols-3 gap-px bg-stone-200">
              {[
                { label: 'Total Leads', value: stats.total, icon: Users },
                { label: 'Hot Leads', value: stats.hotLeads, icon: Target },
                { label: 'Avg. ICP Score', value: `${stats.avgScore}%`, icon: BarChart3 },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-10 text-center">
                  <stat.icon className="w-8 h-8 mx-auto mb-4 text-stone-400" strokeWidth={1} />
                  <p style={serifFont} className="text-4xl mb-2">{stat.value}</p>
                  <p className="text-sm text-stone-500 tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 style={serifFont} className="text-2xl">Pipeline Overview</h2>
                <p className="text-sm text-stone-400">See how we compare to your goals</p>
              </div>
              
              <div className="border border-stone-200">
                <div className="grid grid-cols-6 divide-x divide-stone-200">
                  {['new', 'contacted', 'replied', 'interested', 'booked', 'closed'].map(status => {
                    const count = leads.filter(l => l.status === status).length;
                    return (
                      <div key={status} className="p-6 text-center">
                        <p style={serifFont} className="text-3xl mb-2">{count}</p>
                        <p className="text-xs text-stone-500 uppercase tracking-wider">{status}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 style={serifFont} className="text-2xl">Hot Leads</h2>
                <p className="text-sm text-stone-400">70%+ ICP Match</p>
              </div>
              
              <div className="border border-stone-200 divide-y divide-stone-200">
                {leads.filter(l => l.icpScore >= 70).slice(0, 5).map(lead => (
                  <div key={lead.id} className="flex items-center justify-between p-6 hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-8">
                      <div className="w-16 text-center">
                        <p style={serifFont} className="text-2xl">{lead.icpScore}%</p>
                      </div>
                      <div>
                        <p className="font-medium">{lead.brandName}</p>
                        <p className="text-sm text-stone-400">@{lead.instagram} · {lead.niche}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`text-xs px-3 py-1 border ${getStatusStyle(lead.status)}`}>{lead.status}</span>
                      <button onClick={() => setActiveTab('leads')} className="p-2 hover:bg-stone-100 transition-colors">
                        <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
                {leads.filter(l => l.icpScore >= 70).length === 0 && (
                  <p className="text-stone-400 text-center py-12">No hot leads yet. Start prospecting!</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Leads Tab */}
        {activeTab === 'leads' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h1 style={serifFont} className="text-3xl">Your Leads</h1>
              <p className="text-stone-400 text-sm">{filteredLeads.length} leads</p>
            </div>

            <div className="flex items-center gap-6 pb-6 border-b border-stone-200">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" strokeWidth={1.5} />
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-6 pr-4 py-2 bg-transparent border-b border-stone-200 text-sm focus:outline-none focus:border-stone-900 transition-colors"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-transparent border border-stone-200 text-sm focus:outline-none focus:border-stone-900 cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="replied">Replied</option>
                <option value="interested">Interested</option>
                <option value="booked">Booked</option>
                <option value="closed">Closed</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            <div className="border border-stone-200">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50">
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-4">Brand</th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-4">Score</th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-4">Status</th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-4">Contact</th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-4">Details</th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-6 py-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-5">
                        <p className="font-medium">{lead.brandName}</p>
                        <p className="text-sm text-stone-400">{lead.niche}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span style={serifFont} className={`text-xl ${getScoreDisplay(lead.icpScore).color}`}>
                          {lead.icpScore}%
                        </span>
                        {lead.icpScore >= 70 && <span className="text-xs text-stone-400 ml-2">Hot</span>}
                      </td>
                      <td className="px-6 py-5">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLead(lead.id, { status: e.target.value })}
                          className={`text-xs px-3 py-1.5 border ${getStatusStyle(lead.status)} bg-transparent focus:outline-none cursor-pointer`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="replied">Replied</option>
                          <option value="interested">Interested</option>
                          <option value="booked">Booked</option>
                          <option value="closed">Closed</option>
                          <option value="lost">Lost</option>
                        </select>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-1">
                          {lead.instagram && (
                            <a href={`https://instagram.com/${lead.instagram}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-stone-100 transition-colors">
                              <Instagram className="w-4 h-4" strokeWidth={1.5} />
                            </a>
                          )}
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="p-2 hover:bg-stone-100 transition-colors">
                              <Mail className="w-4 h-4" strokeWidth={1.5} />
                            </a>
                          )}
                          {lead.website && (
                            <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-stone-100 transition-colors">
                              <Globe className="w-4 h-4" strokeWidth={1.5} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-stone-500">{lead.followers?.toLocaleString()} followers</p>
                        <p className="text-sm text-stone-400">{lead.location}</p>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditingLead(lead)} className="p-2 hover:bg-stone-100 transition-colors">
                            <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                          <button onClick={() => deleteLead(lead.id)} className="p-2 hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors">
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredLeads.length === 0 && (
                <div className="text-center py-16 text-stone-400">
                  <Users className="w-10 h-10 mx-auto mb-4 opacity-30" strokeWidth={1} />
                  <p>No leads found. Start prospecting!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div className="space-y-16">
            <div className="text-center max-w-xl mx-auto">
              <h1 style={serifFont} className="text-4xl mb-4">Find Your Next Client</h1>
              <p className="text-stone-500">Quick links to search for DTC brands matching your ICP</p>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-6">
                <Instagram className="w-5 h-5" strokeWidth={1.5} />
                <h2 style={serifFont} className="text-2xl">Instagram Hashtags</h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {INSTAGRAM_HASHTAGS.map(tag => (
                  <a
                    key={tag}
                    href={`https://www.instagram.com/explore/tags/${tag.replace('#', '')}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 border border-stone-200 text-sm hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-colors flex items-center gap-2"
                  >
                    {tag}
                    <ExternalLink className="w-3 h-3 opacity-40" strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-6">
                <Search className="w-5 h-5" strokeWidth={1.5} />
                <h2 style={serifFont} className="text-2xl">Google Search Queries</h2>
              </div>
              <div className="border border-stone-200 divide-y divide-stone-200">
                {GOOGLE_SEARCHES.map((query, i) => (
                  <a
                    key={i}
                    href={`https://www.google.com/search?q=${encodeURIComponent(query)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-5 hover:bg-stone-50 transition-colors group"
                  >
                    <code className="text-sm text-stone-600">{query}</code>
                    <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-4 mb-6">
                <Zap className="w-5 h-5" strokeWidth={1.5} />
                <h2 style={serifFont} className="text-2xl">Recommended Tools</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-px bg-stone-200">
                {[
                  { name: 'BuiltWith', url: 'https://builtwith.com', desc: 'Find Shopify stores by tech stack' },
                  { name: 'Wappalyzer', url: 'https://www.wappalyzer.com', desc: 'Browser extension to detect Shopify' },
                  { name: 'MyIP.ms', url: 'https://myip.ms', desc: 'Search Shopify stores by category' },
                  { name: 'Similar Web', url: 'https://similarweb.com', desc: 'Check traffic & engagement' },
                  { name: 'Social Blade', url: 'https://socialblade.com', desc: 'Track Instagram growth' },
                  { name: 'Hunter.io', url: 'https://hunter.io', desc: 'Find email addresses' },
                ].map(tool => (
                  <a key={tool.name} href={tool.url} target="_blank" rel="noopener noreferrer" className="p-8 bg-white hover:bg-stone-50 transition-colors group">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium">{tool.name}</span>
                      <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" strokeWidth={1.5} />
                    </div>
                    <p className="text-sm text-stone-400">{tool.desc}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ICP Tab */}
        {activeTab === 'icp' && (
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="text-center">
              <h1 style={serifFont} className="text-4xl mb-4">Your Ideal Client Profile</h1>
              <p className="text-stone-500">Reference guide for qualifying leads</p>
            </div>

            <div className="grid md:grid-cols-2 gap-px bg-stone-200">
              <div className="bg-white p-10">
                <div className="flex items-center gap-3 mb-6">
                  <Users className="w-5 h-5" strokeWidth={1} />
                  <h3 style={serifFont} className="text-xl">Demographics</h3>
                </div>
                <ul className="space-y-4 text-stone-600">
                  {['Female founder, age 28-45', 'DTC Shopify store (beauty, wellness, home, fashion)', 'Based in US, UK, Canada, or Australia', '1-3 employees (or solopreneur with VA)'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-10">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-5 h-5" strokeWidth={1} />
                  <h3 style={serifFont} className="text-xl">Business Metrics</h3>
                </div>
                <ul className="space-y-4 text-stone-600">
                  {['Revenue: $250K-$2M (sweet spot: $500K-$1M)', 'Price point: $50-$300', '100-500 orders/month', 'In business 1-3 years'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-10">
                <div className="flex items-center gap-3 mb-6">
                  <XCircle className="w-5 h-5" strokeWidth={1} />
                  <h3 style={serifFont} className="text-xl">Pain Points to Look For</h3>
                </div>
                <ul className="space-y-4 text-stone-600">
                  {['DIY/amateur product photos', 'Spending $2K-8K per photoshoot', 'Needs constant social content', 'Conversion rate stuck at 1-2%', 'Using Canva (generic looking)'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-full border border-stone-300 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white p-10">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-5 h-5" strokeWidth={1} />
                  <h3 style={serifFont} className="text-xl">Why They'll Pay $1,497-$2,997</h3>
                </div>
                <ul className="space-y-4 text-stone-600">
                  {['1% conversion increase = $5K-$20K extra revenue', 'AI visuals cost 70% less than traditional shoots', '15-40 images in 72 hours vs 2-4 weeks', 'Scale content for social media'].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <Star className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="border border-stone-200 p-10">
              <h3 style={serifFont} className="text-2xl mb-8 text-center">ICP Score Breakdown</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { criteria: 'Follower count (1K-50K)', points: 20 },
                  { criteria: 'Poor/amateur visual quality', points: 25 },
                  { criteria: 'Niche match (beauty/wellness/etc)', points: 15 },
                  { criteria: 'Location (US/UK/CA/AU)', points: 15 },
                  { criteria: 'Active posting (last 7 days)', points: 10 },
                  { criteria: 'Has Shopify store', points: 10 },
                  { criteria: 'Email available', points: 5 },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-stone-50">
                    <span className="text-stone-600">{item.criteria}</span>
                    <span style={serifFont} className="text-lg">+{item.points}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-stone-200 flex justify-between items-center">
                <span className="text-stone-500">70%+ = Hot Lead</span>
                <span style={serifFont} className="text-xl">Max: 100 points</span>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Lead Modal */}
      {showAddLead && <LeadModal onClose={() => setShowAddLead(false)} onSave={addLead} serifFont={serifFont} />}

      {/* Edit Lead Modal */}
      {editingLead && (
        <LeadModal
          lead={editingLead}
          onClose={() => setEditingLead(null)}
          onSave={(data) => { updateLead(editingLead.id, data); setEditingLead(null); }}
          serifFont={serifFont}
        />
      )}
    </div>
  );
}

function LeadModal({ lead, onClose, onSave, serifFont }) {
  const [formData, setFormData] = useState(lead || {
    brandName: '', instagram: '', website: '', email: '', niche: '', followers: '',
    location: 'US', visualQuality: 'amateur', hasShopify: true,
    lastPosted: new Date().toISOString().split('T')[0], notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...formData, followers: parseInt(formData.followers) || 0 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="w-full max-w-lg bg-white shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-stone-200">
          <h2 style={serifFont} className="text-xl">{lead ? 'Edit Lead' : 'Add New Lead'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-100 transition-colors">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-5">
            <div className="col-span-2">
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Brand Name *</label>
              <input type="text" required value={formData.brandName} onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-900" placeholder="e.g., Glow Botanicals" />
            </div>
            
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Instagram</label>
              <input type="text" value={formData.instagram || ''} onChange={(e) => setFormData({ ...formData, instagram: e.target.value.replace('@', '') })}
                className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-900" placeholder="@handle" />
            </div>
            
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Followers</label>
              <input type="number" value={formData.followers || ''} onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-900" placeholder="e.g., 5000" />
            </div>
            
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Website</label>
              <input type="text" value={formData.website || ''} onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-900" placeholder="brand.com" />
            </div>
            
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Email</label>
              <input type="email" value={formData.email || ''} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-900" placeholder="hello@brand.com" />
            </div>
            
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Niche</label>
              <select value={formData.niche || ''} onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 bg-white">
                <option value="">Select niche</option>
                {NICHES.map(niche => <option key={niche} value={niche}>{niche}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Location</label>
              <select value={formData.location || 'US'} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 bg-white">
                <option value="US">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Visual Quality</label>
              <select value={formData.visualQuality || 'amateur'} onChange={(e) => setFormData({ ...formData, visualQuality: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 bg-white">
                <option value="poor">Poor (iPhone + ring light)</option>
                <option value="amateur">Amateur (inconsistent)</option>
                <option value="inconsistent">Inconsistent (mixed)</option>
                <option value="good">Good (not ideal)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Last Posted</label>
              <input type="date" value={formData.lastPosted?.split('T')[0] || ''} onChange={(e) => setFormData({ ...formData, lastPosted: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-900" />
            </div>
            
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="hasShopify" checked={formData.hasShopify || false} onChange={(e) => setFormData({ ...formData, hasShopify: e.target.checked })} className="w-4 h-4" />
              <label htmlFor="hasShopify" className="text-sm text-stone-600">Has Shopify store</label>
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-2">Notes</label>
              <textarea value={formData.notes || ''} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 resize-none" rows={3} placeholder="Any observations..." />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-3 border border-stone-200 text-sm hover:bg-stone-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-3 bg-stone-900 text-white text-sm hover:bg-stone-800 transition-colors">{lead ? 'Save Changes' : 'Add Lead'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
