
<script setup>
import { ref } from 'vue'
import { RouterLink } from 'vue-router'

const username = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')
const showPassword = ref(false)
const error = ref('')
const message = ref('')

function handleRegister() {
  error.value = ''
  message.value = ''

  if (
    !username.value.trim() ||
    !email.value.trim() ||
    !password.value ||
    !passwordConfirmation.value
  ) {
    error.value = 'Wypełnij wszystkie pola.'
    return
  }

  if (username.value.trim().length < 3) {
    error.value = 'Nazwa użytkownika musi mieć minimum 3 znaki.'
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = 'Podaj poprawny adres e-mail.'
    return
  }

  if (password.value.length < 8) {
    error.value = 'Hasło musi mieć minimum 8 znaków.'
    return
  }

  if (password.value !== passwordConfirmation.value) {
    error.value = 'Podane hasła nie są identyczne.'
    return
  }

  message.value =
    'Formularz jest gotowy. Rejestrację uruchomimy po podłączeniu API Laravel.'
}
</script>

<template>
  <div class="register-page">
    <div class="register-card">
      <header class="register-header">
        <h1>Dołącz do Gamevers</h1>
        <p>Utwórz konto i zacznij budować swoją bibliotekę gier.</p>
      </header>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">Nazwa użytkownika</label>
          <input
            id="username"
            v-model="username"
            type="text"
            placeholder="Twoja nazwa"
            autocomplete="username"
            minlength="3"
            maxlength="50"
            required
          />
        </div>

        <div class="form-group">
          <label for="register-email">Adres e-mail</label>
          <input
            id="register-email"
            v-model="email"
            type="email"
            placeholder="twoj@email.pl"
            autocomplete="email"
            required
          />
        </div>

        <div class="form-group">
          <label for="register-password">Hasło</label>
          <div class="password-field">
            <input
              id="register-password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Minimum 8 znaków"
              autocomplete="new-password"
              minlength="8"
              required
            />
            <button
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Ukryj' : 'Pokaż' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="confirm-password">Potwierdź hasło</label>
          <input
            id="confirm-password"
            v-model="passwordConfirmation"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Powtórz hasło"
            autocomplete="new-password"
            required
          />
        </div>

        <p v-if="error" class="error" role="alert">
          {{ error }}
        </p>

        <p v-if="message" class="message" role="status">
          {{ message }}
        </p>

        <button type="submit" class="submit-button">
          Utwórz konto
        </button>
      </form>

      <p class="login-link">
        Masz już konto?
        <RouterLink to="/login">Zaloguj się</RouterLink>
      </p>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 75vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 16px;
}

.register-card {
  width: 100%;
  max-width: 460px;
  padding: 36px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 18px;
}

.register-header {
  text-align: center;
  margin-bottom: 32px;
}

.register-header h1 {
  font-size: 30px;
  margin-bottom: 12px;
}

.register-header p {
  color: #94A3B8;
  font-size: 14px;
  line-height: 1.6;
}

.form-group {
  margin-bottom: 20px;
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
  border: none;
  border-radius: 10px;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.submit-button:hover {
  background: #7C3AED;
}

.login-link {
  margin-top: 28px;
  text-align: center;
  color: #94A3B8;
  font-size: 14px;
}

.login-link a {
  color: #A78BFA;
  font-weight: 600;
}

@media (max-width: 480px) {
  .register-card {
    padding: 24px;
  }
}
</style>
