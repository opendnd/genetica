const program = require('commander');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const wizardChild = require(path.join(libDir, 'wizard-child'));

// program basics
program
  .option('-o, --output <dir>', 'output directory')
  .option('-m, --mother <file>', 'mother *.per file')
  .option('-f, --father <file>', 'father *.per file')
  .parse(process.argv);

wizardChild(program.output, program.mother, program.father);
