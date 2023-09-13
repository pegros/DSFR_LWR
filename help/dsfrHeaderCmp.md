# Composant En-tête du **DSFR**

## Introduction

Le composant **dsfrHeaderCmp** permet d'afficher une **[entête standard du DSFR](https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/en-tete)** dans les sections du theme header d'une page de communauté.

![Page Header](/media/dsfrHeaderCmp.png) 


Il offre une variété d'options pour configurer le contenu des différentes sections et la liste des actions disponibles depuis l'en-tête ou la barre de navigation principale.

Pour la mise en place d'une barre de navigation principale évoluée, le composant repose sur le composant **[sfpegActionBarCmp](https://github.com/pegros/PEG_LIST/blob/master/help/sfpegActionBarCmp.md)** qui offre plus de capacités de configuration que les menus de navigation standards des sites Experience Cloud.


## Prerequis

Le composant s'adapte automatiquement au format de l'écran (***responsive***). Toutefois, en mode desktop, il repose sur une largeur max de contenu de 1200px, ce qui nécessite de configurer en conséquence le theme du site.
![Site Spacing](/media/dsfrSpacing.png)
En mobile, le spacing du thème doit être positionné à 0.


## Configuration

Toute la configuration du composant s'effectue directement dans **Site Builder** au travers des propriétés proposées.
* propriétés de contenu
    * `Intitulé officiel` : libellé intégré au logo entre la marianne et la devise de la république française, par ex. 
    `Ministère<br>de l'éducation<br>nationale<br>et de la jeunesse` pour contrôler les sauts de ligne
    * `URL du logo` : URL cible en cas de click sur le logo ou le nom du site, par ex. `/recrutement` pour retourner à l'accueil du site **recrutement**
    * `Nom du Site / Service` : libellé/titre principal de l'en-tête
    * `Précisions sur l'organisation` : libellé/titre secondaire de l'en-tête
