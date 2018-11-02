import { DNA, LinkRace, Genders } from 'opendnd-core';
import * as path from 'path';
import * as uuidv1 from 'uuid/v1';

import defaults from './defaults';
import Saver from './saver';
import SaverSeed from './saver-seed';

const rootDir = path.join(__dirname, '..');
const pinfo = require(path.join(rootDir, 'package.json'));
const Roll = require('roll');
const roll = new Roll();

// opts for genetica
interface GeneticaOpts {
  race?: LinkRace
  gender?: Genders
  mutation?: string
}

// this is the main class for generating genetics
class Genetica {
  opts:GeneticaOpts

  // init
  constructor(opts:GeneticaOpts = {}) {
    this.opts = opts;
  }

  // return defaults
  static getDefaults() {
    return defaults;
  }

  // load a file and return DNA
  static load(filepath) {
    return Saver.load(filepath);
  }

  // load a seed file
  static loadSeed(filepath) {
    return SaverSeed.load(filepath);
  }

  // validate the options
  validateOpts(opts:GeneticaOpts = {}) {
    const { races, genders } = defaults;

    // race
    if (opts.race === undefined) opts.race = { uuid: races.sample() };
    if (!races.includes(opts.race.uuid)) opts.race = { uuid: races.sample() };

    // gender
    if (opts.gender === undefined) opts.gender = defaults.genderMapping[genders.sample()];

    // check chromosomes
    Object.keys(opts).forEach((opt) => {
      if (opt.includes('chromosome-')) {
        if (!opts[opt].includes('=')) throw new Error('Malformatted chromosome input!');

        // get parts
        const parts = opts[opt].split('=');
        let partA = parts[0];
        let partB = parts[1];

        // get the template
        const template = defaults.DNA[opts.race.uuid];
        const c = opt.replace('chromosome-', '');

        // assign dice value unless it's the sex chromosome
        // otherwise set the x and y dice
        let dice;
        let diceValue;
        let Xdice;
        let XdiceValue;
        let Ydice;
        let YdiceValue;

        if (c !== 'sex') {
          dice = template.chromosomes[c];
          diceValue = parseInt(dice.replace('d', ''), 10);
        } else {
          Xdice = template.sex.x;
          XdiceValue = parseInt(Xdice.replace('d', ''), 10);
          Ydice = template.sex.y;
          YdiceValue = parseInt(Ydice.replace('d', ''), 10);
        }

        // check sex chromosomes
        if (opt === 'chromosome-sex') {
          if (opts.gender === Genders.Female) {
            if (!partA.includes('X')) throw new Error(`Malformatted female sex chromosome input "${partA}"!`);
            if (!partB.includes('X')) throw new Error(`Malformatted female sex chromosome input "${partB}"!`);

            partA = parseInt(partA.replace('X', ''), 10);
            partB = parseInt(partB.replace('X', ''), 10);

            if (partA > XdiceValue) throw new Error(`Sex chromosome value "${partA}" higher than possible dice roll of "${XdiceValue}"!`);
            if (partB > XdiceValue) throw new Error(`Sex chromosome value "${partB}" higher than possible dice roll of "${XdiceValue}"!`);
          }
          if (opts.gender === Genders.Male) {
            if (!partA.includes('X')) throw new Error(`Malformatted male sex chromosome input "${partA}"!`);
            if (!partB.includes('Y')) throw new Error(`Malformatted male sex chromosome input "${partB}"!`);

            partA = parseInt(partA.replace('X', ''), 10);
            partB = parseInt(partB.replace('Y', ''), 10);

            if (partA > XdiceValue) throw new Error(`Sex chromosome value "${partA}" higher than possible dice roll of "${XdiceValue}"!`);
            if (partB > YdiceValue) throw new Error(`Sex chromosome value "${partB}" higher than possible dice roll of "${YdiceValue}"!`);
          }
        } else {
          if (partA > diceValue) throw new Error(`Chromosome value "${partA}" higher than possible dice roll of "${diceValue}"!`);
          if (partB > diceValue) throw new Error(`Chromosome value "${partB}" higher than possible dice roll of "${diceValue}"!`);
        }
      }
    });

    this.opts = opts;
    return opts;
  }

  // reset opts
  resetOpts() {
    this.opts = {};
  }

  // map chromosomes to opts
  mapChromosomesToOpts(chromosomes = {}) {
    const { race } = this.opts;
    const template = defaults.DNA[race.uuid];
    const chromosomeOpts = {};

    Object.keys(chromosomes).forEach((c) => {
      const dice = template.chromosomes[c];
      let chromosomeName = `chromosome-${c}`;
      if (dice === 'sex') chromosomeName = 'chromosome-sex';

      chromosomeOpts[chromosomeName] = chromosomes[c];
    });

    return chromosomeOpts;
  }

