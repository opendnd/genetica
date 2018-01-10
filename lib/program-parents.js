const program = require('commander');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const Renderer = require(path.join(libDir, 'renderer'));
const Saver = require(path.join(libDir, 'saver'));
const Genetica = require(path.join(libDir, 'genetica'));

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
    Saver.finish(outputDir, 'Would you like to save the father? (y | n)', parents.fatherDNA, parents.fatherDNA.uuid);
  });
}
