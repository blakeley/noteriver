uniform vec3 uColor;
uniform float uTime;
uniform float uScale;
varying vec2 vUv;

// Simplex 2D noise
vec3 permute(vec3 x) {
	return mod(((x * 34.0) + 1.0) * x, 289.0);
}

float snoise(vec2 v) {
	const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
	vec2 i = floor(v + dot(v, C.yy));
	vec2 x0 = v - i + dot(i, C.xx);
	vec2 i1;
	i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
	vec4 x12 = x0.xyxy + C.xxzz;
	x12.xy -= i1;
	i = mod(i, 289.0);
	vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
	vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
	m = m * m;
	m = m * m;
	vec3 x = 2.0 * fract(p * C.www) - 1.0;
	vec3 h = abs(x) - 0.5;
	vec3 ox = floor(x + 0.5);
	vec3 a0 = x - ox;
	m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
	vec3 g;
	g.x = a0.x * x0.x + h.x * x0.y;
	g.yz = a0.yz * x12.xz + h.yz * x12.yw;
	return 130.0 * dot(m, g);
}

// Curl noise - compute curl of noise field with time evolution
vec2 curl(vec2 p, float t) {
	const float e = 0.01;
	vec2 timeOffset = vec2(t * 0.1, t * 0.15);
	float n1 = snoise(p + vec2(0.0, e) + timeOffset);
	float n2 = snoise(p - vec2(0.0, e) + timeOffset);
	float n3 = snoise(p + vec2(e, 0.0) + timeOffset);
	float n4 = snoise(p - vec2(e, 0.0) + timeOffset);
	return normalize(vec2(n1 - n2, n3 - n4));
}

// Line Integral Convolution with time-evolving noise
float lic(vec2 uv, float t) {
	vec2 d = curl(uv, t);
	float sum = 0.0;
	float wsum = 0.0;
	const int STEPS = 18;
	const float H = 0.008;

	vec2 dir = d;
	for(int s = -STEPS; s <= STEPS; ++s) {
		vec2 ps = uv + dir * (float(s) * H);
		float w = 1.0 - abs(float(s)) / float(STEPS);
		vec2 noisePos = ps * 8.0 + vec2(t * 0.05);
		sum += w * (snoise(noisePos) * 0.5 + 0.5);
		wsum += w;
		dir = normalize(mix(dir, curl(ps, t), 0.4));
	}
	return sum / wsum;
}

void main() {
	vec2 uv = vUv * uScale;
	float streaks = lic(uv, uTime);
	vec3 col = uColor * streaks;
	gl_FragColor = vec4(col, 1.0);
}
