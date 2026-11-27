
<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirmation = ref('')

const showPassword = ref(false)
const showConfirmation = ref(false)

const loading = ref(false)
const error = ref('')
const success = ref('')

const passwordRequirements = computed(() => [
  {
    label: 'Minimum 8 znaków',
    valid: password.value.length >= 8
  },
  {
    label: 'Hasła są identyczne',
    valid:
      password.value.length > 0 &&
      password.value === passwordConfirmation.value
  }
])

async function handleRegister() {
  if (loading.value) return

  error.value = ''
  success.value = ''

  if (
    !name.value.trim() ||
    !email.value.trim() ||
    !password.value ||
    !passwordConfirmation.value
  ) {
    error.value = 'Uzupełnij wszystkie pola.'
    return
  }

  if (name.value.trim().length < 3) {
    error.value =
      'Nazwa użytkownika musi mieć minimum 3 znaki.'
    return
  }

  if (password.value.length < 8) {
    error.value =
      'Hasło musi mieć minimum 8 znaków.'
    return
  }

  if (
    password.value !== passwordConfirmation.value
  ) {
    error.value = 'Podane hasła nie są identyczne.'
    return
  }

  loading.value = true

  try {
    await authStore.register({
      name: name.value.trim(),
      email: email.value.trim(),
      password: password.value,
      password_confirmation:
        passwordConfirmation.value
    })

    if (authStore.isAuthenticated) {
      await router.push('/profile')
    } else {
      success.value =
        'Konto zostało utworzone. Możesz się zalogować.'
    }

  } catch (err) {
    const validationErrors =
      err.response?.data?.errors

    if (validationErrors) {
      error.value = Object.values(validationErrors)
        .flat()
        .join(' ')
    } else {
      error.value =
        err.response?.data?.message ||
        'Nie udało się utworzyć konta. Spróbuj ponownie później.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="register-page">

    <div class="register-layout">

      <!-- PANEL GRAFICZNY -->

      <section class="visual-panel">

        <div class="visual-content">

          <span class="visual-badge">
            ROZPOCZNIJ PRZYGODĘ
          </span>

          <h1>
            Nowe światy.<br />
            Nowe historie.<br />
            <span>Twoja kolekcja.</span>
          </h1>

          <p>
            Dołącz do społeczności Gamevers
            i odkrywaj gry w zupełnie nowy sposób.
          </p>

          <div class="benefits">

            <div class="benefit">
              <span>✓</span>
              Odkrywaj nowe gry
            </div>

            <div class="benefit">
              <span>✓</span>
              Twórz własną bibliotekę
            </div>

            <div class="benefit">
              <span>✓</span>
              Oceniaj i recenzuj gry
            </div>

          </div>

          <div class="visual-footer">
            GAMEVERS
          </div>

        </div>

      </section>

      <!-- PANEL REJESTRACJI -->

      <section class="form-panel">

        <div class="form-container">

          <RouterLink
            to="/"
            class="auth-logo"
          >
            GAME<span>VERS</span>
            <i></i>
          </RouterLink>

          <div class="auth-card">

            <div class="auth-icon">

              <svg
                width="25"
                height="25"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <circle cx="9" cy="7" r="4"/>
                <path d="M2 21v-2a7 7 0 0 1 14 0v2"/>
                <path d="M19 8v6M16 11h6"/>
              </svg>

            </div>

            <div class="auth-heading">

              <h2>Dołącz do Gamevers</h2>

              <p>
                Rozpocznij swoją przygodę
                ze światem gier.
              </p>

            </div>

            <!-- KOMUNIKATY -->

            <div
              v-if="error"
              class="error-message"
              role="alert"
            >
              {{ error }}
            </div>

            <div
              v-if="success"
              class="success-message"
              role="status"
            >
              {{ success }}

              <RouterLink to="/login">
                Przejdź do logowania →
              </RouterLink>
            </div>

            <!-- FORMULARZ -->

            <form
              v-if="!success"
              class="register-form"
              @submit.prevent="handleRegister"
            >

              <!-- NAZWA UZYTKOWNIKA -->

              <div class="form-group">

                <label for="name">
                  Nazwa użytkownika
                </label>

                <div class="input-wrapper">

                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="8" r="4"/>
                    <path d="M4 21v-2a8 8 0 0 1 16 0v2"/>
                  </svg>

                  <input
                    id="name"
                    v-model="name"
                    type="text"
                    placeholder="Twój nick"
                    autocomplete="username"
                    minlength="3"
                    maxlength="50"
                    required
                    :disabled="loading"
                  />

                </div>

              </div>

              <!-- EMAIL -->

              <div class="form-group">

                <label for="email">
                  Adres e-mail
                </label>

                <div class="input-wrapper">

                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                    aria-hidden="true"
                  >
                    <rect
                      x="3"
                      y="5"
                      width="18"
                      height="14"
                      rx="2"
                    />
                    <path d="m3 7 9 6 9-6"/>
                  </svg>

                  <input
                    id="email"
                    v-model="email"
                    type="email"
                    placeholder="twoj@email.pl"
                    autocomplete="email"
                    maxlength="255"
                    required
                    :disabled="loading"
                  />

                </div>

              </div>

              <!-- HASLO -->

              <div class="form-group">

                <label for="password">
                  Hasło
                </label>

                <div class="input-wrapper">

                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                    aria-hidden="true"
                  >
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="11"
                      rx="2"
                    />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
                  </svg>

                  <input
                    id="password"
                    v-model="password"
                    :type="
                      showPassword
                        ? 'text'
                        : 'password'
                    "
                    placeholder="Minimum 8 znaków"
                    autocomplete="new-password"
                    minlength="8"
                    required
                    :disabled="loading"
                  />

                  <button
                    type="button"
                    class="password-toggle"
                    :aria-label="
                      showPassword
                        ? 'Ukryj hasło'
                        : 'Pokaż hasło'
                    "
                    @click="
                      showPassword = !showPassword
                    "
                  >

                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.7"
                      aria-hidden="true"
                    >
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/>
                      <circle cx="12" cy="12" r="3"/>

                      <path
                        v-if="showPassword"
                        d="M3 3l18 18"
                      />
                    </svg>

                  </button>

                </div>

              </div>

              <!-- POWTORZENIE HASLA -->

              <div class="form-group">

                <label for="confirmation">
                  Powtórz hasło
                </label>

                <div class="input-wrapper">

                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.7"
                    aria-hidden="true"
                  >
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="11"
                      rx="2"
                    />
                    <path d="M8 10V7a4 4 0 0 1 8 0v3"/>
                  </svg>

                  <input
                    id="confirmation"
                    v-model="passwordConfirmation"
                    :type="
                      showConfirmation
                        ? 'text'
                        : 'password'
                    "
                    placeholder="Wpisz ponownie hasło"
                    autocomplete="new-password"
                    required
                    :disabled="loading"
                  />

                  <button
                    type="button"
                    class="password-toggle"
                    :aria-label="
                      showConfirmation
                        ? 'Ukryj powtórzone hasło'
                        : 'Pokaż powtórzone hasło'
                    "
                    @click="
                      showConfirmation =
                        !showConfirmation
                    "
                  >

                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.7"
                      aria-hidden="true"
                    >
                      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z"/>
                      <circle cx="12" cy="12" r="3"/>

                      <path
                        v-if="showConfirmation"
                        d="M3 3l18 18"
                      />
                    </svg>

                  </button>

                </div>

              </div>

              <!-- WYMAGANIA HASLA -->

              <div
                class="password-requirements"
                aria-live="polite"
              >

                <div
                  v-for="requirement in passwordRequirements"
                  :key="requirement.label"
                  class="requirement"
                  :class="{
                    valid: requirement.valid
                  }"
                >

                  <span class="requirement-icon">
                    {{ requirement.valid ? '✓' : '○' }}
                  </span>

                  {{ requirement.label }}

                </div>

              </div>

              <!-- PRZYCISK REJESTRACJI -->

              <button
                type="submit"
                class="submit-button"
                :disabled="loading"
              >

                <span
                  v-if="loading"
                  class="spinner"
                  aria-hidden="true"
                ></span>

                {{
                  loading
                    ? 'Tworzenie konta...'
                    : 'Utwórz konto'
                }}

                <span v-if="!loading">→</span>

              </button>

            </form>

            <div class="auth-divider"></div>

            <p class="login-text">

              Masz już konto?

              <RouterLink to="/login">
                Zaloguj się
              </RouterLink>

            </p>

          </div>

          <RouterLink
            to="/"
            class="back-link"
          >
            ← Wróć na stronę główną
          </RouterLink>

          <p class="copyright">
            © {{ new Date().getFullYear() }} Gamevers
          </p>

        </div>

      </section>

    </div>

  </main>
</template>

<style scoped>
.register-page {
  min-height: calc(100dvh - 64px);
  padding: 32px 24px;
  background: #0B0F19;
  color: #F8FAFC;
  text-align: left;
}

.register-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1200px;
  min-height: 780px;
  margin: 0 auto;
  overflow: hidden;
  background: #111827;
  border: 1px solid #293244;
  border-radius: 20px;
}

/* PANEL GRAFICZNY */

.visual-panel {
  position: relative;
  display: flex;
  align-items: flex-end;
  min-width: 0;
  padding: 45px;
  background:
    linear-gradient(
      0deg,
      rgba(11, 15, 25, .98),
      rgba(11, 15, 25, .15)
    ),
    url('https://cdn.akamai.steamstatic.com/steam/apps/1245620/library_hero.jpg');
  background-size: cover;
  background-position: 60% center;
}

.visual-content {
  position: relative;
  z-index: 1;
}

.visual-badge {
  display: inline-block;
  padding: 7px 12px;
  margin-bottom: 24px;
  background: rgba(139, 92, 246, .2);
  border: 1px solid rgba(139, 92, 246, .4);
  border-radius: 5px;
  color: #C4B5FD;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 2px;
}

.visual-content h1 {
  margin: 0 0 20px;
  color: #F8FAFC;
  font-size: clamp(30px, 3.2vw, 46px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -1px;
}

.visual-content h1 span {
  color: #A78BFA;
}

.visual-content p {
  max-width: 350px;
  color: #CBD5E1;
  font-size: 14px;
  line-height: 1.8;
}

.benefits {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-top: 30px;
}

.benefit {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #E2E8F0;
  font-size: 13px;
}

.benefit span {
  display: grid;
  place-items: center;
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: rgba(139, 92, 246, .2);
  color: #C4B5FD;
  font-weight: 700;
}

.visual-footer {
  margin-top: 35px;
  color: #94A3B8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 4px;
}

/* PANEL FORMULARZA */

.form-panel {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 35px;
}

.form-container {
  width: 100%;
  max-width: 430px;
}

.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  color: #F8FAFC;
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -1px;
}

.auth-logo span {
  color: #8B5CF6;
}

.auth-logo i {
  width: 5px;
  height: 5px;
  margin: 0 0 13px 6px;
  border-radius: 50%;
  background: #22D3EE;
}

.auth-card {
  padding: 28px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 16px;
}

.auth-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 20px;
  background: #31234F;
  border: 1px solid #44306B;
  border-radius: 12px;
  color: #C4B5FD;
}

