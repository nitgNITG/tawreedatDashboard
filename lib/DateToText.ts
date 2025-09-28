export function DateToText(isoString: string, language: 'en' | 'ar' = 'en') {
    const date = new Date(isoString);

    // English weekday and month names
    const weekdaysEn = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthsEn = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Arabic weekday and month names
    const weekdaysAr = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const monthsAr = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    // Choose the correct arrays based on the language
    const weekdays = language === 'ar' ? weekdaysAr : weekdaysEn;
    const months = language === 'ar' ? monthsAr : monthsEn;

    const dayOfWeek = weekdays[date.getUTCDay()];
    const month = months[date.getUTCMonth()];
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();

    return `${dayOfWeek} ${month} ${day} ${year}`;
}