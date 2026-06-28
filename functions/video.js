export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('folder');

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

  // JANGAN ADA REFRESH/REDIRECT. Biarkan bot membaca halaman ini.
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="og:title" content="${data.name}" />
        <meta property="og:image" content="${data.thumbnail_url}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${data.name}" />
        <meta name="twitter:image" content="${data.thumbnail_url}" />
      </head>
      <body style="background:#000; color:#fff; text-align:center; padding-top:50px;">
        <h1>${data.name}</h1>
        <a href="/player.html?folder=${code}" style="color:white; font-size:20px;">Klik di sini untuk menonton</a>
      </body>
    </html>
  `, { headers: { 'Content-Type': 'text/html' } });
}
