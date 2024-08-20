const widgetZoneMenuId = '#wz-menu';
let widgetZones;
const zIndex = 1000;
const animationDuration = 3000;

export class DevTools {
    /**
     * Initialize the DevTools widget functionality: Create the widget zone menu and set up event listeners.
     */
    initialize(translations) {
        widgetZones = [];
        let wzMenu = $(widgetZoneMenuId);

        let wzMenuToggle = $('#wz-menu-toggle');
        wzMenuToggle.css('z-index', zIndex);

        console.log($(".sticky-bottom").length);

        applyCommonPlugins($(".sticky-bottom"));

        // Add widget zone menu close button.
        wzMenu.on('clicK', '.wz-sidebar-close', (e) => {
            e.preventDefault();
            wzMenuToggle.click();
            return false;
        });

        // Add event listener to copy widget zone name to clipboard.
        wzMenu.on("click", ".copy-to-clipboard", (e) => {
            e.preventDefault();
            window.copyTextToClipboard($(e.currentTarget).data('value'));
            return false;
        });

        // Jump to the zone.
        wzMenu.on("click", ".wz-zone-pointer", function (e) {
            e.preventDefault();

            let wzName = $(this).text();
            let widetzones = document.querySelectorAll('span[title="' + wzName + '"]');

            if (widetzones) {
                widetzones.forEach((wz, index) => {
                    let wzPreview = $(wz);
                    let wzIsHidden = wzPreview.hasClass('d-none');

                    // If multiple widget zones with the same name exist, we scroll to the first one.
                    if (index == 0) {
                        wzMenu.css('opacity', 0.5);

                        if (wzIsHidden) {
                            // Must be visible to scroll to it.
                            wzPreview.removeClass('d-none');
                        }
                        // Scroll to widget zone.
                        wz.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });

                        setTimeout(() => {
                            wzMenu.css('opacity', 1);
                        }, animationDuration);
                    }

                    wzPreview.addClass('wz-highlight');

                    setTimeout(() => {
                        wzPreview.removeClass('wz-highlight');
                    }, animationDuration);

                    if (wzIsHidden) {
                        wzPreview.addClass('d-none');
                    }
                });
            }
        });

        // Add toggle buttons to widget zone menu.
        wzMenu.on("click", ".wz-toggle", (e) => {
            e.preventDefault();

            let wzToggleButton = $(e.currentTarget);
            let isPersistent = wzToggleButton.data('persistent');

            if (isPersistent) {
                // Set both buttons to the same state.
                let isVisible = !wzToggleButton.find('i').hasClass('fa-eye');
                wzMenu.find('.wz-toggle i').removeClass('fa-eye fa-eye-slash').addClass('fa-eye' + (isVisible ? '' : '-slash'));
            }
            else
            {
                wzToggleButton.find('i').toggleClass('fa-eye fa-eye-slash');
            }

            this.toggleAllZones(isPersistent);
        });

        // Add event listener to copy widget zone name to clipboard.
        wzMenu.on("click", ".copy-to-clipboard", (e) => {
            e.preventDefault();
            window.copyTextToClipboard($(e.currentTarget).data('value'));
            return false;
        });

        // When the user presses "Alt + K" the widget zones will be toggled.
        $(document).on("keydown", (e) => {
            if (e.altKey && e.key === 'k') {
                wzMenu.find('.wz-toggle:not([data-persistent])').first().click();
            }
        });
    }

    /**
     * Register a widget zone and add it to the zone list.
     */
    registerWidgetZone(zone) {
        // If the widget zone is already registered, we skip it.
        if (widgetZones.findIndex(wz => wz.name === zone.name) !== -1) {
            return;
        };

        widgetZones.push(zone);

        let groupName = this.getWidgetZoneGroup(zone.name);

        // Place the widget zone in the correct group and make sure the group is visible.
        $('.wz-zone-group[data-group="' + groupName + '"]')
            .append('<div class="d-flex pt-2 gap-2"><a href="#" class="wz-zone-pointer flex-grow-1 text-primary text-decoration-none text-break">' + zone.name
            + '</a><a href="#" class="copy-to-clipboard text-secondary" data-value="' + zone.name + '"><i class="far fa-copy"></i><a></div>')
            .removeClass('d-none');
    }

    /**
     * Returns the group the widget zone should be placed in, using .wz-zone-group[data-zones="..."].
     */
    getWidgetZoneGroup(zoneName) {
        let groups = $('.wz-zone-group');
        let group = groups.filter(function () {
            return $(this).data('groups').split(' ').includes(zoneName);
        });

        // If no group was found, use the last one (custom).
        if (!group.length) {
            // Check if the widget zone has a meta preview tag.
            let wz = widgetZones.find(wz => wz.name === zoneName);
            if (wz.previewTagName == 'meta') {
                return 'Meta';
            }

            group = groups.last();
        }

        return group.data('group');
    }

    /**
     * Toggles the visibility of all widget zones. If saveInCookie is true, the state will be saved in a cookie.
     */
    toggleAllZones(saveInCookie = false) {
        const zonePreviews = $(document).find('.wz-preview');
        zonePreviews.toggleClass('d-none');

        // Save state in a cookie if requested.
        if (saveInCookie) {
            let wzState = zonePreviews.hasClass('d-none') ? 'hidden' : 'visible';
            document.cookie = '.Smart.WZVisibility=' + wzState + '; path=/; max-age=31536000';
        }
    }
}