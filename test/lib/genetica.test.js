/* eslint-disable */

const expect = require('chai').expect;
const path = require('path');
const rootDir = path.join(__dirname, '..', '..');
const libDir = path.join(rootDir, 'lib');
const Genetica = require(path.join(libDir, 'genetica'));
let genetica;

describe('Genetica', () => {
  before(() => {
    genetica = new Genetica();
  });

  it('can generate', () => {
    DNA = genetica.generate();

    expect(DNA).to.be.an('object');
  });

  context('validates opts', () => {
    it('checks for race and gender', () => {
      const result = genetica.validateOpts({});
      
      expect(result).to.be.an('object');
      expect(result.race).to.be.a('string');
      expect(result.gender).to.be.a('string');
    });

    it('throws errors for poorly malformatted chromosome values', () => {
      try {
        const result = genetica.validateOpts({
          'chromosome-1': '1',
        });
      } catch (err) {
        expect(err.message).to.include('Malformatted chromosome input');
      }
    });

    it('throws errors for too large dice rolls', () => {
      try {
        const result = genetica.validateOpts({
          'chromosome-1': '100000=1',
        });
      } catch (err) {
        expect(err.message).to.include('Chromosome value');
      }
    });

    it('throws errors for bad female sex chromosome', () => {
      try {
        const result = genetica.validateOpts({
          gender: 'female',
          'chromosome-sex': 'X1=Y1',
        });
      } catch (err) {
        expect(err.message).to.include('Malformatted female sex chromosome');
      }
    });

    it('throws errors for bad male sex chromosome', () => {
      try {
        const result = genetica.validateOpts({
          gender: 'male',
          'chromosome-sex': 'Y1=Y1',
        });
      } catch (err) {
        expect(err.message).to.include('Malformatted male sex chromosome');
      }
    });

    it('throws errors for large sex chromosome values', () => {
      try {
        const result = genetica.validateOpts({
          gender: 'male',
          'chromosome-sex': 'X100000=Y1',
        });
      } catch (err) {
        expect(err.message).to.include('Sex chromosome value');
      }
    });
  });

  it('can generate a child', () => {
    const motherDNA = genetica.generate({
      gender: 'female',
      race: 'Dragonborn',
    });
    const fatherDNA = genetica.generate({
      gender: 'male',
      race: 'Dragonborn',
    });

    const DNA = genetica.generateChild({}, motherDNA, fatherDNA);

    expect(motherDNA).to.be.an('object');
    expect(fatherDNA).to.be.an('object');
    expect(DNA).to.be.an('object');
  });

  it('can generate parents', () => {
    const DNA = genetica.generate()
    const { motherDNA, fatherDNA } = genetica.generateParents(DNA);

    expect(DNA).to.be.an('object');
    expect(motherDNA).to.be.an('object');
    expect(fatherDNA).to.be.an('object');
  });

  it('getDefaults returns defaults with genders and races', () => {
    expect(Genetica.getDefaults().genders).to.be.an('array');
    expect(Genetica.getDefaults().races).to.be.an('array');
  });

  // generate by race
  context('races', () => {
    const testRace = (race) => {
      it(`generates for ${race}`, () => {
        genetica.resetOpts();
        const motherDNA = genetica.generate({
          gender: 'female',
          race,
        });
        genetica.resetOpts();
        const fatherDNA = genetica.generate({
          gender: 'male',
          race,
        });

        genetica.resetOpts();
        const DNA = genetica.generateChild({}, motherDNA, fatherDNA);
        const grandparentsDNA = genetica.generateParents(motherDNA);

        expect(motherDNA).to.be.an('object');
        expect(motherDNA.uuid).to.be.a('string');
        expect(fatherDNA).to.be.an('object');
        expect(fatherDNA.uuid).to.be.a('string');
        expect(DNA).to.be.an('object');
        expect(DNA.uuid).to.be.a('string');
        expect(grandparentsDNA).to.be.an('object');
        expect(grandparentsDNA.motherDNA.uuid).to.be.a('string');
        expect(grandparentsDNA.fatherDNA.uuid).to.be.a('string');
      });
    };

    testRace('Dragonborn');
    testRace('Dwarf');
    testRace('Elf');
    testRace('Gnome');
    testRace('Half-Elf');
    testRace('Half-Orc');
    testRace('Halfling');
    testRace('Human');
    testRace('Tiefling');
  });
});
