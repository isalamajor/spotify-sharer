const Song = require('../models/song')
const Group = require('../models/group')
const User = require('../models/user')


const getSongs = async (_req, res) => {
  try {
    const songs = await Song.find({})
    return res.status(200).json(songs)
  } catch (error) {
    return res.status(500).json( { error: error.message } )
  }
}

const getUserSongs = async (req, res) => {
  try {
    const groupId = req.group.id
    const username = req.params.username

    if (!username) {
      return res.status(400).send({
        error: "Field username missing in url"
      })
    }
    
    const user = await User.findOne( { username: username })

    if (!user) {
      return res.status(404).send({
        error: `User ${username} not found`
      })
    }
    if (!user.group.equals(groupId)) {
      return res.status(401).end()
    }

    const data = await Song.find( { poster: user} ).sort({ created_at: -1 }) 
    return res.status(200).json(data)
  
  } catch (error) {
    return res.status(500).json({
      error: error.message
    })
  }
}

const deleteSong = async (req, res) => {
  try {
    const songId = req.params.id
    const groupId = req.group.id

    if (!songId) {
      return res.status(400).send({
        error: "Missing field songId in url"
      })
    }

    const song = await Song.findById(songId).populate({
      path: 'poster',
      select: 'group'
    })

    if (!song.poster.group.equals(groupId)) return res.status(401).end()

    await song.deleteOne();
    return res.status(204).end()

  } catch (error) {
    return res.status(500).json({
      error: error.message
    })
  }
}


const postSong =  async (req, res) => {
  try {
    const groupId = req.group.id
    const newsong = req.body

    if (!groupId) {
      return res.status(401).end()
    }

    if (!newsong || !newsong.spotifyId || !newsong.username) {
      return res.status(400).json({
        error: 'Missing fields'
      })
    }

    const userInGroup = await User.findOne( { username : newsong.username, group: groupId } )
    const group = await Group.findById(groupId)

    if (!userInGroup) {
      return res.status(401).send({
        error: `User ${username} is not part of group ${group.name}`
      }) 
    }

    const songAlreadyRegistered = await Song.findOne({
      spotifyId : newsong.spotifyId, poster : userInGroup._id
    })

    if (songAlreadyRegistered) {
      return res.status(402).json({
        error: 'This user already registered this song'
      })
    }
    const newRegister = new Song ({
      spotifyId : newsong.spotifyId, poster : userInGroup._id
    })

    const saved = await newRegister.save()
    if (saved) {
      return res.status(201).json({
        songAdded: saved
      })
    }
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      error: error.message
    })
  }
}



module.exports = { 
  getSongs,
  getUserSongs,
  deleteSong,
  postSong
}
