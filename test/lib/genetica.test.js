/* eslint-disable */

const expect = require('chai').expect;
const path = require('path');
const rootDir = path.join(__dirname, '..', '..');
const libDir = path.join(rootDir, 'lib');
const Genetica = require(path.join(libDir, 'genetica'));
let genetica, genes;

describe('Genetica', () => {
  before(() => {
    genetica = new Genetica();
  });

  it('can generate', () => {
    genes = genetica.generate();

    expect(genes).to.be.an('object');
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
        expect(err.message).to.eq('Malformatted chromosome input!');
      }
    });

    it('throws errors for too large dice rolls', () => {
      try {
        const result = genetica.validateOpts({
          'chromosome-1': '100000=1',
        });
      } catch (err) {
        expect(err.message).to.eq('Chromosome value higher than possible dice roll!');
      }
    });

    it('throws errors for bad female sex chromosome', () => {
      try {
        const result = genetica.validateOpts({
          gender: 'female',
          'chromosome-sex': 'X1=Y1',
        });
      } catch (err) {
        expect(err.message).to.eq('Malformatted female sex chromosome input!');
      }
    });

    it('throws errors for bad male sex chromosome', () => {
      try {
        const result = genetica.validateOpts({
          gender: 'male',
          'chromosome-sex': 'Y1=Y1',
        });
      } catch (err) {
        expect(err.message).to.eq('Malformatted male sex chromosome input!');
      }
    });

    it('throws errors for large sex chromosome values', () => {
      try {
        const result = genetica.validateOpts({
          gender: 'male',
          'chromosome-sex': 'X100000=Y1',
        });
      } catch (err) {
        expect(err.message).to.eq('Sex chromosome value higher than possible dice roll!');
      }
    });
  });
});
