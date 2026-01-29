import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, ExternalLink, Instagram, Mail, Star, BarChart3, Users, Target, CheckCircle, XCircle, TrendingUp, Globe, Zap, Edit2, X, ArrowRight, Upload, Download, Lock, Eye, EyeOff, MessageCircle, Sparkles, Copy, Check, Loader2, RefreshCw } from 'lucide-react';

const NICHES = [
  'Skincare', 'Candles', 'Natural Beauty', 'Clean Skincare', 'Wellness', 'Home Decor',
  'Sustainable Fashion', 'Organic Haircare', 'Aromatherapy', 'Jewelry', 'Activewear',
  'Plant-Based Beauty', 'Self-Care', 'Crystals', 'Handmade Soap', 'Essential Oils',
  'Wellness/Supplements', 'Wellness/Gut Health'
];

const STATUSES = [
  'Have Not Messaged', 'Messaged', 'Replied', 'Follow-up Sent',
  'Interested', 'Booked', 'Closed', 'Not Interested'
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

// US states list for location matching
const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA',
  'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
  'VA', 'WA', 'WV', 'WI', 'WY', 'DC',
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
  'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma',
  'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee',
  'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

// Check if location is in the US
const isUSLocation = (location) => {
  if (!location) return false;
  const loc = location.toLowerCase().trim();
  
  // Check for explicit US indicators
  if (loc.includes('usa') || loc.includes('united states') || loc === 'us') return true;
  
  // Check for state names or abbreviations
  const locationParts = loc.split(/[,\s]+/);
  for (const part of locationParts) {
    const cleanPart = part.trim();
    if (US_STATES.some(state => state.toLowerCase() === cleanPart)) {
      return true;
    }
  }
  
  // Check if location ends with a US state abbreviation pattern like "City, CA" or "City, California"
  const stateMatch = loc.match(/,\s*([a-z]{2}|\w+)$/i);
  if (stateMatch) {
    const potentialState = stateMatch[1].trim();
    if (US_STATES.some(state => state.toLowerCase() === potentialState.toLowerCase())) {
      return true;
    }
  }
  
  return false;
};

// Simple password protection
const APP_PASSWORD = 'visualdept2024';

// Calculate ICP Score - FIXED VERSION
const calculateICPScore = (lead) => {
  let score = 0;
  const followers = parseInt(lead.followers) || 0;

  // Follower count scoring (20 points max)
  if (followers >= 1000 && followers <= 50000) score += 20;
  else if (followers > 50000 && followers <= 100000) score += 10;

  // Visual quality scoring (25 points max) - case insensitive
  const visualQuality = (lead.visualQuality || '').toLowerCase().trim();
  if (visualQuality === 'poor') score += 25;
  else if (visualQuality === 'amateur') score += 20;
  else if (visualQuality === 'inconsistent') score += 15;
  else if (visualQuality === 'good') score += 5;

  // Niche match scoring (15 points)
  const nicheMatch = ['skincare', 'candles', 'beauty', 'wellness', 'home decor', 'fashion', 'jewelry', 'haircare', 'soap', 'oils', 'aromatherapy', 'self-care', 'crystals', 'activewear', 'supplements', 'gut health'];
  const leadNiche = (lead.niche || '').toLowerCase();
  if (nicheMatch.some(n => leadNiche.includes(n))) score += 15;

  // Location scoring (15 points) - US ONLY
  if (isUSLocation(lead.location)) score += 15;

  // Has website/Shopify (10 points)
  if (lead.hasShopify || lead.website) score += 10;

  // Email available (5 points)
  if (lead.email) score += 5;

  // Contact name found (5 points)
  if (lead.contactName) score += 5;

  // Has Instagram (5 points)
  if (lead.instagram) score += 5;

  return Math.min(score, 100);
};

// Generate message using Claude API
const generateMessageWithAI = async (lead) => {
  const brandName = lead.brandName || 'your brand';
  const contactName = lead.contactName || '';
  const niche = lead.niche || 'beauty/wellness';
  const visualQuality = lead.visualQuality || 'amateur';
  const instagram = lead.instagram || '';
  const website = lead.website || '';

  const prompt = `You are writing a cold Instagram DM for Visual Dept (a product photography agency) to send to ${brandName}.

BRAND DETAILS:
- Brand Name: ${brandName}
- Niche/Category: ${niche}
- Instagram Handle: ${instagram ? `@${instagram}` : 'not provided'}
- Website: ${website || 'not provided'}
- Contact Name: ${contactName || 'not provided'}

YOUR TASK: Write a unique, personalized DM that feels like you actually looked at their brand. Create a SPECIFIC compliment that could ONLY apply to this brand based on their name, niche, and any details provided.

FORMAT (exactly 3 sentences):
1. "Hey!" + a UNIQUE, SPECIFIC compliment about their brand/products. Be creative - reference their brand name, imagine what their products might look like based on their niche, mention textures, colors, vibes, or feelings their products might evoke. Make it feel personal, not generic.
2. "I run Visual Dept and we help brands create [benefit specific to what THEY would need based on their niche]."
3. "Want a free concept mockup for one of your products?" (or slight variation like "for one of your [specific product type]?")

EXAMPLES OF GOOD SPECIFIC COMPLIMENTS:
- For "Glow Botanics" (skincare): "Your plant-powered formulas deserve visuals as fresh as the ingredients"
- For "Ember & Oak" (candles): "The warm, woody aesthetic of your candle line is so inviting"
- For "Wild Roots Wellness": "Love how your brand captures that back-to-nature wellness vibe"
- For "Silk & Stone Jewelry": "Your pieces have such an elegant, timeless quality"

STRICT RULES:
- NO em dashes (—) anywhere
- NO emojis
- NO mentioning AI, pricing, percentages, or delivery times
- Keep it casual and natural
- Make the compliment SPECIFIC to this brand, not generic
- Total: 3 sentences, around 40-50 words

OUTPUT: Just the DM text, nothing else.`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [
          { role: "user", content: prompt }
        ],
      })
    });

    const data = await response.json();
    
    if (data.content && data.content[0] && data.content[0].text) {
      return data.content[0].text.trim();
    }
    
    throw new Error('Invalid response from API');
  } catch (error) {
    console.error('AI generation error:', error);
    // Return a fallback template-based message
    return generateFallbackMessage(lead);
  }
};

