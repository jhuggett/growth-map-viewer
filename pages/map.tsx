import {Carto} from 'growth-map'
import styled from 'styled-components'
import { useRef } from 'react'
import Canvas from '../components/Canvas'

export default function MapPage() {


  return (
    <Container>
      <Canvas>

      </Canvas>
    </Container>
  )
}

const Container = styled.div`
  height: 100%;
  width: 100%;

  
`
