
<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  if (loading.value) return

  error.value = ''

  if (!email.value.trim() || !password.value) {
    error.value = 'Uzupełnij wszystkie pola.'
    return
  }

  loading.value = true

  try {
    await authStore.login({
      email: email.value.trim(),
      password: password.value
    })

    if (!authStore.isAuthenticated) {
      error.value = 'Nie udało się zalogować.'
      return
    }

    const redirect = route.query.redirect

    if (
      typeof redirect === 'string' &&
      redirect.startsWith('/') &&
      !redirect.startsWith('//') &&
      !redirect.includes('\\')
    ) {
      await router.push(redirect)
    } else {
      await router.push('/profile')
    }
  } catch (err) {
    error.value =
      err.response?.data?.message ||
      'Nie udało się zalogować. Sprawdź dane lub spróbuj ponownie później.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <main class="login-page">

    <div class="login-layout">

      <!-- PANEL GRAFICZNY -->

      <section class="visual-panel">

        <div class="visual-content">

          <span class="visual-badge">
            TWÓJ ŚWIAT GAMINGU
          </span>

          <h1>
            Każda gra.<br />
            Każda przygoda.<br />
            <span>Jedno miejsce.</span>
          </h1>

          <p>
            Odkrywaj nowe światy, oceniaj gry
            i buduj własną kolekcję.
          </p>

          <div class="visual-footer">
            GAMEVERS
          </div>

        </div>

      </section>

      <!-- PANEL LOGOWANIA -->

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
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
              >
                <rect
                  x="2"
                  y="6"
                  width="20"
                  height="12"
                  rx="4"
                />
                <path d="M7 10v4M5 12h4"/>
                <path d="M16 10h.01M19 13h.01"/>
              </svg>

            </div>

            <div class="auth-heading">
              <h2>Witaj ponownie!</h2>

              <p>
                Zaloguj się i wróć do swojego
                świata gier.
              </p>
            </div>

            <div
              v-if="error"
              class="error-message"
              role="alert"
            >
              {{ error }}
            </div>

            <form
              class="login-form"
              @submit.prevent="handleLogin"
            >

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
                    :type="showPassword ? 'text' : 'password'"
                    placeholder="Wpisz swoje hasło"
                    autocomplete="current-password"
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
                    @click="showPassword = !showPassword"
                  >

                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.7"
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

              <!-- PRZYCISK LOGOWANIA -->

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
                    ? 'Logowanie...'
                    : 'Zaloguj się'
                }}

                <span v-if="!loading">→</span>

              </button>

            </form>

            <div class="auth-divider"></div>

            <p class="register-text">

              Nie masz jeszcze konta?

              <RouterLink to="/register">
                Zarejestruj się
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
.login-page {
  min-height: calc(100dvh - 64px);
  padding: 32px 24px;
  background: #0B0F19;
  color: #F8FAFC;
  text-align: left;
}

.login-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  max-width: 1200px;
  min-height: 650px;
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
      rgba(11, 15, 25, .2)
    ),
    url('https://cdn.akamai.steamstatic.com/steam/apps/1091500/library_hero.jpg');
  background-size: cover;
  background-position: 65% center;
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
  font-size: clamp(30px, 3.2vw, 46px);
  font-weight: 800;
  line-height: 1.2;
  letter-spacing: -1px;
  color: #F8FAFC;
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
  padding: 40px;
}

.form-container {
  width: 100%;
  max-width: 410px;
}

.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 26px;
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
  padding: 30px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 16px;
}

.auth-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-bottom: 22px;
  background: #31234F;
  border: 1px solid #44306B;
  border-radius: 12px;
  color: #C4B5FD;
}

.auth-heading h2 {
  margin: 0 0 10px;
  font-size: 27px;
  font-weight: 800;
  letter-spacing: -0.7px;
}

.auth-heading p {
  margin: 0 0 26px;
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.7;
}

/* FORMULARZ */

.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
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
  min-height: 49px;
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
  padding: 13px 0;
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
  width: 30px;
  height: 40px;
  flex-shrink: 0;
  padding: 0;
  background: transparent;
  border: none;
  color: #94A3B8;
}

.password-toggle:hover {
  color: #C4B5FD;
}

/* PRZYCISK */

.submit-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: 100%;
  min-height: 48px;
  margin-top: 4px;
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

/* KOMUNIKAT BLEDU */

.error-message {
  padding: 12px;
  margin-bottom: 20px;
  background: rgba(239, 68, 68, .1);
  border: 1px solid rgba(239, 68, 68, .3);
  border-radius: 8px;
  color: #FCA5A5;
  font-size: 13px;
  line-height: 1.6;
  overflow-wrap: anywhere;
}

/* DOL FORMULARZA */

.auth-divider {
  height: 1px;
  margin: 24px 0;
  background: #293244;
}

.register-text {
  margin: 0;
  color: #94A3B8;
  text-align: center;
  font-size: 12px;
  line-height: 1.8;
}

.register-text a {
  color: #C4B5FD;
  font-weight: 600;
}

.register-text a:hover {
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
  .login-layout {
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
    padding: 24px 0;
  }

  .form-container {
    max-width: 420px;
  }
}

/* TELEFONY */

@media (max-width: 480px) {
  .login-page {
    min-height: calc(100dvh - 60px);
    padding: 12px 16px 30px;
  }

  .form-panel {
    padding: 18px 0;
  }

  .auth-logo {
    margin-bottom: 22px;
    font-size: 23px;
  }

  .auth-card {
    padding: 24px 20px;
    border-radius: 14px;
  }

  .auth-heading h2 {
    font-size: 25px;
  }

  .auth-heading p {
    font-size: 13px;
  }

  .input-wrapper {
    min-height: 50px;
  }

  .input-wrapper input {
    font-size: 16px;
  }

  .submit-button {
    min-height: 48px;
  }

  .login-form {
    gap: 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
  }
}
</style>
