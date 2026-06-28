export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const code = url.searchParams.get('folder');

  // Mengambil data dari Supabase
  const response = await fetch(`${env.SUPABASE_URL}/rest/v1/videos_list?access_code=eq.${code}&select=*`, {
    headers: {
      'apikey': env.SUPABASE_KEY,
      'Authorization': `Bearer ${env.SUPABASE_KEY}`
    }
  });
  
  const results = await response.json();
  const data = results[0];

  if (!data) return new Response("Video tidak ditemukan", { status: 404 });

  // Mengembalikan HTML untuk Meta Tag (Penting untuk WhatsApp/Twitter)
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <meta property="og:title" content="${data.name}" />
        <meta property="og:image" content="${data.thumbnail_url}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta http-equiv="refresh" content="0; url=/player.html?folder=${code}" />
      </head>
      <body>Redirecting...</body>
    </html>
  `, { headers: { 'Content-Type': 'text/html' } });
}
