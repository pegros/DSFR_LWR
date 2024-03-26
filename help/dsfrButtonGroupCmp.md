# Composant Groupe de Boutons du **DSFR**

## Introduction

Le composant **dsfrButtonGroupCmp** permet d'afficher un groupe de boutons d'actions standard du DSFR (cf. [description officielle](https://www.systeme-de-design.gouv.fr/elements-d-interface/composants/groupe-de-boutons)).

![Inline display](/media/dsfrActionListCmp.png)
_Affichage horizontal_

![Stacked display](/media/dsfrActionListCmpNarrow.png)
_Affichage vertical_


Les 4 types de boutons unitaires **DSFR** actuellement disponibles peuvent être utilisés dans sa configuration:
* Bouton DSFR de navigation (cf. composant **[dsfrButtonDsp](/help/dsfrButtonDsp.md)**)
* Bouton DSFR d'action (cf. composant **[dsfrActionDuttonCmp](/help/dsfrActionDuttonCmp.md)**)
* Bouton de Popup de Processus (cf. composant **[dsfrFlowPopupCmp](/help/dsfrFlowPopupCmp.md)**)
* Bouton de Popup de Formulaire (cf. composant **[dsfrFormButtonCmp](/help/dsfrFormButtonCmp.md)**)


## Configuration

La configuration s'effectue entièrement dans **Site Builder** avec l'ensemble des propriétés suivantes:
* `Boutons`: Configuration d'une liste de boutons (Liste JSON de configurations), cf. exemples ci-dessous.
* `Taille`: Taille du groupe de boutons
* `Position`: Positionnement (horizontal) du groupe de boutons
* `Groupe vertical?`: Activation de la variante verticale du groupe de boutons
* `Debug ?`: Activation de détails pour l'analyse de problèmes



### Configuration des boutons

La configuration du groupe de bouton correspond à une liste JSON de configuration unitaires de bouton,
avec les paramètres standards suivants:
* `label`: libellé du bouton
* `title`: titre du bouton (affiché au survol)
* `icon`: nom de l'icone DSFR affichée avec le libellé du bouton (e.g. `checkbox-circle-line`)
* `iconPosition`: positionnement de l'icône dans le bouton, le cas échéant (left, right)
* `variant`: variante d'affichage du bouton (primary, secondary...
* `size` : taille du bouton (small, medium, large)
* `inactive` : Statut d'activité du bouton (true, false)
* `hidden` : Statut d'affichage du bouton (true, false)

Selon le type de bouton, d'autres propriétés spécifiques sont attendues:
* `target` pour un bouton de navigation (cf. composant **[dsfrButtonDsp](/help/dsfrButtonDsp.md)**)
* `action` pour un bouton d'action (cf. composant **[dsfrActionDuttonCmp](/help/dsfrActionDuttonCmp.md)**)
* `flowName`, `flowParameters`, `modalTitle` et `refresh` pour un bouton de Popup de Processus (cf. composant **[dsfrFlowPopupCmp](/help/dsfrFlowPopupCmp.md)**) 
* `flowName`, `flowParameters`, `modalTitle` et `refresh` pour un bouton de Popup de Processus (cf. composant **[dsfrFlowPopupCmp](/help/dsfrFlowPopupCmp.md)**) 
* `flowName`, `flowParameters`, `modalTitle` et `refresh` pour un bouton de Popup de Processus (cf. composant **[dsfrFlowPopupCmp](/help/dsfrFlowPopupCmp.md)**) 
* `formFields`, `objectApiName`, `recordId`, `formTitle`, `formMessage` et `refresh` pour un bouton de Popup de Formulaire (cf. composant **[dsfrFormButtonCmp](/help/dsfrFormButtonCmp.md)**)

Le détail et le type des valeurs attendue est décrite au niveau de chacun des boutons.


L'exemple suivant couvre la configuration de ces différents types d'action.
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

_A compléter_
