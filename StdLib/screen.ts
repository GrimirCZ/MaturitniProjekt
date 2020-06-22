// @ts-nocheck

import { fatal, log } from "./sys";

@unmanaged
export class color_t {
    r: u8
    g: u8
    b: u8
    a: u8
}

/**
 * Class representing a single color
 */
export class Color {
    constructor(public r: u8, public g: u8, public b: u8, public a: u8 = 0xff) {
    }
}

export class Dimensions {
    readonly width: i32;
    readonly height: i32;

    constructor(width: i32, height: i32) {
        this.width = width
        this.height = height
    }

}

/**
 * Premade colors
 */
export namespace Colors {
    export const red = new Color(0xff, 0, 0)
    export const green = new Color(0, 0xff, 0)
    export const blue = new Color(0, 0, 0xff)
}

export interface IRenderable {
    getDimensions(): Dimensions

    getPixel(x: i32, y: i32): color_t | null

    isReadyToRender(): boolean
}

/**
 * This class represents a video buffer
 */
export class Screen implements IRenderable {
    readonly buf: Uint32Array;

    readonly width: i32;
    readonly height: i32;

    /**
     * Constructs __Screen__ of dimensions
     *
     * @param width - dimensions
     * @param height - dimensions
     */
    constructor(width: i32, height: i32) {
        if(width < 0 || height < 0) {
            fatal("Cannot construct screen when height or width is smaller than zero")
        }

        this.width = width
        this.height = height

        this.buf = new Uint32Array(width * height);
    }

    /**
     * Get pointer to the backing video buffer
     *
     * @returns pointer to the backing array
     */
    @inline
    getBufferPtr(): usize {
        return changetype<usize>(this.buf.buffer)
    }

    /**
     * Get pixel at coordinates
     *
     * @param x - position
     * @param y - position
     *
     * @returns color_t or null if out of range
     */
    @inline
    getPixel(x: i32, y: i32): color_t | null {
        if(y < 0 || x < 0 || y > this.height || x > this.width) {
            return null
        }

        return changetype<color_t>(changetype<usize>(this.buf.buffer) + ((y * this.width + x) * 4))
    }

    /**
     * Set pixel at position to color
     *
     * @param x - position
     * @param y - position
     * @param r - color (red)
     * @param g - color (green)
     * @param b - color (blue)
     * @param a - color (alpha)
     */
    @inline
    writePixel(x: i32, y: i32, r: u8, g: u8, b: u8, a: u8 = 0xff): void {
        if(y < 0 || x < 0 || y >= this.height || x >= this.width) {
            return
        }

        let i = (y * this.width + x)

        this.buf[i] = u32(r)
            | (u32(g) << 8)
            | (u32(b) << 16)
            | (u32(a) << 24)
    }

    /**
     * Fills whole screen with one color
     *
     * @param r - color (red)
     * @param g - color (green)
     * @param b - color (blue)
     * @param a - color (alpha)
     */
    @inline
    fill(r: u8, g: u8, b: u8, a: u8 = 0xff): void {
        for(let x: i32 = 0; x < this.width; x++)
            for(let y: i32 = 0; y < this.height; y++)
                this.writePixel(x, y, r, g, b, a)
    }