* propriétés d'actions
    * `Menu supérieur` : libellé du ***Navigation Menu*** défini sur le site et donnant la liste des actions affichées en haut à droite de l'en-tête 
        * le menu doit avoir été publié pour être affiché dans le composant
        * via une convention de nommage des items du menu de navigation, il est possible de définir une icône à afficher avant le libellé de l'action
        * le menu n'est affiché que si l'utilisateur est connecté (i.e. pas pour l'utilisateur **Guest** du site)
    * `Menu principal (simple)` : libellé du ***Navigation Menu*** configuré pour le site et donnant la liste des actions (simples liens, sans menus) affichées dans la barre de menu de navigation principale
        * si un menu principal complexe (cf. ci-dessous) est défini, ce menu est ignoré.
        * les droits d'accès aux éléments repose sur la configuration standard de la communauté (pages publiques / privées pour le user **guest**, accès aux pages d'objet selon les droits de l'utilisateur)
    * `Menu principal (complexe)` : developer name d'un enregistrement de la meta-donnée **[sfpegAction](https://github.com/pegros/PEG_LIST/blob/master/help/sfpegActionBarCmp.md)** fournissant une liste de liens et de menus à afficher dans la navigation principale
        * cette configuration permet de gérer finement la présentation (propriété `hidden`) et l'activation (propriété `disabled`) des éléments disponibles
        * la plupart des actions configurées dans le **[sfpegAction](https://github.com/pegros/PEG_LIST/blob/master/help/sfpegActionBarCmp.md)** sont des actions de type `navigation`
        * un seul niveau de menus est possible
        * si une configuration complexe est fournie, la configuration simple du menu principal est ignorée.
    * `Inclure Recherche ?` : permet d'activer la présentation d'une barre de recherche en haut à droite de l'entête (sous le menu supérieur)
    * `Page de Recherche` : Nom API de la page de recherche à utiliser si celle-ci est différente de la page de recherche standard (le composant positionnant le terme recherché dans le contexte de redirection)
    * `Nom de l'utilisateur` : permet d'activer la présentation du nom de l'utilisateur dans l'entête si une valeur est définie (par ex. en utilisant le data-binding `{!User.Record.Name}`)
    * `Lien utilisateur` : [reference Salesforce](https://developer.salesforce.com/docs/component-library/documentation/en/lwc/lwc.reference_page_reference_type) de la page du site vers lequel l'utilisateur est redirigé en cliquant sur son nom (si celui-ci est affiché)
    * `Cacher Se connecter ?` : permet d'activer l'affichage des boutons `se connecter` (si user **Guest**) et `se déconnecter` (si user standard) dans l'entête
        * cette propriété permet de masquer ces liens dans le cas d'un site entièrement privé contrôlé par SSO.
* autres proprétés
    * `Debug ?` : Activation de détails pour l'analyse de problèmes


## Configuration des actions

### Configuration simple par Menus de Navigation standards des Sites 

Pour la configuration des actions menus de navigation, il suffit de configurer le menu de navigation depuis Site Builder en utilisant des items de type supporté par les Experience Sites LWR, à savoir: 
* Site pages
* Salesforce objects
* External URLs

Pour le menu supérieur, une convention de nommage des éléments du menu de navigation permet de configurer une icône pour les actions affichées. Il suffit pour cela d'utiliser le caractère `#` pour séparer le libellé de l'action et le nom de l'[icône DSFR](https://www.systeme-de-design.gouv.fr/elements-d-interface/fondamentaux-techniques/icones) à utiliser.
Ainsi, dans l'exemple ci-dessous, le libellé `Mon espace candidat#account-line` dans le menu de navigation permet d'afficher l'action `Mon espace candidat` avec l'icône `account-line` et de rediriger l'utilisateur vers une page dédiée du site.
![Page Header 2](/media/dsfrHeaderCmp2.png) 


### Configuration complexe de la barre de navigation principale 

Pour une configuration plus riche des actions disponibles depuis la barre de navigation principale, il est possible d'utiliser un enregistrement de meta-donnée **[sfpegAction](https://github.com/pegros/PEG_LIST/blob/master/help/sfpegActionBarCmp.md)** pour définir et afficher des liens et des menus.

Beaucoup d'exemples de configuration sont disponibles dans la documentation du composant **[sfpegActionBarCmp](https://github.com/pegros/PEG_LIST/blob/master/help/sfpegActionBarCmp.md)**. Dans le cas de la barre de menu de navigation, les principaux types d'action utilisés sont :
* `navigation` pour ouvrir n'importe quelle page dans l'onglet courant du navigateur
* `openURL` pour ouvrir des pages (souvent externes) dans un nouvel onglet du navigateur

Un élément important de cette configuration est la possibilité d'exploiter les tokens dynamiques du framework sous-jacent **[sfpegMergeUtl](https://github.com/pegros/PEG_LIST/blob/master/help/sfpegMergeUtl.md)** pour adapter les cibles des actions ainsi que leur visibilité / activation. Dans le cas de la barre de menu de navigation,  Les principaux tokens utilisés sont:
* `{{{USR.xxx}}}` pour utiliser des informations sur l'utilisateur (par ex. un champ `UserType` ou `isGuest__c`)
* `{{{PERM.xxx}}}` et `{{{NPERM.xxx}}}` pour valider l'attribution (ou la non-attribution) d'une custom permission à l'utilisateur courant
Ces éléments sont ainsi très utile pour désactiver (propriété `disabled`) ou masquer (propriété `hidden`) des actions, des menus ou des entrées de menu, comme dans l'exemple suivant reposant sur la détention de 3 custom permissions différentes pour activer / masquer différents éléments d'un menu.
```
[
    {
        "name": "home",
        "label": "Accueil",
        "action": {
            "type": "navigation",
            "params": {"type": "comm__namedPage","attributes": {"name": "Home"}}
        }
    },
    {
        "name": "sessions",
        "label": "Sessions",
        "disabled":{{{NPERM.SessionsViewAll}}},
        "action": {
            "type": "navigation",
            "params": {"type": "standard__objectPage","attributes": {"objectApiName": "CourseOffering","actionName": "home"}}
        }
    },
    {
        "name": "actions",
        "label": "Actions",
        "hidden":{{{NPERM.SessionsModify}}},
        "items":[
            {
                "name": "newSession",
                "label": "Nouvelle session",
                "disabled":{{{NPERM.SessionsCreate}}},
                "action": {
                    "type": "navigation",
                    "params": {"type": "comm__namedPage","attributes": {"name": "SessionCreation__c"}}
                }
            },
            ...
        ]
    }
]
```

Il est possible d'étendre les capacités de ce framework en ajoutant les IDs de Network comme tokens, ce qui est très utile pour utiliser la fonctionnalité de **network switch** pour conserver une session utilisateur en basculant d'un site à un autre. Il faut pour cela:
* ajouter le record de méta-donnée **sfpegConfiguration** suivant:
    * `label`: `Networks`
    * `Name` : `NTW`
    * `Field` : `urlPathPrefix`
    * `Query` : `SELECT Id, urlPathPrefix FROM Network WHERE urlPathPrefix IN`
* configurer une action de navigation en utilisant le token `{{{NTW.xxx}}}` avec xxx correspondant à l'`urlPathPrefix` du site cible
```
{
    "name": "mesFormations",
    "label": "Mes formations",
    "disabled":{{{NPERM.TST_Perm}}},
    "action": {
        "type": "openURL",
        "params": {
            "reworkURL": true,
            "target": "_self",
            "url": "/servlet/networks/switch?networkId=LEFT({{{NTW.mesFormationsvforcesite}}},15)&startURL=/"
        }
    }
},
```


## Précisions techniques

Le composant utilise un composant du package **[PEG_LIST](https://github.com/pegros/PEG_LIST)** pour une configuration dynamique de la barre de navigation principale (**[sfpegActionBarCmp](https://github.com/pegros/PEG_LIST/blob/master/help/sfpegActionBarCmp.md)**).
Cela induit une dépendence avec ce package qui peut être évité en commentant simplement les premières lignes du code HTML du composant.
```
<!-- DATA LOAD UTILITY -->
    <template lwc:if={complexMenu}>
        <c-sfpeg-action-bar-cmp bar-class= "slds-hide"
                                config-name={complexMenu}
                                user-id={currentUserId}
                                is-hidden="true"
                                is-debug={isDebug}
                                onready={handleActionsReady}
                                ondone={handleActionDone}>
        </c-sfpeg-action-bar-cmp>
    </template>
``` 

