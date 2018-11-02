import { expect } from 'chai';
import { DNA, Genders } from 'opendnd-core';
import Genetica from '../src/genetica';

let genetica;

describe('Genetica', () => {
  before(() => {
    genetica = new Genetica();
  });

  it('can generate', () => {
    let result:DNA = genetica.generate();

    expect(result).to.be.an('object');
  });

  it('inherits opts properly', () => {
    genetica = new Genetica({
      race: { uuid: 'Dragonborn' },
      gender: Genders.Female,
    });

    let result:DNA = genetica.generate();

    expect(result.gender).to.eq(Genders.Female);
    expect(result.race.uuid).to.eq('Dragonborn');

    result = genetica.generate({
      race: { uuid: 'Dwarf' },
      gender: Genders.Male,
    });
    expect(result.gender).to.eq(Genders.Male);
    expect(result.race.uuid).to.eq('Dwarf');
  });

  context('validates opts', () => {
    it('checks for race and gender', () => {
      const result = genetica.validateOpts({});
      
      expect(result).to.be.an('object');
      expect(result.race.uuid).to.be.a('string');
      expect(result.gender).to.be.a('number');
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
          gender: Genders.Female,
          'chromosome-sex': 'X1=Y1',
        });
      } catch (err) {
        expect(err.message).to.include('Malformatted female sex chromosome');
      }
    });

    it('throws errors for bad male sex chromosome', () => {
      try {
        const result = genetica.validateOpts({
          gender: Genders.Male,
          'chromosome-sex': 'Y1=Y1',
        });
      } catch (err) {
        expect(err.message).to.include('Malformatted male sex chromosome');
      }
    });

    it('throws errors for large sex chromosome values', () => {
      try {
        const result = genetica.validateOpts({
          gender: Genders.Male,
          'chromosome-sex': 'X100000=Y1',
        });
      } catch (err) {
        expect(err.message).to.include('Sex chromosome value');
      }
    });
  });

  it('can generate a child', () => {
    const motherDNA:DNA = genetica.generate({
      gender: Genders.Female,
      race: { uuid: 'Dragonborn' },
    });
    const fatherDNA:DNA = genetica.generate({
      gender: Genders.Male,
      race: { uuid: 'Dragonborn' },
    });

    const result:DNA = genetica.generateChild({}, motherDNA, fatherDNA);

    expect(motherDNA).to.be.an('object');
    expect(fatherDNA).to.be.an('object');
    expect(result).to.be.an('object');
  });

  it('can generate parents', () => {
    const result:DNA = genetica.generate()
    const { motherDNA, fatherDNA } = genetica.generateParents(result);

    expect(result).to.be.an('object');
    expect(motherDNA).to.be.an('object');
    expect(fatherDNA).to.be.an('object');
  });

  it('getDefaults returns defaults with genders and races', () => {
    expect(Genetica.getDefaults().genders).to.be.an('array');
    expect(Genetica.getDefaults().races).to.be.an('array');
  });

  // generate by race
  context('races', () => {
    const testRace = (raceName) => {
      it(`generates for ${raceName}`, () => {
        genetica.resetOpts();

        const race = { uuid: raceName };

        const motherDNA:DNA = genetica.generate({
          gender: Genders.Female,
          race,
        });
        genetica.resetOpts();
        const fatherDNA:DNA = genetica.generate({
          gender: Genders.Male,
          race,
        });

        genetica.resetOpts();
        const result:DNA = genetica.generateChild({}, motherDNA, fatherDNA);
        const grandparentsDNA:any = genetica.generateParents(motherDNA);

        expect(motherDNA).to.be.an('object');
        expect(motherDNA.uuid).to.be.a('string');
        expect(fatherDNA).to.be.an('object');
        expect(fatherDNA.uuid).to.be.a('string');
        expect(result).to.be.an('object');
        expect(result.uuid).to.be.a('string');
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
