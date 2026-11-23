
<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')

const showPassword = ref(false)
const validationError = ref('')
const serverError = ref('')

async function handleRegister() {
  validationError.value = ''
  serverError.value = ''

  if (
    !name.value.trim() ||
    !email.value.trim() ||
    !password.value ||
    !passwordConfirmation.value
  ) {
    validationError.value = 'Wypełnij wszystkie pola.'
    return
  }

  if (name.value.trim().length < 3) {
    validationError.value =
      'Nazwa użytkownika musi mieć minimum 3 znaki.'
    return
  }

  if (name.value.trim().length > 50) {
    validationError.value =
      'Nazwa użytkownika może mieć maksymalnie 50 znaków.'
    return
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailPattern.test(email.value.trim())) {
    validationError.value = 'Podaj poprawny adres e-mail.'
    return
  }

  if (password.value.length < 8) {
    validationError.value =
      'Hasło musi mieć minimum 8 znaków.'
    return
  }

  if (password.value !== passwordConfirmation.value) {
    validationError.value =
      'Podane hasła nie są identyczne.'
    return
  }

  try {
    await authStore.register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      password_confirmation: passwordConfirmation.value
    })

    await router.push('/profile')
  } catch (error) {
    if (error.response?.status === 422) {
      const errors = error.response.data?.errors

      if (errors?.email?.length) {
        serverError.value =
          'Ten adres e-mail może być już zajęty lub jest nieprawidłowy.'
      } else {
        serverError.value =
          'Nie udało się utworzyć konta. Sprawdź dane formularza.'
      }
    } else {
      serverError.value =
        'Nie udało się połączyć z serwerem. Spróbuj ponownie później.'
    }
  }
}
</script>

<template>
  <main class="register-page">
    <div class="register-card">
      <div class="register-header">
        <span class="eyebrow">DOŁĄCZ DO GAMEVERS</span>

        <h1>Utwórz konto</h1>

        <p>
          Załóż konto, aby tworzyć własną bibliotekę
          gier i publikować recenzje.
        </p>
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="register-name">
            Nazwa użytkownika
          </label>

          <input
            id="register-name"
            v-model="name"
            type="text"
            placeholder="Np. GameMaster"
            autocomplete="username"
            minlength="3"
            maxlength="50"
            required
          />
        </div>

        <div class="form-group">
          <label for="register-email">
            Adres e-mail
          </label>

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
          <label for="register-password">
            Hasło
          </label>

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
              class="password-toggle"
              :aria-label="showPassword ? 'Ukryj hasła' : 'Pokaż hasła'"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? 'Ukryj' : 'Pokaż' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="register-confirm-password">
            Potwierdź hasło
          </label>

          <input
            id="register-confirm-password"
            v-model="passwordConfirmation"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Powtórz hasło"
            autocomplete="new-password"
            required
          />
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
          {{
            authStore.loading
              ? 'Tworzenie konta...'
              : 'Utwórz konto'
          }}
        </button>
      </form>

      <p class="login-text">
        Masz już konto?
        <RouterLink to="/login">
          Zaloguj się
        </RouterLink>
      </p>
    </div>
  </main>
</template>

<style scoped>
.register-page {
  min-height: 75vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 20px;
}

.register-card {
  width: 100%;
  max-width: 480px;
  padding: 40px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 18px;
}

.register-header {
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

.register-header h1 {
  color: #F8FAFC;
  font-size: 30px;
  margin-bottom: 12px;
}

.register-header p {
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

.login-text {
  margin-top: 28px;
  text-align: center;
  color: #94A3B8;
  font-size: 14px;
}

.login-text a {
  color: #A78BFA;
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 480px) {
  .register-card {
    padding: 28px 20px;
  }

  .register-header h1 {
    font-size: 26px;
  }
}
</style>
