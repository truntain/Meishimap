async function testGeocode(address) {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=vn`;
    console.log(`Querying: "${address}"`);
    const res = await fetch(url, {
      headers: { 
        'Accept-Language': 'vi',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
      }
    });
    if (!res.ok) {
      console.log(`HTTP Error: ${res.status}`);
      return null;
    }
    const data = await res.json();
    if (data && data.length > 0) {
      console.log(`Success: [${data[0].lat}, ${data[0].lon}] - ${data[0].display_name}`);
      return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    }
    console.log('No results found');
    return null;
  } catch (err) {
    console.error(`Fetch error: ${err.message}`);
    return null;
  }
}

async function run() {
  await testGeocode('12A Láng, Đống Đa, Hà Nội');
  await testGeocode('12A Đường Láng, Đống Đa, Hà Nội');
}

run();