// Fallback message generator (template-based but uses brand name)
const generateFallbackMessage = (lead) => {
  const brandName = lead.brandName || 'your brand';
  const niche = (lead.niche || 'beauty').toLowerCase();
  
  // Create a somewhat personalized message using brand name
  let productType = "products";
  let visualBenefit = "create stunning product visuals that stand out";
  
  if (niche.includes('skincare') || niche.includes('beauty')) {
    productType = "skincare line";
    visualBenefit = "create clean, elevated visuals that highlight quality ingredients";
  } else if (niche.includes('candle')) {
    productType = "candles";
    visualBenefit = "create warm, inviting visuals that capture that artisanal feel";
  } else if (niche.includes('wellness') || niche.includes('supplement')) {
    productType = "wellness products";
    visualBenefit = "create fresh, trustworthy visuals that build credibility";
  } else if (niche.includes('jewelry')) {
    productType = "pieces";
    visualBenefit = "create elegant visuals that showcase the craftsmanship";
  } else if (niche.includes('home') || niche.includes('decor')) {
    productType = "collection";
    visualBenefit = "create lifestyle visuals that inspire";
  }
  
  return `Hey! Love what ${brandName} is building. I run Visual Dept and we help brands ${visualBenefit}. Want a free concept mockup for one of your ${productType}?`;
};

