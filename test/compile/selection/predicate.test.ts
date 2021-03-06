/* tslint:disable quotemark */

import {assert} from 'chai';
import {nonPosition} from '../../../src/compile/mark/mixins';
import * as selection from '../../../src/compile/selection/selection';
import {expression} from '../../../src/filter';
import {VgEncodeEntry} from '../../../src/vega.schema';
import {parseUnitModel} from '../../util';

const predicate = selection.predicate;

describe('Selection Predicate', function() {
  const model = parseUnitModel({
    "mark": "circle",
    "encoding": {
      "x": {"field": "Horsepower","type": "quantitative"},
      "y": {"field": "Miles_per_Gallon","type": "quantitative"},
      "color": {
        "field": "Cylinders", "type": "ordinal",
        "condition": {
          "selection": "one",
          "value": "grey"
        }
      },
      "opacity": {
        "field": "Origin", "type": "nominal",
        "condition": {
          "selection": {"or": ["one", {"and": ["two", {"not": "thr-ee"}]}]},
          "value": 0.5
        }
      }
    }
  });

  model.parseScale();

  model.component.selection = selection.parseUnitSelection(model, {
    "one": {"type": "single"},
    "two": {"type": "multi", "resolve": "union"},
    "thr-ee": {"type": "interval", "resolve": "intersect_others"}
  });

  it('generates the predicate expression', function() {
    assert.equal(predicate(model, "one"),
      'vlPoint("one_store", "", datum, "union", "all")');

    assert.equal(predicate(model, {"not": "one"}),
      '!(vlPoint("one_store", "", datum, "union", "all"))');

    assert.equal(predicate(model, {"not": {"and": ["one", "two"]}}),
      '!((vlPoint("one_store", "", datum, "union", "all")) && ' +
      '(vlPoint("two_store", "", datum, "union", "all")))');

    assert.equal(predicate(model, {"and": ["one", "two", {"not": "thr-ee"}]}),
      '(vlPoint("one_store", "", datum, "union", "all")) && ' +
      '(vlPoint("two_store", "", datum, "union", "all")) && ' +
      '(!(vlInterval("thr_ee_store", "", datum, "intersect", "others")))');

    assert.equal(predicate(model, {"or": ["one", {"and": ["two", {"not": "thr-ee"}]}]}),
      '(vlPoint("one_store", "", datum, "union", "all")) || ' +
      '((vlPoint("two_store", "", datum, "union", "all")) && ' +
      '(!(vlInterval("thr_ee_store", "", datum, "intersect", "others"))))');
  });

  it('generates Vega production rules', function() {
    assert.deepEqual<VgEncodeEntry>(nonPosition('color', model, {vgChannel: 'fill'}), {
      fill: [
        {test: 'vlPoint("one_store", "", datum, "union", "all")', value: "grey"},
        {scale: "color", field: "Cylinders"}
      ]
    });

    assert.deepEqual<VgEncodeEntry>(nonPosition('opacity', model), {
      opacity: [
        {test: '(vlPoint("one_store", "", datum, "union", "all")) || ' +
              '((vlPoint("two_store", "", datum, "union", "all")) && ' +
              '(!(vlInterval("thr_ee_store", "", datum, "intersect", "others"))))',
          value: 0.5},
        {scale: "opacity", field: "Origin"}
      ]
    });
  });

  it('generates a selection filter', function() {
    assert.equal(expression(model, {"selection": "one"}),
      'vlPoint("one_store", "", datum, "union", "all")');

    assert.equal(expression(model, {"selection": {"not": "one"}}),
      '!(vlPoint("one_store", "", datum, "union", "all"))');

    assert.equal(expression(model, {"selection": {"not": {"and": ["one", "two"]}}}),
      '!((vlPoint("one_store", "", datum, "union", "all")) && ' +
      '(vlPoint("two_store", "", datum, "union", "all")))');

    assert.equal(expression(model, {"selection": {"and": ["one", "two", {"not": "thr-ee"}]}}),
      '(vlPoint("one_store", "", datum, "union", "all")) && ' +
      '(vlPoint("two_store", "", datum, "union", "all")) && ' +
      '(!(vlInterval("thr_ee_store", "", datum, "intersect", "others")))');

    assert.equal(expression(model, {"selection": {"or": ["one", {"and": ["two", {"not": "thr-ee"}]}]}}),
      '(vlPoint("one_store", "", datum, "union", "all")) || ' +
      '((vlPoint("two_store", "", datum, "union", "all")) && ' +
      '(!(vlInterval("thr_ee_store", "", datum, "intersect", "others"))))');
  });
});
