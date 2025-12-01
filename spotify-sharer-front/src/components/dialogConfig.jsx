import { useState } from 'react'
import { X, DoorClosed } from 'lucide-react' 
import { deleteGroup } from '../api'


const DialogConfig =  ({ onClose, onDeletedGroup }) => {
  const [error, setError] = useState(false)
  
  const deleteGroupOnClick = async () => {
    const res = await deleteGroup()
    if (res.ok) {
      onDeletedGroup()
    } else {
      setError('Group deletion failed')
    }
  }

  return(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-gray-800">
      <div className="bg-white rounded-lg p-6 w-150 max-w-full shadow-lg flex flex-col gap-2 mx-5">

        <div className='flex flex-row justify-between items-center'>
          <h1 className="font-light mb-4">Settings</h1>
          <X size={50} stroke-width='1' className='cursor-pointer' onClick={() => onClose()}/>
        </div>

        <label className='font-semibold text-center mt-2'>Delete account</label>
        
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded flex flex-row gap-2 justify-center bg-red-500!"
          onClick={() => deleteGroupOnClick()}
        >
          <DoorClosed/>
          Delete & Exit
        </button>
        <p className='text-red-500 text-center'>This action cannot be undone</p>
        <p className='text-red-500 text-center'>{error}</p>
      </div>
    </div>
  )
}


export default DialogConfig