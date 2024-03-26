# Composant Liste d'Actions du **DSFR**

## Introduction

Le composant **dsfrActionListCmp** permet d'afficher un groupe de boutons d'actions standard du DSFR (cf. [description officielle](https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/groupe-de-boutons)).

![Inline display](/media/dsfrActionListCmp.png)
_Affichage horizontal (avec classe fr-btns-group--inline-md)_

![Stacked display](/media/dsfrActionListCmpNarrow.png)
_Affichage vertical (avec classe _fr-btns-group_ seule ou quand l'affichage est étroit)_


Les 4 types de boutons unitaires **DSFR** actuellement disponibles peuvent être utilisés dans sa configuration:
* Bouton DSFR de navigation (cf. composant **[dsfrButtonDsp](/help/dsfrButtonDsp.md)**)
* Bouton DSFR d'action (cf. composant **[dsfrActionDuttonCmp](/help/dsfrActionDuttonCmp.md)**)
* Bouton de Popup de Processus (cf. composant **[dsfrFlowPopupCmp](/help/dsfrFlowPopupCmp.md)**)
* Bouton de Popup de Formulaire (cf. composant **[dsfrFormButtonCmp](/help/dsfrFormButtonCmp.md)**)

Chaque bouton peut être dynamiquement masqué ou désactivé selon divers éléments de contexte.


## Configuration

La configuration s'effectue en partie dans **Site Builder** mais repose principalement sur les metadata
**sfpegAction** apportés par le package **[PEG_LIST](https://github.com/pegros/PEG_LIST)**.

### Configuration dans **Site Builder**

Les propriétés suivantes sont disponibles directement dans **Site Builder**:
* `Configuration d'actions`: Nom du custom metadata **sfpegAction** de configuration (obligatoire)
* `Contexte d'action`: Contexte (optionnel) au format JSON nécessaire à la configuration de la liste d'actions
    * par ex. `{"Type":"OPE_TYP"}`, qui permet ensuite d'utiliser cett valeur `Type` dans un token `CTX`
    de la configuration d'action (via `{{{CTX.Type}}}`)
* `CSS additionnelle`: Classes pour modifier le style du conteneur du composant
    * par défault, la configuration **DSFR** `fr-btns-group fr-btns-group--inline-md` est proposée
    * il est possible de forcer un alignement à droite (via la classe `fr-btns-group--right`) ou au centre (via la classe `fr-btns-group--center`) 
* `Object Name`: API Name de l'objet courant de la page (typiquement `{!Route.objectApiName}`)
* `Record ID`: Id Salesforce de l'enregistrement courant (pour les token `RCD`, typiquement `{!Route.recordId}`)
* `Debug ?`: Activation de détails pour l'analyse de problèmes


### Configuration dans la metadata **sfpegAction**

La configuration du composant repose sur celle du composant **[sfpegActionBarCmp](https://github.com/pegros/PEG_LIST/blob/master/help/sfpegActionBarCmp.md)**,
elle même profitant des services du composant **[sfpegMergeUtl](https://github.com/pegros/PEG_LIST/blob/master/help/sfpegMergeUtl.md)**.

⚠️ Seule la metadonnée du composant **sfpegActionBarCmp** et sa contextualisation via **sfpegMergeUtl** sont utilisées.

Les seules actions disponibles sont celles offertes par les composants DSFR d'action
* Bouton DSFR de navigation (cf. composant **[dsfrButtonDsp](/help/dsfrButtonDsp.md)**)
* Bouton DSFR d'action (cf. composant **[dsfrActionDuttonCmp](/help/dsfrActionDuttonCmp.md)**)
* Bouton de Popup de Processus (cf. composant **[dsfrFlowPopupCmp](/help/dsfrFlowPopupCmp.md)**)
* Bouton de Popup de Formulaire (cf. composant **[dsfrFormButtonCmp](/help/dsfrFormButtonCmp.md)**)

La métadonnée du composant **sfpegActionBarCmp** ne doit comporter qu'une liste de boutons (i.e. pas de menus) reprenant la configuration
de ces boutons **DSFR**, comme dans le cas des actions de la **[Carte DSFR](https://github.com/pegros/DSFR_LWR/blob/master/help/dsfrCardCmp.md)**.

L'exemple suivant couvre la configuration de ces différentstypes d'action.
```
[
    {
        "label": "Account Open",
        "target": {
            "type": "standard__recordPage",
            "attributes": {
                "recordId": "{{{RCD.AccountId__c}}}",
                "objectApiName": "Account",
                "actionName": "view"
            }
        }
    },
    {
        "label": "Account Update",
        "hidden":{{{NPERM.TEST_Permision}}},
        "action": {
            "type": "update",
            "params": {
                "fields": {
                    "Id": "001AW000006QZoPYAW",
                    "Status__c": "{{{CTX.Status}}}"
                }
            }
        }
    },
    {
        "label": "Account Flow",
        "variant": "secondary",
        "inactive":{{{PERM.TEST_Permision}}},
        "flowName": "InteractionFlow",
        "flowParameters": [
            {
                "name": "recordId",
                "type": "String",
                "value": "{{{RCD.AccountId__c}}}"
            }
        ],
        "modalTitle": "Update Flow for {{{RCD.Name}}}",
        "refresh": true
    },
    {
        "label": "Account Edit",
        "recordId": "{{{RCD.AccountId__c}}}",
        "objectApiName": "Account",
        "formTitle": "Edit Account {{{CTX.ID}}}",
        "formMessage": "Beware.",
        "formFields": [
            {
                "name": "Name",
                "required": true
            }
        ],
        "refresh": true
    }
]
```

## Précisions techniques

⚠️ Ce composant a pour prerequis le package **[PEG_LIST](https://github.com/pegros/PEG_LIST)**.

Pour une approche indépendante DSFR ne reposant pas sur ce package, cf. le composant **[dsfrButtonGroupCmp](/help/dsfrButtonGroupCmp.md)**).
