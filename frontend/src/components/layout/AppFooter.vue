
<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const authStore = useAuthStore()

const currentYear = new Date().getFullYear()

/* NAWIGACJA */

const navigation = [
  {
    label: 'Strona główna',
    path: '/'
  },
  {
    label: 'Katalog gier',
    path: '/games'
  },
  {
    label: 'Gry RPG',
    path: {
      path: '/games',
      query: {
        genre: 'RPG'
      }
    }
  },
  {
    label: 'Gry akcji',
    path: {
      path: '/games',
      query: {
        genre: 'Akcja'
      }
    }
  },
  {
    label: 'Gry niezależne',
    path: {
      path: '/games',
      query: {
        genre: 'Niezależne'
      }
    }
  }
]

/* LINKI KONTA */

const accountLinks = computed(() => {
  if (authStore.isAuthenticated) {
    return [
      {
        label: 'Mój profil',
        path: '/profile'
      },
      {
        label: 'Moja biblioteka',
        path: '/library'
      }
    ]
  }

  return [
    {
      label: 'Zaloguj się',
      path: '/login'
    },
    {
      label: 'Załóż konto',
      path: '/register'
    },
    {
      label: 'Moja biblioteka',
      path: '/library'
    }
  ]
})

/* TECHNOLOGIE */

const technologies = [
  {
    name: 'Vue.js',
    color: '#42B883'
  },
  {
    name: 'Laravel',
    color: '#FF6B6B'
  },
  {
    name: 'Vite',
    color: '#A78BFA'
  },
  {
    name: 'MySQL',
    color: '#38BDF8'
  }
]

/* POWROT NA GORE */

function scrollToTop() {
  const reducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches

  window.scrollTo({
    top: 0,
    behavior: reducedMotion ? 'instant' : 'smooth'
  })
}
</script>

<template>
  <footer class="app-footer">

    <div class="footer-accent"></div>

    <div class="footer-container">

      <!-- GLOWNA CZESC STOPKI -->

      <div class="footer-main">

        <!-- INFORMACJE O PORTALU -->

        <div class="footer-brand">

          <RouterLink
            to="/"
            class="footer-logo"
            aria-label="Gamevers — strona główna"
          >

            <span>GAME</span>
            <span class="logo-accent">VERS</span>
            <span class="logo-dot"></span>

          </RouterLink>

          <p class="brand-description">
            Odkrywaj nowe światy.
            Twórz własną bibliotekę gier.
            Dziel się opiniami i znajdź
            swoją następną ulubioną grę.
          </p>

          <div class="project-label">

            <span class="project-dot"></span>

            Projekt edukacyjny

          </div>

          <!-- GITHUB -->

          <a
            href="https://github.com/michal4kmateusz/Gamevers"
            target="_blank"
            rel="noopener noreferrer"
            class="github-link"
          >

            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .75a11.25 11.25 0 0 0-3.56 21.92c.56.1.77-.24.77-.54v-2.1c-3.13.68-3.79-1.33-3.79-1.33-.51-1.3-1.25-1.64-1.25-1.64-1.02-.7.08-.68.08-.68 1.13.08 1.72 1.16 1.72 1.16 1 .1.74 2.1 3.27 1.15.1-.73.39-1.23.71-1.51-2.5-.29-5.13-1.25-5.13-5.56 0-1.23.44-2.24 1.16-3.03-.12-.29-.5-1.43.11-2.98 0 0 .95-.3 3.09 1.16a10.7 10.7 0 0 1 5.63 0c2.15-1.46 3.09-1.16 3.09-1.16.62 1.55.23 2.69.11 2.98.72.79 1.16 1.8 1.16 3.03 0 4.32-2.64 5.27-5.15 5.55.4.35.76 1.03.76 2.08v2.88c0 .3.2.65.77.54A11.25 11.25 0 0 0 12 .75z"/>
            </svg>

            <span>GitHub projektu</span>

            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M13 5h6v6M19 5l-9 9"/>
              <path d="M19 13v6H5V5h6"/>
            </svg>

          </a>

        </div>

        <!-- NAWIGACJA -->

        <nav
          class="footer-column"
          aria-label="Nawigacja w stopce"
        >

          <h3>Odkrywaj</h3>

          <ul class="footer-links">

            <li
              v-for="item in navigation"
              :key="item.label"
            >

              <RouterLink :to="item.path">
                {{ item.label }}
              </RouterLink>

            </li>

          </ul>

        </nav>

        <!-- KONTO -->

        <nav
          class="footer-column"
          aria-label="Konto użytkownika"
        >

          <h3>Twoje konto</h3>

          <ul class="footer-links">

            <li
              v-for="item in accountLinks"
              :key="item.label"
            >

              <RouterLink :to="item.path">
                {{ item.label }}
              </RouterLink>

            </li>

            <li v-if="authStore.isAdmin">

              <RouterLink to="/admin">
                Panel administratora
              </RouterLink>

            </li>

          </ul>

        </nav>

        <!-- TECHNOLOGIE -->

        <div class="footer-column">

          <h3>Technologie projektu</h3>

          <div class="technology-list">

            <div
              v-for="technology in technologies"
              :key="technology.name"
              class="technology-item"
            >

              <span
                class="technology-dot"
                :style="{
                  backgroundColor: technology.color
                }"
              ></span>

              {{ technology.name }}

            </div>

          </div>

          <p class="technology-description">
            Nowoczesny portal gamingowy
            rozwijany w oparciu o Vue.js
            i Laravel.
          </p>

        </div>

      </div>

      <!-- DOLNA CZESC STOPKI -->

      <div class="footer-bottom">

        <div class="copyright">

          <span>
            © {{ currentYear }} Gamevers.
          </span>

          <span class="copyright-description">
            Projekt edukacyjny.
          </span>

        </div>

        <div class="footer-bottom-right">

          <div class="version-label">

            <span class="version-dot"></span>

            Wersja demonstracyjna

          </div>

          <button
            type="button"
            class="scroll-top-button"
            aria-label="Wróć na górę strony"
            title="Wróć na górę"
            @click="scrollToTop"
          >

            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
            >
              <path d="M12 19V5m-6 6 6-6 6 6"/>
            </svg>

          </button>

        </div>

      </div>

      <p class="footer-disclaimer">
        Gamevers jest projektem edukacyjnym.
        Nazwy, grafiki i znaki towarowe gier
        należą do ich odpowiednich właścicieli.
      </p>

    </div>

  </footer>
