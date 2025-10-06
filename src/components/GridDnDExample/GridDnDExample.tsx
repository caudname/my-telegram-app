import React, { useState } from 'react';
import {
  DndContext,
  useSensor,
  useSensors,
  useDraggable,
  type DragMoveEvent,
  MouseSensor,
  TouchSensor
} from '@dnd-kit/core';
import './GridDnDExample.css';

type Position = {
  x: number;
  y: number;
};

interface DraggableBlockProps {
  id: string;
  position: Position;
}

function DraggableBlock({ id, position }: DraggableBlockProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id });

  const style: React.CSSProperties = {
    transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
    position: 'absolute',
    transition: isDragging ? 'none' : 'transform 200ms ease',
    zIndex: isDragging ? 1000 : 'auto',
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
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  );

  const cells = Array.from({ length: 25 }, (_, i) => i);

  // Live dragging
  function handleDragMove(event: DragMoveEvent) {
    if (!event.delta) return;

    const MAX_DELTA = 40;

    const dx = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, event.delta.x));
    const dy = Math.max(-MAX_DELTA, Math.min(MAX_DELTA, event.delta.y));

    setPosition(prev => ({
      x: prev.x + dx,
      y: prev.y + dy,
    }));
  }

  // Snap to grid on drop
  function handleDragEnd() {
    const snappedX = Math.round(position.x / cellSize) * cellSize;
    const snappedY = Math.round(position.y / cellSize) * cellSize;

    const max = cellSize * 4;
    setPosition({
      x: Math.min(Math.max(snappedX, 0), max),
      y: Math.min(Math.max(snappedY, 0), max)
    });
  }

  return (
    <div className="container">
      <h2>Свободное перетаскивание + Snap to Grid</h2>
      <DndContext
        sensors={sensors}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <div className="grid">
          {cells.map((i) => (
            <div key={i} className="cell" />
          ))}
          <DraggableBlock id="A" position={position} />
        </div>
      </DndContext>
    </div>
  );
};
