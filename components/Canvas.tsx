import { useRef, useEffect } from "react"
import { Cipher } from "crypto"
import { GrowthMap } from 'growth-map'

interface Coord {
  x: number
  y: number
}

interface Size {
  width: number
  height: number
}

function withinCanvasBounds(canvas, offset: Coord, coord: Coord, size: Size) : boolean {

  const A = {
    x1: -offset.x,
    y1: -offset.y,
    x2: -offset.x + canvas.width,
    y2: -offset.y + canvas.height
  }

  const B = {
    x1: coord.x,
    y1: coord.y,
    x2: coord.x + size.width,
    y2: coord.y + size.height
  }


  if (A.x1 < B.x2 && A.x2 > B.x1 && A.y1 < B.y2 && A.y2 > B.y1) {
    return true
  }

  return false
}

class DragHandler {
  isDown: boolean

  firstOffset: Coord                
  start: Coord

  constructor(public doThisOnDrag: (current: Coord, start: Coord, initial: Coord) => void, public getFirstOffset: () => Coord) {

    window.addEventListener('mousedown', this.handleMouseDown(this, true))
    window.addEventListener('mouseup', this.handleMouseUp(this, true))
    window.addEventListener('mousemove', this.handleMouseMove(this, true))

    window.addEventListener('touchstart', this.handleMouseDown(this, false))
    window.addEventListener('touchend', this.handleMouseUp(this, false))
    window.addEventListener('touchmove', this.handleMouseMove(this, false))
  }

  handleMouseMove(handler: DragHandler, withMouse: boolean) {
    return (e) => {
      if (this.isDown) {
        const current = {
          x: withMouse ? e.clientX : e.touches[0].pageX,
          y: withMouse ? e.clientY : e.touches[0].pageY
        }
        handler.doThisOnDrag(current, handler.start, handler.firstOffset)
      }
    }
  }

  handleMouseUp(handler: DragHandler, withMouse: boolean) {
    return () => {
      handler.isDown = false
    }
    
  }

  handleMouseDown(handler: DragHandler, withMouse: boolean) {
    return (e) => {
      handler.isDown = true
      handler.start = {
        x: withMouse ? e.clientX : e.touches[0].pageX,
        y: withMouse ? e.clientY : e.touches[0].pageY
      }
      handler.firstOffset = handler.getFirstOffset()
    }
    
    
  }

  cleanup() {
    window.removeEventListener('mousedown', this.handleMouseDown(this, true))
    window.removeEventListener('mouseup', this.handleMouseUp(this, true))
    window.removeEventListener('mousemove', this.handleMouseMove(this, true))

    window.removeEventListener('touchstart', this.handleMouseDown(this, false))
    window.removeEventListener('touchend', this.handleMouseUp(this, false))
    window.removeEventListener('touchmove', this.handleMouseMove(this, false))
  }
}

class CanvasDrawer {
  xOffset = 0
  yOffset = 0

  constructor(public canvas) {}

  draw(growthMap: GrowthMap) {
    const context = this.canvas.getContext('2d')

    context.canvas.width = window.innerWidth
    context.canvas.height = window.innerHeight

    context.translate(this.xOffset, this.yOffset)

    
    const size = {width: 5, height: 5}

    if (!growthMap || !growthMap.points) {
      return
    }

    growthMap.points.forEach(point => {
      const coord = {x: point.coor.x, y: point.coor.y}
      
      if (withinCanvasBounds(context.canvas, {x: this.xOffset, y: this.yOffset}, coord, size)) {
        context.fillStyle = '#000000'
        context.fillRect(coord.x * size.width, coord.y * size.height, size.width, size.height)
      }
    });

    

    

  }
}

const Canvas = props => {

  const canvasRef = useRef(null)

  const canvasDrawer = useRef(null)

  const dragHandler = useRef(null)

  const growthMap = useRef(null)

  

  useEffect(() => {
    dragHandler.current = new DragHandler((current, start, initial) => {
      canvasDrawer.current.xOffset = initial.x + (current.x - start.x)
      canvasDrawer.current.yOffset = initial.y + (current.y - start.y)
      canvasDrawer.current.draw(growthMap.current)
    }, () => {
      return {
        x: canvasDrawer.current.xOffset,
        y: canvasDrawer.current.yOffset
      }
    })

    const canvas = canvasRef.current

    growthMap.current = new GrowthMap()

    console.log('start');
    
    growthMap.current.growToSize(10000)

    console.log('end');

    console.log(growthMap.current);
    
    

    canvasDrawer.current = new CanvasDrawer(canvas)
    

    function handleResize() {
      canvasDrawer.current.draw(growthMap.current)
    }

    window.addEventListener('resize', handleResize)

    function handleKeyDown(e) {
      
      const offsetAmount = 50

      switch (e.keyCode) {
        case 37: {
          canvasDrawer.current.xOffset -= offsetAmount
          canvasDrawer.current.draw(growthMap.current)
          break
        }
        case 38: {
          canvasDrawer.current.yOffset -= offsetAmount
          canvasDrawer.current.draw(growthMap.current)
          break
        }
        case 39: {
          canvasDrawer.current.xOffset += offsetAmount
          canvasDrawer.current.draw(growthMap.current)
          break
        }
        case 40: {
          canvasDrawer.current.yOffset += offsetAmount
          canvasDrawer.current.draw(growthMap.current)
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    canvasDrawer.current.draw()

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('keydown', handleKeyDown)
      dragHandler.current.cleanup()
    }
  }, [])
  
  return (
    <canvas className={'canvas'} ref={canvasRef} {...props} />
  )
}

export default Canvas