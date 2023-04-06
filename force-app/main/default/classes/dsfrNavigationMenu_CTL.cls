/***
* @description  Lightning controller to fetch the details of an
*               Experience Site navigation menu.
*               Part of the DSFR_LWR package.
* @author       P-E GROS
* @date         Feb 2023
*
* Legal Notice
* 
* MIT License
* 
* Copyright (c) 2023 pegros
* 
* Permission is hereby granted, free of charge, to any person obtaining a copy
* of this software and associated documentation files (the "Software"), to deal
* in the Software without restriction, including without limitation the rights
* to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the Software is
* furnished to do so, subject to the following conditions:
* 
* The above copyright notice and this permission notice shall be included in all
* copies or substantial portions of the Software.
* 
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
* IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
* FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
* AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
* LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
* OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
* SOFTWARE.
***/

public with sharing class dsfrNavigationMenu_CTL {

    /***
    * @description  Static constant containing all navigation items types not supported in custom
    *               LWC navigation component.
    ***/
    final private static List<ConnectApi.NavigationMenuItemType> EXCLUDED_TYPES = new List<ConnectApi.NavigationMenuItemType>{
        ConnectApi.NavigationMenuItemType.Event,
        ConnectApi.NavigationMenuItemType.SystemLink
    };

    /***
    * @description  Simple method to fetch the list of supported menu items included
    *               in a navigation menu given its label displayed in the Site Builder.
    *               It assumes that the call is done from an Experience Site to retrieve
    *               its Network ID.
    * @param        navigationLabel Label of the Navigation Menu
    * @param        includeHome     
    * @return       List<ConnectApi.NavigationMenuItem> List of supported menu items
    * @exception    Various exceptions in case of missing input or wrong context.
    ***/

    @AuraEnabled(cacheable=true)
    public static List<ConnectApi.NavigationMenuItem> getMenuItems(String navLabel, Boolean showHome) {
        System.debug('getMenuItems: START for ' + navLabel);
        System.debug('getMenuItems: with home? ' + showHome);
        if (String.isEmpty(navLabel)) {
            System.debug(LoggingLevel.ERROR, 'getMenuItems: END KO / Missing navigation Label');
            throw new System.AuraHandledException('Missing Navigation Menu Label!');
        }

        String networkId = Network.getNetworkId();
        if (String.isEmpty(networkId)) {
            System.debug(LoggingLevel.ERROR, 'getMenuItems: END KO / No networkId');
            throw new System.AuraHandledException('Network ID not available!');
        }
        System.debug('getMenuItems: networkId retrieved ' + networkId);

        NavigationLinkSet navigationLinkSet = [ SELECT DeveloperName
                                                FROM NavigationLinkSet
                                                WHERE NetworkId = :networkId AND MasterLabel = :navLabel
                                                LIMIT 1];
        if (navigationLinkSet == null) {
            System.debug(LoggingLevel.ERROR, 'getMenuItems: END KO / No navigation found with label ' + navLabel + ' on network ' + networkId);
            throw new System.AuraHandledException('Navigation menu not found!');
        }
        System.debug('getMenuItems: navigationLinkSet retrieved ' + navigationLinkSet);
        String navName = navigationLinkSet.DeveloperName;

        ConnectApi.NavigationMenuItemCollection navMenu = ConnectApi.NavigationMenu.getCommunityNavigationMenu(
            networkId, null, navName,
            ConnectApi.PublishStatus.Live, false, showHome, EXCLUDED_TYPES);
        System.debug('getMenuItems: navigation Menu retrieved ' + navMenu);

        List<ConnectApi.NavigationMenuItem> navItems = navMenu.menuItems;
        System.debug('getMenuItems: END returning ' + navItems);
        return navItems;
    }

    /***
    * @description  Method to fetch the list of supported menu items included in a set of navigation menu given their master labels
    *               configured in for a Site.
    *               It assumes that the call is done from an Experience Site to retrieve its Network ID.
    *               user ID is used to trigger a reevaluation of the menu when switching from guest to connected mode.
    * @param        navigationMenus Map of Navigation Menu Labels with a boolean indicating if Home should be included for each one.
    * @param        userId          User ID for which the navigation menu details should be requested.
    * @return       List<ConnectApi.NavigationMenuItem> List of supported menu items
    * @exception    Various exceptions in case of missing input or wrong context.
    ***/

    @AuraEnabled(cacheable=true)
    public static Map<String,List<ConnectApi.NavigationMenuItem>> getNavigations(final List<Object> menus, final String userId) {
        System.debug('getNavigations: START for ' + menus);
        System.debug('getNavigations: with userId ' + userId);
        
        if ((menus == null) || (menus.isEmpty())) {
            System.debug(LoggingLevel.ERROR, 'getNavigations: END KO / Missing navigation menus' + menus);
            throw new System.AuraHandledException('Missing Navigation Menus !');
        }

        String networkId = Network.getNetworkId();
        if (String.isEmpty(networkId)) {
            System.debug(LoggingLevel.ERROR, 'getNavigations: END KO / No networkId');
            throw new System.AuraHandledException('Network ID not available!');
        }
        System.debug('getNavigations: networkId retrieved ' + networkId);

        Map<String,Boolean> menuMap = new Map<String,Boolean>();
        for (Object iter : menus) {
            System.debug(LoggingLevel.FINEST, 'getNavigations: analysing menu ' + iter);
            Map<Object,Object> iterObj = (Map<Object,Object>)(iter);
            System.debug(LoggingLevel.FINEST, 'getNavigations: iterObj converted ' + iterObj);
            String iterLabel = (String)(iterObj.get('label'));
            System.debug(LoggingLevel.FINEST, 'getNavigations: iterLabel extracted ' + iterLabel);
            Boolean iterShowHome = (Boolean)(iterObj.get('showHome'));
            System.debug(LoggingLevel.FINEST, 'getNavigations: iterShowHome extracted ' + iterShowHome);
            menuMap.put(iterLabel,iterShowHome);
        }
        System.debug('getNavigations: menuMap prepared ' + menuMap);

        List<NavigationLinkSet> navigationLinkSets = [  SELECT DeveloperName, MasterLabel
                                                        FROM NavigationLinkSet
                                                        WHERE NetworkId = :networkId AND MasterLabel in :menuMap.keySet()];
        if (navigationLinkSets == null) {
            System.debug(LoggingLevel.ERROR, 'getMenuItems: END KO / No navigation menus found with labels ' + menuMap.keySet() + ' on network ' + networkId);
            throw new System.AuraHandledException('Navigation menus not found!');
        }
        System.debug('getMenuItems: navigationLinkSet retrieved ' + navigationLinkSets);

        Map<String,List<ConnectApi.NavigationMenuItem>> resultMap = new Map<String,List<ConnectApi.NavigationMenuItem>>();
        for (NavigationLinkSet iter : navigationLinkSets) {
            System.debug('getMenuItems: processing menu ' + iter);

            Boolean iterShowHome = menuMap.get(iter.MasterLabel);
            System.debug('getMenuItems: ShowHome? ' + iterShowHome);

            ConnectApi.NavigationMenuItemCollection iterMenu = ConnectApi.NavigationMenu.getCommunityNavigationMenu(
                networkId, null, iter.DeveloperName,
                ConnectApi.PublishStatus.Live, false, iterShowHome, EXCLUDED_TYPES);
            System.debug('getMenuItems: navigation Menu retrieved ' + iterMenu);

            /*for (ConnectApi.NavigationMenuItem iterM : iterMenu.menuItems) {
                System.debug('getMenuItems: unescaping Menu item ' + iterM);
                iterM.label = (iterM.label).unescapeHtml4();
            }*/

            resultMap.put(iter.MasterLabel,iterMenu.menuItems);
            System.debug('getMenuItems: menuItems registered ' + iterMenu.menuItems);
        }
        System.debug('getMenuItems: END returning ' + resultMap);
        return resultMap;
    }
}