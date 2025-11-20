import { useState, useEffect, use } from 'react'
import reactLogo from './assets/react.svg'
import { ChevronLeft, ChevronRight, Trash2, X, LogOut, UserPlus, Check, LoaderCircle } from 'lucide-react' 
import './App.css'
import { register, login, addMembers, addSong } from './api'

const ITEMS_PER_PAGE = 2
const MAX_MEMBERS = 6
const  MAX_ITEMS_PER_PAGE = 20

function App() {
  const [smallScreen, setSmallScreen] = useState(true)
  const [width, setWidth] = useState(window.innerWidth)
  const [loginIsOpen, setLoginIsOpen] = useState(true)
  const [groupname, setGroupname] = useState('')
  const [members, setMembers] = useState([])
  const [trash, setTrash] = useState(false)
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [showAllUser, setShowAllUser] = useState('')

// Restore session if any when rerendering
  useEffect(() => {
    try {
      const token = sessionStorage.getItem('authToken')
      const gd = sessionStorage.getItem('groupData')
      if (token && gd) {
        const parsed = JSON.parse(gd)
        setGroupname(parsed.name || '')
        setMembers(parsed.members || [])
        setLoginIsOpen(false)
      }
    } catch (e) {
      sessionStorage.clear()
      console.error('Restore session error', e)
    }
  }, [])

  return (
  <div className='w-screen px-10 py-5 flex flex-col items-start h-fit'>
      
      {loginIsOpen ? 
      <DialogLogin isOpen={loginIsOpen} onClose={() => setIsOpen(false)} 
      goToApp={(groupData) => { 
        console.log('groupdata members login', groupData.members);
        setGroupname(groupData.name); 
        setMembers(groupData.members);
        setLoginIsOpen(false);
        sessionStorage.setItem("groupData", JSON.stringify(groupData))  
      }}/>
      :
      <>
      <div className='w-full flex justify-end gap-4 items-center'>
        <Trash2 className={`cursor-pointer p-1 hover:text-red-500 ${trash && "hover:text-white bg-red-500 p-1 rounded-full"}`} size={40} onClick={() => setTrash(!trash)}/>
        <UserPlus 
        className='cursor-pointer p-1'
        size={40}
        onClick={() => setAddUserOpen(true)}/>
        <LogOut 
        className='cursor-pointer p-1'
        size={40}
        onClick={() => {
          setGroupname('')
          setMembers([])
          sessionStorage.clear()
          setLoginIsOpen(true)
        }}/>
      </div>
      <h1 className='w-full text-center font-semibold'>Spotify Sharer</h1>
      <h2 className='w-full text-center text-gray-300 text-3xl'>{groupname}</h2>
      <div className={`grid gap-10 w-full ${showAllUser === "" ? 'lg:grid-flow-col' : 'grid-cols-1'}`}>
        {members.map(member => 
          <UserColumn key={member.username} username={member.username} songs={member.songs} deleteActive={trash} showOnlyThisUser={showAllUser} usernameClickedEvent={(username) => {
            if (showAllUser === username) {
              setShowAllUser("")
            } else {
              setShowAllUser(username)
            }
          }}
          onSongAdded={(newSong) => {
            const membersUpdated = members.map(m => {
              if (m.username === member.username) {
                return { ...m, songs: [ newSong, ...m.songs ] }
              }
              return m
            })
            setMembers(membersUpdated)
            sessionStorage.setItem("groupData", JSON.stringify({
              name: groupname,
              members: membersUpdated
            }))
          }}/>
        )}
      </div>
      
      {addUserOpen &&
      <DialogAddMember onClose={() => setAddUserOpen(false)}/>}
      </>
      }
      
  </div>
  )
}

export default App


