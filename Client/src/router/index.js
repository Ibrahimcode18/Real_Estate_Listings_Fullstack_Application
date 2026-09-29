import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import ProfileView from '../views/ProfileView.vue'
import LocationsView from '@/views/LocationsView.vue'
import { useUserStore } from '../stores/user';
import NotFound from '@/views/NotFound.vue'

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
        component: () => import('../views/LocationPropertiesView.vue'), 
        meta: { requiresAuth: true } 
    }, 
    {   path: '/profile', 
        name: 'profile', 
        component: ProfileView,
        meta: { requiresAuth: true }
    },
    {   path: '/properties/:id', 
        name: 'PropertyDetails',
        component: () => import('../views/PropertyDetailsView.vue'),
    },
    {   path: '/dashboard', 
        name: 'Dashboard', 
        component: () => import('../views/Dashboard.vue'), 
        meta: { requiresAuth: true }
    },
    {
        path: '/agency/:id', 
        name: 'AgencyProfile',
        component: () => import('../views/AgencyProfileView.vue'),
        meta: { requiresAuth: true }
    },
    { 
        path: '/agent-application', 
        name: 'AgentApplication',
        component: () => import('../views/AgentFormView.vue'),
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
        component: () => import('../views/CreateProperty.vue'), 
        meta: { requiresAuth: true } 
    },
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound }
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
