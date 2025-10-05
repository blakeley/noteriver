precision mediump float;

uniform float uTime;
varying vec2 vUv;

#define M_PI 3.1415926535897932384626433832795
#define M_TWO_PI (2.0 * M_PI)

float rand(vec2 n) {
	return fract(sin(dot(n, vec2(12.9898, 12.1414))) * 83758.5453);
}

float noise(vec2 n) {
	const vec2 d = vec2(0.0, 1.0);
	vec2 b = floor(n);
	vec2 f = smoothstep(vec2(0.0), vec2(1.0), fract(n));
	return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

vec3 ramp(float t) {
	return t <= .5 ? vec3(1. - t * 1.4, .2, 1.05) / t : vec3(.3 * (1. - t) * 2., .2, 1.05) / t;
}

float fire(vec2 n) {
	return noise(n) + noise(n * 2.1) * .6 + noise(n * 5.4) * .42;
}

float shade(vec2 uv, float t) {
	uv.x += uv.y < .5 ? 23.0 + t * .035 : -11.0 + t * .03;
	uv.y = abs(uv.y - .5) * 10.;
	uv.x *= 35.0;
	float q = fire(uv - t * .013) / 2.0;
	vec2 r = vec2(fire(uv + q / 2.0 + t - uv.x - uv.y), fire(uv + q - t));
	return pow((r.y + r.y) * max(.0, uv.y) + .1, 4.0);
}

vec3 color(float grad) {
	grad = sqrt(grad);
	vec3 col = vec3(1.0 / (pow(vec3(0.5, 0.0, .1) + 2.61, vec3(2.0))));
	vec3 color2 = col;
	col = ramp(grad);
	col /= (1.15 + max(vec3(0), col));
	return col;
}

void main() {
	float t = uTime;
	vec2 uv = vUv;
	uv.y += 0.5;
	float ff = 1.0 - uv.y;
	vec2 uv2 = uv;
	uv2.y = 1.0 - uv2.y;

	vec3 c1 = color(shade(uv, t)) * ff;
	vec3 c2 = color(shade(uv2, t)) * (1.0 - ff);

	vec3 col = c1 + c2;
	float brightness = (col.r + col.g + col.b) / 3.0;

	gl_FragColor = vec4(col, brightness);
}
