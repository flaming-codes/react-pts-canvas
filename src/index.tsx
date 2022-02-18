/* eslint-disable  react/prop-types */
import React, { useEffect, useRef, forwardRef, ForwardedRef } from 'react'
import { CanvasSpace, Bound, CanvasForm, Group, Tempo } from 'pts'

export type HandleStartFn = (
  bound: Bound,
  space: CanvasSpace,
  form: CanvasForm
) => void

export type HandleAnimateFn = (
  space: CanvasSpace,
  form: CanvasForm,
  time: number,
  ftime: number
) => void

export type HandleResizeFn = (
  space: CanvasSpace,
  form: CanvasForm,
  size: Group,
  evt: Event // eslint-disable-line no-undef
) => void

export type HandleActionFn = (
  space: CanvasSpace,
  form: CanvasForm,
  type: string,
  px: number,
  py: number,
  evt: Event // eslint-disable-line no-undef
) => void

export type PtsCanvasProps = {
  name?: string
  background?: string
  resize?: boolean
  retina?: boolean
  play?: boolean
  touch?: boolean
  style?: object // eslint-disable-line no-undef
  canvasStyle?: object // eslint-disable-line no-undef
  onStart?: HandleStartFn
  onAnimate: HandleAnimateFn
  onResize?: HandleResizeFn
  onAction?: HandleActionFn
  tempo?: Tempo
}

const PtsCanvasComponent = (
  {
    name = 'pts-react', // maps to className of the container div
    background = '#9ab',
    resize = true,
    retina = true,
    play = true,
    touch = true,
    style = {},
    canvasStyle = {},
    onStart = undefined,
    onAnimate = () => {
      console.log('animating')
    },
    onResize = undefined,
    onAction = undefined,
    tempo = undefined
  }: PtsCanvasProps,
  ref: ForwardedRef<HTMLCanvasElement>
) => {
  // Set canvRef to be either the forwarded ref if its a MutableRefObject, or our own local ref otherwise
  const canvRef = ref && typeof ref !== 'function' ? ref : useRef(null)
  const spaceRef = useRef<CanvasSpace>()
  const formRef = useRef<CanvasForm>()

  /**
   * When canvRef Updates (ready for space)
   */
  useEffect(() => {
    if (!canvRef || !canvRef.current) return
    // Create CanvasSpace with the canvRef and assign to spaceRef
    // Add animation, tempo, and play when ready (call back on CanvasSpace constructor)
    spaceRef.current = new CanvasSpace(canvRef.current).setup({
      bgcolor: background,
      resize,
      retina
    })

    // Assign formRef
    formRef.current = spaceRef.current.getForm()

    // By having individual handler props, we can expose what we need to the
    // underlying functions, like our Form instance
    spaceRef.current.add({
      start: (bound: Bound) => {
        if (onStart && spaceRef.current && formRef.current) {
          onStart(bound, spaceRef.current, formRef.current)
        }
      },
      animate: (time?: number, ftime?: number) => {
        if (time && ftime && spaceRef.current && formRef.current) {
          onAnimate(spaceRef.current, formRef.current, time, ftime)
        }
      },
      resize: (bound: Bound, event: Event) => {
        if (onResize && spaceRef.current && formRef.current) {
          onResize(spaceRef.current, formRef.current, bound, event)
        }
      },
      action: (type: string, px: number, py: number, evt: Event) => {
        if (onAction && spaceRef.current && formRef.current) {
          onAction(spaceRef.current, formRef.current, type, px, py, evt)
        }
      }
    })

    // Add tempo if provided
    if (tempo) {
      spaceRef.current.add(tempo)
    }

    // Return the cleanup function (similar to ComponentWillUnmount)
    return () => {
      spaceRef.current && spaceRef.current.dispose()
    }
  }, [canvRef])

  /**
   * When Touch updates
   */
  useEffect(() => {
    spaceRef.current && spaceRef.current.bindMouse(touch).bindTouch(touch)
  }, [touch])

  /**
   * Play or stop based on play prop
   * */
  const maybePlay = () => {
    if (play) {
      spaceRef.current && spaceRef.current.play()
    } else {
      spaceRef.current && spaceRef.current.playOnce(0)
    }
  }

  /**
   * When anything updates
   */
  useEffect(() => {
    maybePlay()
  })

  return (
    <div className={name || ''} style={style}>
      <canvas
        className={name ? name + '-canvas' : ''}
        ref={canvRef}
        style={canvasStyle}
      />
    </div>
  )
}

export const PtsCanvas = forwardRef<HTMLCanvasElement, PtsCanvasProps>(
  PtsCanvasComponent
)

export {
  PtsCanvas as PtsCanvasLegacy,
  QuickStartCanvas as QuickStartCanvasLegacy,
  PtsCanvasLegacyProps,
  QuickStartProps
} from './legacy'