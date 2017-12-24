const fs = require('fs');
const questions = require('questions');
const colors = require('colors/safe');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const logo = fs.readFileSync(path.join(rootDir, 'logo.txt'), { encoding: 'utf-8' });
const Genetica = require(path.join(libDir, 'genetica'));
const defaults = require(path.join(libDir, 'defaults'));
const loader = require(path.join(libDir, 'loader'));
const Renderer = require(path.join(libDir, 'renderer'));
const saver = require(path.join(libDir, 'saver'));

const wizardChild = (outputDir, mother = '', father = '') => {
  if (outputDir === undefined) outputDir = '.';

  // output welcome
  process.stdout.write(`\n${colors.blue(logo)}\n`);

  // ask a few questions
  questions.askMany({
    gender: {
      info: colors.cyan('What gender is the child? ') + colors.white(`(${defaults.genders.join(' | ')})`),
      required: false,
    },
  }, (opts) => {
    const motherDNA = loader(mother);
    const fatherDNA = loader(father);

    // check for proper inputs
    if (motherDNA.race !== fatherDNA.race) throw new Error('Cross-breeding between races is not yet supported!');
    if (motherDNA.gender !== 'female') throw new Error('The mother is not female!');
    if (fatherDNA.gender !== 'male') throw new Error('The father is not male!');

    // add mother's race
    opts.race = motherDNA.race;

    const genetica = new Genetica(opts);
    const DNA = genetica.generateChild(opts, motherDNA, fatherDNA);

    Renderer.output(DNA);

    // save the file or not into a *.dyn file
    questions.askOne({ info: colors.cyan('Would you like to save your child? (y | n)') }, (result) => {
      if (result === 'y' || result === 'yes') {
        const filename = `${new Date().getTime()}.dna`;
        const filepath = path.join(outputDir, filename);

        saver(filepath, DNA);
        process.stdout.write(colors.green(`Saving... ${filepath}\n`));
      } else {
        process.stdout.write(colors.white('Exited without save.\n'));
      }
    });
  });
};

module.exports = wizardChild;
