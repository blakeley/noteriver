<script lang="ts">
	import { useThrelte, useTask } from '@threlte/core';
	import { onMount } from 'svelte';
	import * as THREE from 'three';
	import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
	import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
	import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
	import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js';

	const { scene, renderer, camera, size, renderStage, autoRender } = useThrelte();

	const target = new THREE.WebGLRenderTarget(size.current.width, size.current.height, {
		type: THREE.HalfFloatType,
		format: THREE.RGBAFormat,
		colorSpace: THREE.SRGBColorSpace,
		samples: 8,
	});
	const composer = new EffectComposer(renderer, target);
	const bloomPass = new UnrealBloomPass(
		new THREE.Vector2(size.current.width, size.current.height),
		1, // strength
		1, // radius
		1, // threshold
	);

	onMount(() => {
		// Configure renderer
		renderer.outputColorSpace = THREE.SRGBColorSpace;
		renderer.toneMapping = THREE.ACESFilmicToneMapping;
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		// Setup composer with target
		composer.addPass(new RenderPass(scene, camera.current));

		// Add SMAA for anti-aliasing
		const smaaPass = new SMAAPass(size.current.width, size.current.height);
		composer.addPass(smaaPass);

		// Threshold is 1, nothing will glow by default
		composer.addPass(bloomPass);

		return () => {
			if (composer) composer.dispose();
			if (target) target.dispose();
		};
	});

	// Handle resize
	$effect(() => {
		if (composer && target && size) {
			target.setSize(size.current.width, size.current.height);
			composer.setSize(size.current.width, size.current.height);
		}
	});

	$effect(() => {
		const previousAutoRenderValue = autoRender.current;
		autoRender.set(false);
		return () => {
			autoRender.set(previousAutoRenderValue);
		};
	});

	// Render loop
	useTask(
		() => {
			if (!composer) return;
			composer.render();
		},
		{
			stage: renderStage,
			autoInvalidate: false,
		},
	);
</script>
