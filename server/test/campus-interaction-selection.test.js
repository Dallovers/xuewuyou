'use strict';
const { test } = require('node:test');
const assert = require('node:assert/strict');
const modulePromise = import('../../js/features/campus-hub/src/interaction-selection.js');
const door = { id: 'academy.door.classroom', label: '教室门', distance: .4, radius: 2.5 };
const equipment = { id: 'academy.equipment', label: '灯光、卷帘与投影', distance: 1.1, radius: 1.5 };

test('overlapping facilities remain selectable even when a door is closer', async () => {
 const { createInteractionSelection } = await modulePromise, selection = createInteractionSelection();
 assert.equal(selection.update([equipment, door]).id, door.id);
 assert.equal(selection.items.length, 2);
 assert.equal(selection.cycle().id, equipment.id);
 assert.equal(selection.cycle().id, door.id);
 assert.equal(selection.choose(equipment.id).id, equipment.id);
});

test('explicit selection survives frame updates and small movements until out of range', async () => {
 const { createInteractionSelection } = await modulePromise, selection = createInteractionSelection();
 selection.update([door, equipment]);selection.choose(equipment.id);
 assert.equal(selection.update([{ ...door, distance: .2 }, { ...equipment, distance: 1.3 }]).id, equipment.id);
 assert.equal(selection.update([door, { ...equipment, distance: 1.6 }]).id, door.id);
 assert.equal(selection.choose(equipment.id), null);
});

test('disabled, out-of-range and invalid targets cannot be clicked or cycled into', async () => {
 const { createInteractionSelection } = await modulePromise, selection = createInteractionSelection();
 selection.update([{ ...door, disabled: true }, { ...equipment, distance: 2 }, { id: 'invalid', distance: NaN, radius: 10 }]);
 assert.equal(selection.items.length, 0);
 assert.equal(selection.cycle(), null);assert.equal(selection.choose(door.id), null);
 assert.equal(selection.update([{ ...equipment, distance: equipment.radius }]).id, equipment.id);
 assert.equal(selection.cycle().id, equipment.id);
 selection.clear();assert.equal(selection.current, null);assert.deepEqual(selection.items, []);
});
