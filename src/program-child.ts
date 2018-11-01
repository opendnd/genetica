import * as program from 'commander';
import wizardChild from './wizard-child';

// program basics
program
  .option('-o, --output <dir>', 'output directory')
  .option('-m, --mother <file>', 'mother *.per file')
  .option('-f, --father <file>', 'father *.per file')
  .parse(process.argv);

wizardChild(program.output, program.mother, program.father);
