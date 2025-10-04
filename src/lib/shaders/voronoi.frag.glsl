uniform vec3 uColor;
uniform float uCells;
uniform float uTime;
varying vec2 vUv;

vec2 random2(vec2 p) {
	return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453);
}

void main() {
	vec2 uv = vUv * uCells;
	vec2 iuv = floor(uv);
	vec2 fuv = fract(uv);

	float minDist = 1.0;

	for(int y = -1; y <= 1; y++) {
		for(int x = -1; x <= 1; x++) {
			vec2 neighbor = vec2(float(x), float(y));
			vec2 point = random2(iuv + neighbor);
			point = 0.5 + 0.5 * sin(uTime + 6.2831 * point);
			vec2 diff = neighbor + point - fuv;
			float dist = length(diff);
			minDist = min(minDist, dist);
		}
	}

	vec3 finalColor = uColor * minDist;
	gl_FragColor = vec4(finalColor, 1.0);
}
