precision mediump float;

uniform float uTime;
uniform float uWidth;
uniform float uHeight;
uniform float uHeightPoints[10];
uniform int uHeightPointCount;
varying vec2 vUv;

float rand(vec2 n) {
	return fract(sin(dot(n, vec2(12.9898, 12.1414))) * 83758.5453);
}

float noise(vec2 n) {
	const vec2 d = vec2(0.0, 1.0);
	vec2 b = floor(n);
	vec2 f = mix(vec2(0.0), vec2(1.0), fract(n));
	return mix(mix(rand(b), rand(b + d.yx), f.x), mix(rand(b + d.xy), rand(b + d.yy), f.x), f.y);
}

vec3 ramp(float t) {
	return t <= .5 ? vec3(1. - t * 1.4, .2, 1.05) / t : vec3(.3 * (1. - t) * 2., .2, 1.05) / t;
}

float fire(vec2 n) {
	return noise(n) + noise(n * 2.1) * .6 + noise(n * 5.4) * .42;
}

void main() {
	float t = uTime;
	// Convert to pixel/world space to prevent stretching
	vec2 uv = vUv * vec2(uWidth, uHeight);
	uv.y += 0.5;

	// Make fire taller at multiple height points, smoothly transitioning +/- 0.05
	float maxTallness = 0.0;
	for(int i = 0; i < 10; i++) {
		if(i >= uHeightPointCount) break;
		float distFromPoint = abs(vUv.x - uHeightPoints[i]);
		float tallness = 1.0 - smoothstep(0.0, 0.05, distFromPoint);
		maxTallness = max(maxTallness, tallness);
	}
	float scale = mix(1.0, 0.1, maxTallness); // 1.0 normal, 0.1 for 10x taller

	float pivot = 0.5;
	uv.y = pivot + (uv.y - pivot) * scale;

	uv.x += uv.y < .5 ? 23.0 + t * .35 : -11.0 + t * .3;
	uv.y = abs(uv.y - .5);
	uv *= 5.0;

	float q = fire(uv - t * .013) / 2.0;
	vec2 r = vec2(fire(uv + q / 2.0 + t - uv.x - uv.y), fire(uv + q - t));
	vec3 color = vec3(1.0 / (pow(vec3(0.5, 0.0, .1) + 1.61, vec3(4.0))));

	float grad = pow((r.y + r.y) * max(.0, uv.y) + .1, 4.0);
	color = ramp(grad);
	color /= (2.50 + max(vec3(0), color));

	float brightness = (color.r + color.g + color.b) / 3.0;
	gl_FragColor = vec4(color, brightness);
}
