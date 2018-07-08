// set the command
const cmd = process.argv[2] || 'skin';

// generate skin colors
const skinColor = () => {
  const colors = [
    'red',       // 0
    'silver',    // 1
    'green',     // 2
    'brown',     // 3
    'violet',    // 4
    'blue',      // 5
    'deep blue', // 6
    'black',     // 7
  ];

  // skin matrix with color index
  const map = [
    [7, 4, 5, 0, 0, 0, 1, 2],
    [3, 7, 6, 0, 0, 0, 0, 1],
    [0, 6, 7, 3, 0, 0, 0, 0],
    [0, 0, 4, 7, 2, 5, 0, 0],
    [0, 0, 5, 2, 7, 4, 0, 0],
    [0, 0, 0, 0, 3, 7, 6, 0],
    [1, 0, 0, 0, 0, 6, 7, 3],
    [2, 1, 0, 0, 0, 5, 4, 7],
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
