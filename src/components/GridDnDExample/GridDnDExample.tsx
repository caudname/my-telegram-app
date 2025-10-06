import React, { useState } from 'react';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  type DragEndEvent, MouseSensor, TouchSensor
} from '@dnd-kit/core';
import './GridDnDExample.css'

type Position = {
  x: number;
  y: number;
};

interface DraggableBlockProps {
  id: string;
  position: Position;
  cellSize: number;
}

function DraggableBlock({ id, position }: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef } = useDraggable({ id });

  const style: React.CSSProperties = {
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
    position: 'absolute',
  };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className="draggable"
      style={style}
    />
  );
}

export const GridDnDExample = () => {
  const cellSize = 80;
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 2 } }),
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 10
      }
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5
      }
    })
  );

  const cells = Array.from({ length: 25 }, (_, i) => i);

  function handleDragEnd(event: DragEndEvent) {
    if (!event.delta) return;

    const newX = position.x + event.delta.x;
    const newY = position.y + event.delta.y;

    const snappedX = Math.round(newX / cellSize) * cellSize;
    const snappedY = Math.round(newY / cellSize) * cellSize;

    const max = cellSize * 4;
    setPosition({
      x: Math.min(Math.max(snappedX, 0), max),
      y: Math.min(Math.max(snappedY, 0), max),
    });
  }

  return (
    <div className="container">
      <h2>Перетаскивание блока поверх Grid 5x5 (snap to grid)</h2>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid">
          {cells.map((i) => (
            <div key={i} className="cell"></div>
          ))}
          <DraggableBlock id="A" position={position} cellSize={cellSize} />
        </div>
      </DndContext>
    </div>
  );
};
