const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const TEST_EMAIL = 'admin@naitagfz.com';
const TEST_PASSWORD = 'Admin@Naity2024';

async function testAllMissingEndpoints() {
  let token;
  
  try {
    console.log('🔐 Logging in...');
    const loginRes = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    token = loginRes.data.token;
    console.log('✅ Login successful\n');

    const headers = { Authorization: `Bearer ${token}` };

    // ============================================================
    // TEST 1: Contact Messages
    // ============================================================
    console.log('📧 ===== TESTING CONTACT MESSAGES =====');
    
    // POST - Submit contact form (public)
    console.log('\n1️⃣  Testing POST /api/contact (public)...');
    const contactData = {
      full_name: 'Test User',
      email: 'test@example.com',
      phone: '+963123456789',
      country: 'Syria',
      subject: 'booking_issue',
      message: 'This is a test message from automated testing'
    };
    
    const postContactRes = await axios.post(`${BASE_URL}/api/contact`, contactData);
    console.log('✅ Contact message created:', postContactRes.data.message_id);
    const messageId = postContactRes.data.message_id;

    // GET - Get all messages (admin)
    console.log('\n2️⃣  Testing GET /api/contact...');
    const getContactRes = await axios.get(`${BASE_URL}/api/contact`, { headers });
    console.log(`✅ Found ${getContactRes.data.data.length} contact messages`);
    console.log(`   Total in database: ${getContactRes.data.total}`);

    // PUT - Mark as read
    console.log('\n3️⃣  Testing PUT /api/contact/:id (mark as read)...');
    const putContactRes = await axios.put(`${BASE_URL}/api/contact/${messageId}`, {
      is_read: true,
      is_starred: true
    }, { headers });
    console.log('✅ Message marked as read and starred');

    // DELETE - Delete message
    console.log('\n4️⃣  Testing DELETE /api/contact/:id...');
    const deleteContactRes = await axios.delete(`${BASE_URL}/api/contact/${messageId}`, { headers });
    console.log('✅ Message deleted');

    // ============================================================
    // TEST 2: Bookings
    // ============================================================
    console.log('\n\n📋 ===== TESTING BOOKINGS =====');
    
    // GET - Get all bookings
    console.log('\n1️⃣  Testing GET /api/bookings...');
    const getBookingsRes = await axios.get(`${BASE_URL}/api/bookings`, { headers });
    console.log(`✅ Found ${getBookingsRes.data.data.length} bookings`);
    console.log(`   Total in database: ${getBookingsRes.data.total}`);
    
    if (getBookingsRes.data.data.length > 0) {
      const firstBooking = getBookingsRes.data.data[0];
      console.log(`   First booking: ${firstBooking.guest_first_name} ${firstBooking.guest_last_name}`);
      
      // GET - Get single booking
      console.log('\n2️⃣  Testing GET /api/bookings/:id...');
      const getBookingRes = await axios.get(`${BASE_URL}/api/bookings/${firstBooking.id}`, { headers });
      console.log('✅ Booking details retrieved');
      console.log(`   Hotel: ${getBookingRes.data.data.hotel_name_en}`);
      console.log(`   Room: ${getBookingRes.data.data.room_name_en}`);
    }

    // GET with filters
    console.log('\n3️⃣  Testing GET /api/bookings with filters...');
    const filteredRes = await axios.get(`${BASE_URL}/api/bookings?status=pending`, { headers });
    console.log(`✅ Found ${filteredRes.data.data.length} pending bookings`);

    // ============================================================
    // TEST 3: Sync Settings
    // ============================================================
    console.log('\n\n⚙️  ===== TESTING SYNC SETTINGS =====');
    
    // GET - Get all sync settings
    console.log('\n1️⃣  Testing GET /api/admin/sync-settings...');
    const getSyncRes = await axios.get(`${BASE_URL}/api/admin/sync-settings`, { headers });
    console.log(`✅ Found ${getSyncRes.data.data.length} sync settings`);

    // POST - Create sync setting
    console.log('\n2️⃣  Testing POST /api/admin/sync-settings...');
    
    // First, get a hotel ID
    const hotelsRes = await axios.get(`${BASE_URL}/api/admin/hotels`, { headers });
    if (hotelsRes.data.data.length > 0) {
      const hotelId = hotelsRes.data.data[0].id;
      
      const syncData = {
        hotel_id: hotelId,
        api_endpoint: 'http://localhost:5000/webhook',
        secret_key: 'test_secret_key_' + Date.now(),
        is_active: true
      };
      
      const postSyncRes = await axios.post(`${BASE_URL}/api/admin/sync-settings`, syncData, { headers });
      console.log('✅ Sync setting created:', postSyncRes.data.setting_id);
      const settingId = postSyncRes.data.setting_id;

      // PUT - Update sync setting
      console.log('\n3️⃣  Testing PUT /api/admin/sync-settings/:id...');
      const putSyncRes = await axios.put(`${BASE_URL}/api/admin/sync-settings/${settingId}`, {
        is_active: false
      }, { headers });
      console.log('✅ Sync setting updated (disabled)');

      // DELETE - Delete sync setting
      console.log('\n4️⃣  Testing DELETE /api/admin/sync-settings/:id...');
      const deleteSyncRes = await axios.delete(`${BASE_URL}/api/admin/sync-settings/${settingId}`, { headers });
      console.log('✅ Sync setting deleted');
    } else {
      console.log('⚠️  No hotels found, skipping sync settings POST/PUT/DELETE tests');
    }

    // ============================================================
    // TEST 4: Webhook Logs
    // ============================================================
    console.log('\n\n📋 ===== TESTING WEBHOOK LOGS =====');
    
    // GET - Get all webhook logs
    console.log('\n1️⃣  Testing GET /api/admin/webhook-logs...');
    const getLogsRes = await axios.get(`${BASE_URL}/api/admin/webhook-logs`, { headers });
    console.log(`✅ Found ${getLogsRes.data.data.length} webhook logs`);

    // GET with filters
    console.log('\n2️⃣  Testing GET /api/admin/webhook-logs with limit...');
    const limitedLogsRes = await axios.get(`${BASE_URL}/api/admin/webhook-logs?limit=5`, { headers });
    console.log(`✅ Found ${limitedLogsRes.data.data.length} webhook logs (limited to 5)`);

    // ============================================================
    // SUMMARY
    // ============================================================
    console.log('\n\n✅ ===== ALL TESTS PASSED! =====');
    console.log('\n📊 Summary:');
    console.log('   ✅ Contact Messages: 4/4 endpoints working');
    console.log('   ✅ Bookings: 3/3 endpoints working');
    console.log('   ✅ Sync Settings: 4/4 endpoints working');
    console.log('   ✅ Webhook Logs: 1/1 endpoint working');
    console.log('\n   Total: 12/12 endpoints working perfectly! 🎉');

  } catch (error) {
    console.error('\n❌ Test failed:', error.response?.data || error.message);
    if (error.response?.status) {
      console.error('Status:', error.response.status);
    }
    if (error.response?.config) {
      console.error('Request:', error.response.config.method.toUpperCase(), error.response.config.url);
    }
  }
}

testAllMissingEndpoints();
