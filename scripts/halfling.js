// set the command
const cmd = process.argv[2] || 'skin';

// generate skin colors
const skinColor = () => {
  const colors = [
    'porcelain', // 0
    'fair',      // 1
    'peach',     // 2
    'olive',     // 3
    'honey',     // 4
    'amber',     // 5
    'hazelnut',  // 6
    'ebony',     // 7
    'carob',     // 8
  ];

  // skin matrix with color index
  const map = [
    [0, 0, 1, 1, 1, 2, 2, 2, 3, 3],
    [0, 1, 1, 1, 2, 2, 2, 3, 3, 4],
    [1, 1, 1, 2, 2, 2, 3, 3, 4, 4],
    [1, 1, 2, 2, 2, 3, 3, 4, 4, 5],
    [1, 2, 2, 2, 3, 3, 4, 4, 5, 5],
    [2, 2, 2, 3, 3, 4, 4, 5, 5, 6],
    [2, 2, 3, 3, 4, 4, 5, 5, 6, 6],
    [2, 3, 3, 4, 4, 5, 5, 6, 6, 7],
    [3, 3, 4, 4, 5, 5, 6, 6, 7, 7],
    [3, 4, 4, 5, 5, 6, 6, 7, 7, 8],
  ];

  // base mapping
  const base = 'skin-color:C6';
  const genes = {};

  map.forEach((row, i) => {
    row.forEach((col, j) => {
      genes[`${base}:${i + 1}=${j + 1}`] = colors[col];
    });
  });

  console.log(genes);
};

switch (cmd) {
  case 'skin':
    skinColor();
    break;
  default:
    console.log('No command selected.');
    break;
}
