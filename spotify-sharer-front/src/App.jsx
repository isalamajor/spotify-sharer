import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Trash2, X, LogOut, Check, LoaderCircle, MessageCircleX, SquareX, DoorClosed, Settings } from 'lucide-react' 
import { register, login, addMembers, addSong, checkSong, deleteSong, deleteGroup } from './api'
import './App.css'

const ITEMS_PER_PAGE = 2
const MAX_MEMBERS = 6
const  MAX_ITEMS_PER_PAGE = 20

function App() {
  const [loginIsOpen, setLoginIsOpen] = useState(true)
  const [groupname, setGroupname] = useState('')
  const [members, setMembers] = useState([])
  const [trash, setTrash] = useState(false)
  const [addUserOpen, setAddUserOpen] = useState(false)
  const [configOpen, setConfigOpen] = useState(false)
  const [showAllUser, setShowAllUser] = useState('')

// Restore session if any when rerendering
  useEffect(() => {
    try {
      setTrash(false)
      const token = sessionStorage.getItem('authToken')
      const gd = sessionStorage.getItem('groupData')
      if (token && gd) {
        const parsed = JSON.parse(gd)
        setGroupname(parsed.name || '')
        setMembers(parsed.members || [])
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
    sessionStorage.removeItem("authToken")
    sessionStorage.removeItem("groupData")
    setLoginIsOpen(true)
  }

  return (
  <div className='w-full px-10 pb-10 pt-2 flex flex-col items-center h-fit'>
      
      {loginIsOpen ? 
      <DialogLogin isOpen={loginIsOpen} onClose={() => setIsOpen(false)} 
      goToApp={async (groupData) => { 
        setGroupname(groupData.name); 
        setMembers(groupData.members);
        setLoginIsOpen(false);
        setTrash(false);
      }}/>
      :
      <>
      <div className='w-full flex justify-end gap-2 items-center my-5'>
        <Trash2 className={`cursor-pointer p-1 hover:text-red-500 ${trash && "hover:text-white bg-red-500 p-1 rounded-full"} w-8 h-8 sm:w-10 sm:h-10`} onClick={() => setTrash(!trash)}/>
        <Settings     
        className='cursor-pointer p-1  w-8 h-8 sm:w-10 sm:h-10'
        onClick={() => setConfigOpen(true)}/>
        <LogOut 
        className='cursor-pointer p-1  w-8 h-8 sm:w-10 sm:h-10'
        onClick={() => logOut()}/>
      </div>
      <h1 className='w-full text-center font-semibold'>Spotify Sharer</h1>
      <h2 className={`w-full text-center text-3xl text-[#fcb6f7] ${ trash && 'cursor-pointer text-red-400'}`}>{groupname}</h2>
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
                return { ...m, songs: [ newSong, ...m.songs ] }
              }
              return m
            })
            setMembers(membersUpdated)
            sessionStorage.setItem("groupData", JSON.stringify({
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
      
      { addUserOpen &&
      <DialogAddMember onClose={() => setAddUserOpen(false)}/>}
      
      { configOpen &&
      <DialogConfig onClose={() => setConfigOpen(false)} onDeletedGroup={() => logOut()}/>}
      </>
      }
      
  </div>
  )
} 

export default App


const UserColumn = ( { username, songs, onSongAdded, deleteActive, showOnlyThisUser, usernameClickedEvent, onSongDeleted } ) => {
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE)
  const [page, setPage] = useState(0)
  const numPages = songs ? Math.ceil(songs.length / itemsPerPage) : 0
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogErrorOpen, setDialogErrorOpen] = useState(false)

  useEffect(() => {
    if (showOnlyThisUser === username) {
      setItemsPerPage(MAX_ITEMS_PER_PAGE)
    } else {
      setPage(0)
      setItemsPerPage(ITEMS_PER_PAGE)
    }
  }, [showOnlyThisUser])


  const onDeleteSong = async (songId) => {
    const res = await deleteSong(songId)
    if (res.ok) {
      onSongDeleted(songId)
    } else {
      setDialogErrorOpen(true)
    }
  }

  if (showOnlyThisUser === "" | showOnlyThisUser === username) {
    return (
    <div className='h-min-[800px]'>
      <h1 className='text-center font-thin cursor-pointer'
      onClick={() => usernameClickedEvent(username)}>{username}</h1>
      <div className={`${showOnlyThisUser ? "grid lg:grid-cols-2 gap-3" : "flex flex-col gap-3"}`}>
        
        {songs && songs.slice(page*itemsPerPage, page*itemsPerPage + itemsPerPage).map(song =>
          <div className='relative group' key={song._id}>
            <iframe data-testid="embed-iframe" style={{"borderRadius":"12px"}} src={`https://open.spotify.com/embed/track/${song.spotifyId}?utm_source=generator`} width="100%" height="352" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy">
            </iframe>
            {deleteActive && 
            <div className='absolute inset-0 bg-red-500 z-50 opacity-0 opacity-50 sm:opacity-0 sm:group-hover:opacity-50 transition-opacity flex items-center justify-center text-white text-xl cursor-pointer' style={{"borderRadius":"12px"}} onClick={() => onDeleteSong(song._id)}><Trash2 size={100}/></div>
            }
          </div>
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

      {dialogErrorOpen && 
      <DialogError onClose={() => setDialogErrorOpen(false)}/>
      }
    </div>
    )
  }
}


const DialogError = ( { onClose } ) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-gray-800">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg flex flex-col gap-4">
        {/* Header */}
        <div className="flex flex-col justify-between items-center gap-3">
          <h2 className='text-3xl'>Failed to delete song</h2>
          <div className='flex gap-1 text-xl text-red-600 items-center'>
            <SquareX/>
            <p className=''>Try again later...</p>
          </div>
          <button className='text-white' onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
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
    const groupDataUpdate = {...groupData, members: members}
    setGroupData(groupDataUpdate)
    goToApp(groupDataUpdate)
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
              console.log('members added', res.data)
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


const DialogAddSong = ({ onClose, username, onSongAdded }) => {
  const [songLink, setSongLink] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState(null); // "loading" | "valid" | "invalid" | null
  const [songInfo, setSongInfo] = useState(null);
  const [checked, setChecked] = useState(false)
  const [trackIdChecked, setTrackIdChecked] = useState(null)

  const checkOnClick = async () => {
    setError("");
    setStatus("loading");
    setSongInfo(null);
    if (songLink.trim() === '') {
      setError("Enter a song share link")
      setStatus("invalid")
      return
    }
    const trackId = obtainSpotyId(songLink);

    if (trackId === -1) {
      setError("The link is not valid");
      setStatus("invalid");
      return;
    }

    // 1) Validar canción en Spotify
    const valid = await checkSong(trackId);

    if (!valid.ok) {
      setError(valid.error || "Track invalid or not found");
      setStatus("invalid");
      return;
    }

    setSongInfo(valid.song);
    setStatus("valid");
    setTrackIdChecked(trackId)
    setChecked(true);
  };


  const addOnClick = async () => {
    // 2) Añadir canción al backend
    const res = await addSong(username, trackIdChecked);

    if (!res.ok) {
      setError(res.error || "Error adding song");
      setStatus("invalid");
      return;
    }

    onSongAdded(res.data);
    setChecked(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 text-gray-800">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-lg flex flex-col gap-4 mx-5">

        {/* Header */}
        <div className="flex flex-row justify-between items-center">
          <h1 className="font-light mb-2">Add a song</h1>
          <X size={40} strokeWidth="1" className="cursor-pointer" onClick={onClose} />
        </div>

        {/* Input */}
        <input
          placeholder="Enter a Spotify song share link"
          className="px-4 py-2 bg-gray-100 rounded-md w-full border border-gray-300"
          value={songLink}
          onChange={(e) => {
            setChecked(false)
            setError("");
            setStatus(null);
            setSongLink(e.target.value);
            setTrackIdChecked('')
            setStatus(null)
          }}
        />

        {/* Estado */}
        <SpotifyTrackChecker status={status} error={error} song={songInfo} />

        { checked ? 
          <button
            className="px-4 py-2 text-white rounded !bg-green-700"
            onClick={addOnClick}
          >
            Add
          </button>
          : 
          <button
            className="px-4 py-2 text-white rounded"
            onClick={checkOnClick}
          >
            Check
          </button>
        }
      </div>
    </div>
  );
};


const obtainSpotyId = (link) => {
  const regex = /(?:spotify\.com\/(?:intl-[a-z]{2}\/)?(?:embed\/)?track\/)?([A-Za-z0-9]{22})/;
  const match = link.match(regex);
  if (!match) return -1;
  return match[1];
};


const SpotifyTrackChecker = ({ status, error, song }) => {
  if (status === "loading") {
    return (
      <p className="flex flex-row gap-2 items-center text-purple-500">
        <LoaderCircle className="animate-spin" /> Verifying track...
      </p>
    );
  }

  if (status === "invalid") {
    return <p className="flex flex-row gap-2 items-center text-red-500">
        <MessageCircleX/> {error}
      </p>;
  }

  if (status === "valid") {
    return (
      <p className="text-green-600 flex gap-2 items-center">
        <Check size={24} /> {song}
      </p>
    );
  }

  return null;
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
        <p className='text-red-500'>{error}</p>
      </div>
    </div>
  )
}