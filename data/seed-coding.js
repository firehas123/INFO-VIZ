// Coding question bank — StudOn-confirmed color/blend functions only (the earlier self-generated
// "seed" set was removed on request). Every starterCode block renders something into <div id="app">
// so the live preview always shows output. Each question also carries a `playground` config that
// drives an interactive slider/swatch comparison panel (model solution vs. your live code) in the UI —
// see coding.js for how it's consumed.
window.SEED_CODING = [

{ id: 'code-studon-01', module: 'm1', source: 'studon',
  title: 'Diverging color scale + hsv2hex (StudOn)',
  prompt: 'Implement <code>mapColor(u, hue_left, hue_right, c)</code>: a diverging HSV color scale that is white at <code>u=0.5</code> and reaches full saturation at the edges — <code>hue_left</code> for u&lt;0.5, <code>hue_right</code> for u&ge;0.5. The original StudOn snippet was also missing the final HSV&rarr;hex conversion, so implement <code>hsv2hex(h, s, v)</code> yourself (h in degrees 0-360, s/v in [0,1]) and have <code>mapColor</code> return its result.',
  starterCode:
`function mapColor(u, hue_left, hue_right, c) {
  // TODO: white at u=0.5 (s=0), full saturation at the edges (s=1);
  // hue = hue_left for u<0.5, hue_right for u>=0.5; finish by calling hsv2hex(...)
}

function hsv2hex(h, s, v) {
  // TODO: convert HSV (h in degrees 0-360, s/v in [0,1]) to a "#rrggbb" hex string
  // (this conversion was missing from the original StudOn snippet — you add it)
}

// --- demo: diverging scale, blue (left) -> white (middle) -> red (right) ---
const app = d3.select('#app');
const strip = app.append('div').style('display', 'flex');
for (let i = 0; i <= 20; i++) {
  const u = i / 20;
  strip.append('div').style('width', '16px').style('height', '40px')
    .style('background', mapColor(u, 240, 0, 0.15));
}
`,
  solutionCode:
`function mapColor(u, hue_left, hue_right, c) {
    const h = u < 0.5 ? hue_left : hue_right
    const s = Math.abs( u - 0.5 ) * 2
    const v = 1 - (1-c) * Math.abs( u - 0.5 ) * 2
    return hsv2hex( h, s, v )
}

function hsv2hex(h, s, v) {
    const c = v * s
    const x = c * (1 - Math.abs((h / 60) % 2 - 1))
    const m = v - c
    let r, g, b
    if (h < 60)       { r = c; g = x; b = 0 }
    else if (h < 120) { r = x; g = c; b = 0 }
    else if (h < 180) { r = 0; g = c; b = x }
    else if (h < 240) { r = 0; g = x; b = c }
    else if (h < 300) { r = x; g = 0; b = c }
    else              { r = c; g = 0; b = x }
    const toHex = n => Math.round((n + m) * 255).toString(16).padStart(2, '0')
    return '#' + toHex(r) + toHex(g) + toHex(b)
}`,
  hint: "white in the middle, color at the edges, pick left/right hue by side",
  notes: 's and v both scale with |u-0.5|*2, so they hit their extreme (s=1) at the edges and vanish (s=0, pure white/gray) at the midpoint; c sets how dark the extremes get via v.',
  playground: {
    fn: 'mapColor',
    params: [
      { key: 'u', label: 'u', type: 'range', min: 0, max: 1, step: 0.01, default: 0.3 },
      { key: 'hue_left', label: 'hue_left', type: 'range', min: 0, max: 360, step: 1, default: 240 },
      { key: 'hue_right', label: 'hue_right', type: 'range', min: 0, max: 360, step: 1, default: 0 },
      { key: 'c', label: 'c', type: 'range', min: 0, max: 1, step: 0.01, default: 0.15 },
    ],
    buildArgs: (v) => [v.u, v.hue_left, v.hue_right, v.c],
    toCss: 'hex',
  } },

{ id: 'code-studon-02', module: 'm1', source: 'studon',
  title: 'hexToRgb (StudOn)',
  prompt: 'Implement <code>hexToRgb(hexString)</code>: split a hex color string like <code>"#ff8000"</code> into its three 2-character channel substrings and convert each via <code>Number(\'0x\' + chunk)</code>, returning <code>[r, g, b]</code>.',
  starterCode:
`function hexToRgb(hexString) {
  // TODO: substring the 3 two-char chunks (skip the leading '#') and convert each with Number('0x' + chunk)
}

// --- demo ---
const samples = ['#ff8000', '#4f5bd5', '#1f9d55', '#000000', '#ffffff'];
const app = d3.select('#app');
samples.forEach(hex => {
  const rgb = hexToRgb(hex);
  app.append('div')
    .style('display', 'flex').style('align-items', 'center').style('gap', '8px').style('margin', '4px 0')
    .html(\`<div style="width:28px;height:28px;border:1px solid #999;background:\${hex}"></div><code>\${hex} -> [\${rgb}]</code>\`);
});
`,
  solutionCode:
`function hexToRgb(hexString) {
    const r = Number('0x' + hexString.substring(1, 3))
    const g = Number('0x' + hexString.substring(3, 5))
    const b = Number('0x' + hexString.substring(5, 7))
    return [r, g, b]
}`,
  hint: "hex color is 3 two-char chunks — substring + Number('0x'+chunk)",
  notes: 'Same result as unary-plus coercion (+("0x"+chunk)) — Number(...) is just the more explicit way to force the hex string to a number.',
  playground: {
    fn: 'hexToRgb',
    params: [
      { key: 'hexString', label: 'hex color', type: 'color', default: '#ff8000' },
    ],
    buildArgs: (v) => [v.hexString],
    toCss: 'rgbArray',
  } },

{ id: 'code-studon-03', module: 'm1', source: 'studon',
  title: 'colorscale — lookup-table interpolation (StudOn)',
  prompt: 'Implement <code>colorscale(colors, u, umin, umax)</code>: given an array of RGB stop colors, stretch <code>u</code> into a position across that array (after normalizing to [0, colors.length-1]), then blend the two nearest neighboring stops.',
  starterCode:
`function colorscale(colors, u, umin, umax) {
  // TODO: clamp at the ends, then find i0/i1 (the two bracketing stops) and blend with alpha "dt"
}

// --- demo: 5-stop scale rendered as a gradient strip ---
const stops = [[68,1,84],[59,82,139],[33,145,140],[94,201,98],[253,231,37]];
const app = d3.select('#app');
const strip = app.append('div').style('display', 'flex');
for (let i = 0; i <= 20; i++) {
  const u = i / 20;
  const rgb = colorscale(stops, u, 0, 1);
  strip.append('div').style('width', '16px').style('height', '40px')
    .style('background', \`rgb(\${rgb[0]},\${rgb[1]},\${rgb[2]})\`);
}
`,
  solutionCode:
`function colorscale(colors, u, umin, umax) {
    if (u >= umax) return colors[colors.length - 1]
    if (u <= umin) return colors[0]
    const alpha = (u - umin) / (umax - umin)
    const nrColors = colors.length
    const x = (nrColors - 1) * alpha
    const i0 = Math.floor(x)
    const i1 = i0 + 1
    const dt = x - i0
    const r = (1 - dt) * colors[i0][0] + dt * colors[i1][0]
    const g = (1 - dt) * colors[i0][1] + dt * colors[i1][1]
    const b = (1 - dt) * colors[i0][2] + dt * colors[i1][2]
    return [r, g, b]
}`,
  hint: "stretch u into an array position, then blend its two nearest neighbors",
  notes: 'x = (nrColors-1)*alpha is the fractional array index; i0/i1 are its floor/ceil, dt is the leftover fraction used to blend them.',
  playground: {
    fn: 'colorscale',
    params: [
      { key: 'u', label: 'u', type: 'range', min: 0, max: 1, step: 0.01, default: 0.5 },
    ],
    buildArgs: (v) => [[[68,1,84],[59,82,139],[33,145,140],[94,201,98],[253,231,37]], v.u, 0, 1],
    toCss: 'rgbArray',
  } },

{ id: 'code-studon-04', module: 'm1', source: 'studon',
  title: 'mapColor — linear RGB interpolation (StudOn)',
  prompt: 'Implement <code>mapColor(value, c_left, c_right)</code>: given two RGB color arrays (0-255 numbers) and <code>value</code> in [0,1], return the linearly-interpolated <code>[r, g, b]</code> array — the exact lerp formula from the question is <code>c = a·(1−t) + b·t</code>.',
  starterCode:
`function mapColor(value, c_left, c_right) {
  // TODO: lerp each channel between c_left and c_right by "value" (formula: c = a*(1-t) + b*t), return [r,g,b]
}

// --- demo: 10-step gradient strip (converts the returned array to a CSS color for display) ---
const app = d3.select('#app');
const strip = app.append('div').style('display', 'flex');
for (let i = 0; i <= 10; i++) {
  const v = i / 10;
  const rgb = mapColor(v, [255, 0, 0], [0, 0, 255]);
  strip.append('div').style('width', '24px').style('height', '40px')
    .style('background', \`rgb(\${Math.round(rgb[0])},\${Math.round(rgb[1])},\${Math.round(rgb[2])})\`);
}
`,
  solutionCode:
`function mapColor(value, c_left, c_right) {
    function lerp(a, b, t){
        return (1-t)*a + t*b
    }
    return [
        lerp(c_left[0], c_right[0], value),
        lerp(c_left[1], c_right[1], value),
        lerp(c_left[2], c_right[2], value)
    ]
}`,
  hint: "exact lerp formula from the question, applied per r/g/b channel",
  notes: 'lerp(a,b,t) = (1-t)*a + t*b, run independently on each of the r/g/b channels. The function returns the raw [r,g,b] array — it does not convert to a color string itself.',
  playground: {
    fn: 'mapColor',
    params: [
      { key: 'value', label: 'value', type: 'range', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'c_left', label: 'c_left', type: 'color', default: '#ff0000' },
      { key: 'c_right', label: 'c_right', type: 'color', default: '#0000ff' },
    ],
    buildArgs: (v) => [v.value, v.__c_left_rgb, v.__c_right_rgb],
    toCss: 'rgbArray',
  } },

{ id: 'code-studon-05', module: 'm1', source: 'studon',
  title: 'mapColor — rainbow scale (StudOn)',
  prompt: 'Implement <code>mapColor(u, maxHue)</code>: maps u in [0,1] to an HSV triple where only the hue moves (hue = u * maxHue), while saturation and value stay fixed at 0.8 and 0.9. Return <code>[h, s, v]</code> (the demo converts it to a color string for you).',
  starterCode:
`function hsv_to_color_string(h, s, v) {
  const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
  let [r,g,b] = h < 60 ? [c,x,0] : h < 120 ? [x,c,0] : h < 180 ? [0,c,x] : h < 240 ? [0,x,c] : h < 300 ? [x,0,c] : [c,0,x];
  return \`rgb(\${Math.round((r+m)*255)},\${Math.round((g+m)*255)},\${Math.round((b+m)*255)})\`;
}

function mapColor(u, maxHue) {
  // TODO: return [hue, saturation, value] where hue = u * maxHue and s/v stay fixed at 0.8 / 0.9
}

// --- demo ---
const app = d3.select('#app');
const strip = app.append('div').style('display', 'flex');
for (let i = 0; i <= 30; i++) {
  const u = i / 30;
  const [h, s, v] = mapColor(u, 360);
  strip.append('div').style('width', '12px').style('height', '40px')
    .style('background', hsv_to_color_string(h, s, v));
}
`,
  solutionCode:
`function mapColor( u, maxHue ){
    return [u * maxHue, 0.8, 0.9]
}`,
  hint: "only hue moves — s and v stay fixed, hue = u * maxHue",
  notes: 'The simplest of the color-scale family: a linear hue sweep at fixed saturation/value — which is also why plain rainbow scales are discouraged for ordered data (non-monotonic perceptual lightness).',
  playground: {
    fn: 'mapColor',
    params: [
      { key: 'u', label: 'u', type: 'range', min: 0, max: 1, step: 0.01, default: 0.5 },
      { key: 'maxHue', label: 'maxHue', type: 'range', min: 0, max: 360, step: 1, default: 360 },
    ],
    buildArgs: (v) => [v.u, v.maxHue],
    toCss: 'hsvArray',
  } },

{ id: 'code-studon-06', module: 'm1', source: 'studon',
  title: 'rgbToHex (StudOn)',
  prompt: 'Implement <code>rgbToHex(color)</code>, the inverse of hexToRgb: takes an array <code>[r, g, b]</code> (0-255 integers) and returns a hex string like <code>"#ff8000"</code>.',
  starterCode:
`function rgbToHex(color) {
  // TODO: convert each channel with toString(16), pad to 2 chars with padStart('0'), glue with '#'
}

// --- demo ---
const app = d3.select('#app');
[[255,128,0], [79,91,213], [0,0,0], [255,255,255]].forEach(c => {
  const hex = rgbToHex(c);
  app.append('div')
    .style('display', 'flex').style('align-items', 'center').style('gap', '8px').style('margin', '4px 0')
    .html(\`<div style="width:28px;height:28px;border:1px solid #999;background:\${hex}"></div><code>[\${c}] -> \${hex}</code>\`);
});
`,
  solutionCode:
`function rgbToHex(color) {
    const r = color[0].toString(16).padStart(2, '0')
    const g = color[1].toString(16).padStart(2, '0')
    const b = color[2].toString(16).padStart(2, '0')
    const hex = '#' + r + g + b
    return hex
}`,
  hint: "toString(16) + padStart(2,'0') per channel, glue with #",
  notes: 'toString(16) gives base-16 digits; padStart(2,\'0\') keeps single-digit values like "8" as "08".',
  playground: {
    fn: 'rgbToHex',
    params: [
      { key: 'r', label: 'r', type: 'range', min: 0, max: 255, step: 1, default: 255 },
      { key: 'g', label: 'g', type: 'range', min: 0, max: 255, step: 1, default: 128 },
      { key: 'b', label: 'b', type: 'range', min: 0, max: 255, step: 1, default: 0 },
    ],
    buildArgs: (v) => [[v.r, v.g, v.b]],
    toCss: 'hex',
  } },

];
