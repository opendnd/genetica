import * as fs from 'fs';
import * as path from 'path';

import Genetica, { IGeneticaOpts } from './genetica';
import { standardQuestions, sanitizeWizardOpts } from './common';
import Renderer from './renderer';
import Saver from './saver';
import { DNA } from 'opendnd-core';

const questions = require('questions');
const colors = require('colors/safe');

const rootDir = path.join(__dirname, '..');
const logo = fs.readFileSync(path.join(rootDir, 'logo.txt'), { encoding: 'utf-8' });

const wizard = (outputDir) => {
  if (outputDir === undefined) outputDir = '.';

  // output welcome
  process.stdout.write(`\n${colors.blue(logo)}\n`);

  // ask a few questions
  questions.askMany(standardQuestions, (opts) => {
    const genOpts:IGeneticaOpts = sanitizeWizardOpts(opts);
    const genetica = new Genetica(genOpts);
    const result:DNA = genetica.generate();

    Renderer.output(result);
    Saver.finish(outputDir, 'Would you like to save your genes? (y | n)', result, result.uuid, undefined);
  });
};

export default wizard;
