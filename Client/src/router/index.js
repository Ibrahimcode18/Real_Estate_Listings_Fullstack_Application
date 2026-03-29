import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import PropertyDetailsView from '@/views/PropertyDetailsView.vue';
import LocationsView from '@/views/LocationsView.vue'
import LocationPropertiesView from '@/views/LocationPropertiesView.vue'
import { useUserStore } from '../stores/user';
import AgencyProfileView from '@/views/AgencyProfileView.vue'
import AgentFormView from '@/views/AgentFormView.vue'
import CreateProperty from '@/views/CreateProperty.vue'
import Dashboard from '@/views/Dashboard.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
    {   path: '/', 
        name: 'home', 
        component: HomeView 
    },
    {   path: '/login', 
        name: 'login', 
        component: LoginView 
    },
    {   path: '/register', 
        name: 'register', 
        component: RegisterView 
    },
    {   path: '/locations', 
        name:'locations', 
        component: LocationsView 
    },
    {   path: '/locations/:id', 
        name:'locationProperties', 
        component: () => LocationPropertiesView, 
        meta: { requiresAuth: true } 
    }, 
    {   path: '/profile', 
        name: 'profile', 
        component: () => import('../views/ProfileView.vue'), 
        meta: { requiresAuth: true }
    },
    {   path: '/properties/:id', 
        name: 'PropertyDetails',
        component: PropertyDetailsView
    },
    {   path: '/dashboard', 
        name: 'Dashboard', 
        component: () => Dashboard, 
        meta: { requiresAuth: true }
    },
    {
        path: '/agency/:id', 
        name: 'AgencyProfile',
        component: () => AgencyProfileView,
        meta: { requiresAuth: true }
    },
    { 
        path: '/agent-application', 
        name: 'AgentApplication',
        component: () => AgentFormView,
        meta: { requiresAuth: true }
    },
    {
        path: '/agentproperties',
        name: 'AgentProperties',
        component: () => import('../views/AgentPropertiesView.vue'),
        meta: { requiresAuth: true }
    },
    {   path: '/newProperty', 
        name: 'NewProperty', 
        component: () => CreateProperty, 
        meta: { requiresAuth: true } 
    }
    ]
})

router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    if (to.meta.requiresAuth && !userStore.user.loggedIn) {
        alert("🛑 You must be logged in to view this page.");
        next({
            path: '/login',
            query: { redirect: to.fullPath }
        });
    }else {
        next(); // Otherwise, let them through normally
    }
});
export default router;
