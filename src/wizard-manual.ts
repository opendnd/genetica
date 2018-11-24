import * as path from 'path';
import * as fs from 'fs';

import Genetica, { IGeneticaOpts } from './genetica';
import { standardQuestions, sanitizeWizardOpts } from './common';
import defaults from './defaults';
import Renderer from './renderer';
import Saver from './saver';
import { DNA, Categories } from 'opendnd-core';

const questions = require('questions');
const colors = require('colors/safe');

const rootDir = path.join(__dirname, '..');
const logo = fs.readFileSync(path.join(rootDir, 'logo.txt'), { encoding: 'utf-8' });

const wizardManual = (outputDir) => {
  if (outputDir === undefined) outputDir = '.';

  // output welcome
  process.stdout.write(`\n${colors.blue(logo)}\n`);

  // ask a few questions
  questions.askMany(standardQuestions, (opts) => {
    const tplOpts:IGeneticaOpts = sanitizeWizardOpts(opts);
    const template = defaults.racesDict[tplOpts.race.uuid];
    const Xdice = template.sex.x;
    const Ydice = template.sex.y;

    const geneQuestions = {};

    Object.keys(template.chromosomes).forEach((c) => {
      const dice = template.chromosomes[c];

      if (dice === Categories.Sex) {
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
      let genOpts:IGeneticaOpts = sanitizeWizardOpts(geneOpts);
      genOpts = Object.assign(tplOpts, genOpts);

      const genetica = new Genetica(genOpts);
      const result:DNA = genetica.generate();

      Renderer.output(result);
      Saver.finish(outputDir, 'Would you like to save your genes? (y | n)', result, result.uuid, undefined);
    });
  });
};

export default wizardManual;
