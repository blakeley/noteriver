import fs from 'fs';

// Create a simple cube GLTF in JSON format
const gltf = {
	asset: {
		generator: 'Test Generator',
		version: '2.0'
	},
	scene: 0,
	scenes: [
		{
			nodes: [0]
		}
	],
	nodes: [
		{
			mesh: 0
		}
	],
	meshes: [
		{
			primitives: [
				{
					attributes: {
						POSITION: 0,
						NORMAL: 1
					},
					indices: 2
				}
			]
		}
	],
	buffers: [
		{
			byteLength: 240
		}
	],
	bufferViews: [
		{
			buffer: 0,
			byteOffset: 0,
			byteLength: 96,
			target: 34962
		},
		{
			buffer: 0,
			byteOffset: 96,
			byteLength: 96,
			target: 34962
		},
		{
			buffer: 0,
			byteOffset: 192,
			byteLength: 48,
			target: 34963
		}
	],
	accessors: [
		{
			bufferView: 0,
			byteOffset: 0,
			componentType: 5126,
			count: 8,
			type: 'VEC3',
			min: [-0.5, -0.5, -0.5],
			max: [0.5, 0.5, 0.5]
		},
		{
			bufferView: 1,
			byteOffset: 0,
			componentType: 5126,
			count: 8,
			type: 'VEC3'
		},
		{
			bufferView: 2,
			byteOffset: 0,
			componentType: 5123,
			count: 24,
			type: 'SCALAR'
		}
	]
};

// Cube vertices (8 corners)
const positions = new Float32Array([
	-0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5,
	0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5
]);

// Normals (same as positions for a cube)
const normals = new Float32Array([
	-0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5,
	0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5
]);

// Indices for cube faces (6 faces, 2 triangles each, 3 vertices per triangle)
const indices = new Uint16Array([
	0,
	1,
	2,
	2,
	3,
	0, // front
	4,
	5,
	6,
	6,
	7,
	4, // back
	0,
	4,
	7,
	7,
	3,
	0, // left
	1,
	5,
	6,
	6,
	2,
	1 // right
]);

// Create binary buffer
const bufferData = Buffer.concat([
	Buffer.from(positions.buffer),
	Buffer.from(normals.buffer),
	Buffer.from(indices.buffer)
]);

// Create GLB file
const jsonString = JSON.stringify(gltf);
const jsonBuffer = Buffer.from(jsonString);

// Pad JSON to 4-byte alignment
const jsonPadding = (4 - (jsonBuffer.length % 4)) % 4;
const paddedJsonBuffer = Buffer.concat([
	jsonBuffer,
	Buffer.alloc(jsonPadding, 0x20) // Space padding
]);

// GLB Header
const glbHeader = Buffer.alloc(12);
glbHeader.write('glTF', 0);
glbHeader.writeUInt32LE(2, 4); // version
glbHeader.writeUInt32LE(28 + paddedJsonBuffer.length + bufferData.length, 8); // total length

// JSON chunk header
const jsonChunkHeader = Buffer.alloc(8);
jsonChunkHeader.writeUInt32LE(paddedJsonBuffer.length, 0);
jsonChunkHeader.write('JSON', 4);

// Binary chunk header
const binChunkHeader = Buffer.alloc(8);
binChunkHeader.writeUInt32LE(bufferData.length, 0);
binChunkHeader.write('BIN\0', 4);

// Combine all parts
const glb = Buffer.concat([
	glbHeader,
	jsonChunkHeader,
	paddedJsonBuffer,
	binChunkHeader,
	bufferData
]);

// Write to file
fs.writeFileSync('/Users/brandonblakeley/noteriver/static/models/TestCube.glb', glb);
console.log('Created TestCube.glb');
