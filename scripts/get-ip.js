const os = require('os');

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Pula interfaces internas e não-IPv4
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  
  return 'localhost';
}

const ip = getLocalIP();
console.log(`\n🌐 Seu IP local é: ${ip}`);
console.log(`📱 Configure a API URL como: http://${ip}:4000`);
console.log(`\n📝 Atualize o arquivo mobile/src/config/environment.ts:`);
console.log(`   apiUrl: 'http://${ip}:4000'`);
console.log(`\n🔧 E também atualize o CORS no backend (api-softsolutions/src/main.ts):`);
console.log(`   'http://${ip}:19000', // Expo mobile`);
console.log(`   'http://${ip}:19006', // Expo dev server`);
