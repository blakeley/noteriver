uniform float uWidth;
uniform float uHeight;
uniform vec3 uBottomColor;
uniform vec3 uTopColor;
uniform float uBorderBlend;
uniform float uBorderRadius;
uniform float uBorderWidth;
varying vec2 vUv;

// Rounded rectangle SDF
float sdRoundedBox(vec2 p, vec2 b, float r) {
	vec2 d = abs(p) - b + r;
	return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - r;
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

	// If within border width pixels of the border, blend gradient with white
	vec3 color = distToBorder <= uBorderWidth ? mix(gradientFill, white, uBorderBlend) : gradientFill;

	gl_FragColor = vec4(color, 1.0);
}
