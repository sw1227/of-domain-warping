uniform vec2 u_resolution; // (width,height)
uniform vec2 u_imageSize; // Image pixels (width, height)
uniform float u_time; // [sec]
uniform sampler2DRect u_image; // Texture image

// Constants for domain warping
const int octaves = 1;
const float persistence = 0.5;
const float PI = 3.141592653589793;


// Functions for domain warping
vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
    return mod289(((x * 34.0) + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    const float n_ = 1.0 / 7.0;
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float onoise(vec3 v) {
    float sum = 0.0;
    float frequency = 1.0;
    float amplitude = 1.0;
    float max = 0.0;
    for (int i = 0; i < octaves; i++) {
        sum += snoise(v * frequency) * amplitude;
        max += amplitude;
        amplitude *= persistence;
        frequency *= 2.0;
    }
    return sum / max;
}



// Use this function instead of setting GL_MIRRORED_REPEAT
vec2 mirror(vec2 coord, vec2 size) {
    // Mirror texture at x=size.x and y=size.y
    float x = coord.x;
    if (x > size.x) {
        x = 2.0 * size.x - x;
    }
    float y = coord.y;
    if (y > size.y) {
        y = 2.0 * size.y - y;
    }
    // Mirror texture at x=0 and y=0 with abs()
    return vec2(abs(x), abs(y));
}


void main() {
    // Normalize to [0, 1]
    vec2 st = gl_FragCoord.xy / u_resolution;
    // Upside down
    st = vec2(st.x, 1.0 - st.y);
    // Scale to the size of texture image
    vec2 texCoord = st * u_imageSize;

    // Domain warping
    float time = 2.0 * u_time + sin(2.0 * u_time);
    float x = onoise(vec3(st + vec2(0.0, 0.0), time / 8.0));
    float y = onoise(vec3(st + vec2(5.2, 1.3), time / 8.0));
    vec2 warped =  st + vec2(x, y) * 0.1;
    gl_FragColor = texture2DRect(u_image, mirror(u_imageSize * warped, u_imageSize));
}
