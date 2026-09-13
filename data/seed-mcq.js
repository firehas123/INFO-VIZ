// MCQ bank is StudOn-only by design: real exam-practice questions, added verbatim as they appear
// on StudOn, not paraphrased content. Where a StudOn question was a drag-and-match "matching"
// question (the site's quiz UI doesn't have a match-the-pairs mode), it's reformatted as a
// multi-select "which of these pairings are correct" question covering the exact same pairs —
// flagged in the question text with "[Originally a matching question]".
window.SEED_MCQ = [

{ id: 'studon-m1-01', type: 'mcq-multi', module: 'm1', source: 'studon', recall: false,
  question: 'Which are the three additive primary colors?',
  options: ['yellow', 'cyan', 'blue', 'red', 'magenta', 'green'],
  correctIndexes: [2, 3, 5],
  explanation: 'Red, Green, and Blue are the additive primaries — combining all three at full intensity yields white light, as used in RGB (screens/monitors).' },

{ id: 'studon-m1-02', type: 'mcq-multi', module: 'm1', source: 'studon', recall: false,
  question: '[Originally a matching question] Which of the following model-to-category assignments are correct? (select all that apply)',
  options: ['RGB is an additive color model', 'CMY is an additive color model', 'CMY is a subtractive color model', 'HSV is an additive color model', 'RGB is a subtractive color model'],
  correctIndexes: [0, 2],
  explanation: 'RGB combines light additively (used for screens); CMY(K) combines ink/pigment subtractively (used for printing). HSV is neither — it is a perception-based reformulation of RGB, not an additive or subtractive model.' },

{ id: 'studon-m1-03', type: 'mcq-single', module: 'm1', source: 'studon', recall: false,
  question: 'Which of the following color models was designed to resemble the way human vision perceives color?',
  options: ['HSV', 'RGB', 'CMY'],
  correctIndexes: [0],
  explanation: 'HSV (Hue, Saturation, Value) — along with the related HSL — was designed to be more intuitive/perceptual than RGB, separating color (hue) from intensity and purity.' },

{ id: 'studon-m1-04', type: 'mcq-single', module: 'm1', source: 'studon', recall: false,
  question: 'Which of the following color codes represent magenta?',
  options: ['#FF00FF', '[255, 10, 32]', '[120°, 1, 0.7]'],
  correctIndexes: [0],
  explanation: '#FF00FF = full red + full blue, no green = magenta. [255,10,32] is a reddish RGB color, and [120°,1,0.7] is HSV/HSL with hue 120°, which is green — not magenta.' },

{ id: 'studon-m1-05', type: 'mcq-multi', module: 'm1', source: 'studon', recall: false,
  question: 'Choose two of the following color codes which represent the same color.',
  options: ['#FA2033', '[0.1, 0.9, 0.2]', '[120°, 1, 1]', '[0, 1, 0]'],
  correctIndexes: [2, 3],
  explanation: '[120°, 1, 1] in HSV and [0, 1, 0] in RGB both describe pure green — hue 120° is green in HSV, and RGB (0,1,0) is green with no red or blue.' },

{ id: 'studon-m1-06', type: 'mcq-single', module: 'm1', source: 'studon', recall: false,
  question: 'Which of the following color scales would you use to visualize the four seasons (winter, spring, summer, autumn)?',
  options: ['A diverging brown-to-teal scale with white at the midpoint', 'A sequential white-to-blue gradient', 'A categorical palette of 10 distinct, unordered colors', 'A multi-hue rainbow-style gradient'],
  correctIndexes: [2],
  explanation: 'Seasons are categorical/nominal with no inherent order for color-mapping purposes, so a categorical (qualitative) color scale with distinct hues is the right choice — not a sequential, diverging, or rainbow scale.' },

{ id: 'studon-m1-07', type: 'mcq-multi', module: 'm1', source: 'studon', recall: false,
  question: '[Originally a matching question] Which of the following category-to-example assignments are correct? (select all that apply)',
  options: ['Nominal — German federal state (Bundesland), e.g. Bayern, NRW, Hessen', 'Nominal — blood type of a person (A, B, AB, or O)', 'Ordinal — months of the year (January, February, March, ...)', 'Quantitative — temperature values', 'Ordinal — blood type of a person', 'Quantitative — German federal state'],
  correctIndexes: [0, 1, 2, 3],
  explanation: 'Federal state and blood type are unordered categories (nominal); months have a natural order but no meaningful numeric distance (ordinal); temperature is numeric (quantitative).' },

{ id: 'studon-m1-08', type: 'mcq-multi', module: 'm1', source: 'studon', recall: false,
  question: '[Originally a matching question] Which of the following data-set-to-structure assignments are correct? (select all that apply)',
  options: ['Genealogical (family tree) data is a hierarchy', 'A file system is a hierarchy', 'Social relations data is a network', 'Genealogical data is a network', 'A file system is a network'],
  correctIndexes: [0, 1, 2],
  explanation: 'Genealogical data and file systems both have a strict parent/child tree structure (hierarchies); social relations form a general graph of many-to-many connections (a network).' },

{ id: 'studon-m1-09', type: 'mcq-multi', module: 'm1', source: 'studon', recall: false,
  question: '[Originally a matching question] Given the named colors antiquewhite, burlywood, and dodgerblue, which hex code pairings are correct? (select all that apply)',
  options: ['antiquewhite = #FAEBD7', 'burlywood = #DEB887', 'dodgerblue = #1E90FF', 'antiquewhite = #1E90FF', 'dodgerblue = #DEB887'],
  correctIndexes: [0, 1, 2],
  explanation: 'Standard CSS named-color hex values: antiquewhite is a pale cream (#FAEBD7), burlywood is a tan/brown (#DEB887), and dodgerblue is a bright blue (#1E90FF).' },

{ id: 'studon-m1-10', type: 'mcq-single', module: 'm1', source: 'studon', recall: false,
  question: 'A set of RGB transfer functions is shown where the R, G, and B channels each oscillate up and down multiple times across the input range (none of the channels rises or falls monotonically). Which color map was generated with this set of transfer functions?',
  options: ['Blues colormap', 'BrBG colormap', 'Rainbow colormap'],
  correctIndexes: [2],
  explanation: 'Only a full-hue-cycle scale like Rainbow needs each RGB channel to rise and fall multiple times across the range. A sequential scale (Blues) or a diverging scale (BrBG) both use much simpler, mostly-monotonic transfer functions per channel.' },

{ id: 'studon-m1-11', type: 'mcq-multi', module: 'm1', source: 'studon', recall: false,
  question: 'In an Auto MPG dataset with columns mpg, cylinders, displacement, horsepower, weight, acceleration, (model) year, origin, and name, which columns contain categorical data?',
  options: ['horse power', 'origin', 'weight', 'name', 'displacement', 'mpg', 'acceleration', 'cylinders', '(model) year'],
  correctIndexes: [1, 3],
  explanation: '"origin" (country) and "name" (car model) are labels with no numeric meaning — categorical/nominal. Cylinders, weight, mpg, displacement, horsepower, acceleration, and year are all numeric measurements or counts (quantitative), even though cylinders only takes a few distinct values.' },

{ id: 'studon-m1-12', type: 'mcq-multi', module: 'm1', source: 'studon', recall: false,
  question: 'Which columns in the Iris flower dataset (Sepal length, Sepal width, Petal length, Petal width, Species) contain quantitative data?',
  options: ['Sepal length', 'Sepal width', 'Dataset order', 'Species', 'Petal width', 'Petal length'],
  correctIndexes: [0, 1, 4, 5],
  explanation: 'The four measured dimensions (sepal/petal length and width) are numeric measurements (quantitative). "Species" is a categorical label, and "Dataset order" is just a row index, not a measured attribute.' },

{ id: 'studon-m1-13', type: 'mcq-multi', module: 'm1', source: 'studon', recall: false,
  question: 'Which kind of data can be colored with a categorical/qualitative color scale (a palette of 10 distinct, unordered colors)?',
  options: ['quantitative', 'nominal', 'categorical', 'ordinal'],
  correctIndexes: [1, 2],
  explanation: 'A qualitative palette of distinct hues has no implied order or magnitude, so it should only be used for nominal/categorical data — not ordinal or quantitative data, which need an ordered scale.' },

{ id: 'studon-m1-14', type: 'mcq-multi', module: 'm1', source: 'studon', recall: false,
  question: 'To which kind of data type does the following data set correspond: {"January", "February", "March", "April", "May", "June"}?',
  options: ['categorical', 'quantitative', 'categorical: ordinal'],
  correctIndexes: [0, 2],
  explanation: 'Months are categorical (a finite set of labels) and specifically ordinal, since they have a natural order (January before February, etc.) even though the numeric distance between them is not meaningful.' },

{ id: 'studon-m1-15', type: 'mcq-single', module: 'm1', source: 'studon', recall: false,
  question: 'Two continuous rainbow-style hue-range color scales (with adjustable range handles) are shown. Which kind of data can be colored with the color scales given above?',
  options: ['ordinal', 'quantitative', 'nominal'],
  correctIndexes: [2],
  explanation: 'Confirmed correct on StudOn (full marks). Rainbow/cyclic hue scales are not perceptually ordered (lightness doesn\'t increase monotonically along the scale), so despite looking continuous, this course marks them as suited to distinguishing nominal (unordered) categories rather than conveying ordinal rank or quantitative magnitude.' },

{ id: 'studon-m1-16', type: 'mcq-single', module: 'm1', source: 'studon', recall: false,
  question: 'Which of the following examples is a quantitative data type?',
  options: ['Seasons (Winter, Spring, Summer, Autumn)', 'Number of seats in the cinema', 'Home country'],
  correctIndexes: [1],
  explanation: 'Quantitative data is numeric and measurable/countable. Seasons and home country are both categorical (nominal) — labels, not numbers.' },

{ id: 'studon-m1-17', type: 'mcq-multi', module: 'm1', source: 'studon', recall: false,
  question: '[Originally a matching question] Which of the following category-to-example assignments are correct? (select all that apply)',
  options: ['Nominal — Plant taxonomy (classification of plants)', 'Ordinal — Grades (sehr gut, gut, befriedigend, ...)', 'Quantitative — GPS data (longitude, latitude, altitude, time of transmission)', 'Quantitative — Altitude above sea level', 'Ordinal — Plant taxonomy', 'Nominal — Grades'],
  correctIndexes: [0, 1, 2, 3],
  explanation: 'Plant taxonomy is a set of unordered categories (nominal); grades have a natural order (ordinal); GPS coordinates and altitude are numeric measurements (quantitative).' },

{ id: 'studon-m1-18', type: 'mcq-multi', module: 'm1', source: 'studon', recall: false,
  question: '[Originally a matching question] Which of the following category-to-example assignments are correct? (select all that apply)',
  options: ['Nominal — Political party affiliation', 'Ordinal — Course grades', 'Quantitative — Height and weight of an individual', 'Quantitative — Political party affiliation', 'Nominal — Height and weight of an individual'],
  correctIndexes: [0, 1, 2],
  explanation: 'Party affiliation is unordered (nominal); course grades have a natural order (ordinal); height/weight are numeric measurements (quantitative).' },

{ id: 'studon-m1-19', type: 'mcq-multi', module: 'm1', source: 'studon', recall: false,
  question: '[Originally a matching question] Which color-scale-type choices are correct for the given data type? (select all that apply)',
  options: ['Categorical data should use a categorical (qualitative) color scale', 'Quantitative data should use a sequential color scale', 'Categorical data should use a sequential color scale', 'Quantitative data should use a categorical (qualitative) color scale'],
  correctIndexes: [0, 1],
  explanation: 'Categorical/nominal data needs distinct, unordered hues (a categorical scale); quantitative (ordered, numeric) data needs a scale that encodes magnitude, like a sequential scale.' },

{ id: 'studon-m1-20', type: 'mcq-multi', module: 'm1', source: 'studon', recall: false,
  question: '[Originally a matching question] Which color-scale-type-to-name assignments are correct? (select all that apply)',
  options: ['A white-to-green gradient is a Sequential color scale', 'A palette of distinct unordered colors is a Categorical color scale', 'A full rainbow gradient is a Cyclic color scale', 'A white-to-green gradient is a Cyclic color scale', 'A full rainbow gradient is a Sequential color scale'],
  correctIndexes: [0, 1, 2],
  explanation: 'Matches the four color-scale types from the course: Sequential (one direction, e.g. white to green), Categorical (distinct colors), and Cyclic (repeating, e.g. Rainbow for periodic data).' },

{ id: 'studon-m1-21', type: 'mcq-multi', module: 'm1', source: 'studon', recall: false,
  question: '[Originally a matching question] Which hex-code-to-color assignments are correct? (select all that apply)',
  options: ['#0000FF = blue', '#00FFFF = cyan', '#FF0000 = red', '#0000FF = red', '#FF0000 = cyan'],
  correctIndexes: [0, 1, 2],
  explanation: 'Standard primary/secondary hex colors: #0000FF is pure blue, #00FFFF is cyan (green+blue), #FF0000 is pure red.' },

{ id: 'studon-m1-22', type: 'mcq-single', module: 'm1', source: 'studon', recall: false,
  question: 'A set of RGB transfer functions is shown where all three channels (R, G, B) start at maximum (white) and decrease monotonically as u goes from 0 to 1, with the blue channel staying highest throughout and the red channel dropping fastest. Which of the following sequential color scales was generated with these interpolation functions?',
  options: ['A light-to-dark blue gradient', 'A dark-blue → purple → pink → orange → yellow gradient (plasma-like)', 'A dark-purple → blue → teal → green → yellow-green gradient (viridis-like)'],
  correctIndexes: [0],
  explanation: 'Since blue stays highest at every point while red and green fall away fastest, the resulting color trends from white toward dark blue — the light-to-dark-blue sequential scale, not the multi-hue plasma or viridis scales.' },

{ id: 'studon-m1-23', type: 'mcq-single', module: 'm1', source: 'studon', recall: false,
  question: 'Which of the following formulas can be used to represent gray colors?',
  options: ['α × red + (1 − β) × green + α × blue,  α + β = 2', '(α, β, γ),  α + β + γ = 1', 'α × (1, 1, 1),  α ∈ [0, 1]'],
  correctIndexes: [2],
  explanation: 'Gray colors have equal R, G, and B values — α×(1,1,1) scales all three channels identically, producing every shade from black (α=0) to white (α=1).' },

{ id: 'studon-m1-24', type: 'mcq-multi', module: 'm1', source: 'studon', recall: false,
  question: '[Originally a matching question] Which hex-code-to-color assignments are correct? (select all that apply)',
  options: ['#FF00FF = magenta', '#00FFFF = cyan', '#FFFF00 = yellow', '#FF00FF = yellow', '#FFFF00 = magenta'],
  correctIndexes: [0, 1, 2],
  explanation: 'Standard secondary hex colors: #FF00FF (red+blue) is magenta, #00FFFF (green+blue) is cyan, #FFFF00 (red+green) is yellow.' },

{ id: 'studon-m1-25', type: 'mcq-multi', module: 'm1', source: 'studon', recall: false,
  question: '[Originally a matching question] Which HSL-value-to-color assignments are correct? (select all that apply)',
  options: ['hsl(300, 100%, 50%) = magenta', 'hsl(180, 100%, 50%) = cyan', 'hsl(60, 100%, 50%) = yellow', 'hsl(300, 100%, 50%) = cyan', 'hsl(60, 100%, 50%) = magenta'],
  correctIndexes: [0, 1, 2],
  explanation: 'In HSL, hue 300° is magenta, 180° is cyan, and 60° is yellow, each at full saturation and 50% lightness.' },

{ id: 'studon-m1-26', type: 'mcq-single', module: 'm1', source: 'studon', recall: false,
  question: 'A set of RGB transfer functions is shown where all three channels start near 0 (black) and end near maximum (white), each rising along a different S-curve so the midpoint region passes through varied colors before converging to white. Which of the following sequential interpolated color scales was generated with these transfer functions?',
  options: ['color scale 2 (a rainbow-like purple/green/blue gradient)', 'color scale 1 (a black → colorful → white gradient)', 'color scale 3 (a purple → pink → yellow → green gradient)'],
  correctIndexes: [1],
  explanation: 'Since every channel starts at 0 (black) and ends at max (white), passing through varied colors only where the three channels\' curves are out of phase in the middle, the result is a black-to-white scale with colorful mid-tones — "color scale 1".' },

{ id: 'studon-m1-27', type: 'mcq-single', module: 'm1', source: 'studon', recall: false,
  question: 'Which color model is considered additive?',
  options: ['RGB', 'CYM', 'HSV'],
  correctIndexes: [0],
  explanation: 'RGB is additive (combining channels of light adds up to white). CMY is subtractive (used for ink/print); HSV is a perceptual reformulation of RGB, not itself additive or subtractive.' },

{ id: 'studon-m1-28', type: 'mcq-single', module: 'm1', source: 'studon', recall: false,
  question: 'In the HSL color model, what does the saturation component represent?',
  options: ['The purity of the color', 'The amount of black ink in the added pigment', 'The brightness or darkness of the color'],
  correctIndexes: [0],
  explanation: 'Saturation measures how far a color is from gray — i.e. its purity/vividness. Lightness (not saturation) controls brightness/darkness, and "black ink" is a CMYK concept, not HSL.' },

{ id: 'studon-m1-29', type: 'mcq-single', module: 'm1', source: 'studon', recall: false,
  question: 'Which color space is specifically designed to be perceptually uniform, meaning the distance between colors reflects their perceived difference to our eyes, and encompasses all colors perceivable by the human eye?',
  options: ['Adobe RGB', 'CIELAB (CIE L*a*b*)', 'sRGB'],
  correctIndexes: [1],
  explanation: 'CIELAB was explicitly designed so that Euclidean distance between two color coordinates approximates perceived color difference, and it covers the full range of human-visible color — unlike device-oriented spaces like sRGB or Adobe RGB.' },

{ id: 'studon-m1-30', type: 'mcq-single', module: 'm1', source: 'studon', recall: false,
  question: 'When creating a sequential color scale for a map representing population density, which approach is most effective?',
  options: ['Varying Lightness or Saturation to show an ordered progression', 'Varying only Hue while keeping Lightness constant', 'Using bright colors arranged in a random order'],
  correctIndexes: [0],
  explanation: 'Human perception naturally associates darker or more saturated colors with higher density, so varying lightness/saturation preserves a perceivable order; varying only hue (or randomizing colors) does not convey magnitude.' },

{ id: 'studon-m1-31', type: 'mcq-single', module: 'm1', source: 'studon', recall: false,
  question: 'What is the primary purpose of the \'K\' (Key) in the CMYK color model?',
  options: ['To keep colors from bleeding into each other', 'To produce pure black and reduce ink consumption', 'To add a blue tint to shadows'],
  correctIndexes: [1],
  explanation: 'Mixing full C+M+Y ink gives a muddy, ink-heavy near-black. Adding a separate black (Key) channel produces a truer black while using less total ink.' },

{ id: 'studon-m1-32', type: 'mcq-single', module: 'm1', source: 'studon', recall: false,
  question: 'In a Diverging color scale, how are the colors typically organized?',
  options: ['A single color that gets progressively darker', 'Two different colors that meet at a neutral midpoint', 'Easily distinguishable colors arranged in a random order'],
  correctIndexes: [1],
  explanation: 'A diverging scale uses two hues that diverge from a neutral (often white/gray) midpoint, emphasizing deviation above/below a reference value — as opposed to a single-hue sequential scale or an unordered categorical palette.' },

{ id: 'studon-m1-33', type: 'mcq-single', module: 'm1', source: 'studon', recall: false,
  question: 'Which of these is a major disadvantage of using the \'Rainbow\' (Jet) color scale for scientific data?',
  options: ['It lacks a perceptual uniform gradient, creating false boundaries', 'It has too many colors to be appealing', 'It can only be used in RGB color space'],
  correctIndexes: [0],
  explanation: 'Rainbow/Jet scales have non-monotonic perceived lightness, which can create visual banding and false boundaries that do not correspond to real changes in the underlying data.' },

{ id: 'studon-m1-34', type: 'mcq-single', module: 'm1', source: 'studon', recall: false,
  question: 'What is meant by the \'Gamut\' of a color space?',
  options: ['The entire range of colors that a specific device or model can produce', 'The linear transformation to convert from RGB to CMY', 'The coordinate system use to represent HSV colors'],
  correctIndexes: [0],
  explanation: 'Gamut is the complete set of colors a given device or color model/space is capable of reproducing.' },

{ id: 'studon-m1-35', type: 'mcq-multi', module: 'm1', source: 'studon', recall: false,
  question: '[Originally a matching question] Which data-type-to-color-scale-type assignments are correct? (select all that apply)',
  options: ['Categorical data: nominal → a categorical (qualitative) palette of distinct hues', 'Categorical data: ordinal → a sequential single-hue scale (e.g. light-to-dark brown)', 'Quantitative data → a sequential perceptually-uniform scale (e.g. viridis-like)', 'Categorical data: nominal → a sequential single-hue scale', 'Quantitative data → a categorical palette of distinct hues'],
  correctIndexes: [0, 1, 2],
  explanation: 'Nominal data has no order, so it needs a qualitative palette. Both ordinal and quantitative data are ordered, so both suit sequential scales — a single-hue scale for ordinal categories, and a perceptually-uniform scale (like viridis) to convey quantitative magnitude.' },

];
