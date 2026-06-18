#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const os = require('os');
const prompts = require('prompts');
const { Octokit } = require('@octokit/rest');

const program = new Command();
const CONFIG_PATH = path.join(os.homedir(), '.startuprc');

// Helper to get config
function getConfig() {
  if (fs.existsSync(CONFIG_PATH)) {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  }
  return {};
}

// Helper to save config
function saveConfig(config) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

program
  .name('startup')
  .description('CLI to manage your developer-first Startup Network profile')
  .version('1.0.0');

program
  .command('login')
  .description('Authenticate with GitHub using Web OAuth or Personal Access Token')
  .option('--pat', 'Use Personal Access Token instead of Web OAuth')
  .action(async (options) => {
    if (options.pat) {
      console.log('To authenticate, you need a GitHub Personal Access Token (classic) with "repo" scope.');
      console.log('Generate one here: https://github.com/settings/tokens/new?scopes=repo&description=Startup+Network+CLI\\n');

      const response = await prompts({
        type: 'password',
        name: 'token',
        message: 'Enter your GitHub Personal Access Token:'
      });

      if (!response.token) {
        console.log('Login cancelled.');
        return;
      }

      const octokit = new Octokit({ auth: response.token });
      
      try {
        const { data } = await octokit.rest.users.getAuthenticated();
        const config = getConfig();
        config.token = response.token;
        config.username = data.login;
        saveConfig(config);
        
        console.log(`\\n✅ Successfully authenticated as @${data.login}!`);
      } catch (error) {
        console.error('\\n❌ Authentication failed. Please check your token and try again.');
      }
      return;
    }

    // Web OAuth Flow
    console.log('Opening browser for GitHub authentication...');
    const http = require('http');
    
    const server = http.createServer(async (req, res) => {
      const url = new URL(req.url, 'http://localhost:13337');
      if (url.pathname === '/callback') {
        const token = url.searchParams.get('token');
        if (token) {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end('<h1>Authentication successful!</h1><p>You can close this window and return to the CLI.</p>');
          
          const octokit = new Octokit({ auth: token });
          try {
            const { data } = await octokit.rest.users.getAuthenticated();
            const config = getConfig();
            config.token = token;
            config.username = data.login;
            saveConfig(config);
            
            console.log(`\\n✅ Successfully authenticated via Web OAuth as @${data.login}!`);
          } catch (error) {
            console.error('\\n❌ Authentication failed. Could not verify token.');
          }
          
          server.close();
          process.exit(0);
        } else {
          res.writeHead(400, { 'Content-Type': 'text/plain' });
          res.end('Authentication failed: No token received.');
          server.close();
          process.exit(1);
        }
      }
    });
    
    server.listen(13337, async () => {
      const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';
      const loginUrl = `${backendUrl}/api/auth/cli/login`;
      
      try {
        const { default: open } = await import('open');
        await open(loginUrl);
      } catch (err) {
        console.log(`Please open this URL in your browser:\\n${loginUrl}`);
      }
    });
  });

program
  .command('init')
  .description('Generate startup.yml and README.md templates')
  .option('--auto', 'Auto-populate fields by scanning project')
  .action((options) => {
    console.log('Initializing startup profile...');
    const cwd = process.cwd();
    const yamlPath = path.join(cwd, 'startup.yml');
    const readmePath = path.join(cwd, 'README.md');

    let name = path.basename(cwd);
    let tech = [];

    if (options.auto) {
      console.log('Auto-detecting project info...');
      const pkgPath = path.join(cwd, 'package.json');
      if (fs.existsSync(pkgPath)) {
        try {
          const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
          if (pkg.name) name = pkg.name;
          if (pkg.dependencies) {
            if (pkg.dependencies['react'] || pkg.dependencies['next']) tech.push('React');
            if (pkg.dependencies['next']) tech.push('Next.js');
            if (pkg.dependencies['express']) tech.push('Express');
            if (pkg.dependencies['mongoose'] || pkg.dependencies['mongodb']) tech.push('MongoDB');
            if (pkg.dependencies['pg'] || pkg.dependencies['sequelize']) tech.push('PostgreSQL');
          }
        } catch (err) {
          console.error('Error reading package.json', err);
        }
      }
      const reqPath = path.join(cwd, 'requirements.txt');
      if (fs.existsSync(reqPath)) {
        tech.push('Python');
      }
    }

    if (tech.length === 0) tech = ['Node.js']; // Default

    const yamlContent = `name: ${name}
tagline: "Your catchy tagline here"
status: building
looking_for:
  - beta-users
  - contributors
tech:
${tech.map(t => `  - ${t}`).join('\\n')}
links:
  github: "username/${name}"
  website: "https://yourwebsite.com"
description: >
  Write a short summary of your startup here.
logo: "https://via.placeholder.com/150"
`;

    if (!fs.existsSync(yamlPath)) {
      fs.writeFileSync(yamlPath, yamlContent);
      console.log('✅ Created startup.yml');
    } else {
      console.log('⚠️ startup.yml already exists. Skipping.');
    }

    const readmeContent = `# ${name} 🚀

Write a detailed description of your startup here.

**Updates:**
- *${new Date().toISOString().split('T')[0]}*: Started building.
`;

    if (!fs.existsSync(readmePath)) {
      fs.writeFileSync(readmePath, readmeContent);
      console.log('✅ Created README.md template');
    } else {
      console.log('⚠️ README.md already exists. Skipping.');
    }

    console.log('\nInitialization complete! Edit startup.yml and run `startup push` when ready.');
  });

