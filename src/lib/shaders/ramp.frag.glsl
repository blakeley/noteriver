precision mediump float;

varying vec2 vUv;

vec3 ramp(float t) {
	return t <= .5 ? vec3(1. - t * 1.4, .2, 1.05) / t : vec3(.3 * (1. - t) * 2., .2, 1.05) / t;
}

void main() {
	vec3 color = ramp(vUv.y);
	color /= (1.50 + max(vec3(0), color));
	gl_FragColor = vec4(color, 1.0);
}