  // generate child chromosomes
  generateChildChromosomes(motherChromosomes = {}, fatherChromosomes = {}) {
    const { race, gender } = this.opts;
    const template = defaults.DNA[race.uuid];
    const chromosomes = Object.assign({}, template.chromosomes);

    // assign chromosome from the mother and the father
    Object.keys(template.chromosomes).forEach((c) => {
      const dice = template.chromosomes[c];

      // get mother chromosome parts
      const motherParts = motherChromosomes[c].split('=');
      const fatherParts = fatherChromosomes[c].split('=');

      // assign the X from the father and a random X from the mother
      if (dice === 'sex') {
        if (gender === Genders.Female) {
          chromosomes[c] = `${motherParts.sample()}=${fatherParts[0]}`;
          return;
        }

        // always assign the way from the father
        chromosomes[c] = `${motherParts.sample()}=${fatherParts[1]}`;
        return;
      }

      // return the random chromosome parts
      chromosomes[c] = `${motherParts.sample()}=${fatherParts.sample()}`;
    });

    return chromosomes;
  }

  // generate parent chromosomes
  generateParentChromosomes(childChromosomes = {}) {
    const { race, gender } = this.opts;
    const template = defaults.DNA[race.uuid];
    const Xdice = template.sex.x;
    const Ydice = template.sex.y;
    const motherChromosomes = {};
    const fatherChromosomes = {};

    // generate the other half of chromosomes for the mother and father
    Object.keys(template.chromosomes).forEach((c) => {
      const dice = template.chromosomes[c];
      const parts = childChromosomes[c].split('=');
      const partA = parts[0];
      const partB = parts[1];
      let chromosomeName;

      // handle the sex chromosome differently
      if (dice === 'sex') {
        chromosomeName = 'chromosome-sex';

        if (gender === Genders.Male) {
          const XRes = roll.roll(`1${Xdice}`).result;

          fatherChromosomes[chromosomeName] = `X${XRes}=${partB}`;

          // flip a coins on where to assign the chromosome
          if (roll.roll('1d2').result === 1) {
            motherChromosomes[chromosomeName] = `${partA}=X${XRes}`;
          } else {
            motherChromosomes[chromosomeName] = `X${XRes}=${partA}`;
          }
        } else if (gender === Genders.Female) {
          const XRes = roll.roll(`1${Xdice}`).result;
          const YRes = roll.roll(`1${Ydice}`).result;

          // give one X to the father and the other to the mother
          let fatherX;
          let motherX;
          if (roll.roll('1d2').result === 1) {
            fatherX = partA;
            motherX = partB;
          } else {
            fatherX = partB;
            motherX = partA;
          }

          // set the father X
          fatherChromosomes[chromosomeName] = `${fatherX}=Y${YRes}`;

          // generate chromosomes as normal for the mother
          if (roll.roll('1d2').result === 1) {
            motherChromosomes[chromosomeName] = `X${XRes}=${motherX}`;
          } else {
            motherChromosomes[chromosomeName] = `${motherX}=X${XRes}`;
          }
        }
        return;
      }

      // regular chromosomes
      chromosomeName = `chromosome-${c}`;

      // get a regular roll for the father
      const fatherA = roll.roll(`1${dice}`).result;
      let fatherB;
      const motherA = roll.roll(`1${dice}`).result;
      let motherB;

      // give one to the father and one to the mother
      if (roll.roll('1d2').result === 1) {
        fatherB = partA;
        motherB = partB;
      } else {
        fatherB = partB;
        motherB = partA;
      }

      // generate chromosomes as normal for the father
      if (roll.roll('1d2').result === 1) {
        fatherChromosomes[chromosomeName] = `${fatherA}=${fatherB}`;
      } else {
        fatherChromosomes[chromosomeName] = `${fatherB}=${fatherA}`;
      }

      // generate chromosomes as normal for the mother
      if (roll.roll('1d2').result === 1) {
        motherChromosomes[chromosomeName] = `${motherA}=${motherB}`;
      } else {
        motherChromosomes[chromosomeName] = `${motherB}=${motherA}`;
      }
    });

    return {
      fatherChromosomes,
      motherChromosomes,
    };
  }

