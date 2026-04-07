const nodemailer = require("nodemailer");
require("dotenv").config();

const servers = [
  { host: "mail.naity.com", port: 465, secure: true },
  { host: "mail.naity.com", port: 587, secure: false },
  { host: "smtp.naity.com", port: 465, secure: true },
  { host: "smtp.naity.com", port: 587, secure: false },
  { host: "mail.naity.net", port: 465, secure: true },
  { host: "mail.naity.net", port: 587, secure: false },
];

async function testServer(config) {
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: "support@naity.com",
      pass: "XGqFQC0.tAX0",
    },
    tls: {
      rejectUnauthorized: false
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
  });

  try {
    console.log(`Testing ${config.host}:${config.port} (${config.secure ? 'SSL' : 'TLS'})...`);
    await transporter.verify();
    console.log(`✅ SUCCESS: ${config.host}:${config.port}\n`);
    return config;
  } catch (error) {
    console.log(`❌ FAILED: ${error.message}\n`);
    return null;
  }
}

async function findWorkingServer() {
  console.log("🔍 Testing SMTP servers for support@naity.com...\n");
  
  for (const server of servers) {
    const result = await testServer(server);
    if (result) {
      console.log("🎉 Found working configuration:");
      console.log(`   Host: ${result.host}`);
      console.log(`   Port: ${result.port}`);
      console.log(`   Secure: ${result.secure}`);
      return;
    }
  }
  
  console.log("❌ No working SMTP server found.");
  console.log("\n💡 Please verify:");
  console.log("   1. Email address: support@naity.com");
  console.log("   2. Password: XGqFQC0.tAX0");
  console.log("   3. Check with your hosting provider for correct SMTP settings");
}

findWorkingServer();
