
export interface JwtPayload {
    id: string;
    role: string;
    [key: string]: any;
}

/**
 * Decodes a JWT and returns its payload.
 * Fallbacks to a basic base64 decode if Buffer is not available,
 * but typical React Native environments can use a polyfill or plain js decoding.
 */
export function decodeJwt(token: string): JwtPayload | null {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token format');
        }

        let base64Url = parts[1];
        // Convert Base64Url to Base64
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        // Pad the base64 string
        const pad = base64.length % 4;
        if (pad) {
            base64 += '='.repeat(4 - pad);
        }

        // Standard base64 decoding function for React Native JS environment
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let str = '';
        let i = 0;

        while (i < base64.length) {
            const enc1 = chars.indexOf(base64.charAt(i++));
            const enc2 = chars.indexOf(base64.charAt(i++));
            const enc3 = chars.indexOf(base64.charAt(i++));
            const enc4 = chars.indexOf(base64.charAt(i++));

            const chr1 = (enc1 << 2) | (enc2 >> 4);
            const chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            const chr3 = ((enc3 & 3) << 6) | enc4;

            str += String.fromCharCode(chr1);
            if (enc3 !== 64) str += String.fromCharCode(chr2);
            if (enc4 !== 64) str += String.fromCharCode(chr3);
        }

        // Handle UTF-8 decoding
        const decodedString = decodeURIComponent(escape(str));
        return JSON.parse(decodedString) as JwtPayload;
    } catch (e) {
        console.error('Failed to decode JWT', e);
        return null;
    }
}
