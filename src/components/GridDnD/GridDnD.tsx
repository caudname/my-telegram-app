import React, { useState } from "react"
import {
  DndContext,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter, TouchSensor, type DragEndEvent
} from "@dnd-kit/core"
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

const Cell: React.FC<{ id: string }> = ({ id }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })

  const style: React.CSSProperties = {
    width: "60px",
    height: "60px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#4F46E5",
    color: "white",
    borderRadius: "8px",
    cursor: "grab",
    transform: CSS.Transform.toString(transform),
    transition
  }

  return (
    <div ref={ setNodeRef } { ...attributes } { ...listeners } style={ style }>
      { id }
    </div>
  )
}

export default function GridDnD() {
  // Each cell initially contains its own number
  const [ items, setItems ] = useState<string[]>(
    Array.from({ length: 25 }, (_, i) => (i + 1).toString())
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor)
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id.toString())
        const newIndex = prev.indexOf(over.id.toString())
        return arrayMove(prev, oldIndex, newIndex)
      })
    }
  }

  return (
    <DndContext
      sensors={ sensors }
      collisionDetection={ closestCenter }
      onDragEnd={ handleDragEnd }
    >
      <SortableContext items={ items } strategy={ rectSortingStrategy }>
        <div
          style={ {
            display: "grid",
            gridTemplateColumns: "repeat(5, 60px)",
            gap: "8px"
          } }
        >
          { items.map((id) => (
            <Cell key={ id } id={ id } />
          )) }
        </div>
      </SortableContext>
    </DndContext>
  )
}