    /**
     * Draw a line from start position to end position with color
     *
     * @param sx - start position
     * @param sy - start position
     * @param ex - end position
     * @param ey - end position
     * @param color - color
     *
     *
     * @licence
     * see end of the file or [license](https://github.com/OneLoneCoder/olcPixelGameEngine/blob/master/LICENCE.md)
     *
     * @remark
     * Adapted from [olcPixelGameEngine](https://github.com/OneLoneCoder/olcPixelGameEngine)
     */
    drawLine(sx: i32, sy: i32, ex: i32, ey: i32, color: Color): void {

        let x1: i32 = sx;
        let y1: i32 = sy;
        let x2: i32 = ex;
        let y2: i32 = ey;
        let x: i32;
        let y: i32;
        let dx: i32;
        let dy: i32;
        let dx1: i32;
        let dy1: i32;
        let px: i32;
        let py: i32;
        let xe: i32;
        let ye: i32;
        let i: i32;

        dx = x2 - x1;
        dy = y2 - y1;

        //straight lines idea by gurkanctn
        if(dx == 0) // Line is vertical
        {
            if(y2 < y1) {
                let temp = y1
                y1 = y2
                y2 = temp
            }
            for(y = y1; y <= y2; y++) this.writePixel(x1, y, color.r, color.g, color.b, color.a);
            return;
        }

        if(dy == 0) // Line is horizontal
        {
            if(x2 < x1) {
                let temp = x1
                x1 = x2
                x2 = temp
            }
            for(x = x1; x <= x2; x++) {
                this.writePixel(x, y1, color.r, color.g, color.b, color.a);
            }
            return;
        }

        // Line is Funk-aye
        dx1 = i32(Math.abs(dx)); // abs is not defined on integer types
        dy1 = i32(Math.abs(dy));
        px = 2 * dy1 - dx1;
        py = 2 * dx1 - dy1;
        if(dy1 <= dx1) {
            if(dx >= 0) {
                x = x1;
                y = y1;
                xe = x2;
            } else {
                x = x2;
                y = y2;
                xe = x1;
            }

            this.writePixel(x, y, color.r, color.g, color.b, color.a);

            for(i = 0; x < xe; i++) {
                x = x + 1;
                if(px < 0)
                    px = px + 2 * dy1;
                else {
                    if((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) y = y + 1; else y = y - 1;
                    px = px + 2 * (dy1 - dx1);
                }
                this.writePixel(x, y, color.r, color.g, color.b, color.a);
            }
        } else {
            if(dy >= 0) {
                x = x1;
                y = y1;
                ye = y2;
            } else {
                x = x2;
                y = y2;
                ye = y1;
            }

            this.writePixel(x, y, color.r, color.g, color.b, color.a);

            for(i = 0; y < ye; i++) {
                y = y + 1;
                if(py <= 0)
                    py = py + 2 * dx1;
                else {
                    if((dx < 0 && dy < 0) || (dx > 0 && dy > 0)) x = x + 1; else x = x - 1;
                    py = py + 2 * (dx1 - dy1);
                }
                this.writePixel(x, y, color.r, color.g, color.b, color.a);
            }
        }

    }

    /**
     * Draws circle at position(center) with radius of n pixels with color
     *
     * @param x - position
     * @param y - position
     * @param radius - radius in pixels
     * @param color - color
     *
     * @licence
     * see end of the file or [license](https://github.com/OneLoneCoder/olcPixelGameEngine/blob/master/LICENCE.md)
     *
     * @remark
     * Adapted from [olcPixelGameEngine](https://github.com/OneLoneCoder/olcPixelGameEngine)
     */
    fillCircle(x: i32, y: i32, radius: i32, color: Color): void {
        // Taken from wikipedia
        let x0: i32 = 0;
        let y0 = radius;
        let d = 3 - 2 * radius;
        if(radius == 0) return;

        while(y0 >= x0) {
            // Modified to draw scan-lines instead of edges
            this.drawLine(x - x0, y - y0, x + x0, y - y0, color);
            this.drawLine(x - y0, y - x0, x + y0, y - x0, color);
            this.drawLine(x - x0, y + y0, x + x0, y + y0, color);
            this.drawLine(x - y0, y + x0, x + y0, y + x0, color);
            if(d < 0) d += 4 * x0++ + 6;
            else d += 4 * (x0++ - y0--) + 10;
        }
    }

    /**
     * Draw a rectangle at position of dimension with color
     *
     * @param x - position
     * @param y - position
     * @param width - dimension
     * @param height - dimension
     * @param color - color
     */
    @inline
    fillRectangle(x: i32, y: i32, width: i32, height: i32, color: Color): void {
        for(let ix: i32 = x; ix < this.width && (ix - x) < width; ix++)
            for(let iy: i32 = y; iy < this.height && (iy - y) < height; iy++)
                this.writePixel(ix, iy, color.r, color.g, color.b, color.a)
    }

    /**
     * Render *an IRenderable object* at *destination position*
     *
     * @param src - an IRenderable object
     * @param dst_x - destination position
     * @param dst_y - destination position
     */
    render(src: IRenderable, dst_x: i32, dst_y: i32): void {
        if(!src.isReadyToRender()){// if renderable is not ready to be rendered then return
            return
        }

        const dimensions = src.getDimensions()

        for(let y = 0; y < dimensions.height; y++) {
            for(let x = 0; x < dimensions.width; x++) {
                const pixel = src.getPixel(x, y)

                if(pixel != null) {
                    this.writePixel(dst_x + x, dst_y + y, pixel.r, pixel.g, pixel.b, pixel.a)
                }
            }
        }
    }

    getDimensions(): Dimensions {
        return new Dimensions(this.width, this.height)
    }

    isReadyToRender(): boolean {
        return true;
    }
}

/**
 Copyright 2018, 2019, 2020 OneLoneCoder.com

 Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

 1. Redistributions or derivations of source code must retain the above copyright notice, this list of conditions and the following disclaimer.

 2. Redistributions or derivative works in binary form must reproduce the above copyright notice. This list of conditions and the following disclaimer must be reproduced in the documentation and/or other materials provided with the distribution.

 3. Neither the name of the copyright holder nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

 THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
 IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
 FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY
 WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 **/
