// Seed coding questions, adapted from the course's own Codes/ D3-adjacent JS snippets.
// Every starterCode block renders something into <div id="app"> so the live preview always shows output.
window.SEED_CODING = [

{ id: 'code-m1-01', module: 'm1', source: 'seed',
  title: 'Hex to RGB',
  prompt: 'Implement <code>hexToRgb(hexString)</code> which takes a hex color string like <code>"#ff8000"</code> and returns an array <code>[r, g, b]</code> of integers 0-255. The demo below then renders a few swatches using your function.',
  starterCode:
`function hexToRgb(hexString) {
  // TODO: parse the 2-digit hex substrings for r, g, b and convert to integers
}

// --- demo: renders swatches using your function ---
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
  const r = '0x' + hexString.substring(1, 3)
  const g = '0x' + hexString.substring(3, 5)
  const b = '0x' + hexString.substring(5, 7)
  return [+r, +g, +b]
}`,
  notes: 'Substring positions 1-3, 3-5, 5-7 skip the leading "#". Prefixing with "0x" and unary-plus coerces the hex string to a number.' },

{ id: 'code-m1-02', module: 'm1', source: 'seed',
  title: 'RGB to Hex',
  prompt: 'Implement <code>rgbToHex(color)</code>, the inverse of hexToRgb: takes an array <code>[r, g, b]</code> (0-255 integers) and returns a hex string like <code>"#ff8000"</code>.',
  starterCode:
`function rgbToHex(color) {
  // TODO: convert each channel to a 2-digit hex string and concatenate with '#'
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
  notes: 'toString(16) gives base-16 digits; padStart(2,\'0\') keeps single-digit values like "8" as "08".' },

{ id: 'code-m1-03', module: 'm1', source: 'seed',
  title: 'Interpolated RGB colorscale (2-stop lerp)',
  prompt: 'Implement <code>mapColor(value, c_min, c_max)</code> which linearly interpolates between two RGB colors (arrays of 0-255 numbers) given <code>value</code> in [0,1], returning a CSS color string. A <code>rgb_vector_to_color_string</code> helper is already provided.',
  starterCode:
`function rgb_vector_to_color_string(vec) {
  return \`rgb(\${Math.round(vec[0])},\${Math.round(vec[1])},\${Math.round(vec[2])})\`;
}

function mapColor(value, c_min, c_max) {
  // TODO: lerp each channel between c_min and c_max by "value", then convert to a color string
}

// --- demo: renders a 10-step gradient strip ---
const app = d3.select('#app');
const strip = app.append('div').style('display', 'flex');
for (let i = 0; i <= 10; i++) {
  const v = i / 10;
  strip.append('div').style('width', '24px').style('height', '40px')
    .style('background', mapColor(v, [255, 0, 0], [0, 0, 255]));
}
`,
  solutionCode:
`function mapColor(value, c_min, c_max) {
  function lerp(a, b, t){
    return (1-t)*a + t*b
  }
  let vec = [lerp(c_min[0],c_max[0],value),
             lerp(c_min[1],c_max[1],value),
             lerp(c_min[2],c_max[2],value)]
  return rgb_vector_to_color_string( vec )
}`,
  notes: 'Standard linear interpolation lerp(a,b,t) = (1-t)*a + t*b applied independently per channel.' },

{ id: 'code-m1-04', module: 'm1', source: 'seed',
  title: 'Multi-stop interpolated colorscale',
  prompt: 'Implement <code>colorscale(colors, u, umin, umax)</code>: given an array of RGB stop colors, find which two adjacent stops <code>u</code> falls between (after normalizing to [0, colors.length-1]) and linearly blend between them. Clamp outside [umin, umax].',
  starterCode:
`function colorscale(colors, u, umin, umax) {
  // TODO: clamp at the ends, then find i0/i1 (the two bracketing stops) and blend with alpha "dt"
}

// --- demo: 5-stop scale rendered as a gradient strip ---
const stops = [[68,1,84],[59,82,139],[33,145,140],[94,201,98],[253,231,37]]; // viridis-ish
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
  notes: 'alpha maps u into [0, colors.length-1]; i0/i1 are the bracketing stop indices, dt is the local blend fraction between them.' },

{ id: 'code-m1-05', module: 'm1', source: 'seed',
  title: 'HSV interpolated colorscale',
  prompt: 'Implement <code>mapColor(u, hue_min, hue_max, c)</code>: for u &lt; 0.5 use hue_min, otherwise hue_max; saturation and value both depend on distance from the u=0.5 midpoint (so the scale is darkest/most saturated at the extremes). A <code>hsv_to_color_string</code> helper (h in degrees, s/v in [0,1]) is provided.',
  starterCode:
`function hsv_to_color_string(h, s, v) {
  const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
  let [r,g,b] = h < 60 ? [c,x,0] : h < 120 ? [x,c,0] : h < 180 ? [0,c,x] : h < 240 ? [0,x,c] : h < 300 ? [x,0,c] : [c,0,x];
  return \`rgb(\${Math.round((r+m)*255)},\${Math.round((g+m)*255)},\${Math.round((b+m)*255)})\`;
}

function mapColor(u, hue_min, hue_max, c) {
  // TODO: pick hue by which half of [0,1] u falls in; derive s and v from |u - 0.5|
}

// --- demo ---
const app = d3.select('#app');
const strip = app.append('div').style('display', 'flex');
for (let i = 0; i <= 20; i++) {
  const u = i / 20;
  strip.append('div').style('width', '16px').style('height', '40px')
    .style('background', mapColor(u, 0, 240, 0.2));
}
`,
  solutionCode:
`function mapColor(u, hue_min, hue_max, c) {
  const h = u < 0.5 ? hue_min : hue_max
  const s = Math.abs( u - 0.5 ) * 2
  const v = 1 - (1-c) * Math.abs( u - 0.5 ) * 2
  return hsv_to_color_string( h, s, v )
}`,
  notes: 'Note s and v both scale with |u-0.5|*2, so they reach their extreme at u=0 or u=1 and are neutral (s=0) at u=0.5.' },

{ id: 'code-m1-06', module: 'm1', source: 'seed',
  title: 'Rainbow colorscale',
  prompt: 'Implement <code>mapColor(u, maxHue)</code>: maps u in [0,1] to an HSV triple sweeping hue from 0 to maxHue at fixed saturation 0.8 and value 0.9. Return the <code>[h, s, v]</code> array (the demo converts it to a color string for you).',
  starterCode:
`function hsv_to_color_string(h, s, v) {
  const c = v * s, x = c * (1 - Math.abs((h / 60) % 2 - 1)), m = v - c;
  let [r,g,b] = h < 60 ? [c,x,0] : h < 120 ? [x,c,0] : h < 180 ? [0,c,x] : h < 240 ? [0,x,c] : h < 300 ? [x,0,c] : [c,0,x];
  return \`rgb(\${Math.round((r+m)*255)},\${Math.round((g+m)*255)},\${Math.round((b+m)*255)})\`;
}

function mapColor(u, maxHue) {
  // TODO: return [hue, saturation, value] where hue sweeps 0..maxHue as u goes 0..1
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
  notes: 'The simplest of the colorscale family — just a linear hue sweep at fixed saturation/value, which is exactly why plain "rainbow" scales are discouraged for ordered data (non-monotonic perceptual lightness).' },

{ id: 'code-m3-01', module: 'm3', source: 'seed',
  title: 'Force-directed layout: repulsive force',
  prompt: 'Implement <code>repulsiveForce(K, n1, n2, disp)</code> using Coulomb\'s law: force magnitude K²/d, pushing n1 and n2 apart along the line connecting them. <code>distance(n1,n2)</code> and <code>attractingForce</code> are already provided; the demo runs a few simulation steps on a small triangle of nodes and renders the result as SVG.',
  starterCode:
`function distance(n1, n2) {
  const dx = n2.x - n1.x, dy = n2.y - n1.y;
  return { x: dx, y: dy, d: Math.max(Math.hypot(dx, dy), 0.01) };
}

function attractingForce(K, n1, n2, disp) {
  const d = distance(n1, n2)
  const fa = d.d * d.d / K
  disp[n1.index].x += fa * d.x
  disp[n1.index].y += fa * d.y
  disp[n2.index].x -= fa * d.x
  disp[n2.index].y -= fa * d.y
}

function repulsiveForce(K, n1, n2, disp) {
  // TODO: Coulomb's law repulsion, magnitude K*K/d.d, pushing n1 and n2 apart
}

// --- demo: 3 nodes, 2 edges, a few simulation steps ---
const nodes = [{index:0,x:150,y:100},{index:1,x:160,y:105},{index:2,x:140,y:110}];
const edges = [{source:0,target:1}];
const K = 40;
for (let iter = 0; iter < 60; iter++) {
  const disp = nodes.map(() => ({x:0,y:0}));
  for (let i=0;i<nodes.length;i++) for (let j=i+1;j<nodes.length;j++) repulsiveForce(K, nodes[i], nodes[j], disp);
  edges.forEach(e => attractingForce(K, nodes[e.source], nodes[e.target], disp));
  nodes.forEach(n => { n.x += disp[n.index].x * 0.05; n.y += disp[n.index].y * 0.05; });
}
const svg = d3.select('#app').append('svg').attr('width', 300).attr('height', 220);
edges.forEach(e => svg.append('line').attr('x1', nodes[e.source].x).attr('y1', nodes[e.source].y)
  .attr('x2', nodes[e.target].x).attr('y2', nodes[e.target].y).attr('stroke', '#999'));
svg.selectAll('circle').data(nodes).enter().append('circle')
  .attr('cx', d => d.x).attr('cy', d => d.y).attr('r', 8).attr('fill', '#4f5bd5');
`,
  solutionCode:
`function repulsiveForce(K, n1, n2, disp) {
    const d = distance(n1, n2) // distance vector pointing from node1 to node2
    const fr = K * K / d.d
    disp[n1.index].x -= fr * d.x
    disp[n1.index].y -= fr * d.y
    disp[n2.index].x += fr * d.x
    disp[n2.index].y += fr * d.y
}`,
  notes: 'Repulsion pushes n1 backward along the n1->n2 vector and n2 forward along it — opposite signs from attractingForce, which pulls them together.' },

{ id: 'code-m3-02', module: 'm3', source: 'seed',
  title: 'Force-directed layout: attractive force',
  prompt: 'Implement <code>attractingForce(K, n1, n2, disp)</code>, the spring-law counterpart to repulsion: magnitude d²/K, pulling connected nodes together. <code>distance</code> and <code>repulsiveForce</code> are provided; the demo runs a mini simulation and renders it as SVG.',
  starterCode:
`function distance(n1, n2) {
  const dx = n2.x - n1.x, dy = n2.y - n1.y;
  return { x: dx, y: dy, d: Math.max(Math.hypot(dx, dy), 0.01) };
}

function repulsiveForce(K, n1, n2, disp) {
  const d = distance(n1, n2)
  const fr = K * K / d.d
  disp[n1.index].x -= fr * d.x
  disp[n1.index].y -= fr * d.y
  disp[n2.index].x += fr * d.x
  disp[n2.index].y += fr * d.y
}

function attractingForce(K, n1, n2, disp) {
  // TODO: spring-law attraction, magnitude d.d*d.d/K, pulling n1 and n2 together
}

// --- demo ---
const nodes = [{index:0,x:60,y:100},{index:1,x:240,y:100},{index:2,x:150,y:40}];
const edges = [{source:0,target:1},{source:1,target:2},{source:2,target:0}];
const K = 40;
for (let iter = 0; iter < 60; iter++) {
  const disp = nodes.map(() => ({x:0,y:0}));
  for (let i=0;i<nodes.length;i++) for (let j=i+1;j<nodes.length;j++) repulsiveForce(K, nodes[i], nodes[j], disp);
  edges.forEach(e => attractingForce(K, nodes[e.source], nodes[e.target], disp));
  nodes.forEach(n => { n.x += disp[n.index].x * 0.03; n.y += disp[n.index].y * 0.03; });
}
const svg = d3.select('#app').append('svg').attr('width', 300).attr('height', 160);
edges.forEach(e => svg.append('line').attr('x1', nodes[e.source].x).attr('y1', nodes[e.source].y)
  .attr('x2', nodes[e.target].x).attr('y2', nodes[e.target].y).attr('stroke', '#999'));
svg.selectAll('circle').data(nodes).enter().append('circle')
  .attr('cx', d => d.x).attr('cy', d => d.y).attr('r', 8).attr('fill', '#1f9d55');
`,
  solutionCode:
`function attractingForce(K, n1, n2, disp) {
    const d = distance(n1, n2)
    const fa = d.d * d.d / K
    disp[n1.index].x += fa * d.x
    disp[n1.index].y += fa * d.y
    disp[n2.index].x -= fa * d.x
    disp[n2.index].y -= fa * d.y
}`,
  notes: 'Attraction grows with the square of the distance (spring stretches more, pulls harder), which is why it dominates at long range while repulsion (1/d) dominates up close.' },

{ id: 'code-m3-03', module: 'm3', source: 'seed',
  title: 'Circular network layout',
  prompt: 'Implement <code>circularLayout(nodes, R)</code>: place nodes around a circle of radius R, where each node\'s arc length is proportional to its weight <code>c</code>, and nodes are grouped by <code>group</code> first. Positions go in <code>n.x/n.y</code>; also compute a per-node "radius" <code>n.r</code> for drawing. The demo renders the resulting circular layout as SVG.',
  starterCode:
`function circularLayout(nodes, R) {
  // TODO: sort by group then weight c; distribute angle proportional to c; set n.x, n.y, n.r
}

// --- demo: 8 nodes in 2 groups ---
const nodes = d3.range(8).map(i => ({ index: i, group: i < 4 ? 0 : 1, c: 1 + Math.random() * 2 }));
circularLayout(nodes, 80);
const svg = d3.select('#app').append('svg').attr('width', 220).attr('height', 220);
const g = svg.append('g').attr('transform', 'translate(110,110)');
g.selectAll('circle').data(nodes).enter().append('circle')
  .attr('cx', d => d.x).attr('cy', d => d.y).attr('r', d => Math.max(3, d.r))
  .attr('fill', d => d.group === 0 ? '#4f5bd5' : '#c98a12');
`,
  solutionCode:
`function circularLayout(nodes,R) {
    nodes.sort((a, b) => (a.group != b.group) ? b.group - a.group : b.c - a.c)
    let sum = 0
    nodes.forEach(n => { sum += n.c })
    const alpha = (2 * Math.PI) / sum
    const radius = (R, gamma) => R * Math.sin(gamma / 2)
    let beta = Math.PI / 2
    let gamma = alpha * nodes[0].c
    for (let n of nodes) {
        n.x = R * Math.cos(beta)
        n.y = R * Math.sin(beta)
        n.r = radius(R, gamma)
        beta += gamma / 2
        gamma = alpha * nodes[(n.index + 1) % nodes.length].c
        beta += gamma / 2
    }
}`,
  notes: 'Each node gets an angular slice (gamma) proportional to its weight c; beta walks around the circle by half a slice before and after placing each node, so slices don\'t overlap.' },

{ id: 'code-m4-01', module: 'm4', source: 'seed',
  title: 'Treemap: Slice-and-Dice',
  prompt: 'Implement <code>sliceanddice(sibling, rect, depth)</code>: lay out sibling nodes (each with a <code>.size</code>) within <code>rect</code>, cutting vertically at even depth and horizontally at odd depth, proportional to size. Set <code>x, y, width, height</code> on each sibling.',
  starterCode:
`function sliceanddice(sibling, rect, depth) {
  // TODO: alternate vertical/horizontal cuts by depth parity, sized proportionally to s.size
}

// --- demo ---
const data = [{name:'A', size:40},{name:'B', size:25},{name:'C', size:20},{name:'D', size:15}];
const rect = { x: 0, y: 0, width: 360, height: 200 };
sliceanddice(data, rect, 0);
const svg = d3.select('#app').append('svg').attr('width', 360).attr('height', 200);
const colors = d3.scaleOrdinal(d3.schemeCategory10);
svg.selectAll('rect').data(data).enter().append('rect')
  .attr('x', d => d.x).attr('y', d => d.y).attr('width', d => d.width).attr('height', d => d.height)
  .attr('fill', (d,i) => colors(i)).attr('stroke', 'white');
svg.selectAll('text').data(data).enter().append('text')
  .attr('x', d => d.x + 4).attr('y', d => d.y + 14).text(d => d.name).attr('fill', 'white').style('font-size','12px');
`,
  solutionCode:
`function sliceanddice(sibling, rect, depth)
{
    let d = 0
    sibling.forEach( s => {
        if (depth%2 === 0) {
            const w = s.size / rect.height
            s.x = rect.x + d
            s.y = rect.y
            s.width = w
            s.height = rect.height
            d += w
        } else {
            const h = s.size / rect.width
            s.x = rect.x
            s.y = rect.y + d
            s.width = rect.width
            s.height = h
            d += h
        }
    })
}`,
  notes: 'Note that s.size is treated as pre-normalized area (size/rect.height gives width so that width*height = size). At even depth we cut vertically (fixed height, growing x-offset); at odd depth horizontally.' },

{ id: 'code-m4-02', module: 'm4', source: 'seed',
  title: 'Treemap: Squarified layout decision',
  prompt: 'Implement <code>squarified(sibling, row, rect)</code>, the recursive core of the Squarified treemap algorithm (Bruls et al., 2000). Given the remaining siblings (already sorted descending by size) and the rectangle to fill: if there are no more siblings, lay out the current row and stop; otherwise, try adding the next sibling to the current row (via the provided <code>aspectRatios</code> check) — if it keeps aspect ratios improving, add it and recurse; otherwise, flush the current row and start a new one. <code>layoutrow</code>, <code>aspectRatios</code>, and <code>normalizeArea</code> are provided.',
  starterCode:
`function normalizeArea(sibling, rect) {
  const total = d3.sum(sibling, s => s.size);
  const scale = (rect.width * rect.height) / total;
  sibling.forEach(s => s.size *= scale);
}

function worstAspect(row, extra, rect) {
  const items = extra ? row.concat([extra]) : row;
  const sum = d3.sum(items, s => s.size);
  const side = Math.min(rect.width, rect.height);
  const rowThickness = sum / side;
  return d3.max(items, s => {
    const len = s.size / rowThickness;
    return Math.max(rowThickness / len, len / rowThickness);
  });
}

function aspectRatios(row, node, rect) {
  // returns true if adding "node" to "row" keeps (or improves) the worst aspect ratio
  if (row.length === 0) return true;
  return worstAspect(row, node, rect) <= worstAspect(row, null, rect);
}

function layoutrow(row, rect) {
  const side = Math.min(rect.width, rect.height);
  const sum = d3.sum(row, s => s.size);
  const thickness = sum / side;
  let offset = 0;
  const vertical = rect.width >= rect.height;
  row.forEach(s => {
    const len = s.size / thickness;
    if (vertical) { s.x = rect.x; s.y = rect.y + offset; s.width = thickness; s.height = len; }
    else { s.x = rect.x + offset; s.y = rect.y; s.width = len; s.height = thickness; }
    offset += len;
  });
  if (vertical) { rect.x += thickness; rect.width -= thickness; }
  else { rect.y += thickness; rect.height -= thickness; }
}

function squarified(sibling, row, rect) {
  // TODO: recursive squarified layout decision (see prompt)
}

// --- demo ---
const data = [{name:'A',size:6},{name:'B',size:6},{name:'C',size:4},{name:'D',size:3},{name:'E',size:2},{name:'F',size:2}]
  .sort((a,b) => b.size - a.size);
const rect = { x: 0, y: 0, width: 360, height: 200 };
normalizeArea(data, rect);
squarified(data.slice(), [], { x: 0, y: 0, width: 360, height: 200 });
const svg = d3.select('#app').append('svg').attr('width', 360).attr('height', 200);
const colors = d3.scaleOrdinal(d3.schemeCategory10);
svg.selectAll('rect').data(data).enter().append('rect')
  .attr('x', d => d.x).attr('y', d => d.y).attr('width', d => d.width).attr('height', d => d.height)
  .attr('fill', (d,i) => colors(i)).attr('stroke', 'white');
`,
  solutionCode:
`function squarified(sibling, row, rect)
{
    if (sibling.length === 0) {
        if (row.length > 0) {
            layoutrow(row, rect)
        }
        return
    }
    let node = sibling[0]
    if (row.length === 0) {
        row.push(node)
        squarified(sibling.slice(1), row, rect)
    }
    else {
        if (aspectRatios(row, node, rect)) {
            row.push(node)
            squarified(sibling.slice(1), row, rect)
        }
        else {
            layoutrow(row, rect)
            squarified(sibling, [], rect)
        }
    }
}`,
  notes: 'The recursion has 3 cases: no siblings left -> flush and stop; empty row -> seed it with the next node; otherwise test if adding the next node keeps the row\'s aspect ratio non-worsening, else flush the row and retry the same remaining siblings against the shrunken rect.' },

{ id: 'code-m5-01', module: 'm5', source: 'seed',
  title: 'Word cloud: AABB collision test',
  prompt: 'Implement <code>intersectAABB(aabb, aabbs, offset)</code>: given one axis-aligned bounding box (with corners <code>v0</code> top-left and <code>v1</code>/<code>v2</code> giving width/height) and a list of already-placed boxes, return true if <code>aabb</code> (padded by <code>offset</code>) overlaps any of them. Used to decide whether a new word can be placed in a word cloud.',
  starterCode:
`function intersectAABB(aabb, aabbs, offset) {
  // TODO: standard AABB overlap test against every box in aabbs, padding aabb by "offset"
}

// --- demo: colors boxes green (free) / red (colliding) ---
function box(x, y, w, h) { return { v0: {x, y}, v1: {x: x + w, y}, v2: {x, y: y + h} }; }
const placed = [box(20, 20, 80, 30), box(120, 60, 70, 25)];
const candidate = box(70, 30, 60, 20); // overlaps the first box
const hit = intersectAABB(candidate, placed, 0);
const svg = d3.select('#app').append('svg').attr('width', 260).attr('height', 140);
placed.forEach(b => svg.append('rect').attr('x', b.v0.x).attr('y', b.v0.y)
  .attr('width', b.v1.x - b.v0.x).attr('height', b.v2.y - b.v0.y).attr('fill', '#999').attr('opacity', 0.5));
svg.append('rect').attr('x', candidate.v0.x).attr('y', candidate.v0.y)
  .attr('width', candidate.v1.x - candidate.v0.x).attr('height', candidate.v2.y - candidate.v0.y)
  .attr('fill', hit ? '#d64545' : '#1f9d55').attr('opacity', 0.7);
console.log('collision detected:', hit);
`,
  solutionCode:
`function intersectAABB( aabb, aabbs, offset )
{
    const ax = aabb.v0.x
    const ay = aabb.v0.y
    const aw = aabb.v1.x - ax + offset
    const ah = aabb.v2.y - ay + offset
    for (let b of aabbs) {
        const bx = b.v0.x
        const by = b.v0.y
        const bw = b.v1.x - bx
        const bh = b.v2.y - by
        if (!((ax + aw < bx || bx + bw < ax) || (ay + ah < by || by + bh < ay))) {
            return true
        }
    }
    return false
}`,
  notes: 'Two axis-aligned boxes do NOT overlap if one is entirely to the left/right OR entirely above/below the other; negating that "separated" condition gives the overlap test.' },

// ===================== StudOn-confirmed practice questions (color rescale/blend theme) =====================

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
  notes: 's and v both scale with |u-0.5|*2, so they hit their extreme (s=1) at the edges and vanish (s=0, pure white/gray) at the midpoint; c sets how dark the extremes get via v.' },

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
  notes: 'Same result as unary-plus coercion (+("0x"+chunk)) — Number(...) is just the more explicit way to force the hex string to a number.' },

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
  notes: 'x = (nrColors-1)*alpha is the fractional array index; i0/i1 are its floor/ceil, dt is the leftover fraction used to blend them.' },

{ id: 'code-studon-04', module: 'm1', source: 'studon',
  title: 'mapColor — linear RGB interpolation (StudOn)',
  prompt: 'Implement <code>mapColor(value, c_min, c_max)</code>: linearly interpolate between two RGB colors (arrays of 0-255 numbers) given <code>value</code> in [0,1], returning a CSS color string. A <code>rgb_vector_to_color_string</code> helper is already provided.',
  starterCode:
`function rgb_vector_to_color_string(vec) {
  return \`rgb(\${Math.round(vec[0])},\${Math.round(vec[1])},\${Math.round(vec[2])})\`;
}

function mapColor(value, c_min, c_max) {
  // TODO: lerp each channel between c_min and c_max by "value", then convert to a color string
}

// --- demo: 10-step gradient strip ---
const app = d3.select('#app');
const strip = app.append('div').style('display', 'flex');
for (let i = 0; i <= 10; i++) {
  const v = i / 10;
  strip.append('div').style('width', '24px').style('height', '40px')
    .style('background', mapColor(v, [255, 0, 0], [0, 0, 255]));
}
`,
  solutionCode:
`function mapColor(value, c_min, c_max) {
    function lerp(a, b, t){
        return (1-t)*a + t*b
    }
    let vec = [lerp(c_min[0],c_max[0],value),
               lerp(c_min[1],c_max[1],value),
               lerp(c_min[2],c_max[2],value)]
    return rgb_vector_to_color_string( vec )
}`,
  hint: "exact lerp formula from the question, applied per r/g/b channel",
  notes: 'lerp(a,b,t) = (1-t)*a + t*b, run independently on each of the r/g/b channels.' },

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
  notes: 'The simplest of the color-scale family: a linear hue sweep at fixed saturation/value — which is also why plain rainbow scales are discouraged for ordered data (non-monotonic perceptual lightness).' },

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
  notes: 'toString(16) gives base-16 digits; padStart(2,\'0\') keeps single-digit values like "8" as "08".' },

];
