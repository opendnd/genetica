const program = require('commander');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const Renderer = require(path.join(libDir, 'renderer'));
const Saver = require(path.join(libDir, 'saver'));
const wizard = require(path.join(libDir, 'wizard'));

// program basics
program
  .option('-i, --input <file>', 'input *.dna file')
  .option('-o, --output <dir>', 'output directory')
  .option('-f, --force', 'flag to input genes manually through the wizard')
  .option('-s, --seed', 'flag to seed the DNA with traits')
  .parse(process.argv);

// load a file
if (program.input) {
  const DNA = Saver.load(program.input);
  Renderer.output(DNA);

// go through the wizard
} else {
  wizard(program.output, program.genes, program.seed);
}
