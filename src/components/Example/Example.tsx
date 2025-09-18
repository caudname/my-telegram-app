import { useState } from 'react'
import {
  DndContext,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core'
import { Draggable } from '../Draggable'
import { Droppable } from '../Droppable'

export const Example: React.FC = () => {
  const [ parent, setParent ] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      // Require the mouse to move by 10 pixels before activating
      activationConstraint: {
        distance: 0,
      },
    }),
    useSensor(TouchSensor, {
      // Press delay of 250ms, with tolerance of 5px of movement
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
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