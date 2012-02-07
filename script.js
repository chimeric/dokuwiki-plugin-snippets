/**
 * Javascript for DokuWiki Plugin snippets
 * @author Michael Klier <chi@chimeric.de>
 */

snippets = {
    keepopen: false,

    // Attach all events to elements
    attach: function(obj) {
        if(!obj) { return; }
        if(!opener) { return; }

        // add keepopen checkbox
        var opts = jQuery('#plugin_snippets__opts');
        if(opts) {
            var kobox  = document.createElement('input');
            kobox.type = 'checkbox';
            kobox.id   = 'snippets__keepopen';
            if(DokuCookie.getValue('snippets_keepopen')){
                kobox.checked  = true;
                kobox.defaultChecked = true; //IE wants this
                snippets.keepopen = true;
            }
            jQuery(kobox).bind('click', function(event){
                snippets.togglekeepopen(this); }
            );

            var kolbl       = document.createElement('label');
            kolbl.htmlFor   = 'snippets__keepopen';
            kolbl.innerHTML = LANG['keepopen'];

            var kobr = document.createElement('br');

            opts.append(kobox);
            opts.append(kolbl);
            opts.append(kobr);
        }

        // attach events
        links = jQuery(obj).find('a.wikilink1');
        if(links) {
            for(var i = 0; i < links.length; i ++) {
                link = links[i];
                page = link.title;
                div  = link.parentNode;

                span = document.createElement('span');
                span.innerHTML = link.innerHTML;
                div.removeChild(link);

                preview = document.createElement('a');
                preview.className = 'plugin_snippets_preview';
                preview.title = LANG['plugins']['snippets']['preview'];
                preview.href = page;

                jQuery(preview).bind('click', {'page': page}, function(event) {
                    snippets.preview(event.data.page);
                    return false;
                });
                div.appendChild(preview);

                insert = document.createElement('a');
                insert.className = 'plugin_snippets_insert';
                insert.title = LANG['plugins']['snippets']['insert'];
                insert.href = page;

                jQuery(insert).bind('click', {'page': page}, function(event) {
                    snippets.insert(event.data.page);
                    return false;
                });

                div.appendChild(insert);
                div.appendChild(span);
            }
        }

        // strip out links to non-existing pages
        links = jQuery(obj).find('a.wikilink2');
        if(links) {
            for(var i = 0; i < links.length; i ++) {
                link = links[i];
                span = document.createElement('span');
                span.innerHTML = link.innerHTML;
                div = link.parentNode;
                div.removeChild(link);
                div.appendChild(span);
            }
        }

        // add toggle to sub lists
        lists = jQuery(obj).find('ul');
        if(lists) {
            for(var i = 1; i < lists.length; i++) {
            list = lists[i];
                list.style.display = 'none';
                div = list.previousSibling;
                if(div.nodeType != 1) {
                    // IE7 and FF treat whitespace different
                    div = div.previousSibling;
                }
                div.className = 'li closed';
                jQuery(div).bind('click', function(event) { snippets.toggle(this); });
            }
        }
    },
    
    // toggle open/close state in template list
    toggle: function(obj) {
        if(!obj) return;
        list = obj.nextSibling;
        if(list.nodeType != 1) {
            list = list.nextSibling;
        }
        if(list.style.display == 'none') {
            list.style.display = 'block';
            obj.className = 'li open';
        } else {
            list.style.display = 'none';
            obj.className = 'li closed';
        }
        return false;
    },

    /**
     * Toggles the keep open state
     *
     * @author Andreas Gohr <andi@splitbrain.org>
     */
    togglekeepopen: function(cb){
        if(cb.checked){
            DokuCookie.setValue('snippets_keepopen',1);
            snippets.keepopen = true;
        }else{
            DokuCookie.setValue('snippets_keepopen','');
            snippets.keepopen = false;
        }
    },

    // perform AJAX preview
    preview: function(page) {
        preview = jQuery('#plugin_snippets__preview');
        if(!preview) return;

        preview.html('<img src="' + DOKU_BASE + 'lib/images/throbber.gif" />');

        jQuery.post(
            DOKU_BASE+'lib/exe/ajax.php',
            { call: 'snippet_preview', id: page },
            function(data){
                if(data === '') return;
                preview.html(data);
            }
        );

        return false;
    },

    // perform AJAX insert
    insert: function(page) {
        if(!opener) return;

        jQuery.post(
            DOKU_BASE+'lib/exe/ajax.php',
            { call: 'snippet_insert', id: page },
            function(data){
                opener.insertAtCarret('wiki__text', data, '');
                if(!snippets.keepopen) {
                    window.close();
                }
                opener.focus();
            }
        );
        return false;
    }
};

jQuery(function(){
    var idx = jQuery('#plugin_snippets__idx');
    if(idx.length == 0) return;
    snippets.attach(idx);
});

// vim:ts=4:sw=4:et:enc=utf-8:
