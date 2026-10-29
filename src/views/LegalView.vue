<script setup lang="ts">
import { nextTick, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useCookieConsent } from '@/composables/useCookieConsent'

defineOptions({ name: 'LegalView' })

const { openBanner } = useCookieConsent()
const route = useRoute()

// Content scrolls inside .page, not the window: the router's scrollBehavior can't reach the anchors
function scrollToHash() {
  if (route.hash) document.querySelector(route.hash)?.scrollIntoView()
}
onMounted(() => nextTick(scrollToHash))
watch(() => route.hash, scrollToHash)
</script>

<template>
  <div class="legal">
    <section id="mentions" class="pcard">
      <div class="pcard-h"><span class="label">MENTIONS LÉGALES</span></div>
      <div class="pcard-pad">
        <p>
          SteamFolio est un projet personnel, gratuit et non commercial, édité par un particulier, Mathis Aguado.
          Il ne vend rien et n'affiche aucune publicité.
        </p>
        <dl>
          <dt>Éditeur</dt>
          <dd>Mathis Aguado, particulier.</dd>
          <dt>Contact</dt>
          <dd>TODO : adresse e-mail de contact à renseigner.</dd>
          <dt>Hébergeur</dt>
          <dd>
            Vercel Inc. — TODO : adresse postale et téléphone de l'hébergeur à reporter depuis
            <a href="https://vercel.com/legal" target="_blank" rel="noopener noreferrer">vercel.com/legal</a>.
          </dd>
          <dt>Crédits</dt>
          <dd>
            Données fournies par l'API Steam Web et le Steam Store. Steam et les jeux affichés sont des marques de
            Valve Corporation et de leurs éditeurs respectifs ; SteamFolio n'est ni affilié ni approuvé par Valve.
            Code source sous licence <a href="https://github.com/Mvth1s/SteamFolio/blob/main/LICENSE" target="_blank" rel="noopener noreferrer">MIT</a>.
          </dd>
        </dl>
      </div>
    </section>

    <section id="confidentialite" class="pcard">
      <div class="pcard-h"><span class="label">POLITIQUE DE CONFIDENTIALITÉ</span></div>
      <div class="pcard-pad">
        <dl>
          <dt>Données Steam affichées</dt>
          <dd>
            Le site affiche uniquement le profil Steam public de l'éditeur : profil, niveau, bibliothèque et temps de
            jeu, succès, liste de souhaits, ainsi que la liste de ses amis Steam (pseudonyme, avatar, statut en ligne)
            telle que Steam la rend publique. Ces données sont lues en direct auprès de Steam par une fonction serveur,
            à chaque visite ; elles ne sont stockées dans aucune base de données.
          </dd>
          <dt>Données des visiteurs</dt>
          <dd>
            Le site n'a ni compte, ni connexion Steam, ni formulaire : aucun identifiant Steam de visiteur n'est
            demandé, lu ou conservé, ni dans le navigateur ni côté serveur.
          </dd>
          <dt>Google Analytics</dt>
          <dd>
            Avec votre accord uniquement, Google Analytics mesure l'audience (pages vues, provenance, type d'appareil)
            et dépose les cookies <code>_ga</code>, sans finalité publicitaire. Tant que vous n'avez pas accepté, le
            script n'est pas chargé. Base légale : votre consentement, redemandé au bout de 6 mois. Données traitées
            par Google, qui peut les transférer hors de l'Union européenne. Durée de conservation : TODO : durée
            configurée dans Google Analytics à renseigner.
          </dd>
          <dt>Autres services tiers</dt>
          <dd>
            Votre navigateur charge les polices depuis Google Fonts et les images (avatars, jaquettes) depuis les
            serveurs de Steam : ces services reçoivent votre adresse IP. L'hébergeur Vercel enregistre des données
            techniques de connexion pour la sécurité du service.
          </dd>
          <dt>Stockage local</dt>
          <dd>
            Votre choix de thème (<code>sf-theme</code>), de langue (<code>sf-lang</code>) et de cookies
            (<code>sf-consent</code>) restent dans le stockage local de votre navigateur ; l'écran de démarrage est
            mémorisé pour la session (<code>sf-booted</code>). Rien de tout cela n'est transmis.
          </dd>
          <dt>Vos droits et suppression</dt>
          <dd>
            Vous pouvez demander l'accès, la rectification ou l'effacement de données vous concernant, ou vous opposer
            à leur traitement, à l'adresse de contact ci-dessus. Si vous êtes ami Steam de l'éditeur et ne souhaitez
            pas apparaître sur ce site, écrivez à cette même adresse, ou rendez votre profil privé dans les
            paramètres de Steam. Vous pouvez aussi saisir la
            <a href="https://www.cnil.fr/fr/plaintes" target="_blank" rel="noopener noreferrer">CNIL</a>.
          </dd>
        </dl>
        <button type="button" class="legal-cookie-btn" @click="openBanner">Gérer les cookies</button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.legal {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 860px;
  font-size: 14px;
  line-height: 1.65;
  color: var(--text-dim);
}
.legal p { margin: 0 0 12px; }
.legal dl { margin: 0; }
.legal dt { margin-top: 14px; color: var(--text); font-weight: 600; }
.legal dt:first-child { margin-top: 0; }
.legal dd { margin: 4px 0 0; }
.legal a { color: var(--accent); text-decoration: underline; }
.legal-cookie-btn {
  margin-top: 16px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid var(--accent);
  color: var(--accent);
  font-family: var(--mono);
  font-size: 12px;
  cursor: pointer;
}
</style>