</template>

<style scoped>

/* GLOWNA STOPKA */

.app-footer {
  position: relative;
  width: 100%;
  background: #101522;
  border-top: 1px solid #293244;
  color: #F8FAFC;
  text-align: left;
}

.footer-accent {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(
    90deg,
    transparent,
    #8B5CF6,
    #22D3EE,
    transparent
  );
  opacity: .7;
}

.footer-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 45px 24px 20px;
}

/* UKLAD KOLUMN */

.footer-main {
  display: grid;
  grid-template-columns:
    minmax(0, 1.6fr)
    repeat(3, minmax(0, 1fr));
  gap: 40px;
  padding-bottom: 38px;
}

/* LOGO */

.footer-brand {
  min-width: 0;
}

.footer-logo {
  display: inline-flex;
  align-items: center;
  gap: 0;
  color: #F8FAFC;
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -1px;
  line-height: 1;
  text-decoration: none;
}

.logo-accent {
  color: #8B5CF6;
}

.logo-dot {
  width: 7px;
  height: 7px;
  margin-top: 13px;
  margin-left: 5px;
  background: #22D3EE;
  border-radius: 50%;
  box-shadow: 0 0 12px rgba(34, 211, 238, .4);
}

/* OPIS PORTALU */

.brand-description {
  max-width: 310px;
  margin: 20px 0;
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.9;
}

.project-label {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 10px;
  background: rgba(139, 92, 246, .1);
  border: 1px solid rgba(139, 92, 246, .25);
  border-radius: 6px;
  color: #C4B5FD;
  font-size: 10px;
  font-weight: 600;
}

.project-dot {
  width: 6px;
  height: 6px;
  background: #A78BFA;
  border-radius: 50%;
}

/* GITHUB */

.github-link {
  display: flex;
  align-items: center;
  gap: 9px;
  width: fit-content;
  margin-top: 22px;
  padding: 10px 12px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 8px;
  color: #CBD5E1;
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  transition:
    background .2s,
    border-color .2s,
    color .2s;
}

.github-link:hover {
  background: #201B36;
  border-color: #8B5CF6;
  color: #F8FAFC;
}

