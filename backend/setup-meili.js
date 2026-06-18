const { Meilisearch } = require('meilisearch');
const dotenv = require('dotenv');

dotenv.config();

const meili = new Meilisearch({
  host: process.env.MEILISEARCH_HOST || 'http://127.0.0.1:7700',
  apiKey: process.env.MEILISEARCH_API_KEY || 'masterKey',
});

async function setupSearchIndex() {
  try {
    console.log('⏳ Setting up Meilisearch index...');

    // 1. Create index if it doesn't exist
    // Meilisearch will automatically create it when adding documents or settings,
    // but it's good practice to ensure the primary key is set if needed.
    // In our case, the ID is 'id' (from dbRecord.slug).
    
    // 2. Update Searchable Attributes
    // These are the attributes Meilisearch will search in. Order matters for relevance!
    await meili.index('startups').updateSearchableAttributes([
      'name',
      'tech_stack',
      'tagline',
      'looking_for',
      'owner_github_username',
      'description',
    ]);
    console.log('✅ Updated Searchable Attributes');

    // 3. Update Filterable Attributes
    // These are attributes you can use to filter results (e.g., filter="status = active")
    await meili.index('startups').updateFilterableAttributes([
      'status',
      'tech_stack',
      'looking_for',
    ]);
    console.log('✅ Updated Filterable Attributes');

    // 4. Update Sortable Attributes
    await meili.index('startups').updateSortableAttributes([
      'updated_at',
      'name'
    ]);
    console.log('✅ Updated Sortable Attributes');

    // 5. Update Typo Tolerance (Optional customization)
    await meili.index('startups').updateTypoTolerance({
      enabled: true,
      minWordSizeForTypos: {
        oneTypo: 4,
        twoTypos: 8,
      },
      disableOnAttributes: [],
    });
    console.log('✅ Updated Typo Tolerance');

    console.log('🎉 Meilisearch setup complete!');
  } catch (error) {
    console.error('❌ Error setting up Meilisearch:', error);
  }
}

setupSearchIndex();
