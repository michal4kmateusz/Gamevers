
<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const menuOpen = ref(false)
const search = ref('')

const navigation = [
  {
    label: 'Strona główna',
    path: '/',
    icon: 'home'
  },
  {
    label: 'Gry',
    path: '/games',
    icon: 'games'
  },
  {
    label: 'Moja biblioteka',
    path: '/library',
    icon: 'library'
  }
]

const initials = computed(() => {
  const name = authStore.user?.name || 'U'

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
})

function toggleMenu() {
  menuOpen.value = !menuOpen.value
}

function closeMenu() {
  menuOpen.value = false
}

function isActive(path) {
  if (path === '/') {
    return route.path === '/'
  }

  return route.path === path ||
    route.path.startsWith(path + '/')
}

function searchGames() {
  const query = search.value.trim()

  router.push({
    path: '/games',
    query: query ? { search: query } : {}
  })

  closeMenu()
}

async function logout() {
  await authStore.logout()
  closeMenu()
  router.push('/')
}

function handleKeydown(event) {
  if (event.key === 'Escape') {
    closeMenu()
  }
}

function handleResize() {
  if (window.innerWidth > 1050) {
    closeMenu()
  }
}

watch(
  () => route.fullPath,
  closeMenu
)

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <header class="app-header">

    <div class="header-container">

      <!-- LOGO -->

      <RouterLink
        to="/"
        class="logo"
        @click="closeMenu"
      >
        GAME<span>VERS</span>
        <i class="logo-dot"></i>
      </RouterLink>

      <!-- NAWIGACJA DESKTOP -->

      <nav
        class="desktop-nav"
        aria-label="Nawigacja główna"
      >
        <RouterLink
          v-for="item in navigation"
          :key="item.path"
          :to="item.path"
          :class="{
            active: isActive(item.path)
          }"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- WYSZUKIWARKA DESKTOP -->

      <form
        class="desktop-search search-box"
        @submit.prevent="searchGames"
      >
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
        >
          <circle cx="11" cy="11" r="7"/>
          <path d="m16 16 4 4"/>
        </svg>

        <input
          v-model="search"
          type="search"
          placeholder="Szukaj gier..."
          aria-label="Szukaj gier"
        />
      </form>

      <!-- KONTO DESKTOP -->

      <div class="desktop-account">

        <template v-if="!authStore.isAuthenticated">

          <RouterLink
            to="/login"
            class="login-button"
          >
            Logowanie
          </RouterLink>

          <RouterLink
            to="/register"
            class="register-button"
          >
            Rejestracja
          </RouterLink>

        </template>

        <template v-else>

          <RouterLink
            v-if="authStore.isAdmin"
            to="/admin"
            class="admin-link"
          >
            Admin
          </RouterLink>

          <RouterLink
            to="/profile"
            class="profile-button"
          >
            <span class="avatar">
              {{ initials }}
            </span>
          </RouterLink>

          <button
            class="logout-button"
            type="button"
            @click="logout"
          >
            Wyloguj
          </button>

        </template>

      </div>

      <!-- PRZYCISKI MOBILNE -->

      <div class="mobile-actions">

        <RouterLink
          v-if="authStore.isAuthenticated"
          to="/profile"
          class="avatar"
        >
          {{ initials }}
        </RouterLink>

        <button
          v-else
          class="icon-button"
          type="button"
          aria-label="Otwórz wyszukiwarkę"
          @click="menuOpen = true"
        >
          <svg
            width="21"
            height="21"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <circle cx="11" cy="11" r="7"/>
            <path d="m16 16 4 4"/>
          </svg>
        </button>

        <button
          class="icon-button menu-toggle"
          type="button"
          :aria-expanded="menuOpen"
          :aria-label="
            menuOpen
              ? 'Zamknij menu'
              : 'Otwórz menu'
          "
          aria-controls="mobile-navigation"
          @click="toggleMenu"
        >
          <svg
            v-if="!menuOpen"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          >
            <path d="M4 6h16M4 12h16M4 18h16"/>
          </svg>

          <svg
            v-else
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
          >
            <path d="m6 6 12 12M18 6 6 18"/>
          </svg>
        </button>

      </div>

    </div>

    <!-- TLO MENU -->

    <Transition name="fade">
      <div
        v-if="menuOpen"
        class="mobile-backdrop"
        aria-hidden="true"
        @click="closeMenu"
      ></div>
    </Transition>

    <!-- MENU MOBILNE -->

    <Transition name="menu">

      <div
        v-if="menuOpen"
        id="mobile-navigation"
        class="mobile-menu"
      >

        <form
          class="search-box mobile-search"
          @submit.prevent="searchGames"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.8"
          >
            <circle cx="11" cy="11" r="7"/>
            <path d="m16 16 4 4"/>
          </svg>

          <input
            v-model="search"
            type="search"
            placeholder="Szukaj gier..."
            aria-label="Szukaj gier"
          />
        </form>

        <nav
          class="mobile-nav"
          aria-label="Nawigacja mobilna"
        >

          <RouterLink
            v-for="item in navigation"
            :key="item.path"
            :to="item.path"
            class="mobile-nav-link"
            :class="{
              active: isActive(item.path)
            }"
            @click="closeMenu"
          >

            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <template v-if="item.icon === 'home'">
                <path d="m3 10 9-7 9 7v11H3z"/>
                <path d="M9 21v-8h6v8"/>
              </template>

              <template v-else-if="item.icon === 'games'">
                <rect
                  x="3"
                  y="6"
                  width="18"
                  height="12"
                  rx="4"
                />
                <path d="M7 10v4M5 12h4"/>
                <path d="M16 11h.01M18 13h.01"/>
              </template>

              <template v-else>
                <rect
                  x="4"
                  y="4"
                  width="5"
                  height="16"
                  rx="1"
                />
                <rect
                  x="11"
                  y="4"
                  width="5"
                  height="16"
                  rx="1"
                />
                <path d="m18 5 3 14"/>
              </template>
            </svg>

            <span>{{ item.label }}</span>

            <svg
              class="nav-arrow"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path d="m9 6 6 6-6 6"/>
            </svg>

          </RouterLink>

          <RouterLink
            v-if="authStore.isAdmin"
            to="/admin"
            class="mobile-nav-link"
            @click="closeMenu"
          >
            Panel administratora
          </RouterLink>

        </nav>

        <div class="mobile-account">

          <template v-if="!authStore.isAuthenticated">

            <RouterLink
              to="/login"
              class="login-button"
              @click="closeMenu"
            >
              Logowanie
            </RouterLink>

            <RouterLink
              to="/register"
              class="register-button"
              @click="closeMenu"
            >
              Rejestracja
            </RouterLink>

          </template>

          <template v-else>

            <RouterLink
              to="/profile"
              class="login-button"
              @click="closeMenu"
            >
              Mój profil
            </RouterLink>

            <button
              class="logout-button"
              type="button"
              @click="logout"
            >
              Wyloguj
            </button>

          </template>

        </div>

      </div>

    </Transition>

  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  background: #0B0F19;
  border-bottom: 1px solid #293244;
  color: #F8FAFC;
}

