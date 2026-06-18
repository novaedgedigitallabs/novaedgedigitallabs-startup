const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const crypto = require('crypto');
const yaml = require('js-yaml');
const { createClient } = require('@supabase/supabase-js');
const { Meilisearch } = require('meilisearch');

dotenv.config();

// Init Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'public-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

// Init Meilisearch
const meili = new Meilisearch({
  host: process.env.MEILISEARCH_HOST || 'http://127.0.0.1:7700',
  apiKey: process.env.MEILISEARCH_API_KEY || 'masterKey',
});

const app = express();
const PORT = process.env.PORT || 4000;
const GITHUB_WEBHOOK_SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'my-secret';

app.use(cors());

// Capture raw body for GitHub signature verification
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  }
}));

// Basic health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Startup Network API is running' });
});

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || 'Ov23li4b7jC0vN0H0N1L'; // Replace with real Client ID
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'your_client_secret'; // Replace with real Client Secret

// CLI Auth Endpoints
app.get('/api/auth/cli/login', (req, res) => {
  const redirectUri = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo`;
  res.redirect(redirectUri);
});

app.get('/api/auth/cli/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send('No code provided');
  }
  
  try {
    const response = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code
      })
    });
    
    const data = await response.json();
    if (data.access_token) {
      // Redirect to CLI local server
      res.redirect(`http://localhost:13337/callback?token=${data.access_token}`);
    } else {
      res.status(400).json(data);
    }
  } catch (err) {
    console.error('OAuth Callback Error:', err);
    res.status(500).send('Authentication failed');
  }
});

// Mock Endpoints for MVP Web Auth
app.post('/api/auth/github', (req, res) => {
  res.json({ message: 'GitHub Web OAuth endpoint not implemented yet' });
});

app.get('/api/me', (req, res) => {
  res.json({ message: 'Current user profile endpoint not implemented yet' });
});

app.get('/api/startups', async (req, res) => {
  // Actually try to fetch from Supabase if we want
  const { data, error } = await supabase.from('startups').select('*').limit(20);
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  res.json({ startups: data || [] });
});