export default function LeadGenDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddLead, setShowAddLead] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLead, setEditingLead] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(null);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [isGeneratingMessage, setIsGeneratingMessage] = useState(false);
  const fileInputRef = useRef(null);

  // Check if already authenticated
  useEffect(() => {
    const auth = sessionStorage.getItem('leadflow_auth');
    if (auth === 'true') setIsAuthenticated(true);
  }, []);

  // Load leads from localStorage and recalculate scores
  useEffect(() => {
    if (isAuthenticated) {
      try {
        const saved = localStorage.getItem('leadGenLeads');
        if (saved) {
          const loadedLeads = JSON.parse(saved);
          // Recalculate ICP scores on load
          const updatedLeads = loadedLeads.map(lead => ({
            ...lead,
            icpScore: calculateICPScore(lead)
          }));
          setLeads(updatedLeads);
        }
      } catch (e) {
        console.error('Error loading leads:', e);
      }
    }
  }, [isAuthenticated]);

  // Save leads to localStorage
  useEffect(() => {
    if (isAuthenticated && leads.length > 0) {
      try {
        localStorage.setItem('leadGenLeads', JSON.stringify(leads));
      } catch (e) {
        console.error('Error saving leads:', e);
      }
    }
  }, [leads, isAuthenticated]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (passwordInput === APP_PASSWORD) {
      setIsAuthenticated(true);
      sessionStorage.setItem('leadflow_auth', 'true');
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const addLead = (newLead) => {
    const lead = {
      ...newLead,
      id: Date.now(),
      createdAt: new Date().toISOString(),
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

  const importCSV = (csvText) => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length < 2) return;

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));
    const newLeads = [];

    for (let i = 1; i < lines.length; i++) {
      const values = [];
      let current = '';
      let inQuotes = false;

      for (let char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());

      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });

      // Map to our format
      const lead = {
        id: Date.now() + i,
        createdAt: new Date().toISOString(),
        brandName: row['brand name'] || row['brandname'] || row['name'] || '',
        niche: row['search'] || row['niche'] || row['category'] || '',
        website: row['store link'] || row['storelink'] || row['website'] || row['url'] || '',
        instagram: (row['social link'] || row['sociallink'] || row['instagram'] || '')
          .replace('https://www.instagram.com/', '')
          .replace('https://instagram.com/', '')
          .replace('/', ''),
        contactName: row['contact name'] || row['contactname'] || row['founder'] || row['owner'] || '',
        location: row['location'] || row['city'] || '',
        dateMessaged: row['date messaged'] || row['datemessaged'] || '',
        firstMessageSent: (row['first message'] || row['firstmessage'] || '').toLowerCase() === 'yes',
        replied: (row['replied?'] || row['replied'] || '').toLowerCase() === 'yes',
        status: row['status'] || 'Have Not Messaged',
        followUpSent: (row['follow-up sent?'] || row['followupsent'] || row['follow up sent'] || '').toLowerCase() === 'yes',
        interested: (row['interested?'] || row['interested'] || '').toLowerCase() === 'yes',
        notes: row['notes'] || row['note'] || '',
        email: row['email'] || '',
        followers: parseInt(row['followers']) || 0,
        visualQuality: (row['visual quality'] || row['visualquality'] || 'amateur').toLowerCase().trim(),
        hasShopify: true,
        icpScore: 0
      };

      // Map status from Google Sheets format
      if (lead.status === 'Have Not Messaged' && lead.firstMessageSent) {
        lead.status = 'Messaged';
      }
      if (lead.replied) {
        lead.status = 'Replied';
      }
      if (lead.followUpSent && lead.status === 'Messaged') {
        lead.status = 'Follow-up Sent';
      }
      if (lead.interested) {
        lead.status = 'Interested';
      }

      lead.icpScore = calculateICPScore(lead);

      if (lead.brandName) {
        newLeads.push(lead);
      }
    }

    setLeads(prev => [...newLeads, ...prev]);
    setShowImport(false);
  };

  const exportCSV = () => {
    const headers = ['Brand Name', 'Search', 'Store Link', 'Social Link', 'Contact Name', 'Location', 'Date Messaged', 'First Message', 'Replied?', 'Status', 'Follow-up sent?', 'Interested?', 'Notes', 'ICP Score', 'Visual Quality'];
    const rows = leads.map(lead => [
      lead.brandName,
      lead.niche,
      lead.website,
      lead.instagram ? `https://www.instagram.com/${lead.instagram}/` : '',
      lead.contactName,
      lead.location,
      lead.dateMessaged,
      lead.firstMessageSent ? 'Yes' : '',
      lead.replied ? 'Yes' : '',
      lead.status,
      lead.followUpSent ? 'Yes' : '',
      lead.interested ? 'Yes' : '',
      lead.notes,
      lead.icpScore,
      lead.visualQuality
    ]);
    const csvContent = [headers, ...rows].map(row => row.map(cell => `"${cell || ''}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leadflow-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        importCSV(event.target.result);
      };
      reader.readAsText(file);
    }
  };

  const handleGenerateMessage = async (lead) => {
    setShowMessageModal(lead);
    setGeneratedMessage('');
    setCopiedMessage(false);
    setIsGeneratingMessage(true);
    
    try {
      const message = await generateMessageWithAI(lead);
      setGeneratedMessage(message);
    } catch (error) {
      console.error('Error generating message:', error);
      setGeneratedMessage(generateFallbackMessage(lead));
    } finally {
      setIsGeneratingMessage(false);
    }
  };

  const handleRegenerateMessage = async () => {
    if (showMessageModal) {
      setIsGeneratingMessage(true);
      setCopiedMessage(false);
      try {
        const message = await generateMessageWithAI(showMessageModal);
        setGeneratedMessage(message);
      } catch (error) {
        console.error('Error regenerating message:', error);
        setGeneratedMessage(generateFallbackMessage(showMessageModal));
      } finally {
        setIsGeneratingMessage(false);
      }
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(generatedMessage);
    setCopiedMessage(true);
    setTimeout(() => setCopiedMessage(false), 2000);
  };

  const getStatusStyle = (status) => {
    const styles = {
      'Have Not Messaged': 'bg-stone-100 text-stone-600 border-stone-200',
      'Messaged': 'bg-amber-50 text-amber-700 border-amber-200',
      'Replied': 'bg-sky-50 text-sky-700 border-sky-200',
      'Follow-up Sent': 'bg-violet-50 text-violet-700 border-violet-200',
      'Interested': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'Booked': 'bg-pink-50 text-pink-700 border-pink-200',
      'Closed': 'bg-stone-900 text-white border-stone-900',
      'Not Interested': 'bg-red-50 text-red-600 border-red-200'
    };
    return styles[status] || styles['Have Not Messaged'];
  };

  const getScoreDisplay = (score) => {
    if (score >= 70) return { color: 'text-stone-900', bg: 'bg-emerald-50' };
    if (score >= 50) return { color: 'text-stone-600', bg: 'bg-amber-50' };
    return { color: 'text-stone-400', bg: 'bg-stone-50' };
  };

  const filteredLeads = leads.filter(lead => {
    const matchesStatus = filterStatus === 'all' || lead.status === filterStatus;
    const matchesSearch = searchTerm === '' ||
      lead.brandName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.instagram?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.niche?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactName?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Hot leads are those with 70%+ ICP score
  const hotLeads = leads.filter(l => l.icpScore >= 70).sort((a, b) => b.icpScore - a.icpScore);

  const stats = {
    total: leads.length,
    notMessaged: leads.filter(l => l.status === 'Have Not Messaged').length,
    messaged: leads.filter(l => l.status === 'Messaged').length,
    replied: leads.filter(l => l.status === 'Replied').length,
    interested: leads.filter(l => l.status === 'Interested').length,
    booked: leads.filter(l => l.status === 'Booked').length,
    closed: leads.filter(l => l.status === 'Closed').length,
    avgScore: leads.length > 0 ? Math.round(leads.reduce((a, b) => a + b.icpScore, 0) / leads.length) : 0,
    hotLeads: hotLeads.length
  };

  const serifFont = { fontFamily: "'Playfair Display', Georgia, serif" };
  const sansFont = { fontFamily: "'DM Sans', system-ui, sans-serif" };

  // Login Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6" style={sansFont}>
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:wght@400;500;600&display=swap" rel="stylesheet" />
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-2xl tracking-wide font-medium">LEAD</span>
              <span className="text-stone-300">|</span>
              <span className="text-2xl tracking-wide font-medium">FLOW.</span>
            </div>
            <p className="text-stone-500">Enter password to continue</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" strokeWidth={1.5} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className={`w-full pl-11 pr-11 py-3 border ${passwordError ? 'border-red-300' : 'border-stone-200'} text-sm focus:outline-none focus:border-stone-900 transition-colors`}
                placeholder="Password"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" strokeWidth={1.5} /> : <Eye className="w-4 h-4" strokeWidth={1.5} />}
              </button>
            </div>
            {passwordError && (
              <p className="text-red-500 text-sm">Incorrect password</p>
            )}
            <button type="submit" className="w-full py-3 bg-stone-900 text-white text-sm hover:bg-stone-800 transition-colors">
              Enter
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-stone-900" style={sansFont}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500&family=Playfair+Display:wght@400;500;600&display=swap" rel="stylesheet" />
      
      {/* Header */}
      <header className="border-b border-stone-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5">
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
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowImport(true)}
                className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 text-sm tracking-wide hover:bg-stone-50 transition-colors"
              >
                <Upload className="w-4 h-4" strokeWidth={1.5} />
                Import
              </button>
              <button
                onClick={exportCSV}
                className="flex items-center gap-2 px-4 py-2.5 border border-stone-200 text-sm tracking-wide hover:bg-stone-50 transition-colors"
              >
                <Download className="w-4 h-4" strokeWidth={1.5} />
                Export
              </button>
              <button
                onClick={() => setShowAddLead(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 text-white text-sm tracking-wide hover:bg-stone-800 transition-colors"
              >
                <Plus className="w-4 h-4" strokeWidth={1.5} />
                Add Lead
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-16">
            <div className="text-center">
              <h1 style={serifFont} className="text-4xl mb-3">Your Pipeline at a Glance</h1>
              <p className="text-stone-500">Track and manage your ideal clients</p>
            </div>

            <div className="grid grid-cols-4 gap-px bg-stone-200">
              {[
                { label: 'Total Leads', value: stats.total },
                { label: 'Hot Leads (70%+)', value: stats.hotLeads },
                { label: 'Avg. ICP Score', value: `${stats.avgScore}%` },
                { label: 'Closed Deals', value: stats.closed },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-8 text-center">
                  <p style={serifFont} className="text-4xl mb-2">{stat.value}</p>
                  <p className="text-sm text-stone-500 tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 style={serifFont} className="text-2xl">Pipeline Overview</h2>
              </div>
              <div className="border border-stone-200">
                <div className="grid grid-cols-8 divide-x divide-stone-200">
                  {STATUSES.map(status => {
                    const count = leads.filter(l => l.status === status).length;
                    return (
                      <div key={status} className="p-4 text-center">
                        <p style={serifFont} className="text-2xl mb-1">{count}</p>
                        <p className="text-xs text-stone-500 leading-tight">{status}</p>
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
                {hotLeads.slice(0, 10).map(lead => (
                  <div key={lead.id} className="flex items-center justify-between p-6 hover:bg-stone-50 transition-colors">
                    <div className="flex items-center gap-8">
                      <div className="w-16 text-center">
                        <p style={serifFont} className="text-2xl text-emerald-600">{lead.icpScore}%</p>
                      </div>
                      <div>
                        <p className="font-medium">{lead.brandName}</p>
                        <p className="text-sm text-stone-400">
                          {lead.instagram && `@${lead.instagram} · `}
                          {lead.niche}
                          {lead.location && ` · ${lead.location}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs px-3 py-1 border ${getStatusStyle(lead.status)}`}>{lead.status}</span>
                      <button
                        onClick={() => handleGenerateMessage(lead)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-stone-900 text-white text-xs hover:bg-stone-800 transition-colors"
                        title="Generate personalized DM with AI"
                      >
                        <Sparkles className="w-3 h-3" strokeWidth={1.5} />
                        Generate DM
                      </button>
                      <button
                        onClick={() => setEditingLead(lead)}
                        className="p-2 hover:bg-stone-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                  </div>
                ))}
                {hotLeads.length === 0 && (
                  <div className="text-stone-400 text-center py-12">
                    <Zap className="w-10 h-10 mx-auto mb-4 opacity-30" strokeWidth={1} />
                    <p className="mb-2 font-medium">No hot leads yet</p>
                    <p className="text-sm mb-4">Hot leads need 70%+ ICP score. To qualify, leads should have:</p>
                    <div className="text-sm space-y-1 text-left max-w-xs mx-auto">
                      <p>• Visual quality: "poor" (+25) or "amateur" (+20)</p>
                      <p>• Matching niche: skincare, candles, wellness, etc. (+15)</p>
                      <p>• US location (+15)</p>
                      <p>• 1K-50K followers (+20)</p>
                      <p>• Website/Shopify store (+10)</p>
                      <p>• Instagram handle (+5)</p>
                      <p>• Email available (+5)</p>
                      <p>• Contact name (+5)</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Leads Tab - CONTACT COLUMN REMOVED */}
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
                {STATUSES.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="border border-stone-200 overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50">
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-4 py-3">Brand</th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-4 py-3">Score</th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-4 py-3">Status</th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-4 py-3">Links</th>
                    <th className="text-left text-xs font-medium text-stone-500 uppercase tracking-wider px-4 py-3">Location</th>
                    <th className="text-right text-xs font-medium text-stone-500 uppercase tracking-wider px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredLeads.map(lead => (
                    <tr key={lead.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-4 py-4">
                        <p className="font-medium">{lead.brandName}</p>
                        <p className="text-sm text-stone-400">{lead.niche}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span 
                          style={serifFont} 
                          className={`text-xl px-2 py-0.5 rounded ${getScoreDisplay(lead.icpScore).color} ${lead.icpScore >= 70 ? 'bg-emerald-50' : ''}`}
                        >
                          {lead.icpScore}%
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => updateLead(lead.id, { status: e.target.value })}
                          className={`text-xs px-2 py-1 border ${getStatusStyle(lead.status)} bg-transparent focus:outline-none cursor-pointer`}
                        >
                          {STATUSES.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1">
                          {lead.instagram && (
                            <a href={`https://instagram.com/${lead.instagram}`} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-stone-100 transition-colors">
                              <Instagram className="w-4 h-4" strokeWidth={1.5} />
                            </a>
                          )}
                          {lead.website && (
                            <a href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`} target="_blank" rel="noopener noreferrer" className="p-1.5 hover:bg-stone-100 transition-colors">
                              <Globe className="w-4 h-4" strokeWidth={1.5} />
                            </a>
                          )}
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="p-1.5 hover:bg-stone-100 transition-colors">
                              <Mail className="w-4 h-4" strokeWidth={1.5} />
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="text-sm text-stone-500">{lead.location || '-'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleGenerateMessage(lead)}
                            className="p-1.5 hover:bg-stone-100 transition-colors"
                            title="Generate DM with AI"
                          >
                            <MessageCircle className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                          <button onClick={() => setEditingLead(lead)} className="p-1.5 hover:bg-stone-100 transition-colors">
                            <Edit2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                          <button onClick={() => deleteLead(lead.id)} className="p-1.5 hover:bg-red-50 text-stone-400 hover:text-red-500 transition-colors">
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
                  <p>No leads found. Import your CSV or start adding leads!</p>
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
                  <a
                    key={tool.name}
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-8 bg-white hover:bg-stone-50 transition-colors group"
                  >
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

        {/* ICP Tab - UPDATED FOR US ONLY */}
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
                  {['Female founder, age 28-45', 'DTC Shopify store (beauty, wellness, home, fashion)', 'Based in United States only', '1-3 employees (or solopreneur with VA)'].map((item, i) => (
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
                  { criteria: 'Poor/amateur visual quality', points: '25/20' },
                  { criteria: 'Niche match (beauty/wellness/etc)', points: 15 },
                  { criteria: 'Location (US only)', points: 15 },
                  { criteria: 'Has website/Shopify store', points: 10 },
                  { criteria: 'Has Instagram', points: 5 },
                  { criteria: 'Contact name found', points: 5 },
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
          onSave={(data) => {
            updateLead(editingLead.id, data);
            setEditingLead(null);
          }}
          serifFont={serifFont}
        />
      )}

      {/* AI Message Generation Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-lg bg-white shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <div>
                <div className="flex items-center gap-2">
                  <h2 style={serifFont} className="text-xl">AI-Powered DM</h2>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-sm text-stone-400 mt-1">for {showMessageModal.brandName}</p>
              </div>
              <button onClick={() => setShowMessageModal(null)} className="p-2 hover:bg-stone-100 transition-colors">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="p-6">
              <div className="bg-stone-50 p-4 rounded-lg mb-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-1">
                    <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Lead Info</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><span className="text-stone-400">Contact:</span> {showMessageModal.contactName || 'Unknown'}</p>
                      <p><span className="text-stone-400">Niche:</span> {showMessageModal.niche || 'Unknown'}</p>
                      <p><span className="text-stone-400">Visual:</span> {showMessageModal.visualQuality || 'Unknown'}</p>
                      <p><span className="text-stone-400">Score:</span> {showMessageModal.icpScore}%</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-xs text-stone-400 uppercase tracking-wider mb-2">Generated Message</p>
                {isGeneratingMessage ? (
                  <div className="w-full h-48 border border-stone-200 flex items-center justify-center">
                    <div className="flex items-center gap-3 text-stone-400">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Generating personalized message...</span>
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={generatedMessage}
                    onChange={(e) => setGeneratedMessage(e.target.value)}
                    className="w-full h-48 p-4 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 resize-none"
                    placeholder="Message will appear here..."
                  />
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRegenerateMessage}
                  disabled={isGeneratingMessage}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-stone-200 text-sm hover:bg-stone-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${isGeneratingMessage ? 'animate-spin' : ''}`} strokeWidth={1.5} />
                  Regenerate
                </button>
                <button
                  onClick={handleCopyMessage}
                  disabled={isGeneratingMessage || !generatedMessage}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-stone-900 text-white text-sm hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {copiedMessage ? (
                    <>
                      <Check className="w-4 h-4" strokeWidth={1.5} />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" strokeWidth={1.5} />
                      Copy Message
                    </>
                  )}
                </button>
              </div>

              {showMessageModal.instagram && (
                <a
                  href={`https://instagram.com/${showMessageModal.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 mt-3 px-4 py-2.5 border border-stone-200 text-sm hover:bg-stone-50 transition-colors w-full"
                >
                  <Instagram className="w-4 h-4" strokeWidth={1.5} />
                  Open @{showMessageModal.instagram} on Instagram
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="w-full max-w-md bg-white shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-stone-200">
              <h2 style={serifFont} className="text-xl">Import CSV</h2>
              <button onClick={() => setShowImport(false)} className="p-2 hover:bg-stone-100 transition-colors">
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-stone-500 mb-6">
                Upload a CSV file exported from Google Sheets. The importer will automatically map columns like Brand Name, Search, Store Link, Social Link, Contact Name, Location, Visual Quality, etc.
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                ref={fileInputRef}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-4 border-2 border-dashed border-stone-200 hover:border-stone-400 transition-colors flex flex-col items-center gap-2"
              >
                <Upload className="w-6 h-6 text-stone-400" strokeWidth={1.5} />
                <span className="text-sm text-stone-500">Click to select CSV file</span>
              </button>
              <p className="text-xs text-stone-400 mt-4">
                Tip: In Google Sheets, go to File → Download → Comma-separated values (.csv)
              </p>
              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 text-xs text-amber-700">
                <strong>Important:</strong> Make sure your CSV has a "Visual Quality" column with values like "poor", "amateur", or "inconsistent" for accurate ICP scoring. Also include US-based location data for best results.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LeadModal({ lead, onClose, onSave, serifFont }) {
  const [formData, setFormData] = useState(lead || {
    brandName: '',
    instagram: '',
    website: '',
    email: '',
    niche: '',
    followers: '',
    location: '',
    visualQuality: 'amateur',
    hasShopify: true,
    contactName: '',
    dateMessaged: '',
    firstMessageSent: false,
    replied: false,
    followUpSent: false,
    interested: false,
    status: 'Have Not Messaged',
    notes: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      followers: parseInt(formData.followers) || 0,
      visualQuality: (formData.visualQuality || 'amateur').toLowerCase()
    });
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Brand Name *</label>
              <input
                type="text"
                required
                value={formData.brandName}
                onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 text-sm focus:outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Contact Name</label>
              <input
                type="text"
                value={formData.contactName || ''}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 text-sm focus:outline-none focus:border-stone-900"
                placeholder="Founder name"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Niche</label>
              <select
                value={formData.niche || ''}
                onChange={(e) => setFormData({ ...formData, niche: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 bg-white"
              >
                <option value="">Select</option>
                {NICHES.map(niche => <option key={niche} value={niche}>{niche}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Instagram</label>
              <input
                type="text"
                value={formData.instagram || ''}
                onChange={(e) => setFormData({ ...formData, instagram: e.target.value.replace('@', '').replace('https://www.instagram.com/', '').replace('/', '') })}
                className="w-full px-3 py-2 border border-stone-200 text-sm focus:outline-none focus:border-stone-900"
                placeholder="handle"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Followers</label>
              <input
                type="number"
                value={formData.followers || ''}
                onChange={(e) => setFormData({ ...formData, followers: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 text-sm focus:outline-none focus:border-stone-900"
                placeholder="e.g. 15000"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Website</label>
              <input
                type="text"
                value={formData.website || ''}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 text-sm focus:outline-none focus:border-stone-900"
                placeholder="https://"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 text-sm focus:outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Location (US only)</label>
              <input
                type="text"
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 text-sm focus:outline-none focus:border-stone-900"
                placeholder="City, State or USA"
              />
            </div>
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Visual Quality</label>
              <select
                value={formData.visualQuality || 'amateur'}
                onChange={(e) => setFormData({ ...formData, visualQuality: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 bg-white"
              >
                <option value="poor">Poor (highest priority)</option>
                <option value="amateur">Amateur</option>
                <option value="inconsistent">Inconsistent</option>
                <option value="good">Good (lowest priority)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Status</label>
              <select
                value={formData.status || 'Have Not Messaged'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 bg-white"
              >
                {STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Date Messaged</label>
              <input
                type="date"
                value={formData.dateMessaged || ''}
                onChange={(e) => setFormData({ ...formData, dateMessaged: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 text-sm focus:outline-none focus:border-stone-900"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-stone-500 uppercase tracking-wider mb-1">Notes</label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 text-sm focus:outline-none focus:border-stone-900 resize-none"
                rows={2}
              />
            </div>
            <div className="col-span-2 flex flex-wrap gap-4 pt-2">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.firstMessageSent || false}
                  onChange={(e) => setFormData({ ...formData, firstMessageSent: e.target.checked })}
                />
                First Message Sent
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.replied || false}
                  onChange={(e) => setFormData({ ...formData, replied: e.target.checked })}
                />
                Replied
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.followUpSent || false}
                  onChange={(e) => setFormData({ ...formData, followUpSent: e.target.checked })}
                />
                Follow-up Sent
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={formData.interested || false}
                  onChange={(e) => setFormData({ ...formData, interested: e.target.checked })}
                />
                Interested
              </label>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-stone-200 text-sm hover:bg-stone-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 px-4 py-2.5 bg-stone-900 text-white text-sm hover:bg-stone-800 transition-colors">{lead ? 'Save' : 'Add Lead'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
