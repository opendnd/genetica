import * as program from 'commander';

import Renderer from './renderer';
import Saver from './saver';
import Genetica from './genetica';

// program basics
program
  .option('-c, --child <file>', 'child *.per file')
  .option('-o, --output <dir>', 'output directory')
  .parse(process.argv);

if (program.child) {
  const outputDir = program.output || '.';
  const DNA = Saver.load(program.child);
  const { race, gender } = DNA;
  const genetica = new Genetica({ race, gender });
  const parents = genetica.generateParents(DNA);

  Renderer.output(parents.motherDNA);
  Saver.finish(outputDir, 'Would you like to save the mother? (y | n)', parents.motherDNA, parents.motherDNA.uuid, () => {
    Renderer.output(parents.fatherDNA);
    Saver.finish(outputDir, 'Would you like to save the father? (y | n)', parents.fatherDNA, parents.fatherDNA.uuid, undefined);
  });
}
