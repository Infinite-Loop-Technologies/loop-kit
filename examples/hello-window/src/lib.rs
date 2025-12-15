// // examples/hello-window/src/lib.rs
// //! Hello Window - Minimal loop-kit example

// wit_bindgen::generate!({
//     path: "../../../wit",
//     world: "loop:kit/app",
//     generate_all,
// });

#![allow(unused)]
fn main() {
    mod bindings {
        //! This module contains generated code for implementing
        //! the `adder` world in `wit/world.wit`.
        //!
        //! The `path` option is actually not required,
        //! as by default `wit_bindgen::generate` will look
        //! for a top-level `wit` directory and use the files
        //! (and interfaces/worlds) there-in.
        wit_bindgen::generate!({
            path: "wit/world.wit",
            world: "app",
            generate_all,
        });
    }
}

// export!(HelloWindow);

// struct HelloWindow;

// impl Guest for HelloWindow {
//     fn start() {
//         print("Hello Window starting!");
//         run();
//     }
// }

// fn run() {
//     // Create window
//     let canvas = surface::Surface::new(surface::CreateDesc {
//         width: Some(800),
//         height: Some(600),
//     });

//     // Set up graphics
//     let gfx = graphics_context::Context::new();
//     canvas.connect_graphics_context(&gfx);

//     let fb = frame_buffer::Device::new();
//     fb.connect_graphics_context(&gfx);

//     // Event subscriptions
//     let frame_poll = canvas.subscribe_frame();
//     let resize_poll = canvas.subscribe_resize();
//     let pointer_poll = canvas.subscribe_pointer_down();
//     let pollables = vec![&frame_poll, &resize_poll, &pointer_poll];

//     let mut width = canvas.width();
//     let mut height = canvas.height();
//     let mut click_x: i32 = 400;
//     let mut click_y: i32 = 300;
//     let mut frame: u64 = 0;

//     print(&format!("Window: {}x{}", width, height));

//     loop {
//         let ready = wasi::io::poll::poll(&pollables);

//         // Resize
//         if ready.contains(&1) {
//             if let Some(e) = canvas.get_resize() {
//                 width = e.width;
//                 height = e.height;
//                 print(&format!("Resize: {}x{}", width, height));
//             }
//         }

//         // Click - move the rectangle
//         if ready.contains(&2) {
//             if let Some(e) = canvas.get_pointer_down() {
//                 click_x = e.x as i32;
//                 click_y = e.y as i32;
//                 print(&format!("Click: ({}, {})", click_x, click_y));
//             }
//         }

//         // Frame
//         if ready.contains(&0) {
//             canvas.get_frame();
//             frame += 1;

//             let buf = gfx.get_current_buffer();
//             let fb_buf = frame_buffer::Buffer::from_graphics_buffer(buf);

//             // Render
//             let mut pixels = vec![0u32; (width * height) as usize];

//             // Background: dark blue gradient
//             for y in 0..height {
//                 for x in 0..width {
//                     let i = (y * width + x) as usize;
//                     let b = 40 + (y * 40 / height) as u8;
//                     pixels[i] = u32::from_be_bytes([0, 20, 30, b]);
//                 }
//             }

//             // Rectangle at click position
//             let rect_w = 100i32;
//             let rect_h = 80i32;
//             let rx = click_x - rect_w / 2;
//             let ry = click_y - rect_h / 2;

//             // Pulsing color
//             let pulse = ((frame as f32 * 0.1).sin() * 0.5 + 0.5) * 255.0;
//             let color = u32::from_be_bytes([0, 255, pulse as u8, 100]);

//             for dy in 0..rect_h {
//                 for dx in 0..rect_w {
//                     let x = rx + dx;
//                     let y = ry + dy;
//                     if x >= 0 && x < width as i32 && y >= 0 && y < height as i32 {
//                         let i = (y as u32 * width + x as u32) as usize;
//                         pixels[i] = color;
//                     }
//                 }
//             }

//             // Border
//             let border_color = 0x00FFFFFF_u32;
//             for dx in 0..rect_w {
//                 let x = rx + dx;
//                 if x >= 0 && x < width as i32 {
//                     if ry >= 0 && ry < height as i32 {
//                         pixels[(ry as u32 * width + x as u32) as usize] = border_color;
//                     }
//                     let by = ry + rect_h - 1;
//                     if by >= 0 && by < height as i32 {
//                         pixels[(by as u32 * width + x as u32) as usize] = border_color;
//                     }
//                 }
//             }
//             for dy in 0..rect_h {
//                 let y = ry + dy;
//                 if y >= 0 && y < height as i32 {
//                     if rx >= 0 && rx < width as i32 {
//                         pixels[(y as u32 * width + rx as u32) as usize] = border_color;
//                     }
//                     let bx = rx + rect_w - 1;
//                     if bx >= 0 && bx < width as i32 {
//                         pixels[(y as u32 * width + bx as u32) as usize] = border_color;
//                     }
//                 }
//             }

//             fb_buf.set(bytemuck::cast_slice(&pixels));
//             gfx.present();
//         }
//     }
// }