.header-container {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 28px;
  width: 100%;
  max-width: 1400px;
  min-height: 64px;
  margin: 0 auto;
  padding: 0 24px;
  background: #0B0F19;
}

/* LOGO */

.logo {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  font-size: 21px;
  font-weight: 800;
  letter-spacing: -0.8px;
  color: #F8FAFC;
  text-decoration: none;
}

.logo span {
  color: #8B5CF6;
}

.logo-dot {
  width: 5px;
  height: 5px;
  margin-left: 6px;
  background: #22D3EE;
  border-radius: 50%;
  align-self: flex-start;
  margin-top: 7px;
}

/* NAWIGACJA */

.desktop-nav {
  display: flex;
  align-items: center;
  align-self: stretch;
  gap: 22px;
}

.desktop-nav a {
  position: relative;
  display: flex;
  align-items: center;
  color: #94A3B8;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
  transition: color .2s;
}

.desktop-nav a:hover,
.desktop-nav a.active {
  color: #F8FAFC;
}

.desktop-nav a.active::after {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: #8B5CF6;
  border-radius: 2px;
  content: '';
}

/* WYSZUKIWARKA */

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 7px;
  color: #94A3B8;
  padding: 0 12px;
}

.search-box:focus-within {
  border-color: #8B5CF6;
}

