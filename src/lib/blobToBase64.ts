/**
 * Converts a Blob object to a Base64-encoded string.
 *
 * @param {Blob} blob - The Blob object to convert.
 * @returns {Promise<string>} A promise that resolves to the Base64-encoded string representation of the Blob.
 */
export function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, _) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(blob)
    })
}