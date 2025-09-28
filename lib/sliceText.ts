export const sliceText = (text: string, len: number) => {
    if (text?.length < len) {
        return text
    }
    return text ? text?.slice(0, len) + "..." : "loading..."
}