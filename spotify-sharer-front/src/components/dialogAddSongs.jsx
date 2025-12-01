import { useState } from 'react'
import { X, LoaderCircle, Check, MessageCircleX } from 'lucide-react' 
import { addSong, checkSong } from '../api'


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


export default DialogAddSong