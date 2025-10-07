import React, { useState } from 'react';
import {
  DndContext,
  useDraggable,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent, type DragStartEvent
} from '@dnd-kit/core';
import './GridDnDExample.css';

type GridCoord = { col: number; row: number };
type BlockType = 'standard' | 'tall' | 'wide';

type Block = {
  id: string;
  position: GridCoord;
  type: BlockType;
};

const cellSize = 70;
const GRID_SIZE = 5;

const initialBlocks: Block[] = [
  { id: 'A', position: { col: 2, row: 4 }, type: 'standard' },
  { id: 'B', position: { col: 4, row: 2 }, type: 'standard' },
  // { id: 'C', position: { col: 3, row: 2 }, type: 'standard' },
  { id: 'D', position: { col: 3, row: 0 }, type: 'tall' },
  { id: 'E', position: { col: 0, row: 0 }, type: 'wide' }
];

const obstacles: GridCoord[] = [
  { col: 0, row: 1 },
  { col: 1, row: 2 },
  { col: 2, row: 3 }
];

function isOccupied(col: number, row: number, blocks: Block[], ignoreId?: string): boolean {
  if (col < 0 || col >= GRID_SIZE || row < 0 || row >= GRID_SIZE) return true;
  if (obstacles.some(o => o.col === col && o.row === row)) return true;

  for (const block of blocks) {
    if (block.id === ignoreId) continue;
    const occupiedCells = getOccupiedCells(block);
    if (occupiedCells.some(c => c.col === col && c.row === row)) {
      return true;
    }
  }

  return false;
}

function getOccupiedCells(block: Block): GridCoord[] {
  const { col, row } = block.position;
  switch (block.type) {
    case 'tall':
      return [
        { col, row },
        { col, row: row + 1 }
      ];
    case 'wide':
      return [
        { col, row },
        { col: col + 1, row }
      ];
    default:
      return [{ col, row }];
  }
}

interface DraggableBlockProps {
  block: Block;
  draggingId: string | null
}

function DraggableBlock({ block, draggingId }: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: block.id });

  const width = block.type === 'wide' ? cellSize * 2 : cellSize;
  const height = block.type === 'tall' ? cellSize * 2 : cellSize;
  const isBeingDragged = draggingId === block.id;

  const style: React.CSSProperties = {
    position: 'absolute',
    width,
    height,
    transform: `translate3d(${ block.position.col * cellSize }px, ${ block.position.row * cellSize }px, 0)`,
    transition: isBeingDragged ? 'none' : 'transform 300ms ease',
    zIndex: isBeingDragged ? 1000 : 'auto',
    backgroundColor: block.type === 'tall' || block.type === 'wide' ? '#E67E22' : '#3498DB',
    color: 'white',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    cursor: 'grab',
    userSelect: 'none',
    pointerEvents: 'auto',
    touchAction: 'none'
  };

  return (
    <div
      ref={ setNodeRef }
      { ...listeners }
      { ...attributes }
      style={ style }
      draggable={ false } // предотвращает HTML5 drag
    >
      { block.id }
    </div>
  );
}

