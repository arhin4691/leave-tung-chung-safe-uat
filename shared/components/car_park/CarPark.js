import React from 'react'
import CarParkList from './components/CarParkList'

const CarPark = (props) => {
  return (
    <CarParkList data={props.data} />
  )
}

export default CarPark