.desktop-search {
  flex: 1;
  max-width: 280px;
  min-width: 100px;
  margin-left: auto;
  height: 36px;
}

.search-box input {
  width: 100%;
  min-width: 0;
  padding: 0;
  background: transparent;
  border: none;
  outline: none;
  color: #F8FAFC;
  font-size: 12px;
}

.search-box input::placeholder {
  color: #94A3B8;
}

/* KONTO */

.desktop-account {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.login-button,
.register-button,
.logout-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 9px 16px;
  border-radius: 7px;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: background .2s;
}

.login-button {
  background: transparent;
  border: 1px solid transparent;
  color: #F8FAFC;
}

.login-button:hover {
  background: #151B2B;
}

.register-button {
  background: #8B5CF6;
  border: 1px solid #8B5CF6;
  color: #FFFFFF;
}

.register-button:hover {
  background: #7C3AED;
}

.logout-button {
  background: #151B2B;
  border: 1px solid #293244;
  color: #F8FAFC;
}

.admin-link {
  color: #C4B5FD;
  font-size: 12px;
}

.avatar {
  display: grid;
  place-items: center;
  width: 35px;
  height: 35px;
  flex-shrink: 0;
  border-radius: 50%;
  background: #31234F;
  border: 1px solid #8B5CF6;
  color: #C4B5FD;
  font-size: 12px;
  font-weight: 700;
}

/* MENU MOBILNE */

.mobile-actions,
.mobile-menu,
.mobile-backdrop {
  display: none;
}

.icon-button {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  padding: 0;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 8px;
  color: #94A3B8;
  cursor: pointer;
}

.icon-button:hover {
  background: #151B2B;
  color: #F8FAFC;
}

.menu-toggle {
  border-color: #293244;
  color: #F8FAFC;
}

/* ANIMACJE */

.fade-enter-active,
.fade-leave-active {
  transition: opacity .2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.menu-enter-active,
.menu-leave-active {
  transition:
    opacity .2s ease,
    transform .2s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* TABLETY I TELEFONY */

@media (max-width: 1050px) {

  .header-container {
    min-height: 60px;
    padding: 0 18px;
    gap: 12px;
  }

  .desktop-nav,
  .desktop-search,
  .desktop-account {
    display: none;
  }

  .mobile-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: auto;
  }

  .mobile-backdrop {
    display: block;
    position: fixed;
    inset: 60px 0 0;
    z-index: 1;
    background: rgba(0, 0, 0, .55);
  }

  .mobile-menu {
    display: block;
    position: absolute;
    top: calc(100% + 8px);
    left: 12px;
    right: 12px;
    z-index: 2;
    max-width: 460px;
    max-height: calc(100dvh - 84px);
    margin-left: auto;
    padding: 16px;
    overflow-y: auto;
    background: #151B2B;
    border: 1px solid #293244;
    border-radius: 12px;
    box-shadow: 0 12px 40px rgba(0,0,0,.35);
  }

  .mobile-search {
    height: 42px;
    background: #0B0F19;
  }

  .mobile-search input {
    font-size: 14px;
  }

  .mobile-nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 12px;
  }

  .mobile-nav-link {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 44px;
    padding: 10px 12px;
    border-radius: 7px;
    color: #CBD5E1;
    font-size: 14px;
    font-weight: 500;
    text-decoration: none;
  }

  .mobile-nav-link:hover {
    background: #1E293B;
  }

  .mobile-nav-link.active {
    background: rgba(139, 92, 246, .12);
    color: #C4B5FD;
  }

  .mobile-nav-link .nav-arrow {
    margin-left: auto;
    opacity: .6;
  }

  .mobile-account {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid #293244;
  }

  .mobile-account .login-button,
  .mobile-account .register-button,
  .mobile-account .logout-button {
    width: 100%;
    min-height: 42px;
    padding: 10px 8px;
    font-size: 13px;
  }

  .mobile-account .login-button {
    background: #0B0F19;
    border-color: #293244;
  }
}

@media (max-width: 480px) {

  .header-container {
    padding: 0 14px;
  }

  .logo {
    font-size: 19px;
  }

  .mobile-actions {
    gap: 5px;
  }

  .mobile-menu {
    left: 10px;
    right: 10px;
    padding: 14px;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
  }
}
</style>