function computeNewPosition(
  block: Block,
  to: GridCoord,
  blocks: Block[]
): GridCoord {
  const from = block.position;

  if (block.type === 'standard') {
    const dCol = to.col - from.col;
    const dRow = to.row - from.row;

    const dirCol = Math.sign(dCol);
    const dirRow = Math.sign(dRow);

    if ((dirCol !== 0 && dirRow !== 0) || (dirCol === 0 && dirRow === 0)) {
      return from;
    }

    let currentCol = from.col + dirCol;
    let currentRow = from.row + dirRow;

    let jumped = false;

    while (
      currentCol >= 0 &&
      currentCol < GRID_SIZE &&
      currentRow >= 0 &&
      currentRow < GRID_SIZE &&
      isOccupied(currentCol, currentRow, blocks)
      ) {
      currentCol += dirCol;
      currentRow += dirRow;
      jumped = true;
    }

    if (
      currentCol < 0 ||
      currentCol >= GRID_SIZE ||
      currentRow < 0 ||
      currentRow >= GRID_SIZE
    ) {
      return from;
    }

    if (jumped && !isOccupied(currentCol, currentRow, blocks)) {
      return { col: currentCol, row: currentRow };
    }

    return from;
  }

  if (block.type === 'tall') {
    // Только вертикальные перемещения
    if (to.col !== from.col) return from;

    const direction = Math.sign(to.row - from.row);
    if (direction === 0) return from;

    let nextRow = from.row + direction;
    while (
      nextRow >= 0 &&
      nextRow + 1 < GRID_SIZE &&
      !isOccupied(from.col, nextRow, blocks, block.id) &&
      !isOccupied(from.col, nextRow + 1, blocks, block.id)
      ) {
      if (nextRow === to.row) {
        return { col: from.col, row: nextRow };
      }
      nextRow += direction;
    }

    // Если точно не попали — вернём ближайшую допустимую позицию
    const validTargets = getValidMoveTargetsForTallBlock(block, blocks);
    const nearest = validTargets.find(t => t.row === to.row);
    return nearest || from;
  }

  if (block.type === 'wide') {
    // Только горизонтальные перемещения
    if (to.row !== from.row) return from;

    const direction = Math.sign(to.col - from.col);
    if (direction === 0) return from;

    let nextCol = from.col + direction;
    while (
      nextCol >= 0 &&
      nextCol + 1 < GRID_SIZE &&
      !isOccupied(nextCol, from.row, blocks, block.id) &&
      !isOccupied(nextCol + 1, from.row, blocks, block.id)
      ) {
      if (nextCol === to.col) {
        return { col: nextCol, row: from.row };
      }
      nextCol += direction;
    }

    // Найти ближайшую допустимую
    const validTargets = getValidMoveTargetsForWideBlock(block, blocks);
    const nearest = validTargets.find(t => t.col === to.col);
    return nearest || from;
  }

  return from;
}

function getValidJumpTargets(from: GridCoord, blocks: Block[]): GridCoord[] {
  const directions = [
    { dc: 0, dr: -1 }, // вверх
    { dc: 1, dr: 0 },  // вправо
    { dc: 0, dr: 1 },  // вниз
    { dc: -1, dr: 0 } // влево
  ];

  const targets: GridCoord[] = [];

  for (const { dc, dr } of directions) {
    let jumped = false;
    let col = from.col + dc;
    let row = from.row + dr;

    // Пропускаем цепочку занятых клеток
    while (isOccupied(col, row, blocks)) {
      jumped = true;
      col += dc;
      row += dr;

      if (col < 0 || col >= GRID_SIZE || row < 0 || row >= GRID_SIZE) {
        break;
      }
    }

    // Если прыгали и нашли свободную клетку — запоминаем
    if (
      jumped &&
      col >= 0 && col < GRID_SIZE &&
      row >= 0 && row < GRID_SIZE &&
      !isOccupied(col, row, blocks)
    ) {
      targets.push({ col, row });
    }
  }

  return targets;
}

function getValidMoveTargetsForTallBlock(block: Block, blocks: Block[]): GridCoord[] {
  const targets: GridCoord[] = [];
  const { col, row } = block.position;

  // Вверх
  for (let offset = 1; row - offset >= 0; offset++) {
    const upper = row - offset;
    const lower = row - offset + 1;

    if (
      isOccupied(col, upper, blocks, block.id) ||
      isOccupied(col, lower, blocks, block.id)
    ) break;

    targets.push({ col, row: upper });
  }

  // Вниз
  for (let offset = 1; row + offset + 1 < GRID_SIZE; offset++) {
    const upper = row + offset;
    const lower = row + offset + 1;

    if (
      isOccupied(col, upper, blocks, block.id) ||
      isOccupied(col, lower, blocks, block.id)
    ) break;

    targets.push({ col, row: upper });
  }

  return targets;
}

