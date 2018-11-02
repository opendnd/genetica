import * as path from 'path';
import * as fs from 'fs';

import Genetica from './genetica';
import defaults from './defaults';
import Renderer from './renderer';
import Saver from './saver';
import { DNA } from 'opendnd-core';

const questions = require('questions');
const colors = require('colors/safe');

const rootDir = path.join(__dirname, '..');
const logo = fs.readFileSync(path.join(rootDir, 'logo.txt'), { encoding: 'utf-8' });

const wizardManual = (outputDir) => {
  if (outputDir === undefined) outputDir = '.';

  // output welcome
  process.stdout.write(`\n${colors.blue(logo)}\n`);

  // ask a few questions
  questions.askMany({
    race: {
      info: colors.cyan('What race of genes do you want to generate? ') + colors.white(`(${defaults.races.join(' | ')})`),
      required: true,
    },

    gender: {
      info: colors.cyan('What gender are these genes? ') + colors.white(`(${defaults.genders.join(' | ')})`),
      required: true,
    },
  }, (opts) => {
    const template = defaults.DNA[opts.race];
    const Xdice = template.sex.x;
    const Ydice = template.sex.y;

    const geneQuestions = {};

    Object.keys(template.chromosomes).forEach((c) => {
      const dice = template.chromosomes[c];

      if (dice === 'sex') {
        geneQuestions['chromosome-sex'] = {
          info: colors.cyan(`What rolls do you want for the sex Chromosome ${c}? `) + colors.white(`ex: X1=Y1 (dice are X: ${Xdice}, Y: ${Ydice})`),
          required: true,
        };

        return;
      }

      geneQuestions[`chromosome-${c}`] = {
        info: colors.cyan(`What rolls do you want for Chromosome ${c}? `) + colors.white(`ex: 1=1 (dice is ${dice})`),
        required: true,
      };
    });

    // ask questions about the genes
    questions.askMany(geneQuestions, (geneOpts) => {
      opts = Object.assign(opts, geneOpts);

      // convert the opts to the interface
      opts.gender = defaults.genderMapping[opts.gender];
      opts.race = { uuid: opts.race };

      const genetica = new Genetica(opts);
      const result:DNA = genetica.generate();

      Renderer.output(result);
      Saver.finish(outputDir, 'Would you like to save your genes? (y | n)', result, result.uuid, undefined);
    });
  });
};

export default wizardManual;
