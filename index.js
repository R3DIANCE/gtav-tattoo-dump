"use strict";
class TattooItem {
    constructor(id, name, collection, overlay, zone, price) {
        this.Id = id;
        this.Name = name;
        this.Collection = collection;
        this.Overlay = overlay;
        this.Zone = zone;
        this.Price = price;
    }
}
const REPLACE_PATTERN = /\u0000/g;
var NATIVES;
(function(NATIVES) {
    NATIVES["GET_NUM_TATTOO_SHOP_DLC_ITEMS"] = "0x278F76C3B0A8F109";
    NATIVES["_GET_TATTOO_COLLECTION_DATA"] = "0xFF56381874F82086";
})(NATIVES || (NATIVES = {}));;
var TATTOO_ZONE_DATA;
(function(TATTOO_ZONE_DATA) {
    TATTOO_ZONE_DATA[TATTOO_ZONE_DATA["ZONE_TORSO"] = 0] = "ZONE_TORSO";
    TATTOO_ZONE_DATA[TATTOO_ZONE_DATA["ZONE_HEAD"] = 1] = "ZONE_HEAD";
    TATTOO_ZONE_DATA[TATTOO_ZONE_DATA["ZONE_LEFT_ARM"] = 2] = "ZONE_LEFT_ARM";
    TATTOO_ZONE_DATA[TATTOO_ZONE_DATA["ZONE_RIGHT_ARM"] = 3] = "ZONE_RIGHT_ARM";
    TATTOO_ZONE_DATA[TATTOO_ZONE_DATA["ZONE_LEFT_LEG"] = 4] = "ZONE_LEFT_LEG";
    TATTOO_ZONE_DATA[TATTOO_ZONE_DATA["ZONE_RIGHT_LEG"] = 5] = "ZONE_RIGHT_LEG";
    TATTOO_ZONE_DATA[TATTOO_ZONE_DATA["ZONE_UNKNOWN"] = 6] = "ZONE_UNKNOWN";
    TATTOO_ZONE_DATA[TATTOO_ZONE_DATA["ZONE_NONE"] = 7] = "ZONE_NONE";
})(TATTOO_ZONE_DATA || (TATTOO_ZONE_DATA = {}));;
var CHARAKTER_TYPE;
(function(CHARAKTER_TYPE) {
    CHARAKTER_TYPE[CHARAKTER_TYPE["MPMale"] = 3] = "MPMale";
    CHARAKTER_TYPE[CHARAKTER_TYPE["MPFemale"] = 4] = "MPFemale";
})(CHARAKTER_TYPE || (CHARAKTER_TYPE = {}));;
var male_tattoos = new Array();
var female_tattoos = new Array();
mp.gui.chat.safeMode = false;

function getString(buffer, offset, length = 64) {
    return String.fromCharCode.apply(null, Array.from(new Uint8Array(buffer, offset, length))).replace(REPLACE_PATTERN, "");
}

function getTattooCollectionData(characterType, decorationIndex) {
    let buffer = [new ArrayBuffer(120)];
    if (!mp.game.invoke(NATIVES._GET_TATTOO_COLLECTION_DATA, characterType, decorationIndex, buffer))
        return null;
    const { 0: lockHash, 2: id, 4: collection, /* collection */ 6: preset, /* overlay */ 8: cost, 10: eFacing, 12: updateGroup } = new Uint32Array(buffer[0]);
    return {
        lockHash,
        id,
        collection,
        preset,
        cost,
        eFacing,
        updateGroup,
        textLabel: getString(buffer[0], 56),
    };
}

function getTattooDump(characterIndex) {
    var dump = new Array();
    mp.gui.chat.push(`<p style="color:yellow;">[STARTED]<span style="color:white;"> copy of tattoos</span></p>`);
    for (let i = 0, max = mp.game.invoke(NATIVES.GET_NUM_TATTOO_SHOP_DLC_ITEMS, characterIndex); i < max; i++) {
        if (i >= max - 1) {
            mp.gui.chat.push(`<p style="color:green;">[COMPLETED]<span style="color:white;"> copy of ${max} tattoos</span></p>`);
            return dump;
        } else {
            const tattooData = getTattooCollectionData(characterIndex, i);
            if (tattooData != null) {
                const tattooName = mp.game.gxt.get(tattooData.textLabel);
                if (tattooName != "NULL") {
                    const tattooZone = mp.game.ped.getTattooZone(tattooData.collection, tattooData.preset);
                    mp.gui.chat.push(`<p style="color:green;">[${i}]<span style="color:white;"> ${tattooName}</span></p>`);
                    dump.push(new TattooItem(tattooData.id, tattooName, tattooData.collection, tattooData.preset, tattooZone, tattooData.cost));
                }
            }
        }
    }
    return dump;
}
mp.keys.bind(0x72, false, () => {
    male_tattoos = getTattooDump(CHARAKTER_TYPE.MPMale);
    female_tattoos = getTattooDump(CHARAKTER_TYPE.MPFemale);
    mp.storage.data.male_tattoos = male_tattoos;
    mp.storage.data.female_tattoos = female_tattoos;
    mp.storage.flush();
    mp.gui.chat.push(`<p style="color:purple;">[SAVED]<span style="color:white;"> your data has been saved to local storage</span></p>`);
});