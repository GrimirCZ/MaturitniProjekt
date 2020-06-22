// The entry file of your WebAssembly module.

import {
    get_keyboard_key_state,
    get_mouse_button_state,
    get_mouse_position,
    log,
    set_default_video_buffer,
    show_video_frame
} from "../../StdLib/sys";
import { Colors, Screen } from "../../StdLib/screen";
import { TextRenderer } from "../../StdLib/text";
import { KeyboardKeys, MouseButtons } from "../../StdLib/def";

const screen: Screen = new Screen(1600, 600);
let text: TextRenderer;

export function setup(): void {
    // text = new TextRenderer("hello there", 200, 100, "serif", "2em");

    set_default_video_buffer(screen.getBufferPtr(), screen.width, screen.height)
}

function randomTo256(): u8 {
    return u8(Math.random() * 1000 % 255)
}

let size: f64 = 50;

export function loop(elapsed: f64): boolean {
    screen.fill(0xf2, 0xf2, 0xf2)

    // screen.render(rect, 20, 20)

    // screen.fill(randomTo256(), randomTo256(), randomTo256(), randomTo256())
    // screen.fill(Colors.green.r, Colors.green.g, Colors.green.b)

    const pos = get_mouse_position();

    if(pos != null) {
        let color = Colors.blue;
        if(get_mouse_button_state(MouseButtons.Left))
            color = Colors.green;

        if(get_keyboard_key_state(KeyboardKeys.Spacebar) && size < 200) {
            size += 20 * elapsed;
        }
        if(get_keyboard_key_state(KeyboardKeys.Ctrl) && size > 10) {
            size -= 20 * elapsed;
        }

        screen.fillCircle(pos.x, pos.y, i32(size), color);
    }

    // screen.render(text, 0, 0)

    show_video_frame()

    return true;
}
