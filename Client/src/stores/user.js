import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
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

    function login(userData) {
        user.value = {
            ...userData,
            loggedIn: true,
            username: userData.username,
            ID: userData.ID,
            email: userData.email,
            role: userData.role
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
        user.value.username = newDetails.username;
        user.value.email = newDetails.email;

        localStorage.setItem('user', JSON.stringify(user.value));
    }

    return { user, login, logout, updateProfile }
})
