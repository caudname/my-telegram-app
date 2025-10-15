import { forwardRef } from 'react';
import { GridDnDExample as GridDnDExampleComponent, type GridDnDExampleProps } from './GridDnDExample';

export const GridDnDExample = forwardRef<{ resetLevel: () => void }, GridDnDExampleProps>(GridDnDExampleComponent);
export { type LevelData, type GridDnDExampleProps } from './GridDnDExample';