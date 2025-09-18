import { useDroppable } from '@dnd-kit/core'

type DroppableProps = React.FC<{
  id: string
  children: React.ReactNode
}>

export const Droppable: DroppableProps = (props) => {
  const { isOver, setNodeRef } = useDroppable({
    id: props.id
  })
  const style = {
    opacity: isOver ? 1 : 0.5,
    marginTop: '2em'
  }

  return (
    <div ref={ setNodeRef } style={ style }>
      { props.children }
    </div>
  )
}