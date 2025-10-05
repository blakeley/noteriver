#define TAU 6.28318530718
#define MAX_ITER 5

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColor;
varying vec2 vUv;

vec3 waterCaustic(vec2 uv, float time) {
	vec2 p = mod(uv * TAU, TAU) - 250.0;
	vec2 i = vec2(p);
	float c = 1.0;
	float inten = .005;

	for(int n = 0; n < MAX_ITER; n++) {
		float t = time * (1.0 - (3.5 / float(n + 1)));
		i = p + vec2(cos(t - i.x) + sin(t + i.y), sin(t - i.y) + cos(t + i.x));
		c += 1.0 / length(vec2(p.x / (sin(i.x + t) / inten), p.y / (cos(i.y + t) / inten)));
	}

	c /= float(MAX_ITER);
	c = 1.17 - pow(c, 1.4);
	return vec3(pow(abs(c), 8.0));
}

void main() {
	float time = uTime * 0.5 + 23.0;
	// uv should be the 0-1 uv of texture...
	vec2 fragCoord = vUv * uResolution;
	vec2 uv = fragCoord.xy / uResolution.xy;

	vec3 intensity = waterCaustic(uv, time);
	vec3 outColor = clamp(uColor * (1. + intensity / 2.), 0.0, 1.0);

	gl_FragColor = vec4(outColor, 1.0);
}