const UserColumn = ( { username, songs, onSongAdded, deleteActive, showOnlyThisUser, usernameClickedEvent } ) => {
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE)
  const [page, setPage] = useState(0)
  const numPages = songs ? Math.ceil(songs.length / itemsPerPage) : 0
  const songSpotifyIds = songs.map(s => s.spotifyId) 
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  useEffect(() => {
    if (showOnlyThisUser === username) {
      setItemsPerPage(MAX_ITEMS_PER_PAGE)
    } else {
      setPage(0)
      setItemsPerPage(ITEMS_PER_PAGE)
    }
  }, [showOnlyThisUser])

  if (showOnlyThisUser === "" | showOnlyThisUser === username) {
    return (
    <div className='h-min-[800px]'>
      <h1 className='text-center font-thin cursor-pointer'
      onClick={() => usernameClickedEvent(username)}>{username}</h1>
      <div className={`${showOnlyThisUser ? "grid lg:grid-cols-2 gap-3" : "flex flex-col gap-3"}`}>
        
        {songSpotifyIds.slice(page*itemsPerPage, page*itemsPerPage + itemsPerPage).map(song =>
        <>
          <div className='relative group'>
            <iframe data-testid="embed-iframe" style={{"border-radius":"12px"}} src={`https://open.spotify.com/embed/track/${song}?utm_source=generator`} width="100%" height="352" frameBorder="0" allowfullscreen="" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy">
            </iframe>
            {deleteActive && 
            <div className='absolute inset-0 bg-red-500 z-50 opacity-0 group-hover:opacity-50 transition-opacity flex items-center justify-center text-white text-xl cursor-pointer' style={{"border-radius":"12px"}}><Trash2 size={100} /></div>
            }
          </div>
        </>
        )}
      </div>
        <div className='w-full flex flex-row gap-1'>
          {page > 0 && <button className='mt-3 flex justify-center' onClick={() => {
            if (page > 0) setPage(page - 1)
          }}><ChevronLeft/></button>}
          <button className='flex-1 mt-3' onClick={() => setIsDialogOpen(true)}>Add song</button>
          {page < numPages - 1 && 
          <button className='mt-3 flex justify-center' onClick={() => {
            if (page <= numPages) setPage(page + 1)
          }}><ChevronRight/></button>}
        </div>
      {isDialogOpen && 
      <DialogAddSong onClose={() => setIsDialogOpen(false)} username={username}
      onSongAdded={(newSong) =>  onSongAdded(newSong)}/>
      }
    </div>
    )
  }
}



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

  const addMembersToGroupData = (members) => {
    const groupDataUpdate = {...groupData}
    groupDataUpdate.members = members
    setGroupData(members)
    goToApp(groupDataUpdate)
  }


  return(
    <div className="fixed inset-0 bg-black/100 flex items-center justify-center z-50 text-gray-800">
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
                  setDialog(0);
                  setGroupname('')
                  setPassword('')
                  }}>Log In</h1>
                <h1 className={`font-light mb-4 cursor-pointer ${dialog === 1 ? "font-semibold" : "font-light"}`} onClick={() => setDialog(1)}>Sign Up</h1>
              </div>

              <input placeholder={`${dialog === 0 ? "Group name" : "Choose a group name"}`} className='px-4 py-2 bg-gray-100 rounded-md w-full border border-2 border-gray-200 flex justify-start' onChange={(e) => { setGroupname(e.target.value); setError('') }} value={groupname}></input>
              <input placeholder={`${dialog === 0 ? "Password" : "Set a password"}`} className='px-4 py-2 bg-gray-100 rounded-md w-full border border-2 border-gray-200 flex justify-start' onChange={(e) => { setPassword(e.target.value); setError('') }} value={password}></input>

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