  // generate chromosomes
  generateChromosomes() {
    const { race, gender } = this.opts;
    const template = defaults.DNA[race.uuid];
    const Xdice = template.sex.x;
    const Ydice = template.sex.y;

    const chromosomes = Object.assign({}, template.chromosomes);

    // assign the roles to each chromosome
    Object.keys(template.chromosomes).forEach((c) => {
      const dice = template.chromosomes[c];
      let mutation = false;

      // check for mutation to bypass passed chromosome
      if (this.opts.mutation) {
        const mutationRoll = roll.roll(`1${this.opts.mutation}`).result;
        if (mutationRoll === 1) mutation = true;
      }

      // check passed opts for sex chromosome
      if ((dice === 'sex') && (this.opts['chromosome-sex']) && !mutation) {
        chromosomes[c] = this.opts['chromosome-sex'];
        return;
      }

      // check for other passed chromosomes
      if ((this.opts[`chromosome-${c}`]) && !mutation) {
        chromosomes[c] = this.opts[`chromosome-${c}`];
        return;
      }

      // do special roll for sex chromosomes
      if (dice === 'sex') {
        if (gender === Genders.Female) {
          const res = roll.roll(`2${Xdice}`).rolled;

          chromosomes[c] = `X${res[0]}=X${res[1]}`;
          return;
        }

        const XRes = roll.roll(`1${Xdice}`).result;
        const YRes = roll.roll(`1${Ydice}`).result;

        chromosomes[c] = `X${XRes}=Y${YRes}`;
        return;
      }

      // standard do here
      chromosomes[c] = roll.roll(`2${dice}`).rolled.join('=');
    });

    return chromosomes;
  }

  // generate traits from chromosomes
  generateTraits(chromosomes = {}) {
    const { race, gender } = this.opts;
    const template = defaults.DNA[race.uuid];
    const traits = {};

    // exit if the genes aren't defined yet
    if (template.genes === undefined) return traits;

    // 3=9
    // X1=Y3
    // iterate on the legends
    Object.keys(template.legend).forEach((legendName) => {
      const chromosome = template.legend[legendName];
      const rolls = chromosomes[chromosome];
      const parts = rolls.split('=');
      const partA = parts[0];
      const partB = parts[1];
      let a = parts[0];
      let b = parts[1];
      let dominant = partB;
      let commonGene = `${legendName}:C${chromosome}:`;
      let rareGene = `${legendName}:C${chromosome}:`;

      // don't give facial hair to females
      if ((gender === Genders.Female) && (legendName === 'hair-facial')) return;

      // female
      if (gender === Genders.Female) {
        a = a.replace('X', '');
        b = b.replace('X', '');
      // male
      } else if (gender === Genders.Male) {
        a = a.replace('X', '');
        b = b.replace('Y', '');
      }

      // convert to int
      a = parseInt(a, 10);
      b = parseInt(b, 10);

      // set a to dominant if it's higher
      if (a > b) dominant = partA;

      // add an extra X for female dominant genes
      if ((gender === Genders.Female) && (legendName === 'sex')) commonGene += 'X';
      commonGene += dominant;
      rareGene += rolls;

      // look for a rare trait
      if (Object.keys(template.genes).indexOf(rareGene) >= 0) {
        traits[legendName] = {
          gene: rareGene,
          trait: template.genes[rareGene],
        };
        return;
      }

      // look for a common trait
      if (Object.keys(template.genes).indexOf(commonGene) >= 0) {
        traits[legendName] = {
          gene: commonGene,
          trait: template.genes[commonGene],
        };
      }
    });

    return traits;
  }

  // generate a child
  generateChild(opts = {}, motherDNA:DNA = {} as DNA, fatherDNA:DNA = {} as DNA) {
    this.opts.race = { uuid: motherDNA.race.uuid };
    this.validateOpts(Object.assign(this.opts, opts));
    const { race, gender } = this.opts;
    const chromosomes = this.mapChromosomesToOpts(this.generateChildChromosomes(motherDNA.chromosomes, fatherDNA.chromosomes));

    const childOpts = Object.assign({
      race,
      gender,
    }, chromosomes);

    return this.generate(childOpts);
  }

  // generate parents
  generateParents(DNA: DNA) {
    const { race, gender, chromosomes } = DNA;
    this.opts = {
      race,
      gender,
    };

    // generate mother and father chromosomes
    const { motherChromosomes, fatherChromosomes } = this.generateParentChromosomes(chromosomes);

    // generate mother
    const motherOpts = {
      gender: Genders.Female,
      race,
    };
    const motherDNA = this.generate(Object.assign(motherOpts, motherChromosomes));

    // generate father
    const fatherOpts = {
      gender: Genders.Male,
      race,
    };
    const fatherDNA = this.generate(Object.assign(fatherOpts, fatherChromosomes));

    return {
      motherDNA,
      fatherDNA,
    };
  }

  // generate a person's DNA
  generate(opts:GeneticaOpts = {}): DNA {
    const { version } = pinfo;
    const genOpts:GeneticaOpts = this.validateOpts(Object.assign(this.opts, opts));
    const { race, gender } = genOpts;
    const chromosomes = this.generateChromosomes();
    const traits = this.generateTraits(chromosomes);
    const uuid = uuidv1();

    this.resetOpts();

    const result:DNA = {
      version,
      uuid,
      race,
      gender,
      chromosomes,
      traits,
      // TODO: add new fields
      size: null,
      weight: 0,
      height: 0,
      abstract: false,
      abstractProperties: {},
      derivation: null,
      notes: '',
    };

    return result;
  }
}

export default Genetica;
