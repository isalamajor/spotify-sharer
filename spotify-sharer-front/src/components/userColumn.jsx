import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Trash2, SquareX  } from 'lucide-react' 
import { deleteSong } from '../api'
import DialogAddSong from './dialogAddSongs'


const ITEMS_PER_PAGE = 2
const  MAX_ITEMS_PER_PAGE = 20

const UserColumn = ( { username, songs, onSongAdded, deleteActive, showOnlyThisUser, usernameClickedEvent, onSongDeleted } ) => {
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE)
  const [page, setPage] = useState(0)
  const numPages = songs ? Math.ceil(songs.length / itemsPerPage) : 0
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogErrorOpen, setDialogErrorOpen] = useState(false)

  useEffect(() => {
    if (showOnlyThisUser === username) {
      setItemsPerPage(MAX_ITEMS_PER_PAGE)
      setPage(0)
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
          <div className='relative group' key={song.id}>
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

export default UserColumn