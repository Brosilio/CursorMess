/*
 * CursorMess Chrome extension
 * https://github.com/brosilio/cursormess
 * Copyright (C) 2020 Brosilio
 * Licensed under the license specified at:
 *   https://github.com/Brosilio/CursorMess/blob/master/LICENSE.txt
 */

function doInject() {
    let __CURSORMESS_DOM_ELEMENT__ = document.createElement('script');
    __CURSORMESS_DOM_ELEMENT__.setAttribute('src', 'https://brosilio.github.io/CursorMess/src/frontend/cursormess.js');
    document.body.appendChild(__CURSORMESS_DOM_ELEMENT__);
}

function fnv1a_str(s) {
    let h = 0x811C9DC5;
    let i = s.length;
    while (i--) h = (h ^ s.charCodeAt(i)) * 0x01000193;
    return hash;
}
