import assert from 'node:assert/strict';
import test from 'node:test';

import {
    matchForgeRoute,
    normalizeForgePath,
    readForgePathFromLocation,
    resolveForgeHref,
} from '../src/index';

test('normalizeForgePath trims hashes and trailing slashes', () => {
    assert.equal(normalizeForgePath('#/runs/'), '/runs');
    assert.equal(normalizeForgePath('settings'), '/settings');
    assert.equal(normalizeForgePath(undefined), '/');
});

test('matchForgeRoute returns home fallback for unknown paths', () => {
    assert.equal(matchForgeRoute('/missing').id, 'home');
    assert.equal(matchForgeRoute('/organization/workspace').id, 'workspace');
});

test('readForgePathFromLocation prefers hash for hash mode', () => {
    assert.equal(
        readForgePathFromLocation(
            'hash',
            { pathname: '/billing', hash: '#/runs/' },
            '/',
        ),
        '/runs',
    );
    assert.equal(
        readForgePathFromLocation(
            'history',
            { pathname: '/billing/', hash: '#/runs' },
            '/',
        ),
        '/billing',
    );
});

test('resolveForgeHref keeps desktop-safe hash URLs explicit', () => {
    assert.equal(resolveForgeHref('/settings', 'hash'), '#/settings');
    assert.equal(resolveForgeHref('/', 'hash'), '#/');
    assert.equal(resolveForgeHref('/settings', 'history'), '/settings');
});
