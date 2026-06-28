export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('folder');
  
  // Gambar default jika di database kosong
  const defaultThumbnail = "https://i.postimg.cc/FHsYYGQc/Picsart-25-10-07-22-08-19-311.jpg";

  if (!code) return new Response("Kode tidak ditemukan", { status: 400 });

  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/videos_list?access_code=eq.${code}&select=*`, {
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  
  const results = await response.json();
  const data = results[0];

  if (!data) return new Response("Video tidak ditemukan", { status: 404 });

  const finalThumbnail = data.thumbnail_url || defaultThumbnail;

  return new Response(`
    <!DOCTYPE html>
    <html lang="id">
      <head>
        <meta charset="UTF-8">
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${data.name}" />
        <meta name="twitter:description" content="Klik untuk menonton video sekarang." />
        <meta name="twitter:image" content="${finalThumbnail}" />
        
        <meta property="og:title" content="${data.name}" />
        <meta property="og:image" content="${finalThumbnail}" />
        
        <meta http-equiv="refresh" content="2; url=/player.html?folder=${code}" />
      </head>
      <body style="background:#000; color:#fff; text-align:center; padding-top:100px; font-family:sans-serif;">
        <h1>${data.name}</h1>
        <p>Mengarahkan ke pemutar video...</p>
      </body>
    </html>
  `, { headers: { 'Content-Type': 'text/html' } });
}
