export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('folder');

  // 1. Validasi awal: Jika parameter 'folder' tidak ada
  if (!code) {
    return new Response("Kode video tidak ditemukan di URL.", { status: 400 });
  }

  try {
    // 2. Mengambil data dari Supabase
    const response = await fetch(`${env.SUPABASE_URL}/rest/v1/videos_list?access_code=eq.${code}&select=*`, {
      headers: {
        'apikey': env.SUPABASE_KEY,
        'Authorization': `Bearer ${env.SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) throw new Error("Gagal terhubung ke database");

    const results = await response.json();
    const data = results[0];

    // 3. Jika kode ada tapi data kosong
    if (!data) {
      return new Response("Video dengan kode tersebut tidak tersedia.", { status: 404 });
    }

    // 4. Return respon sukses (dengan Meta Tag & Redirect delay)
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta property="og:title" content="${data.name}" />
          <meta property="og:description" content="Klik untuk menonton video ini." />
          <meta property="og:image" content="${data.thumbnail_url}" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="${data.name}" />
          <meta name="twitter:image" content="${data.thumbnail_url}" />
          <meta http-equiv="refresh" content="3; url=/player.html?folder=${code}" />
        </head>
        <body style="background:#000; color:#fff; text-align:center; padding-top:50px; font-family:sans-serif;">
          <h1>Memuat: ${data.name}...</h1>
          <p>Mengarahkan ke pemutar video dalam 3 detik.</p>
          <a href="/player.html?folder=${code}" style="color:#00aaff;">Jika tidak otomatis, klik di sini</a>
        </body>
      </html>
    `, { 
      status: 200, 
      headers: { 'Content-Type': 'text/html' } 
    });

  } catch (err) {
    // 5. Penanganan jika terjadi error server
    return new Response(`Error: ${err.message}`, { status: 500 });
  }
}
