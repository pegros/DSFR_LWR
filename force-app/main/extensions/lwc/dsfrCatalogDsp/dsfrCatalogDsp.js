import { LightningElement, api } from 'lwc';


export default class DsfrImageCatalogDsp extends LightningElement {

    @api wrappingClass;

    pictoList = [
        'buildings/city-hall',
        'buildings/factory',
        'buildings/nuclear-plant',
        'buildings/school',
        'digital/application',
        'digital/avatar',
        'digital/calendar',
        'digital/coding',
        'digital/data-visualization',
        'digital/in-progress',
        'digital/internet',
        'digital/search',
        'digital/send-mail',
        'documents/contract',
        'documents/document-download',
        'documents/document',
        'documents/driving-licence',
        'documents/national-identity-card',
        'documents/passport',
        'documents/sign-document',
        'documents/tax-stamp',
        'documents/vehicle-registration-document',
        'environment/environment',
        'environment/human-cooperation',
        'environment/leaf',
        'environment/moon',
        'environment/mountain',
        'environment/sun',
        'environment/tree',
        'health/health',
        'health/hospital',
        'health/vaccine',
        'health/virus',
        'institutions/firefighter',
        'institutions/gendarmerie',
        'institutions/justice-scales',
        'institutions/money',
        'institutions/police',
        'leisure/book',
        'leisure/community',
        'leisure/culture',
        'leisure/digital-art',
        'leisure/paint',
        'system/connection-lost',
        'system/error',
        'system/information',
        'system/notification',
        'system/padlock',
        'system/success',
        'system/system',
        'system/technical-error',
        'system/warning',
        'travel/airport',
        'travel/france-localization',
        'travel/luggage',
        'travel/map'];

