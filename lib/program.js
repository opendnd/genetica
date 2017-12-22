const program = require('commander');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const pinfo = require(path.join(rootDir, 'package.json'));
const Renderer = require(path.join(libDir, 'renderer'));
const loader = require(path.join(libDir, 'loader'));
const wizard = require(path.join(libDir, 'wizard'));

// program basics
program
  .version(pinfo.version, '-v, --version')
  .description(pinfo.description)
  .option('-i, --input <file>', 'input *.dna file')
  .option('-o, --output <dir>', 'output directory')
  .parse(process.argv);

// load a file or go through the wizard
if (program.input) {
  const DNA = loader(program.input);
  Renderer.output(DNA);
} else {
  wizard(program.output);
}
