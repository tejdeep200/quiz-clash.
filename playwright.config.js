const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({testDir:'tests/browser',timeout:30000,workers:1,use:{baseURL:process.env.TEST_URL||'http://127.0.0.1:4317/',channel:process.env.CI?undefined:'msedge',headless:true},webServer:process.env.TEST_URL?undefined:{command:'node server.js',env:{PORT:'4317'},url:'http://127.0.0.1:4317',reuseExistingServer:false}});
