const std = @import("std");

// Echo bytes into caller-provided buffer. Returns bytes written (0 = failure).
export fn echo_bytes(in_ptr: [*]const u8, in_len: u32, out_ptr: [*]u8, out_cap: u32) u32 {
    if (out_cap < in_len) return 0;
    @memcpy(out_ptr[0..in_len], in_ptr[0..in_len]);
    return in_len;
}

// Log a message. level: 0=info,1=warn,2=error
export fn native_log(level: u32, msg_ptr: [*]const u8, msg_len: u32) void {
    const level_str = switch (level) {
        2 => "ERROR",
        1 => "WARN",
        else => "INFO",
    };
    const msg = msg_ptr[0..msg_len];
    std.debug.print("[from zig.{s}] {s}\n", .{ level_str, msg });
}
