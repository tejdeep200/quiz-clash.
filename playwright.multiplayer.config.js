const {defineConfig}=require('@playwright/test');
module.exports=defineConfig({
  testDir:'tests/multiplayer', timeout:90000, workers:1,
  use:{baseURL:process.env.MULTIPLAYER_URL||'http://127.0.0.1:4321/',channel:process.env.CI?undefined:'msedge',headless:true},
  webServer:process.env.MULTIPLAYER_URL?undefined:{command:'node server.js',env:{PORT:'4321',DEFAULT_GAME:'multiplayer'},url:'http://127.0.0.1:4321/healthz',reuseExistingServer:false},
});
