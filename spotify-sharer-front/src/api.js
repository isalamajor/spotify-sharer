import { data } from "autoprefixer";
import axios from "axios";

const API_URL = 'http://localhost:3003/spotifysharer';


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
            console.log("login: ", response.data)
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
        console.log('Token', token)
        if (!usernames || usernames.length < 1) return -1;
        const response = await axios.post(`${API_URL}/group/users/`, { usernames },
            { 
                headers: {
                'Authorization': `${token}`
                }
            }
        );
        if (response.status === 200 || response.status === 207) {
            console.log("add:", response.data.members)
            return { ok: true, data: response.data.members } // Array of members (_id, username)
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



const checkSong = async (spotifyId) => {
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



export { register, login, addMembers, addSong }