app.get('/api/search', async (req, res) => {
  const query = req.query.q || '';
  try {
    const searchRes = await meili.index('startups').search(query, { limit: 20 });
    res.json({ hits: searchRes.hits });
  } catch (err) {
    console.error('MeiliSearch error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/api/startups/:slug', async (req, res) => {
  const { data, error } = await supabase
    .from('startups')
    .select('*')
    .eq('slug', req.params.slug)
    .single();
    
  if (error || !data) {
    return res.status(404).json({ message: 'Profile not found' });
  }
  res.json(data);
});

// Community Features Endpoints

app.get('/api/startups/:slug/community', async (req, res) => {
  const { slug } = req.params;
  const { user_id } = req.query; // If provided, check if this user liked/bookmarked
  
  try {
    // Get total likes and bookmarks
    const { count: likesCount, error: likesError } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('startup_slug', slug);

    const { count: bookmarksCount, error: bookmarksError } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact', head: true })
      .eq('startup_slug', slug);

    let hasLiked = false;
    let hasBookmarked = false;

    if (user_id) {
      const { data: likeData } = await supabase.from('likes').select('id').eq('startup_slug', slug).eq('user_id', user_id).maybeSingle();
      const { data: bookmarkData } = await supabase.from('bookmarks').select('id').eq('startup_slug', slug).eq('user_id', user_id).maybeSingle();
      hasLiked = !!likeData;
      hasBookmarked = !!bookmarkData;
    }

    res.json({
      likes: likesCount || 0,
      bookmarks: bookmarksCount || 0,
      hasLiked,
      hasBookmarked
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch community data' });
  }
});

app.post('/api/startups/:slug/like', async (req, res) => {
  const { slug } = req.params;
  const { user_id } = req.body;
  
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });
  
  const { data: existing } = await supabase.from('likes').select('id').eq('startup_slug', slug).eq('user_id', user_id).maybeSingle();
  
  if (existing) {
    // Unlike
    await supabase.from('likes').delete().eq('id', existing.id);
    return res.json({ liked: false });
  } else {
    // Like
    await supabase.from('likes').insert({ startup_slug: slug, user_id });
    return res.json({ liked: true });
  }
});

app.post('/api/startups/:slug/bookmark', async (req, res) => {
  const { slug } = req.params;
  const { user_id } = req.body;
  
  if (!user_id) return res.status(400).json({ error: 'user_id is required' });
  
  const { data: existing } = await supabase.from('bookmarks').select('id').eq('startup_slug', slug).eq('user_id', user_id).maybeSingle();
  
  if (existing) {
    // Unbookmark
    await supabase.from('bookmarks').delete().eq('id', existing.id);
    return res.json({ bookmarked: false });
  } else {
    // Bookmark
    await supabase.from('bookmarks').insert({ startup_slug: slug, user_id });
    return res.json({ bookmarked: true });
  }
});

app.get('/api/startups/:slug/comments', async (req, res) => {
  const { slug } = req.params;
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('startup_slug', slug)
    .order('created_at', { ascending: false });
    
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json({ comments: data || [] });
});

app.post('/api/startups/:slug/comments', async (req, res) => {
  const { slug } = req.params;
  const { user_id, content } = req.body;
  
  if (!user_id || !content) return res.status(400).json({ error: 'user_id and content are required' });
  
  const { data, error } = await supabase
    .from('comments')
    .insert({ startup_slug: slug, user_id, content })
    .select('*')
    .single();
    
  if (error) {
    return res.status(500).json({ error: error.message });
  }
  
  res.json({ comment: data });
});

function verifyGitHubSignature(req) {
  const signature = req.headers['x-hub-signature-256'];
  if (!signature) return false;

  const hmac = crypto.createHmac('sha256', GITHUB_WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(req.rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

app.post('/api/webhook/github', async (req, res) => {
  // 1. Verify Signature
  if (!verifyGitHubSignature(req)) {
    return res.status(401).send('Unauthorized: Invalid GitHub signature');
  }

  const event = req.headers['x-github-event'];
  if (event !== 'push') {
    return res.status(200).send('Event ignored');
  }

  const payload = req.body;
  const repoName = payload.repository.name;
  const owner = payload.repository.owner.login;
  
  // We only care if startup.yml was added or modified
  const commits = payload.commits || [];
  let startupYmlChanged = false;

  for (const commit of commits) {
    if (
      commit.added.includes('startup.yml') ||
      commit.modified.includes('startup.yml')
    ) {
      startupYmlChanged = true;
      break;
    }
  }

  if (!startupYmlChanged) {
    return res.status(200).send('startup.yml not modified');
  }

  try {
    // Fetch the raw startup.yml from GitHub raw content URL
    const branch = payload.ref.split('/').pop();
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/${branch}/startup.yml`;
    const response = await fetch(rawUrl);
    
    if (!response.ok) {
      return res.status(404).send('startup.yml not found in repository');
    }

    const yamlText = await response.text();
    const startupData = yaml.load(yamlText);

    if (!startupData || !startupData.name) {
      return res.status(400).send('Invalid startup.yml: missing name');
    }

    // Format data for DB
    const dbRecord = {
      slug: owner, // We use the github username as the slug for their startup profile
      owner_github_username: owner,
      name: startupData.name,
      tagline: startupData.tagline,
      status: startupData.status,
      looking_for: startupData.looking_for || [],
      tech_stack: startupData.tech || [],
      links: startupData.links || {},
      description: startupData.description,
      logo_url: startupData.logo,
      updated_at: new Date().toISOString()
    };

    // Upsert into Supabase
    const { error: dbError } = await supabase
      .from('startups')
      .upsert(dbRecord, { onConflict: 'slug' });

    if (dbError) {
      console.error('Supabase Upsert Error:', dbError);
      return res.status(500).send('Database update failed');
    }

    // Upsert into Meilisearch
    await meili.index('startups').addDocuments([{ id: dbRecord.slug, ...dbRecord }]);

    console.log(`✅ Successfully processed webhook for @${owner}`);
    res.status(200).send('Success');
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