.auth-heading h2 {
  margin: 0 0 10px;
  font-size: 26px;
  font-weight: 800;
  letter-spacing: -0.7px;
}

.auth-heading p {
  margin: 0 0 24px;
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.7;
}

/* FORMULARZ */

.register-form {
  display: flex;
  flex-direction: column;
  gap: 17px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.form-group label {
  color: #E2E8F0;
  font-size: 13px;
  font-weight: 600;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 11px;
  min-height: 48px;
  padding: 0 13px;
  background: #0B0F19;
  border: 1px solid #293244;
  border-radius: 8px;
  color: #94A3B8;
  transition: border-color .2s;
}

.input-wrapper:focus-within {
  border-color: #8B5CF6;
  box-shadow: 0 0 0 3px rgba(139, 92, 246, .1);
}

.input-wrapper input {
  flex: 1;
  width: 100%;
  min-width: 0;
  padding: 12px 0;
  background: transparent;
  border: none;
  outline: none;
  color: #F8FAFC;
  font-size: 14px;
}

.input-wrapper input::placeholder {
  color: #64748B;
}

.password-toggle {
  display: grid;
  place-items: center;
  width: 34px;
  height: 42px;
  flex-shrink: 0;
  padding: 0;
  background: transparent;
  border: none;
  color: #94A3B8;
}

.password-toggle:hover {
  color: #C4B5FD;
}

/* WYMAGANIA HASLA */

.password-requirements {
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding: 11px 13px;
  background: #111827;
  border: 1px solid #293244;
  border-radius: 8px;
}

.requirement {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94A3B8;
  font-size: 11px;
}

.requirement-icon {
  width: 15px;
  font-size: 15px;
  text-align: center;
}

.requirement.valid {
  color: #6EE7B7;
}

/* PRZYCISK */

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  min-height: 48px;
  padding: 12px;
  background: #8B5CF6;
  border: 1px solid #8B5CF6;
  border-radius: 8px;
  box-shadow: 0 4px 18px rgba(139, 92, 246, .2);
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 700;
  transition: background .2s;
}

