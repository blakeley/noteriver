import * as THREE from 'three';

// Heightmap parameters
const W = 1; // width (x)
const H = W * 7.5; // height (y)
const segX = 100; // grid density along x
const segY = 100; // grid density along y
const heightScale = 1.0;

function heightFn(x: number, y: number) {
	// Zero height only on the outer perimeter
	const eps = 1e-6;
	if (Math.abs(Math.abs(x) - W / 2) < eps || Math.abs(Math.abs(y) - H / 2) < eps) return 0;

	// ---- Base shape: front chamfer with nonzero offset ----
	const chamferDepth = H / 10;
	const frontEdge = -H / 2;
	const plateau = chamferDepth * heightScale;
	const baseOffset = (W / 5) * heightScale;

	const dyIn = y - frontEdge; // 0 at front edge, increases inward
	let h =
		dyIn < chamferDepth ? baseOffset + (plateau - baseOffset) * (dyIn / chamferDepth) : plateau;

	// ---- X-edge bevel as curved scale ----
	const BEVEL_WIDTH = W / 6;
	const dxToEdge = W / 2 - Math.abs(x);
	if (dxToEdge <= BEVEL_WIDTH) {
		const t = dxToEdge / BEVEL_WIDTH; // 0 at edge -> 1 at bevel limit
		const f = Math.pow(Math.max(0, 2 * t - t * t), 1 / 4); // "ball-like" easing
		h *= f;
	}

	const R = (W - BEVEL_WIDTH) / 2;
	const y0 = frontEdge + chamferDepth; // top of chamfer
	const ay = Math.abs(y - y0);
	if (ay <= R) {
		h -= R * Math.pow(R - ay, 2);
	}

	return h;
}

// Create and export the heightmap geometry
export const ebonyKeyGeometry = new THREE.PlaneGeometry(W, H, segX, segY); // XY plane, faces +Z
const pos = ebonyKeyGeometry.attributes.position;
if (!pos) throw new Error('No position');

for (let i = 0; i < pos.count; i++) {
	const x = pos.getX(i);
	const y = pos.getY(i);
	pos.setZ(i, heightFn(x, y));
}

pos.needsUpdate = true;
ebonyKeyGeometry.computeVertexNormals();
