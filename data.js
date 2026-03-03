//constants
const is_outdated = false;
const baseValue = {
    AsF32: 5.382527531318055e-41,
    AsHex: "0x960b",
    AsI32: 38411,
};

const offsets = {
    x: 82,
    y: 35,
    fov: 28
};

const leader_pos_adress = {
    x: 155829,
    y: 155824,
};

const camera_pos_adress = {
    x: 155810,
    y: 155806,
};

const CAMERA_X_INDEX = 155810;
const CAMERA_Y_INDEX = 155806;

//functions
const _buf = new ArrayBuffer(4);
const _i32 = new Int32Array(_buf);
const _u32 = new Uint32Array(_buf);
const _f32 = new Float32Array(_buf);

const K = -939524096; // 0xC8000000

const decodeFov = (x) => {
    x = x | 0;
    const v1 = (x << 8) | 0;
    const v2 = (x >>> 8) & 255;
    const xt = (x >>> 24) | 0;

    // B0 (pos 0): ((x_B1 + 68) ^ 94)
    const b0 = ((v2 + 68) ^ 94) & 255;
    // B1 (pos 8): ((x_B0 + (v1|v2)*66 - 11) ^ 34)
    const b1 = ((x + Math.imul(v1 | v2, 66) - 11) ^ 34) & 255;
    // B2 (pos 16): ((x_B3 + x*18 + 70) ^ 207)
    const b2 = ((xt + Math.imul(x, 18) + 70) ^ 207) & 255;
    // B3 (pos 24): (x_B2 + x_B3*0x3A - 0x41)
    const b3 = (v1 + Math.imul(xt, 973078528) - 1090519040) & -16777216;

    _i32[0] = (b0 | (b1 << 8) | (b2 << 16) | b3) ^ K;
    return _f32[0];
};

const encodeFov = (f) => {
    _f32[0] = f;
    const fb = _i32[0] ^ K;
    const B0 = fb & 255, B1 = (fb >>> 8) & 255, B2 = (fb >>> 16) & 255, B3 = (fb >>> 24) & 255;

    const x_B1 = ((B0 ^ 94) - 68) & 255;
    const x_B0 = ((B1 ^ 34) + 11 - Math.imul(x_B1, 66)) & 255;
    const x_B3 = ((B2 ^ 207) - 70 - Math.imul(x_B0, 18)) & 255;
    const x_B2 = (B3 + 0x41 - Math.imul(x_B3, 0x3A)) & 255;

    _u32[0] = (x_B0 | (x_B1 << 8) | (x_B2 << 16) | (x_B3 << 24));
    return _u32[0];
};

//share this with scripts
window.memoryData = {
    constants: {
        baseValue: baseValue,
        offsets: offsets,
    },
    adresses: {   
        leader_pos: leader_pos_adress,
        camera_pos: camera_pos_adress,
    },
    functions: {
        encoder: encodeFov,
        decoder: decodeFov,
    },
    status: is_outdated,
};