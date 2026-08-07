// Tests des normalisations partagees.

import test from "node:test";
import assert from "node:assert/strict";

import { normalizeLocationName, normalizeEmail } from "../../src/services/textService.js";


test("normalizeLocationName: met en minuscules et retire les espaces de bord", () => {
    assert.equal(normalizeLocationName("  Parc La Fontaine  "), "parc la fontaine");
    assert.equal(normalizeLocationName("MONT-ROYAL"), "mont-royal");
});

test("normalizeLocationName: conserve les accents", () => {
    // Les noms sont stockes tels quels en base: on ne doit pas retirer les
    // accents, sinon "café" et "cafe" deviendraient deux lieux distincts.
    assert.equal(normalizeLocationName("Café Campus"), "café campus");
});

test("normalizeLocationName: entree non textuelle donne une chaine vide", () => {
    assert.equal(normalizeLocationName(null), "");
    assert.equal(normalizeLocationName(undefined), "");
    assert.equal(normalizeLocationName(42), "");
    assert.equal(normalizeLocationName({}), "");
});

test("normalizeLocationName: est idempotente", () => {
    const once = normalizeLocationName(" Parc ");
    assert.equal(normalizeLocationName(once), once);
});


test("normalizeEmail: met en minuscules et retire les espaces de bord", () => {
    assert.equal(normalizeEmail(" Ada.Lovelace@EXAMPLE.COM "), "ada.lovelace@example.com");
});

test("normalizeEmail: deux graphies du meme courriel donnent la meme cle", () => {
    assert.equal(normalizeEmail("A@B.C"), normalizeEmail("a@b.c"));
});

test("normalizeEmail: entree non textuelle donne une chaine vide", () => {
    assert.equal(normalizeEmail(null), "");
    assert.equal(normalizeEmail(undefined), "");
    assert.equal(normalizeEmail(123), "");
});
