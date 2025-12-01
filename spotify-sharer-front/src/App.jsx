import { useState, useEffect } from 'react'
import { Trash2, LogOut, Settings } from 'lucide-react' 
import './App.css'
import UserColumn from './components/userColumn'
import DialogLogin from './components/dialogLogin'
import DialogConfig from './components/dialogConfig'


function App() {
  const [loginIsOpen, setLoginIsOpen] = useState(true)
  const [groupname, setGroupname] = useState('')
  const [members, setMembers] = useState([])
  const [trash, setTrash] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  const [showAllUser, setShowAllUser] = useState('')
  const [groupId, setGroupId] = useState('')

// Restore session if any when rerendering
  useEffect(() => {
    try {
      setTrash(false)
      setConfigOpen(false)
      setShowAllUser('')
      const token = sessionStorage.getItem('authToken')
      const gd = sessionStorage.getItem('groupData')
      if (token && gd) {
        const parsed = JSON.parse(gd)
        setGroupname(parsed.name || '')
        setMembers(parsed.members || [])
        setGroupId(parsed.id || '')
        setLoginIsOpen(false)
      }
    } catch (e) {
      sessionStorage.removeItem("authToken")
      sessionStorage.removeItem("groupData")
      console.error('Restore session error', e)
    }
  }, [])

  const logOut = () => {
    setGroupname('')
    setMembers([])
    setGroupId('')
    sessionStorage.removeItem("authToken")
    sessionStorage.removeItem("groupData")
    setConfigOpen(false)
    setLoginIsOpen(true)
  }

  return (
  <div className='w-full px-10 pb-10 pt-2 flex flex-col items-center h-fit'>
      
      {loginIsOpen ? 
      <DialogLogin isOpen={loginIsOpen} onClose={() => setIsOpen(false)} 
      goToApp={async (groupData) => { 
        setGroupname(groupData.name); 
        setMembers(groupData.members);
        setGroupId(groupData.id)
        setLoginIsOpen(false);
        setTrash(false);
      }}/>
      :
      <>
      <div className='w-full flex justify-end gap-2 items-center my-5 sm:my-0'>
        <Trash2 className={`cursor-pointer p-1 hover:text-red-500 ${trash && "hover:text-white bg-red-500 p-1 rounded-full"} w-8 h-8 sm:w-10 sm:h-10`} onClick={() => setTrash(!trash)}/>
        <Settings     
        className='cursor-pointer p-1  w-8 h-8 sm:w-10 sm:h-10'
        onClick={() => setConfigOpen(true)}/>
        <LogOut 
        className='cursor-pointer p-1  w-8 h-8 sm:w-10 sm:h-10'
        onClick={() => logOut()}/>
      </div>
      <h1 className='w-full text-center font-semibold'>Spotify Sharer</h1>
      <h2 className={'w-full text-center text-3xl text-[#fcb6f7]'}>{groupname}</h2>
      <div className={`grid gap-10 w-full ${showAllUser === "" ? 'lg:grid-flow-col' : 'grid-cols-1'}`}>
        {members.map(member => 
          <UserColumn key={member._id} username={member.username} songs={member.songs} deleteActive={trash} showOnlyThisUser={showAllUser} usernameClickedEvent={(username) => {
            if (showAllUser === username) {
              setShowAllUser("")
            } else {
              setShowAllUser(username)
            }
          }}
          onSongAdded={(newSong) => {
            const membersUpdated = members.map(m => {
              if (m.username === member.username) {
                return { ...m, songs: [ newSong, ...(m.songs || []) ] }
              }
              return m
            })
            setMembers(membersUpdated)
            sessionStorage.setItem("groupData", JSON.stringify({
              id: groupId,
              name: groupname,
              members: membersUpdated
            }))
          }}
          onSongDeleted={(songId) => {
            const membersUpdated = members.map(member => ({
              ...member,
              songs: member.songs.filter(song => song._id !== songId)
            })
            )
            setMembers(membersUpdated)
            sessionStorage.setItem("groupData", JSON.stringify({
              name: groupname,
              members: membersUpdated
            }))
          }}
        />
        )}
      </div>
      
      { configOpen &&
      <DialogConfig onClose={() => setConfigOpen(false)} onDeletedGroup={() => logOut()}/>}
      </>
      }
      
  </div>
  )
} 

export default App
