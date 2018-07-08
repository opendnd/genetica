// set the command
const cmd = process.argv[2] || 'skin';

// generate skin colors
const skinColor = () => {
  const colors = [
    'green',     // 0
    'silver',    // 1
    'red',       // 2
    'brown',     // 3
    'violet',    // 4
    'blue',      // 5
    'deep blue', // 6
    'black',     // 7
  ];

  // skin matrix with color index
  const map = [
    [1, 1, 1, 0, 0, 0, 0, 0],
    [1, 1, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 2, 3],
    [0, 0, 0, 0, 0, 2, 2, 5],
    [0, 0, 0, 0, 2, 4, 5, 5],
    [0, 0, 0, 2, 4, 4, 6, 7],
    [0, 0, 2, 2, 5, 6, 6, 7],
    [0, 3, 3, 5, 5, 7, 7, 7],
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
