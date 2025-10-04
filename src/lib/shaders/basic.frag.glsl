uniform vec3 uColor;
varying vec2 vUv;

void main() {
	vec3 finalColor = uColor * (0.1 + 0.9 * vUv.y);
	gl_FragColor = vec4(finalColor, 1.0);
}
