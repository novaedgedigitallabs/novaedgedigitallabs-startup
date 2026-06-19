const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Usy8uq8cdwASVCgc@db.jkgmenrgdcdiszlcntta.supabase.co:5432/postgres'
});

async function run() {
  await client.connect();
  console.log("Connected to DB!");
  
  // Disable RLS temporarily for startups
  await client.query('ALTER TABLE startups DISABLE ROW LEVEL SECURITY;');
  console.log("Disabled RLS on startups table.");

  // Insert a dummy startup
  const result = await client.query(`
    INSERT INTO startups (slug, owner_github_username, name, tagline, description) 
    VALUES ('amitkumarraikwar', 'amitkumarraikwar', 'NovaEdge', 'Building cool tools', 'Awesome startup')
    ON CONFLICT (slug) DO UPDATE 
    SET name = EXCLUDED.name, tagline = EXCLUDED.tagline;
  `);
  console.log("Insert result:", result.rowCount);
  
  await client.end();
}
run().catch(console.error);
