# Composants du domaine **Login** du **DSFR**

## Introduction

Pour la gestion des utilisateurs d'une communauté DSFR, plusieurs composants sont proposés
respectivement pour permettre aux utilisateurs de:
* s'**enregistrer** directement depuis le site
* se **connecter** au site avec leur identifiant et mot de passe
* **réinitialiser** leur mot de passe (en cas d'oubli par ex.)
* **modifier** leur mot de passe (par ex. depuis leur espace personnel)

L'objectif de ces composants est de masquer le `username` Salesforce des utilisateurs et d'adopter
l'`email` comme identifiant des utilisateurs du site.
Cela nécessite donc d'avoir une contrainte d'unicité de l'email des **Users** du site et de ne pas utiliser l'email comme `username`!
L'enregistrement d'un nouveau compte est par ailleurs contrôlé en validant un code envoyé à l'adresse email renseignée.

Les 3 premières fonctionnalités étant disponibles en mode **Guest** sur le site, il est 
possible de sécuriser ces opérations via la technologie
**[reCAPTCHA](https://www.google.com/recaptcha/about/)** de Google.
Il est possible d'opter pour la version _developer_ ou _enterprise_ des APIs de Google par 
simple configuration.

ℹ️ L'intégration de **[France Connect](https://franceconnect.gouv.fr/)** n'est pas implémentée à date. C'est une évolution envisageable ultérieurement.


## Liste des composants

### Composant d'enregistrement (Création nouveau compte)

Le composant **DSFR Création nouveau compte** a pour vocation d'être utilisé dans la page standard `Register` des sites pour permettre aux utilisateurs de s'y enregistrer. 

Il permet de créer un nouveau compte utilisateur, la liste des champs demandés lors de cette opération étant configurable. 
* hormis le `mot de passe`, il s'agit exclusivement de champs de l'objet **PersonAccount**
* quelle que soit la liste configurée, un ensemble de champs obligatoire est appliquée (ceux nécessaires en standard sur les objets **PersonAccount** et **User**)
* certains champs comme `email` et `mot de passe` sont en outre dédoublés pour prévenir les erreurs de saisie.

Le composant crée un **PersonAccount** et active un CustomerCommunity **User** en:
* assignant le `profil` par défaut du site (et donc appliquant la licence correspondante) au **User**
* positionant le `owner` par défaut du site (qui doit avoir un rôle) sur le **PersonAccount**
* initialisant les préférences de localisation (langue, chiffres, fuseau horaire...) correspondant au `Guest User` du site

⚠️ Si un **PersonAccount** avec le même email et record type préexiste dans la base mais n'a pas de
CustomerCommunity **User** associé, seule l'activation du **User** est effectuée en le liant au 
**PersonAccount** existant.

L'opération s'effectue en deux étapes, la création d'un nouveau compte utilisateur étant validée
par un code à usage unique transmis par email à l'adresse saisie dans le formulaire principal (Etape #1).
Etape #1 - Saisie des informations                | Etape #2 - Validation du code
:------------------------------------------------:|:-----------------------------------------:
![Register Etape #1](/media/dsfrRegisterCmp1.png) | ![Register Etape #2](/media/dsfrRegisterCmp2.png)

Le composant se configure entièrement dans **Site Builder** et offre les paramètres suivants:
* `Titre principal`: Titre principal du composant
* `Description principale`: Description principale du composant 
* `Entête du formulaire`: Entête du formulaire de création de compte
* `Description du formulaire`: Texte explicatif du formulaire
* `Aide du formulaire`: Message d'aide complémentaire du formulaire (sous la description)
* `Type de Compte`: Nom _developer_ du type d'enregistrement du **PersonAccount** à créer
* `Champs du formulaire`: Liste des champs de l'objet **PersonAccount** à afficher dans le formulaire, souos forme d'une liste JSON du type `[{"name":"nomApiChamp","required":true/false (optionnel)},...]``
* `Mention CNIL`: Activation d'une case d'acceptation de clauses CNIL et libellé de la même clause
* `Entête de Validation`:  Entête du formulaire de validation de compte
* `Description de validation`: Texte explicatif du formulaire de validation
* `Activer Captcha ?`: Activation de la fonction Recaptcha Google pour valider l'opération
* `URL cible`: URL (relative) de la page vers où rediriger l'utilisateur après enregistrement et connexion (typiquement `{!Route.startURL})` pour récupérer l'information transmise par une page d'origine)
* `Debug ?`: Activation de traces pour l'analyse de problèmes

⚠️ Le composant repose sur le **[lightning-record-edit-form](https://developer.salesforce.com/docs/component-library/bundle/lightning-record-edit-form/documentation)** pour le formulaire et applique donc le paramétrage standard des champs configuré dans Salesforce (liste de valeurs, libellés, help text...). Il est en outre indispensable que le **Guest User** du site ait accès en écriture à l'ensemble des champs présentés.

ℹ️ Il utilise également les méthodes standards `initSelfRegistration()` et `verifySelfRegistration()`
de la classe **[UserManagement](https://developer.salesforce.com/docs/atlas.en-us.apexref.meta/apexref/apex_class_System_UserManagement.htm)**
pour envoyer et valider un code à usage unique et contrôler l'enregistrement.


### Composant de connexion (Connexion / Login)

Le composant **DSFR Connexion / Login** a pour vocation d'être utilisé dans la page standard `Login` des sites pour permettre aux utilisateurs de s'y connecter. 

Il permet également de rediriger l'utilisateur vers les pages de création de nouveau compte
(s'il n'a pas de compte) ou de réinitialisation de mot de passe (s'il l'a oublié).

<img src="/media/dsfrLoginCmp.png" alt="Login" width=400> 

Le composant se configure entièrement dans **Site Builder** et offre les paramètres suivants:
* `Titre principal`: Titre principal du composant
* `Section connexion`: Titre de la section de connexion
* `Description connexion`: Texte explicatif de la section de connexion 
* `Bouton de connexion`: Libellé du bouton de connexion
* `URL après Login`: URL (relative) de la page vers où rediriger l'utilisateur après connexion (typiquement `{!Route.startURL})` pour récupérer l'information transmise par une page d'origine)
* `Section création de compte`: Titre de la section de création de nouveau compte
* `Bouton création de compte`: Libellé du bouton pour créer un nouveau compte
* `Page Création de compte`: Référence de page Salesforce (JSON) de la page de création de nouveau compte
* `Lien mot de passe oublié`: Libellé du lien pour réinitialiser son mot de passe
* `Page Mot de passe oublié`: Référence de page Salesforce (JSON) de la page de réinitialisation de mot de passe
* `Activer Captcha ?`: Activation de la fonction Recaptcha Google pour valider l'opération
* `Debug ?`: Activation de traces pour l'analyse de problèmes


### Composant de réinitialisation du mot de passe

Le composant **DSFR Réinitialisation mot de passe** a pour vocation d'être utilisé dans la page standard `Forgot Password` des sites pour permettre aux utilisateurs de réinitialiser leur mot de passe. 

<img src="/media/dsfrLostPasswordCmp.png" alt="Lost Password" width=400> 

Le composant se configure entièrement dans **Site Builder** et offre les paramètres suivants:
* `Titre principal`: Titre principal du composant
* `Entête du formulaire`: Entête du formulaire présenté
* `Description`: Texte explicatif de la procédure 
* `Bouton d'envoi`: Libellé du bouton de réinitialisation
* `Page cible`: Référence de page Salesforce (JSON) de la page vers laquelle rediriger l'utilisateur
* `Activer Captcha ?`: Activation de la fonction Recaptcha Google pour valider l'opération
* `Debug ?`: Activation de traces pour l'analyse de problèmes

ℹ️ La page cible suivante est classiquement la page standard `Check Password` des sites. La référence de page cible a configurer est alors:
```
{
    "type":"comm__namedPage",
    "attributes":{"name":"Check_Password"},
    "state":{"startURL":"{!Route.startURL}"}
}
```

### Composant de changement du mot de passe

Le composant **DSFR Changement mot de passe** a pour vocation d'être utilisé dans une page ou un ensemble de pages permettant à l'utilisateur d'administrer ses données personnelles. 

<img src="/media/dsfrChangePasswordCmp.png" alt="Change Password" width=400> 

Le composant se configure entièrement dans **Site Builder** et offre les paramètres suivants:
* `Titre principal`: Titre principal du composant
* `Entête du formulaire`: Entête du formulaire de modification de mot de passe
* `Description`: Texte explicatif du formulaire 
* `Mention d'aide`: Mention d'aide du formulaire (sous la description)
* `Libellé du bouton`: Libellé du bouton de soumission du formulaire
* `Debug ?`: Activation de traces pour l'analyse de problèmes

ℹ️ Dans le cas où le composant est utilisé dans une page _custom_ séparée (par ex. `ChangePassword__c`), il est très simple d'utiliser le composant **[DSFR Bouton (Navigation)](/help/dsfrButtonDsp.md)** pour afficher un bouton de navigation vers cette page en utilisant la configuration suivante:
```
{
    "type":"comm__namedPage",
    "attributes":{"name":"ChangePassword__c"}
}
```

## Configuration **reCAPTCHA**

La solution implemente actuellement la version v3 de **[reCAPTCHA](https://www.google.com/recaptcha/about/)**.
* Il n'y a donc pas d'interaction explicite entre l'utilisateur et le composant Google ajouté au site.
* Par défaut, un iframe dédié reste visible en permanence en bas à droite des pages, mais il est possible de le masquer par CSS en ciblant son conteneur.
* L'utilisation de **reCAPTCHA** par les composants est par ailleurs optionnelle et configurable au travers de propriétés booléennes `Use Captcha ?` accessibles depuis **Site Builder**.
* La bascule entre les versions **developer** et **enterprise** du **reCAPTCHA** par les composants est configurable au travers de propriétés booléennes `Use Captcha ?` accessibles depuis **Site Builder**.

Widget en affichage nominal        | Widget après ouverture
:---------------------------------:|:-----------------------------------------:
![Recaptcha](/media/Recaptcha.png) | ![Recaptcha](/media/RecaptchaExpanded.png)

### Déclaration Google

En version **Developer**, dans la configuration de votre site, il est indispensable de :
* déclarer les domaines de vos sites Experience Salesforce (typiquement, `mydomain.sandbox.my.site.com` pour une sandbox ou `mydomain.my.site.com` pour une production, voire `mydomain.sandbox.builder.salesforce-experience.com` si vous voulez avoir l'accès au Captcha en mode _preview_ de Site Builder)
* récupérer les deux clés reCaptcha, i.e. celle du site et celle du serveur.

En version **Enterprise**, la configuration est plus complexe mais il est indispensable de :
* créer le projet et récupérer son ID
* déclarer un/des site(s) Google et y enregistrer les domaines vos site Experience Salesforce et y récupérer la/les clé(s) de site reCaptcha
* créer et activer une/des API Keys pour autoriser l'accès serveur au projet.

ℹ️ Pour migrer de **Developer** à **Enterprise**, vous pouvez consulter le site de **[Google](https://cloud.google.com/recaptcha-enterprise/docs/migrate-recaptcha?hl=fr)**.

Les trois informations importantes pour la configuration du site Experience Salesforce sont:
* la clé _site_ pour les appels d'évaluation reCaptcha depuis le Browser
* la clé _serveur_ (Developer) ou _API Key_ (Enterprise) pour les appels de vérification reCaptcha depuis les serveurs Salesforce
* l'_ID projet_ (Enterprise seulement) pour les appels serveurs 


### Configuration **Named Credentials**

Deux Named Credentials sont proposés, respectivement pour l'utilisation des versions _Developer_ et _Entreprise_ de Google:
* `GoogleRecaptchaDeveloper` contient le endpoint standard _Developer_ de Google
    * Il est configuré en authentification `Named Principal`
    * ⚠️ Il faut y renseigner la _Server Key_ Google en tant que mot de passe
* `GoogleRecaptchaEnterprise` contient le endpoint _Enterprise_ de Google pour le projet utilisé
    * Il est configuré en authentication `Anonymous`
    * ⚠️ Il faut y modifier l'URL pour y renseigner l'_API key_ et le _Project ID_

⚠️ Il s'agit de _Named Credentials_ **legacy** pour des problèmes techniques d'accès avec le **Guest User** des sites Experience.


### Configuration **Head Markup**

Dans le **Head Markeup** du site, il est indispensable d'ajouter le chargement de la librairie reCAPTCHA Google et d'enregistrer un handler pour traiter les demandes de vérification émises par les composants. Pour information, la communication avec les composants s'effectue au travers de deux évènements **grecaptchaExecute** et **grecaptchaVerified**.

Pour cela, il faut y ajouter les lignes suivantes en remplaçant la **<GOOGLE_SITE_KEY>** par la bonne valeur configurée chez Google.
* En version **Developer**
```
<!-- Google reCAPTCHA -->
<script src='https://www.google.com/recaptcha/api.js?render=<GOOGLE_SITE_KEY>'></script>
<script>
	console.log('CAPTCHA: Loading Developer API');
    document.addEventListener('grecaptchaExecute', function(e) {
        //console.log('grecaptchaExecute: START Developer with ', JSON.stringify(e.detail));
        grecaptcha.ready(() => {
			//console.log('grecaptchaExecute: grecaptcha ready ');
        	grecaptcha.execute('<GOOGLE_SITE_KEY>', {action: e.detail.action}).then(function(token) {
        		//console.log('grecaptchaExecute: execute done and token received ', token);
            	document.dispatchEvent(new CustomEvent('grecaptchaVerified',
                                                       {'detail': {response: token, action:e.detail.action,
                                                                   site: '<GOOGLE_SITE_KEY>', isEnterprise:false}}));
        		//console.log('grecaptchaExecute: END / verify event triggered');
        	});
        });
        //console.log('grecaptchaExecute: execute Developer triggered');
    }); 
</script>
```
* En version **Enterprise**
```
<!-- Google reCAPTCHA -->
<script src="https://www.google.com/recaptcha/enterprise.js?render=<GOOGLE_SITE_KEY>"></script>
<script>
	console.log('CAPTCHA: Loading Enterprise API');
    document.addEventListener('grecaptchaExecute', function(e) {
        //console.log('grecaptchaExecute: START Enterprise with ', JSON.stringify(e.detail));
        grecaptcha.enterprise.ready(() => {
			//console.log('grecaptchaExecute: grecaptcha ready ');
        	grecaptcha.enterprise.execute('<GOOGLE_SITE_KEY>', {action: e.detail.action}).then(function(token) {
        		//console.log('grecaptchaExecute: Enterprise execute done and token received ', token);
            	document.dispatchEvent(new CustomEvent('grecaptchaVerified',
													   {detail: {response: token, action:e.detail.action,
														site: '<GOOGLE_SITE_KEY>', isEnterprise:true}}));
        		//console.log('grecaptchaExecute: END / verify event triggered');
        	});
        });
        //console.log('grecaptchaExecute: Enterprise execute triggered');
    });
</script>
```

ℹ️ Si vous souhaitez masquer le composant **reCAPTCHA** affiché en bas à droite des pages, il est possible d'agir sur les classes CSS utilisées par Google, par ex. en ajoutant les lignes suivantes dans le **Head Markup** du site.
```
<style>
    .grecaptcha-badge {
        display: none !important;
    }
</style>
```

### Configuration **CSP** 

Afin de pouvoir correctement charger la librairie **reCAPTCHA** Google et pouvoir l'executer dans le site, il est nécessaire d'assouplir légèrement les règles de sécurité en modifiant la configuration **Security & Privacy**.

Il est nécessaire de modifier le `security level` au niveau de la **Content SecurityPolicy (CSP)** et de le positionner à la valeur `Relaxed CSP: Permit Access to Inline Scripts and Allowed Hosts`.

Il faut ensuite ajouter les endpoints de Google dans les **Trusted Sites for Scripts**, typiquement:
* **www.google.com** avec l'URL `https://www.google.com/recaptcha/` ou 
* **www.gstatic.com** avec l'URL `https://www.gstatic.com/recaptcha/releases/`
