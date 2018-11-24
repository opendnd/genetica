import { expect } from 'chai';
import defaults from '../src/defaults';

describe('defaults', () => {
  it('loads from default', () => {
    expect(defaults).to.be.an('object');
  });

  it('has races', () => {
    expect(defaults.races).to.be.an('object');
  });

  it('has genders', () => {
    expect(defaults.genderOptions).to.be.an('array');
  });
});
