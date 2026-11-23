
<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref('')
const message = ref('')

function handleLogin() {
  error.value = ''
  message.value = ''

  if (!email.value.trim() || !password.value) {
    error.value = 'Wypełnij wszystkie pola.'
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = 'Podaj poprawny adres e-mail.'
    return
  }

  message.value =
    'Formularz jest gotowy. Logowanie uruchomimy po podłączeniu API Laravel.'
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1>Witaj ponownie</h1>
        <p>Zaloguj się do swojego konta Gamevers.</p>
      </div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">Adres e-mail</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="twoj@email.pl"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Hasło</label>

          <div class="password-field">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Wpisz hasło"
              autocomplete="current-password"
              required
            />

            <button
              type="button"
              class="toggle-password"
              :aria-label="showPassword ? 'Ukryj hasło' : 'Pokaż hasło'"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Ukryj' : 'Pokaż' }}
            </button>
          </div>
        </div>

        <p v-if="error" class="error" role="alert">
          {{ error }}
        </p>

        <p v-if="message" class="message" role="status">
          {{ message }}
        </p>

        <button type="submit" class="submit-button">
          Zaloguj się
        </button>
      </form>

      <p class="register-link">
        Nie masz jeszcze konta?
        <RouterLink to="/register">
          Zarejestruj się
        </RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 75vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 16px;
}

.login-card {
  width: 100%;
  max-width: 440px;
  padding: 36px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 18px;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-header h1 {
  font-size: 30px;
  margin-bottom: 12px;
}

.login-header p {
  color: #94A3B8;
  font-size: 14px;
}

.form-group {
  margin-bottom: 22px;
}

.form-group label {
  display: block;
  margin-bottom: 10px;
  font-size: 14px;
  font-weight: 600;
}

.form-group input {
  width: 100%;
  padding: 14px;
  background: #0B0F19;
  border: 1px solid #293244;
  border-radius: 10px;
  color: #F8FAFC;
  font-size: 14px;
  outline: none;
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

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: #A78BFA;
  cursor: pointer;
}

.error {
  color: #F87171;
  margin-bottom: 16px;
  font-size: 14px;
}

.message {
  color: #22D3EE;
  margin-bottom: 16px;
  font-size: 14px;
}

.submit-button {
  width: 100%;
  padding: 15px;
  background: #8B5CF6;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.submit-button:hover {
  background: #7C3AED;
}

.register-link {
  text-align: center;
  margin-top: 28px;
  color: #94A3B8;
  font-size: 14px;
}

.register-link a {
  color: #A78BFA;
  font-weight: 600;
}

@media (max-width: 480px) {
  .login-card {
    padding: 24px;
  }
}
</style>
