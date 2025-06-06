(function($) {
  $.extend(true, $.summernote.lang, {
    'de-CH': {
      font: {
        bold: 'Fett',
        italic: 'Kursiv',
        underline: 'Unterstrichen',
        clear: 'Zurücksetzen',
        height: 'Zeilenhöhe',
        name: 'Schriftart',
        strikethrough: 'Durchgestrichen',
        subscript: 'Tiefgestellt',
        superscript: 'Hochgestellt',
        size: 'Schriftgrösse',
      },
      image: {
        image: 'Bild',
        insert: 'Bild einfügen',
        resizeFull: 'Originalgrösse',
        resizeHalf: '1/2 Grösse',
        resizeQuarter: '1/4 Grösse',
        floatLeft: 'Linksbündig',
        floatRight: 'Rechtsbündig',
        floatNone: 'Kein Textfluss',
        shapeRounded: 'Abgerundete Ecken',
        shapeCircle: 'Kreisförmig',
        shapeThumbnail: '"Vorschaubild"',
        shapeNone: 'Kein Rahmen',
        dragImageHere: 'Bild hierher ziehen',
        dropImage: 'Bild oder Text nehmen',
        selectFromFiles: 'Datei auswählen',
        maximumFileSize: 'Maximale Dateigrösse',
        maximumFileSizeError: 'Maximale Dateigrösse überschritten',
        url: 'Bild URL',
        remove: 'Bild entfernen',
        original: 'Original',
      },
      video: {
        video: 'Video',
        videoLink: 'Videolink',
        insert: 'Video einfügen',
        url: 'Video URL',
        providers: '(YouTube, Vimeo, Vine, Instagram, DailyMotion oder Youku)',
      },
      link: {
        link: 'Link',
        insert: 'Link einfügen',
        unlink: 'Link entfernen',
        edit: 'Bearbeiten',
        textToDisplay: 'Anzeigetext',
        url: 'Link URL',
        openInNewWindow: 'In neuem Fenster öffnen',
      },
      table: {
        table: 'Tabelle',
        addRowAbove: '+ Zeile oberhalb',
        addRowBelow: '+ Zeile unterhalb',
        addColLeft: '+ Spalte links',
        addColRight: '+ Spalte rechts',
        delRow: 'Zeile löschen',
        delCol: 'Spalte löschen',
        delTable: 'Tabelle löschen',
      },
      hr: {
        insert: 'Horizontale Linie einfügen',
      },
      style: {
        style: 'Stil',
        normal: 'Normal',
        p: 'Normal',
        blockquote: 'Zitat',
        pre: 'Quellcode',
        h1: 'Überschrift 1',
        h2: 'Überschrift 2',
        h3: 'Überschrift 3',
        h4: 'Überschrift 4',
        h5: 'Überschrift 5',
        h6: 'Überschrift 6',
      },
      lists: {
        unordered: 'Aufzählung',
        ordered: 'Nummerierung',
      },
      options: {
        help: 'Hilfe',
        fullscreen: 'Vollbild',
        codeview: 'Quellcode anzeigen',
      },
      paragraph: {
        paragraph: 'Absatz',
        outdent: 'Einzug verkleinern',
        indent: 'Einzug vergrössern',
        left: 'Links ausrichten',
        center: 'Zentriert ausrichten',
        right: 'Rechts ausrichten',
        justify: 'Blocksatz',
      },
      color: {
        recent: 'Letzte Farbe',
        more: 'Weitere Farben',
        background: 'Hintergrundfarbe',
        foreground: 'Schriftfarbe',
        transparent: 'Transparenz',
        setTransparent: 'Transparenz setzen',
        reset: 'Zurücksetzen',
        resetToDefault: 'Auf Standard zurücksetzen',
      },
      shortcut: {
        shortcuts: 'Tastenkürzel',
        close: 'Schliessen',
        textFormatting: 'Textformatierung',
        action: 'Aktion',
        paragraphFormatting: 'Absatzformatierung',
        documentStyle: 'Dokumentenstil',
        extraKeys: 'Weitere Tasten',
      },
      help: {
        insertParagraph: 'Absatz einfügen',
        undo: 'Letzte Anweisung rückgängig',
        redo: 'Letzte Anweisung wiederholen',
        tab: 'Einzug hinzufügen',
        untab: 'Einzug entfernen',
        bold: 'Schrift Fett',
        italic: 'Schrift Kursiv',
        underline: 'Unterstreichen',
        strikethrough: 'Durchstreichen',
        removeFormat: 'Entfernt Format',
        justifyLeft: 'Linksbündig',
        justifyCenter: 'Mittig',
        justifyRight: 'Rechtsbündig',
        justifyFull: 'Blocksatz',
        insertUnorderedList: 'Unnummerierte Liste',
        insertOrderedList: 'Nummerierte Liste',
        outdent: 'Aktuellen Absatz ausrücken',
        indent: 'Aktuellen Absatz einrücken',
        formatPara: 'Formatiert aktuellen Block als Absatz (P-Tag)',
        formatH1: 'Formatiert aktuellen Block als H1',
        formatH2: 'Formatiert aktuellen Block als H2',
        formatH3: 'Formatiert aktuellen Block als H3',
        formatH4: 'Formatiert aktuellen Block als H4',
        formatH5: 'Formatiert aktuellen Block als H5',
        formatH6: 'Formatiert aktuellen Block als H6',
        insertHorizontalRule: 'Fügt eine horizontale Linie ein',
        'linkDialog.show': 'Zeigt den Linkdialog',
      },
      history: {
        undo: 'Rückgängig',
        redo: 'Wiederholen',
      },
      specialChar: {
        specialChar: 'Sonderzeichen',
        select: 'Zeichen auswählen',
      },
    },
  });

  $.extend(true, $.summernote.lang, {
    'de-DE': { /* German */
      common: {
        ok: 'OK',
        cancel: 'Abbrechen',
        save: 'Speichern',
        search: 'Suchen'
      },
      emoji: {
        emoji: 'Emoji',
        search: 'Emojis suchen...',
        typeTwo: 'Mindestens zwei Zeichen eingeben...',
        recent: 'Kürzlich verwendet'
      },
      help: {
        save: 'Speichern',
      },
      font: {
        code: 'Code'
      },
      attrs: {
        cssClass: 'CSS Klasse',
        cssStyle: 'CSS Stil',
        rel: 'Rel',
      },
      link: {
        browse: 'Durchsuchen'
      },
      image: {
        imageProps: 'Bild Eigenschaften'
      },
      imageShapes: {
        tooltip: 'Stil',
        tooltipShapeOptions: ['Responsiv', 'Rahmen', 'Abgerundet', 'Kreis', 'Thumbnail', 'Schatten (klein)', 'Schatten (mittel)', 'Schatten (gro&szlig)']
      },
      tableStyles: {
        tooltip: "Tabellenstil",
        stylesExclusive: ["Standard", "Eingerahmt"],
        stylesInclusive: ["Streifen", "Kompakt", "Hover Effekt"]
      }
    }
  });
})(jQuery);