function getValidMoveTargetsForWideBlock(block: Block, blocks: Block[]): GridCoord[] {
  const targets: GridCoord[] = [];
  const { col, row } = block.position;

  // Влево
  for (let offset = 1; col - offset >= 0; offset++) {
    const left = col - offset;
    const right = col - offset + 1;

    if (
      isOccupied(left, row, blocks, block.id) ||
      isOccupied(right, row, blocks, block.id)
    ) break;

    targets.push({ col: left, row });
  }

  // Вправо
  for (let offset = 1; col + offset + 1 < GRID_SIZE; offset++) {
    const left = col + offset;
    const right = col + offset + 1;

    if (
      isOccupied(left, row, blocks, block.id) ||
      isOccupied(right, row, blocks, block.id)
    ) break;

    targets.push({ col: left, row });
  }

  return targets;
}

export const GridDnDExample = () => {
  const [ blocks, setBlocks ] = useState<Block[]>(initialBlocks);
  const [ draggingId, setDraggingId ] = useState<string | null>(null);
  const [ highlightedCells, setHighlightedCells ] = useState<GridCoord[]>([]);
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  function handleDragStart(event: DragStartEvent) {
    const block = blocks.find(b => b.id === event.active.id);
    if (!block) return;

    setDraggingId(block.id);

    if (block.type === 'standard') {
      const validTargets = getValidJumpTargets(block.position, blocks);
      setHighlightedCells(validTargets);
    } else if (block.type === 'tall') {
      const validTargets = getValidMoveTargetsForTallBlock(block, blocks);
      const cellsToHighlight = validTargets.flatMap(({ col, row }) => [
        { col, row },
        { col, row: row + 1 }
      ]);
      setHighlightedCells(cellsToHighlight);
    } else if (block.type === 'wide') {
      const validTargets = getValidMoveTargetsForWideBlock(block, blocks);
      const cellsToHighlight = validTargets.flatMap(({ col, row }) => [
        { col, row },
        { col: col + 1, row }
      ]);
      setHighlightedCells(cellsToHighlight);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event;
    const block = blocks.find(b => b.id === active.id);
    if (!block) return;

    const approxCol = block.position.col + Math.round(delta.x / cellSize);
    const approxRow = block.position.row + Math.round(delta.y / cellSize);

    const targetPos = {
      col: Math.min(Math.max(approxCol, 0), GRID_SIZE - 1),
      row: Math.min(Math.max(approxRow, 0), GRID_SIZE - 1)
    };

    const newPos = computeNewPosition(block, targetPos, blocks);

    if (newPos.col !== block.position.col || newPos.row !== block.position.row) {
      setBlocks(prev =>
        prev.map(b => (b.id === block.id ? { ...b, position: newPos } : b))
      );
    }

    setHighlightedCells([]);
    setDraggingId(null); // <--- СБРОС
  }


  const cells = Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => i);

  return (
    <div className='container'>
      <DndContext
        sensors={ sensors }
        onDragStart={ handleDragStart }
        onDragEnd={ handleDragEnd }
      >
        <div
          className='grid'
          style={ {
            position: 'relative',
            width: cellSize * GRID_SIZE,
            height: cellSize * GRID_SIZE,
            display: 'grid',
            gridTemplateColumns: `repeat(${ GRID_SIZE }, ${ cellSize }px)`,
            gridTemplateRows: `repeat(${ GRID_SIZE }, ${ cellSize }px)`,
            border: '2px solid #ccc'
          } }
        >
          { cells.map((_, i) => {
            const col = i % GRID_SIZE;
            const row = Math.floor(i / GRID_SIZE);
            const isObstacle = obstacles.some(o => o.col === col && o.row === row);
            const isHighlighted = highlightedCells.some(c => c.col === col && c.row === row);

            return (
              <div
                key={ i }
                className={ `cell ${ isHighlighted ? 'highlighted' : '' }` }
                style={ {
                  border: '1px solid #ddd',
                  backgroundColor: isObstacle
                    ? '#888888'
                    : isHighlighted
                      ? '#A3E635'
                      : 'transparent'
                } }
              />
            );
          }) }
          { blocks.map(block => (
            <DraggableBlock key={ block.id } block={ block } draggingId={ draggingId } />
          )) }
        </div>
      </DndContext>
    </div>
  );
};