/* KOLUMNY */

.footer-column {
  min-width: 0;
}

.footer-column h3 {
  margin: 0 0 20px;
  color: #F8FAFC;
  font-size: 14px;
  font-weight: 700;
}

/* LINKI */

.footer-links {
  display: flex;
  flex-direction: column;
  gap: 13px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.footer-links a {
  display: inline-block;
  color: #94A3B8;
  font-size: 13px;
  line-height: 1.5;
  text-decoration: none;
  transition: color .2s;
}

.footer-links a:hover {
  color: #C4B5FD;
}

/* TECHNOLOGIE */

.technology-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.technology-item {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 7px 9px;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 6px;
  color: #CBD5E1;
  font-size: 11px;
  font-weight: 500;
}

.technology-dot {
  flex-shrink: 0;
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.technology-description {
  max-width: 240px;
  margin: 16px 0 0;
  color: #94A3B8;
  font-size: 12px;
  line-height: 1.8;
}

/* DOLNA CZESC */

.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px 0;
  border-top: 1px solid #293244;
}

.copyright {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  color: #94A3B8;
  font-size: 12px;
}

.copyright-description {
  color: #64748B;
}

.footer-bottom-right {
  display: flex;
  align-items: center;
  gap: 18px;
}

/* WERSJA PROJEKTU */

.version-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #94A3B8;
  font-size: 11px;
  white-space: nowrap;
}

.version-dot {
  width: 7px;
  height: 7px;
  background: #22D3EE;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(34, 211, 238, .3);
}

/* POWROT NA GORE */

.scroll-top-button {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 39px;
  height: 39px;
  padding: 0;
  background: #151B2B;
  border: 1px solid #293244;
  border-radius: 8px;
  color: #C4B5FD;
  cursor: pointer;
  transition:
    background .2s,
    border-color .2s,
    color .2s;
}

.scroll-top-button:hover {
  background: #8B5CF6;
  border-color: #8B5CF6;
  color: #FFFFFF;
}

/* INFORMACJA PRAWNA */

.footer-disclaimer {
  margin: 0;
  color: #94A3B8;
  font-size: 10px;
  line-height: 1.7;
}

/* DOSTEPNOSC */

a:focus-visible,
button:focus-visible {
  outline: 2px solid #C4B5FD;
  outline-offset: 4px;
}

/* TABLETY */

@media (max-width: 1000px) {

  .footer-main {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 35px;
  }

  .footer-container {
    padding-top: 35px;
  }

}

/* TELEFONY */

@media (max-width: 600px) {

  .footer-container {
    padding: 30px 18px 18px;
  }

  .footer-main {
    grid-template-columns:
      repeat(2, minmax(0, 1fr));
    gap: 28px 20px;
    padding-bottom: 28px;
  }

  .footer-brand {
    grid-column: 1 / -1;
    padding-bottom: 24px;
    border-bottom: 1px solid #293244;
  }

  .footer-logo {
    font-size: 24px;
  }

  .brand-description {
    max-width: 100%;
    margin: 16px 0;
    font-size: 12px;
  }

  .github-link {
    margin-top: 16px;
  }

  .footer-column h3 {
    margin-bottom: 15px;
    font-size: 13px;
  }

  .footer-links {
    gap: 12px;
  }

  .footer-links a {
    font-size: 12px;
  }

  .footer-column:last-child {
    grid-column: 1 / -1;
    padding-top: 22px;
    border-top: 1px solid #293244;
  }

  .technology-description {
    max-width: 100%;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 18px 0;
  }

  .footer-bottom-right {
    justify-content: space-between;
    width: 100%;
  }

  .copyright {
    font-size: 11px;
  }

  .scroll-top-button {
    width: 38px;
    height: 38px;
  }

  .footer-disclaimer {
    font-size: 10px;
  }

}

/* MALE TELEFONY */

@media (max-width: 360px) {

  .footer-container {
    padding-right: 14px;
    padding-left: 14px;
  }

  .footer-main {
    column-gap: 12px;
  }

  .footer-links a {
    font-size: 11px;
  }

}

/* OGRANICZENIE ANIMACJI */

@media (prefers-reduced-motion: reduce) {

  .github-link,
  .footer-links a,
  .scroll-top-button {
    transition: none;
  }

}

</style>
