/** 
 * @author Mircea Diaconescu
 *
 * The Item class representing the items available on the map.
 * @param type
 *          the type of this item (use the Item.Type.XXX enum values)
 * @param value
 *          the value of this item (used for scoring or other computations)
 * @param graphics
 *          the graphics to be attached to this item
 */
function Item(type, value, graphics) {
  this.type = type || Item.Type.OBSTACLE;
  this.value = value || 0;
  this.setGraphics(graphics);
};

/** 
 * @author Mircea Diaconescu
 *
 * Set the attached graphics to this item.
 * @param graphics
 *          the graphics to be attached to this item
 */
Item.prototype.setGraphics = function (graphics) {
  this.graphics = graphics || null;
};

/**
 * Define the type of items that can be created
 */
Item.Type = {};
Object.defineProperties(Item.Type, {
  "OBSTACLE": {value: 1, writable: false, enumerable: true, configurable: false},
  "APPLE": {value: 2, writable: false, enumerable: true, configurable: false},
  "CHERRY": {value: 3, writable: false, enumerable: true, configurable: false},
  "STRAWBERRY": {value: 4, writable: false, enumerable: true, configurable: false},
  "RASPBERRY": {value: 5, writable: false, enumerable: true, configurable: false},
  "LEMON": {value: 6, writable: false, enumerable: true, configurable: false}
});