        iconsList = ['ancient-gate-fill',
  'surgical-mask-fill',
  'ancient-gate-line',
  'surgical-mask-line',
  'ancient-pavilion-fill',
  'syringe-fill',
  'ancient-pavilion-line',
  'syringe-line',
  'bank-fill',
  'test-tube-fill',
  'bank-line',
  'test-tube-line',
  'building-fill',
  'thermometer-fill',
  'building-line',
  'thermometer-line',
  'community-fill',
  'virus-fill',
  'community-line',
  'virus-line',
  'government-fill',
  'chrome-fill',
  'government-line',
  'chrome-line',
  'home-4-fill',
  'edge-fill',
  'home-4-line',
  'edge-line',
  'hospital-fill',
  'facebook-circle-fill',
  'hospital-line',
  'facebook-circle-line',
  'hotel-fill',
  'firefox-fill',
  'hotel-line',
  'firefox-line',
  'store-fill',
  'fr--dailymotion-fill',
  'store-line',
  'fr--dailymotion-line',
  'archive-fill',
  'fr--tiktok-fill',
  'archive-line',
  'fr--tiktok-line',
  'attachment-fill',
  'github-fill',
  'attachment-line',
  'github-line',
  'award-fill',
  'google-fill',
  'award-line',
  'google-line',
  'bar-chart-box-fill',
  'ie-fill',
  'bar-chart-box-line',
  'ie-line',
  'bookmark-fill',
  'instagram-fill',
  'bookmark-line',
  'instagram-line',
  'briefcase-fill',
  'linkedin-box-fill',
  'briefcase-line',
  'linkedin-box-line',
  'calendar-2-fill',
  'mastodon-fill',
  'calendar-2-line',
  'mastodon-line',
  'calendar-event-fill',
  'npmjs-fill',
  'calendar-event-line',
  'npmjs-line',
  'calendar-fill',
  'remixicon-fill',
  'calendar-line',
  'remixicon-line',
  'cloud-fill',
  'safari-fill',
  'cloud-line',
  'safari-line',
  'copyright-fill',
  'slack-fill',
  'copyright-line',
  'slack-line',
  'customer-service-fill',
  'snapchat-fill',
  'customer-service-line',
  'snapchat-line',
  'flag-fill',
  'telegram-fill',
  'flag-line',
  'telegram-line',
  'global-fill',
  'twitch-fill',
  'global-line',
  'twitch-line',
  'line-chart-fill',
  'twitter-fill',
  'line-chart-line',
  'twitter-line',
  'links-fill',
  'vimeo-fill',
  'links-line',
  'vimeo-line',
  'mail-fill',
  'vuejs-fill',
  'mail-line',
  'vuejs-line',
  'mail-open-fill',
  'youtube-fill',
  'mail-open-line',
  'youtube-line',
  'medal-fill',
  'anchor-fill',
  'medal-line',
  'anchor-line',
  'pie-chart-2-fill',
  'bike-fill',
  'pie-chart-2-line',
  'bike-line',
  'pie-chart-box-fill',
  'bus-fill',
  'pie-chart-box-line',
  'bus-line',
  'printer-fill',
  'car-fill',
  'printer-line',
  'car-line',
  'profil-fill',
  'caravan-fill',
  'profil-line',
  'caravan-line',
  'projector-2-fill',
  'charging-pile-2-fill',
  'projector-2-line',
  'charging-pile-2-line',
  'send-plane-fill',
  'compass-3-fill',
  'send-plane-line',
  'compass-3-line',
  'slideshow-fill',
  'cup-fill',
  'slideshow-line',
  'cup-line',
  'window-fill',
  'earth-fill',
  'window-line',
  'earth-line',
  'chat-2-fill',
  'france-fill',
  'chat-2-line',
  'france-line',
  'chat-3-fill',
  'gas-station-fill',
  'chat-3-line',
  'gas-station-line',
  'chat-check-fill',
  'goblet-fill',
  'chat-check-line',
  'goblet-line',
  'chat-delete-fill',
  'map-pin-2-fill',
  'chat-delete-line',
  'map-pin-2-line',
  'chat-poll-fill',
  'map-pin-user-fill',
  'chat-poll-line',
  'map-pin-user-line',
  'discuss-fill',
  'motorbike-fill',
  'discuss-line',
  'motorbike-line',
  'feedback-fill',
  'passport-fill',
  'feedback-line',
  'passport-line',
  'message-2-fill',
  'restaurant-fill',
  'message-2-line',
  'restaurant-line',
  'question-answer-fill',
  'road-map-fill',
  'question-answer-line',
  'road-map-line',
  'questionnaire-fill',
  'sailboat-fill',
  'questionnaire-line',
  'sailboat-line',
  'video-chat-fill',
  'ship-2-fill',
  'video-chat-line',
  'ship-2-line',
  'ball-pen-fill',
  'signal-tower-fill',
  'ball-pen-line',
  'signal-tower-line',
  'brush-3-fill',
  'suitcase-2-fill',
  'brush-3-line',
  'suitcase-2-line',
  'brush-fill',
  'taxi-fill',
  'brush-line',
  'taxi-line',
  'contrast-fill',
  'train-fill',
  'contrast-line',
  'train-line',
  'crop-fill',
  'camera-fill',
  'crop-line',
  'camera-line',
  'drag-move-2-fill',
  'clapperboard-fill',
  'drag-move-2-line',
  'clapperboard-line',
  'drop-fill',
  'equalizer-fill',
  'drop-line',
  'equalizer-line',
  'edit-box-fill',
  'film-fill',
  'edit-box-line',
  'film-line',
  'edit-fill',
  'gallery-fill',
  'edit-line',
  'gallery-line',
  'ink-bottle-fill',
  'headphone-fill',
  'ink-bottle-line',
  'headphone-line',
  'layout-grid-fill',
  'image-add-fill',
  'layout-grid-line',
  'image-add-line',
  'mark-pen-fill',
  'image-edit-fill',
  'mark-pen-line',
  'image-edit-line',
  'paint-brush-fill',
  'image-fill',
  'paint-brush-line',
  'image-line',
  'paint-fill',
  'live-fill',
  'paint-line',
  'live-line',
  'palette-fill',
  'mic-fill',
  'palette-line',
  'mic-line',
  'pantone-fill',
  'music-2-fill',
  'pantone-line',
  'music-2-line',
  'pen-nib-fill',
  'notification-3-fill',
  'pen-nib-line',
  'notification-3-line',
  'pencil-fill',
  'pause-circle-fill',
  'pencil-line',
  'pause-circle-line',
  'pencil-ruler-fill',
  'play-circle-fill',
  'pencil-ruler-line',
  'play-circle-line',
  'sip-fill',
  'stop-circle-fill',
  'sip-line',
  'stop-circle-line',
  'table-fill',
  'transcription',
  'table-line',
  'volume-down-fill',
  'bug-fill',
  'volume-down-line',
  'bug-line',
  'volume-mute-fill',
  'code-box-fill',
  'volume-mute-line',
  'code-box-line',
  'volume-up-fill',
  'code-s-slash-line',
  'volume-up-line',
  'cursor-fill',
  'leaf-fill',
  'cursor-line',
  'leaf-line',
  'git-branch-fill',
  'lightbulb-fill',
  'git-branch-line',
  'lightbulb-line',
  'git-commit-fill',
  'plant-fill',
  'git-commit-line',
  'plant-line',
  'git-merge-fill',
  'recycle-fill',
  'git-merge-line',
  'recycle-line',
  'git-pull-request-fill',
  'scales-3-fill',
  'git-pull-request-line',
  'scales-3-line',
  'git-repository-commits-fill',
  'seedling-fill',
  'git-repository-commits-line',
  'seedling-line',
  'git-repository-fill',
  'umbrella-fill',
  'git-repository-line',
  'umbrella-line',
  'git-repository-private-fill',
  'add-circle-fill',
  'git-repository-private-line',
  'add-circle-line',
  'terminal-box-fill',
  'add-line',
  'terminal-box-line',
  'alarm-warning-fill',
  'terminal-line',
  'alarm-warning-line',
  'terminal-window-fill',
  'alert-fill',
  'terminal-window-line',
  'alert-line',
  'bluetooth-fill',
  'arrow-down-fill',
  'bluetooth-line',
  'arrow-down-line',
  'computer-fill',
  'arrow-down-s-fill',
  'computer-line',
  'arrow-down-s-line',
  'dashboard-3-fill',
  'arrow-go-back-fill',
  'dashboard-3-line',
  'arrow-go-back-line',
  'database-fill',
  'arrow-go-forward-fill',
  'database-line',
  'arrow-go-forward-line',
  'device-fill',
  'arrow-left-fill',
  'device-line',
  'arrow-left-line',
  'hard-drive-2-fill',
  'arrow-left-s-fill',
  'hard-drive-2-line',
  'arrow-left-s-line',
  'mac-fill',
  'arrow-right-fill',
  'mac-line',
  'arrow-right-line',
  'phone-fill',
  'arrow-right-s-fill',
  'phone-line',
  'arrow-right-s-line',
  'qr-code-fill',
  'arrow-right-up-line',
  'qr-code-line',
  'arrow-up-fill',
  'rss-fill',
  'arrow-up-line',
  'rss-line',
  'arrow-up-s-fill',
  'save-3-fill',
  'arrow-up-s-line',
  'save-3-line',
  'check-line',
  'save-fill',
  'checkbox-circle-fill',
  'save-line',
  'checkbox-circle-line',
  'server-fill',
  'checkbox-fill',
  'server-line',
  'checkbox-line',
  'smartphone-fill',
  'close-circle-fill',
  'smartphone-line',
  'close-circle-line',
  'tablet-fill',
  'close-line',
  'tablet-line',
  'delete-bin-fill',
  'tv-fill',
  'delete-bin-line',
  'tv-line',
  'download-fill',
  'wifi-fill',
  'download-line',
  'wifi-line',
  'error-warning-fill',
  'article-fill',
  'error-warning-line',
  'article-line',
  'external-link-fill',
  'book-2-fill',
  'external-link-line',
  'book-2-line',
  'eye-fill',
  'booklet-fill',
  'eye-line',
  'booklet-line',
  'eye-off-fill',
  'clipboard-fill',
  'eye-off-line',
  'clipboard-line',
  'filter-fill',
  'draft-fill',
  'filter-line',
  'draft-line',
  'fr--arrow-left-s-first-line',
  'file-add-fill',
  'fr--arrow-left-s-line-double',
  'file-add-line',
  'fr--arrow-right-s-last-line',
  'file-download-fill',
  'fr--arrow-right-s-line-double',
  'file-download-line',
  'fr--error-fill',
  'file-fill',
  'fr--error-line',
  'file-line',
  'fr--info-fill',
  'file-pdf-fill',
  'fr--info-line',
  'file-pdf-line',
  'fr--success-fill',
  'file-text-fill',
  'fr--success-line',
  'file-text-line',
  'fr--theme-fill',
  'folder-2-fill',
  'fr--warning-fill',
  'folder-2-line',
  'fr--warning-line',
  'newspaper-fill',
  'information-fill',
  'newspaper-line',
  'information-line',
  'survey-fill',
  'lock-fill',
  'survey-line',
  'lock-line',
  'todo-fill',
  'lock-unlock-fill',
  'todo-line',
  'lock-unlock-line',
  'code-view',
  'logout-box-r-fill',
  'font-size',
  'logout-box-r-line',
  'fr--bold',
  'menu-2-fill',
  'fr--highlight',
  'menu-fill',
  'fr--quote-fill',
  'more-fill',
  'fr--quote-line',
  'more-line',
  'h-1',
  'notification-badge-fill',
  'h-2',
  'notification-badge-line',
  'h-3',
  'question-fill',
  'h-4',
  'question-line',
  'h-5',
  'refresh-fill',
  'h-6',
  'refresh-line',
  'hashtag',
  'search-fill',
  'italic',
  'search-line',
  'link-unlink',
  'settings-5-fill',
  'link',
  'settings-5-line',
  'list-ordered',
  'shield-fill',
  'list-unordered',
  'shield-line',
  'question-mark',
  'star-fill',
  'separator',
  'star-line',
  'space',
  'star-s-fill',
  'subscript',
  'star-s-line',
  'superscript',
  'subtract-line',
  'table-2',
  'thumb-down-fill',
  'translate-2',
  'thumb-down-line',
  'bank-card-fill',
  'thumb-up-fill',
  'bank-card-line',
  'thumb-up-line',
  'coin-fill',
  'time-fill',
  'gift-fill',
  'time-line',
  'gift-line',
  'timer-fill',
  'money-euro-box-fill',
  'timer-line',
  'money-euro-box-line',
  'upload-2-fill',
  'money-euro-circle-fill',
  'upload-2-line',
  'money-euro-circle-line',
  'upload-fill',
  'secure-payment-fill',
  'upload-line',
  'secure-payment-line',
  'zoom-in-fill',
  'shopping-bag-fill',
  'zoom-in-line',
  'shopping-bag-line',
  'zoom-out-fill',
  'shopping-cart-2-fill',
  'zoom-out-line',
  'shopping-cart-2-line',
  'account-circle-fill',
  'trophy-fill',
  'account-circle-line',
  'trophy-line',
  'account-pin-circle-fill',
  'capsule-fill',
  'account-pin-circle-line',
  'capsule-line',
  'admin-fill',
  'dislike-fill',
  'admin-line',
  'dislike-line',
  'group-fill',
  'dossier-fill',
  'group-line',
  'dossier-line',
  'parent-fill',
  'first-aid-kit-fill',
  'parent-line',
  'first-aid-kit-line',
  'team-fill',
  'hand-sanitizer-fill',
  'team-line',
  'hand-sanitizer-line',
  'user-add-fill',
  'health-book-fill',
  'user-add-line',
  'health-book-line',
  'user-fill',
  'heart-fill',
  'user-heart-fill',
  'heart-line',
  'user-heart-line',
  'heart-pulse-fill',
  'user-line',
  'heart-pulse-line',
  'user-search-fill',
  'lungs-fill',
  'user-search-line',
  'lungs-line',
  'user-setting-fill',
  'medicine-bottle-fill',
  'user-setting-line',
  'medicine-bottle-line',
  'user-star-fill',
  'mental-health-fill',
  'user-star-line',
  'mental-health-line',
  'cloudy-2-fill',
  'microscope-fill',
  'cloudy-2-line',
  'microscope-line',
  'flashlight-fill',
  'psychotherapy-fill',
  'flashlight-line',
  'psychotherapy-line',
  'moon-fill',
  'pulse-line',
  'moon-line',
  'stethoscope-fill',
  'sun-fill',
  'stethoscope-line',
  'sun-line'].sort();
    /*iconsList = ['buildings/ancient-gate-fill',
  'health/surgical-mask-fill',
  'buildings/ancient-gate-line',
  'health/surgical-mask-line',
  'buildings/ancient-pavilion-fill',
  'health/syringe-fill',
  'buildings/ancient-pavilion-line',
  'health/syringe-line',
  'buildings/bank-fill',
  'health/test-tube-fill',
  'buildings/bank-line',
  'health/test-tube-line',
  'buildings/building-fill',
  'health/thermometer-fill',
  'buildings/building-line',
  'health/thermometer-line',
  'buildings/community-fill',
  'health/virus-fill',
  'buildings/community-line',
  'health/virus-line',
  'buildings/government-fill',
  'logo/chrome-fill',
  'buildings/government-line',
  'logo/chrome-line',
  'buildings/home-4-fill',
  'logo/edge-fill',
  'buildings/home-4-line',
  'logo/edge-line',
  'buildings/hospital-fill',
  'logo/facebook-circle-fill',
  'buildings/hospital-line',
  'logo/facebook-circle-line',
  'buildings/hotel-fill',
  'logo/firefox-fill',
  'buildings/hotel-line',
  'logo/firefox-line',
  'buildings/store-fill',
  'logo/fr--dailymotion-fill',
  'buildings/store-line',
  'logo/fr--dailymotion-line',
  'business/archive-fill',
  'logo/fr--tiktok-fill',
  'business/archive-line',
  'logo/fr--tiktok-line',
  'business/attachment-fill',
  'logo/github-fill',
  'business/attachment-line',
  'logo/github-line',
  'business/award-fill',
  'logo/google-fill',
  'business/award-line',
  'logo/google-line',
  'business/bar-chart-box-fill',
  'logo/ie-fill',
  'business/bar-chart-box-line',
  'logo/ie-line',
  'business/bookmark-fill',
  'logo/instagram-fill',
  'business/bookmark-line',
  'logo/instagram-line',
  'business/briefcase-fill',
  'logo/linkedin-box-fill',
  'business/briefcase-line',
  'logo/linkedin-box-line',
  'business/calendar-2-fill',
  'logo/mastodon-fill',
  'business/calendar-2-line',
  'logo/mastodon-line',
  'business/calendar-event-fill',
  'logo/npmjs-fill',
  'business/calendar-event-line',
  'logo/npmjs-line',
  'business/calendar-fill',
  'logo/remixicon-fill',
  'business/calendar-line',
  'logo/remixicon-line',
  'business/cloud-fill',
  'logo/safari-fill',
  'business/cloud-line',
  'logo/safari-line',
  'business/copyright-fill',
  'logo/slack-fill',
  'business/copyright-line',
  'logo/slack-line',
  'business/customer-service-fill',
  'logo/snapchat-fill',
  'business/customer-service-line',
  'logo/snapchat-line',
  'business/flag-fill',
  'logo/telegram-fill',
  'business/flag-line',
  'logo/telegram-line',
  'business/global-fill',
  'logo/twitch-fill',
  'business/global-line',
  'logo/twitch-line',
  'business/line-chart-fill',
  'logo/twitter-fill',
  'business/line-chart-line',
  'logo/twitter-line',
  'business/links-fill',
  'logo/vimeo-fill',
  'business/links-line',
  'logo/vimeo-line',
  'business/mail-fill',
  'logo/vuejs-fill',
  'business/mail-line',
  'logo/vuejs-line',
  'business/mail-open-fill',
  'logo/youtube-fill',
  'business/mail-open-line',
  'logo/youtube-line',
  'business/medal-fill',
  'map/anchor-fill',
  'business/medal-line',
  'map/anchor-line',
  'business/pie-chart-2-fill',
  'map/bike-fill',
  'business/pie-chart-2-line',
  'map/bike-line',
  'business/pie-chart-box-fill',
  'map/bus-fill',
  'business/pie-chart-box-line',
  'map/bus-line',
  'business/printer-fill',
  'map/car-fill',
  'business/printer-line',
  'map/car-line',
  'business/profil-fill',
  'map/caravan-fill',
  'business/profil-line',
  'map/caravan-line',
  'business/projector-2-fill',
  'map/charging-pile-2-fill',
  'business/projector-2-line',
  'map/charging-pile-2-line',
  'business/send-plane-fill',
  'map/compass-3-fill',
  'business/send-plane-line',
  'map/compass-3-line',
  'business/slideshow-fill',
  'map/cup-fill',
  'business/slideshow-line',
  'map/cup-line',
  'business/window-fill',
  'map/earth-fill',
  'business/window-line',
  'map/earth-line',
  'communication/chat-2-fill',
  'map/france-fill',
  'communication/chat-2-line',
  'map/france-line',
  'communication/chat-3-fill',
  'map/gas-station-fill',
  'communication/chat-3-line',
  'map/gas-station-line',
  'communication/chat-check-fill',
  'map/goblet-fill',
  'communication/chat-check-line',
  'map/goblet-line',
  'communication/chat-delete-fill',
  'map/map-pin-2-fill',
  'communication/chat-delete-line',
  'map/map-pin-2-line',
  'communication/chat-poll-fill',
  'map/map-pin-user-fill',
  'communication/chat-poll-line',
  'map/map-pin-user-line',
  'communication/discuss-fill',
  'map/motorbike-fill',
  'communication/discuss-line',
  'map/motorbike-line',
  'communication/feedback-fill',
  'map/passport-fill',
  'communication/feedback-line',
  'map/passport-line',
  'communication/message-2-fill',
  'map/restaurant-fill',
  'communication/message-2-line',
  'map/restaurant-line',
  'communication/question-answer-fill',
  'map/road-map-fill',
  'communication/question-answer-line',
  'map/road-map-line',
  'communication/questionnaire-fill',
  'map/sailboat-fill',
  'communication/questionnaire-line',
  'map/sailboat-line',
  'communication/video-chat-fill',
  'map/ship-2-fill',
  'communication/video-chat-line',
  'map/ship-2-line',
  'design/ball-pen-fill',
  'map/signal-tower-fill',
  'design/ball-pen-line',
  'map/signal-tower-line',
  'design/brush-3-fill',
  'map/suitcase-2-fill',
  'design/brush-3-line',
  'map/suitcase-2-line',
  'design/brush-fill',
  'map/taxi-fill',
  'design/brush-line',
  'map/taxi-line',
  'design/contrast-fill',
  'map/train-fill',
  'design/contrast-line',
  'map/train-line',
  'design/crop-fill',
  'media/camera-fill',
  'design/crop-line',
  'media/camera-line',
  'design/drag-move-2-fill',
  'media/clapperboard-fill',
  'design/drag-move-2-line',
  'media/clapperboard-line',
  'design/drop-fill',
  'media/equalizer-fill',
  'design/drop-line',
  'media/equalizer-line',
  'design/edit-box-fill',
  'media/film-fill',
  'design/edit-box-line',
  'media/film-line',
  'design/edit-fill',
  'media/gallery-fill',
  'design/edit-line',
  'media/gallery-line',
  'design/ink-bottle-fill',
  'media/headphone-fill',
  'design/ink-bottle-line',
  'media/headphone-line',
  'design/layout-grid-fill',
  'media/image-add-fill',
  'design/layout-grid-line',
  'media/image-add-line',
  'design/mark-pen-fill',
  'media/image-edit-fill',
  'design/mark-pen-line',
  'media/image-edit-line',
  'design/paint-brush-fill',
  'media/image-fill',
  'design/paint-brush-line',
  'media/image-line',
  'design/paint-fill',
  'media/live-fill',
  'design/paint-line',
  'media/live-line',
  'design/palette-fill',
  'media/mic-fill',
  'design/palette-line',
  'media/mic-line',
  'design/pantone-fill',
  'media/music-2-fill',
  'design/pantone-line',
  'media/music-2-line',
  'design/pen-nib-fill',
  'media/notification-3-fill',
  'design/pen-nib-line',
  'media/notification-3-line',
  'design/pencil-fill',
  'media/pause-circle-fill',
  'design/pencil-line',
  'media/pause-circle-line',
  'design/pencil-ruler-fill',
  'media/play-circle-fill',
  'design/pencil-ruler-line',
  'media/play-circle-line',
  'design/sip-fill',
  'media/stop-circle-fill',
  'design/sip-line',
  'media/stop-circle-line',
  'design/table-fill',
  'media/transcription',
  'design/table-line',
  'media/volume-down-fill',
  'development/bug-fill',
  'media/volume-down-line',
  'development/bug-line',
  'media/volume-mute-fill',
  'development/code-box-fill',
  'media/volume-mute-line',
  'development/code-box-line',
  'media/volume-up-fill',
  'development/code-s-slash-line',
  'media/volume-up-line',
  'development/cursor-fill',
  'others/leaf-fill',
  'development/cursor-line',
  'others/leaf-line',
  'development/git-branch-fill',
  'others/lightbulb-fill',
  'development/git-branch-line',
  'others/lightbulb-line',
  'development/git-commit-fill',
  'others/plant-fill',
  'development/git-commit-line',
  'others/plant-line',
  'development/git-merge-fill',
  'others/recycle-fill',
  'development/git-merge-line',
  'others/recycle-line',
  'development/git-pull-request-fill',
  'others/scales-3-fill',
  'development/git-pull-request-line',
  'others/scales-3-line',
  'development/git-repository-commits-fill',
  'others/seedling-fill',
  'development/git-repository-commits-line',
  'others/seedling-line',
  'development/git-repository-fill',
  'others/umbrella-fill',
  'development/git-repository-line',
  'others/umbrella-line',
  'development/git-repository-private-fill',
  'system/add-circle-fill',
  'development/git-repository-private-line',
  'system/add-circle-line',
  'development/terminal-box-fill',
  'system/add-line',
  'development/terminal-box-line',
  'system/alarm-warning-fill',
  'development/terminal-line',
  'system/alarm-warning-line',
  'development/terminal-window-fill',
  'system/alert-fill',
  'development/terminal-window-line',
  'system/alert-line',
  'device/bluetooth-fill',
  'system/arrow-down-fill',
  'device/bluetooth-line',
  'system/arrow-down-line',
  'device/computer-fill',
  'system/arrow-down-s-fill',
  'device/computer-line',
  'system/arrow-down-s-line',
  'device/dashboard-3-fill',
  'system/arrow-go-back-fill',
  'device/dashboard-3-line',
  'system/arrow-go-back-line',
  'device/database-fill',
  'system/arrow-go-forward-fill',
  'device/database-line',
  'system/arrow-go-forward-line',
  'device/device-fill',
  'system/arrow-left-fill',
  'device/device-line',
  'system/arrow-left-line',
  'device/hard-drive-2-fill',
  'system/arrow-left-s-fill',
  'device/hard-drive-2-line',
  'system/arrow-left-s-line',
  'device/mac-fill',
  'system/arrow-right-fill',
  'device/mac-line',
  'system/arrow-right-line',
  'device/phone-fill',
  'system/arrow-right-s-fill',
  'device/phone-line',
  'system/arrow-right-s-line',
  'device/qr-code-fill',
  'system/arrow-right-up-line',
  'device/qr-code-line',
  'system/arrow-up-fill',
  'device/rss-fill',
  'system/arrow-up-line',
  'device/rss-line',
  'system/arrow-up-s-fill',
  'device/save-3-fill',
  'system/arrow-up-s-line',
  'device/save-3-line',
  'system/check-line',
  'device/save-fill',
  'system/checkbox-circle-fill',
  'device/save-line',
  'system/checkbox-circle-line',
  'device/server-fill',
  'system/checkbox-fill',
  'device/server-line',
  'system/checkbox-line',
  'device/smartphone-fill',
  'system/close-circle-fill',
  'device/smartphone-line',
  'system/close-circle-line',
  'device/tablet-fill',
  'system/close-line',
  'device/tablet-line',
  'system/delete-bin-fill',
  'device/tv-fill',
  'system/delete-bin-line',
  'device/tv-line',
  'system/download-fill',
  'device/wifi-fill',
  'system/download-line',
  'device/wifi-line',
  'system/error-warning-fill',
  'document/article-fill',
  'system/error-warning-line',
  'document/article-line',
  'system/external-link-fill',
  'document/book-2-fill',
  'system/external-link-line',
  'document/book-2-line',
  'system/eye-fill',
  'document/booklet-fill',
  'system/eye-line',
  'document/booklet-line',
  'system/eye-off-fill',
  'document/clipboard-fill',
  'system/eye-off-line',
  'document/clipboard-line',
  'system/filter-fill',
  'document/draft-fill',
  'system/filter-line',
  'document/draft-line',
  'system/fr--arrow-left-s-first-line',
  'document/file-add-fill',
  'system/fr--arrow-left-s-line-double',
  'document/file-add-line',
  'system/fr--arrow-right-s-last-line',
  'document/file-download-fill',
  'system/fr--arrow-right-s-line-double',
  'document/file-download-line',
  'system/fr--error-fill',
  'document/file-fill',
  'system/fr--error-line',
  'document/file-line',
  'system/fr--info-fill',
  'document/file-pdf-fill',
  'system/fr--info-line',
  'document/file-pdf-line',
  'system/fr--success-fill',
  'document/file-text-fill',
  'system/fr--success-line',
  'document/file-text-line',
  'system/fr--theme-fill',
  'document/folder-2-fill',
  'system/fr--warning-fill',
  'document/folder-2-line',
  'system/fr--warning-line',
  'document/newspaper-fill',
  'system/information-fill',
  'document/newspaper-line',
  'system/information-line',
  'document/survey-fill',
  'system/lock-fill',
  'document/survey-line',
  'system/lock-line',
  'document/todo-fill',
  'system/lock-unlock-fill',
  'document/todo-line',
  'system/lock-unlock-line',
  'editor/code-view',
  'system/logout-box-r-fill',
  'editor/font-size',
  'system/logout-box-r-line',
  'editor/fr--bold',
  'system/menu-2-fill',
  'editor/fr--highlight',
  'system/menu-fill',
  'editor/fr--quote-fill',
  'system/more-fill',
  'editor/fr--quote-line',
  'system/more-line',
  'editor/h-1',
  'system/notification-badge-fill',
  'editor/h-2',
  'system/notification-badge-line',
  'editor/h-3',
  'system/question-fill',
  'editor/h-4',
  'system/question-line',
  'editor/h-5',
  'system/refresh-fill',
  'editor/h-6',
  'system/refresh-line',
  'editor/hashtag',
  'system/search-fill',
  'editor/italic',
  'system/search-line',
  'editor/link-unlink',
  'system/settings-5-fill',
  'editor/link',
  'system/settings-5-line',
  'editor/list-ordered',
  'system/shield-fill',
  'editor/list-unordered',
  'system/shield-line',
  'editor/question-mark',
  'system/star-fill',
  'editor/separator',
  'system/star-line',
  'editor/space',
  'system/star-s-fill',
  'editor/subscript',
  'system/star-s-line',
  'editor/superscript',
  'system/subtract-line',
  'editor/table-2',
  'system/thumb-down-fill',
  'editor/translate-2',
  'system/thumb-down-line',
  'finance/bank-card-fill',
  'system/thumb-up-fill',
  'finance/bank-card-line',
  'system/thumb-up-line',
  'finance/coin-fill',
  'system/time-fill',
  'finance/gift-fill',
  'system/time-line',
  'finance/gift-line',
  'system/timer-fill',
  'finance/money-euro-box-fill',
  'system/timer-line',
  'finance/money-euro-box-line',
  'system/upload-2-fill',
  'finance/money-euro-circle-fill',
  'system/upload-2-line',
  'finance/money-euro-circle-line',
  'system/upload-fill',
  'finance/secure-payment-fill',
  'system/upload-line',
  'finance/secure-payment-line',
  'system/zoom-in-fill',
  'finance/shopping-bag-fill',
  'system/zoom-in-line',
  'finance/shopping-bag-line',
  'system/zoom-out-fill',
  'finance/shopping-cart-2-fill',
  'system/zoom-out-line',
  'finance/shopping-cart-2-line',
  'user/account-circle-fill',
  'finance/trophy-fill',
  'user/account-circle-line',
  'finance/trophy-line',
  'user/account-pin-circle-fill',
  'health/capsule-fill',
  'user/account-pin-circle-line',
  'health/capsule-line',
  'user/admin-fill',
  'health/dislike-fill',
  'user/admin-line',
  'health/dislike-line',
  'user/group-fill',
  'health/dossier-fill',
  'user/group-line',
  'health/dossier-line',
  'user/parent-fill',
  'health/first-aid-kit-fill',
  'user/parent-line',
  'health/first-aid-kit-line',
  'user/team-fill',
  'health/hand-sanitizer-fill',
  'user/team-line',
  'health/hand-sanitizer-line',
  'user/user-add-fill',
  'health/health-book-fill',
  'user/user-add-line',
  'health/health-book-line',
  'user/user-fill',
  'health/heart-fill',
  'user/user-heart-fill',
  'health/heart-line',
  'user/user-heart-line',
  'health/heart-pulse-fill',
  'user/user-line',
  'health/heart-pulse-line',
  'user/user-search-fill',
  'health/lungs-fill',
  'user/user-search-line',
  'health/lungs-line',
  'user/user-setting-fill',
  'health/medicine-bottle-fill',
  'user/user-setting-line',
  'health/medicine-bottle-line',
  'user/user-star-fill',
  'health/mental-health-fill',
  'user/user-star-line',
  'health/mental-health-line',
  'weather/cloudy-2-fill',
  'health/microscope-fill',
  'weather/cloudy-2-line',
  'health/microscope-line',
  'weather/flashlight-fill',
  'health/psychotherapy-fill',
  'weather/flashlight-line',
  'health/psychotherapy-line',
  'weather/moon-fill',
  'health/pulse-line',
  'weather/moon-line',
  'health/stethoscope-fill',
  'weather/sun-fill',
  'health/stethoscope-line',
  'weather/sun-line'];*/
}