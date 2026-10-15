// Between the strokes, and between the first one and the edge (px)
export const GAP = 2
// Where the strokes meet the line (px from the edge). At 45°, they reach the edge at the same distance from the line.
export const STROKES = [2, 3.5, 5].map((index) => ({ offset: index * GAP, length: index * GAP * Math.SQRT2 }))
