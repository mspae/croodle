import PageObject from 'ember-cli-page-object';
import { definition as Poll } from 'croodle/tests/pages/poll';
import { defaultsForApplication } from 'croodle/tests/pages/defaults';
import { hasFocus } from 'croodle/tests/pages/helpers';

let {
  collection,
  fillable,
  text,
  visitable
} = PageObject;

const { assign } = Object;

export default PageObject.create(assign({}, defaultsForApplication, Poll, {
  description: text('.description'),
  name: fillable('.name input'),
  nameHasFocus: hasFocus('.name input'),
  options: collection({
    answers: text('.selections .form-group:eq(0) .radio', { multiple: true }),
    itemScope: '.selections .form-group',
    item: {
      label: text('label.control-label')
    },
    labels: text('.selections .form-group label.control-label', { multiple: true })
  }),
  title: text('h2.title'),
  // use as .visit({ encryptionKey: ??? })
  visit: visitable('/poll/participation')
}));
