import { useState } from 'react'
import { register, login } from '../api'
import PasswordInput from './inputPassword'
import VariableInputs from './variableInputs'

const MAX_MEMBERS = 6

const DialogLogin =  ({ isOpen, onClose, goToApp }) => {
  const [groupname, setGroupname] = useState('')
  const [password, setPassword] = useState('')
  const [dialog, setDialog] = useState(0) // 0 Login, 1 SignIn, 2 Usernames
  const [error, setError] = useState('')
  const [groupData, setGroupData] = useState({})
  const [enterMembersClicked, setEnterMembersClicked] = useState(false)

  const goOnClick = async () => {
    if (!groupname || !password) {
      setError('Fields missing')
      return
    }
    if (dialog === 0) {
        const res = await login(groupname, password)
        if (res.ok) { 
          setGroupData(res.data)
          goToApp(res.data)
        } else {
          setError(res.error)
        }
    }
    if (groupname.length < 5) setError('Group name must be at least 5 characters long')
    else if (groupname.length > 20) setError('Group name can be up to 20 characters long')
    else if (password.length < 8 ) setError('Password must be at least 8 characters long')
    else if (password.length > 20) setError('Password can be up to 20 characters long')
    else if (dialog === 1) {
        const res = await register(groupname, password)
        if (res.ok) { 
          setGroupData(res.data) 
          setDialog(2)
        } else {
          setError(res.error)
        }
      }
    return
  }

  const addMembersToGroupData = (newGroupData) => {
    setGroupData(newGroupData)
    goToApp(newGroupData)
  }


  return(
    <div className="flex px-5 flex-col gap-3 fixed inset-0 bg-black/100 flex items-center justify-center z-50 text-gray-800">
      
      <div className='flex flex-wor gap-2 items-center jutify-center'>
        <img src='./spotify.svg' className='w-15 h-15'/>
        <h1 className='w-full text-[#fcb6f7] text-center font-thin'>
          Spotify Sharer
        </h1>
      </div>
      <div className="bg-white rounded-lg p-6 w-150 max-w-full shadow-lg flex flex-col gap-2">
            {dialog === 2 ? 
            <>
              <h1 className="mb-4 cursor-pointer text-center">Enter nicknames</h1> 
              <VariableInputs membersAdded={addMembersToGroupData} enterClicked={enterMembersClicked} maxInputs={MAX_MEMBERS}/>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => setEnterMembersClicked(!enterMembersClicked)}
              >
                Enter
              </button>
            </>
            : 
            <>
              <div className='flex flex-row justify-between items-center'>
                <h1 className={`mb-4 cursor-pointer ${dialog === 0 ? "font-semibold" : "font-light"}`} onClick={() => {
                  setGroupname('')
                  setPassword('')
                  setDialog(0)
                  }}>Log In</h1>
                <h1 className={`font-light mb-4 cursor-pointer ${dialog === 1 ? "font-semibold" : "font-light"}`} onClick={() => {
                  setGroupname('')
                  setPassword('') 
                  setDialog(1) 
                  }}>Sign Up</h1>
              </div>

              <input placeholder={`${dialog === 0 ? "Group name" : "Choose a group name"}`} className='px-4 py-2 bg-gray-100 rounded-md w-full border border-2 border-gray-200 flex justify-start' onChange={(e) => { setGroupname(e.target.value); setError('') }} value={groupname}></input>
              <PasswordInput
                dialog={dialog}
                password={password}
                setPassword={setPassword}
                setError={setError}
              />
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => goOnClick()}
              >
                Go
              </button>
            </>
            }
          
          <p className='text-red-500'>{error}</p>
      </div>
    </div>
  )
}



export default DialogLogin