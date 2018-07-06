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
  ];

  // skin matrix with color index
  const map = [
    [0, 0, 1, 1, 2, 2, 3, 3],
    [0, 1, 1, 2, 2, 3, 3, 3],
    [1, 1, 2, 2, 3, 3, 3, 4],
    [1, 2, 2, 3, 3, 3, 4, 4],
    [2, 2, 3, 3, 3, 4, 4, 5],
    [2, 3, 3, 3, 4, 4, 5, 5],
    [3, 3, 3, 4, 4, 5, 5, 6],
    [3, 3, 4, 4, 5, 5, 6, 6],
  ];

  // base mapping
  const base = 'skin-color:C7';
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
