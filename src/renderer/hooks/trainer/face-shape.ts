import { shapeKeys } from '../../../common-types';

const KINDS_OF_SHAPES = [
  [
    'MouthUpperUpRight',
    'MouthUpperUpLeft',
    'MouthLowerDownRight',
    'MouthLowerDownLeft',
    'MouthLowerRight',
    'MouthLowerLeft',
    'MouthLowerInside',
    'MouthLowerOverlay',
    'MouthLowerOverturn',
    'JawForward',
    'JawOpen',
    'JawRight',
  ],
  [
    'MouthUpperUpRight',
    'MouthUpperUpLeft',
    'MouthLowerDownRight',
    'MouthLowerDownLeft',
    'MouthLowerRight',
    'MouthLowerLeft',
    'MouthLowerInside',
    'MouthLowerOverlay',
    'MouthLowerOverturn',
    'JawForward',
    'JawOpen',
    'JawLeft',
  ],
  ['MouthApeShape', 'MouthPout', 'JawLeft', 'JawOpen', 'JawForward'],
  ['MouthApeShape', 'MouthPout', 'JawRight', 'JawOpen', 'JawForward'],
  ['MouthSmileRight', 'MouthOpen'],
  ['MouthSmileLeft', 'MouthOpen'],
  ['MouthSadRight'],
  ['MouthSadLeft'],
  ['CheekPuffRight', 'JawLeft'],
  ['CheekPuffRight', 'JawRight'],
  ['CheekPuffLeft', 'JawLeft'],
  ['CheekPuffLeft', 'JawRight'],
];

export function randomFaceShape() {
  const blendshape = Array.from(
    { length: Object.values(shapeKeys).length },
    () => 0
  );
  const index = Math.floor(Math.random() * KINDS_OF_SHAPES.length);
  const shape = KINDS_OF_SHAPES[index];
  return blendshape.map((val, index) =>
    shape.includes(shapeKeys[index]) ? Math.random() : 0
  );
}
