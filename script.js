const si = require('systeminformation');
const crypto = require('crypto');

async function getHardwareFingerprint() {
  try {
    // Collect system identifiers
    // const osData = await si.osInfo();
    const cpuData = await si.cpu();
    const diskData = await si.diskLayout();
    const networkData = await si.networkInterfaces();

    // Create fingerprint source string
    const fingerprintSource = [
    //   osData.uuid,          // OS installation UUID
      cpuData.manufacturer,
      cpuData.brand,
      diskData[0].serialNum, // First disk serial
      networkData[0].mac     // First MAC address
    ].join('|');

    // Create SHA-256 hash
    return crypto.createHash('sha256')
      .update(fingerprintSource)
      .digest('hex');

  } catch (error) {
    console.error('Error generating fingerprint:', error);
    process.exit(1);
  }
}

// Usage
getHardwareFingerprint().then(fingerprint => {
  console.log('Hardware Fingerprint:', fingerprint);
});