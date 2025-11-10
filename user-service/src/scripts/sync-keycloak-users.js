require('dotenv').config();
const axios = require('axios');
const db = require('../models');
const logger = require('../utils/logger');

// Keycloak admin client
const keycloakAdminClient = axios.create({
  baseURL: `${process.env.KEYCLOAK_URL}/admin/realms/${process.env.KEYCLOAK_REALM}`,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Get admin access token
const getAdminToken = async () => {
  try {
    const response = await axios.post(
      `${process.env.KEYCLOAK_URL}/realms/master/protocol/openid-connect/token`,
      new URLSearchParams({
        username: process.env.KEYCLOAK_ADMIN_USERNAME,
        password: process.env.KEYCLOAK_ADMIN_PASSWORD,
        grant_type: 'password',
        client_id: 'admin-cli'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    return response.data.access_token;
  } catch (error) {
    logger.error('Failed to get admin token:', error.response?.data || error.message);
    throw new Error('Failed to authenticate with Keycloak');
  }
};

async function syncKeycloakUsers() {
  try {
    console.log('🔄 Starting Keycloak users sync...\n');

    // Get admin token
    const adminToken = await getAdminToken();
    keycloakAdminClient.defaults.headers.common['Authorization'] = `Bearer ${adminToken}`;

    // Get all users from Keycloak
    const keycloakResponse = await keycloakAdminClient.get('/users');
    const keycloakUsers = keycloakResponse.data;
    console.log(`✅ Found ${keycloakUsers.length} users in Keycloak\n`);

    // Get all users from database
    const dbUsers = await db.User.findAll({
      attributes: ['keycloak_id', 'username', 'email']
    });
    const dbKeycloakIds = new Set(dbUsers.map(u => u.keycloak_id));
    console.log(`✅ Found ${dbUsers.length} users in database\n`);

    // Find missing users
    const missingUsers = keycloakUsers.filter(ku => !dbKeycloakIds.has(ku.id));
    
    if (missingUsers.length === 0) {
      console.log('✅ All Keycloak users are already in the database. No sync needed.\n');
      return;
    }

    console.log(`⚠️  Found ${missingUsers.length} users in Keycloak that are missing from database:\n`);
    missingUsers.forEach(u => {
      console.log(`   - ${u.username} (${u.email})`);
    });
    console.log('');

    // Sync each missing user
    let syncedCount = 0;
    let failedCount = 0;

    for (const keycloakUser of missingUsers) {
      try {
        // Fetch roles for this user
        const rolesResponse = await keycloakAdminClient.get(
          `/users/${keycloakUser.id}/role-mappings/realm`
        );
        const roles = rolesResponse.data.map(role => role.name).filter(r => 
          ['customer', 'seller', 'admin'].includes(r)
        );

        // Create user in database
        const newUser = await db.User.create({
          keycloak_id: keycloakUser.id,
          username: keycloakUser.username,
          email: keycloakUser.email,
          is_active: keycloakUser.enabled
        });

        // Create user profile
        await db.UserProfile.create({
          user_id: newUser.id,
          first_name: keycloakUser.firstName || '',
          last_name: keycloakUser.lastName || '',
          phone: '',
          date_of_birth: null,
          gender: null,
          avatar_url: null
        });

        console.log(`✅ Synced: ${keycloakUser.username} (${keycloakUser.email}) - Roles: [${roles.join(', ')}]`);
        syncedCount++;

      } catch (error) {
        console.error(`❌ Failed to sync ${keycloakUser.username}:`, error.message);
        failedCount++;
      }
    }

    console.log('\n📊 Sync Summary:');
    console.log(`   ✅ Successfully synced: ${syncedCount}`);
    console.log(`   ❌ Failed: ${failedCount}`);
    console.log(`   📈 Total users in database: ${dbUsers.length + syncedCount}`);
    console.log('\n✅ Sync completed!\n');

  } catch (error) {
    console.error('❌ Sync failed:', error.message);
    console.error(error);
  } finally {
    process.exit(0);
  }
}

// Run the sync
syncKeycloakUsers();
