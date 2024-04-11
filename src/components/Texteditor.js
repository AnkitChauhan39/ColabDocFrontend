import React, { useEffect, useRef ,useState } from 'react'
import 'react-quill/dist/quill.snow.css'
import Quill from "quill"
import { io } from 'socket.io-client'
import { useParams } from 'react-router-dom'

const toolbarOptions = [
  ['bold', 'italic', 'underline', 'strike'],
  ['blockquote', 'code-block'],
  ['link', 'image', 'video', 'formula'],
  [{ 'header': 1 }, { 'header': 2 }],
  [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'list': 'check' }],
  [{ 'script': 'sub' }, { 'script': 'super' }],
  [{ 'indent': '-1' }, { 'indent': '+1' }],
  [{ 'direction': 'rtl' }],
  [{ 'size': ['small', false, 'large', 'huge'] }],
  [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  [{ 'color': [] }, { 'background': [] }],
  [{ 'font': [] }],
  [{ 'align': [] }],
  ['clean']
];

const Texteditor = () => {
  
  const {id : documentId } = useParams();
  console.log(documentId);
  const wrapper = useRef()
  const [socket,setsocket] = useState() 
  const [quill,setquill] = useState()

  useEffect( () => {
    if(socket == null || quill == null) 
    {
      return 
    }

    socket.once('load-document', document => {
      quill.setContents(document)
      quill.enable()
    })

    socket.emit('get-document',documentId)
  },[socket,quill,documentId])

  useEffect( () => {
    if(socket == null || quill == null )
    {
      return 
    }

    const handlerTextChanges = (delta) => {
      quill.updateContents(delta)
    }

    socket.on('receive-changes', handlerTextChanges);

    return () => {
      socket.off("receive-change",handlerTextChanges)
    }
  })

  useEffect(() => {
    const s = io("https://colabdoc.onrender.com")
    setsocket(s) 

    return () => {
      s.disconnect()
    }

  }, [])

  useEffect(() =>{
    if(socket == null || quill == null )
    {
      return 
    }

    const interval = setInterval(() => {
      socket.emit("save-document",quill.getContents())
    },3000);

    return () => {
      clearInterval(interval)
    }
     
  },[socket,quill])

  useEffect(() => {
    wrapper.current.innerHTML = ''
    const editor = document.createElement('div')
    wrapper.current.append(editor)
    const q = new Quill(editor, { 
      theme: "snow", 
      modules: { toolbar: toolbarOptions } 
    })

    q.disable();
    q.setText("LOADING...")
    setquill(q) 
  }, [])

  useEffect( () => {
    if(socket == null || quill == null )
    {
      return 
    }

    const handlerTextChanges = (delta, oldDelta, source) => {
      if(source !== 'user')
      {
        return
      }
      socket.emit("send-changes",delta)
    }

    quill.on('text-change', handlerTextChanges);

    return () => {
      quill.off("text-change",handlerTextChanges)
    }
  },[socket,quill]) 

  return (
    <div className='container' ref={wrapper} ></div>
  )
}

export default Texteditor
