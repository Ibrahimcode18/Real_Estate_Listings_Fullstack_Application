import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    // 1. STATE: The data we want to hold
    const user = ref({
        loggedIn: false,
        username: '',
        ID: 0,
        email: '',
        bio: ''
    })
    const storedUser = localStorage.getItem('user')
    if (storedUser) {
        user.value = JSON.parse(storedUser)
    }
    // 2. ACTIONS: Functions to change the data
    function login(userData) {
        user.value = {
            ...userData,
            loggedIn: true,
            username: userData.username,
            ID: userData.ID,
            email: userData.email
        }
        localStorage.setItem('user', JSON.stringify(user.value))
    }
    function logout() {
        user.value = {
            loggedIn: false,
            username: '',
            ID: 0,
            email: ''
        }
        localStorage.removeItem('user')
    }
    function updateProfile(newDetails) {
        // Update the RAM
        user.value.username = newDetails.username;
        user.value.email = newDetails.email;
        user.value.bio = newDetails.bio;

        // Immediately backup to the Hard Drive (LocalStorage)
        localStorage.setItem('user', JSON.stringify(user.value));
    }

    return { user, login, logout, updateProfile }
})
