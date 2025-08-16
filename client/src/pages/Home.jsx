import React from 'react'
import { Link } from 'react-router-dom'
import { useState,useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function Home() {
  const [forms, setForms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchForms = async () => {
      const res = await fetch('/api/form/getforms');
      const data = await res.json();
      setForms(data);
    };
    fetchForms();
  }, []);

  return (
    <div>
      <h1 className='text-3xl font-bold mb-6 mt-2 text-gray-800 text-center'>Welcome to the Form Builder</h1>
      <div className='w-[200px] h-[200px] m-2'>
        <Link to="/create-form">
          <div className='w-full h-full border flex flex-col justify-center items-center rounded-lg text-xl font-semibold bg-gray-100 hover:bg-gray-200 transition-all cursor-pointer hover:shadow-lg'>
            <div>+</div>
            <div>Create Form</div>
          </div>
        </Link>
      </div>
      <div>
        <h1 className='text-2xl font-semibold mb-4 mt-2 text-gray-800'>Update Your Forms</h1>
        <div className='flex flex-wrap'>
          {forms.map(form => (
            <div key={form._id} className='border rounded-lg  bg-gray-100 hover:bg-gray-200 w-[200px] h-[200px] cursor-pointer m-4 p-1 hover:shadow-lg flex flex-col items-center justify-center text-lg ' onClick={()=>navigate(`/updateform/${form._id}`)}>
              <div className='font-semibold'>Form Name:</div>
              <div className='text-center'>{form.name}</div>
            </div>
          ))}
        </div>
      </div>
      <div>
        <h1 className='text-2xl font-semibold mb-4 mt-2 text-gray-800'>Render Your Forms(Form Filling)</h1>
        <div className='flex flex-wrap'>
          {forms.map(form => (
            <div key={form._id} className='border rounded-lg  bg-gray-100 hover:bg-gray-200 w-[200px] h-[200px] cursor-pointer m-4 p-1 hover:shadow-lg flex flex-col items-center justify-center text-lg ' onClick={()=>navigate(`/form/${form._id}`)}>
              <div className='font-semibold'>Form Name:</div>
              <div className='text-center'>{form.name}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Home
