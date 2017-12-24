const fs = require('fs');
const questions = require('questions');
const colors = require('colors/safe');
const path = require('path');
const rootDir = path.join(__dirname, '..');
const libDir = path.join(rootDir, 'lib');
const logo = fs.readFileSync(path.join(rootDir, 'logo.txt'), { encoding: 'utf-8' });
const Genetica = require(path.join(libDir, 'genetica'));
const defaults = require(path.join(libDir, 'defaults'));
const Renderer = require(path.join(libDir, 'renderer'));
const saver = require(path.join(libDir, 'saver'));

const generateAndSave = (opts, outputDir) => {
  const genetica = new Genetica(opts);
  const DNA = genetica.generate();

  Renderer.output(DNA);

  // save the file or not into a *.dyn file
  questions.askOne({ info: colors.cyan('Would you like to save your genes? (y | n)') }, (result) => {
    if (result === 'y' || result === 'yes') {
      const filename = `${new Date().getTime()}.dna`;
      const filepath = path.join(outputDir, filename);

      saver(filepath, DNA);
      process.stdout.write(colors.green(`Saving... ${filepath}\n`));
    } else {
      process.stdout.write(colors.white('Exited without save.\n'));
    }
  });
}

const wizard = (outputDir, genes) => {
  if (outputDir === undefined) outputDir = '.';

  // output welcome
  process.stdout.write(`\n${colors.blue(logo)}\n`);

  // ask a few questions
  questions.askMany({
    race: {
      info: colors.cyan('What race of genes do you want to generate? ') + colors.white(`(${defaults.races.join(' | ')})`),
      required: genes || false,
    },

    gender: {
      info: colors.cyan('What gender are these genes? ') + colors.white(`(${defaults.genders.join(' | ')})`),
      required: genes || false,
    },
  }, (opts) => {

    // if we have genes then ask questions about it
    if (genes && opts.race && opts.gender) {
      const template = defaults.DNA[opts.race];
      const Xdice = template.sex.x;
      const Ydice = template.sex.y;

      const geneQuestions = {};

      Object.keys(template.chromosomes).forEach((c) => {
        const dice = template.chromosomes[c];

        if (dice === 'sex') {
          geneQuestions[`C${c}`] = {
            info: colors.cyan(`What rolls do you want for the sex Chromosome ${c}? `) + colors.white(`ex: X1=Y1 (dice are X: ${Xdice}, Y: ${Ydice})`),
            required: true,
          };

          return;
        }

        geneQuestions[`C${c}`] = {
          info: colors.cyan(`What rolls do you want for Chromosome ${c}? `) + colors.white(`ex: 1=1 (dice is ${dice})`),
          required: true,
        };
      });

      // ask questions about the genes
      questions.askMany(geneQuestions, (geneOpts) => {
        opts = Object.assign(opts, geneOpts);
        generateAndSave(opts, outputDir);
        return;
      });
    } else {
      generateAndSave(opts, outputDir);
    }
  });
};

module.exports = wizard;
