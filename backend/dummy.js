const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const dbRecord = {
    slug: 'dummy-startup',
    owner_github_username: 'dummy-user',
    name: 'Dummy Startup',
    tagline: 'Just a test to see if frontend works',
    status: 'building',
    looking_for: ['feedback', 'users'],
    tech_stack: ['React', 'Supabase'],
    description: 'This is a test startup added directly to the database.',
    logo_url: 'https://github.com/github.png',
    updated_at: new Date().toISOString()
  };
  const { data, error } = await supabase.from('startups').insert([dbRecord]);
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Dummy inserted!');
  }
}
main();
