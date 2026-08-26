// Builds a pixel matrix from a silhouette function instead of hand-typing every
// cell, so decorations can use a much finer grid (closer to the pets' level of
// detail) without manually authoring dozens of rows by hand.
//
// `regionAt(x, y)` returns 0 for empty, or a region id for filled. Any filled
// cell touching a *different* id (including 0/empty) becomes a black outline
// pixel — so adjacent shapes with different ids (e.g. separate toy blocks that
// touch) still get their own outline instead of merging into one blob.
export function buildOutlinedMatrix(
  width: number,
  height: number,
  regionAt: (x: number, y: number) => number,
  shadeAt: (x: number, y: number, region: number) => number,
): number[][] {
  const ids: number[][] = [];
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) row.push(regionAt(x, y));
    ids.push(row);
  }

  const matrix: number[][] = [];
  for (let y = 0; y < height; y++) {
    const row: number[] = [];
    for (let x = 0; x < width; x++) {
      const id = ids[y][x];
      if (id === 0) {
        row.push(0);
        continue;
      }
      const isEdge = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ].some(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        const neighborId = nx < 0 || ny < 0 || nx >= width || ny >= height ? 0 : ids[ny][nx];
        return neighborId !== id;
      });
      row.push(isEdge ? 1 : shadeAt(x, y, id));
    }
    matrix.push(row);
  }
  return matrix;
}
