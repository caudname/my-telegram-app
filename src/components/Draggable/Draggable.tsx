import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

type DraggableProps = React.FC<{
  id: string
  children: React.ReactNode
}>

export const Draggable: DraggableProps = ({ id, children }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id
  })
  const style = {
    // Outputs `translate3d(x, y, 0)`
    transform: CSS.Translate.toString(transform)
  }

  return (
    <button ref={ setNodeRef } style={ style } { ...listeners } { ...attributes }>
      { children }
    </button>
  )
}