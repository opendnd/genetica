import { expect } from 'chai';
import * as path from 'path';
import defaults from '../src/defaults';

describe('defaults', () => {
  it('loads from default', () => {
    expect(defaults).to.be.an('object');
  });

  it('has races', () => {
    expect(defaults.races).to.be.an('array');
  });

  it('has genders', () => {
    expect(defaults.genders).to.be.an('array');
  });
});
