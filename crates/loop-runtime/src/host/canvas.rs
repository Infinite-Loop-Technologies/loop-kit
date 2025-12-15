// crates/loop-runtime/src/host/canvas.rs
//! Canvas interface implementation

use super::HostState;
use crate::loop_::kit::canvas::Host;
use crate::loop_::kit::types as wit_types;

impl Host for HostState {
    fn begin_frame(&mut self, clear_color: wit_types::Color) {
        let color = color_to_u32(&clear_color);
        self.canvas_buffer.fill(color);
    }

    fn fill_rect(&mut self, rect: wit_types::Rect, color: wit_types::Color) {
        let c = color_to_u32(&color);
        let x0 = rect.x.max(0.0) as u32;
        let y0 = rect.y.max(0.0) as u32;
        let x1 = ((rect.x + rect.width) as u32).min(self.canvas_width);
        let y1 = ((rect.y + rect.height) as u32).min(self.canvas_height);

        for y in y0..y1 {
            for x in x0..x1 {
                let idx = (y * self.canvas_width + x) as usize;
                if idx < self.canvas_buffer.len() {
                    self.canvas_buffer[idx] = blend(self.canvas_buffer[idx], c, color.a);
                }
            }
        }
    }

    fn stroke_rect(&mut self, rect: wit_types::Rect, color: wit_types::Color, line_width: f32) {
        let lw = line_width.max(1.0) as u32;

        // Top
        self.fill_rect(
            wit_types::Rect {
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: line_width,
            },
            color.clone(),
        );

        // Bottom
        self.fill_rect(
            wit_types::Rect {
                x: rect.x,
                y: rect.y + rect.height - line_width,
                width: rect.width,
                height: line_width,
            },
            color.clone(),
        );

        // Left
        self.fill_rect(
            wit_types::Rect {
                x: rect.x,
                y: rect.y,
                width: line_width,
                height: rect.height,
            },
            color.clone(),
        );

        // Right
        self.fill_rect(
            wit_types::Rect {
                x: rect.x + rect.width - line_width,
                y: rect.y,
                width: line_width,
                height: rect.height,
            },
            color,
        );
    }

    fn fill_circle(&mut self, cx: f32, cy: f32, radius: f32, color: wit_types::Color) {
        let c = color_to_u32(&color);
        let r = radius as i32;
        let cx = cx as i32;
        let cy = cy as i32;

        for dy in -r..=r {
            for dx in -r..=r {
                if dx * dx + dy * dy <= r * r {
                    let x = (cx + dx) as u32;
                    let y = (cy + dy) as u32;
                    if x < self.canvas_width && y < self.canvas_height {
                        let idx = (y * self.canvas_width + x) as usize;
                        if idx < self.canvas_buffer.len() {
                            self.canvas_buffer[idx] = blend(self.canvas_buffer[idx], c, color.a);
                        }
                    }
                }
            }
        }
    }

    fn draw_line(
        &mut self,
        x1: f32,
        y1: f32,
        x2: f32,
        y2: f32,
        color: wit_types::Color,
        width: f32,
    ) {
        let c = color_to_u32(&color);

        // Bresenham's line algorithm with thickness
        let dx = (x2 - x1).abs();
        let dy = (y2 - y1).abs();
        let sx = if x1 < x2 { 1.0 } else { -1.0 };
        let sy = if y1 < y2 { 1.0 } else { -1.0 };
        let mut err = dx - dy;
        let mut x = x1;
        let mut y = y1;

        let half_width = (width / 2.0).max(0.5);

        loop {
            // Draw a filled circle at each point for thickness
            for oy in -(half_width as i32)..=(half_width as i32) {
                for ox in -(half_width as i32)..=(half_width as i32) {
                    if (ox * ox + oy * oy) as f32 <= half_width * half_width {
                        let px = (x as i32 + ox) as u32;
                        let py = (y as i32 + oy) as u32;
                        if px < self.canvas_width && py < self.canvas_height {
                            let idx = (py * self.canvas_width + px) as usize;
                            if idx < self.canvas_buffer.len() {
                                self.canvas_buffer[idx] =
                                    blend(self.canvas_buffer[idx], c, color.a);
                            }
                        }
                    }
                }
            }

            if (x - x2).abs() < 0.5 && (y - y2).abs() < 0.5 {
                break;
            }

            let e2 = 2.0 * err;
            if e2 > -dy {
                err -= dy;
                x += sx;
            }
            if e2 < dx {
                err += dx;
                y += sy;
            }
        }
    }

    fn set_pixel(&mut self, x: u32, y: u32, color: wit_types::Color) {
        if x < self.canvas_width && y < self.canvas_height {
            let idx = (y * self.canvas_width + x) as usize;
            if idx < self.canvas_buffer.len() {
                self.canvas_buffer[idx] = color_to_u32(&color);
            }
        }
    }

    fn dimensions(&mut self) -> (u32, u32) {
        (self.canvas_width, self.canvas_height)
    }

    fn end_frame(&mut self) {
        // Frame presentation is handled by the runtime
    }
}

fn color_to_u32(c: &wit_types::Color) -> u32 {
    let r = (c.r.clamp(0.0, 1.0) * 255.0) as u32;
    let g = (c.g.clamp(0.0, 1.0) * 255.0) as u32;
    let b = (c.b.clamp(0.0, 1.0) * 255.0) as u32;
    // ARGB format for softbuffer
    0xFF000000 | (r << 16) | (g << 8) | b
}

fn blend(dst: u32, src: u32, alpha: f32) -> u32 {
    if alpha >= 1.0 {
        return src;
    }
    if alpha <= 0.0 {
        return dst;
    }

    let inv_alpha = 1.0 - alpha;

    let dr = ((dst >> 16) & 0xFF) as f32;
    let dg = ((dst >> 8) & 0xFF) as f32;
    let db = (dst & 0xFF) as f32;

    let sr = ((src >> 16) & 0xFF) as f32;
    let sg = ((src >> 8) & 0xFF) as f32;
    let sb = (src & 0xFF) as f32;

    let r = (sr * alpha + dr * inv_alpha) as u32;
    let g = (sg * alpha + dg * inv_alpha) as u32;
    let b = (sb * alpha + db * inv_alpha) as u32;

    0xFF000000 | (r << 16) | (g << 8) | b
}
