import { 
  DNA,
  ILinkRace,
  Genders,
  roll,
  IRace,
  Categories,
  DiceAndSex,
} from 'opendnd-core';
import * as path from 'path';
import * as uuidv1 from 'uuid/v1';

import defaults, { IGeneticaDefaults } from './defaults';
import Saver from './saver';
import SaverSeed from './saver-seed';

import "./extensions";

const Roll = require('roll');
const rootDir = path.join(__dirname, '..');
const pinfo = require(path.join(rootDir, 'package.json'));

// opts for genetica
export interface IGeneticaOpts {
  defaults?: IGeneticaDefaults;
  race?: ILinkRace;
  gender?: Genders;
  mutation?: string;
}

// this is the main class for generating genetics
class Genetica {
  public defaults: IGeneticaDefaults;
  public opts: IGeneticaOpts;
  public race: IRace;
  public gender: Genders;

  // init
  constructor(opts:IGeneticaOpts = {}) {
    this.opts = opts;
    this.defaults = opts.defaults || defaults;
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
  validateOpts(opts:IGeneticaOpts = {}) {
    // generate random race
    if (opts.race === undefined) opts.race = Object.values(this.defaults.races).sample();
    this.race = this.defaults.racesDict[opts.race.uuid];

    // generate random gender
    if (opts.gender === undefined) opts.gender = Object.values(Genders).sample();
    this.gender = opts.gender;

    // check chromosomes
    Object.keys(opts).forEach((opt) => {
      if (opt.includes('chromosome-')) {
        if (!opts[opt].includes('=')) throw new Error('Malformatted chromosome input!');

        // get parts
        const parts = opts[opt].split('=');
        let partA = parts[0];
        let partB = parts[1];

        // get the template
        const template = this.race;
        const c = opt.replace('chromosome-', '');

        // assign dice value unless it's the sex chromosome
        // otherwise set the x and y dice
        let dice;
        let diceValue;
        let Xdice;
        let XdiceValue;
        let Ydice;
        let YdiceValue;

        if (c !== DiceAndSex.Sex) {
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
    this.gender = undefined;
    this.race = undefined;
  }

  // map chromosomes to opts
  mapChromosomesToOpts(chromosomes = {}) {
    const template = this.race;
    const chromosomeOpts = {};

    Object.keys(chromosomes).forEach((c) => {
      const dice = template.chromosomes[c];
      let chromosomeName = `chromosome-${c}`;
      if (dice === DiceAndSex.Sex) chromosomeName = 'chromosome-sex';

      chromosomeOpts[chromosomeName] = chromosomes[c];
    });

    return chromosomeOpts;
  }

  // generate child chromosomes
  generateChildChromosomes(motherChromosomes = {}, fatherChromosomes = {}) {
    const template = this.race;
    const chromosomes = Object.assign({}, template.chromosomes);

    // assign chromosome from the mother and the father
    Object.keys(template.chromosomes).forEach((c) => {
      const dice = template.chromosomes[c];

      // get mother chromosome parts
      const motherParts = motherChromosomes[c].split('=');
      const fatherParts = fatherChromosomes[c].split('=');

      // assign the X from the father and a random X from the mother
      if (dice === DiceAndSex.Sex) {
        if (this.gender === Genders.Female) {
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
    const template = this.race;
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
      if (dice === DiceAndSex.Sex) {
        chromosomeName = 'chromosome-sex';

        if (this.gender === Genders.Male) {
          const XRes = roll(`1${Xdice}`);

          fatherChromosomes[chromosomeName] = `X${XRes}=${partB}`;

          // flip a coins on where to assign the chromosome
          if (roll('1d2') === 1) {
            motherChromosomes[chromosomeName] = `${partA}=X${XRes}`;
          } else {
            motherChromosomes[chromosomeName] = `X${XRes}=${partA}`;
          }
        } else if (this.gender === Genders.Female) {
          const XRes = roll(`1${Xdice}`);
          const YRes = roll(`1${Ydice}`);

          // give one X to the father and the other to the mother
          let fatherX;
          let motherX;
          if (roll('1d2') === 1) {
            fatherX = partA;
            motherX = partB;
          } else {
            fatherX = partB;
            motherX = partA;
          }

          // set the father X
          fatherChromosomes[chromosomeName] = `${fatherX}=Y${YRes}`;

          // generate chromosomes as normal for the mother
          if (roll('1d2') === 1) {
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
      const fatherA = roll(`1${dice}`);
      let fatherB;
      const motherA = roll(`1${dice}`);
      let motherB;

      // give one to the father and one to the mother
      if (roll('1d2') === 1) {
        fatherB = partA;
        motherB = partB;
      } else {
        fatherB = partB;
        motherB = partA;
      }

      // generate chromosomes as normal for the father
      if (roll('1d2') === 1) {
        fatherChromosomes[chromosomeName] = `${fatherA}=${fatherB}`;
      } else {
        fatherChromosomes[chromosomeName] = `${fatherB}=${fatherA}`;
      }

      // generate chromosomes as normal for the mother
      if (roll('1d2') === 1) {
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
    const template = this.race;
    const Xdice = template.sex.x;
    const Ydice = template.sex.y;

    const chromosomes = Object.assign({}, template.chromosomes);

    // assign the roles to each chromosome
    Object.keys(template.chromosomes).forEach((c) => {
      const dice = template.chromosomes[c];
      let mutation = false;

      // check for mutation to bypass passed chromosome
      if (this.opts.mutation) {
        const mutationRoll = roll(`1${this.opts.mutation}`);
        if (mutationRoll === 1) mutation = true;
      }

      // check passed opts for sex chromosome
      if ((dice === DiceAndSex.Sex) && (this.opts['chromosome-sex']) && !mutation) {
        chromosomes[c] = this.opts['chromosome-sex'];
        return;
      }

      // check for other passed chromosomes
      if ((this.opts[`chromosome-${c}`]) && !mutation) {
        chromosomes[c] = this.opts[`chromosome-${c}`];
        return;
      }

      // do special roll for sex chromosomes
      if (dice === DiceAndSex.Sex) {
        if (this.gender === Genders.Female) {
          const res = new Roll().roll(`2${Xdice}`).rolled;

          chromosomes[c] = `X${res[0]}=X${res[1]}`;
          return;
        }

        const XRes = roll(`1${Xdice}`);
        const YRes = roll(`1${Ydice}`);

        chromosomes[c] = `X${XRes}=Y${YRes}`;
        return;
      }

      // standard do here
      chromosomes[c] = new Roll().roll(`2${dice}`).rolled.join('=');
    });

    return chromosomes;
  }

  // generate height and weight
  generateHeightAndWeight(race:IRace) {
    const { height:tplHeight, weight:tplWeight } = this.race;

    /**
     * The roll given in the Height Modifier column determines 
     * the character's extra height (in inches) beyond the base height.
     * 
     * That same number multiplied by the dice roll or quantity given in 
     * the Weight Modifier column determines the character's extra weight 
     * (in pounds) beyond the base weight.
     */

    const height = tplHeight.base + roll(tplHeight.dice);
    
    let weight:number;
    if (tplWeight.multiplier) {
      weight = tplWeight.base + (height * tplWeight.multiplier);
    } else {
      weight = tplWeight.base + (height * roll(tplWeight.dice));
    }

    return {
      height,
      weight,
    };
  }

  // generate traits from chromosomes
  generateTraits(chromosomes = {}) {
    const template = this.race;
    const traits = {};

    // exit if the genes dictionary isn't defined yet
    if (template.dictionary === undefined) return traits;

    // 3=9
    // X1=Y3
    // iterate on the categories
    Object.keys(template.categories).forEach((categoryName) => {
      const chromosome = template.categories[categoryName];
      const rolls = chromosomes[chromosome];
      const parts = rolls.split('=');
      const partA = parts[0];
      const partB = parts[1];
      let a = parts[0];
      let b = parts[1];
      let dominant = partB;
      let commonGene = `${categoryName}:C${chromosome}:`;
      let rareGene = `${categoryName}:C${chromosome}:`;

      // don't give facial hair to females
      if ((this.gender === Genders.Female) && (categoryName === Categories.HairFacial)) return;

      // female
      if (this.gender === Genders.Female) {
        a = a.replace('X', '');
        b = b.replace('X', '');
      // male
      } else if (this.gender === Genders.Male) {
        a = a.replace('X', '');
        b = b.replace('Y', '');
      }

      // convert to int
      a = parseInt(a, 10);
      b = parseInt(b, 10);

      // set a to dominant if it's higher
      if (a > b) dominant = partA;

      // add an extra X for female dominant genes
      if ((this.gender === Genders.Female) && (categoryName === Categories.Sex)) commonGene += 'X';
      commonGene += dominant;
      rareGene += rolls;

      // look for a rare trait
      if (Object.keys(template.dictionary).indexOf(rareGene) >= 0) {
        traits[categoryName] = {
          gene: rareGene,
          trait: template.dictionary[rareGene],
        };
        return;
      }

      // look for a common trait
      if (Object.keys(template.dictionary).indexOf(commonGene) >= 0) {
        traits[categoryName] = {
          gene: commonGene,
          trait: template.dictionary[commonGene],
        };
      }
    });

    return traits;
  }

  // generate a child
  generateChild(opts:IGeneticaOpts, motherDNA:DNA, fatherDNA:DNA) {
    // check for proper inputs
    if (motherDNA.race.uuid !== fatherDNA.race.uuid) throw new Error('Cross-breeding between races is not yet supported!');
    if (motherDNA.gender !== Genders.Female) throw new Error('The mother is not female!');
    if (fatherDNA.gender !== Genders.Male) throw new Error('The father is not male!');

    // get other data
    this.opts.race = motherDNA.race;
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
  generateParents(DNA:DNA) {
    const { race, gender, chromosomes } = DNA;
    this.opts = {
      race,
      gender,
    };
    this.race = this.defaults.racesDict[race.uuid];

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
  generate(opts:IGeneticaOpts = {}): DNA {
    const { version } = pinfo;
    const genOpts:IGeneticaOpts = this.validateOpts(Object.assign(this.opts, opts));
    const raceLink:ILinkRace = genOpts.race;
    const gender = this.gender;
    let raceData = this.race;

    // add subrace if we have it
    if (raceData.subraces === undefined) raceData.subraces = [];
    if (raceData.subraces.length > 0) {
      const subrace = raceData.subraces.sample();

      // merge the subrace
      raceData = Object.assign(raceData, subrace);

      raceLink.subrace = {
        uuid: subrace.uuid,
        name: subrace.name,
      };
    }

    // set the standard values    
    const chromosomes = this.generateChromosomes();
    const traits = this.generateTraits(chromosomes);
    const uuid = uuidv1();
    const { size } = raceData;
    const { weight, height } = this.generateHeightAndWeight(raceData);

    // set the result
    const result:DNA = {
      version,
      uuid,
      name: uuid,
      race: raceLink,
      gender,
      chromosomes,
      traits,
      size,
      weight,
      height,
      abstract: false,
    };

    // reset the opts before closing out
    this.resetOpts();

    return result;
  }
}

export default Genetica;
