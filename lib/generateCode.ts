function generateCode(length: number) {
    const chars = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz';
    const numbers = '123456789';
    let code = '';
    const randomNumberIndex = Math.floor(Math.random() * numbers.length);
    code += numbers[randomNumberIndex];
    for (let i = 1; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * (chars.length + numbers.length));
        if (randomIndex < chars.length) {
            code += chars[randomIndex];
        } else {
            code += numbers[randomIndex - chars.length];
        }
    }
    code = code.split('').sort(() => Math.random() - 0.5).join('');
    return code;
}

export default generateCode;