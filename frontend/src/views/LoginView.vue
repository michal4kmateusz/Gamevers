
<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const validationError = ref('')
const serverError = ref('')

async function handleLogin() {
  validationError.value = ''
  serverError.value = ''

  if (!email.value.trim() || !password.value) {
    validationError.value = 'Wypełnij wszystkie pola.'
    return
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(email.value.trim())) {
    validationError.value = 'Podaj poprawny adres e-mail.'
    return
  }

  try {
    await authStore.login({
      email: email.value.trim(),
      password: password.value
    })

    await router.push('/profile')
  } catch (error) {
    if (error.response?.status === 422) {
      serverError.value =
        'Sprawdź poprawność wprowadzonych danych.'
    } else if (error.response?.status === 401) {
      serverError.value =
        'Nieprawidłowy adres e-mail lub hasło.'
    } else {
      serverError.value =
        'Nie udało się połączyć z serwerem. Spróbuj ponownie później.'
    }
  }
}
</script>

<template>
  <main class="login-page">
    <div class="login-card">
      <div class="login-header">
        <span class="eyebrow">GAMEVERS ACCOUNT</span>

        <h1>Witaj ponownie!</h1>

        <p>
          Zaloguj się, aby zarządzać swoją
          biblioteką gier i recenzjami.
        </p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="login-email">
            Adres e-mail
          </label>

          <input
            id="login-email"
            v-model="email"
            type="email"
            placeholder="twoj@email.pl"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label for="login-password">
            Hasło
          </label>

          <div class="password-field">
            <input
              id="login-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Wpisz hasło"
              autocomplete="current-password"
              required
            />

            <button
              type="button"
              class="password-toggle"
              :aria-label="showPassword ? 'Ukryj hasło' : 'Pokaż hasło'"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Ukryj' : 'Pokaż' }}
            </button>
          </div>
        </div>

        <div
          v-if="validationError || serverError"
          class="error-message"
          role="alert"
        >
          {{ validationError || serverError }}
        </div>

        <button
          type="submit"
          class="submit-button"
          :disabled="authStore.loading"
        >
          {{ authStore.loading ? 'Logowanie...' : 'Zaloguj się' }}
        </button>
      </form>

      <p class="register-text">
        Nie masz jeszcze konta?
        <RouterLink to="/register">
          Zarejestruj się
        </RouterLink>
      </p>
    </div>
  </main>
</template>

<style scoped>
.login-page {
  min-height: 75vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 20px;
}

.login-card {
  width: 100%;
  max-width: 460px;
  padding: 40px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 18px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.eyebrow {
  display: block;
  margin-bottom: 12px;
  color: #A78BFA;
  font-size: 12px;
  font-weight: 800;
  letter-spacing: 2px;
}

.login-header h1 {
  color: #F8FAFC;
  font-size: 30px;
  margin-bottom: 12px;
}

.login-header p {
  color: #94A3B8;
  font-size: 14px;
  line-height: 1.7;
}

.form-group {
  margin-bottom: 22px;
}

.form-group label {
  display: block;
  margin-bottom: 9px;
  color: #CBD5E1;
  font-size: 14px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 14px 16px;
  background: #0B0F19;
  border: 1px solid #293244;
  border-radius: 9px;
  color: #F8FAFC;
  font-size: 14px;
  outline: none;
  box-sizing: border-box;
}

.form-group input:focus {
  border-color: #8B5CF6;
}

.password-field {
  position: relative;
}

.password-field input {
  padding-right: 85px;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #A78BFA;
  cursor: pointer;
  font-size: 12px;
}

.error-message {
  padding: 12px 14px;
  margin-bottom: 20px;
  background: #3B1D29;
  border: 1px solid #7F1D1D;
  border-radius: 9px;
  color: #FCA5A5;
  font-size: 13px;
  line-height: 1.6;
}

.submit-button {
  width: 100%;
  padding: 15px;
  background: #8B5CF6;
  border: none;
  border-radius: 9px;
  color: #FFFFFF;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.submit-button:hover:not(:disabled) {
  background: #7C3AED;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.register-text {
  margin-top: 28px;
  text-align: center;
  color: #94A3B8;
  font-size: 14px;
}

.register-text a {
  color: #A78BFA;
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 480px) {
  .login-card {
    padding: 28px 20px;
  }

  .login-header h1 {
    font-size: 26px;
  }
}
</style>