const VariableInputs = ({ membersAdded, enterClicked, maxInputs }) => {
  const [nicknames, setNicknames] = useState(["", ""])
  const [showErrors, setShowErrors] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const handleChange = (value, index) => {
    setShowErrors(false)
    setGeneralError(false)
    setNicknames(prev => {
      const updated = [...prev];
      updated[index] = value;

      const allFilledExceptLast = updated
        .slice(0, -1)
        .every(n => n.length >= 3);

      const lastFilled = updated[updated.length - 1].length >= 3;

      if (allFilledExceptLast && lastFilled && updated.length < maxInputs) {
        return [...updated, ""];
      }

      return updated;
    });
  };

  useEffect(() => {
    if (!showErrors && !generalError) {
      const run = async () => {
        try {
          const allValid = nicknames.reduce((acc, nickname) => {
            return acc && (nickname.length === 0 || nickname.length > 2)
          }, true)
          if (allValid) {
            const res = await addMembers(nicknames.filter(n => n.length > 2))
            if (res.ok) {
              membersAdded(res.data)
            } else {
              setGeneralError(res.error)
            }
          } else {
            setShowErrors(true)
          }
        } catch (e) {
          setGeneralError('Unexpected error')
          console.error('VariableInputs addMembers error', e)
        }
      }
      run()
    }
  }, [enterClicked])

  return (
    <>
      {nicknames.map((nickname, i) => (
        <input
          key={i}
          placeholder={`Nickname ${i + 1}`}
          className={`px-4 py-2 bg-gray-100 rounded-md w-full border border-gray-200 mt-2 ${showErrors ? 'text-red-500' : 'text-gray-900'}`}
          value={nickname}
          onChange={e => handleChange(e.target.value, i)}
        />
      ))}
      {showErrors && <p className='text-red-500'>Nicknames must be at least 3 characters</p>}
      <p className='text-red-500'>{generalError}</p>
    </>
  );
};



const DialogAddSong =  ({ onClose, username, onSongAdded }) => {
  const [songLink, setSongLink] = useState('')
  const [error, setError] = useState('')
  const [trackId, setTrackId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [trackValid, setTrackValid] = useState(null)
  const [pendingTrackId, setPendingTrackId] = useState(null);
   
  const addOnClick = async () => {
    setLoading(true) // Aquí me gustaria que se hiciera el set antes de continuar 
    const linkId = obtainSpotyId(songLink)
    if (linkId === -1) {
      setError('The link is not valid')
      setLoading(false)
      return;
    } 
    setPendingTrackId(linkId)
  }

  useEffect(() => {
    if (!pendingTrackId) return;

    const run = async () => {
      setTrackId(pendingTrackId) // Aquí también
      const valid = await checkTrackValidity(pendingTrackId)
      if (!valid.ok) {
        setError(valid.message)
        setLoading(false)
        setPendingTrackId(null)
        return
      }

      const res = await addSong(username, linkId)
      if (res.ok) {
        onSongAdded(res.data);
        onClose();
      } else {
        setError(res.error)
      }
      setLoading(false)
      setPendingTrackId(null)
    } 
    
    run()
  }, [pendingTrackId])

  const checkTrackValidity = async () => {

      const backendUrl = `https://open.spotify.com/embed/track/${trackId}?utm_source=generator`; 

      try {
        const response = await fetch(backendUrl);
        
        if (response.status === 200) {
          return { ok: true, message: 'Track link is valid'}
        } else {
          return { ok: false, message: 'Track not found'}
        }
      } catch (err) {
        console.log(err)
          return { ok: false, message: 'Server is having trouble'}
      } 
  };

  return(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-gray-800">
      <div className="bg-white rounded-lg p-6 w-150 max-w-full shadow-lg flex flex-col gap-2">

          <div className='flex flex-row justify-between items-center'>
            <h1 className=" font-light mb-4">Add a song</h1>
            <X size={50} stroke-width='1' className='cursor-pointer' onClick={() => onClose()}/>
          </div>
            <h3>{trackId}</h3>
          <input placeholder='Enter an Spotify song share link' className='px-4 py-2 h-30 bg-gray-100 rounded-md w-full border border-2 border-gray-200 flex justify-start'
          value={songLink} onChange={(e) => {
            setError('')
            setSongLink(e.target.value)}}
          />
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => addOnClick()}
          >
            Add
          </button>
          {/*<p className='text-red-600'>{error}</p>*/}
        <SpotifyTrackChecker isValid={trackValid} loading={loading} error={error}/>
        </div>
    </div>
  )
}



const obtainSpotyId = (link) => {
  const regex = /(?:spotify\.com\/(?:intl-[a-z]{2}\/)?(?:embed\/)?track\/)?([A-Za-z0-9]{22})/;
  const match = link.match(regex);
  if (!match) return -1
  return match[1]
}


