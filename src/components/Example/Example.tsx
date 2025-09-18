import { useState } from 'react'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import { Draggable } from '../Draggable'
import { Droppable } from '../Droppable'

export const Example: React.FC = () => {
  const [ parent, setParent ] = useState<string | null>(null)

  const handleDragEnd = ({ over }: DragEndEvent) => {
    setParent(over ? over.id.toString() : null)
  }

  const draggable = (
    <Draggable id='draggable'>
      Go ahead, drag me.
    </Draggable>
  )

  return (
    <DndContext onDragEnd={ handleDragEnd }>
      { !parent ? draggable : null }
      <Droppable id='droppable'>
        { parent === "droppable" ? draggable : 'Drop here' }
      </Droppable>
    </DndContext>
  )
}