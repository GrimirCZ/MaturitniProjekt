export const nofunc = () => {
}

/**
 * AssemblyScript loader constants
 */
const SIZE_OFFSET = -4;
const CHUNKSIZE = 1024;

/**
 * Get string out of WebAssembly memory
 *
 * @remark
 * Copied from AssemblyScript loader project
 *
 * @param buffer - Buffer where string is stored
 * @param ptr - Pointer to the string
 */
export function _getStr(buffer: ArrayBuffer, ptr: number): string {
    const U32 = new Uint32Array(buffer);
    const U16 = new Uint16Array(buffer);
    let length = U32[(ptr + SIZE_OFFSET) >>> 2] >>> 1;
    let offset = ptr >>> 1;
    if(length <= CHUNKSIZE) { // @ts-ignore
        return String.fromCharCode.apply(String, U16.subarray(offset, offset + length));
    }
    const parts = [];
    do {
        const last = U16[offset + CHUNKSIZE - 1];
        const size = last >= 0xD800 && last < 0xDC00 ? CHUNKSIZE - 1 : CHUNKSIZE;
        // @ts-ignore
        parts.push(String.fromCharCode.apply(String, U16.subarray(offset, offset += size)));
        length -= size;
    } while(length > CHUNKSIZE);
    // @ts-ignore
    return parts.join("") + String.fromCharCode.apply(String, U16.subarray(offset, offset + length));
}
