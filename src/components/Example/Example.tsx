import { useState } from 'react'
import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { Draggable } from '../Draggable'
import { Droppable } from '../Droppable'

export const Example: React.FC = () => {
  const [ parent, setParent ] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5   // optional: how far finger must move before drag starts
      }
    })
  )

  const handleDragEnd = ({ over }: DragEndEvent) => {
    setParent(over ? over.id.toString() : null)
  }

  const draggable = (
    <Draggable id='draggable'>
      Go ahead, drag me.
    </Draggable>
  )

  return (
    <DndContext onDragEnd={ handleDragEnd } sensors={ sensors }>
      { !parent ? draggable : null }
      <Droppable id='droppable'>
        { parent === "droppable" ? draggable : 'Drop here' }
      </Droppable>
    </DndContext>
  )
}