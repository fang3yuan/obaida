export default async function handler(req, res) {
  const username = "fpg.x"; // اكتب اسم حسابك هنا عادي
  
  // يقرأ الـ sessionid من متغيرات البيئة المخفية
  const sessionId = process.env.IG_SESSION_ID || ""; 

  try {
    const response = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'X-IG-App-ID': '936619743392459',
        'Cookie': sessionId ? `sessionid=${sessionId};` : ''
      }
    });

    if (!response.ok) throw new Error("Blocked or Not Found");

    const data = await response.json();
    const profilePicUrl = data.data.user.profile_pic_url_hd || data.data.user.profile_pic_url;

    // كاش لمدة 24 ساعة لعدم استهلاك الطلبات وحماية الحساب
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200');
    
    res.redirect(302, profilePicUrl);
  } catch (error) {
    res.redirect(302, 'https://ui-avatars.com/api/?name=' + username);
  }
}
