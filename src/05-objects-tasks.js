/* ************************************************************************************************
 *                                                                                                *
 * Please read the following tutorial before implementing tasks:                                   *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Object_initializer *
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object        *
 *                                                                                                *
 ************************************************************************************************ */


/**
 * Returns the rectangle object with width and height parameters and getArea() method
 *
 * @param {number} width
 * @param {number} height
 * @return {Object}
 *
 * @example
 *    const r = new Rectangle(10,20);
 *    console.log(r.width);       // => 10
 *    console.log(r.height);      // => 20
 *    console.log(r.getArea());   // => 200
 */
function Rectangle(width, height) {
  this.width = width;
  this.height = height;

  Rectangle.prototype.getArea = () => this.width * this.height;
}


/**
 * Returns the JSON representation of specified object
 *
 * @param {object} obj
 * @return {string}
 *
 * @example
 *    [1,2,3]   =>  '[1,2,3]'
 *    { width: 10, height : 20 } => '{"height":10,"width":20}'
 */
function getJSON(obj) {
  return JSON.stringify(obj);
}


/**
 * Returns the object of specified type from JSON representation
 *
 * @param {Object} proto
 * @param {string} json
 * @return {object}
 *
 * @example
 *    const r = fromJSON(Circle.prototype, '{"radius":10}');
 *
 */
function fromJSON(proto, json) {
  const obj = JSON.parse(json);
  return new proto.constructor(...Object.values(obj));
}


/**
 * Css selectors builder
 *
 * Each complex selector can consists of type, id, class, attribute, pseudo-class
 * and pseudo-element selectors:
 *
 *    element#id.class[attr]:pseudoClass::pseudoElement
 *              \----/\----/\----------/
 *              Can be several occurrences
 *
 * All types of selectors can be combined using the combination ' ','+','~','>' .
 *
 * The task is to design a single class, independent classes or classes hierarchy
 * and implement the functionality to build the css selectors using the provided cssSelectorBuilder.
 * Each selector should have the stringify() method to output the string representation
 * according to css specification.
 *
 * Provided cssSelectorBuilder should be used as facade only to create your own classes,
 * for example the first method of cssSelectorBuilder can be like this:
 *   element: function(value) {
 *       return new MySuperBaseElementSelector(...)...
 *   },
 *
 * The design of class(es) is totally up to you, but try to make it as simple,
 * clear and readable as possible.
 *
 * @example
 *
 *  const builder = cssSelectorBuilder;
 *
 *  builder.id('main').class('container').class('editable').stringify()
 *    => '#main.container.editable'
 *
 *  builder.element('a').attr('href$=".png"').pseudoClass('focus').stringify()
 *    => 'a[href$=".png"]:focus'
 *
 *  builder.combine(
 *      builder.element('div').id('main').class('container').class('draggable'),
 *      '+',
 *      builder.combine(
 *          builder.element('table').id('data'),
 *          '~',
 *           builder.combine(
 *               builder.element('tr').pseudoClass('nth-of-type(even)'),
 *               ' ',
 *               builder.element('td').pseudoClass('nth-of-type(even)')
 *           )
 *      )
 *  ).stringify()
 *    => 'div#main.container.draggable + table#data ~ tr:nth-of-type(even)   td:nth-of-type(even)'
 *
 *  For more examples see unit tests.
 */
class Selector {
  constructor() {
    this.x_element = '';
    this.x_id = '';
    this.x_class = [];
    this.x_attr = [];
    this.x_pseudoClass = [];
    this.x_pseudoElement = '';
    this.order = -1;
  }

  element(value) {
    if (this.x_element !== '') {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.checkOrder(0);
    this.x_element = value;
    return this;
  }

  id(value) {
    if (this.x_id !== '') {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.checkOrder(1);
    this.x_id = value;
    return this;
  }

  class(value) {
    this.checkOrder(2);
    this.x_class.push(value);
    return this;
  }

  attr(value) {
    this.checkOrder(3);
    this.x_attr.push(value);
    return this;
  }

  pseudoClass(value) {
    this.checkOrder(4);
    this.x_pseudoClass.push(value);
    return this;
  }

  pseudoElement(value) {
    this.checkOrder(5);
    if (this.x_pseudoElement !== '') {
      throw new Error('Element, id and pseudo-element should not occur more then one time inside the selector');
    }
    this.x_pseudoElement = value;
    return this;
  }

  stringify() {
    return this.stringItem(this.x_element, '') + this.stringItem(this.x_id, '#')
    + this.stringItem(this.x_class, '.') + this.stringItem(this.x_attr, '[', ']')
    + this.stringItem(this.x_pseudoClass, ':') + this.stringItem(this.x_pseudoElement, '::');
  }

  stringItem(item, prev, post = '') {
    if (item === '' || item === []) {
      return '';
    }
    if (Array.isArray(item)) {
      const str = item.reduce((a, b) => a + prev + b + post, '');
      return str;
    }
    const t = this.x_attr;
    this.x_attr = t;
    return prev + item + post;
  }

  checkOrder(i) {
    if (i < this.order) {
      throw new Error('Selector parts should be arranged in the following order: element, id, class, attribute, pseudo-class, pseudo-element');
    }
    this.order = i;
  }
}

function Combine(selector1, combo, selector2) {
  this.selector1 = selector1;
  this.selector2 = selector2;
  this.combo = combo;
}

Combine.prototype = {
  stringify() {
    return `${this.selector1.stringify()} ${this.combo} ${this.selector2.stringify()}`;
  },
};

const cssSelectorBuilder = {
  element(value) {
    return new Selector().element(value);
  },

  id(value) {
    return new Selector().id(value);
  },

  class(value) {
    return new Selector().class(value);
  },

  attr(value) {
    return new Selector().attr(value);
  },

  pseudoClass(value) {
    return new Selector().pseudoClass(value);
  },

  pseudoElement(value) {
    return new Selector().pseudoElement(value);
  },

  stringify() {
    return new Selector().stringify();
  },

  combine(selector1, combo, selector2) {
    return new Combine(selector1, combo, selector2);
  },
};


module.exports = {
  Rectangle,
  getJSON,
  fromJSON,
  cssSelectorBuilder,
};
