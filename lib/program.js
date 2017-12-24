const questions = require('questions');
const program = require('commander');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const pinfo = require(path.join(rootDir, 'package.json'));
const Renderer = require(path.join(libDir, 'renderer'));
const loader = require(path.join(libDir, 'loader'));
const wizard = require(path.join(libDir, 'wizard'));
const wizardChild = require(path.join(libDir, 'wizard-child'));

// program basics
program
  .version(pinfo.version, '-v, --version')
  .description(pinfo.description)
  .option('-i, --input <file>', 'input *.dna file')
  .option('-o, --output <dir>', 'output directory')
  .option('-m, --mother <file>', 'mother *.dna file')
  .option('-f, --father <file>', 'father *.dna file')
  .parse(process.argv);

// load a file
if (program.input) {
  const DNA = loader(program.input);
  Renderer.output(DNA);

// generate a child
} else if (program.mother && program.father) {
  wizardChild(program.output, program.mother, program.father);

// go through the wizard
} else {
  wizard(program.output);
}
