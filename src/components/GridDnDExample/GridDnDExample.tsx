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
type Block = { id: string; position: GridCoord };

const cellSize = 70;
const GRID_SIZE = 5;

const initialBlocks: Block[] = [
  { id: 'A', position: { col: 2, row: 4 } },
  { id: 'B', position: { col: 4, row: 2 } },
  { id: 'C', position: { col: 3, row: 2 } }
]

const obstacles: GridCoord[] = [
  { col: 0, row: 1 },
  { col: 1, row: 2 },
  { col: 2, row: 3 }
]

function isOccupied(col: number, row: number, blocks: Block[]): boolean {
  if (col < 0 || col >= GRID_SIZE || row < 0 || row >= GRID_SIZE) return true; // за пределами - занято
  if (obstacles.some(o => o.col === col && o.row === row)) return true;
  if (blocks.some(b => b.position.col === col && b.position.row === row)) return true;
  return false;
}

interface DraggableBlockProps {
  block: Block;
}

function DraggableBlock({ block }: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: block.id });

  const style: React.CSSProperties = {
    position: 'absolute',
    width: cellSize,
    height: cellSize,
    transform: `translate3d(${ block.position.col * cellSize }px, ${ block.position.row * cellSize }px, 0)`,
    transition: isDragging ? 'none' : 'transform 300ms ease',
    zIndex: isDragging ? 1000 : 'auto',
    backgroundColor: '#3498DB',
    color: 'white',
    fontWeight: 'bold',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    cursor: 'grab',
    userSelect: 'none',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
  };

  return (
    <div ref={ setNodeRef } { ...listeners } { ...attributes } style={ style }>
      { block.id }
    </div>
  );
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

export const GridDnDExample = () => {
  const [ blocks, setBlocks ] = useState<Block[]>(initialBlocks);
  const [ highlightedCells, setHighlightedCells ] = useState<GridCoord[]>([]);
  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  /**
   * Вычисляем новую позицию с возможностью перепрыгивать через несколько подряд
   * занятых ячеек (препятствий или блоков) в выбранном направлении.
   */
  function computeNewPosition(
    from: GridCoord,
    to: GridCoord,
    blocks: Block[]
  ): GridCoord {
    const dCol = to.col - from.col;
    const dRow = to.row - from.row;

    // Движение должно быть в одну из 4-х сторон (не по диагонали)
    const dirCol = Math.sign(dCol);
    const dirRow = Math.sign(dRow);

    // Проверка: движение строго по вертикали или горизонтали
    if ((dirCol !== 0 && dirRow !== 0) || (dirCol === 0 && dirRow === 0)) {
      return from;
    }

    let currentCol = from.col + dirCol;
    let currentRow = from.row + dirRow;

    let jumped = false;

    // Продвигаемся по направлению, пока клетки заняты
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

    // Проверка выхода за границы
    if (
      currentCol < 0 ||
      currentCol >= GRID_SIZE ||
      currentRow < 0 ||
      currentRow >= GRID_SIZE
    ) {
      return from;
    }

    // Если мы прыгнули (т.е. было хотя бы одно препятствие) и нашли свободную клетку — разрешаем прыжок
    if (jumped && !isOccupied(currentCol, currentRow, blocks)) {
      return { col: currentCol, row: currentRow };
    }

    // Иначе — движение запрещено
    return from;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, delta } = event;
    const block = blocks.find(b => b.id === active.id);
    if (!block) return;

    // Расчёт новой целевой позиции в сетке
    const approxCol = block.position.col + Math.round(delta.x / cellSize);
    const approxRow = block.position.row + Math.round(delta.y / cellSize);

    const targetPos = {
      col: Math.min(Math.max(approxCol, 0), GRID_SIZE - 1),
      row: Math.min(Math.max(approxRow, 0), GRID_SIZE - 1)
    };

    const newPos = computeNewPosition(block.position, targetPos, blocks);

    setBlocks(prev =>
      prev.map(b => (b.id === block.id ? { ...b, position: newPos } : b))
    );
    setHighlightedCells([])
  }

  function handleDragStart(event: DragStartEvent) {
    const block = blocks.find(b => b.id === event.active.id);
    if (!block) return;

    const validTargets = getValidJumpTargets(block.position, blocks);
    setHighlightedCells(validTargets);
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
                      ? '#A3E635' // базовый цвет, при анимации изменяется
                      : 'transparent'
                } }
              />
            );
          }) }
          { blocks.map(block => (
            <DraggableBlock key={ block.id } block={ block } />
          )) }
        </div>
      </DndContext>
    </div>
  );
};
