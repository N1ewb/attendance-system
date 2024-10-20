import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { classes } from '../../../lib/global'

export const ClassDetail = () => {
  const location = useLocation()
  const queryParams = new URLSearchParams(location.search)
  const classid = queryParams.get('id')
  const [thisClass, setThisClass] = useState(null)
  
  

  useEffect(() => {
    if(classid ){
        const foundClass = classes.find((thisclass) => {
            thisclass.id == classid
        })
        if(foundClass){
            setThisClass(foundClass)
        }
    }
  },[classid])
  return (
    <div className='h-screen w-full pt-24'>ClassDetail</div>
  )
}
