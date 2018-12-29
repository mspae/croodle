import EmberObject from '@ember/object';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import moment from 'moment';

module('Integration | Component | create options dates', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders a ember-cli-bootstrap-datepicker component', async function(assert) {
    this.set('options', []);
    await render(hbs`{{#bs-form as |form|}}{{create-options-dates options=options form=form}}{{/bs-form}}`);

    assert.equal(
      this.$('.days .ember-view:has(.datepicker:first-child)').length, 1
    );
  });

  test('bootstrap-datepicker shows dates in options', async function(assert) {
    this.set('options', [
      EmberObject.create({ title: '2015-01-01' }),
      EmberObject.create({ title: '2015-01-02' })
    ]);
    await render(hbs`{{#bs-form as |form|}}{{create-options-dates options=options form=form}}{{/bs-form}}`);

    assert.equal(
      this.$('.days .ember-view:has(.datepicker:first-child)').datepicker('getDates')[0].toISOString(),
      moment('2015-01-01').toISOString(),
      'date is correct (a)'
    );
    assert.equal(
      this.$('.days .ember-view:has(.datepicker:first-child)').datepicker('getDates')[1].toISOString(),
      moment('2015-01-02').toISOString(),
      'date is correct (b)'
    );
  });

  test('dates set in bootstrap-datepicker are set to options', async function(assert) {
    this.set('options', []);
    await render(hbs`{{#bs-form as |form|}}{{create-options-dates options=options form=form}}{{/bs-form}}`);

    this.$('.days .ember-view:has(.datepicker:first-child)').datepicker('setDates', [
      moment('2015-01-01').toDate(),
      moment('2015-01-02').toDate()
    ]);
    assert.equal(
      this.get('options.0.title'),
      '2015-01-01',
      'dates are correct (a)'
    );
    assert.equal(
      this.get('options.1.title'),
      '2015-01-02',
      'dates are correct (b)'
    );

    this.$('.days .ember-view:has(.datepicker:first-child)').datepicker('setDates', [
      moment('2016-12-31').toDate(),
      moment('2016-01-01').toDate()
    ]);
    assert.equal(
      this.get('options.firstObject.title'),
      '2016-01-01',
      'dates are sorted'
    );
  });
});
