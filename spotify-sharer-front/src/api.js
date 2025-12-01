import axios from "axios";

//const API_URL = 'http://localhost:3002/spotifysharer'; // for dev phase
const API_URL = '/spotifysharer' // to build static from backend


const register = async (groupName, password) => {
    try {
        const response = await axios.post(`${API_URL}/group/register/`, {
            groupName,
            password
        });
        if (response.status === 200) {
            sessionStorage.setItem("authToken", response.data.token)
            return { ok: true, data: response.data.groupSaved };
        }
        console.error("Error registering:", response.data.error);
        return { ok: false, error: response.data.error || 'Register error' };
    }
    catch (error) {
        console.error("Error registering:", error);
        return { ok: false, error: error.response?.data?.error || 'Server error' };
    }
}


const login = async (groupName, password) => {
    try {
        const response = await axios.post(`${API_URL}/group/login/`, {
            groupName,
            password
        });
        if (response.status === 200) {
            sessionStorage.setItem("authToken", response.data.token)
            sessionStorage.setItem("groupData", JSON.stringify(response.data.groupData))
            return { ok: true, data: response.data.groupData }
            // :id, name, members {_id, username, songs {_id, spotifyId, created_at}}
        }
        console.error("Error registering 1:", response.data.error);
        return { ok: false, error: response.data.error || 'Login error' };
    }
    catch (error) {
        return { ok: false, error: error.response?.data?.error || 'Server error' }
    }
}


const addMembers = async (usernames) => {
    if (new Set(usernames).size !== usernames.length) { // Usernames duplicados
        return { ok: false, error: 'There cannot be duplicate usernames' }
    }

    try {
        const token = sessionStorage.getItem("authToken");
        if (!usernames || usernames.length < 1) return -1;
        const response = await axios.post(`${API_URL}/group/users/`, { usernames },
            { 
                headers: {
                'Authorization': `${token}`
                }
            }
        );
        if (response.status === 200 || response.status === 207) {         
            sessionStorage.setItem("groupData", JSON.stringify(response.data.groupData))
            return { ok: true, data: response.data.groupData || {}} // Array of members (_id, username)
        }
        console.error("Error adding members:", response.data.error);
        return { ok: false, error: response.data.error || 'Error adding members'};
    }
    catch (error) {
        console.error("Error adding members::", error);
        return { ok: false, error: error.response?.data?.error || 'Server error'}
    }
}


const addSong = async (username, spotifyId) => {
    try {
        const token = sessionStorage.getItem("authToken");
        if (!username || !spotifyId) return { ok: false, error: 'Missing fields'};
        const response = await axios.post(`${API_URL}/song/`, { username, spotifyId },
            { 
                headers: {
                'Authorization': `${token}`
                }
            }
        );
        if (response.status === 201) {
            return { ok: true, data: response.data.songAdded };
        }
        console.error("Error adding song:", response.data.error);
        return { ok: false, error: response.data.error || 'Error adding song'};
    }
    catch (error) {
        console.error("Error adding song:", error);
        return { ok: false, error: error.response?.data?.error || 'Server Error'};
    }
}




const deleteSong = async (songId) => {
    try {
        const token = sessionStorage.getItem("authToken");
        if (!songId) return { ok: false, error: 'Missing fields'};
        const response = await axios.delete(`${API_URL}/song/${songId}`,
            { 
                headers: {
                'Authorization': `${token}`
                }
            }
        );
        if (response.status === 204) {
            return { ok: true };
        }
        console.error("Error deleting song:", response.data.error);
        return { ok: false, error: response.data.error || 'Error deleting song'};
    }
    catch (error) {
        console.error("Error adding song:", error);
        return { ok: false, error: error.response?.data?.error || 'Server Error'};
    }
}


const checkSong = async (trackId) => {
    try {
        const token = sessionStorage.getItem("authToken");
        const response = await axios.get(`${API_URL}/song/check/${trackId}`,
            { 
                headers: {
                'Authorization': `${token}`
                },
                validateStatus: (status) => {
                    return status === 200 || status === 404;
                }
            }
        );
        if (response.status === 200) {
            return { ok: true, song: response.data.song };
        }
        return { ok: false, error: response.message || 'Track not found'};
    }
    catch (error) {
        console.error("Error checking track ID:", error);
        return { ok: false, error: error.response?.data?.error || 'Server Error'};
    }
}



const deleteGroup = async () => {
    try {
        const token = sessionStorage.getItem("authToken");
        const groupData = JSON.parse(sessionStorage.getItem("groupData") || '{}');
        const groupId = groupData.id;
        if (!groupId) return { ok: false, error: 'Missing fields'};
        const response = await axios.delete(`${API_URL}/group/${groupId}`,
            { 
                headers: {
                'Authorization': `${token}`
                }
            }
        );
        if (response.status === 204) {

            return { ok: true };
        }
        console.error("Error deleting song:", response.data.error);
        return { ok: false, error: response.data.error || 'Error deleting group'};
    }
    catch (error) {
        console.error("Error deleting group:", error);
        return { ok: false, error: error.response?.data?.error || 'Server Error'};
    }
}


export { register, login, addMembers, addSong, checkSong, deleteSong, deleteGroup }