.submit-button:hover:not(:disabled) {
  background: #7C3AED;
}

.submit-button:disabled {
  opacity: .7;
  cursor: not-allowed;
}

.spinner {
  width: 17px;
  height: 17px;
  border: 2px solid rgba(255, 255, 255, .3);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* KOMUNIKATY */

.error-message,
.success-message {
  padding: 12px;
  margin-bottom: 18px;
  border: 1px solid;
  border-radius: 8px;
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

.error-message {
  background: rgba(239, 68, 68, .1);
  border-color: rgba(239, 68, 68, .3);
  color: #FCA5A5;
}

.success-message {
  background: rgba(34, 197, 94, .1);
  border-color: rgba(34, 197, 94, .3);
  color: #6EE7B7;
}

.success-message a {
  display: block;
  margin-top: 10px;
  font-weight: 700;
}

/* DOL FORMULARZA */

.auth-divider {
  height: 1px;
  margin: 22px 0;
  background: #293244;
}

.login-text {
  margin: 0;
  color: #94A3B8;
  text-align: center;
  font-size: 12px;
  line-height: 1.8;
}

.login-text a {
  color: #C4B5FD;
  font-weight: 600;
}

.login-text a:hover {
  text-decoration: underline;
}

.back-link {
  display: block;
  margin-top: 24px;
  color: #94A3B8;
  text-align: center;
  font-size: 12px;
}

.back-link:hover {
  color: #C4B5FD;
}

.copyright {
  margin: 24px 0 0;
  color: #64748B;
  text-align: center;
  font-size: 11px;
}

/* TABLETY */

@media (max-width: 900px) {
  .register-layout {
    grid-template-columns: 1fr;
    max-width: 480px;
    min-height: auto;
    background: transparent;
    border: none;
    border-radius: 0;
  }

  .visual-panel {
    display: none;
  }

  .form-panel {
    padding: 20px 0;
  }

  .form-container {
    max-width: 430px;
  }
}

/* TELEFONY */

@media (max-width: 480px) {
  .register-page {
    min-height: calc(100dvh - 60px);
    padding: 12px 16px 28px;
  }

  .form-panel {
    padding: 12px 0;
  }

  .auth-logo {
    margin-bottom: 18px;
    font-size: 23px;
  }

  .auth-card {
    padding: 22px 18px;
    border-radius: 14px;
  }

  .auth-heading h2 {
    font-size: 24px;
  }

  .auth-heading p {
    margin-bottom: 20px;
  }

  .register-form {
    gap: 15px;
  }

  .input-wrapper {
    min-height: 48px;
  }

  .input-wrapper input {
    font-size: 16px;
  }

  .auth-icon {
    width: 42px;
    height: 42px;
    margin-bottom: 16px;
  }

  .auth-divider {
    margin: 20px 0;
  }

  .submit-button {
    min-height: 48px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}
</style>
