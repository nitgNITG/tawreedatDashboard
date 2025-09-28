const mlang = (text: string, lang: 'en' | 'ar'): string => {
    if (!text) return '';
    
    try {
        const langPattern = new RegExp(`\\{mlang ${lang}\\}(.*?)\\{mlang\\}`);
        const match = text.match(langPattern);
        return match ? match[1] : text;
    } catch (error) {
        console.error('Error parsing multilingual text:', error);
        return text;
    }
};

export default mlang;