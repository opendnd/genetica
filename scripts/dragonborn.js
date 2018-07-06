// set the command
const cmd = process.argv[2] || 'skin';

// generate skin colors
const genColor = (type = 'skin') => {
  const colors = [
    // colors
    'white',  // 0
    'red',    // 1
    'green',  // 2
    'blue',   // 3
    'black',  // 4
    // metals
    'gold',   // 5
    'silver', // 6
    'bronze', // 7
    'brass',  // 8
    'copper', // 9
    // multi-colored
    'multi-colored (red/green)', // 10
    'multi-colored (blue/green)', // 11
  ];

  // skin matrix with color index
  const map = [
    [6, 0, 0, 0, 1, 1, 1, 1, 10, 2, 2, 5],
    [0, 6, 0, 1, 1, 1, 1, 10, 2, 2, 2, 2],
    [0, 0, 9, 1, 1, 1, 10, 2, 2, 2, 2, 2],
    [0, 1, 1, 9, 1, 10, 2, 2, 2, 2, 2, 11],
    [1, 1, 1, 1, 9, 2, 2, 2, 2, 2, 11, 3],
    [1, 1, 1, 10, 2, 9, 7, 2, 2, 11, 3, 3],
    [1, 1, 10, 2, 2, 7, 8, 2, 11, 3, 3, 3],
    [1, 10, 2, 2, 2, 2, 2, 8, 3, 3, 3, 3],
    [10, 2, 2, 2, 2, 2, 11, 3, 8, 3, 3, 4],
    [2, 2, 2, 2, 2, 11, 3, 3, 3, 8, 3, 4],
    [2, 2, 2, 2, 11, 3, 3, 3, 3, 3, 7, 4],
    [6, 2, 2, 11, 3, 3, 3, 3, 4, 4, 4, 7],
  ];

  // base mapping
  const base = `${type}-color:C6`;
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
    genColor('skin');
    break;
  case 'hair':
    genColor('hair');
    break;
  default:
    console.log('No command selected.');
    break;
}
