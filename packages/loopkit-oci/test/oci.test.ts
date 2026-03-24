import assert from 'node:assert/strict';
import test from 'node:test';

import {
    buildArtifactRepository,
    buildRegistryBaseUrl,
    createArtifactReference,
    isRegistryAllowed,
    parseOciReference,
} from '../src/index';

test('parseOciReference splits registry repository and tag', () => {
    assert.deepEqual(parseOciReference('127.0.0.1:5001/loopkit/container/runner:v1'), {
        registry: '127.0.0.1:5001',
        repository: 'loopkit/container/runner',
        tag: 'v1',
        digest: undefined,
    });
});

test('parseOciReference supports digests', () => {
    const parsed = parseOciReference(
        'ghcr.io/infinite-loop-technologies/wasm/component@sha256:abc123',
    );

    assert.equal(parsed.registry, 'ghcr.io');
    assert.equal(parsed.digest, 'sha256:abc123');
});

test('buildRegistryBaseUrl chooses different local ports per mode', () => {
    assert.equal(buildRegistryBaseUrl('persistent-local'), '127.0.0.1:5001');
    assert.equal(buildRegistryBaseUrl('ephemeral-local'), '127.0.0.1:5002');
});

test('buildArtifactRepository encodes the artifact kind in the repository path', () => {
    assert.equal(
        buildArtifactRepository('loopkit', 'runner', 'container'),
        'loopkit/container/runner',
    );
});

test('createArtifactReference composes registry and repository data', () => {
    assert.equal(
        createArtifactReference({
            registry: '127.0.0.1:5001',
            namespace: 'loopkit',
            name: 'runner',
            kind: 'container',
            tag: 'v1',
        }),
        '127.0.0.1:5001/loopkit/container/runner:v1',
    );
});

test('isRegistryAllowed enforces explicit allow lists', () => {
    assert.equal(isRegistryAllowed('127.0.0.1:5001/loopkit/container/runner:v1', ['127.0.0.1:5001']), true);
    assert.equal(isRegistryAllowed('ghcr.io/loopkit/container/runner:v1', ['127.0.0.1:5001']), false);
});
