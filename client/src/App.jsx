import React from 'react'
import { BrowserRouter ,Routes,Route} from 'react-router-dom'

import Home from './pages/Home'
import CreateForm from './pages/CreateForm';
import Form from './pages/FormPage'
import UpdateForm from './pages/UpdateForm';
import Header from './components/Header'


export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-form" element={<CreateForm />} />
        <Route path="/updateform/:id" element={<UpdateForm />} />
        <Route path="/form/:formId" element={<Form />} />
      </Routes>
    </BrowserRouter>
  )
}
