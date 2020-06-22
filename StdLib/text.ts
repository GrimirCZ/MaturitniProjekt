// @ts-nocheck

import { log, query_text_render, request_text_render } from "./sys";
import { JOB_STATUSES, JobStatus } from "./def";
import { color_t, Dimensions, IRenderable, Screen } from "./screen";

export class TextRenderer implements IRenderable {
    private _jobId: usize;
    private readonly _screen: Screen;

    private _loaded: boolean;

    public readonly width: u32;
    public readonly height: u32;
    public readonly text: string;

    private readonly font: string;
    private readonly size: string;


    constructor(text: string, width: u32, height: u32, font: string = "serif", size: string = "1em") {
        this._jobId = request_text_render(text, size + " " + font, width, height)

        this._screen = new Screen(u32(width), u32(height));

        this._loaded = false;

        this.width = width
        this.height = height

        this.text = text
        this.font = font
        this.size = size
    }

    getDimensions(): Dimensions {
        return new Dimensions(this.width, this.height);
    }

    getPixel(x: i32, y: i32): color_t | null {
        const pixel = this._screen.getPixel(x, y);

        if(pixel == null || pixel.a < 70) { // do not render transparent pixels
            return null
        }

        return pixel
    }

    isReadyToRender(): boolean {
        if(!this._loaded) { // if not loaded then try to load the rendered text
            const requestStatus = query_text_render(this._jobId, this._screen.getBufferPtr())

            if(requestStatus != JOB_STATUSES.COMPLETE) { // if not ready then return null
                if(requestStatus == JOB_STATUSES.DOES_NOT_EXIST || requestStatus == JOB_STATUSES.ERROR) // if does not exist or errored out then retry
                    this._jobId = request_text_render(this.text, this.font + " " + this.size, this.width, this.height)

                return false
            }

            this._loaded = true
        }

        return true
    }

}
