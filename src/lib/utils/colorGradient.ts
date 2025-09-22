import { formatHex, oklch, parse } from 'culori';

/**
 * Creates gradient colors for piano roll notes using perceptually uniform oklch color space
 * @param baseColor - The base hex color string (e.g., '#95B7DB')
 * @returns Object with lighter, base, and darker colors for the gradient
 */
export function createNoteGradientColors(baseColor: string) {
	// Parse the hex color and convert to oklch
	const color = oklch(parse(baseColor));

	if (!color) {
		// Fallback if color parsing fails
		return {
			lighter: baseColor,
			base: baseColor,
			darker: baseColor
		};
	}

	// Create perceptually uniform lightness adjustments
	// oklch lightness ranges from 0 (black) to 1 (white)
	const lighterColor = {
		...color,
		l: Math.min(1, color.l + 0.25) // Increase lightness by 25%
	};

	const darkerColor = {
		...color,
		l: Math.max(0, color.l - 0.18) // Decrease lightness by 18%
	};

	// Convert back to hex for canvas gradient
	return {
		lighter: formatHex(lighterColor) || baseColor,
		base: baseColor,
		darker: formatHex(darkerColor) || baseColor
	};
}

/**
 * Creates a horizontal gradient for canvas context
 * @param ctx - Canvas 2D rendering context
 * @param x - Starting x position
 * @param width - Width of the gradient
 * @param baseColor - The base hex color string
 * @returns CanvasGradient object
 */
export function createHorizontalGradient(
	ctx: CanvasRenderingContext2D,
	x: number,
	width: number,
	baseColor: string
): CanvasGradient {
	const gradient = ctx.createLinearGradient(x, 0, x + width, 0);
	const colors = createNoteGradientColors(baseColor);

	// Create smooth gradient with highlight on left, shadow on right
	gradient.addColorStop(0, colors.lighter);
	gradient.addColorStop(0.4, colors.base);
	gradient.addColorStop(1, colors.darker);

	return gradient;
}