program
  .command('push')
  .description('Commit and push local startup.yml to your GitHub repo')
  .option('--local', 'Trigger local webhook for development')
  .action(async (options) => {
    const config = getConfig();
    if (!config.token || !config.username) {
      console.log('⚠️ You are not logged in. Please run `startup login` first.');
      return;
    }

    const octokit = new Octokit({ auth: config.token });
    const repoName = 'startup-profile'; // Hardcoded for MVP, could be configurable
    
    console.log(`Pushing to GitHub (@${config.username}/${repoName})...`);

    const cwd = process.cwd();
    const filesToSync = ['startup.yml', 'README.md'];
    
    // Check if repo exists, create if not
    try {
      await octokit.rest.repos.get({
        owner: config.username,
        repo: repoName
      });
    } catch (err) {
      if (err.status === 404) {
        console.log(`Repo ${repoName} not found. Creating it...`);
        try {
          await octokit.rest.repos.createForAuthenticatedUser({
            name: repoName,
            description: 'My Developer Startup Network Profile',
            private: false,
            auto_init: true
          });
          console.log(`✅ Created repository: https://github.com/${config.username}/${repoName}`);
          // Wait briefly for GitHub repo init
          await new Promise(r => setTimeout(r, 2000));
        } catch (createErr) {
          console.error('❌ Failed to create repository:', createErr.message);
          return;
        }
      } else {
        console.error('❌ Error checking repository:', err.message);
        return;
      }
    }

    // Process files
    for (const fileName of filesToSync) {
      const filePath = path.join(cwd, fileName);
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️ File ${fileName} not found locally, skipping.`);
        continue;
      }

      const content = fs.readFileSync(filePath, 'utf8');
      const contentEncoded = Buffer.from(content).toString('base64');
      
      let sha = null;
      try {
        // Get existing file SHA if it exists
        const { data: fileData } = await octokit.rest.repos.getContent({
          owner: config.username,
          repo: repoName,
          path: fileName,
        });
        sha = fileData.sha;
      } catch (err) {
        // File does not exist yet, which is fine
      }

      try {
        await octokit.rest.repos.createOrUpdateFileContents({
          owner: config.username,
          repo: repoName,
          path: fileName,
          message: `Update ${fileName} via Startup CLI`,
          content: contentEncoded,
          sha: sha || undefined
        });
        console.log(`✅ Successfully pushed ${fileName}`);
      } catch (err) {
        console.error(`❌ Failed to push ${fileName}:`, err.message);
      }
    }

    console.log('\n🚀 Profile sync complete! We will trigger a backend webhook to update the network.');

    // 5. Webhook Trigger
    if (options.local) {
      console.log('🔄 Triggering local webhook for development...');
      try {
        const crypto = require('crypto');
        const payload = JSON.stringify({
          ref: 'refs/heads/main',
          repository: { name: repoName, owner: { login: config.username } },
          commits: [{
            added: [],
            modified: ['startup.yml']
          }]
        });
        
        const hmac = crypto.createHmac('sha256', 'my-secret');
        const signature = 'sha256=' + hmac.update(payload).digest('hex');
        
        const res = await fetch('http://localhost:4000/api/webhook/github', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-github-event': 'push',
            'x-hub-signature-256': signature
          },
          body: payload
        });
        
        if (res.ok) {
          console.log('✅ Local webhook triggered successfully!');
        } else {
          console.error('❌ Local webhook failed:', await res.text());
        }
      } catch (err) {
        console.error('❌ Could not trigger local webhook:', err.message);
      }
    } else {
      // Attempt to configure webhook on GitHub
      try {
        const { data: hooks } = await octokit.rest.repos.listWebhooks({
          owner: config.username,
          repo: repoName
        });
        
        const webhookUrl = config.webhookUrl || 'https://api.github-startup.com/webhook/github';
        const hookExists = hooks.some(h => h.config.url === webhookUrl);
        
        if (!hookExists) {
          console.log('🔄 Configuring GitHub Webhook...');
          await octokit.rest.repos.createWebhook({
            owner: config.username,
            repo: repoName,
            name: 'web',
            active: true,
            events: ['push'],
            config: {
              url: webhookUrl,
              content_type: 'json',
              secret: config.webhookSecret || 'my-secret'
            }
          });
          console.log('✅ Webhook configured on GitHub.');
        }
      } catch (err) {
        console.log('⚠️ Could not configure webhook on GitHub automatically. (Is it already set?)');
      }
    }
  });

program
  .command('status')
  .description('Show current authenticated user and profile config status')
  .action(() => {
    const config = getConfig();
    if (config.username) {
      console.log(`Logged in as: @${config.username}`);
    } else {
      console.log('Not logged in.');
    }
    
    if (fs.existsSync(path.join(process.cwd(), 'startup.yml'))) {
      console.log('startup.yml: Present');
    } else {
      console.log('startup.yml: Missing');
    }
  });

program.parse(process.argv);
