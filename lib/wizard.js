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
const Saver = require(path.join(libDir, 'saver'));

const wizard = (outputDir) => {
  if (outputDir === undefined) outputDir = '.';

  // output welcome
  process.stdout.write(`\n${colors.blue(logo)}\n`);

  // ask a few questions
  questions.askMany({
    race: {
      info: colors.cyan('What race of genes do you want to generate? ') + colors.white(`(${defaults.races.join(' | ')})`),
      required: false,
    },

    gender: {
      info: colors.cyan('What gender are these genes? ') + colors.white(`(${defaults.genders.join(' | ')})`),
      required: false,
    },
  }, (opts) => {
    const genetica = new Genetica(opts);
    const DNA = genetica.generate();

    Renderer.output(DNA);
    Saver.finish(outputDir, 'Would you like to save your genes? (y | n)', DNA, DNA.uuid);
  });
};

module.exports = wizard;