const SpotifyTrackChecker = ({ isValid, loading, error }) => {  
  if (loading) {
    return <p> <LoaderCircle className='animate-spin text-gray-300'/>Verifyng track... </p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>{error}</p>;
  }

  if (isValid === true) {
    return <p className='text-green-500'><Check className='p-1 bg-green-500' size={30}/>Valid track</p>;
  }

  if (isValid === false) {
    return <p className='text-red-500'><X className='p-1 bg-red-500' size={30}/> Track is not valid or does not exist</p>;
  }
  
  return
};





const DialogAddMember =  ({ onClose, onMemberAdded, currentMembersLength }) => {
  const [username, setUsername] = useState('')
  const [showErrors, setShowErrors] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [nicknames, setNicknames] = useState(["", ""])
  const [addClicked, setAddClicked] = useState(false)

  const addOnClick = async () => {
    if (username.length < 3) {
      setError('Nickname must be at least 3 characters')
    } else {
      const res = await addSong(username, trackId)
      if (res.ok) {
        onSongAdded(res.data);
        onClose();
      } else {
        setError(res.error)
      }
    }
  }

  
  const addMembersToGroupData = (members) => {
    const groupDataUpdate = {...groupData}
    groupDataUpdate.members = members
    setGroupData(members)
    goToApp(groupDataUpdate)
  }


  return(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-gray-800">
      <div className="bg-white rounded-lg p-6 w-150 max-w-full shadow-lg flex flex-col gap-2">

          <div className='flex flex-row justify-between items-center'>
            <h1 className="font-light mb-4">Add members</h1>
            <X size={50} stroke-width='1' className='cursor-pointer' onClick={() => onClose()}/>
          </div>

          <VariableInputs membersAdded={() => {}} enterClicked={addClicked} maxInputs={MAX_MEMBERS - currentMembersLength}/>
            

          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => addOnClick()}
          >
            Add
          </button>
          <p className='text-red-600'>{generalError}</p>
        </div>
      {showErrors && <p className='text-red-500'>Nicknames must be at least 3 characters</p>}
      <p className='text-red-500'>{generalError}</p>
    </div>
  )
}



const VariableInputsBackUp = ({ membersAdded }) => {
  const MAX = 6;
  const [nicknames, setNicknames] = useState(["", ""])
  const [showErrors, setShowErrors] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const handleChange = (value, index) => {
    setShowErrors(false)
    setGeneralError(false)
    setNicknames(prev => {
      const updated = [...prev];
      updated[index] = value;

      const allFilledExceptLast = updated
        .slice(0, -1)
        .every(n => n.length >= 3);

      const lastFilled = updated[updated.length - 1].length >= 3;

      if (allFilledExceptLast && lastFilled && updated.length < MAX) {
        return [...updated, ""];
      }

      return updated;
    });
  };

  const enterOnClick = async() => {
    if (showErrors || generalError) return;
    const allValid = nicknames.reduce((acc, nickname) => {
      return acc && (nickname.length === 0 || nickname.length > 2)
    }, true)
    if (allValid) {
      const res = await addMembers(nicknames.filter(n => n.length > 2))
      if (res.ok) {
        membersAdded(res.data)
      } else {
        setGeneralError(res.error)
      }
    } else {
      setShowErrors(true)
    }
  }

  return (
    <>
    
      {nicknames.map((nickname, i) => (
        <input
          key={i}
          placeholder={`Nickname ${i + 1}`}
          className={`px-4 py-2 bg-gray-100 rounded-md w-full border border-gray-200 mt-2 ${showErrors ? 'text-red-500' : 'text-gray-900'}`}
          value={nickname}
          onChange={e => handleChange(e.target.value, i)}
        />
      ))}
      {showErrors && <p className='text-red-500'>Nicknames must be at least 3 characters</p>}
      <p className='text-red-500'>{generalError}</p>
      
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => enterOnClick()}
      >
        Enter
      </button>
    </>
  );
};

