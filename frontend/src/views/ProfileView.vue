
<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

// Dane zalogowanego użytkownika
const user = computed(() => authStore.user)

const username = computed(() => {
  return user.value?.name || 'Użytkownik'
})

const email = computed(() => {
  return user.value?.email || 'Brak adresu e-mail'
})

const avatarLetter = computed(() => {
  return username.value.charAt(0).toUpperCase()
})

const userRole = computed(() => {
  return authStore.isAdmin
    ? 'Administrator Gamevers'
    : 'Użytkownik Gamevers'
})

// Statystyki pozostają zerowe, dopóki
// nie podłączymy danych biblioteki i recenzji.
const gamesCount = 0
const reviewsCount = 0

async function handleLogout() {
  try {
    await authStore.logout()
    await router.push('/')
  } catch (error) {
    console.error('Błąd wylogowania:', error)
  }
}
</script>

<template>
  <main class="profile-page">
    <div class="profile-container">

      <!-- Nagłówek -->
      <div class="page-heading">
        <span class="eyebrow">TWOJE KONTO</span>
        <h1>Mój profil</h1>
        <p>
          Zarządzaj swoim kontem i odkrywaj
          możliwości Gamevers.
        </p>
      </div>

      <!-- Karta użytkownika -->
      <section class="profile-card">
        <div class="profile-header">
          <div class="avatar">
            {{ avatarLetter }}
          </div>

          <div class="user-info">
            <h2>{{ username }}</h2>
            <p class="user-email">{{ email }}</p>
            <span class="role-label">
              {{ userRole }}
            </span>
          </div>
        </div>

        <!-- Statystyki -->
        <div class="profile-stats">
          <div class="stat-card">
            <span class="stat-icon">🎮</span>
            <strong>{{ gamesCount }}</strong>
            <span>Gry w bibliotece</span>
          </div>

          <div class="stat-card">
            <span class="stat-icon">⭐</span>
            <strong>{{ reviewsCount }}</strong>
            <span>Opublikowane recenzje</span>
          </div>
        </div>
      </section>

      <!-- Dostępne funkcje -->
      <section class="profile-section">
        <h2>Moje konto</h2>

        <div class="action-grid">
          <RouterLink
            to="/library"
            class="action-card"
          >
            <span class="action-icon">🎮</span>

            <div>
              <h3>Moja biblioteka</h3>
              <p>
                Przeglądaj zapisane gry
                i zarządzaj ich statusami.
              </p>
            </div>

            <span class="action-arrow">→</span>
          </RouterLink>

          <RouterLink
            to="/games"
            class="action-card"
          >
            <span class="action-icon">🔍</span>

            <div>
              <h3>Odkrywaj gry</h3>
              <p>
                Znajdź nowe tytuły
                i dodaj je do biblioteki.
              </p>
            </div>

            <span class="action-arrow">→</span>
          </RouterLink>

          <RouterLink
            v-if="authStore.isAdmin"
            to="/admin"
            class="action-card"
          >
            <span class="action-icon">⚙️</span>

            <div>
              <h3>Panel administratora</h3>
              <p>
                Zarządzaj grami,
                użytkownikami i recenzjami.
              </p>
            </div>

            <span class="action-arrow">→</span>
          </RouterLink>
        </div>
      </section>

      <!-- Informacje o koncie -->
      <section class="account-section">
        <h2>Informacje o koncie</h2>

        <div class="account-details">
          <div class="detail-row">
            <span>Nazwa użytkownika</span>
            <strong>{{ username }}</strong>
          </div>

          <div class="detail-row">
            <span>Adres e-mail</span>
            <strong>{{ email }}</strong>
          </div>

          <div class="detail-row">
            <span>Rola</span>
            <strong>{{ userRole }}</strong>
          </div>
        </div>
      </section>

      <!-- Wylogowanie -->
      <button
        type="button"
        class="logout-button"
        :disabled="authStore.loading"
        @click="handleLogout"
      >
        {{ authStore.loading ? 'Wylogowywanie...' : 'Wyloguj się' }}
      </button>

    </div>
  </main>
</template>

<style scoped>
.profile-page {
  min-height: 80vh;
  padding: 60px 20px 90px;
  color: #F8FAFC;
}

.profile-container {
  max-width: 1100px;
  margin: 0 auto;
}

.page-heading {
  margin-bottom: 32px;
}

.eyebrow {
  color: #A78BFA;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

.page-heading h1 {
  margin: 12px 0;
  font-size: 36px;
}

.page-heading p {
  color: #94A3B8;
  line-height: 1.7;
}

.profile-card {
  padding: 32px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 18px;
  margin-bottom: 36px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 22px;
  margin-bottom: 32px;
}

.avatar {
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  background: #8B5CF6;
  color: #FFFFFF;
  font-size: 34px;
  font-weight: 800;
}

.user-info h2 {
  margin: 0 0 8px;
  font-size: 25px;
}

.user-email {
  color: #94A3B8;
  margin: 0 0 10px;
  overflow-wrap: anywhere;
}

.role-label {
  color: #A78BFA;
  font-size: 13px;
  font-weight: 700;
}

.profile-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  background: #0B0F19;
  border: 1px solid #293244;
  border-radius: 12px;
  text-align: center;
}

.stat-icon {
  font-size: 25px;
}

.stat-card strong {
  font-size: 28px;
}

.stat-card span:last-child {
  color: #94A3B8;
  font-size: 13px;
}

.profile-section,
.account-section {
  margin-bottom: 36px;
}

.profile-section h2,
.account-section h2 {
  margin-bottom: 20px;
  font-size: 23px;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
  color: #F8FAFC;
  text-decoration: none;
  transition: border-color 0.2s;
}

.action-card:hover {
  border-color: #8B5CF6;
}

.action-icon {
  font-size: 28px;
}

.action-card div {
  flex: 1;
}

.action-card h3 {
  margin: 0 0 8px;
  font-size: 17px;
}

.action-card p {
  margin: 0;
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.6;
}

.action-arrow {
  color: #A78BFA;
  font-size: 22px;
}

.account-details {
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 14px;
  padding: 10px 24px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 0;
  border-bottom: 1px solid #293244;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row span {
  color: #94A3B8;
}

.detail-row strong {
  text-align: right;
  overflow-wrap: anywhere;
}

.logout-button {
  padding: 14px 24px;
  background: #3B1D29;
  border: 1px solid #7F1D1D;
  border-radius: 10px;
  color: #FCA5A5;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.logout-button:hover:not(:disabled) {
  background: #4C1D2A;
}

.logout-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (max-width: 700px) {
  .profile-page {
    padding: 40px 16px 70px;
  }

  .page-heading h1 {
    font-size: 29px;
  }

  .profile-card {
    padding: 22px;
  }

  .profile-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .action-grid {
    grid-template-columns: 1fr;
  }

  .detail-row {
    flex-direction: column;
    gap: 6px;
  }

  .detail-row strong {
    text-align: left;
  }
}

@media (max-width: 380px) {
  .profile-stats {
    grid-template-columns: 1fr;
  }
}
</style>
