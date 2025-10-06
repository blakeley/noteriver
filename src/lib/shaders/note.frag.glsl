#define TAU 6.28318530718
#define MAX_ITER 5

uniform float uWidth;
uniform float uHeight;
uniform vec3 uBottomColor;
uniform vec3 uTopColor;
uniform float uBorderBlend;
uniform float uBorderRadius;
uniform float uBorderWidth;
uniform float uTime;
varying vec2 vUv;

// Rounded rectangle SDF
float sdRoundedBox(vec2 p, vec2 b, float r) {
	vec2 d = abs(p) - b + r;
	return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
}

// Water caustic effect
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
	// Convert UV to pixel coordinates
	vec2 pixelCoord = vUv * vec2(uWidth, uHeight);

	// Center coordinates for SDF
	vec2 centerCoord = pixelCoord - vec2(uWidth, uHeight) * 0.5;

	// Calculate SDF distance (negative inside, positive outside)
	vec2 halfSize = vec2(uWidth, uHeight) * 0.5;
	float sdfDist = sdRoundedBox(centerCoord, halfSize, uBorderRadius);

	// Discard pixels outside the rounded rectangle
	if (sdfDist > 0.0) {
		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
		return;
	}

	// Distance to border (absolute value of negative SDF)
	float distToBorder = -sdfDist;

	// Define colors
	vec3 white = vec3(1.0, 1.0, 1.0);

	// Gradient from bottom to top
	vec3 gradientFill = mix(uBottomColor, uTopColor, vUv.y);

	// Apply water caustic effect in pixel space
	float time = uTime * 0.5 + 23.0;
	vec2 pixelPos = vUv * vec2(uWidth, uHeight);
	// Normalize by the larger dimension to preserve aspect ratio
	float maxDim = max(uWidth, uHeight);
	vec2 uv = pixelPos / maxDim;
	vec3 causticIntensity = waterCaustic(uv, time);

	// Add caustic to gradient
	vec3 causticColor = gradientFill * (1.0 + causticIntensity / 3.0);

	// If within border width pixels of the border, blend gradient with white
	vec3 color = distToBorder <= uBorderWidth ? mix(causticColor, white, uBorderBlend) : causticColor;

	gl_FragColor = vec4(color, 1.0);
}
