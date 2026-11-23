
<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const menuOpen = ref(false)

function closeMenu() {
  menuOpen.value = false
}

async function handleLogout() {
  try {
    await authStore.logout()
    closeMenu()
    await router.push('/')
  } catch (error) {
    console.error('Błąd wylogowania:', error)
  }
}
</script>

<template>
  <header class="site-header">
    <div class="header-container">
      <RouterLink
        to="/"
        class="logo"
        @click="closeMenu"
      >
        GAME<span>VERS</span>
      </RouterLink>

      <button
        type="button"
        class="menu-toggle"
        :aria-expanded="menuOpen"
        aria-label="Otwórz lub zamknij menu"
        @click="menuOpen = !menuOpen"
      >
        {{ menuOpen ? '✕' : '☰' }}
      </button>

      <nav
        class="navigation"
        :class="{ open: menuOpen }"
        aria-label="Nawigacja główna"
      >
        <RouterLink to="/" @click="closeMenu">
          Strona główna
        </RouterLink>

        <RouterLink to="/games" @click="closeMenu">
          Gry
        </RouterLink>

        <RouterLink
          v-if="authStore.isAuthenticated"
          to="/library"
          @click="closeMenu"
        >
          Moja biblioteka
        </RouterLink>

        <RouterLink
          v-if="authStore.isAdmin"
          to="/admin"
          @click="closeMenu"
        >
          Panel admina
        </RouterLink>

        <div class="auth-actions">
          <template v-if="authStore.isAuthenticated">
            <RouterLink
              to="/profile"
              class="profile-link"
              @click="closeMenu"
            >
              {{ authStore.user?.name || 'Mój profil' }}
            </RouterLink>

            <button
              type="button"
              class="logout-button"
              :disabled="authStore.loading"
              @click="handleLogout"
            >
              Wyloguj
            </button>
          </template>

          <template v-else>
            <RouterLink
              to="/login"
              class="login-link"
              @click="closeMenu"
            >
              Zaloguj się
            </RouterLink>

            <RouterLink
              to="/register"
              class="register-link"
              @click="closeMenu"
            >
              Rejestracja
            </RouterLink>
          </template>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(11, 15, 25, 0.96);
  border-bottom: 1px solid #293244;
  backdrop-filter: blur(14px);
}

.header-container {
  max-width: 1280px;
  min-height: 76px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
}

.logo {
  color: #F8FAFC;
  font-size: 23px;
  font-weight: 900;
  letter-spacing: 1px;
  text-decoration: none;
  white-space: nowrap;
}

.logo span {
  color: #8B5CF6;
}

.navigation {
  display: flex;
  align-items: center;
  gap: 24px;
}

.navigation > a {
  color: #CBD5E1;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
}

.navigation > a:hover,
.navigation > a.router-link-active {
  color: #A78BFA;
}

.auth-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.login-link,
.profile-link {
  color: #F8FAFC;
  font-size: 14px;
  text-decoration: none;
}

.register-link,
.logout-button {
  padding: 11px 17px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

.register-link {
  background: #8B5CF6;
  color: #FFFFFF;
}

.logout-button {
  background: #293244;
  border: none;
  color: #F8FAFC;
  cursor: pointer;
}

.logout-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.menu-toggle {
  display: none;
  background: transparent;
  border: 1px solid #293244;
  border-radius: 8px;
  color: #F8FAFC;
  padding: 8px 12px;
  font-size: 20px;
  cursor: pointer;
}

@media (max-width: 900px) {
  .header-container {
    min-height: 68px;
    padding: 0 16px;
  }

  .menu-toggle {
    display: block;
  }

  .navigation {
    display: none;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    padding: 24px 16px;
    background: #111827;
    border-bottom: 1px solid #293244;
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  .navigation.open {
    display: flex;
  }

  .auth-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .auth-actions a,
  .logout-button {
    text-align: center;
  }
}
</style>
