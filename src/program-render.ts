import Renderer from './renderer';
import Saver from './saver';
import { DNA } from 'opendnd-core';

const program = require('commander');

// program basics
program
  .option('-i, --input <file>', 'input *.per file')
  .parse(process.argv);

// load a file or go through the wizard
if (program.input) {
  const result:DNA = Saver.load(program.input);

  Renderer.output(result);
}
