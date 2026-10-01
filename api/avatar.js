export default async function handler(req, res) {
  // يمكنك أخذ اسم المستخدم من الرابط تلقائياً أو الاعتماد على fpg.x كافتراضي
  const username = req.query.username || "fpg.x"; 
  
  // يقرأ الـ sessionid من متغيرات البيئة في Vercel
  const sessionId = process.env.IG_SESSION_ID || ""; 

  try {
    // طلب البيانات من إنستغرام مع إرسال هيدرز مشابهة تماماً لمتصفح حقيقي
    const response = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'X-IG-App-ID': '936619743392459',
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': '*/*',
        'Cookie': sessionId ? `sessionid=${sessionId};` : ''
      }
    });

    if (!response.ok) {
      throw new Error(`Instagram API Error: ${response.status}`);
    }

    const data = await response.json();
    const user = data?.data?.user;

    if (!user) {
      throw new Error("User data not found");
    }

    // جلب رابط الصورة بجودة عالية
    const profilePicUrl = user.profile_pic_url_hd || user.profile_pic_url;

    // تفعيل الكاش في Vercel CDN لمدة 24 ساعة لعدم استهلاك الطلبات ولتجنب الحظر
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200');
    
    // إعادة التوجيه لرابط الصورة المباشر
    return res.redirect(302, profilePicUrl);

  } catch (error) {
    console.error("Error fetching Instagram profile pic:", error.message);
    // في حال حدوث أي خلل، يتم عرض صورة افتراضية بأسلوب لطيف
    return res.redirect(302, `https://ui-avatars.com/api/?name=${username}&background=random`);
  }
}
